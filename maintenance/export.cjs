#!/usr/bin/env node
// Dependency-free static export for hosting. Build/validate the master locally first.
const fs=require('node:fs'),path=require('node:path'),L=require('./lib.cjs');
try{const target=path.join(L.ROOT,'public');if(fs.existsSync(target))throw Error('public already exists; remove/move the previous export before exporting again.');fs.mkdirSync(target);for(const file of L.publicFiles(L.ROOT)){const out=path.join(target,file);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(L.ROOT,file),out);}console.log('Production-only export: public/');}catch(e){console.error(e.message);process.exitCode=1;}
