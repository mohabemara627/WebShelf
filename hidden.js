// ==================================================
// PERSONAL HIDDEN / NOT INTERESTED SITES
// ==================================================

const HIDDEN_SITES_KEY = "webshelf-hidden-sites";

function getHiddenSites() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_SITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHiddenSites(urls) {
  localStorage.setItem(
    HIDDEN_SITES_KEY,
    JSON.stringify([...new Set(urls.filter(Boolean))])
  );
}

function isSiteHidden(url) {
  return getHiddenSites().includes(url);
}

function updateHiddenUI() {
  const count = getHiddenSites().length;

  document.querySelectorAll("[data-hidden-count]").forEach((element) => {
    element.textContent = String(count);
  });

  document.querySelectorAll(".hidden-sites-link").forEach((element) => {
    element.hidden = count === 0;
  });

  const hiddenTab = document.querySelector("#hidden-sites-tab");
  if (hiddenTab) hiddenTab.hidden = count === 0;

  if (count === 0 && location.hash === "#hidden") {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function setSiteHidden(url, hidden = true) {
  const urls = getHiddenSites();
  const next = hidden
    ? [...urls, url]
    : urls.filter((item) => item !== url);

  saveHiddenSites(next);
  updateHiddenUI();

  document.dispatchEvent(
    new CustomEvent("webshelf-hidden-changed", {
      detail: { url, hidden }
    })
  );
}

function toggleSiteHidden(url) {
  const hidden = !isSiteHidden(url);
  setSiteHidden(url, hidden);
  return hidden;
}

function filterVisibleSites(sites) {
  return (Array.isArray(sites) ? sites : []).filter(
    (site) => !isSiteHidden(site.url)
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateHiddenUI);
} else {
  updateHiddenUI();
}

document.addEventListener("webshelf-hidden-changed", updateHiddenUI);
