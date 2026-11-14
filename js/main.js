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
const loaderLogo = new W($('#loaderLogo'), { mode: 'outline', amp: 4, speed: 2.4, fx: .04 });
const NS = 'http://www.w3.org/2000/svg';
const defs = document.createElementNS(NS, 'defs');
defs.innerHTML = '<clipPath id="liq"><path id="liqPath"/></clipPath>';
loaderLogo.svg.prepend(defs);
loaderLogo.addGroup({ fill: '#fff', 'clip-path': 'url(#liq)' });
const liqPath = $('#liqPath'), bgPath = $('#loaderBg'), countEl = $('#count');
const L = { p: 0, target: 0, t: 0, q: 0, ready: false, done: false, start: performance.now() };
const TOP = W.VB[1] - 6, BOT = W.VB[1] + W.VB[3] + 6;

function liquidLevel(p, t) {
  const y0 = BOT - p * (BOT - TOP);
  const a = 4 * Math.sin(Math.PI * Math.min(1, p * 1.2)) + .6;
  let d = `M100 ${y0}`;
  for (let x = 100; x <= 500; x += 6) d += ` L${x} ${(y0 + a * Math.sin(x * .045 - t * 3.2) + a * .5 * Math.sin(x * .11 + t * 2.1)).toFixed(2)}`;
  return d + ' L500 400 L100 400 Z';
}
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
  const timeP = Math.min(1, (now - L.start) / 2300);
  L.target = L.ready ? timeP : Math.min(timeP, .86);
  L.p += (L.target - L.p) * .08;
  if (L.target === 1 && L.p > .97) L.p = 1;
  liqPath.setAttribute('d', liquidLevel(L.p, L.t));
  countEl.textContent = String(Math.round(L.p * 100)).padStart(3, '0');
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
const markWave = new W($('#mark'), { amp: 14, speed: 1.3, fx: .03 });
const footWave = new W($('#footLogo'), { amp: 2, speed: 1.2, fx: .028 });

// hero collage
const SLOTS_D = [[5,15,12.5,'3/4',.6],[16,52,16,'4/3',1.2],[33,9,10,'3/4',.35],[61,11,18,'3/2',.9],[85,28,10.5,'2/3',1.5],[70,57,11,'1/1',.7],[43,63,13,'3/2',1.1],[-2,58,9,'3/4',.5]];
const SLOTS_M = [[6,13,26],[55,58,36],[64,10,22],[24,27,44],[80,34,20],[8,50,24],[36,68,30],[-6,80,22]];
const heroP = P.filter(p => p.show_hero).slice(0, 8);
const collage = $('#collage');
heroP.forEach((p, i) => {
  const s = SLOTS_D[i];
  const f = document.createElement('figure');
  f.className = 'ph'; f.dataset.d = s[4]; f.dataset.id = P.indexOf(p); f.dataset.cursor = 'View';
  f.style.aspectRatio = s[3];
  f.innerHTML = `<div class="in"><img src="${esc(p.image_url)}" alt="${esc(p.title)}" decoding="async"></div><figcaption>${pad2(i + 1)}</figcaption>`;
  collage.appendChild(f);
});
function setSlots() {
  $$('.ph').forEach((f, i) => {
    const s = mqDesk.matches ? SLOTS_D[i] : SLOTS_M[i];
    f.style.setProperty('--x', s[0] + '%'); f.style.setProperty('--y', s[1] + '%'); f.style.setProperty('--w', s[2] + 'vw');
  });
}
setSlots(); mqDesk.addEventListener('change', () => { setSlots(); layout(true); });

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

// marquee
const mq = $('#mq');
const mqHTML = (S.marquee || []).map(w => `<span class="mq-item">${rich(w)}</span>`).join('');
mq.innerHTML = mqHTML + mqHTML;

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
$('#stats').innerHTML = (A.stats || []).map(s => `<div><b data-n="${+s.value || 0}" data-s="${esc(s.suffix)}">${+s.value || 0}${esc(s.suffix)}</b><span class="label">${esc(s.label)}</span></div>`).join('');

// footer
const F = S.footer;
const blk = b => `<div class="blk"><h5>${esc(b.title)}</h5>${(b.lines || []).map(l => /@|^\+?\d[\d\s]+$/.test(l) ? `<a class="t" href="#contact" data-copy="${esc(l)}">${esc(l)}</a>` : `<p>${esc(l)}</p>`).join('')}</div>`;
const half = Math.ceil((F.blocks || []).length / 2);
$('#blocksA').innerHTML = (F.blocks || []).slice(0, half).map(blk).join('');
$('#blocksB').innerHTML = (F.blocks || []).slice(half).map(blk).join('');
$('#socials').innerHTML = (F.socials || []).map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('');

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

// form → email app
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const to = F.formEmail || C.email, n = $('#fn').value;
  const a = document.createElement('a');
  a.href = `mailto:${to}?subject=${encodeURIComponent('Project enquiry — ' + n)}&body=${encodeURIComponent($('#fm').value + '\n\n' + n + ' · ' + $('#fe').value)}`;
  a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
  $('#formnote').textContent = `Your email app should open with this message. If it doesn’t, write to ${to}.`;
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
  const t = e.target.closest('.tile,.card,.row,.ph'); if (!t) return;
  if (t.classList.contains('tile')) openLB(t.dataset.id, tiles.filter(x => !x.classList.contains('hide')).map(x => +x.dataset.id));
  else openLB(t.dataset.id);
});

// menu + anchors
function toggleMenu(force) {
  const on = force !== undefined ? force : !document.body.classList.contains('menu-open');
  document.body.classList.toggle('menu-open', on); $('#menuLbl').textContent = on ? 'Close' : 'Menu';
  if (lenis) on ? lenis.stop() : lenis.start();
}
$('#menuBtn').onclick = () => toggleMenu();
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

