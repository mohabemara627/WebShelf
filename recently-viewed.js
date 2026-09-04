// ==================================================
// RECENTLY VIEWED + ACTIVITY DATA
// ==================================================

const RECENTLY_VIEWED_KEY = "webshelf-recently-viewed";
const RECENTLY_VISIBLE_LIMIT = 5;
const MAX_VISIT_TIMESTAMPS_PER_SITE = 500;

function normalizeActivitySite(site) {
  const lastVisited = Number.isFinite(site?.lastVisited) ? site.lastVisited : 0;
  const timestamps = Array.isArray(site?.visitTimestamps)
    ? site.visitTimestamps.filter(Number.isFinite).sort((a, b) => a - b)
    : lastVisited
      ? [lastVisited]
      : [];

  return {
    ...site,
    visits: Number.isFinite(site?.visits) ? site.visits : Math.max(1, timestamps.length),
    lastVisited,
    visitTimestamps: timestamps.slice(-MAX_VISIT_TIMESTAMPS_PER_SITE)
  };
}

function getRecentlyViewed() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    return Array.isArray(saved) ? saved.map(normalizeActivitySite) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(sites) {
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(sites));
}

function addRecentlyViewed(site) {
  let sites = getRecentlyViewed();
  const existing = sites.find((item) => item.url === site.url);
  const now = Date.now();
  const timestamps = [
    ...(existing?.visitTimestamps || []),
    now
  ].slice(-MAX_VISIT_TIMESTAMPS_PER_SITE);

  const updated = {
    ...existing,
    ...site,
    visits: existing ? existing.visits + 1 : 1,
    lastVisited: now,
    visitTimestamps: timestamps
  };

  sites = sites.filter((item) => item.url !== site.url);
  sites.unshift(updated);
  saveRecentlyViewed(sites);
  renderRecentlyViewed();
  document.dispatchEvent(new CustomEvent("webshelf-activity-changed"));
}

function renderRecentlyViewed() {
  const section = document.querySelector("#recently-viewed");
  const list = document.querySelector("#recently-viewed-list");
  if (!section || !list) return;

  const sites = getRecentlyViewed();
  if (!sites.length) {
    section.hidden = true;
    list.innerHTML = "";
    return;
  }

  section.hidden = false;
  const visible = sites.slice(0, RECENTLY_VISIBLE_LIMIT);
  const rows = visible.map((site) => {
    const logo = site.icon
      ? `<img src="${site.icon}" loading="lazy" decoding="async" alt="${site.name} logo">`
      : `<span>${site.name.charAt(0)}</span>`;
    return `
      <a class="recently-item" href="${site.url}" target="_blank" rel="noopener noreferrer" data-site-url="${site.url}">
        <div class="recently-logo">${logo}</div>
        <span>${site.name}</span>
      </a>`;
  }).join("");

  const viewAll = sites.length > RECENTLY_VISIBLE_LIMIT
    ? `<a class="recently-view-all" href="./activity.html">View all (${sites.length}) →</a>`
    : "";

  list.innerHTML = rows + viewAll;
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

document.addEventListener("click", (event) => {
  const link = event.target.closest(".recently-item");
  if (!link) return;
  const site = getRecentlyViewed().find((item) => item.url === link.dataset.siteUrl);
  if (site) addRecentlyViewed(site);
});

function setupRecentlyClearButton() {
  const button = document.querySelector("#recently-clear");
  if (!button) return;
  button.addEventListener("click", async () => {
    const confirmed = window.WebShelfDialog
      ? await window.WebShelfDialog.confirm({
          title: "Clear recent activity?",
          message: "This removes your recently viewed history and visit counts.",
          confirmText: "Clear",
          danger: true
        })
      : true;

    if (!confirmed) return;
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    renderRecentlyViewed();
    document.dispatchEvent(new CustomEvent("webshelf-activity-changed"));
  });
}

function initializeRecentlyViewed() {
  setupRecentlyClearButton();
  renderRecentlyViewed();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeRecentlyViewed);
} else {
  initializeRecentlyViewed();
}
