const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),base=path.resolve(__dirname,'../release-20260905-patch/WebShelf');
const src=path.resolve(root,'maintenance/src');
const read=file=>fs.readFileSync(fs.existsSync(path.join(src,file))?path.join(src,file):path.join(root,file),'utf8');
function environment(options={}){
 const map=new Map(),events=[],listeners={};
 const document={body:{children:[]},addEventListener(){},dispatchEvent:e=>events.push(e.type),querySelector:()=>null};
 const localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),...options.storage};
 const ctx=vm.createContext({URL,Map,Set,WeakMap,JSON,console:{warn(){}},location:{href:'https://www.webshelf.link/index.html'},document,localStorage,CustomEvent:class{constructor(type){this.type=type;}},setTimeout,clearTimeout,AbortController,...options.globals});
 ctx.window={addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInContext(read('data.js'),ctx);vm.runInContext(read('catalog-helpers.js'),ctx);vm.runInContext(read('runtime.js'),ctx);ctx.WebShelfRuntime=ctx.window.WebShelfRuntime;
 return {ctx,map,events,listeners,runtime:ctx.WebShelfRuntime,document};
}
for(const input of [null,'','javascript:alert(1)','data:text/html,x','https://user:pass@example.com','https://example.com\n/x','//example.com'])test('reject unsafe stored URL '+JSON.stringify(input),()=>assert.equal(environment().runtime.safeUrl(input),''));
test('preserve valid links and relative image paths',()=>{const r=environment().runtime;assert.equal(r.safeUrl('https://example.com/a?q=1'),'https://example.com/a?q=1');assert.equal(r.safeUrl('./images/icons/x.png',true),'./images/icons/x.png');});
test('malformed and duplicate favorites cannot break rendering',()=>{
 const e=environment();e.map.set('webshelf-favorites',JSON.stringify([null,2,{}, {name:'Bad',url:'javascript:alert(1)'},{name:'A',url:'https://example.com',icon:'javascript:alert(1)'},{name:'B',url:'https://example.com'}]));
 const list=e.runtime.savedSites('webshelf-favorites');assert.equal(list.length,1);assert.equal(list[0].icon,'');assert.equal(list[0].name,'A');
 e.map.set('webshelf-favorites','broken{');assert.equal(e.runtime.savedSites('webshelf-favorites').length,0);
});
test('saved sites use current catalog metadata without losing visit data',()=>{
 const e=environment();e.map.set('x',JSON.stringify([{name:'old',url:'https://anime.nexus/',icon:'bad',visits:4}]));const s=e.runtime.savedSites('x')[0];assert.equal(s.name,'Anime Nexus');assert.equal(s.visits,4);
});
test('quota and denied storage do not throw; temporary changes remain usable',()=>{
 const e=environment({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('quota');},removeItem(){throw Error('blocked');}}});
 e.runtime.storage.setItem('x','value');assert.equal(e.runtime.storage.getItem('x'),'value');e.runtime.storage.removeItem('x');assert.equal(e.runtime.storage.getItem('x'),null);
});
test('cross-tab changes dispatch only corresponding events',()=>{const e=environment();e.listeners.storage({key:'webshelf-favorites'});assert.deepEqual(e.events,['webshelf-favorites-changed']);e.events.length=0;e.listeners.storage({key:null});assert.equal(e.events.length,4);});
test('saved HTML is escaped at the favorites render boundary',()=>{
 const e=environment();let html;const list={set innerHTML(s){html=s;},querySelectorAll:()=>[],querySelector:()=>null};const section={};
 e.document.querySelector=s=>s==='#favorites-list'?list:s==='#favorites-section'?section:null;e.document.readyState='loading';
 e.map.set('webshelf-favorites',JSON.stringify([{name:'<img src=x onerror=alert(1)>',url:'https://example.com/"onclick="bad',icon:'./x"onerror="bad.png'}]));
 vm.runInContext(read('favorites.js'),e.ctx);vm.runInContext('renderFavorites()',e.ctx);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('src="./x"onerror='));assert.ok(!html.includes('href="https://example.com/"onclick='));
});
test('hidden-site filtering reads storage once for the whole collection',()=>{
 let reads=0;const e=environment({storage:{getItem(){reads++;return '["https://example.com/"]';}}});e.document.readyState='loading';
 vm.runInContext(read('hidden.js'),e.ctx);e.ctx.input=Array.from({length:120},()=>({url:'https://example.com/'}));assert.equal(vm.runInContext('filterVisibleSites(input).length',e.ctx),0);assert.equal(reads,1);
});
function formEnvironment(fetch, globals={}){
 let submit,reset=0;const values=[['message','test']],attrs={};const form={action:'https://formspree.io/test',querySelectorAll:()=>[],reportValidity:()=>true,addEventListener:(name,fn)=>submit=fn,setAttribute:(k,v)=>attrs[k]=v,removeAttribute:k=>delete attrs[k],reset(){reset++;}};
 const status={setAttribute(){}},button={textContent:'Submit',disabled:false};
 const e=environment({globals:{fetch,FormData:class{entries(){return values[Symbol.iterator]();}},...globals}});e.runtime.bindForm(form,status,button,{sending:'Sending',success:'Success',failure:'Failure'});
 return {submit:()=>submit({preventDefault(){}}),status,button,values,attrs,get resets(){return reset;}};
}
test('form prevents duplicate POST and restores button on success',async()=>{
 let resolve,calls=0;const e=formEnvironment(()=>{calls++;return new Promise(r=>resolve=r);});const p=e.submit();await e.submit();assert.equal(calls,1);assert.equal(e.button.disabled,true);resolve({ok:true});await p;assert.equal(e.resets,1);assert.equal(e.button.disabled,false);assert.equal(e.status.textContent,'Success');
});
test('form does not erase edits made while request was pending',async()=>{let resolve;const e=formEnvironment(()=>new Promise(r=>resolve=r));const p=e.submit();e.values[0][1]='new text';resolve({ok:true});await p;assert.equal(e.resets,0);});
test('network failure preserves form and recovers submit button',async()=>{const e=formEnvironment(async()=>{throw Error('offline');});await e.submit();assert.equal(e.resets,0);assert.equal(e.status.textContent,'Failure');assert.equal(e.button.disabled,false);});
test('a stalled form request is aborted at its deadline without retry',async()=>{
 let deadline,calls=0;const e=formEnvironment((url,options)=>{calls++;return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))));},{setTimeout:(callback,ms)=>{assert.equal(ms,20000);deadline=callback;return 1;},clearTimeout(){}});
 const p=e.submit();deadline();await p;assert.equal(calls,1);assert.equal(e.button.disabled,false);assert.equal(e.resets,0);
});
test('relative saved images also work in a file preview',()=>{const e=environment({globals:{location:{href:'file:///C:/WebShelf/index.html'}}});assert.equal(e.runtime.safeUrl('./images/icons/x.png',true),'./images/icons/x.png');});
test('modal background restores previously inert state without changing classes',()=>{
 const e=environment(),a={tagName:'MAIN',inert:false},b={tagName:'ASIDE',inert:true},overlay={tagName:'DIV',inert:false};
 e.document.body.children=[a,b,overlay];const restore=e.runtime.modalBackground(overlay);assert.equal(a.inert,true);assert.equal(overlay.inert,false);restore();assert.equal(a.inert,false);assert.equal(b.inert,true);
});
function worker(options={}){
 const version=read('service-worker.js').match(/CACHE_PREFIX \+ '([^']+)'/)[1];
 const handlers={},deleted=[],stored=[],pending=[];const cache={match:options.match|| (async key=>options.hit?new Response('cached'):undefined),put:async key=>{if(options.quota)throw Error('quota');stored.push(key);},addAll:async()=>{}};
 const ctx=vm.createContext({URL,Response,Set,AbortController,setTimeout,clearTimeout,fetch:options.fetch|| (async()=>new Response('network')),caches:{open:async()=>cache,keys:async()=>['other-app','webshelf-/-v7','webshelf-/-'+version],delete:async k=>deleted.push(k)},self:{registration:{scope:'https://www.webshelf.link/'},location:{origin:'https://www.webshelf.link'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,fn)=>handlers[name]=fn}});
 vm.runInContext(read('service-worker.js'),ctx);
 return {ctx,handlers,deleted,stored,pending,request(url='/category.html?type=anime-streaming',extra={}){let p;handlers.fetch({request:{url:'https://www.webshelf.link'+url,mode:'navigate',method:'GET',...extra},waitUntil:value=>pending.push(value),respondWith:value=>p=value});return p;}};
}
test('worker cache write failure does not discard successful response',async()=>assert.equal(await (await worker({quota:true}).request()).text(),'network'));
test('worker falls back on network failures and server 500',async()=>{for(const fetch of [async()=>{throw Error('offline');},async()=>new Response('server down',{status:500})])assert.equal(await (await worker({hit:true,fetch}).request()).text(),'cached');});
test('worker preserves 404 and does not cache it',async()=>{const w=worker({hit:true,fetch:async()=>new Response('missing',{status:404})});assert.equal((await w.request()).status,404);assert.equal(w.stored.length,0);});
test('worker does not intercept forms or unrelated endpoints',()=>{const w=worker();assert.equal(w.request('/api/private'),undefined);assert.equal(w.request('/index.html',{method:'POST'}),undefined);});
test('worker stores one shell rather than an entry per category query',async()=>{const w=worker();await w.request('/category.html?type=a');await w.request('/category.html?type=b');assert.deepEqual(w.stored,['https://www.webshelf.link/category.html','https://www.webshelf.link/category.html']);});
test('worker activation only removes its previous version',async()=>{const w=worker();let p;w.handlers.activate({waitUntil:v=>p=v});await p;assert.deepEqual(w.deleted,['webshelf-/-v7']);});
test('worker core assets exist with exact case',()=>{const w=worker();const core=vm.runInContext('CORE',w.ctx);for(const file of core){const p=path.join(root,file);assert.ok(fs.existsSync(p),file);if(file!=='./')assert.ok(fs.readdirSync(path.dirname(p)).includes(path.basename(p)),file);}});
test('offline navigation falls back to the requested document, never a different page',async()=>{
 const match=async key=>{const url=typeof key==='string'?key:key.url;return new Response(url.endsWith('/support.html')?'support':url.endsWith('/category.html')?'category':'other');};
 const w=worker({fetch:async()=>{throw Error('offline');},match:async key=>{if(typeof key!=='string')return undefined;return match(key);}});
 assert.equal(await (await w.request('/support.html')).text(),'support');assert.equal(await (await w.request('/category.html?type=TV-streaming')).text(),'category');
});
test('each page has exactly three external scripts and all bundles parse',()=>{
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const s=read(file);assert.equal([...s.matchAll(/<script src=/g)].length,3,file);for(const m of s.matchAll(/<script src="\.\/([^"]+)"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);}
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.js')))new vm.Script(read(file),{filename:file});
});
test('forms omit favorite and preview modules while retaining search/history',()=>{
 assert.ok(!read('common.js').includes('function renderFavorites'));assert.ok(!read('common.js').includes('function buildPreview'));
 assert.ok(read('common.js').includes('function addRecentlyViewed'));assert.ok(read('common.js').includes('function searchWebShelf'));
 for(const file of ['support.bundle.js','suggest.bundle.js']){assert.ok(!read(file).includes('renderFavorites'));assert.ok(!read(file).includes('buildPreview'));}
});
test('retired homepage features have no remaining public renderers or selectors',()=>{
 const all=fs.readdirSync(root).filter(f=>/\.(js|css|html)$/.test(f)).map(read).join('\n');
 assert.ok(!/getSitesInCollection|renderRecentChanges|renderCollections|\.favorite-list-chip|\.favorite-list-add|id="collections-section"/.test(all));
 assert.ok(read('collection.bundle.js').includes('siteHasBadge'));
});

