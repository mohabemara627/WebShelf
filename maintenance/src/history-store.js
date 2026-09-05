// Bounded history: retain up to 250 sites, 30 calendar days of counts, and 512 KiB.
const RECENTLY_VIEWED_KEY = 'webshelf-recently-viewed';
const HISTORY_MAX_SITES = 250;
const HISTORY_MAX_BYTES = 512 * 1024;
const HISTORY_DAYS = 30;
const HISTORY_DAY_MS = 86400000;
function historyDay(time) {
  const date = new Date(time);
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / HISTORY_DAY_MS);
}
function normalizeActivitySite(site) {
  const now = Date.now(), today = historyDay(now), days = new Map();
  const add = (day, count) => {
    if (Number.isInteger(day) && day > today - HISTORY_DAYS && day <= today && Number.isSafeInteger(count) && count > 0) {
      days.set(day, Math.min(Number.MAX_SAFE_INTEGER, (days.get(day) || 0) + count));
    }
  };
  if (Array.isArray(site.visitDays)) {
    for (const item of site.visitDays) if (item) add(item.day, item.count);
  } else if (Array.isArray(site.visitTimestamps)) {
    for (const time of site.visitTimestamps) if (Number.isFinite(time) && time > 0 && time <= now) add(historyDay(time), 1);
  } else if (Number.isFinite(site.lastVisited) && site.lastVisited > 0 && site.lastVisited <= now) {
    add(historyDay(site.lastVisited), 1);
  }
  const {visitTimestamps, ...rest} = site;
  return {...rest,
    visits: Number.isSafeInteger(site.visits) && site.visits >= 0 ? site.visits : Math.max(1, [...days.values()].reduce((a,b)=>a+b,0)),
    lastVisited: Number.isFinite(site.lastVisited) && site.lastVisited > 0 ? Math.min(site.lastVisited, now) : 0,
    visitDays: [...days].sort((a,b)=>a[0]-b[0]).map(([day,count])=>({day,count}))
  };
}
function compactHistory(sites) {
  const records = sites.map(normalizeActivitySite).sort((a,b)=>b.lastVisited-a.lastVisited).slice(0,HISTORY_MAX_SITES).map(site=>({
    name:site.name, url:site.url, icon:site.icon || '', visits:site.visits, lastVisited:site.lastVisited, visitDays:site.visitDays
  }));
  const bounded=[];let bytes=4;
  for(const record of records){
    const size=JSON.stringify(record).length*2+(bounded.length?2:0);
    if(bytes+size>HISTORY_MAX_BYTES)break;
    bytes+=size;bounded.push(record);
  }
  return bounded;
}
function saveRecentlyViewed(sites) {
  WebShelfRuntime.storage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(compactHistory(sites)));
}
function getRecentlyViewed() {
  const sites=WebShelfRuntime.savedSites(RECENTLY_VIEWED_KEY);
  const compact=compactHistory(sites), serialized=JSON.stringify(compact);
  if (serialized !== WebShelfRuntime.storage.getItem(RECENTLY_VIEWED_KEY)) WebShelfRuntime.storage.setItem(RECENTLY_VIEWED_KEY, serialized);
  const known=new Map(sites.map(site=>[site.url,site]));
  return compact.map(site=>({...known.get(site.url),...site}));
}
function addRecentlyViewed(site) {
  if (!site || !WebShelfRuntime.safeUrl(site.url)) return;
  const sites=getRecentlyViewed(),existing=sites.find(item=>item.url===site.url),now=Date.now(),day=historyDay(now);
  const visitDays=(existing?.visitDays || []).map(item=>({...item})),bucket=visitDays.find(item=>item.day===day);
  if(bucket)bucket.count=Math.min(Number.MAX_SAFE_INTEGER,bucket.count+1);else visitDays.push({day,count:1});
  const updated={...existing,...site,visits:existing?Math.min(Number.MAX_SAFE_INTEGER,existing.visits+1):1,lastVisited:now,visitDays};
  saveRecentlyViewed([updated,...sites.filter(item=>item.url!==site.url)]);
  document.dispatchEvent(new CustomEvent('webshelf-activity-changed'));
}

document.addEventListener("click", (event) => {
  const link = event.target.closest(".site-link");
  if (!link) return;
  const row = link.closest(".site-row");
  if (!row) return;

  const site = typeof WebShelfSites !== "undefined"
    ? WebShelfSites.find((item) => item.url === link.href || item.url === link.getAttribute("href"))
    : null;

  if (site) {
    addRecentlyViewed(site);
    return;
  }

  const name = row.querySelector(".site-name")?.textContent.trim();
  const image = row.querySelector(".site-logo img");
  if (name) addRecentlyViewed({ name, url: link.href, icon: image?.getAttribute("src") || "" });
});
