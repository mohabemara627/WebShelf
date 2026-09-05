// Flat list used by search/preview/activity helpers.
const WebShelfSites = WebShelfCategories.flatMap((category) =>
  category.sites.map((site) => ({
    ...site,
    category: category.title,
    categoryKey: category.key,
    group: category.group || "Other"
  }))
);

function getSiteBadges(site) {
  return Array.isArray(site?.badges)
    ? site.badges.filter(Boolean).map(String)
    : [];
}

function siteHasBadge(site, badge) {
  const wanted = String(badge || "").trim().toLowerCase();
  return getSiteBadges(site).some(
    (value) => value.trim().toLowerCase() === wanted
  );
}

function getSiteDomain(site) {
  try {
    return new URL(site?.url || "").hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function escapeWebShelfText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSiteBadges(site, options = {}) {
  const badges = getSiteBadges(site);
  const interactive = options.interactive !== false;

  if (badges.length === 0) return "";

  return `
    <span class="site-badges" aria-label="Site badges">
      ${badges.map((badge) => {
        const value = String(badge);
        const safeValue = escapeWebShelfText(value);
        const className = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const interactiveAttributes = interactive
          ? `data-badge-filter="${safeValue}" role="button" tabindex="0" title="Filter by ${safeValue}"`
          : `aria-label="${safeValue}"`;

        return `<span class="site-badge site-badge--${className}" ${interactiveAttributes}>${safeValue}</span>`;
      }).join("")}
    </span>
  `;
}
