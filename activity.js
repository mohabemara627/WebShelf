// ==================================================
// WEBSHELF ACTIVITY
// ==================================================

const ACTIVITY_STORAGE_KEY = "webshelf-recently-viewed";
let currentActivityView = "history";
let currentActivityPeriod = "all";

const activityList = document.querySelector("#activity-list");
const activityInfo = document.querySelector("#activity-info");
const activityPeriods = document.querySelector("#activity-periods");
const hiddenSitesTab = document.querySelector("#hidden-sites-tab");

const safeText = (value) => typeof escapeWebShelfText === "function"
  ? escapeWebShelfText(value)
  : String(value ?? "");


function syncHiddenActivityTab() {
  const hiddenCount = typeof getHiddenSites === "function" ? getHiddenSites().length : 0;
  if (hiddenSitesTab) hiddenSitesTab.hidden = hiddenCount === 0;

  if (hiddenCount === 0 && currentActivityView === "hidden") {
    currentActivityView = "history";
    document.querySelectorAll(".activity-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === "history");
    });
  }
}

function applyActivityHash() {
  if (location.hash !== "#hidden") return;
  const hiddenCount = typeof getHiddenSites === "function" ? getHiddenSites().length : 0;
  if (!hiddenCount || !hiddenSitesTab) return;
  currentActivityView = "hidden";
  document.querySelectorAll(".activity-tab").forEach((tab) => {
    tab.classList.toggle("active", tab === hiddenSitesTab);
  });
}

function canonicalSite(url) {
  return WebShelfSites.find((site) => site.url === url) || null;
}

function getActivitySites() {
  if (typeof getRecentlyViewed === "function") return getRecentlyViewed();
  try {
    const sites = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY) || "[]");
    return Array.isArray(sites) ? sites : [];
  } catch {
    return [];
  }
}

function formatLastVisited(timestamp) {
  if (!timestamp) return "Previous visit";
  const difference = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(difference / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(timestamp).toLocaleDateString();
}

function cutoffForPeriod() {
  if (currentActivityPeriod === "all") return 0;
  const days = Number(currentActivityPeriod);
  return Number.isFinite(days) ? Date.now() - days * 86400000 : 0;
}

function periodVisitCount(site) {
  if (currentActivityPeriod === "all") return Number.isFinite(site.visits) ? site.visits : 0;
  const cutoff = cutoffForPeriod();
  const timestamps = Array.isArray(site.visitTimestamps) ? site.visitTimestamps : [];
  return timestamps.filter((value) => Number.isFinite(value) && value >= cutoff).length;
}

function periodLabel() {
  if (currentActivityPeriod === "7") return "last 7 days";
  if (currentActivityPeriod === "30") return "last 30 days";
  return "all time";
}

function getRenderedSites() {
  if (currentActivityView === "hidden") {
    return WebShelfSites.filter((site) => typeof isSiteHidden === "function" && isSiteHidden(site.url));
  }

  const cutoff = cutoffForPeriod();
  let sites = getActivitySites();

  if (currentActivityView === "history") {
    if (cutoff) sites = sites.filter((site) => site.lastVisited >= cutoff);
    return [...sites].sort((a, b) => b.lastVisited - a.lastVisited);
  }

  return sites
    .map((site) => ({ ...site, periodVisits: periodVisitCount(site) }))
    .filter((site) => site.periodVisits > 0)
    .sort((a, b) => b.periodVisits - a.periodVisits || b.lastVisited - a.lastVisited);
}

function activityRow(site, index) {
  const rank = String(index + 1).padStart(2, "0");
  const name = safeText(site.name);
  const url = safeText(site.url);
  const logo = site.icon
    ? `<img src="${safeText(site.icon)}" loading="lazy" decoding="async" alt="${name} logo">`
    : `<span>${name.charAt(0)}</span>`;

  const detail = currentActivityView === "hidden"
    ? "Hidden from directory"
    : currentActivityView === "most-visited"
      ? `${site.periodVisits ?? periodVisitCount(site)} ${(site.periodVisits ?? periodVisitCount(site)) === 1 ? "visit" : "visits"} · ${periodLabel()}`
      : formatLastVisited(site.lastVisited);

  const action = currentActivityView === "hidden"
    ? `<button class="activity-remove activity-unhide" type="button" data-unhide-url="${url}" aria-label="Show ${name} in directory">Show</button>`
    : `<button class="activity-remove" type="button" data-remove-activity="${url}" aria-label="Remove ${name} from activity">×</button>`;

  return `
    <div class="activity-row" data-site-url="${url}">
      <a class="activity-link" href="${url}" target="_blank" rel="noopener noreferrer">
        <span class="activity-rank">${rank}</span>
        <div class="activity-logo">${logo}</div>
        <div class="activity-site-info">
          <span class="activity-site-name-line"><span class="activity-site-name">${name}</span>${typeof renderSiteBadges === "function" ? renderSiteBadges(site) : ""}</span>
          <span class="activity-site-detail">${safeText(detail)}</span>
        </div>
        <span class="activity-arrow">↗</span>
      </a>
      ${action}
    </div>`;
}

function renderActivity() {
  if (!activityList || !activityInfo) return;
  syncHiddenActivityTab();
  const sites = getRenderedSites();
  if (activityPeriods) activityPeriods.hidden = currentActivityView === "hidden";

  if (!sites.length) {
    const message = currentActivityView === "hidden"
      ? "You haven't hidden any websites."
      : `No activity for ${periodLabel()}.`;
    activityInfo.textContent = message;
    activityList.innerHTML = `
      <div class="activity-empty">
        <h2>Nothing here yet</h2>
        <p>${safeText(message)}</p>
        <a href="./index.html">Explore directory</a>
      </div>`;
    return;
  }

  activityInfo.textContent = currentActivityView === "hidden"
    ? `${sites.length} hidden ${sites.length === 1 ? "website" : "websites"}`
    : `${sites.length} ${sites.length === 1 ? "website" : "websites"} · ${periodLabel()}`;
  activityList.innerHTML = sites.map(activityRow).join("");
  document.dispatchEvent(new CustomEvent("webshelf-sites-rendered"));
}

function saveActivitySites(sites) {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(sites));
  document.dispatchEvent(new CustomEvent("webshelf-activity-changed"));
}

