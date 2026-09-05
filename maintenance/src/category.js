// ==================================================
// CATEGORY PAGE
// ==================================================

const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get("type");
const currentCategory = WebShelfCategories.find((category) => category.key === categoryType);

const pageTitle = document.querySelector("#category-page-title");
const pageCount = document.querySelector("#category-page-count");
const pageList = document.querySelector("#category-page-list");
const pageIcon = document.querySelector("#category-page-icon");
const lucideIcon = document.querySelector("#category-page-lucide");
const categoryCanonical = document.querySelector("#category-canonical");
const categoryDescription = document.querySelector("#category-description");
const siteFilters = document.querySelector("#category-site-filters");

let activeSiteFilter = "all";

function visibleSites(sites) {
  return typeof filterVisibleSites === "function"
    ? filterVisibleSites(sites)
    : sites;
}

function categorySiteRow(site, index) {
  const rank = String(index + 1).padStart(2, "0");
  const logo = site.icon
    ? `<img src="${escapeWebShelfText(site.icon)}" loading="lazy" decoding="async" alt="${escapeWebShelfText(site.name)} logo">`
    : `<span>${escapeWebShelfText(site.name.charAt(0))}</span>`;

  return `
    <div class="site-row" data-site-url="${escapeWebShelfText(site.url)}">
      <a class="site-link" href="${escapeWebShelfText(site.url)}" target="_blank" rel="noopener noreferrer">
        <span class="rank">${rank}</span>
        <div class="site-logo">${logo}</div>
        <span class="site-name-line">
          <span class="site-name">${escapeWebShelfText(site.name)}</span>
          ${renderSiteBadges(site)}
        </span>
      </a>
      <button class="favorite-button" type="button" data-site-url="${escapeWebShelfText(site.url)}" aria-label="Add to favorites">☆</button>
    </div>
  `;
}

function setupCategoryFavorites(sites) {
  pageList.querySelectorAll(".favorite-button").forEach((button) => {
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

function filterKeyForBadge(badge) {
  return `badge:${String(badge).toLowerCase()}`;
}

function siteMatchesFilter(site, filter) {
  if (filter === "all") return true;
  if (filter === "screenshots") return Array.isArray(site.screenshots) && site.screenshots.length > 0;
  if (filter === "mirrors") return Array.isArray(site.links) && site.links.some((link) => link?.url);
  if (filter === "highlights") return Array.isArray(site.highlights) && site.highlights.length > 0;
  if (filter.startsWith("badge:")) {
    const badge = filter.slice(6);
    return getSiteBadges(site).some((value) => value.toLowerCase() === badge);
  }
  return true;
}

function getFilterOptions() {
  if (!currentCategory) return [];
  const sites = visibleSites(currentCategory.sites);
  const badges = [...new Set(sites.flatMap((site) => getSiteBadges(site)))].sort((a, b) => a.localeCompare(b));
  const filters = [{ key: "all", label: "All" }];
  badges.forEach((badge) => filters.push({ key: filterKeyForBadge(badge), label: badge }));
  if (sites.some((site) => Array.isArray(site.screenshots) && site.screenshots.length)) filters.push({ key: "screenshots", label: "Screenshots" });
  if (sites.some((site) => Array.isArray(site.links) && site.links.some((link) => link?.url))) filters.push({ key: "mirrors", label: "Mirrors" });
  if (sites.some((site) => Array.isArray(site.highlights) && site.highlights.length)) filters.push({ key: "highlights", label: "Highlights" });
  return filters;
}

function renderFilters() {
  if (!siteFilters || !currentCategory) return;
  const options = getFilterOptions();
  if (options.length <= 1) {
    siteFilters.hidden = true;
    siteFilters.innerHTML = "";
    return;
  }

  siteFilters.hidden = false;
  siteFilters.innerHTML = options.map((option) => `
    <button
      class="site-filter-chip ${option.key === activeSiteFilter ? "active" : ""}"
      type="button"
      aria-pressed="${option.key === activeSiteFilter}" data-site-filter="${escapeWebShelfText(option.key)}"
    >${escapeWebShelfText(option.label)}</button>
  `).join("");
}

function renderCategorySites() {
  if (!currentCategory || !pageList) return;
  const allVisible = visibleSites(currentCategory.sites);
  const filtered = allVisible.filter((site) => siteMatchesFilter(site, activeSiteFilter));

  pageCount.textContent = activeSiteFilter === "all"
    ? `${allVisible.length} ${allVisible.length === 1 ? "site" : "sites"}`
    : `${filtered.length} of ${allVisible.length} sites`;

  if (!filtered.length) {
    pageList.innerHTML = `
      <div class="category-empty">
        <h2>No matching sites</h2>
        <p>Try another filter.</p>
      </div>
    `;
  } else {
    pageList.innerHTML = filtered.map(categorySiteRow).join("");
    setupCategoryFavorites(filtered);
    document.dispatchEvent(new CustomEvent("webshelf-sites-rendered"));
  }

  renderFilters();
}

function applyBadge(badge) {
  const key = filterKeyForBadge(badge);
  const exists = getFilterOptions().some((option) => option.key === key);
  if (!exists) return;
  activeSiteFilter = key;
  renderCategorySites();
  siteFilters?.scrollIntoView({ behavior: "smooth", block: "center" });
}

window.WebShelfCategoryFilters = { applyBadge };

if (!pageTitle || !pageCount || !pageList || !pageIcon || !lucideIcon) {
  console.error("WebShelf: Category page HTML is incomplete.");
} else if (!currentCategory) {
  document.title = "Category Not Found - WebShelf";
  pageTitle.textContent = "Category not found";
  pageCount.textContent = "0 sites";
  pageIcon.style.color = "var(--text-muted)";
  lucideIcon.setAttribute("data-lucide", "circle-alert");
  siteFilters?.setAttribute("hidden", "");
  pageList.innerHTML = `
    <div class="category-empty">
      <h2>Category not found</h2>
      <p>The category you're looking for doesn't exist or the link may be incorrect.</p>
      <a href="./index.html" class="category-empty-link">Back to Directory</a>
    </div>
  `;
} else {
  document.title = `${currentCategory.title} - WebShelf`;
  if (categoryCanonical) categoryCanonical.href = `https://www.webshelf.link/category.html?type=${encodeURIComponent(currentCategory.key)}`;
  if (categoryDescription) categoryDescription.content = `Browse curated ${currentCategory.title} websites on WebShelf.`;
  pageTitle.textContent = currentCategory.title;
  pageIcon.style.color = currentCategory.accent || "var(--brand-purple)";
  lucideIcon.setAttribute("data-lucide", currentCategory.icon || "folder");
  renderCategorySites();
}

siteFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-site-filter]");
  if (!button) return;
  activeSiteFilter = button.dataset.siteFilter || "all";
  renderCategorySites();
});

document.addEventListener("webshelf-hidden-changed", renderCategorySites);
window.lucide?.createIcons?.();
