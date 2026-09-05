const fs=require('node:fs'),path=require('node:path');
const {parse}=require('parse5'),I=require('./image.cjs'),L=require('./lib.cjs');
const USER_AGENT='WebShelf-Maintenance/1.0 (favicon discovery)';
async function request(url,{limit=4*1024*1024,signal}={}){
 const deadline=AbortSignal.any([AbortSignal.timeout(6500),...(signal?[signal]:[])]);let current=L.normalizeURL(url);
 for(let i=0;i<6;i++){
  const r=await fetch(current,{redirect:'manual',signal:deadline,headers:{'User-Agent':USER_AGENT,'Accept':'image/*,text/html;q=0.8,*/*;q=0.1'}});
  if([301,302,303,307,308].includes(r.status)){await r.body?.cancel();if(!r.headers.get('location'))throw Error('Redirect without Location');current=L.normalizeURL(new URL(r.headers.get('location'),current).href);continue;}
  if(!r.ok){await r.body?.cancel();throw Error('HTTP '+r.status);}
  if(Number(r.headers.get('content-length'))>limit){await r.body?.cancel();throw Error('Response too large');}
  const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>limit)throw Error('Response too large');chunks.push(chunk);}return {bytes:Buffer.concat(chunks),url:current,contentType:r.headers.get('content-type')||''};
 }
 throw Error('Too many redirects');
}
function candidates(html,finalURL){
 const links=[];let base=finalURL;const document=parse(html);
 const visit=n=>{if(n.tagName==='base'&&base===finalURL){const href=n.attrs.find(a=>a.name==='href')?.value;if(href)try{base=L.normalizeURL(new URL(href,finalURL).href);}catch{}}
  if(n.tagName==='link'){const a=Object.fromEntries(n.attrs.map(a=>[a.name,a.value]));if((a.rel||'').toLowerCase().split(/\s+/).some(r=>['icon','apple-touch-icon','apple-touch-icon-precomposed'].includes(r))&&a.href)links.push(a);}for(const child of n.childNodes||[])visit(child);};visit(document);
 return links.map(a=>{try{const url=L.normalizeURL(new URL(a.href,base).href),size=Math.max(0,...(a.sizes||'').match(/\d+(?=x)/g)||[]);const svg=/svg/i.test(a.type||'')||/\.svg(?:[?#]|$)/i.test(url);return {url,score:(svg?-10000:0)+(size>0&&size<=512?size:0)+(a.rel.includes('apple')?100:0)};}catch{return null;}}).filter(Boolean).sort((a,b)=>b.score-a.score).map(c=>c.url);
}
async function resolveIcon(siteURL,manualURL,{signal,requester=request}={}){
 const timeout=AbortSignal.any([AbortSignal.timeout(45000),...(signal?[signal]:[])]),failures=[];let urls=[],finalURL=L.normalizeURL(siteURL);
 if(manualURL)urls=[L.normalizeURL(manualURL)];else{
  try{const page=await requester(finalURL,{limit:2*1024*1024,signal:timeout});finalURL=page.url;urls=candidates(page.bytes.toString('utf8'),finalURL);}catch(e){failures.push('HTML: '+e.message);}
  urls.push(...['/favicon.ico','/favicon.png','/apple-touch-icon.png'].map(p=>new URL(p,finalURL).href));
 }
 for(const url of [...new Set(urls)].slice(0,10)){
  if(timeout.aborted)break;
  try{const result=await requester(url,{signal:timeout}),info=I.inspect(result.bytes);return {bytes:result.bytes,info,url:result.url,failures};}catch(e){failures.push(url+': '+e.message);}
 }
 throw Error('No usable safe favicon found. '+failures.join(' | '));
}
function allocate(root,name,result,pending=new Map()){
 const stem=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'site';
 const existing=new Set([...fs.readdirSync(path.join(root,'images/icons')).map(s=>s.toLowerCase()),...Array.from(pending.keys(),p=>path.basename(p).toLowerCase())]);
 let filename=stem+'.'+result.info.extension;for(let n=2;existing.has(filename.toLowerCase());n++)filename=stem+'-'+n+'.'+result.info.extension;
 const rel='images/icons/'+filename;pending.set(rel,result.bytes);return './'+rel;
}
module.exports={request,candidates,resolveIcon,allocate};
