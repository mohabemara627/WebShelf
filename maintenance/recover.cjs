#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),L=require('./lib.cjs');
try{
 const lock=path.join(__dirname,'.lock'),dir=path.join(__dirname,'.transaction');
 if(fs.existsSync(lock)){const pid=Number(fs.readFileSync(lock,'utf8'));if(Number.isInteger(pid)&&pid>0){let active=false;try{process.kill(pid,0);active=true;}catch(e){if(e.code!=='ESRCH')throw e;}if(active)throw Error('Maintenance process '+pid+' is still running; recovery refused.');}}
 if(fs.existsSync(path.join(dir,'journal.json'))){const entries=JSON.parse(fs.readFileSync(path.join(dir,'journal.json')));for(const{file,backup}of entries){const dest=path.resolve(L.ROOT,file);if(!dest.startsWith(L.ROOT+path.sep)||file.includes('..')||(backup&&!/^backup\/\d+$/.test(backup)))throw Error('Unsafe journal path');if(backup)L.atomic(dest,fs.readFileSync(path.join(dir,backup)));else if(fs.existsSync(dest))fs.unlinkSync(dest);}}
 if(fs.existsSync(dir))fs.rmSync(dir,{recursive:true});if(fs.existsSync(lock))fs.unlinkSync(lock);console.log('Recovery complete. Run node maintenance/validate.cjs.');
}catch(e){console.error('Recovery failed: '+e.message);process.exitCode=1;}
