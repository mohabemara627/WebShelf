// ==================================================
// WEBSHELF SEARCH
// ==================================================

(() => {
  const SEARCH_RESULT_LIMIT = 60;

  const safeText = (value) => typeof escapeWebShelfText === "function"
    ? escapeWebShelfText(value)
    : String(value ?? "");

  const getSearchSites = () => {
    const source = Array.isArray(WebShelfSites) ? WebShelfSites : [];
    return typeof filterVisibleSites === "function" ? filterVisibleSites(source) : source;
  };

  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-label="Search WebShelf">
      <div class="search-header">
        <div class="search-input-wrapper">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M20 20L16.5 16.5"></path>
          </svg>
          <input
            class="search-input"
            id="webshelf-search-title"
            aria-label="Search websites" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="webshelf-search-results"
            type="search"
            placeholder="Search websites, categories..."
            autocomplete="off"
            spellcheck="false"
          >
        </div>
        <button class="search-close" type="button" aria-label="Close search">×</button>
      </div>
      <div class="search-toolbar">
        <div class="search-info" aria-live="polite"></div>
        <label class="search-category-label">
          <span class="sr-only">Filter search by category</span>
          <select class="search-category-filter" aria-label="Filter search by category">
            <option value="all">All categories</option>
          </select>
        </label>
      </div>
      <div class="search-results" id="webshelf-search-results" role="listbox" aria-label="Search results"></div>
    </div>`;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector(".search-modal");
  const input = overlay.querySelector(".search-input");
  const results = overlay.querySelector(".search-results");
  const info = overlay.querySelector(".search-info");
  const categoryFilter = overlay.querySelector(".search-category-filter");
  const closeButton = overlay.querySelector(".search-close");
  const heroSearch = document.querySelector("#hero-search-trigger");
  const heroSearchCount = document.querySelector("#hero-search-count");

  let previousFocus = null;
  let restoreBackground = null;
  const searchIndex = new WeakMap();
  let activeResultIndex = -1;
  let currentMatches = [];

  if (Array.isArray(WebShelfCategories)) {
    categoryFilter.insertAdjacentHTML(
      "beforeend",
      WebShelfCategories.map((category) => `<option value="${safeText(category.key)}">${safeText(category.title)}</option>`).join("")
    );
  }

  if (heroSearchCount) {
    heroSearchCount.textContent = `${getSearchSites().length} websites`;
  }

    function normalizeQuery(value) {
      const raw = String(value || "").trim().toLowerCase();
      if (!raw) return "";

      // Partial Arabic search:
      // ara / arab / arabi / arabic → AR badge
      if (raw.length >= 3 && "arabic".startsWith(raw)) {
        return "ar";
      }

      const aliases = new Map([
        ["arabic subtitles", "ar"],
        ["arabic subtitle", "ar"],
        ["عربي", "ar"],
        ["العربي", "ar"],
        ["العربية", "ar"]
      ]);

      return aliases.get(raw) || raw;
    }

  function siteSearchText(site) {
    return {
      name: String(site.name || "").toLowerCase(),
      domain: typeof getSiteDomain === "function" ? getSiteDomain(site).toLowerCase() : "",
      category: String(site.category || "").toLowerCase(),
      group: String(site.group || "").toLowerCase(),
      description: String(site.description || "").toLowerCase(),
      badges: getSiteBadges(site).join(" ").toLowerCase()
    };
  }

  function scoreSite(site, query) {
    if (!searchIndex.has(site)) searchIndex.set(site, siteSearchText(site));
    const text = searchIndex.get(site);
    let score = 0;
    if (text.name === query) score += 120;
    else if (text.name.startsWith(query)) score += 90;
    else if (text.name.includes(query)) score += 70;

    if (text.domain === query) score += 85;
    else if (text.domain.startsWith(query)) score += 65;
    else if (text.domain.includes(query)) score += 50;

    if (text.category.includes(query)) score += 40;
    if (text.badges.split(/\s+/).includes(query)) score += 45;
    else if (text.badges.includes(query)) score += 30;
    if (text.description.includes(query)) score += 25;
    if (text.group.includes(query)) score += 18;
    return score;
  }

  function filteredAndRankedSites() {
    const query = normalizeQuery(input.value);
    const selectedCategory = categoryFilter.value;
    const candidates = getSearchSites().filter((site) => selectedCategory === "all" || site.categoryKey === selectedCategory);

    if (!query) return [];

    return candidates
      .map((site) => ({ site, score: scoreSite(site, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.site.name).localeCompare(String(b.site.name)))
      .map((item) => item.site);
  }

  function setActiveResult(index, scroll = true) {
    if (index === activeResultIndex) return;
    const items = [...results.querySelectorAll(".search-result")];
    if (!items.length) {
      activeResultIndex = -1;
      return;
    }

    input.setAttribute("aria-activedescendant", "webshelf-result-" + Math.max(0, Math.min(index, items.length - 1)));
    activeResultIndex = Math.max(0, Math.min(index, items.length - 1));
    items.forEach((item, itemIndex) => {
      const active = itemIndex === activeResultIndex;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      if (active && scroll) item.scrollIntoView({ block: "nearest" });
    });
  }

  function renderResults(matches) {
    const sites = getSearchSites();
    const query = input.value.trim();
    input.removeAttribute("aria-activedescendant");
    currentMatches = matches;
    activeResultIndex = -1;

    if (!query) {
      const filteredCount = categoryFilter.value === "all"
        ? sites.length
        : sites.filter((site) => site.categoryKey === categoryFilter.value).length;
      info.textContent = `Search ${filteredCount} websites`;
      results.innerHTML = `<div class="search-empty">Start typing to search WebShelf.</div>`;
      return;
    }

    const visible = matches.slice(0, SEARCH_RESULT_LIMIT);
    info.textContent = matches.length > SEARCH_RESULT_LIMIT
      ? `${matches.length} results · showing first ${SEARCH_RESULT_LIMIT}`
      : `${matches.length} ${matches.length === 1 ? "result" : "results"}`;

    if (!matches.length) {
      results.innerHTML = `<div class="search-empty">No websites found.</div>`;
      return;
    }

    results.innerHTML = visible.map((site, index) => {
      const name = safeText(site.name);
      const logo = site.icon
        ? `<img src="${safeText(site.icon)}" loading="lazy" decoding="async" alt="${name} logo">`
        : `<span>${name.charAt(0)}</span>`;
      const description = String(site.description || "").trim();
      const domain = typeof getSiteDomain === "function" ? getSiteDomain(site) : "";
      const secondary = description || [domain, site.category].filter(Boolean).join(" · ");

      return `
        <a class="search-result" id="webshelf-result-${index}" role="option" aria-selected="false" data-search-index="${index}" href="${safeText(site.url)}" target="_blank" rel="noopener noreferrer" data-site-url="${safeText(site.url)}">
          <div class="search-result-logo">${logo}</div>
          <div class="search-result-text">
            <span class="search-result-name-line"><span class="search-result-name">${name}</span>${renderSiteBadges(site, { interactive: false })}</span>
            <span class="search-result-category">${safeText(secondary)}</span>
          </div>
          <span class="search-result-arrow">↗</span>
        </a>`;
    }).join("");
  }

  function searchWebShelf() {
    renderResults(filteredAndRankedSites());
  }

  function open(initialQuery = "") {
    if (isOpen()) { input.focus(); return; }
    window.WebShelfNavigation?.close?.();
    window.WebShelfPreview?.close?.();
    previousFocus = document.activeElement;
    overlay.hidden = false;
    restoreBackground = WebShelfRuntime.modalBackground(overlay);
    document.body.classList.add("search-open");
    input.value = initialQuery;
    categoryFilter.value = "all";
    searchWebShelf();
    requestAnimationFrame(() => { if (isOpen()) input.focus(); });
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    restoreBackground?.(); restoreBackground = null;
    document.body.classList.remove("search-open");
    activeResultIndex = -1;
    const target = previousFocus;
    previousFocus = null;
    if (target && typeof target.focus === "function" && document.contains(target)) {
      target.focus();
    }
  }

  function isOpen() {
    return !overlay.hidden;
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !isOpen()) return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]')]
      .filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  heroSearch?.addEventListener("click", () => open());
  closeButton.addEventListener("click", close);
  input.addEventListener("input", searchWebShelf);
  categoryFilter.addEventListener("change", searchWebShelf);

  input.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    const visibleCount = Math.min(currentMatches.length, SEARCH_RESULT_LIMIT);
    if (event.key === "ArrowDown" && visibleCount) {
      event.preventDefault();
      setActiveResult(activeResultIndex < 0 ? 0 : (activeResultIndex + 1) % visibleCount);
    } else if (event.key === "ArrowUp" && visibleCount) {
      event.preventDefault();
      setActiveResult(activeResultIndex < 0 ? visibleCount - 1 : (activeResultIndex - 1 + visibleCount) % visibleCount);
    } else if (event.key === "Enter" && activeResultIndex >= 0) {
      event.preventDefault();
      results.querySelector(`.search-result[data-search-index="${activeResultIndex}"]`)?.click();
    }
  });

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  results.addEventListener("mousemove", (event) => {
    const result = event.target.closest(".search-result");
    if (!result) return;
    const index = Number(result.dataset.searchIndex);
    if (Number.isFinite(index)) setActiveResult(index, false);
  });

  results.addEventListener("click", (event) => {
    const result = event.target.closest(".search-result");
    if (!result) return;
    const site = WebShelfSites.find((item) => item.url === result.dataset.siteUrl);
    if (site && typeof addRecentlyViewed === "function") addRecentlyViewed(site);
    close();
  });

  document.addEventListener("keydown", (event) => {
    trapFocus(event);
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      close();
    }
  });

  document.addEventListener("webshelf-hidden-changed", () => {
    if (heroSearchCount) heroSearchCount.textContent = `${getSearchSites().length} websites`;
    if (isOpen()) searchWebShelf();
  });

  renderResults([]);
  window.WebShelfSearch = { open, close, isOpen };
})();
