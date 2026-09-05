#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');

const L = require('./lib.cjs');
const I = require('./image.cjs');
const { parse } = require('parse5');
const { SaxesParser } = require('saxes');

function references(root) {
  const refs = new Set();
  const missing = [];

  const add = (value, file) => {
    if (!value || /^(?:[a-z][\w+.-]*:|\/\/|#|data:)/i.test(value)) return;

    let rel;

    try {
      rel = decodeURIComponent(value.split(/[?#]/)[0]);
    } catch {
      missing.push(file + ': malformed path ' + value);
      return;
    }

    if (!rel) return;

    rel = path.posix.normalize(
      rel.startsWith('/')
        ? rel.slice(1)
        : path.posix.join(path.posix.dirname(file), rel)
    );

    if (rel === '.') rel = 'index.html';

    if (rel.startsWith('../')) {
      missing.push(file + ': path escapes project ' + value);
      return;
    }

    refs.add(rel);

    if (!L.exactPath(root, rel)) {
      missing.push(file + ': missing or case-mismatched ' + rel);
    }
  };

  for (
    const file of L.publicFiles(root).filter(
      f => /\.(html|css|js|webmanifest|xml)$/.test(f)
    )
  ) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');

    if (file.endsWith('.html')) {
      const visit = n => {
        const a = Object.fromEntries(
          (n.attrs || []).map(a => [a.name, a.value])
        );

        for (const key of ['src', 'href', 'poster']) {
          if (a[key]) add(a[key], file);
        }

        if (a.srcset) {
          for (const s of a.srcset.split(',')) {
            add(s.trim().split(/\s+/)[0], file);
          }
        }

        for (const child of n.childNodes || []) {
          visit(child);
        }
      };

      visit(parse(text));
    }

    for (
      const m of text.matchAll(
        /(?:\.\/)?images\/[^\s"'`<>),;]+/g
      )
    ) {
      add(m[0], file);
    }

    if (file.endsWith('.css')) {
      for (
        const m of text.matchAll(
          /url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g
        )
      ) {
        add(m[1], file);
      }
    }
  }

  return { refs, missing };
}

function validate(root = L.ROOT, { quiet = false, git = true } = {}) {
  const errors = [];
  const warnings = [];
  const checks = [];

  let catalog;

  const check = (label, fn) => {
    try {
      fn();
      checks.push(label);
    } catch (e) {
      errors.push(label + ': ' + e.message);
    }
  };

  check('Catalog source', () => {
    catalog = L.readCatalog(root);
    const e = L.checkCatalog(catalog);

    if (e.length) {
      throw Error(e.join('; '));
    }
  });

  check('Filesystem icon directory casing: images/icons', () => {
    if (!L.exactPath(root, 'images/icons')) {
      throw Error('Must be exactly images/icons');
    }

    for (const p of L.walk(root, 'images')) {
      if (
        /^icons\//i.test(p.replace(/^images\//, '')) &&
        !p.startsWith('images/icons/')
      ) {
        throw Error(p);
      }
    }
  });

  for (
    const file of [
      'index.html',
      'category.html',
      'activity.html',
      'support.html',
      'suggest.html',
      'collection.html',
      'style.css',
      'data.js',
      'service-worker.js',
      'sitemap.xml',
      'manifest.webmanifest',
      ...Object.keys(L.pages).map(L.fileFor)
    ]
  ) {
    check(file, () => {
      if (!L.exactPath(root, file)) {
        throw Error('Missing production file');
      }
    });
  }

  if (catalog) {
    check(
      'Catalog icons: existence, exact paths, signatures and SVG safety',
      () => {
        const issues = [];

        for (const { site } of L.flatten(catalog)) {
          if (!site.icon) continue;

          const p = site.icon.replace(/^\.\//, '');

          try {
            if (
              !p.startsWith('images/icons/') ||
              p.includes('..') ||
              !L.exactPath(root, p)
            ) {
              throw Error(
                'Invalid, missing or case-mismatched icon path'
              );
            }

            const image = I.inspect(
              fs.readFileSync(path.join(root, p))
            );

            if (!I.matches(p, image.type)) {
              throw Error(
                'Extension differs from actual ' + image.type
              );
            }
          } catch (e) {
            issues.push(site.name + ': ' + p + ': ' + e.message);
          }
        }

        if (issues.length) {
          throw Error(issues.join('; '));
        }
      }
    );
  }

  const { refs, missing } = references(root);

  errors.push(...missing);

  if (catalog) {
    for (const { site } of L.flatten(catalog)) {
      if (site.icon) {
        refs.add(site.icon.replace(/^\.\//, ''));
      }
    }
  }

  const orphans = fs.existsSync(path.join(root, 'images/icons'))
    ? L.walk(root, 'images/icons').filter(f => !refs.has(f))
    : [];

  if (orphans.length) {
    warnings.push(
      'Orphan candidates (not removed): ' + orphans.join(', ')
    );
  }

  const codeFiles = [
    ...L.publicFiles(root).filter(f => f.endsWith('.js')),

    ...L.walk(path.join(root, 'maintenance'))
      .filter(
        f =>
          !f.startsWith('node_modules/') &&
          !f.startsWith('.') &&
          /\.(cjs|js)$/.test(f)
      )
      .map(f => 'maintenance/' + f)
  ];

  check('JavaScript syntax', () => {
    for (const file of codeFiles) {
      new vm.Script(
        fs.readFileSync(path.join(root, file), 'utf8'),
        { filename: file }
      );
    }

    for (
      const file of L.publicFiles(root).filter(
        f => f.endsWith('.html')
      )
    ) {
      const text = fs.readFileSync(
        path.join(root, file),
        'utf8'
      );

      for (
        const m of text.matchAll(
          /<script\b([^>]*)>([\s\S]*?)<\/script>/g
        )
      ) {
        const attrs = m[1] || '';
        const code = m[2];

        if (
          /\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs) ||
          !code.trim()
        ) {
          continue;
        }

        new vm.Script(code, { filename: file });
      }
    }
  });

  check(
    'Generated catalog, bundles and service worker match source',
    () => {
      for (
        const [file, text] of Object.entries(
          require('./build.cjs').outputs(root)
        )
      ) {
        if (
          !fs.existsSync(path.join(root, file)) ||
          fs.readFileSync(path.join(root, file), 'utf8') !== text
        ) {
          throw Error(
            file +
              ' is stale; run node maintenance/build.cjs'
          );
        }
      }
    }
  );

  check('HTML theme bootstrap order', () => {
    for (
      const page of Object.keys(L.pages).filter(
        p => p !== 'common'
      )
    ) {
      const text = fs.readFileSync(
        path.join(root, page + '.html'),
        'utf8'
      );

      const charset = text.indexOf(
        '<meta charset="UTF-8">'
      );

      const bootstrap = text.indexOf(
        '<script id="theme-bootstrap">'
      );

      if (
        charset < 0 ||
        bootstrap < charset ||
        bootstrap > text.indexOf('style.css')
      ) {
        throw Error(page + ': wrong head order');
      }
    }
  });

  check('Service worker CORE', () => {
    const worker = fs.readFileSync(
      path.join(root, 'service-worker.js'),
      'utf8'
    );

    const core = JSON.parse(
      worker.match(/const CORE = (\[[\s\S]*?\]);/)[1]
    );

    for (const file of core) {
      if (
        file !== './' &&
        !L.exactPath(root, file)
      ) {
        throw Error('Missing ' + file);
      }
    }
  });

  check(
    'Manifest, start_url, scope, icon dimensions/types',
    () => {
      const manifest = JSON.parse(
        fs.readFileSync(
          path.join(root, 'manifest.webmanifest'),
          'utf8'
        )
      );

      const base =
        'https://www.webshelf.link/';

      const start = new URL(
        manifest.start_url,
        base
      );

      const scope = new URL(
        manifest.scope,
        base
      );

      if (
        start.origin !== base.slice(0, -1) ||
        scope.origin !== start.origin ||
        !start.pathname.startsWith(scope.pathname) ||
        !L.exactPath(
          root,
          start.pathname.slice(1) || 'index.html'
        ) ||
        !L.exactPath(
          root,
          scope.pathname.slice(1) || '.'
        )
      ) {
        throw Error(
          'Invalid manifest start_url/scope'
        );
      }

      for (const icon of manifest.icons) {
        const p = icon.src.replace(/^\.\//, '');

        if (!L.exactPath(root, p)) {
          throw Error(
            'Missing manifest icon ' + p
          );
        }

        const image = I.inspect(
          fs.readFileSync(path.join(root, p))
        );

        if (
          image.mime !== icon.type ||
          icon.sizes !==
            image.width + 'x' + image.height ||
          !I.matches(p, image.type)
        ) {
          throw Error(
            'Manifest dimensions/type mismatch ' + p
          );
        }
      }
    }
  );

  check(
    'Sitemap XML and exact category keys',
    () => {
      const text = fs.readFileSync(
        path.join(root, 'sitemap.xml'),
        'utf8'
      );

      const parsed = I.xml(text);

      if (
        parsed.root.local !== 'urlset' ||
        parsed.root.uri !==
          'http://www.sitemaps.org/schemas/sitemap/0.9'
      ) {
        throw Error(
          'Invalid sitemap namespace/root'
        );
      }

      const locs = [];
      let loc = false;

      const parser = new SaxesParser();

      parser.on('opentag', t => {
        loc = t.name === 'loc';
      });

      parser.on('text', t => {
        if (loc) locs.push(t);
      });

      parser.on('closetag', () => {
        loc = false;
      });

      parser.write(text).close();

      const cats = [];

      for (const str of locs) {
        const u = new URL(str);

        if (
          u.origin !==
          'https://www.webshelf.link'
        ) {
          throw Error(
            'External URL in sitemap: ' + str
          );
        }

        if (
          !L.exactPath(
            root,
            u.pathname.slice(1) || 'index.html'
          )
        ) {
          throw Error(
            'Missing sitemap page ' + u.pathname
          );
        }

        if (
          u.pathname === '/category.html'
        ) {
          cats.push(
            u.searchParams.get('type')
          );
        }
      }

      if (
        new Set(locs).size !== locs.length ||
        JSON.stringify(cats.sort()) !==
          JSON.stringify(
            catalog.map(c => c.key).sort()
          )
      ) {
        throw Error(
          'Sitemap categories do not match catalog keys'
        );
      }
    }
  );

  if (git) {
    try {
      const top = cp.execFileSync(
        'git',
        ['rev-parse', '--show-toplevel'],
        {
          cwd: root,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore']
        }
      ).trim();

      const prefix = path
        .relative(
          fs.realpathSync.native(top),
          fs.realpathSync.native(root)
        )
        .replaceAll('\\', '/');

      const tracked = cp
        .execFileSync(
          'git',
          ['ls-files', '-z'],
          {
            cwd: top,
            encoding: 'utf8'
          }
        )
        .split('\0')
        .filter(Boolean)
        .filter(
          p =>
            !prefix ||
            p.startsWith(prefix + '/')
        )
        .map(
          p =>
            prefix
              ? p.slice(prefix.length + 1)
              : p
        );

      if (!tracked.length) {
        checks.push(
          'Git tracked paths: skipped (project not tracked)'
        );
      } else {
        for (const p of tracked) {
          if (
            /^images\/icons\//i.test(p) &&
            !p.startsWith('images/icons/')
          ) {
            errors.push(
              'Git tracks incorrect icon casing: ' +
                p
            );
          }

          if (
            !p.startsWith('maintenance/') &&
            !L.exactPath(root, p)
          ) {
            errors.push(
              'Git tracked path missing/case mismatch: ' +
                p
            );
          }
        }

        checks.push(
          'Git tracked icon directory casing: images/icons (checked)'
        );
      }
    } catch {
      checks.push(
        'Git tracked paths: skipped (Git unavailable or not a repository)'
      );
    }
  }

  if (!quiet) {
    console.log('\nWebShelf Validation');

    if (catalog) {
      console.log(
        'Catalog: ' +
          L.flatten(catalog).length +
          ' sites; Categories: ' +
          catalog.length
      );
    }

    for (const s of checks) {
      console.log('✓ ' + s);
    }

    for (const s of warnings) {
      console.log('Warning: ' + s);
    }

    for (const s of errors) {
      console.error('✗ ' + s);
    }

    console.log(
      errors.length
        ? 'Validation FAILED (' +
            errors.length +
            ' errors).'
        : 'Validation passed.'
    );
  }

  return {
    errors,
    warnings,
    checks,
    orphans
  };
}

if (require.main === module) {
  try {
    if (validate().errors.length) {
      process.exitCode = 1;
    }
  } catch (e) {
    console.error(
      'Validation failed: ' + e.message
    );

    process.exitCode = 1;
  }
}

module.exports = {
  validate,
  references
};