function removeActivity(url) {
  saveActivitySites(getActivitySites().filter((site) => site.url !== url));
}

document.querySelectorAll(".activity-tab").forEach((button) => {
  button.addEventListener("click", () => {
    currentActivityView = button.dataset.view;
    document.querySelectorAll(".activity-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderActivity();
  });
});

activityPeriods?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-period]");
  if (!button) return;
  currentActivityPeriod = button.dataset.period;
  activityPeriods.querySelectorAll(".activity-period").forEach((item) => item.classList.toggle("active", item === button));
  renderActivity();
});

activityList?.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-activity]");
  if (remove) {
    event.preventDefault();
    removeActivity(remove.dataset.removeActivity);
    return;
  }

  const unhide = event.target.closest("[data-unhide-url]");
  if (unhide) {
    event.preventDefault();
    setSiteHidden(unhide.dataset.unhideUrl, false);
    return;
  }

  if (event.target.closest("[data-badge-filter]")) return;
  const link = event.target.closest(".activity-link");
  if (!link) return;
  const site = canonicalSite(link.getAttribute("href")) || getActivitySites().find((item) => item.url === link.href);
  if (site && typeof addRecentlyViewed === "function") addRecentlyViewed(site);
});

document.querySelector("#activity-clear")?.addEventListener("click", async () => {
  const confirmed = window.WebShelfDialog
    ? await window.WebShelfDialog.confirm({
        title: "Clear activity?",
        message: "Your browsing history and visit counts will be removed. Favorites and hidden sites will stay.",
        confirmText: "Clear history",
        danger: true
      })
    : true;

  if (!confirmed) return;
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  renderActivity();
});

document.addEventListener("webshelf-activity-changed", renderActivity);
document.addEventListener("webshelf-hidden-changed", () => {
  syncHiddenActivityTab();
  renderActivity();
});

applyActivityHash();
syncHiddenActivityTab();
renderActivity();
