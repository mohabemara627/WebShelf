#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),L=require('./lib.cjs'),F=require('./favicon.cjs'),C=require('./cli.cjs'),{commit}=require('./transaction.cjs');
function csv(text){
 const rows=[];let row=[],value='',quoted=false,closed=false;
 const cell=()=>{row.push(value);value='';closed=false;};const end=()=>{cell();if(row.some(Boolean))rows.push(row);row=[];};
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=ch;continue;}
  if(ch==='"'){if(value||closed)throw Error('Malformed CSV quote');quoted=true;}else if(ch===',')cell();else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;end();}else{if(closed)throw Error('Unexpected content after CSV closing quote');value+=ch;}}
 if(quoted)throw Error('Unclosed CSV quote');if(value||row.length||closed)end();if(!rows.length)return [];
 const header=rows.shift().map(s=>s.trim());if(new Set(header).size!==header.length||!['name','url','category'].every(k=>header.includes(k)))throw Error('CSV requires unique name,url,category columns');
 return rows.map((r,i)=>{if(r.length!==header.length)throw Error('Wrong number of columns on CSV row '+(i+2));return Object.fromEntries(header.map((h,j)=>[h,r[j]]));});
}
function prepare(rows,catalog){
 if(!Array.isArray(rows))throw Error('JSON import must be an array.');const next=structuredClone(catalog),report=[],accepted=[];
 for(const [index,row]of rows.entries()){
  const item={row:index+1,name:row?.name||'',status:''};report.push(item);
  try{
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.name!=='string'||!row.name.trim())throw Error('Site name is required');
   let url;try{url=L.normalizeURL(row.url);}catch(e){item.status='invalid_url';throw e;}
   const ci=next.findIndex(c=>c.key===row.category||c.title.toLowerCase()===String(row.category).toLowerCase());if(ci<0){item.status='invalid_category';throw Error('Unknown category: '+row.category);}
   const conflict=L.flatten(next).find(x=>L.urlKey(x.site.url)===L.urlKey(url)||(x.ci===ci&&L.nameKey(x.site.name)===L.nameKey(row.name)));
   if(conflict){item.status='duplicate';throw Error('Conflicts with '+conflict.site.name+' ['+conflict.category.title+'] '+conflict.site.url);}
   const site={name:row.name.trim(),url,icon:''};if(row.description!==undefined&&row.description!==''){if(typeof row.description!=='string')throw Error('Description must be text');site.description=row.description;}
   const tags=C.badges(row.badges??row.tags);if(tags.length)site.badges=tags;
   const rank=C.position(row.position??row.rank,next[ci].sites.length);next[ci].sites.splice(rank,0,site);
   const errors=L.checkCatalog(next);if(errors.length){next[ci].sites.splice(rank,1);throw Error(errors.join('; '));}
   item.status='planned';item.url=url;item.category=next[ci].key;item.favicon='automatic'+(row.iconUrl?' / manual URL':'');accepted.push({site,item,manual:row.iconUrl||row.icon_url});
  }catch(e){item.status=item.status||'other_failure';item.error=e.message;}
 }
 return {catalog:next,report,accepted};
}
async function importRows(rows,{root=L.ROOT,dryRun=false,resolver=F.resolveIcon}={}){
 const raw=fs.readFileSync(path.join(root,'maintenance/catalog.json')),plan=prepare(rows,JSON.parse(raw)),icons=new Map();let committed=false;
 if(!dryRun&&plan.accepted.length){
  let cursor=0;await Promise.all(Array.from({length:Math.min(3,plan.accepted.length)},async()=>{while(cursor<plan.accepted.length){const a=plan.accepted[cursor++];try{const result=await resolver(a.site.url,a.manual);a.site.icon=F.allocate(root,a.site.name,result,icons);a.item.favicon='downloaded';}catch(e){a.item.favicon='failed';a.item.faviconError=e.message;}}}));
  try{commit(plan.catalog,{root,expected:L.digest(raw),icons});committed=true;plan.accepted.forEach(a=>a.item.status='added');}catch(e){plan.accepted.forEach(a=>{a.item.status='other_failure';a.item.error='Transaction rolled back: '+e.message;});}
 }
 const summary={successfullyAdded:plan.report.filter(r=>r.status==='added').length,planned:plan.report.filter(r=>r.status==='planned').length,skippedDuplicates:plan.report.filter(r=>r.status==='duplicate').length,invalidURLs:plan.report.filter(r=>r.status==='invalid_url').length,invalidCategories:plan.report.filter(r=>r.status==='invalid_category').length,faviconFailures:plan.report.filter(r=>r.favicon==='failed').length,otherFailures:plan.report.filter(r=>r.status==='other_failure').length};
 const report={dryRun,committed,summary,entries:plan.report};
 if(!dryRun)L.atomic(path.join(root,'maintenance/import-report.json'),JSON.stringify(report,null,2)+'\n');return report;
}
async function main(){try{
 const args=process.argv.slice(2),dryRun=args.includes('--dry-run');if(args.some(a=>a.startsWith('--')&&a!=='--dry-run'))throw Error('Unknown option');
 const specified=args.find(a=>!a.startsWith('--'));let file=specified?path.resolve(specified):path.join(__dirname,'import-sites.json');if(!specified&&!fs.existsSync(file))file=path.join(__dirname,'import-sites.csv');
 const text=fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''),rows=file.toLowerCase().endsWith('.csv')?csv(text):JSON.parse(text);const report=await importRows(rows,{dryRun});console.log(JSON.stringify(report,null,2));if(!dryRun)console.log('Report: maintenance/import-report.json');else console.log('Dry run: no writes or network requests.');if(report.summary.otherFailures||report.summary.invalidURLs||report.summary.invalidCategories)process.exitCode=1;
 }catch(e){console.error('Import failed: '+e.message);process.exitCode=1;}}
if(require.main===module)main();module.exports={csv,prepare,importRows};
