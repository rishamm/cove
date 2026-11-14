/* COVE admin — edits Supabase `settings` and `projects` */
(function () {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const cfg = window.COVE_CONFIG || {};
const BUCKET = cfg.STORAGE_BUCKET || 'photos';
const show = (id, on) => $(id).classList.toggle('hidden', !on);
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2400); };
const src = u => !u ? '' : /^(https?:|data:|blob:|\/)/.test(u) ? u : '../' + u;

if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { show('#setup', true); return; }
const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

/* ---------- auth ---------- */
async function boot() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { show('#login', true); show('#app', false); return; }
  const { data: ok } = await db.rpc('is_admin');
  if (!ok) { show('#login', true); $('#loginMsg').textContent = `${session.user.email} is not in the admins table.`; await db.auth.signOut(); return; }
  show('#login', false); show('#app', true);
  loadContent(); loadPhotos();
}
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginMsg').textContent = 'Signing in…';
  const { error } = await db.auth.signInWithPassword({ email: $('#le').value, password: $('#lp').value });
  if (error) { $('#loginMsg').textContent = error.message; return; }
  $('#loginMsg').textContent = ''; boot();
});
$('#logout').onclick = async () => { await db.auth.signOut(); location.reload(); };

/* ---------- tabs ---------- */
$$('[data-tab]').forEach(b => b.onclick = () => {
  $$('[data-tab]').forEach(x => x.classList.toggle('on', x === b));
  show('#tab-content', b.dataset.tab === 'content'); show('#tab-photos', b.dataset.tab === 'photos');
  show('#saveBar', b.dataset.tab === 'content');
});

/* ---------- content editor ---------- */
let S = null, dirty = false;
const LABELS = { loaderCaption: 'Loader caption', instagramUrl: 'Instagram link', portraitUrl: 'Portrait image', formEmail: 'Form sends to', formTitle: 'Form title' };
const nice = k => LABELS[k] || String(k).replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
function merge(a, b) {
  if (Array.isArray(b)) return b;
  if (b && typeof b === 'object') { const o = Object.assign({}, a); for (const k in b) o[k] = merge(a ? a[k] : undefined, b[k]); return o; }
  return b === undefined ? a : b;
}
function setDirty(v) { dirty = v; $('#saveState').textContent = v ? 'Unsaved changes' : 'All changes saved'; $('#saveState').style.color = v ? '#fff' : '#aaa'; }

