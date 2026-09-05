// ==================================================
// WEBSHELF FAVORITES
// ==================================================

const FAVORITES_KEY = "webshelf-favorites";
const FAVORITES_VISIBLE_LIMIT = 5;
let favoritesExpanded = false;

function getFavorites() {
  return WebShelfRuntime.savedSites(FAVORITES_KEY);
}

function saveFavorites(favorites) {
  WebShelfRuntime.storage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function isFavorite(siteUrl) {
  return getFavorites().some((site) => site.url === siteUrl);
}

function toggleFavorite(site) {
  const favorites = getFavorites();
  const index = favorites.findIndex((favorite) => favorite.url === site.url);

  if (index !== -1) favorites.splice(index, 1);
  else favorites.push(site);

  saveFavorites(favorites);
  return isFavorite(site.url);
}

function updateFavoriteButton(button, active) {
  if (!button) return;
  button.classList.toggle("active", active);
  button.textContent = active ? "★" : "☆";
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites");
}

function createFavoriteButton(site) {
  const button = document.createElement("button");
  button.className = "favorite-button";
  button.type = "button";
  button.dataset.siteUrl = site.url;
  updateFavoriteButton(button, isFavorite(site.url));
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const active = toggleFavorite(site);
    updateFavoriteButton(button, active);
    document.dispatchEvent(new CustomEvent("webshelf-favorites-changed"));
  });
  return button;
}

function renderFavorites() {
  const section = document.querySelector("#favorites-section");
  const list = document.querySelector("#favorites-list");
  if (!section || !list) return;

  const favorites = getFavorites();

  if (!favorites.length) {
    section.hidden = true;
    list.innerHTML = "";
    favoritesExpanded = false;
    return;
  }

  section.hidden = false;
  const visible = favoritesExpanded
    ? favorites
    : favorites.slice(0, FAVORITES_VISIBLE_LIMIT);

  const rows = visible.map((site, index) => {
    const rank = String(index + 1).padStart(2, "0");
    const logo = site.icon
      ? `<img src="${escapeWebShelfText(site.icon)}" loading="lazy" decoding="async" alt="${escapeWebShelfText(site.name)} logo">`
      : `<span>${escapeWebShelfText(site.name.charAt(0))}</span>`;

    return `
      <div class="site-row favorite-site-row" data-site-url="${escapeWebShelfText(site.url)}">
        <a class="site-link" href="${escapeWebShelfText(site.url)}" target="_blank" rel="noopener noreferrer">
          <span class="rank">${rank}</span>
          <div class="site-logo">${logo}</div>
          <span class="site-name-line">
            <span class="site-name">${escapeWebShelfText(site.name)}</span>
            ${typeof renderSiteBadges === "function" ? renderSiteBadges(site) : ""}
          </span>
        </a>
        <button class="favorite-button active" type="button" data-site-url="${escapeWebShelfText(site.url)}" aria-label="Remove from favorites">★</button>
      </div>`;
  }).join("");

  const toggle = favorites.length > FAVORITES_VISIBLE_LIMIT
    ? `<button class="favorites-view-all" type="button" data-favorites-view-all>${favoritesExpanded ? "Show less" : `View all (${favorites.length})`}</button>`
    : "";

  list.innerHTML = rows + toggle;

  list.querySelectorAll(".favorite-button").forEach((button) => {
    const site = favorites.find((item) => item.url === button.dataset.siteUrl);
    if (!site) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(site);
      document.dispatchEvent(new CustomEvent("webshelf-favorites-changed"));
    });
  });

  list.querySelector("[data-favorites-view-all]")?.addEventListener("click", () => {
    favoritesExpanded = !favoritesExpanded;
    renderFavorites();
  });

  document.dispatchEvent(new CustomEvent("webshelf-sites-rendered"));
}

function syncFavoriteButtons() {
  document.querySelectorAll(".favorite-button[data-site-url]").forEach((button) => {
    updateFavoriteButton(button, isFavorite(button.dataset.siteUrl));
  });
}

async function clearFavorites() {
  const favorites = getFavorites();
  if (!favorites.length) return;

  const confirmed = window.WebShelfDialog
    ? await window.WebShelfDialog.confirm({
        title: "Clear favorites?",
        message: "This removes every saved favorite from this browser.",
        confirmText: "Clear favorites",
        danger: true
      })
    : true;

  if (!confirmed) return;

  WebShelfRuntime.storage.removeItem(FAVORITES_KEY);
  favoritesExpanded = false;
  document.dispatchEvent(new CustomEvent("webshelf-favorites-changed"));
}

document.addEventListener("webshelf-favorites-changed", () => {
  renderFavorites();
  syncFavoriteButtons();
});

function initializeFavorites() {
  renderFavorites();
  syncFavoriteButtons();
  document.querySelector("#favorites-clear")?.addEventListener("click", clearFavorites);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFavorites);
} else {
  initializeFavorites();
}