function historyEnvironment(){const e=environment();e.document.querySelectorAll=()=>[];vm.runInContext(read('history-store.js'),e.ctx);return e;}
test('500 legacy timestamps migrate into daily counts without losing all-time visits',()=>{
 const e=historyEnvironment(),now=Date.now();e.map.set('webshelf-recently-viewed',JSON.stringify([{name:'Example',url:'https://example.com/',visits:900,lastVisited:now,visitTimestamps:Array.from({length:500},(_,i)=>now-i*1000)}]));
 const result=vm.runInContext('getRecentlyViewed()',e.ctx);assert.equal(result[0].visits,900);assert.equal(result[0].visitDays.reduce((n,x)=>n+x.count,0),500);assert.ok(!e.map.get('webshelf-recently-viewed').includes('visitTimestamps'));
});
test('history keeps the 250 most recently visited sites',()=>{
 const e=historyEnvironment(),now=Date.now();e.map.set('webshelf-recently-viewed',JSON.stringify(Array.from({length:1000},(_,i)=>({name:'Site '+i,url:'https://example.com/'+i,lastVisited:now-i*1000,visits:7}))));
 const result=vm.runInContext('getRecentlyViewed()',e.ctx);assert.equal(result.length,250);assert.equal(result[0].url,'https://example.com/0');assert.equal(result[249].url,'https://example.com/249');assert.ok(e.map.get('webshelf-recently-viewed').length*2<=512*1024);
});
test('history enforces byte budget even with unusually large names',()=>{
 const e=historyEnvironment(),now=Date.now();e.ctx.records=Array.from({length:250},(_,i)=>({name:'x'.repeat(4000),url:'https://example.com/'+i,lastVisited:now-i,visits:1}));
 const result=vm.runInContext('compactHistory(records)',e.ctx);assert.ok(JSON.stringify(result).length*2<=512*1024);assert.ok(result.length<250);
});
test('new visits increment daily counts and old daily buckets expire',()=>{
 const e=historyEnvironment();const day=vm.runInContext('historyDay(Date.now())',e.ctx);e.ctx.record={name:'Example',url:'https://example.com/',lastVisited:Date.now(),visits:40,visitDays:[{day:day-31,count:10},{day,count:3}]};
 e.map.set('webshelf-recently-viewed',JSON.stringify([e.ctx.record]));vm.runInContext('addRecentlyViewed(record)',e.ctx);const [site]=JSON.parse(e.map.get('webshelf-recently-viewed'));assert.equal(site.visits,41);assert.deepEqual(site.visitDays,[{day,count:4}]);
});
test('activity 7-day and 30-day filters sum daily buckets',()=>{
 const e=historyEnvironment();vm.runInContext(read('activity.js'),e.ctx);const day=vm.runInContext('historyDay(Date.now())',e.ctx);e.ctx.record={visits:100,visitDays:[{day,count:3},{day:day-6,count:4},{day:day-7,count:5},{day:day-29,count:6}]};
 assert.equal(vm.runInContext('currentActivityPeriod="7";periodVisitCount(record)',e.ctx),7);assert.equal(vm.runInContext('currentActivityPeriod="30";periodVisitCount(record)',e.ctx),18);assert.equal(vm.runInContext('currentActivityPeriod="all";periodVisitCount(record)',e.ctx),100);
});

