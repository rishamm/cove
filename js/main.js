/* COVE — site runtime */
(async function () {
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mqDesk = matchMedia('(min-width: 861px)');
const HAS = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !RM;
if (HAS) gsap.registerPlugin(ScrollTrigger);
const W = window.WaveLogo;

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rich = s => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const pad2 = n => String(n).padStart(2, '0');

/* ---------- smooth scroll ---------- */
let lenis = null;
if (typeof Lenis !== 'undefined' && !RM) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
  lenis.stop();
  if (HAS) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const r = t => { lenis.raf(t); requestAnimationFrame(r); }; requestAnimationFrame(r); }
}
const velocity = () => (lenis ? Math.abs(lenis.velocity || 0) : 0);

/* ---------- loader (starts before content arrives) ---------- */
const loaderLogo = new W($('#loaderLogo'), { amp: 4, speed: 2.4, fx: .04 });
const bgPath = $('#loaderBg');
const L = { p: 0, target: 0, t: 0, q: 0, ready: false, done: false, start: performance.now() };

function bgShape(q, t) {
  const s = Math.sin(Math.PI * q);
  let d = 'M0 0 L100 0';
  for (let x = 100; x >= 0; x -= 2) {
    const y = 100 * (1 - q) + 22 * s * Math.sin(Math.PI * x / 100) + 2.5 * s * Math.sin(x * .16 + t * 4);
    d += ` L${x} ${Math.max(-30, y).toFixed(2)}`;
  }
  return d + ' Z';
}
function loaderTick() {
  if (L.done) return;
  const now = performance.now(), dt = 1 / 60;
  L.t += dt;
  const timeP = Math.min(1, (now - L.start) / 1800);
  L.target = L.ready ? timeP : Math.min(timeP, .86);
  L.p += (L.target - L.p) * .08;
  if (L.target === 1 && L.p > .97) L.p = 1;
  if (L.q > 0) bgPath.setAttribute('d', bgShape(L.q, L.t));
  if (L.p === 1 && L.ready && !L.exiting) exitLoader();
  requestAnimationFrame(loaderTick);
}
requestAnimationFrame(loaderTick);

/* ---------- content ---------- */
const DATA = await window.COVE_LOAD();
const S = DATA.settings;
const P = DATA.projects.slice().sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
document.title = `${S.brand.name} — Photography`;

$$('[data-c]').forEach(el => el.textContent = get(S, el.dataset.c) ?? '');
$$('[data-rich]').forEach(el => el.innerHTML = rich(get(S, el.dataset.rich)));

// logos
const navWave = new W($('#navLogo'), { amp: 1.6, speed: 1.4 });

// hero — slideshow frame + thumbnail strip
const heroAll = P.filter(p => p.show_hero);
const heroP = (heroAll.length ? heroAll : P).slice(0, 8);
const stage = $('#stage'), thumbsEl = $('#thumbs'), trailEl = $('#trail');
stage.dataset.cursor = 'View';
heroP.forEach((p, i) => {
  const s = document.createElement('div');
  s.className = 'slide'; s.dataset.id = P.indexOf(p); s.style.zIndex = 0;
  s.innerHTML = `<img src="${esc(p.image_url)}" alt="${esc(p.title)}" decoding="async">`;
  stage.appendChild(s);
  const b = document.createElement('button');
  b.className = 'th'; b.setAttribute('aria-label', `Show ${p.title}`);
  b.innerHTML = `<img src="${esc(p.image_url)}" alt="" loading="lazy"><i></i>`;
  thumbsEl.appendChild(b);
});
mqDesk.addEventListener('change', () => layout(true));

// hero contact + specialties
const C = S.contact;
if ($('#heroContact')) $('#heroContact').innerHTML =
  `<button data-copy="${esc(C.email)}"><span class="k">Email</span>${esc(C.email)}</button>` +
  `<button data-copy="${esc(C.phone)}"><span class="k">Phone</span><b>${esc(C.phone)}</b></button>` +
  `<a href="${esc(C.instagramUrl)}" target="_blank" rel="noopener"><span class="k">Insta</span>${esc(C.instagram)}</a>`;
if ($('#specialties')) $('#specialties').innerHTML = (S.hero.specialties || []).map(esc).join('<br>');

// manifesto
$('#manifesto').innerHTML = rich(S.manifesto.text);

