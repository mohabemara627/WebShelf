// ==================================================

// CATEGORY PAGE

// ==================================================

const urlParams = new URLSearchParams(window.location.search);

const categoryType = urlParams.get("type");

const currentCategory = WebShelfCategories.find(
  (category) => category.key === categoryType
);

const pageTitle = document.querySelector("#category-page-title");

const pageCount = document.querySelector("#category-page-count");

const pageList = document.querySelector("#category-page-list");

const pageIcon = document.querySelector("#category-page-icon");

const lucideIcon = document.querySelector("#category-page-lucide");

const categoryCanonical = document.querySelector("#category-canonical");

const categoryDescription = document.querySelector("#category-description");

const categoryPageDescription = document.querySelector(
  "#category-page-description"
);

const siteFilters = document.querySelector("#category-site-filters");

// Set attributes through the DOM; category/query text never becomes HTML.
function setCategoryMeta(attribute, key, content) {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// Do not put a blanket noindex in the static shell: valid categories must remain
// indexable. Unknown, missing and wrong-case keys are excluded after resolution.
if (!currentCategory) {
  setCategoryMeta("name", "robots", "noindex,follow");
  categoryCanonical?.remove();
  categoryDescription?.remove();
  document.head.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(meta => meta.remove());
}


const CATEGORY_SEO = {
  "anime-streaming": {
    title: "Best Anime Streaming Sites - Watch Anime Online | WebShelf",
    description:
      "Discover curated anime streaming sites to watch anime online. Explore popular platforms, alternatives, and useful anime streaming websites on WebShelf.",
    intro:
      "Discover curated anime streaming websites for watching anime online. Browse popular platforms, alternatives, and useful streaming options in one place."
  },

  "tv-streaming": {
    title: "Best TV Streaming Sites - Watch TV Online | WebShelf",
    description:
      "Discover curated TV streaming sites for watching shows and series online. Explore streaming platforms and alternatives on WebShelf.",
    intro:
      "Browse curated TV streaming websites for watching shows and series online, including popular platforms and useful alternatives."
  },

  "sports-streaming": {
    title: "Best Sports Streaming Sites - Watch Sports Online | WebShelf",
    description:
      "Discover curated sports streaming sites for watching live sports online. Explore football, basketball, motorsports, and other streaming options.",
    intro:
      "Browse curated sports streaming websites for watching live sports online, including football, basketball, motorsports, and more."
  },

  "manga-reading": {
    title: "Best Manga Reading Sites - Read Manga Online | WebShelf",
    description:
      "Discover curated manga reading sites to read manga online. Explore popular manga websites, databases, and useful alternatives on WebShelf.",
    intro:
      "Discover manga reading websites for reading manga online, finding new series, and exploring useful alternatives."
  },

  "manhwa-reading": {
    title: "Best Manhwa Reading Sites - Read Manhwa Online | WebShelf",
    description:
      "Discover curated manhwa reading sites to read manhwa and webtoons online. Explore popular platforms and alternatives on WebShelf.",
    intro:
      "Browse curated websites for reading manhwa and webtoons online, including popular platforms and useful alternatives."
  },

  "novel-reading": {
    title: "Best Novel Reading Sites - Read Novels Online | WebShelf",
    description:
      "Discover curated websites for reading novels and light novels online. Explore novel reading platforms and useful alternatives.",
    intro:
      "Browse websites for reading novels and light novels online and discover new platforms and alternatives."
  },

  "anime-download": {
    title: "Anime Download Sites - Download Anime | WebShelf",
    description:
      "Discover curated anime download sites and resources for finding downloadable anime releases on WebShelf.",
    intro:
      "Browse curated anime download websites and resources for finding downloadable anime releases."
  },

  "tv-download": {
    title: "TV Download Sites - Download TV Shows | WebShelf",
    description:
      "Discover curated TV download sites and resources for finding downloadable TV shows and series.",
    intro:
      "Browse curated websites and resources for finding downloadable TV shows and series."
  },

  "subtitle-download": {
    title: "Best Subtitle Download Sites | WebShelf",
    description:
      "Discover curated subtitle download sites for movies, TV shows, and anime in multiple languages.",
    intro:
      "Browse subtitle websites for movies, TV series, and anime across multiple languages."
  },

  "anime-database": {
    title: "Best Anime Database Websites | WebShelf",
    description:
      "Explore curated anime database websites for ratings, information, characters, staff, recommendations, and more.",
    intro:
      "Explore anime database websites for ratings, series information, characters, staff, recommendations, and discovery."
  },

  "anime-schedule": {
    title: "Anime Release Schedule Sites | WebShelf",
    description:
      "Discover anime schedule websites for tracking upcoming episodes, release dates, seasonal anime, and airing times.",
    intro:
      "Track anime episode releases, airing dates, seasonal schedules, and upcoming shows with these curated websites."
  },

  "tv-database": {
    title: "Best TV & Movie Database Websites | WebShelf",
    description:
      "Explore curated TV and movie database websites for ratings, cast information, release dates, reviews, and discovery.",
    intro:
      "Explore TV and movie database websites for ratings, cast information, release dates, reviews, and discovery."
  }
};


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
  const focusedKey = siteFilters.contains(document.activeElement)
    ? document.activeElement.dataset.siteFilter
    : undefined;
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

  // Replacing the filter buttons must not send keyboard focus back to <body>.
  if (focusedKey !== undefined) {
    const buttons = [...siteFilters.querySelectorAll("[data-site-filter]")];
    (buttons.find(button => button.dataset.siteFilter === focusedKey) || buttons[0])?.focus({ preventScroll: true });
  }
}

function renderCategorySites() {
  if (!currentCategory || !pageList) return;
  pageList.setAttribute("aria-busy", "true");
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

  pageList.setAttribute("aria-busy", "false");
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
  const seo = CATEGORY_SEO[currentCategory.key];

  const title = seo?.title || `${currentCategory.title} - WebShelf`;
  const description = seo?.description || `Browse curated ${currentCategory.title} websites on WebShelf.`;
  const canonicalUrl = `https://www.webshelf.link/category.html?type=${encodeURIComponent(currentCategory.key)}`;

  document.title = title;
  if (categoryCanonical) categoryCanonical.href = canonicalUrl;
  if (categoryDescription) categoryDescription.content = description;

  setCategoryMeta("name", "robots", "index,follow");
  setCategoryMeta("property", "og:title", title);
  setCategoryMeta("property", "og:description", description);
  setCategoryMeta("property", "og:url", canonicalUrl);
  setCategoryMeta("name", "twitter:title", title);
  setCategoryMeta("name", "twitter:description", description);

  if (categoryPageDescription) {
    categoryPageDescription.textContent =
      seo?.intro ||
      `Browse curated ${currentCategory.title} websites on WebShelf.`;
  }

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