async function loadContent() {
  const { data, error } = await db.from('settings').select('data').eq('id', 1).maybeSingle();
  if (error) toast(error.message);
  S = merge(JSON.parse(JSON.stringify(window.COVE_DEFAULT.settings)), (data && data.data) || {});
  renderEditor(); setDirty(false);
}
function renderEditor() {
  const root = $('#editor'); root.innerHTML = '';
  Object.keys(S).forEach(k => root.appendChild(node(S, k, 0)));
  $('#raw').value = JSON.stringify(S, null, 2);
}
function blank(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = blank(v[k]); return o; }
  return typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : '';
}
function node(parent, key, depth) {
  const v = parent[key];
  const change = () => { setDirty(true); $('#raw').value = JSON.stringify(S, null, 2); };
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const fs = document.createElement(depth === 0 ? 'fieldset' : 'div');
    if (depth === 0) { const lg = document.createElement('legend'); lg.textContent = nice(key); fs.appendChild(lg); }
    const wrap = document.createElement('div'); wrap.className = 'row2';
    Object.keys(v).forEach(k => wrap.appendChild(node(v, k, depth + 1)));
    fs.appendChild(wrap); return fs;
  }
  const f = document.createElement('div'); f.className = 'field';
  const lab = document.createElement('span'); lab.className = 'label'; lab.textContent = nice(key); f.appendChild(lab);
  if (Array.isArray(v)) {
    f.style.gridColumn = '1/-1';
    if (v.every(x => typeof x !== 'object')) {
      lab.textContent += ' — one per line';
      const ta = document.createElement('textarea'); ta.rows = Math.max(3, v.length); ta.value = v.join('\n');
      ta.oninput = () => { parent[key] = ta.value.split('\n').map(s => s.trim()).filter(Boolean); change(); };
      f.appendChild(ta); return f;
    }
    v.forEach((item, i) => {
      const it = document.createElement('div'); it.className = 'arr-item';
      const rm = document.createElement('button'); rm.className = 'rm'; rm.textContent = 'Remove ✕';
      rm.onclick = () => { v.splice(i, 1); change(); renderEditor(); };
      it.appendChild(rm);
      const g = document.createElement('div'); g.className = 'row2';
      Object.keys(item).forEach(k => g.appendChild(node(item, k, depth + 2)));
      it.appendChild(g); f.appendChild(it);
    });
    const add = document.createElement('button'); add.className = 'btn ghost'; add.textContent = '+ Add';
    add.onclick = () => { v.push(blank(v[0] || { name: '', meta: '' })); change(); renderEditor(); };
    f.appendChild(add); return f;
  }
  if (typeof v === 'number') {
    const i = document.createElement('input'); i.type = 'number'; i.value = v;
    i.oninput = () => { parent[key] = +i.value; change(); }; f.appendChild(i); return f;
  }
  if (typeof v === 'boolean') {
    const i = document.createElement('input'); i.type = 'checkbox'; i.checked = v;
    i.onchange = () => { parent[key] = i.checked; change(); }; f.appendChild(i); return f;
  }
  const str = String(v ?? '');
  const long = str.length > 70 || str.includes('\n') || /text|tagline|title/i.test(key);
  const i = document.createElement(long ? 'textarea' : 'input');
  if (!long) i.type = 'text'; else { i.rows = Math.min(6, Math.ceil(str.length / 60) + 1); f.style.gridColumn = '1/-1'; }
  i.value = str; i.oninput = () => { parent[key] = i.value; change(); }; f.appendChild(i);
  if (/Url$/.test(key) && /portrait|image/i.test(key)) {
    const up = document.createElement('input'); up.type = 'file'; up.accept = 'image/*'; up.style.marginTop = '6px';
    up.onchange = async () => { if (!up.files[0]) return; toast('Uploading…'); try { const r = await upload(up.files[0]); parent[key] = r.url; i.value = r.url; change(); toast('Uploaded'); } catch (e) { toast(e.message); } };
    f.appendChild(up);
  }
  return f;
}
$('#applyRaw').onclick = () => { try { S = JSON.parse($('#raw').value); renderEditor(); setDirty(true); toast('JSON applied — remember to save'); } catch (e) { toast('Invalid JSON: ' + e.message); } };
$('#saveContent').onclick = async () => {
  const { error } = await db.from('settings').upsert({ id: 1, data: S, updated_at: new Date().toISOString() });
  if (error) return toast(error.message);
  setDirty(false); toast('Content saved — live on the site');
};
addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- image upload (resized client-side) ---------- */
function resize(file, max = 2400) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * s), h = Math.round(img.height * s);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(b => b ? res({ blob: b, w, h }) : rej(new Error('Could not process image')), 'image/jpeg', .88);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => rej(new Error('Not an image')); img.src = URL.createObjectURL(file);
  });
}
async function upload(file) {
  const { blob, w, h } = await resize(file);
  const name = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.jpg`;
  const { error } = await db.storage.from(BUCKET).upload(name, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return { url: db.storage.from(BUCKET).getPublicUrl(name).data.publicUrl, w, h, path: name };
}

/* ---------- photos ---------- */
let photos = [], editing = null, pending = null;
async function loadPhotos() {
  const { data, error } = await db.from('projects').select('*').order('sort', { ascending: true });
  if (error) return toast(error.message);
  photos = data; renderGrid();
}
function renderGrid() {
  const g = $('#grid'); g.innerHTML = '';
  if (!photos.length) g.innerHTML = '<p class="sub">No photos yet. Add one, or run supabase/seed.sql for the starter set.</p>';
  photos.forEach((p, i) => {
    const c = document.createElement('div'); c.className = 'pcard';
    const fl = [['show_hero', 'Hero'], ['show_index', 'Work'], ['show_latest', 'Latest'], ['show_archive', 'Archive']].filter(([k]) => p[k]).map(([, l]) => `<span>${l}</span>`).join('');
    c.innerHTML = `<div class="im"><img src="${src(p.image_url)}" alt="" loading="lazy"></div><div class="meta"><div class="t"></div><div class="label"></div><div class="flags">${fl}</div></div><div class="ord"><button data-m="-1" title="Move earlier">↑</button><button data-m="1" title="Move later">↓</button></div>`;
    c.querySelector('.t').textContent = p.title; c.querySelector('.label').textContent = `${p.category || ''} · ${p.year || ''}`;
    c.onclick = e => { const m = e.target.closest('[data-m]'); if (m) { e.stopPropagation(); move(i, +m.dataset.m); } else openDrawer(p); };
    g.appendChild(c);
  });
}
async function move(i, d) {
  const j = i + d; if (j < 0 || j >= photos.length) return;
  [photos[i], photos[j]] = [photos[j], photos[i]];
  photos.forEach((p, k) => p.sort = k + 1); renderGrid();
  const { error } = await db.from('projects').upsert(photos.map(({ id, sort, title, image_url }) => ({ id, sort, title, image_url })));
  if (error) toast(error.message);
}
function filtersOptions(sel) {
  const fs = (S && S.archive && S.archive.filters) || window.COVE_DEFAULT.settings.archive.filters;
  $('#dG').innerHTML = '<option value="">—</option>' + fs.map(f => `<option value="${f.key}">${f.label}</option>`).join('');
  $('#dG').value = sel || '';
}
function openDrawer(p) {
  editing = p || null; pending = null; $('#dFile').value = '';
  const v = p || { title: '', category: '', grp: '', client: '', year: new Date().getFullYear(), show_hero: false, show_index: true, show_latest: false, show_archive: true };
  $('#dTitle').textContent = p ? 'Edit photo' : 'New photo';
  $('#dImg').src = src(v.image_url); $('#dT').value = v.title; $('#dC').value = v.category || ''; $('#dCl').value = v.client || ''; $('#dY').value = v.year || '';
  filtersOptions(v.grp);
  $('#fHero').checked = v.show_hero; $('#fIndex').checked = v.show_index; $('#fLatest').checked = v.show_latest; $('#fArchive').checked = v.show_archive;
  show('#dDelete', !!p); $('#drawer').classList.add('on');
}
$('#addPhoto').onclick = () => openDrawer(null);
$('#dClose').onclick = () => $('#drawer').classList.remove('on');
$('#drawer').onclick = e => { if (e.target.id === 'drawer') $('#drawer').classList.remove('on'); };
$('#dFile').onchange = () => { const f = $('#dFile').files[0]; if (f) { pending = f; $('#dImg').src = URL.createObjectURL(f); } };
$('#dSave').onclick = async () => {
  const b = $('#dSave'); b.disabled = true; b.textContent = 'Saving…';
  try {
    const row = { title: $('#dT').value.trim() || 'Untitled', category: $('#dC').value.trim(), grp: $('#dG').value, client: $('#dCl').value.trim(), year: +$('#dY').value || null,
      show_hero: $('#fHero').checked, show_index: $('#fIndex').checked, show_latest: $('#fLatest').checked, show_archive: $('#fArchive').checked };
    if (pending) { const r = await upload(pending); row.image_url = r.url; row.width = r.w; row.height = r.h; }
    if (!editing && !row.image_url) throw new Error('Choose an image first');
    let res;
    if (editing) res = await db.from('projects').update(row).eq('id', editing.id);
    else { row.sort = photos.length + 1; res = await db.from('projects').insert(row); }
    if (res.error) throw res.error;
    toast('Photo saved'); $('#drawer').classList.remove('on'); loadPhotos();
  } catch (e) { toast(e.message); }
  b.disabled = false; b.textContent = 'Save photo';
};
$('#dDelete').onclick = async () => {
  if (!editing || !confirm(`Delete “${editing.title}”?`)) return;
  const { error } = await db.from('projects').delete().eq('id', editing.id);
  if (error) return toast(error.message);
  const m = (editing.image_url || '').split(`/object/public/${BUCKET}/`)[1];
  if (m) await db.storage.from(BUCKET).remove([decodeURIComponent(m)]);
  toast('Deleted'); $('#drawer').classList.remove('on'); loadPhotos();
};

boot();
})();