// index rows
const rows = $('#rows'), flt = $('#float');
P.filter(p => p.show_index).forEach((p, n) => {
  const id = P.indexOf(p);
  const li = document.createElement('li');
  li.className = 'row'; li.dataset.id = id; li.dataset.cursor = 'Open';
  li.innerHTML = `<span class="n">${pad2(n + 1)}</span><div class="th"><img src="${esc(p.image_url)}" alt="" loading="lazy"></div><span class="t">${esc(p.title)}</span><span class="c">${esc(p.category)} — ${esc(p.client)}</span><span class="y">${esc(p.year)}</span>`;
  rows.appendChild(li);
  const im = document.createElement('img'); im.src = p.image_url; im.dataset.id = id; im.alt = ''; flt.appendChild(im);
});

// latest
const track = $('#track');
P.filter(p => p.show_latest).forEach(p => {
  const c = document.createElement('article');
  c.className = 'card'; c.dataset.id = P.indexOf(p); c.dataset.cursor = 'View';
  c.innerHTML = `<div class="im"><img src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy"></div><div class="cap"><h3>${esc(p.client)} — ${esc(p.title)}</h3><span class="label">${esc(p.category)}</span></div><span class="label sub">Photography for ${esc(p.client)}</span>`;
  track.appendChild(c);
});


// archive
const archiveP = P.filter(p => p.show_archive);
$('#filters').innerHTML = `<button class="on" data-f="all">All</button>` + (S.archive.filters || []).map(f => `<button data-f="${esc(f.key)}">${esc(f.label)}</button>`).join('');
const mas = $('#masonry');
const tiles = archiveP.map(p => {
  const t = document.createElement('figure');
  t.className = 'tile'; t.dataset.id = P.indexOf(p); t.dataset.g = p.grp || ''; t.dataset.cursor = 'View';
  const ar = p.width && p.height ? `${p.width}/${p.height}` : '4/5';
  t.innerHTML = `<div class="in" style="aspect-ratio:${ar}"><img src="${esc(p.image_url)}" alt="${esc(p.title)}" loading="lazy" decoding="async"></div><figcaption class="info"><span>${esc(p.title)}</span><span class="label">${esc(p.category)}</span></figcaption>`;
  return t;
});
let lastCols = 0;
function layout(force) {
  const n = mqDesk.matches ? 3 : 2;
  if (n === lastCols && !force) return; lastCols = n;
  mas.innerHTML = '';
  const cols = [...Array(n)].map(() => { const c = document.createElement('div'); c.className = 'mcol'; mas.appendChild(c); return c; });
  const h = new Array(n).fill(0);
  tiles.filter(t => !t.classList.contains('hide')).forEach(t => {
    const p = P[+t.dataset.id]; const j = h.indexOf(Math.min(...h));
    cols[j].appendChild(t); h[j] += (p.height || 5) / (p.width || 4) + .15;
  });
  if (HAS) ScrollTrigger.refresh();
}
layout();
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
  const f = b.dataset.f;
  tiles.forEach(t => t.classList.toggle('hide', !(f === 'all' || t.dataset.g === f)));
  layout(true);
  if (HAS) gsap.fromTo(tiles.filter(t => !t.classList.contains('hide')), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .05, overwrite: true });
});

// about
const A = S.about;
$('#aboutImg').src = A.portraitUrl || (P[0] && P[0].image_url) || '';
const li = arr => (arr || []).map(x => `<li><span class="nm">${rich(x.name)}</span><span>${esc(x.meta)}</span></li>`).join('');
$('#services').innerHTML = li(A.services);
$('#recognition').innerHTML = li(A.recognition);

// footer
const F = S.footer;
const blk = b => `<div class="blk"><h5>${esc(b.title)}</h5>${(b.lines || []).map(l => /@|^\+?\d[\d\s]+$/.test(l) ? `<a class="t" href="#contact" data-copy="${esc(l)}">${esc(l)}</a>` : `<p>${esc(l)}</p>`).join('')}</div>`;
$('#blocks').innerHTML = (F.blocks || []).map(blk).join('');
const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" stroke="none"/></svg>',
  behance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5h4.6a2.6 2.6 0 0 1 0 5.2H3zM3 11.7h5.2a2.9 2.9 0 0 1 0 5.8H3zM3 6.5v11"/><path d="M14.2 14.2h6.6a3.3 3.3 0 1 0-1 2.4"/><path d="M14.4 7.8h5"/></svg>'
};
$('#socials').innerHTML = (F.socials || []).map(s => {
  const ic = ICONS[String(s.label).toLowerCase().trim()];
  return `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}"${ic ? '' : ' class="txt"'}>${ic || esc(s.label)}</a>`;
}).join('');

