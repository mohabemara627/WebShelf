// Static HTML for users and crawlers alike. Query URLs stay stable on Vercel.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ORIGIN = 'https://www.webshelf.link';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileFor = key => `${key}.html`;
const urlFor = key => `${ORIGIN}/${fileFor(key)}`;
function slot(html, id, value) {
  const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`, 'i');
  if (!re.test(html)) throw Error('Missing SEO template slot: '+id);
  return html.replace(re, (_, open, tag, close) => open+value+close);
}
function metadata(root) {
  const src = fs.readFileSync(path.join(root, 'maintenance/src/category.js'), 'utf8');
  const object = src.match(/const CATEGORY_SEO = (\{[\s\S]*?\n\});/);
  if (!object) throw Error('CATEGORY_SEO definition missing');
  return vm.runInNewContext('('+object[1]+')', {}, {timeout: 1000});
}
function rows(sites) {
  return sites.map((s,i)=>`<div class="site-row" data-site-url="${escape(s.url)}"><a class="site-link" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer"><span class="rank">${String(i+1).padStart(2,'0')}</span><div class="site-logo">${s.icon?`<img src="${escape(s.icon)}" loading="lazy" decoding="async" alt="${escape(s.name)} logo">`:''}</div><span class="site-name-line"><span class="site-name">${escape(s.name)}</span></span></a></div>`).join('\n');
}
function schema(value) { return `<script type="application/ld+json">${JSON.stringify(value).replace(/</g,'\\u003c')}</script>`; }
function generate(root, catalog) {
  const seo = metadata(root), out = {};
  const base = fs.readFileSync(path.join(root,'maintenance/templates/category.html'),'utf8');
  for (const cat of catalog) {
    const meta = seo[cat.key] || {title:cat.title+' Sites | WebShelf',description:'Browse curated '+cat.title+' websites on WebShelf.',intro:'Explore '+cat.title+' resources, organized in one directory.'};
    const url = urlFor(cat.key);
    let html = base.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(meta.title)}</title>`)
      .replace(/(<meta\s+id="category-description"[\s\S]*?content=")[^"]*/, '$1'+escape(meta.description))
      .replace(/<link\s+id="category-canonical"[\s\S]*?>/,`<link id="category-canonical" rel="canonical" href="${escape(url)}">`)
      .replace('<body>',`<body data-category="${escape(cat.key)}">`);
    html = slot(html,'category-page-title',escape(cat.title+' Sites'));
    html = slot(html,'category-page-count',`${cat.sites.length} sites`);
    html = slot(html,'category-page-list',rows(cat.sites));
    const json = {'@context':'https://schema.org','@graph':[
      {'@type':'CollectionPage','@id':url+'#page',url,name:meta.title,description:meta.description,isPartOf:{'@id':ORIGIN+'/#website'},breadcrumb:{'@id':url+'#breadcrumbs'},mainEntity:{'@id':url+'#list'}},
      {'@type':'BreadcrumbList','@id':url+'#breadcrumbs',itemListElement:[{'@type':'ListItem',position:1,name:'WebShelf',item:ORIGIN+'/'},{'@type':'ListItem',position:2,name:cat.title,item:url}]},
      {'@type':'ItemList','@id':url+'#list',name:cat.title+' Sites',numberOfItems:cat.sites.length,itemListOrder:'https://schema.org/ItemListUnordered',itemListElement:cat.sites.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:s.url}))}
    ]};
    html = html.replace('</head>',`<meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:site_name" content="WebShelf"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${ORIGIN}/images/icons/WS-Logo-512.png"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(meta.title)}"><meta name="twitter:description" content="${escape(meta.description)}"><meta name="twitter:image" content="${ORIGIN}/images/icons/WS-Logo-512.png">${schema(json)}</head>`);
    out[fileFor(cat.key)] = html;
  }
  let home = fs.readFileSync(path.join(root,'maintenance/templates/home.html'),'utf8');
  home = home.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>WebShelf — Find the Web worth keeping</h1>');
  const cards = catalog.map(c=>`<a class="category" href="./${fileFor(c.key)}" style="--category-accent:${escape(c.accent)}"><div class="category-icon"><i data-lucide="${escape(c.icon)}"></i></div><div class="category-info"><h3>${escape(c.title)}</h3><p>${c.sites.length} sites</p></div><span class="category-arrow" aria-hidden="true">→</span></a>`).join('');
  home = slot(home,'category-grid',cards);
  const panel=c=>`<div class="directory-panel dynamic-directory-panel" style="--category-accent:${escape(c.accent)}"><div class="panel-header"><div><h3>${escape(c.title)}</h3><p>${c.sites.length} sites</p></div></div><div class="site-list">${rows(c.sites.slice(0,5))}</div><a class="view-all" href="./${fileFor(c.key)}">View all ${c.sites.length} sites</a></div>`;
  const split=Math.ceil(catalog.length/2);
  home = slot(home,'directory-columns',`<div class="directory-column">${catalog.slice(0,split).map(panel).join('')}</div><div class="directory-column">${catalog.slice(split).map(panel).join('')}</div>`);
  home = home.replace('"@type": "WebSite",','"@type": "WebSite",\n  "@id": "https://www.webshelf.link/#website",');
  out['index.html'] = home;
  const config = JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
  const isCategoryRule = r=>(r.source==='/category.html' && r.has?.some(h=>h.key==='type')) || /^\/category-[a-z0-9-]+\.html$/.test(r.source||'');
  config.rewrites=(config.rewrites||[]).filter(r=>!isCategoryRule(r));
  const legacy=[];
  for(const c of catalog) {
    legacy.push({source:'/category-'+c.key+'.html',destination:'/'+fileFor(c.key),permanent:true});
    legacy.push({source:'/category.html',has:[{type:'query',key:'type',value:c.key}],destination:'/'+fileFor(c.key),permanent:true});
    if(c.key.startsWith('tv-')) legacy.push({source:'/category.html',has:[{type:'query',key:'type',value:c.key.replace('tv-','TV-')}],destination:'/'+fileFor(c.key),permanent:true});
  }
  config.redirects=[...(config.redirects||[]).filter(r=>!isCategoryRule(r)),...legacy];
  out['vercel.json']=JSON.stringify(config,null,2)+'\n';
  return out;
}
module.exports={generate,fileFor,urlFor};
