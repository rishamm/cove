/* Loads site content from Supabase, falling back to js/content.js */
(function () {
  const cfg = window.COVE_CONFIG || {};
  const fallback = () => JSON.parse(JSON.stringify(window.COVE_DEFAULT));

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }

  async function fromSupabase() {
    if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
    const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const [s, p] = await Promise.all([
      db.from('settings').select('data').eq('id', 1).maybeSingle(),
      db.from('projects').select('*').order('sort', { ascending: true })
    ]);
    if (s.error) throw s.error;
    if (p.error) throw p.error;
    const def = fallback();
    return {
      settings: deepMerge(def.settings, (s.data && s.data.data) || {}),
      projects: p.data && p.data.length ? p.data : def.projects
    };
  }

  function deepMerge(a, b) {
    if (Array.isArray(b)) return b;
    if (b && typeof b === 'object') {
      const out = Object.assign({}, a);
      for (const k in b) out[k] = deepMerge(a ? a[k] : undefined, b[k]);
      return out;
    }
    return b === undefined ? a : b;
  }

  window.COVE_LOAD = async function () {
    if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      try {
        return await Promise.race([
          fromSupabase(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
        ]);
      } catch (e) { console.warn('[COVE] Supabase unavailable, using default content.', e); }
    }
    return fallback();
  };
})();
