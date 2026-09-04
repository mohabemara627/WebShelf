// ==================================================
// WEBSHELF HOMEPAGE
// ==================================================

const categoryGrid = document.querySelector("#category-grid");
const directoryColumns = document.querySelector("#directory-columns");
const exploreSubtitle = document.querySelector("#explore-subtitle");
const collectionsSection = document.querySelector("#collections-section");
const collectionsGrid = document.querySelector("#collections-grid");
const recentChangesSection = document.querySelector("#recent-changes-section");
const recentChangesList = document.querySelector("#recent-changes-list");
const recentChangesTabs = document.querySelector("#recent-changes-tabs");

let activeChangeView = "added";

const HOMEPAGE_CATEGORY_CARD_ORDER = [
  "anime-streaming", "manga-reading", "anime-download", "anime-database",
  "TV-streaming", "manhwa-reading", "TV-download", "TV-database",
  "sports-streaming", "novel-reading", "subtitle-download", "anime-schedule"
];

function orderedHomepageCategories(categories) {
  const order = new Map(HOMEPAGE_CATEGORY_CARD_ORDER.map((key, index) => [key, index]));
  return [...categories].sort((a, b) => {
    const aIndex = order.has(a.key) ? order.get(a.key) : Number.MAX_SAFE_INTEGER;
    const bIndex = order.has(b.key) ? order.get(b.key) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}


function visibleSites(sites) {
  return typeof filterVisibleSites === "function" ? filterVisibleSites(sites) : sites;
}

function safeText(value) {
  return typeof escapeWebShelfText === "function"
    ? escapeWebShelfText(value)
    : String(value ?? "");
}

function homepageSiteRow(site, index) {
  const rank = String(index + 1).padStart(2, "0");
  const name = safeText(site.name);
  const url = safeText(site.url);
  const icon = safeText(site.icon || "");
  const logo = site.icon
    ? `<img src="${icon}" loading="lazy" decoding="async" alt="${name} logo">`
    : `<span>${name.charAt(0)}</span>`;

  return `
    <div class="site-row" data-site-url="${url}">
      <a class="site-link" href="${url}" target="_blank" rel="noopener noreferrer">
        <span class="rank">${rank}</span>
        <div class="site-logo">${logo}</div>
        <span class="site-name-line">
          <span class="site-name">${name}</span>
          ${renderSiteBadges(site)}
        </span>
      </a>
      <button class="favorite-button" type="button" data-site-url="${url}" aria-label="Add to favorites">☆</button>
    </div>`;
}

function setupFavoriteButtons(root, sites) {
  root.querySelectorAll(".favorite-button").forEach((button) => {
    const site = sites.find((item) => item.url === button.dataset.siteUrl);
    if (!site) return;

    updateFavoriteButton(button, isFavorite(site.url));
    button.addEventListener("click", () => {
      const active = toggleFavorite(site);
      updateFavoriteButton(button, active);
      document.dispatchEvent(new CustomEvent("webshelf-favorites-changed"));
    });
  });
}

function createCategoryCard(category) {
  const sites = visibleSites(category.sites);
  const card = document.createElement("a");
  card.className = "category";
  card.href = `./category.html?type=${encodeURIComponent(category.key)}`;
  card.dataset.categoryKey = category.key;
  card.style.setProperty("--category-accent", category.accent || "var(--brand-purple)");
  card.innerHTML = `
    <div class="category-icon"><i data-lucide="${safeText(category.icon || "folder")}"></i></div>
    <div class="category-info">
      <h3>${safeText(category.title)}</h3>
      <p>${sites.length} ${sites.length === 1 ? "site" : "sites"}</p>
    </div>
    <span class="category-arrow" aria-hidden="true">→</span>`;
  return card;
}

function createDirectoryPanel(category) {
  const panel = document.createElement("div");
  const sites = visibleSites(category.sites);
  panel.className = "directory-panel dynamic-directory-panel";
  panel.dataset.categoryKey = category.key;
  panel.style.setProperty("--category-accent", category.accent || "var(--brand-purple)");

  panel.innerHTML = `
    <div class="panel-header">
      <div>
        <h3>${safeText(category.title)}</h3>
        <p>${sites.length} ${sites.length === 1 ? "site" : "sites"}</p>
      </div>
    </div>
    <div class="site-list">${sites.slice(0, 5).map(homepageSiteRow).join("")}</div>
    <a href="./category.html?type=${encodeURIComponent(category.key)}" class="view-all">View all ${sites.length} ${sites.length === 1 ? "site" : "sites"}</a>`;

  setupFavoriteButtons(panel, sites);
  return panel;
}

function renderHomepageDirectory() {
  if (!categoryGrid || !directoryColumns || !Array.isArray(WebShelfCategories)) return;

  const categories = WebShelfCategories;
  const cardCategories = orderedHomepageCategories(categories);
  categoryGrid.replaceChildren();
  directoryColumns.replaceChildren();

  cardCategories.forEach((category) => {
    categoryGrid.appendChild(createCategoryCard(category));
  });

  const left = document.createElement("div");
  const right = document.createElement("div");
  left.className = right.className = "directory-column";
  const split = Math.ceil(categories.length / 2);

  categories.forEach((category, index) => {
    (index < split ? left : right).appendChild(createDirectoryPanel(category));
  });

  directoryColumns.append(left, right);

  if (exploreSubtitle) {
    exploreSubtitle.textContent = "Curated websites, organized by category.";
  }

  window.lucide?.createIcons?.();
  document.dispatchEvent(new CustomEvent("webshelf-sites-rendered"));
}

function renderCollections() {
  if (!collectionsSection || !collectionsGrid || typeof getAvailableCollections !== "function") return;

  const collections = getAvailableCollections()
    .map((name) => ({ name, sites: visibleSites(getSitesInCollection(name)) }))
    .filter((item) => item.sites.length > 0);

  if (!collections.length) {
    collectionsSection.hidden = true;
    collectionsGrid.innerHTML = "";
    return;
  }

  collectionsSection.hidden = false;
  collectionsGrid.innerHTML = collections.map(({ name, sites }) => `
    <a class="collection-card" href="./collection.html?type=${encodeURIComponent(name)}">
      <span class="collection-card-kicker">Collection</span>
      <strong>${safeText(name)}</strong>
      <span>${sites.length} ${sites.length === 1 ? "site" : "sites"}</span>
      <span class="collection-card-arrow">→</span>
    </a>`).join("");
}

function timestamp(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}

function recentChangeSource(view) {
  return visibleSites(WebShelfSites).filter((site) => {
    if (view === "updated") {
      return timestamp(site.updatedAt) > 0 && timestamp(site.updatedAt) > timestamp(site.addedAt);
    }
    return timestamp(site.addedAt) > 0;
  });
}

function renderRecentChanges() {
  if (!recentChangesSection || !recentChangesList) return;

  const hasAnyDatedSites = recentChangeSource("added").length > 0 || recentChangeSource("updated").length > 0;
  if (!hasAnyDatedSites) {
    recentChangesSection.hidden = true;
    recentChangesList.innerHTML = "";
    return;
  }

  recentChangesSection.hidden = false;
  const source = recentChangeSource(activeChangeView);
  const field = activeChangeView === "updated" ? "updatedAt" : "addedAt";
  source.sort((a, b) => timestamp(b[field]) - timestamp(a[field]));
  const sites = source.slice(0, 6);

  if (!sites.length) {
    recentChangesList.innerHTML = `
      <div class="recent-changes-empty">
        No recently ${activeChangeView === "updated" ? "updated" : "added"} sites yet.
      </div>`;
    return;
  }

  recentChangesList.innerHTML = sites.map((site) => {
    const date = new Date(site[field]);
    const dateText = Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const name = safeText(site.name);
    return `
      <a class="recent-change-item" href="${safeText(site.url)}" target="_blank" rel="noopener noreferrer" data-site-url="${safeText(site.url)}">
        <div class="recent-change-logo">${site.icon ? `<img src="${safeText(site.icon)}" loading="lazy" decoding="async" alt="${name} logo">` : name.charAt(0)}</div>
        <div><strong>${name}</strong><span>${safeText(site.category)}${dateText ? ` · ${safeText(dateText)}` : ""}</span></div>
        ${renderSiteBadges(site, { interactive: false })}
        <span class="recent-change-arrow">↗</span>
      </a>`;
  }).join("");
}


recentChangesTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-change-view]");
  if (!button) return;
  activeChangeView = button.dataset.changeView;
  recentChangesTabs.querySelectorAll(".recent-change-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
  renderRecentChanges();
});

recentChangesList?.addEventListener("click", (event) => {
  const link = event.target.closest(".recent-change-item");
  if (!link) return;
  const site = WebShelfSites.find((item) => item.url === link.dataset.siteUrl);
  if (site && typeof addRecentlyViewed === "function") addRecentlyViewed(site);
});

document.addEventListener("webshelf-hidden-changed", () => {
  renderHomepageDirectory();
  renderCollections();
  renderRecentChanges();
});

renderHomepageDirectory();
renderCollections();
renderRecentChanges();