test('cached icons return before slow revalidation and refresh in background',async()=>{
 let complete;const w=worker({hit:true,fetch:(request,options)=>{assert.equal(options.cache,'no-cache');return new Promise(resolve=>complete=resolve);}});
 const response=await w.request('/images/icons/WS-Logo-192.png',{mode:'no-cors',destination:'image'});assert.equal(await response.text(),'cached');assert.equal(w.stored.length,0);
 complete(new Response('new image'));await Promise.all(w.pending);assert.equal(w.stored.length,1);
});
test('icon cache misses use network and failed refreshes preserve cached icons',async()=>{
 const request={mode:'no-cors',destination:'image'},url='/images/icons/WS-Logo-192.png';
 const fresh=worker();assert.equal(await (await fresh.request(url,request)).text(),'network');await Promise.all(fresh.pending);assert.equal(fresh.stored.length,1);
 for(const fetch of [async()=>{throw Error('offline');},async()=>new Response('error',{status:500}),async()=>new Response('missing',{status:404})]) {
  const w=worker({hit:true,fetch});assert.equal(await (await w.request(url,request)).text(),'cached');await Promise.all(w.pending);assert.equal(w.stored.length,0);
 }
});
test('shared history records category links without loading homepage UI',()=>{
 const e=environment();let click;e.document.addEventListener=(name,fn)=>{if(name==='click')click=fn;};vm.runInContext(read('history-store.js'),e.ctx);
 const link={href:'https://anime.nexus/',closest:()=>({}),getAttribute:()=> 'https://anime.nexus/'};click({target:{closest:()=>link}});
 const [saved]=JSON.parse(e.map.get('webshelf-recently-viewed'));assert.equal(saved.url,'https://anime.nexus/');assert.equal(saved.visits,1);
});
