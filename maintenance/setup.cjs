#!/usr/bin/env node
const cp=require('node:child_process'),L=require('./lib.cjs');
if(Number(process.versions.node.split('.')[0])<22){console.error('Please install Node.js 22 or newer.');process.exit(1);}
try{require.resolve('parse5');require.resolve('saxes');}catch{
 console.log('Installing maintenance-only dependencies from the lockfile...');
 const win=process.platform==='win32',args=['ci','--prefix','maintenance','--ignore-scripts','--no-audit','--no-fund'];
 const result=cp.spawnSync(win?'cmd.exe':'npm',win?['/d','/s','/c','npm '+args.join(' ')]:args,{cwd:L.ROOT,stdio:'inherit'});
 if(result.error||result.status!==0){console.error('Setup failed. Run npm ci --prefix maintenance --ignore-scripts from the project root.');process.exit(1);}
}
