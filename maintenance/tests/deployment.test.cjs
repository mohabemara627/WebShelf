const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const L = require('../lib.cjs');
const H = require('../html-checks.cjs');
const { exportSite } = require('../export.cjs');
const { build } = require('../build.cjs');

function fixture(t, full = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'webshelf-deployment-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  if (full) {
    const files = [...L.publicFiles(L.ROOT), ...L.walk(path.join(L.ROOT, 'maintenance'))
      .filter(file => !file.startsWith('node_modules/') && !file.startsWith('.'))
      .map(file => 'maintenance/' + file)];
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.copyFileSync(path.join(L.ROOT, file), path.join(root, file));
    }
  }
  return root;
}

function put(root, file, content = 'fixture') {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}

test('production allowlist excludes root backups, reports, unknown code and hidden image folders', t => {
  const root = fixture(t);
  const approved = ['index.html', 'style.css', 'common.js', 'vercel.json', 'images/icons/logo.png'];
  const privateFiles = ['private-backup.zip', 'notes.txt', 'credentials.json', '.env', 'README.md',
    'debug.js', 'private.html', 'maintenance/catalog.json', 'images/report.json',
    'images/backup.zip', 'images/.private/secret.png'];
  for (const file of [...approved, ...privateFiles]) put(root, file);
  assert.deepEqual(L.publicFiles(root), approved.sort());
});

test('production allowlist does not follow directory symlinks', t => {
  const root = fixture(t);
  const outside = fixture(t);
  put(outside, 'secret.png');
  fs.mkdirSync(path.join(root, 'images'));
  fs.symlinkSync(outside, path.join(root, 'images', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.deepEqual(L.publicFiles(root), []);
});

test('export preserves public bytes, excludes private files and refuses to overwrite an existing export', t => {
  const root = fixture(t, true);
  put(root, 'backup.zip');
  put(root, 'credentials.json');
  const target = exportSite(root);
  assert.deepEqual(L.walk(target).sort(), L.publicFiles(root));
  for (const file of L.publicFiles(root)) {
    assert.deepEqual(fs.readFileSync(path.join(target, file)), fs.readFileSync(path.join(root, file)), file);
  }
  assert.equal(fs.existsSync(path.join(target, 'backup.zip')), false);
  assert.equal(fs.existsSync(path.join(target, 'maintenance')), false);
  assert.throws(() => exportSite(root), /already exists/);
  assert.equal(fs.readdirSync(root).some(file => file.startsWith('.webshelf-export-')), false);
});

test('export rejects stale output before creating a deployment directory', t => {
  const root = fixture(t, true);
  fs.appendFileSync(path.join(root, 'data.js'), '\n// stale\n');
  assert.throws(() => exportSite(root), /stale/);
  assert.equal(fs.existsSync(path.join(root, 'public')), false);
  build(root);
  assert.ok(fs.existsSync(exportSite(root)));
});

test('bundle generation is stable across Windows and Unix source line endings', t => {
  const root = fixture(t, true);
  build(root);
  const before = fs.readFileSync(path.join(root, 'common.js'));
  const workerBefore = fs.readFileSync(path.join(root, 'service-worker.js'));
  const file = path.join(root, 'maintenance/src/theme.js');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\r?\n/g, '\r\n'));
  build(root);
  assert.deepEqual(fs.readFileSync(path.join(root, 'common.js')), before);
  assert.deepEqual(fs.readFileSync(path.join(root, 'service-worker.js')), workerBefore);
});

test('HTML script checks detect duplicates regardless of attribute order', () => {
  const html = fs.readFileSync(path.join(L.ROOT, 'index.html'), 'utf8');
  assert.deepEqual(H.checkScripts(html, 'index.html'), []);
  const duplicate = html.replace('</body>', '<script defer src="/_vercel/insights/script.js"></script></body>');
  assert.ok(H.checkScripts(duplicate, 'index.html').some(error => /Duplicate/.test(error)));
  const reordered = html.replace('<script src="./data.js">', '<script type="text/javascript" src="./data.js">');
  assert.deepEqual(H.checkScripts(reordered, 'index.html'), []);
});

test('nested 404 assets and recovery links resolve at the root while skip links stay on the error page', () => {
  const html = fs.readFileSync(path.join(L.ROOT, '404.html'), 'utf8');
  assert.deepEqual(H.checkErrorPaths(html), []);
  const nested = 'https://www.webshelf.link/missing/deep/page';
  for (const node of H.elements(html)) {
    const attrs = H.attributes(node);
    for (const value of [attrs.src, attrs.href].filter(Boolean)) {
      const url = new URL(value, nested);
      if (value.startsWith('#')) assert.equal(url.pathname, '/missing/deep/page');
      else if (value.startsWith('/')) assert.ok(!url.pathname.startsWith('/missing/'), value);
    }
  }
  assert.ok(H.checkErrorPaths(html.replace('href="/style.css"', 'href="./style.css"')).length);
});

test('PWA registration resolves relative to the bundle, including nested errors and subdirectory hosting', () => {
  const code = fs.readFileSync(path.join(L.ROOT, 'maintenance/src/pwa.js'), 'utf8');
  for (const prefix of ['/', '/webshelf/']) {
    let registered;
    const events = {};
    const base = 'https://example.com' + prefix;
    vm.runInNewContext(code, {
      URL,
      location: { protocol: 'https:' },
      navigator: { serviceWorker: { register(url) { registered = url; return Promise.resolve(); } } },
      window: { addEventListener(name, listener) { events[name] = listener; } },
      document: { currentScript: { src: base + 'common.js' }, baseURI: base + 'missing/deep/page', querySelector() { return null; } }
    });
    events.load();
    assert.equal(registered, base + 'service-worker.js');
  }
});
