// ==================================================
// WEBSHELF HOMEPAGE
// ==================================================

const categoryGrid = document.querySelector("#category-grid");
const directoryColumns = document.querySelector("#directory-columns");
const exploreSubtitle = document.querySelector("#explore-subtitle");


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

document.addEventListener("webshelf-hidden-changed", renderHomepageDirectory);
renderHomepageDirectory();
