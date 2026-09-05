const RECENTLY_VISIBLE_LIMIT = 5;
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
      ? `<img src="${escapeWebShelfText(site.icon)}" loading="lazy" decoding="async" alt="${escapeWebShelfText(site.name)} logo">`
      : `<span>${escapeWebShelfText(site.name.charAt(0))}</span>`;
    return `
      <a class="recently-item" href="${escapeWebShelfText(site.url)}" target="_blank" rel="noopener noreferrer" data-site-url="${escapeWebShelfText(site.url)}">
        <div class="recently-logo">${logo}</div>
        <span>${escapeWebShelfText(site.name)}</span>
      </a>`;
  }).join("");

  const viewAll = sites.length > RECENTLY_VISIBLE_LIMIT
    ? `<a class="recently-view-all" href="./activity.html">View all (${sites.length}) →</a>`
    : "";

  list.innerHTML = rows + viewAll;
}



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
    WebShelfRuntime.storage.removeItem(RECENTLY_VIEWED_KEY);
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

document.addEventListener("webshelf-activity-changed", renderRecentlyViewed);