/* ---------- motion ---------- */
const phs = $$('.ph');
const markState = { intro: 14, scroll: 0 };
if (HAS) gsap.set('#mark', { opacity: 0 });

// logos breathe with scroll velocity — liquid response
if (typeof gsap !== 'undefined') gsap.ticker.add(() => {
  const v = Math.min(9, velocity() * .12);
  markWave.o.amp = markState.intro + markState.scroll + v * .6;
  navWave.o.amp = 1.6 + v * .5;
  footWave.o.amp = 2 + v;
});

// hero mouse parallax
if (HAS && mqDesk.matches) {
  const qs = phs.map(f => { const el = $('.in', f); return [gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3' }), gsap.quickTo(el, 'y', { duration: 1.4, ease: 'power3' }), +f.dataset.d]; });
  const mq2 = [gsap.quickTo('#mark', 'x', { duration: 1.8, ease: 'power3' })];
  $('.hero').addEventListener('pointermove', e => {
    const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
    qs.forEach(([x, y, d]) => { x(-nx * d * 46); y(-ny * d * 46); });
    mq2[0](nx * 14);
  });
}

function heroIntro(at) {
  const tl = gsap.timeline({ delay: at });
  tl.fromTo(phs, { y: () => innerHeight * .55, rotation: () => gsap.utils.random(-9, 9), opacity: 0 },
      { y: 0, rotation: 0, opacity: 1, duration: 2, ease: 'expo.out', stagger: { each: .07, from: 'center' } }, 0)
    .fromTo($$('.ph .in'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', stagger: { each: .07, from: 'center' } }, 0)
    .fromTo($$('.ph img'), { scale: 1.6 }, { scale: 1.12, duration: 2.2, ease: 'expo.out', stagger: { each: .07, from: 'center' } }, 0)
    .fromTo('#mark', { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'expo.out' }, .15)
    .to(markState, { intro: 2.2, duration: 2.6, ease: 'power2.out' }, .1);
  return tl;
}

function scrollFX() {
  // hero — no pin: layered drift + liquid melt of the mark
  phs.forEach(f => {
    const d = +f.dataset.d;
    gsap.to(f, { yPercent: -60 * d - 20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('#mark', { yPercent: 70, scale: 1.12, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => { markState.scroll = s.progress * 9; } } });

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
  $$('#stats b').forEach(b => { const o = { v: 0 }; gsap.to(o, { v: +b.dataset.n, duration: 2.2, ease: 'power3.out', onUpdate: () => b.textContent = Math.round(o.v) + b.dataset.s, scrollTrigger: { trigger: b, start: 'top 92%' } }); });

  // contact
  gsap.from('.cgrid>*', { opacity: 0, y: 50, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.cgrid', start: 'top 86%' } });
  gsap.fromTo('#footLogo', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '#footLogo', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

// marquee: slides + a travelling wave rolls through every letter
const mqChars = [];
$$('.mq-item', mq).forEach(it => splitChars(it).forEach(c => mqChars.push(c)));
let mqX = 0, mqVis = true, mqOff = [];
const measure = () => { mqOff = mqChars.map(c => c.offsetLeft); };
if ('IntersectionObserver' in window) new IntersectionObserver(e => mqVis = e[0].isIntersecting).observe($('.marquee'));
if (!RM) {
  let t = 0, dir = 1;
  if (lenis) lenis.on('scroll', e => { if (e.direction) dir = e.direction; });
  const step = () => {
    if (mqVis) {
      if (!mqOff.length) measure();
      t += 1 / 60;
      mqX -= (1 + Math.min(8, velocity() * .08)) * dir;
      const half = mq.scrollWidth / 2; if (mqX <= -half) mqX += half; if (mqX > 0) mqX -= half;
      mq.style.transform = `translate3d(${mqX}px,0,0)`;
      const amp = 0.09 + Math.min(.12, velocity() * .002);
      for (let i = 0; i < mqChars.length; i++) {
        const x = mqOff[i] + mqX;
        mqChars[i].style.transform = `translate3d(0,${(Math.sin(x * .006 - t * 2.4) * amp).toFixed(3)}em,0)`;
      }
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  addEventListener('resize', () => { mqOff = []; });
}

/* ---------- loader exit ---------- */
function exitLoader() {
  if (L.exiting) return;
  L.exiting = true;
  document.body.classList.remove('locked');
  if (!HAS) { $('#loader').remove(); L.done = true; lenis && lenis.start(); return; }
  scrollFX();
  const tl = gsap.timeline({ onComplete: () => { L.done = true; $('#loader').remove(); W.all.splice(W.all.indexOf(loaderLogo), 1); lenis && lenis.start(); ScrollTrigger.refresh(); } });
  tl.to('#loader .cap, #loader .count', { opacity: 0, duration: .4 }, 0)
    .to(loaderLogo.o, { amp: 16, duration: 1, ease: 'power2.in' }, 0)
    .to('#loaderLogo', { yPercent: -120, opacity: 0, duration: 1.1, ease: 'power3.in' }, .1)
    .to(L, { q: 1, duration: 1.5, ease: 'power3.inOut' }, .35);
  heroIntro(.75);
}

// wait for hero images (max 4s), then let the loader finish
const heroImgs = $$('.ph img');
await Promise.race([
  Promise.all(heroImgs.map(i => i.decode ? i.decode().catch(() => { }) : Promise.resolve())),
  new Promise(r => setTimeout(r, 4000))
]);
L.ready = true;
addEventListener('load', () => HAS && ScrollTrigger.refresh());
})();
