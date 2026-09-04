// ==================================================
// QUICK BADGE FILTERS
// ==================================================

(() => {
  function openBadgeFilter(badge) {
    if (!badge) return;

    if (window.WebShelfCategoryFilters?.applyBadge) {
      window.WebShelfCategoryFilters.applyBadge(badge);
      return;
    }

    if (window.WebShelfCollectionFilters?.applyBadge) {
      window.WebShelfCollectionFilters.applyBadge(badge);
      return;
    }

    window.location.href = `./collection.html?badge=${encodeURIComponent(badge)}`;
  }

  function isUsableBadge(element) {
    return element && !element.closest(".search-overlay") && element.hasAttribute("data-badge-filter");
  }

  document.addEventListener("click", (event) => {
    const badge = event.target.closest("[data-badge-filter]");
    if (!isUsableBadge(badge)) return;

    event.preventDefault();
    event.stopPropagation();
    openBadgeFilter(badge.dataset.badgeFilter);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const badge = event.target.closest?.("[data-badge-filter]");
    if (!isUsableBadge(badge)) return;

    event.preventDefault();
    openBadgeFilter(badge.dataset.badgeFilter);
  });
})();
