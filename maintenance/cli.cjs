const readline=require('node:readline/promises'),fs=require('node:fs'),path=require('node:path');
const L=require('./lib.cjs'),F=require('./favicon.cjs'),{commit}=require('./transaction.cjs');
function terminal(){const rl=readline.createInterface({input:process.stdin,output:process.stdout});return {ask:async q=>(await rl.question(q)).trim(),close:()=>rl.close()};}
async function categoryMenu(io,catalog,current){catalog.forEach((c,i)=>console.log((i+1)+'. '+c.title+' ('+c.key+')'));const answer=await io.ask('Category number'+(current?' [Enter keeps '+current+']':'')+': ');if(!answer&&current)return catalog.findIndex(c=>c.key===current);const n=Number(answer);if(!Number.isInteger(n)||n<1||n>catalog.length)throw Error('Invalid category number.');return n-1;}
async function selectSite(io,catalog){
 const all=L.flatten(catalog);console.log(all.map((x,i)=>(i+1)+'. '+x.site.name+' ['+x.category.title+'] '+x.site.url).join('\n'));
 const q=await io.ask('Site number, name/search, or URL: ');if(/^\d+$/.test(q)){const found=all[Number(q)-1];if(found)return found;throw Error('Invalid site number.');}
 let matches;try{const key=L.urlKey(q);matches=all.filter(x=>L.urlKey(x.site.url)===key);}catch{matches=[];}
 if(!matches.length)matches=all.filter(x=>L.nameKey(x.site.name).includes(L.nameKey(q))||x.site.url.toLowerCase().includes(q.toLowerCase()));
 if(matches.length===1)return matches[0];if(!matches.length)throw Error('No matching site.');
 matches.forEach((x,i)=>console.log((i+1)+'. '+x.site.name+' ['+x.category.title+'] '+x.site.url));const n=Number(await io.ask('Matching site number: '));if(!Number.isInteger(n)||!matches[n-1])throw Error('Invalid selection');return matches[n-1];
}
function badges(value){const result=Array.isArray(value)?value:typeof value==='string'?value.split(/[;,|]/):[];if(value!==undefined&&typeof value!=='string'&&!Array.isArray(value))throw Error('Badges must be text or an array');if(result.some(v=>typeof v!=='string'))throw Error('Badges must be strings');return [...new Set(result.map(v=>v.trim()).filter(Boolean))];}
function position(value,length){if(value===''||value===undefined||value===null)return length;const n=Number(value);if(!Number.isInteger(n)||n<1||n>length+1)throw Error('Position must be 1 to '+(length+1));return n-1;}
function ensure(catalog){const errors=L.checkCatalog(catalog);if(errors.length)throw Error(errors.join('\n'));}
async function iconPrompt(io,site,icons,{existing=false}={}){
 let mode=existing?await io.ask('Icon: 1 automatic re-fetch, 2 manual URL, 3 keep existing [3]: '):'1';
 if(existing&&(!mode||mode==='3'))return site.icon;
 if(!['1','2'].includes(mode))throw Error('Invalid icon option.');
 let manual=await io.ask(mode==='2'?'Manual icon URL: ':'Optional manual icon URL [Enter tries automatic discovery]: ');if(mode==='2'&&!manual)throw Error('Manual URL is required.');
 for(;;){try{console.log('Resolving favicon...');const result=await F.resolveIcon(site.url,manual);const icon=F.allocate(L.ROOT,site.name,result,icons);console.log('Icon: '+icon+' ('+result.info.type+')');return icon;}catch(e){console.log('Favicon failed: '+e.message);manual=await io.ask('Manual icon URL, or Enter to '+(existing?'keep existing':'continue with letter fallback')+': ');if(!manual)return site.icon||'';}}
}
async function run(action){const io=terminal();try{
 const raw=fs.readFileSync(path.join(L.ROOT,'maintenance/catalog.json')),expected=L.digest(raw),catalog=JSON.parse(raw),icons=new Map(),removeIcons=[];ensure(catalog);
 if(action==='add'){
  const name=await io.ask('Site name: '),url=L.normalizeURL(await io.ask('Site URL: ')),ci=await categoryMenu(io,catalog),description=await io.ask('Short description (optional): '),tags=badges(await io.ask('Optional badges/tags (comma-separated): '));
  const rank=position(await io.ask('Position 1-'+(catalog[ci].sites.length+1)+' [Enter appends]: '),catalog[ci].sites.length);
  const site={name,url};if(description)site.description=description;if(tags.length)site.badges=tags;
  catalog[ci].sites.splice(rank,0,site);ensure(catalog);site.icon=await iconPrompt(io,site,icons);
 }else{
  const selected=await selectSite(io,catalog),site=selected.site;
  if(action==='remove'){
   if((await io.ask('Remove '+site.name+' from '+selected.category.title+'? Type REMOVE: '))!=='REMOVE'){console.log('Cancelled.');return;}
   catalog[selected.ci].sites.splice(selected.si,1);if(site.icon)removeIcons.push(site.icon.replace(/^\.\//,''));
  }else if(action==='icon'){const old=site.icon;site.icon=await iconPrompt(io,site,icons,{existing:true});if(old&&old!==site.icon)removeIcons.push(old.replace(/^\.\//,''));}
  else if(action==='edit'){
   console.log('Enter keeps each current value. Use - to clear description or badges.');
   site.name=(await io.ask('Name ['+site.name+']: '))||site.name;const url=await io.ask('URL ['+site.url+']: ');if(url)site.url=L.normalizeURL(url);
   const ci=await categoryMenu(io,catalog,selected.category.key),description=await io.ask('Description ['+(site.description||'')+']: '),tags=await io.ask('Badges ['+(site.badges||[]).join(',')+']: ');
   if(description==='-')delete site.description;else if(description)site.description=description;if(tags==='-')delete site.badges;else if(tags)site.badges=badges(tags);
   catalog[selected.ci].sites.splice(selected.si,1);const rankText=await io.ask('Position 1-'+(catalog[ci].sites.length+1)+' [Enter '+(ci===selected.ci?'keeps current position':'appends')+']: ');
   const rank=!rankText&&ci===selected.ci?selected.si:position(rankText,catalog[ci].sites.length);catalog[ci].sites.splice(rank,0,site);if(site.category!==undefined)site.category=catalog[ci].key;
   ensure(catalog);const old=site.icon;site.icon=await iconPrompt(io,site,icons,{existing:true});if(old&&old!==site.icon)removeIcons.push(old.replace(/^\.\//,''));
  }else throw Error('Unknown action');
 }
 ensure(catalog);if(JSON.stringify(catalog)===JSON.stringify(JSON.parse(raw))){console.log('No changes.');return;}
 commit(catalog,{expected,icons,removeIcons});
 }catch(e){console.error('Operation failed; no change was accepted: '+e.message);process.exitCode=1;}finally{io.close();}}
module.exports={run,terminal,categoryMenu,selectSite,badges,position,ensure};
