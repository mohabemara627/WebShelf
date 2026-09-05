const {SaxesParser}=require('saxes');
function unsafeCSS(text){if(/@import|javascript\s*:|\\/i.test(text))return true;for(const m of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi))if(!m[2].trim().startsWith('#'))return true;return false;}
function crc(bytes){let c=0xffffffff;for(const v of bytes){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function xml(text,svg=false){
 let root,depth=0;const nodes=[];const parser=new SaxesParser({xmlns:true});
 parser.on('error',e=>{throw Error('Invalid XML: '+e.message);});
 parser.on('doctype',()=>{throw Error('DOCTYPE is not allowed.');});
 parser.on('processinginstruction',()=>{if(svg)throw Error('SVG processing instructions are not allowed.');});
 parser.on('opentag',tag=>{
  if(!root)root=tag;depth++;nodes.push(tag);
  if(!svg)return;
  if(['script','foreignobject','iframe','object','embed','animate','animatetransform','animatemotion','set'].includes(tag.local.toLowerCase()))throw Error('Unsafe SVG element: '+tag.local);
  for(const a of Object.values(tag.attributes)){
   const v=a.value.replace(/[\s\u0000-\u001f]/g,'').toLowerCase();
   if(/^on/i.test(a.local)||v.includes('javascript:')||v.includes('vbscript:'))throw Error('Unsafe SVG attribute: '+a.name);
   if(['href','src'].includes(a.local)&&a.value&&!a.value.startsWith('#'))throw Error('External SVG references are not allowed.');
   if(unsafeCSS(a.value))throw Error('Unsafe SVG style reference.');
  }
 });
 const checkText=text=>{if(svg&&unsafeCSS(text))throw Error('Unsafe SVG stylesheet.');};parser.on('text',checkText);parser.on('cdata',checkText);
 parser.on('closetag',()=>depth--);parser.write(text).close();
 if(!root||depth!==0)throw Error('Invalid XML document.');
 if(svg&&(root.local!=='svg'||root.uri!=='http://www.w3.org/2000/svg'))throw Error('Expected an SVG namespace/root.');
 return {root,nodes};
}
function inspect(bytes){
 if(!Buffer.isBuffer(bytes))bytes=Buffer.from(bytes);
 const bad=()=>{throw Error('Not a supported, intact image.');};let type,width,height;
 if(bytes.length<12)bad();
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){
  type='png';let at=8,ihdr=false,idat=false,end=false;
  while(at+12<=bytes.length){const n=bytes.readUInt32BE(at),tag=bytes.toString('ascii',at+4,at+8);if(at+12+n>bytes.length||crc(bytes.subarray(at+4,at+8+n))!==bytes.readUInt32BE(at+8+n))bad();if(tag==='IHDR'){if(ihdr||at!==8||n!==13)bad();ihdr=true;width=bytes.readUInt32BE(at+8);height=bytes.readUInt32BE(at+12);}if(tag==='IDAT')idat=true;at+=n+12;if(tag==='IEND'){if(n!==0||at!==bytes.length)bad();end=true;break;}}
  if(!ihdr||!idat||!end)bad();
 }else if(bytes.readUInt32LE(0)===0x00010000){
  type='ico';const count=bytes.readUInt16LE(4);if(!count||count>256||6+16*count>bytes.length)bad();
  for(let i=0;i<count;i++){const p=6+i*16,n=bytes.readUInt32LE(p+8),offset=bytes.readUInt32LE(p+12);if(!n||offset<6+16*count||offset+n>bytes.length)bad();const part=bytes.subarray(offset,offset+n);if(part.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))inspect(part);else if(n<40||part.readUInt32LE(0)<40||part.readUInt32LE(0)>n)bad();}width=bytes[6]||256;height=bytes[7]||256;
 }else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'){
  type='webp';if(bytes.readUInt32LE(4)+8!==bytes.length)bad();const tag=bytes.toString('ascii',12,16);if(bytes.length<30||!['VP8 ','VP8L','VP8X'].includes(tag))bad();
  if(tag==='VP8X'){width=1+bytes.readUIntLE(24,3);height=1+bytes.readUIntLE(27,3);}else if(tag==='VP8L'){if(bytes[20]!==47)bad();const bits=bytes.readUInt32LE(21);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;}else{if(!bytes.subarray(23,26).equals(Buffer.from([157,1,42])))bad();width=bytes.readUInt16LE(26)&0x3fff;height=bytes.readUInt16LE(28)&0x3fff;}
 }else if(bytes[0]===255&&bytes[1]===216){
  type='jpg';if(bytes[bytes.length-2]!==255||bytes[bytes.length-1]!==217)bad();let at=2;
  while(at+4<bytes.length){if(bytes[at++]!==255)bad();while(bytes[at]===255)at++;const tag=bytes[at++];if(tag===218||tag===217)break;if(tag===1||(tag>=208&&tag<=215))continue;const n=bytes.readUInt16BE(at);if(n<2||at+n>bytes.length)bad();if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(tag)){height=bytes.readUInt16BE(at+3);width=bytes.readUInt16BE(at+5);}at+=n;}
 }else if(/^GIF8[79]a$/.test(bytes.toString('ascii',0,6))){type='gif';width=bytes.readUInt16LE(6);height=bytes.readUInt16LE(8);if(bytes.at(-1)!==59)bad();}
 else {const text=bytes.toString('utf8').replace(/^\uFEFF/,'');if(!/^\s*(<\?xml[^>]*\?>\s*)?(<!--[^]*?-->\s*)?<svg[\s>]/i.test(text))bad();const parsed=xml(text,true);type='svg';const attrs=parsed.root.attributes;width=parseFloat(attrs.width?.value)||undefined;height=parseFloat(attrs.height?.value)||undefined;}
 if(type!=='svg'&&(!width||!height||width>16384||height>16384))bad();
 return {type,extension:type,mime:{png:'image/png',ico:'image/x-icon',jpg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',gif:'image/gif'}[type],width,height};
}
function matches(file,type){return (file.split('.').pop().toLowerCase().replace('jpeg','jpg')===type);}
module.exports={inspect,matches,xml};
