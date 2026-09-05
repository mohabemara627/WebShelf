// Shared data boundaries. No markup or layout changes.
(() => {
  const temporary = new Map();
  let warned = false;
  function warn() {
    if (!warned) console.warn('WebShelf: browser storage is unavailable. Changes in this page may not survive a reload.');
    warned = true;
  }
  const storage = {
    getItem(key) {
      if (temporary.has(key)) return temporary.get(key);
      try { return localStorage.getItem(key); } catch { warn(); return null; }
    },
    setItem(key, value) {
      const text = String(value);
      try { localStorage.setItem(key, text); temporary.delete(key); }
      catch { temporary.set(key, text); warn(); }
    },
    removeItem(key) {
      try { localStorage.removeItem(key); temporary.delete(key); }
      catch { temporary.set(key, null); warn(); }
    }
  };
  function safeUrl(value, relative = false) {
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u0020\u007f\\]/.test(value)) return '';
    try {
      const base = location.href.startsWith('file:') ? 'https://webshelf.invalid/' : location.href;
      const parsed = relative ? new URL(value, base) : new URL(value);
      if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) return '';
      return value;
    } catch { return ''; }
  }
  const catalog = new Map(WebShelfSites.map(site => [site.url, site]));
  const memo = new Map();
  function savedSites(key) {
    const raw = storage.getItem(key);
    const cached = memo.get(key);
    if (cached?.raw === raw) return cached.sites.map(site => ({...site}));
    let source;
    try { source = JSON.parse(raw || '[]'); } catch { source = []; }
    const seen = new Set();
    const sites = (Array.isArray(source) ? source : []).filter(site => {
      if (!site || typeof site !== 'object' || !safeUrl(site.url) || typeof site.name !== 'string' || !site.name.trim() || seen.has(site.url)) return false;
      seen.add(site.url); return true;
    }).map(site => {
      const current = catalog.get(site.url);
      // Retain history, but use current catalog metadata for known sites.
      return {...site, ...current, name: current?.name || site.name, icon: safeUrl(current?.icon || site.icon, true), badges: current?.badges || (Array.isArray(site.badges) ? site.badges.filter(b => typeof b === 'string') : [])};
    });
    memo.set(key, {raw, sites});
    return sites.map(site => ({...site}));
  }
  // Set inert without replacing nodes or changing visual styles.
  function modalBackground(overlay) {
    const saved = new Map();
    for (const node of document.body.children) {
      if (node === overlay || node.tagName === 'SCRIPT') continue;
      saved.set(node, node.inert); node.inert = true;
    }
    return () => { for (const [node, inert] of saved) node.inert = inert; };
  }
  function bindForm(form, status, button, messages) {
    if (!form || !status || !button) return;
    let pending = false;
    status.setAttribute('role', 'status');
    const fields = [...form.querySelectorAll('input[type="url"]')];
    const validate = () => {
      for (const field of fields) field.setCustomValidity(!field.value || safeUrl(field.value) ? '' : 'Enter a complete http:// or https:// website URL.');
    };
    for (const field of fields) field.addEventListener('input', validate);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending) return;
      validate();
      if (!form.reportValidity()) return;
      pending = true;
      const original = button.textContent;
      const body = new FormData(form);
      const fingerprint = data => JSON.stringify([...data.entries()]);
      const submitted = fingerprint(body);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      form.setAttribute('aria-busy', 'true');
      status.textContent = messages.sending;
      button.disabled = true; button.textContent = 'Sending...';
      try {
        const response = await fetch(form.action, {method:'POST', body, headers:{Accept:'application/json'}, signal:controller.signal});
        status.textContent = response.ok ? messages.success : 'Something went wrong. Please try again.';
        if (response.ok && fingerprint(new FormData(form)) === submitted) form.reset();
      } catch {
        // Never retry a POST automatically: the server may already have received it.
        status.textContent = messages.failure;
      } finally {
        clearTimeout(timeout); pending = false;
        form.removeAttribute('aria-busy'); button.disabled = false; button.textContent = original;
      }
    });
  }
  window.WebShelfRuntime = {storage, safeUrl, savedSites, modalBackground, bindForm};
  window.addEventListener('storage', event => {
    if (event.storageArea && event.storageArea !== localStorage) return;
    if (event.key === null) { temporary.clear(); memo.clear(); }
    else { temporary.delete(event.key); memo.delete(event.key); }
    const names = {'webshelf-favorites':'webshelf-favorites-changed', 'webshelf-recently-viewed':'webshelf-activity-changed', 'webshelf-hidden-sites':'webshelf-hidden-changed', 'webshelf-theme':'webshelf-theme-changed'};
    for (const [key,name] of Object.entries(names)) if (event.key === null || event.key === key) document.dispatchEvent(new CustomEvent(name));
  });
})();
