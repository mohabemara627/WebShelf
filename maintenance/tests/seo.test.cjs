const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../lib.cjs');
const H = require('../html-checks.cjs');
const read = file => fs.readFileSync(path.join(L.ROOT, file), 'utf8');

function categoryEnvironment(search, categories = L.readCatalog()) {
  function element(attrs = {}) {
    return { attrs, content: attrs.content || '', style: {}, dataset: {}, removed: false,
      setAttribute(key, value) { this.attrs[key] = value; },
      getAttribute(key) { return this.attrs[key] ?? null; },
      remove() { this.removed = true; },
      contains() { return false; }, querySelectorAll() { return []; }, addEventListener() {} };
  }
  const description = element({ name: 'description', content: 'Generic category description' });
  const canonical = element({ rel: 'canonical' });
  // Include stale metadata to verify invalid states actively remove it.
  const metas = [description, element({ property: 'og:title', content: 'Old title' }), element({ name: 'twitter:title', content: 'Old title' })];
  const nodes = Object.fromEntries(['category-page-title', 'category-page-count', 'category-page-list', 'category-page-icon', 'category-page-lucide', 'category-page-description', 'category-site-filters'].map(id => ['#' + id, element()]));
  nodes['#category-description'] = description;
  nodes['#category-canonical'] = canonical;
  const head = {
    querySelector(selector) {
      const [, attr, key] = selector.match(/^meta\[(name|property)="([^"]+)"\]$/);
      return metas.find(meta => !meta.removed && meta.attrs[attr] === key) || null;
    },
    querySelectorAll() { return metas.filter(meta => !meta.removed && (meta.attrs.property?.startsWith('og:') || meta.attrs.name?.startsWith('twitter:'))); },
    appendChild(meta) { metas.push(meta); }
  };
  const document = { head, activeElement: null, createElement: () => element(), querySelector: selector => nodes[selector] || null, addEventListener() {}, dispatchEvent() {} };
  const context = vm.createContext({ document, window: { location: { search } }, URLSearchParams, WebShelfCategories: categories, console, CustomEvent: class {}, updateFavoriteButton() {}, isFavorite() { return false; } });
  vm.runInContext(read('maintenance/src/catalog-helpers.js'), context);
  vm.runInContext(read('maintenance/src/category.js'), context);
  return { document, canonical, description, metas, context, meta: (key, attr = 'name') => head.querySelector(`meta[${attr}="${key}"]`)?.content };
}

for (const category of L.readCatalog()) test('category sharing metadata reuses CATEGORY_SEO: ' + category.key, () => {
  const e = categoryEnvironment('?type=' + encodeURIComponent(category.key) + '&utm_source=test');
  const seo = vm.runInContext(`CATEGORY_SEO[${JSON.stringify(category.key)}]`, e.context);
  assert.equal(e.document.title, seo.title);
  assert.equal(e.description.content, seo.description);
  assert.equal(e.meta('robots'), 'index,follow');
  assert.equal(e.canonical.href, 'https://www.webshelf.link/category.html?type=' + encodeURIComponent(category.key));
  assert.equal(e.meta('og:title', 'property'), seo.title);
  assert.equal(e.meta('og:description', 'property'), seo.description);
  assert.equal(e.meta('og:url', 'property'), e.canonical.href);
  assert.equal(e.meta('twitter:title'), seo.title);
  assert.equal(e.meta('twitter:description'), seo.description);
  assert.equal(e.metas.filter(meta => !meta.removed && meta.attrs.property === 'og:title').length, 1);
});

for (const search of ['', '?type=', '?type=missing', '?type=TV-streaming', '?type=%22%3E%3Cscript%3Ealert(1)%3C/script%3E']) {
  test('invalid category is noindex without canonical or stale sharing metadata: ' + search, () => {
    const e = categoryEnvironment(search);
    assert.equal(e.meta('robots'), 'noindex,follow');
    assert.equal(e.canonical.removed, true);
    assert.equal(e.description.removed, true);
    assert.equal(e.document.title, 'Category Not Found - WebShelf');
    assert.equal(e.meta('og:title', 'property'), undefined);
    assert.equal(e.meta('twitter:title'), undefined);
    assert.equal(e.meta('og:url', 'property'), undefined);
  });
}

test('new valid categories use one consistent metadata fallback', () => {
  const e = categoryEnvironment('?type=new-category', [{ key: 'new-category', title: 'New & useful', sites: [] }]);
  assert.equal(e.document.title, 'New & useful - WebShelf');
  assert.equal(e.meta('og:title', 'property'), e.document.title);
  assert.equal(e.meta('twitter:description'), e.description.content);
  assert.equal(e.meta('robots'), 'index,follow');
});

test('collection and 404 have static noindex,follow; the 404 has no canonical', () => {
  for (const file of ['collection.html', '404.html']) {
    const nodes = H.elements(read(file));
    const robots = nodes.filter(n => n.tagName === 'meta' && H.attributes(n).name === 'robots');
    assert.equal(robots.length, 1, file);
    assert.equal(H.attributes(robots[0]).content, 'noindex,follow', file);
    if (file === '404.html') assert.equal(nodes.some(n => H.attributes(n).rel === 'canonical'), false);
  }
  // A static noindex would prevent some crawlers from rendering valid categories.
  const robots = H.elements(read('category.html')).filter(n => H.attributes(n).name === 'robots');
  assert.ok(robots.every(n => !H.attributes(n).content?.includes('noindex')));
});

test('category ordering is declared once per breakpoint, without a late override', () => {
  const css = read('style.css');
  const section = css.slice(css.indexOf('/* CATEGORY GRID + RESPONSIVE ORDER'), css.indexOf('/* CATEGORY CARD */'));
  assert.equal((css.match(/\.category-grid\s*\{/g) || []).length, 5);
  assert.equal((section.match(/\.category-grid\s*\{/g) || []).length, 5);
  assert.equal((css.match(/\.category\[data-category-key=/g) || []).length, 24);
  assert.equal((section.match(/\.category\[data-category-key=/g) || []).length, 24);
  assert.ok(!css.includes('FINAL DESKTOP CATEGORY ORDER'));
});
