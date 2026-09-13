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
const guides = {
  'anime-streaming': ['Choosing an anime streaming site', 'Check subtitle and dub languages, regional availability, video quality and whether an account is needed. Episode availability can differ between platforms. Prefer licensed services where available; a directory listing is not a guarantee of licensing, safety or uptime.'],
  'tv-streaming': ['Compare TV streaming options', 'Start with the shows you want to watch, then check country availability, subtitles, device support and any subscription requirements on the destination site. A large catalogue does not necessarily include every season or episode.'],
  'sports-streaming': ['Before a live match starts', 'Check the competition, kick-off time, time zone and broadcast availability in your country. Sports rights and schedules change, so confirm the event with the official broadcaster before relying on a listing.'],
  'manga-reading': ['Find a manga reading platform', 'Compare translation language, chapter coverage, reader layout and whether a series is complete or ongoing. Official publishers may offer free sample chapters alongside paid volumes; check the terms on each platform.'],
  'manhwa-reading': ['Choosing a manhwa or webtoon reader', 'Look for vertical-scroll support, translation language and chapter availability. Some platforms use episode unlocks or subscriptions. Check the official publisher for release timing and creator-supported reading options.'],
  'novel-reading': ['Compare novel and light novel sites', 'Check whether a listing offers an original work, translation, preview or full book. Translation progress and quality can vary, and web-novel chapters may differ from published light novel editions.'],
  'anime-download': ['Before downloading anime', 'Check file format, subtitles, storage needs and the rights attached to a release. Only download material you are authorized to obtain. Avoid installers presented as video files and do not disable security software to open a download.'],
  'tv-download': ['Choosing downloadable TV resources', 'Check the episode number, language, file size and playback compatibility. Use authorized downloads, including offline viewing features offered by licensed services. A listing here does not verify the rights or safety of individual files.'],
  'subtitle-download': ['Find subtitles that match your release', 'Match the title, season, episode, language and release version. Different cuts or frame rates can cause timing drift. SRT and ASS are common subtitle formats; check that your player supports the file you choose.'],
  'anime-database': ['Use anime databases for discovery', 'Compare synopsis, release year, episode count and staff credits to identify the correct series or season. Community scores are useful signals, not objective rankings; read several reviews before deciding what to watch.'],
  'anime-schedule': ['Track anime release times', 'Check which time zone a schedule uses and whether it lists the Japanese broadcast or a streaming release. Delays, regional availability and platform updates can change when an episode is actually watchable.'],
  'tv-database': ['Research movies and TV shows', 'Use cast, release year and episode guides to distinguish remakes and similarly named titles. Ratings reflect each community; availability information may vary by country and should be confirmed with the streaming provider.']
};
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
    const guide = guides[cat.key] || ['Compare these resources','Check each website for current features, access requirements and availability before using it.'];
    const url = urlFor(cat.key);
    let html = base.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(meta.title)}</title>`)
      .replace(/(<meta\s+id="category-description"[\s\S]*?content=")[^"]*/, '$1'+escape(meta.description))
      .replace(/<link\s+id="category-canonical"[\s\S]*?>/,`<link id="category-canonical" rel="canonical" href="${escape(url)}">`)
      .replace('<body>',`<body data-category="${escape(cat.key)}">`);
    html = slot(html,'category-page-title',escape(cat.title+' Sites'));
    html = slot(html,'category-page-count',`${cat.sites.length} sites`);
    html = slot(html,'category-page-list',rows(cat.sites));
    const related = catalog.filter(c=>c.key!==cat.key && c.group===cat.group);
    const links = (related.length?related:catalog.filter(c=>c.key!==cat.key).slice(0,3))
      .map(c=>`<li><a href="${escape(urlFor(c.key))}">${escape(c.title)} Sites</a></li>`).join('');
    html = html.replace('</main>',`<h2>${escape(guide[0])}</h2><p>${escape(guide[1])}</p><p>WebShelf links to external websites and does not host their content. Listings are not a quality ranking. Features, availability and access requirements can change. <a href="/support.html">Report an outdated or broken listing</a> or <a href="/suggest.html">suggest a site</a>.</p><nav aria-label="Related categories"><h2>Explore related categories</h2><ul>${links}</ul></nav></section></main>`);
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
  home = home.replace('</main>','<h2>About WebShelf</h2><p>WebShelf is a curated website directory for streaming, reading, downloads, databases and release schedules. Browse by category, search for a site, and save favorites in this browser. WebShelf links to external services rather than hosting their content.</p><p>Found a broken link? <a href="/support.html">Report it</a>. Know a useful resource? <a href="/suggest.html">Suggest a website</a>. Check each destination for current availability, terms and licensing.</p></section></main>');
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