/* ---------- the word COVE is always set in the logo's own letterforms ---------- */
const coveSVG = () => `<svg class="cove-word" viewBox="${W.VB.join(' ')}" role="img" aria-label="COVE"><g fill="currentColor">${W.static.map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
function coveify(root) {
  const re = /\bCOVE\b/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => re.test(n.nodeValue) && !n.parentNode.closest('script,style,svg,textarea,input,title,.cove-word') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    const span = document.createElement('span');
    span.innerHTML = esc(n.nodeValue).replace(/\bCOVE\b/g, coveSVG());
    n.replaceWith(...span.childNodes);
  });
}
coveify(document.body);

/* ---------- wave text ---------- */
function splitChars(el) {
  const walk = node => {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          const wd = document.createElement('span'); wd.className = 'wd';
          [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; wd.appendChild(s); });
          frag.appendChild(wd);
        });
        node.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
  };
  walk(el); return $$('.ch', el);
}
$$('.wave-title, .wave-hover').forEach(el => { el._chars = splitChars(el); });
function waveHover(el) {
  if (!HAS || !el._chars) return;
  gsap.to(el._chars, { keyframes: [{ y: '-0.14em', duration: .32, ease: 'sine.out' }, { y: 0, duration: .5, ease: 'sine.inOut' }], stagger: .022, overwrite: 'auto' });
}
$$('.wave-title').forEach(el => el.addEventListener('mouseenter', () => waveHover(el)));
$$('.menu li a').forEach(a => a.addEventListener('mouseenter', () => waveHover($('.wave-hover', a))));

/* ---------- interactions ---------- */
// clock
const clk = $('#clock');
const tick = () => { try { clk.textContent = `${S.brand.city} — ` + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: S.brand.timezone }).format(new Date()); } catch (e) { } };
if (clk) { tick(); setInterval(tick, 1000); }

// copy
const toast = $('.copied'); let tt;
const flash = msg => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2000); };
document.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  e.preventDefault(); const v = b.dataset.copy;
  try { navigator.clipboard.writeText(v).then(() => flash('Copied — ' + v), () => flash(v)); } catch (err) { flash(v); }
});

// lightbox
const lb = $('#lb'), lbImg = $('#lbImg'); let cur = 0, list = [];
function show(i) {
  cur = (i + list.length) % list.length; const p = P[list[cur]];
  lbImg.classList.add('swap');
  setTimeout(() => {
    lbImg.src = p.image_url; lbImg.alt = p.title; $('#lbT').textContent = p.title;
    $('#lbC').textContent = `${p.category} — ${p.client}`; $('#lbCount').textContent = `${pad2(cur + 1)} / ${pad2(list.length)}`;
    lbImg.classList.remove('swap');
  }, 200);
}
function openLB(id, l) { list = l || archiveP.map(p => P.indexOf(p)); if (!list.includes(+id)) list = [+id, ...list]; lb.classList.add('on'); lenis && lenis.stop(); show(list.indexOf(+id)); }
function closeLB() { lb.classList.remove('on'); lenis && lenis.start(); }
$('#lbClose').onclick = closeLB; $('#lbNext').onclick = () => show(cur + 1); $('#lbPrev').onclick = () => show(cur - 1);
$('.zone.l').onclick = () => show(cur - 1); $('.zone.r').onclick = () => show(cur + 1);
addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
let sx = 0;
lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
document.addEventListener('click', e => {
  const t = e.target.closest('.tile,.card,.row,.stage'); if (!t) return;
  if (t.classList.contains('tile')) openLB(t.dataset.id, tiles.filter(x => !x.classList.contains('hide')).map(x => +x.dataset.id));
  else if (t.classList.contains('stage')) openLB(heroCurrentId(), heroP.map(p => P.indexOf(p)));
  else openLB(t.dataset.id);
});

// menu + anchors
function toggleMenu(force) {
  const on = force !== undefined ? force : !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', on); $('#menuLbl').textContent = on ? 'Close' : 'Menu';
  if (lenis) on ? lenis.stop() : lenis.start();
}
$('#menuBtn').onclick = () => toggleMenu();
mqDesk.addEventListener('change', () => { if (mqDesk.matches) toggleMenu(false); });
$$('[data-go]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); const tgt = $(a.dataset.go); if (!tgt) return;
  const was = document.body.classList.contains('menu-open'); if (was) toggleMenu(false);
  setTimeout(() => lenis ? lenis.scrollTo(tgt, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) }) : tgt.scrollIntoView({ behavior: 'smooth' }), was ? 550 : 0);
}));

// cursor + floating preview (quickTo = no fighting transitions)
const cursor = $('.cursor'), cLbl = $('span', cursor);
let cx, cy, fx, fy, fr;
if (HAS) {
  cx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' }); cy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });
  gsap.set(flt, { xPercent: -50, yPercent: -50 });
  fx = gsap.quickTo(flt, 'x', { duration: .9, ease: 'power3' }); fy = gsap.quickTo(flt, 'y', { duration: .9, ease: 'power3' });
  fr = gsap.quickTo(flt, 'rotation', { duration: .9, ease: 'power3' });
}
let lastX = 0;
addEventListener('pointermove', e => {
  if (!HAS) return; cx(e.clientX); cy(e.clientY); fx(e.clientX); fy(e.clientY);
  fr(Math.max(-8, Math.min(8, (e.clientX - lastX) * .4))); lastX = e.clientX;
});
document.addEventListener('pointerover', e => { const t = e.target.closest('[data-cursor]'); if (t) { cLbl.textContent = t.dataset.cursor; cursor.classList.add('big'); } else cursor.classList.remove('big'); });
rows.addEventListener('pointerover', e => { const r = e.target.closest('.row'); if (!r) return; flt.classList.add('on'); $$('img', flt).forEach(i => i.classList.toggle('on', i.dataset.id === r.dataset.id)); });
rows.addEventListener('pointerleave', () => flt.classList.remove('on'));

/* nav: invert over photos; over text, a solid twin is shown instead (no inversion) */
const navD = $('.nav');
const navS = navD.cloneNode(true);
navS.classList.add('nav-solid'); navS.setAttribute('aria-hidden', 'true');
navS.querySelectorAll('[id]').forEach(e => { e.dataset.twin = e.id; e.removeAttribute('id'); });
const sLogo = navS.querySelector('[data-twin="navLogo"]'); sLogo.innerHTML = '';
navD.after(navS);
const navWaveS = new W(sLogo, { amp: 1.6, speed: 1.4 });
navWaveS.t = navWave.t;
navS.querySelector('.menu-btn').onclick = () => toggleMenu();
navS.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); navD.querySelector(`[data-go="${a.dataset.go}"]`).click(); }));
const pick = n => [n.querySelector('.logo'), ...n.querySelectorAll('.links a'), n.querySelector('.menu-btn')];
const navPairs = pick(navD).map((d, k) => [d, pick(navS)[k]]);
const range = document.createRange();
const SKIP = '.nav,.menu,.cursor,.copied,.grain,.loader,.float';
function probe(x, y) {
  let text = false;
  for (const e of document.elementsFromPoint(x, y)) {
    if (e.closest(SKIP)) continue;
    if (!text) {
      if (e.tagName === 'IMG') return { text: false };
      if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') text = true;
      else for (const n of e.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) { text = true; break; }
        if (text) break;
      }
      if (!text && (e.tagName === 'SECTION' || e.tagName === 'MAIN' || e.tagName === 'FOOTER' || e === document.body)) return { text: false };
    }
    if (text) {
      const bg = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
      if (bg && (bg.length < 4 || +bg[3] > .5)) return { text: true, dark: (+bg[0] + +bg[1] + +bg[2]) / 3 < 128 };
      if (e === document.body || e === document.documentElement) return { text: true, dark: false };
    }
  }
  return { text, dark: false };
}
let navQueued = false;
function navCheck() {
  navQueued = false;
  const open = document.body.classList.contains('menu-open') || lb.classList.contains('on');
  $('[data-twin="menuLbl"]', navS).textContent = $('#menuLbl').textContent;
  navPairs.forEach(([d, s]) => {
    if (!d || getComputedStyle(d).display === 'none') return;
    let res = { text: false };
    if (!open) {
      const r = d.getBoundingClientRect(), cy = r.top + r.height / 2;
      for (const x of [r.left + 1, r.left + r.width / 2, r.right - 1]) { const p = probe(x, cy); if (p.text) { res = p; break; } }
    }
    d.classList.toggle('solid-off', res.text);
    s.classList.toggle('solid-on', res.text);
    if (res.text) s.style.color = res.dark ? '#fff' : '#000';
  });
}
const queueNav = () => { if (!navQueued) { navQueued = true; requestAnimationFrame(navCheck); } };
addEventListener('scroll', queueNav, { passive: true }); addEventListener('resize', queueNav);
if (lenis) lenis.on('scroll', queueNav);
setInterval(queueNav, 300);

/* ---------- motion ---------- */

// logos breathe with scroll velocity — liquid response
if (typeof gsap !== 'undefined') gsap.ticker.add(() => {
  const v = Math.min(9, velocity() * .12);
  navWave.o.amp = 1.6 + v * .5; if (typeof navWaveS !== 'undefined') navWaveS.o.amp = navWave.o.amp;
});

// hero slideshow engine
const slides = $$('.slide', stage), ths = $$('.th', thumbsEl);
const SLIDE_T = 3.8;
let heroIdx = -1, heroCall = null, heroVisible = true, heroStarted = false, barTween = null;
function heroCurrentId() { return slides[Math.max(0, heroIdx)].dataset.id; }
function goSlide(i) {
  if (!slides.length) return;
  i = (i + slides.length) % slides.length;
  if (i === heroIdx) return;
  const prev = slides[heroIdx], next = slides[i];
  heroIdx = i;
  ths.forEach((b, k) => b.classList.toggle('on', k === i));
  if (!HAS) { slides.forEach(s => s.style.zIndex = s === next ? 2 : 0); return; }
  slides.forEach(s => { if (s !== next && s !== prev) s.style.zIndex = 0; });
  if (prev) prev.style.zIndex = 1;
  next.style.zIndex = 2;
  const img = $('img', next);
  gsap.killTweensOf([next, img]);
  gsap.fromTo(next, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' });
  gsap.fromTo(img, { scale: 1.35, yPercent: 6 }, { scale: 1.06, yPercent: 0, duration: 1.8, ease: 'expo.out', onComplete: () => gsap.to(img, { scale: 1, duration: SLIDE_T, ease: 'none' }) });
  if (prev) gsap.to($('img', prev), { yPercent: -10, scale: 1.1, duration: 1.3, ease: 'expo.inOut' });
  ths.forEach(b => gsap.set($('i', b), { scaleX: 0 }));
  if (barTween) barTween.kill();
  barTween = gsap.fromTo($('i', ths[i]), { scaleX: 0 }, { scaleX: 1, duration: SLIDE_T, ease: 'none', paused: !heroVisible });
  if (heroCall) heroCall.kill();
  heroCall = gsap.delayedCall(SLIDE_T, () => goSlide(heroIdx + 1));
  if (!heroVisible) heroCall.pause();
}
ths.forEach((b, k) => b.addEventListener('click', e => { e.stopPropagation(); goSlide(k); }));
if ('IntersectionObserver' in window) new IntersectionObserver(e => {
  heroVisible = e[0].isIntersecting;
  if (heroCall) heroVisible ? heroCall.resume() : heroCall.pause();
  if (barTween) heroVisible ? barTween.resume() : barTween.pause();
}).observe($('.hero'));
if (!HAS) { goSlide(0); setInterval(() => goSlide(heroIdx + 1), SLIDE_T * 1000); }

// cursor trail of photographs (desktop)
if (HAS && mqDesk.matches && !RM) {
  const pool = [...Array(14)].map(() => { const im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; trailEl.appendChild(im); return im; });
  let pi = 0, si = 0, lx = -999, ly = -999;
  $('.hero').addEventListener('pointermove', e => {
    if (stage.contains(e.target) || thumbsEl.contains(e.target)) return;
    const r = trailEl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (Math.hypot(x - lx, y - ly) < 110) return;
    lx = x; ly = y;
    const p = P[si++ % P.length], im = pool[pi++ % pool.length];
    im.src = p.image_url;
    gsap.killTweensOf(im);
    gsap.set(im, { x, y, xPercent: -50, yPercent: -50, zIndex: pi });
    gsap.timeline()
      .fromTo(im, { opacity: 0, scale: .55, rotation: gsap.utils.random(-6, 6) }, { opacity: 1, scale: 1, rotation: 0, duration: .55, ease: 'expo.out' })
      .to(im, { opacity: 0, scale: .85, y: y + 24, duration: .8, ease: 'power2.in' }, .65);
  });
}

function heroIntro(at) {
  const tl = gsap.timeline({ delay: at });
  tl.fromTo(stage, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .add(() => { heroStarted = true; goSlide(0); }, .05)
    .fromTo(ths, { y: 24, opacity: 0 }, { y: 0, opacity: (k, el) => el.classList.contains('on') ? 1 : .32, duration: 1.2, ease: 'expo.out', stagger: .05, clearProps: 'opacity,transform' }, .9);
  return tl;
}

function scrollFX() {
  // hero — frame grows and lifts as you scroll away, strip fades
  gsap.to(stage, { scale: 1.16, yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to(thumbsEl, { opacity: 0, y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '35% top', scrub: true } });

  // manifesto
  const m = $('#manifesto');
  const words = [];
  const wrap = node => [...node.childNodes].forEach(c => {
    if (c.nodeType === 3) {
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); words.push(s); } });
      node.replaceChild(frag, c);
    } else if (c.nodeType === 1 && c.tagName !== 'BR') wrap(c);
  });
  wrap(m);
  gsap.fromTo(words, { opacity: .12, y: '.25em' }, { opacity: 1, y: 0, stagger: .1, ease: 'none', scrollTrigger: { trigger: m, start: 'top 82%', end: 'bottom 50%', scrub: true } });

  // wave titles
  $$('.wave-title').forEach(h => {
    gsap.from(h._chars, { yPercent: 118, rotation: 7, duration: 1.5, ease: 'expo.out', stagger: { each: .03, ease: 'sine.inOut' }, scrollTrigger: { trigger: h, start: 'top 86%' } });
  });
  $$('.sec-head .label, .filters').forEach(el => gsap.from(el, { opacity: 0, y: 18, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));

  // index rows — staggered wave in
  gsap.from('.row', { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: { each: .07, ease: 'sine.in' }, scrollTrigger: { trigger: rows, start: 'top 82%' } });

  // latest — horizontal drift tied to scroll (no pin, never stops the page)
  if (mqDesk.matches) {
    const st = { trigger: '#latest', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
    gsap.fromTo(track, { x: () => innerWidth * .1 }, { x: () => -(track.scrollWidth - innerWidth * .9), ease: 'none', scrollTrigger: { ...st, onUpdate: s => gsap.set('#prog', { scaleX: s.progress }) } });
    $$('.card .im img').forEach(im => gsap.fromTo(im, { xPercent: 7 }, { xPercent: -7, ease: 'none', scrollTrigger: st }));
  }
  gsap.from('.card', { y: 90, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: { each: .08 }, scrollTrigger: { trigger: '#latest', start: 'top 72%' } });

  // archive
  tiles.forEach(t => {
    gsap.fromTo(t, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 96%', once: true } });
    const img = $('img', t);
    gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // about
  gsap.fromTo('.about .portrait', { clipPath: 'inset(16% 16% 16% 16%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.about', start: 'top 85%', end: 'top 15%', scrub: true } });
  gsap.fromTo('#aboutImg', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about h2', { opacity: 0, y: 50, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.about h2', start: 'top 86%' } });
  gsap.from('.about li', { opacity: 0, x: -24, duration: 1.1, stagger: .04, ease: 'expo.out', scrollTrigger: { trigger: '.about .cols', start: 'top 86%' } });

  // contact
  gsap.from('.cgrid>*, .contact-sec .pills', { opacity: 0, y: 50, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.cgrid', start: 'top 86%' } });
}


/* ---------- loader exit ---------- */
function exitLoader() {
  if (L.exiting) return;
  L.exiting = true;
  document.body.classList.remove('locked');
  if (!HAS) { $('#loader').remove(); L.done = true; lenis && lenis.start(); return; }
  scrollFX();
  const tl = gsap.timeline({ onComplete: () => { L.done = true; $('#loader').remove(); W.all.splice(W.all.indexOf(loaderLogo), 1); lenis && lenis.start(); ScrollTrigger.refresh(); } });
  tl.to(loaderLogo.o, { amp: 16, duration: 1, ease: 'power2.in' }, 0)
    .to('#loaderLogo', { yPercent: -120, opacity: 0, duration: 1.1, ease: 'power3.in' }, .1)
    .to(L, { q: 1, duration: 1.5, ease: 'power3.inOut' }, .35);
  heroIntro(.75);
}

// wait for hero images (max 4s), then let the loader finish
const heroImgs = $$('.slide img').slice(0, 2);
await Promise.race([
  Promise.all(heroImgs.map(i => i.decode ? i.decode().catch(() => { }) : Promise.resolve())),
  new Promise(r => setTimeout(r, 4000))
]);
L.ready = true;
addEventListener('load', () => HAS && ScrollTrigger.refresh());
})();
