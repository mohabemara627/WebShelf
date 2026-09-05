const fs=require('node:fs'),path=require('node:path'),L=require('./lib.cjs');
function commit(catalog,{root=L.ROOT,expected,icons=new Map(),removeIcons=[],testFailure}={}){
 const errors=L.checkCatalog(catalog);if(errors.length)throw Error(errors.join('\n'));
 const lock=path.join(root,'maintenance/.lock'),dir=path.join(root,'maintenance/.transaction');let fd;
 try{fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,String(process.pid));}catch{throw Error('Another maintenance operation is running, or recovery is needed. See README.');}
 let journal;
 try{
  if(fs.existsSync(dir))throw Error('A previous transaction needs recovery.');
  if(expected&&L.digest(fs.readFileSync(path.join(root,'maintenance/catalog.json')))!==expected)throw Error('Catalog changed while this command was open. Restart to avoid overwriting another edit.');
  const stage=path.join(dir,'stage');fs.mkdirSync(stage,{recursive:true});
  for(const file of [...L.publicFiles(root),...L.walk(path.join(root,'maintenance')).filter(f=>!f.startsWith('.')&&!f.startsWith('node_modules/')).map(f=>'maintenance/'+f)]){const dest=path.join(stage,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);}
  for(const [file,bytes]of icons){if(!/^images\/icons\/[a-z0-9][a-z0-9.-]*$/.test(file)||fs.existsSync(path.join(root,file)))throw Error('Unsafe or occupied icon filename: '+file);L.atomic(path.join(stage,file),bytes);}
  L.atomic(path.join(stage,'maintenance/catalog.json'),JSON.stringify(catalog,null,2)+'\n');
  require('./build.cjs').build(stage);
  const references=require('./validate.cjs').references(stage).refs;
  for(const file of removeIcons){if(!/^images\/icons\/[^/]+$/.test(file))throw Error('Invalid removal path');if(references.has(file)||L.flatten(catalog).some(x=>x.site.icon?.replace(/^\.\//,'')===file))continue;if(fs.existsSync(path.join(stage,file)))fs.unlinkSync(path.join(stage,file));}
  const result=require('./validate.cjs').validate(stage,{quiet:true,git:false});if(result.errors.length)throw Error('Proposed project failed validation:\n'+result.errors.join('\n'));
  if(testFailure==='validation')throw Error('Simulated pre-commit failure');
  const files=[...new Set([...L.publicFiles(root),...L.publicFiles(stage),'maintenance/catalog.json'])];
  const changes=files.filter(f=>{const a=path.join(root,f),b=path.join(stage,f);return !fs.existsSync(a)||!fs.existsSync(b)||!fs.readFileSync(a).equals(fs.readFileSync(b));});
  journal=changes.map((file,i)=>{const p=path.join(root,file),backup='backup/'+i;if(fs.existsSync(p)){fs.mkdirSync(path.join(dir,'backup'),{recursive:true});fs.copyFileSync(p,path.join(dir,backup));return {file,backup};}return {file,backup:null};});
  L.atomic(path.join(dir,'journal.json'),JSON.stringify(journal));
  for(const [index,{file}]of journal.entries()){const source=path.join(stage,file),target=path.join(root,file);if(fs.existsSync(source))L.atomic(target,fs.readFileSync(source));else fs.unlinkSync(target);if(testFailure==='commit'&&index===0)throw Error('Simulated commit failure');}
  const final=require('./validate.cjs').validate(root,{quiet:true});if(final.errors.length)throw Error(final.errors.join('\n'));
  fs.rmSync(dir,{recursive:true});console.log('Saved, rebuilt and validated successfully.');return {changed:changes,warnings:final.warnings};
 }catch(e){
  if(journal)for(const {file,backup}of journal){const p=path.join(root,file);if(backup)L.atomic(p,fs.readFileSync(path.join(dir,backup)));else if(fs.existsSync(p))fs.unlinkSync(p);}
  if(fs.existsSync(dir)&&(!fs.existsSync(path.join(dir,'journal.json'))||journal))fs.rmSync(dir,{recursive:true});
  throw e;
 }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
module.exports={commit};
