// Rebuild sitemap.xml from the catalog snapshot embedded in data.js.
// The file is parsed as data; it is not executed.

const fs = require("fs");
const path = require("path");

const root = __dirname;
const dataPath = path.join(root, "data.js");
const sitemapPath = path.join(root, "sitemap.xml");
const source = fs.readFileSync(dataPath, "utf8");

const startMarker = "WEBSHELF_CATALOG_JSON_START";
const endMarker = "WEBSHELF_CATALOG_JSON_END";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);

if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not find the WebShelf catalog snapshot in data.js");
}

const jsonText = source.slice(start + startMarker.length, end).trim();
const categories = JSON.parse(jsonText);
if (!Array.isArray(categories)) throw new Error("Catalog snapshot is not an array");

const collections = new Set();
categories.forEach((category) => {
  (Array.isArray(category.sites) ? category.sites : []).forEach((site) => {
    (Array.isArray(site.collections) ? site.collections : []).forEach((name) => {
      if (String(name || "").trim()) collections.add(String(name).trim());
    });
  });
});

const base = "https://www.webshelf.link/";
const urls = [
  base,
  ...categories.map((category) => `${base}category.html?type=${encodeURIComponent(category.key)}`),
  ...[...collections].sort((a, b) => a.localeCompare(b)).map((name) => `${base}collection.html?type=${encodeURIComponent(name)}`),
  `${base}suggest.html`,
  `${base}support.html`
];

const xmlEscape = (value) => String(value).replace(/&/g, "&amp;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n${urls
  .map((url) => `  <url>\n    <loc>${xmlEscape(url)}</loc>\n  </url>`)
  .join("\n\n")}\n\n</urlset>\n`;

fs.writeFileSync(sitemapPath, xml, "utf8");
console.log(`sitemap.xml updated: ${urls.length} URLs`);
