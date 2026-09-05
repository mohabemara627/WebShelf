const { parse } = require('parse5');

function elements(html) {
  const result = [];
  function visit(node) {
    if (node.tagName) result.push(node);
    for (const child of node.childNodes || []) visit(child);
  }
  visit(parse(html));
  return result;
}

function attributes(node) {
  return Object.fromEntries((node.attrs || []).map(attr => [attr.name, attr.value]));
}

function checkScripts(html, page) {
  const errors = [];
  const scripts = elements(html).filter(node => node.tagName === 'script');
  const base = new URL(page, 'https://webshelf.invalid/');
  const sources = scripts.map(attributes).filter(attrs => attrs.src).map(attrs => new URL(attrs.src, base).href);
  if (new Set(sources).size !== sources.length) errors.push('Duplicate external script URL');
  const expected = ['data.js', 'common.js'];
  if (page !== '404.html') expected.push(page.replace(/\.html$/, '.bundle.js'));
  expected.push('/_vercel/insights/script.js');
  if (JSON.stringify(sources) !== JSON.stringify(expected.map(src => new URL(src, base).href))) {
    errors.push('Incorrect script dependencies or load order');
  }
  const bootstraps = scripts.filter(node => (node.childNodes || []).some(child => /window\.va\s*=/.test(child.value || '')));
  if (bootstraps.length !== 1) errors.push('Expected one analytics bootstrap');
  return errors;
}

function checkErrorPaths(html) {
  const errors = [];
  for (const node of elements(html)) {
    const attrs = attributes(node);
    // A base element would also redirect the fragment-only skip link away from this document.
    if (node.tagName === 'base') errors.push('404 must not override fragment navigation with a base element');
    for (const key of ['src', 'href']) {
      const value = attrs[key];
      if (value && !/^(?:\/|#|[a-z][\w+.-]*:)/i.test(value)) errors.push('404 requires a root-relative ' + key + ': ' + value);
    }
  }
  return errors;
}

module.exports = { elements, attributes, checkScripts, checkErrorPaths };
