// ==================================================
// COLLECTION PAGE
// ==================================================

(() => {
  const params = new URLSearchParams(window.location.search);
  const badgeName = params.get("badge");
  const title = document.querySelector("#collection-page-title");
  const count = document.querySelector("#collection-page-count");
  const list = document.querySelector("#collection-page-list");
  const filters = document.querySelector("#collection-site-filters");
  const description = document.querySelector("#collection-description");

  let activeGroup = "All";
  let activeBadge = badgeName || "";

  function allSourceSites() {
    let sites = badgeName ? WebShelfSites.filter(site => siteHasBadge(site, badgeName)) : [];

    if (typeof filterVisibleSites === "function") {
      sites = filterVisibleSites(sites);
    }
    return sites;
  }

  function filteredSites() {
    return allSourceSites().filter((site) => {
      const groupMatch = activeGroup === "All" || site.group === activeGroup;
      const badgeMatch = !activeBadge || siteHasBadge(site, activeBadge);
      return groupMatch && badgeMatch;
    });
  }

  function siteRow(site, index) {
    const rank = String(index + 1).padStart(2, "0");
    const logo = site.icon
      ? `<img src="${escapeWebShelfText(site.icon)}" loading="lazy" decoding="async" alt="${escapeWebShelfText(site.name)} logo">`
      : `<span>${escapeWebShelfText(site.name.charAt(0))}</span>`;
    return `
      <div class="site-row" data-site-url="${escapeWebShelfText(site.url)}">
        <a class="site-link" href="${escapeWebShelfText(site.url)}" target="_blank" rel="noopener noreferrer">
          <span class="rank">${rank}</span>
          <div class="site-logo">${logo}</div>
          <span class="site-name-line"><span class="site-name">${escapeWebShelfText(site.name)}</span>${renderSiteBadges(site)}</span>
          <span class="collection-site-category">${escapeWebShelfText(site.category)}</span>
        </a>
        <button class="favorite-button" type="button" data-site-url="${escapeWebShelfText(site.url)}" aria-label="Add to favorites">☆</button>
      </div>`;
  }

  function setupFavorites(sites) {
    list.querySelectorAll(".favorite-button").forEach((button) => {
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

  function renderFilters() {
    const focused = filters.contains(document.activeElement) ? document.activeElement : null;
    const focusAttribute = focused?.hasAttribute("data-collection-group")
      ? "data-collection-group"
      : "data-collection-badge";
    const focusValue = focused?.getAttribute(focusAttribute);
    const sites = allSourceSites();
    const groups = ["All", ...new Set(sites.map((site) => site.group || "Other"))];
    const badges = [...new Set(sites.flatMap((site) => getSiteBadges(site)))].sort();
    filters.innerHTML = [
      ...groups.map((group) => `<button class="site-filter-chip ${activeGroup === group ? "active" : ""}" type="button" aria-pressed="${activeGroup === group}" data-collection-group="${escapeWebShelfText(group)}">${escapeWebShelfText(group)}</button>`),
      ...badges.map((badge) => `<button class="site-filter-chip ${activeBadge.toLowerCase() === badge.toLowerCase() ? "active" : ""}" type="button" aria-pressed="${activeBadge.toLowerCase() === badge.toLowerCase()}" data-collection-badge="${escapeWebShelfText(badge)}">${escapeWebShelfText(badge)}</button>`)
    ].join("");
    if (focusValue != null) {
      const buttons = [...filters.querySelectorAll(".site-filter-chip")];
      (buttons.find(button => button.getAttribute(focusAttribute) === focusValue) || buttons[0])?.focus({ preventScroll: true });
    }
  }

  function render() {
    list?.setAttribute("aria-busy", "true");
    const sites = filteredSites();
    const displayTitle = (badgeName ? `${badgeName} sites` : "Collection");
    title.textContent = displayTitle;
    count.textContent = `${sites.length} ${sites.length === 1 ? "site" : "sites"}`;
    document.title = `${displayTitle} - WebShelf`;
    if (description) description.content = `Browse ${displayTitle} websites on WebShelf.`;

    list.innerHTML = sites.length
      ? sites.map(siteRow).join("")
      : `<div class="category-empty"><h2>No matching sites</h2><p>Try another filter or return to the directory.</p></div>`;
    setupFavorites(sites);
    renderFilters();
    list?.setAttribute("aria-busy", "false");
    document.dispatchEvent(new CustomEvent("webshelf-sites-rendered"));
  }

  filters.addEventListener("click", (event) => {
    const group = event.target.closest("[data-collection-group]");
    const badge = event.target.closest("[data-collection-badge]");
    if (group) activeGroup = group.dataset.collectionGroup;
    if (badge) activeBadge = activeBadge.toLowerCase() === badge.dataset.collectionBadge.toLowerCase() ? "" : badge.dataset.collectionBadge;
    render();
  });

  window.WebShelfCollectionFilters = {
    applyBadge(badge) {
      activeBadge = badge;
      render();
    }
  };

  document.addEventListener("webshelf-hidden-changed", render);
  render();
})();
