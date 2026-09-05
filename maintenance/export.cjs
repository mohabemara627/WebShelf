#!/usr/bin/env node
// Dependency-free static export. Full validation still runs separately in CI.
const fs = require('node:fs');
const path = require('node:path');
const L = require('./lib.cjs');
const { outputs } = require('./build.cjs');

function exportSite(root = L.ROOT) {
  const target = path.join(root, 'public');
  if (fs.lstatSync(target, { throwIfNoEntry: false })) {
    throw Error('public already exists; remove/move the previous export before exporting again.');
  }
  // Never publish catalog/source changes with stale generated assets.
  for (const [file, expected] of Object.entries(outputs(root))) {
    if (!fs.existsSync(path.join(root, file)) || fs.readFileSync(path.join(root, file), 'utf8') !== expected) {
      throw Error(file + ' is stale; run node maintenance/build.cjs before exporting.');
    }
  }
  const staging = fs.mkdtempSync(path.join(root, '.webshelf-export-'));
  try {
    for (const file of L.publicFiles(root)) {
      const out = path.join(staging, file);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.copyFileSync(path.join(root, file), out);
    }
    fs.renameSync(staging, target);
    return target;
  } finally {
    // A failed copy must never leave a half-built public directory.
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    exportSite();
    console.log('Production-only export: public/');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { exportSite };
