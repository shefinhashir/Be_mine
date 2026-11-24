/* ================= CONFIG: edit everything here ================= */
const CONFIG = {
  herName: "Lellu",
  myName: "Hashi",
  nickname: "Lellu",            // reserved for the stretch Easter egg
  whatsappNumber: "919037305962",    // country code + number, no + or spaces
  musicFile: "assets/song.mp3",      // optional; site works without it
  firstMemory: "the day we met",     // used in the build-up line
  letter: "Dear Lellu,\nIt started with a secret message from my phone, and I'm still grateful my friends were that crazy. Then came our first real meeting, IEDC Smmit where all my thoughts changed, the long talks on that bench and after that hours of calls, the quiet wait at the railway station, and a bike ride to the cinema that I never wanted to end.\nSomewhere between all of that, you became my sunshine. You make my ordinary days feel golden.\n\nThank you for saying yes. I promise to keep making you smile, for every sunrise that comes.\n\nYours, always,\nHashir 🌻",
  timeline: [                        // dates as YYYY-MM-DD; first one drives the day counter
    { date: "2026-09-20", title: "The first text", text: "They lit the spark, but I turned it into a story.", photo: "assets/1.jpg", emoji: "✨" },
    { date: "2026-09-23", title: "First time i met you", text: "That day, the song spoke of forever, the heavens echoed its words, and nature seemed to know what our hearts hadn't discovered yet", photo: "assets/2.jpg", emoji: "💬" },
    { date: "2026-09-28", title: "IEDC Summit", text: "It was something that the words cant describe... ", photo: "assets/3.jpg", emoji: "😂" },
    { date: "2026-09-29", title: "First time we talk for a long..", text: "We sat under a tree, talking about everything and nothing. I didn't know then that I'd wish I could relive that moment", photo: "assets/4.jpg", emoji: "☕" },
    { date: "2026-09-30", title: "Way to the station", text: "Between the announcements, arriving trains and passing strangers, all I really remember is sitting there with her.", photo: "assets/5.jpg", emoji: "🤭" },
    { date: "2026-11-21", title: "The First Hangout", text: "I remember the movie, but I remember the ride with you even more. And that peaceful little place where neither of us seemed to need anything else", photo: "assets/6.jpg", emoji: "🌻" }
  ],
  reasons: ["Your laugh", "The way you care", "[add 8–12 short reasons — used by the stretch sunflower act]"]
};

/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);
const safe = f => { try { return f(); } catch (e) {} };
const buzz = p => safe(() => navigator.vibrate && navigator.vibrate(p));
const fmt = d => new Date(d + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
let muted = safe(() => localStorage.getItem('muted') === '1') || false, audio, ctx, lenis, dayTL, opened = false;
gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); // no jumps when the phone URL bar hides
document.querySelectorAll('[data-her]').forEach(e => e.textContent = CONFIG.herName);
document.querySelectorAll('[data-me]').forEach(e => e.textContent = CONFIG.myName);
$('#fm').textContent = CONFIG.firstMemory;

/* soft synth tones for sfx (muted by the music toggle) */
function tone(f1, f2, dur, vol = .08) {
  if (muted) return;
  safe(() => {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(t + dur);
  });
}
/* falling emoji (petals, emoji rain) */
function rain(chars, n, size = 22) {
  if (RM) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'fall'; s.textContent = chars[i % chars.length];
    s.style.cssText = `left:${rand(0, 100)}vw;font-size:${rand(size * .7, size * 1.4)}px;animation-duration:${rand(3, 6)}s;animation-delay:${rand(0, 1.2)}s;--dx:${rand(-60, 60)}px`;
    $('#fx').appendChild(s); setTimeout(() => s.remove(), 8000);
  }
}
const burst = (o = {}) => typeof confetti === 'function' && confetti({ colors: ['#FFD43B', '#FFB800', '#FFF9F0', '#FF8A5B'], particleCount: 90, spread: 80, origin: { y: .6 }, ...o });

/* ================= ACT 0: THE GATE ================= */
function actGate() {
  const fill = $('#fill'), sun = $('#sun'), p = { v: 0 }; let tw;
  const render = () => { fill.setAttribute('y', 170 - p.v * 140); gsap.set(sun, { scale: 1 + p.v * .14, filter: `drop-shadow(0 0 ${p.v * 38}px rgba(255,184,0,.95))` }); }; // sun swells + glows as you hold
  const start = () => { if (opened) return; buzz(15); tone(180, 700, 1.5, .05);
    tw = gsap.to(p, { v: 1, duration: 1.5, ease: 'none', onUpdate: render, onComplete: openSite }); };
  const stop = () => { if (opened) return; tw && tw.kill(); gsap.to(p, { v: 0, duration: .6, onUpdate: render }); };
  sun.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => sun.addEventListener(e, stop));
  sun.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } });
  sun.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  sun.addEventListener('contextmenu', e => e.preventDefault());
}
function openSite() {
  opened = true; buzz([30, 40, 30]); burst({ particleCount: 140, spread: 360, startVelocity: 35, origin: { x: .5, y: .45 } });
  $('#story').hidden = false; $('#music').hidden = false; $('#counter').hidden = false;
  document.body.classList.remove('locked');
  gsap.to('#gate', { opacity: 0, duration: 1.1, onComplete: () => $('#gate').remove() });
  startMusic(); actHero(); actTimeline(); actBuildup(); actQuestion(); actProgress(); actBee(); actTouch();
  if (!RM) { lenis = new Lenis({ lerp: .09 }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  dayCycle(); ScrollTrigger.refresh(); safe(() => document.fonts.ready.then(() => dispatchEvent(new Event("resize")))); // re-measure once fonts load
}

/* ================= MUSIC ================= */
function startMusic() {
  audio = new Audio(CONFIG.musicFile); audio.loop = true; audio.volume = 0; audio.muted = muted;
  audio.play().then(() => gsap.to(audio, { volume: .35, duration: 3 })).catch(() => {});
  const b = $('#music'); b.classList.toggle('on', !muted);
  b.onclick = () => { muted = !muted; audio.muted = muted; b.classList.toggle('on', !muted); safe(() => localStorage.setItem('muted', muted ? '1' : '0')); };
}

/* ================= DAY CYCLE (sky follows scroll) ================= */
function dayCycle() {
  if (RM) { gsap.set(document.body, { '--c1': '#FFE98A', '--c2': '#FFFBEA', '--c3': '#FFF3C4' }); return; }
  const S = (a, b, c, ink = '#3B2A00') => ({ '--c1': a, '--c2': b, '--c3': c, '--ink': ink });
  dayTL = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: .6 } })
    .to(document.body, { ...S('#FFF3C4', '#FFE98A', '#BFE3FF'), duration: 1 })      // bright morning
    .to(document.body, { ...S('#FFF3C4', '#FFD43B', '#FFE98A'), duration: 2.7 })    // noon
    .to(document.body, { ...S('#FFB800', '#FFD9A8', '#F08C00'), duration: 2.7 })    // golden hour
    .to(document.body, { ...S('#F08C00', '#FF8A5B', '#5A3A00'), duration: 1.5 })    // dusk
    .to(document.body, { ...S('#2A1D00', '#3B2A00', '#1A1200', '#FFFBEA'), duration: 1.5 }) // night
    .to({}, { duration: .6 });
}

/* ================= ACT 1: HERO ================= */
function actHero() {
  const hs = $('#heroSun'); hs.innerHTML = sunSVG('happy'); // tap the mascot: it falls in love
  hs.onclick = () => { hs.innerHTML = sunSVG('love'); buzz(20); tone(520, 880, .3); rain(['💛', '♥'], 10, 20); setTimeout(() => hs.innerHTML = sunSVG('happy'), 1400); };
  const h = new Date().getHours();
  $('#greet').textContent = `Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}, ${CONFIG.herName}`;
  if (!RM) {
    gsap.from('.hw', { yPercent: 120, rotate: 7, opacity: 0, filter: 'blur(14px)', stagger: .11, duration: 1.4, ease: 'expo.out', delay: .3, clearProps: 'filter' });
    gsap.to('#hero h1, #heroSun', { yPercent: -18, opacity: 0, ease: 'power1.in', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    for (let i = 0; i < 12; i++) { const d = document.createElement('span'); d.className = 'drift'; d.textContent = ['✦', '♥', '✿'][i % 3];
      d.style.cssText = `left:${rand(0, 95)}vw;font-size:${rand(14, 28)}px;animation-delay:${-rand(0, 14)}s`; d.style.color = ['#FFB800', '#FF8A5B', '#FFF9F0'][i % 3]; $('#hero').appendChild(d); }
  }
  const first = new Date(CONFIG.timeline[0].date + 'T00:00'), n = Math.max(0, Math.floor((Date.now() - first) / 864e5)), o = { v: 0 };
  gsap.to(o, { v: n, duration: RM ? 0 : 2.5, onUpdate: () => $('#days').textContent = Math.round(o.v) });
}

/* ================= ACT 2: TIMELINE ================= */
function actTimeline() {
  const wrap = $('#steps'), path = $('#trailPath'), sun = $('#trailSun'), n = CONFIG.timeline.length; let L = 1, nodes = [];
  CONFIG.timeline.forEach((t, i) => wrap.insertAdjacentHTML('beforeend',
    `<article class="step ${i % 2 ? 'r' : 'l'}"><div class="card glass" style="--rot:${i % 2 ? 2.5 : -2.5}deg"><span class="chip">${fmt(t.date)}</span>
     <div class="polaroid"><i class="tape"></i><div class="ph-wrap"><img src="${t.photo}" alt="${t.title}" loading="lazy"><div class="ph" hidden>${t.emoji}</div></div></div>
     <h3>${t.title}</h3><p class="note">${t.text}</p></div></article>`));
  wrap.querySelectorAll('img').forEach(im => im.onerror = () => { im.hidden = true; im.nextElementSibling.hidden = false; }); // golden placeholder
  wrap.querySelectorAll('.card').forEach((c, i) => {
    c.addEventListener('click', () => { buzz(10); tone(660, 990, .25); rain([CONFIG.timeline[i].emoji, '💛'], 14); }); // tap = emoji rain
    if (!RM) { // blur-in spring reveal, staggered contents, photo parallax
      gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 82%' } })
        .from(c, { y: 90, scale: .9, rotate: i % 2 ? 6 : -6, opacity: 0, filter: 'blur(14px)', duration: 1.2, ease: 'expo.out', clearProps: 'filter' })
        .from(c.querySelectorAll('.chip,h3,.note'), { y: 16, opacity: 0, filter: 'blur(6px)', stagger: .12, duration: .8, ease: 'power3.out', clearProps: 'filter' }, .3);
      gsap.fromTo(c.querySelector('.ph-wrap img'), { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: c, scrub: true, start: 'top bottom', end: 'bottom top' } });
    }
  });
  function build() { // winding sunbeam trail, rebuilt on resize
    const W = wrap.offsetWidth, H = wrap.offsetHeight, X = p => p * W / 100;
    $('#trail').setAttribute('viewBox', `0 0 ${W} ${H}`);
    let d = `M${X(50)} 0`, x = X(50), y = 0, pts = [];
    for (let i = 0; i < n; i++) { const nx = X(i % 2 ? 28 : 72), ny = (i + .5) * H / n, m = (y + ny) / 2; d += ` C${x} ${m} ${nx} ${m} ${nx} ${ny}`; x = nx; y = ny; pts.push([nx, ny]); }
    const e = y + H / (2 * n); d += ` C${x} ${e} ${X(50)} ${e} ${X(50)} ${H}`;
    path.setAttribute('d', d); $('#track').setAttribute('d', d);
    nodes.forEach(t => t.remove()); // sunflower nodes bloom as the sun passes
    nodes = pts.map(([px, py]) => { const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', px); t.setAttribute('y', py + 10); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 30);
      t.setAttribute('class', RM ? 'node on' : 'node'); t.dataset.y = py; t.textContent = '🌻'; $('#trail').appendChild(t); return t; }); L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = RM ? 0 : L;
  }
  build(); addEventListener('resize', build);
  ScrollTrigger.create({ trigger: wrap, start: 'top 60%', end: 'bottom 60%', scrub: true, onUpdate: s => {
    const l = s.progress * L, pt = path.getPointAtLength(l);
    path.style.strokeDashoffset = L - l; nodes.forEach(t => t.classList.toggle('on', pt.y >= +t.dataset.y)); sun.style.transform = `translate(${pt.x}px,${pt.y}px) translate(-50%,-50%)`; } });
}

/* ================= ACT 4: BUILD-UP ================= */
function actBuildup() { // a sunset, then stars draw a heart: our memories as a constellation
  const b = $('#build'), hp = $('#hp'), hd = $('#hd'), NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 70; i++) { const st = document.createElement('i'); st.className = 'star'; st.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%`; b.appendChild(st); }
  let d = ''; for (let k = 0; k <= 72; k++) { const t = k / 72 * Math.PI * 2, sn = Math.sin(t);
    d += (k ? 'L' : 'M') + (100 + 83 * sn ** 3).toFixed(1) + ' ' + (92 - 5.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))).toFixed(1); }
  hp.setAttribute('d', d + 'Z'); const L = hp.getTotalLength(); hp.style.strokeDasharray = L; hp.style.strokeDashoffset = RM ? 0 : L;
  for (let i = 0; i < 16; i++) { const pt = hp.getPointAtLength(L * i / 16), c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', i % 4 ? 2.6 : 4.2); c.setAttribute('class', 'hs'); hd.appendChild(c); }
  if (RM) { hp.style.fill = 'rgba(255,212,59,.3)'; return; }
  const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top top', end: '+=260%', scrub: true, pin: true,
    onUpdate: s => { audio && !audio.paused && (audio.volume = .35 + .5 * s.progress); $('#heart').classList.toggle('beat', s.progress > .92); } } }); // music swells, heart beats
  tl.to('.sinksun', { yPercent: 170, opacity: 0, duration: 2.2, ease: 'none' }, 0)
    .to('.star', { opacity: .9, stagger: { amount: 2 }, duration: 1 }, .8)
    .to(hp, { strokeDashoffset: 0, duration: 3, ease: 'none' }, 1)
    .fromTo('.hs', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: { amount: 2.6 }, duration: .5, ease: 'back.out(3)' }, 1)
    .to(hp, { fill: 'rgba(255,212,59,.35)', duration: 1 }, 4);
  ['.bl1', '.bl2', '.bl3'].forEach((q, i) => { tl.fromTo(q, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6 }, i * 1.6);
    if (i < 2) tl.to(q, { opacity: 0, duration: .4 }, i * 1.6 + 1.1); });
}

/* ================= ACT 5: THE QUESTION ================= */
function actQuestion() {
  const ask = $('#ask'), yes = $('#yes'), no = $('#no'), face = $('#face');
  const labels = ['Are you sure? 🥺', 'Think again…', 'Pretty please?', "You're making this hard 😭", 'Okay, last chance'];
  const faces = ['hmm', 'hmm', 'sad', 'sad', 'cry']; let n = 0, last = 0; const mood = m => face.innerHTML = sunSVG(m); mood('happy');
  if (!RM) gsap.from('#face, #ask h2, .btns', { opacity: 0, y: 50, filter: 'blur(16px)', stagger: .2, duration: 1.4, ease: 'expo.out', clearProps: 'filter', scrollTrigger: { trigger: '#ask', start: 'top 55%' } });
  for (let i = 0; i < 18; i++) { const f = document.createElement('i'); f.className = 'ff';
    f.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;--dx:${rand(-40, 40)}px;--dy:${rand(-60, 60)}px;animation-delay:${-rand(0, 6)}s`; ask.appendChild(f); }
  function dodge(e) { // works for mouse (enter) and touch (down); debounced so one try counts once
    if (Date.now() - last < 350) return; last = Date.now(); e.preventDefault(); n++; buzz(10); tone(300, 200, .2);
    if (n > labels.length) { no.remove(); gsap.to(yes, { scale: 1.8, duration: .6, ease: 'back.out(2)' }); mood('cry'); return; }
    no.textContent = labels[n - 1]; mood(faces[n - 1]);
    gsap.to(no, { x: rand(-110, 110), y: rand(-80, 80), scale: Math.max(.6, 1 - n * .08), duration: .35, ease: 'back.out(2)' });
    gsap.to(yes, { scale: 1 + n * .12, duration: .4, ease: 'back.out(2)' });
  }
  no.addEventListener('pointerenter', dodge); no.addEventListener('pointerdown', dodge); no.addEventListener('click', e => e.preventDefault());
  yes.addEventListener('pointerenter', () => mood('love'));
  yes.addEventListener('pointerleave', () => mood(n ? faces[Math.min(n, 5) - 1] || 'cry' : 'happy'));
  yes.addEventListener('click', actYes);
}

/* ================= ACT 6: SHE SAID YES ================= */
function actYes() {
  dayTL && dayTL.scrollTrigger.kill();           // stop the scroll-driven sky
  buzz([80, 60, 80, 60, 160]); tone(70, 45, .25, .25); setTimeout(() => tone(70, 45, .25, .25), 350);
  $('#today').textContent = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  $('#wa').href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent('I said YES 🌻 — ' + CONFIG.herName)}`;
  gsap.set('#rise', { display: 'block' });
  gsap.fromTo('#rise', { yPercent: 100 }, { yPercent: 0, duration: 2.4, ease: 'power2.inOut', onComplete: () => gsap.to('#rise', { opacity: .45, duration: 2 }) });
  gsap.to(document.body, { '--c1': '#FFD9A8', '--c2': '#FFE98A', '--c3': '#FFFBEA', '--ink': '#3B2A00', duration: 2.4 });
  gsap.to('#ask', { opacity: 0, duration: 1.2, delay: 1 });
  let k = 0; const iv = setInterval(() => { burst({ particleCount: 70, angle: rand(55, 125), spread: 90, origin: { x: rand(.1, .9), y: .9 } }); if (++k > 8) clearInterval(iv); }, 350);
  rain(['🌻', '🐝', '🎈', '💛'], 30, 30);
  setTimeout(() => {
    const c = $('#cert'); c.hidden = false; ScrollTrigger.refresh();
    c.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    if (!RM) gsap.from('.paper', { scale: .8, y: 80, opacity: 0, duration: 1.3, ease: 'back.out(1.5)' });
    const sp = $('#sigp'), L = sp.getTotalLength(); sp.style.strokeDasharray = L; sp.style.strokeDashoffset = L;
    gsap.to(sp, { strokeDashoffset: 0, duration: RM ? 0 : 2.5, delay: 1 });
    let i = 0; const t = setInterval(() => { $('#letter').textContent = CONFIG.letter.slice(0, ++i); if (i >= CONFIG.letter.length) clearInterval(t); }, RM ? 0 : 28);
    setInterval(() => rain(['🌻', '🌼', '💛'], 3, 20), 1400);   // endless gentle petal rain
  }, 2200);
}

/* ================= EXTRAS: progress ribbon + bee ================= */
function actProgress() {
  const i = $('#ribbon i'), b = $('#ribbon b');
  ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: s => { i.style.transform = `scaleX(${s.progress})`; b.style.left = s.progress * 100 + '%'; } });
}
function actBee() {
  if (RM) return;
  const bee = $('#bee'), x = gsap.quickTo(bee, 'x', { duration: 1.2, ease: 'power3' }), y = gsap.quickTo(bee, 'y', { duration: 1.2, ease: 'power3' });
  gsap.to(bee, { opacity: 1, duration: 1 });
  addEventListener('pointermove', e => { x(e.clientX + 18); y(e.clientY + 18); });
  setInterval(() => { x(rand(20, innerWidth - 40)); y(rand(80, innerHeight - 60)); }, 3000); // wanders on touch screens
}

/* ================= SUN MASCOT (moods: happy, hmm, sad, cry, love) ================= */
function sunSVG(m = 'happy') {
  const mouth = { happy: '<path d="M51 69Q60 78 69 69"/>', hmm: '<path d="M54 73h12"/>', sad: '<path d="M52 75Q60 67 68 75"/>', cry: '<path d="M52 75Q60 67 68 75"/>', love: '<path d="M50 67Q60 84 70 67Z" fill="#8A3B00"/>' }[m];
  const eyes = m === 'love' ? '<text x="46" y="64" text-anchor="middle" font-size="15" fill="#FF8A5B" stroke="none">♥</text><text x="74" y="64" text-anchor="middle" font-size="15" fill="#FF8A5B" stroke="none">♥</text>'
    : '<g class="eyes" fill="#3B2A00" stroke="none"><ellipse cx="46" cy="58" rx="4" ry="5"/><ellipse cx="74" cy="58" rx="4" ry="5"/></g>';
  const tears = m === 'cry' ? '<path d="M42 64q-4 7 0 9 4-2 0-9M78 64q-4 7 0 9 4-2 0-9" fill="#9ED0FF" stroke="none"/>' : '';
  const rays = [...Array(12)].map((_, i) => `<rect x="56" y="3" width="8" height="15" rx="4" transform="rotate(${i * 30} 60 60)"/>`).join('');
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="sg" cx=".35" cy=".3"><stop offset="0" stop-color="#FFFBE0"/><stop offset=".55" stop-color="#FFD43B"/><stop offset="1" stop-color="#FFB800"/></radialGradient></defs>
  <g class="mr" fill="#FFB800" stroke="#3B2A00" stroke-width="2.5">${rays}</g><circle cx="60" cy="60" r="38" fill="url(#sg)" stroke="#3B2A00" stroke-width="3"/>
  <g fill="none" stroke="#3B2A00" stroke-width="3" stroke-linecap="round">${mouth}</g>${eyes}${tears}
  <ellipse cx="37" cy="70" rx="6.5" ry="4.2" fill="#FF8A5B" opacity=".6"/><ellipse cx="83" cy="70" rx="6.5" ry="4.2" fill="#FF8A5B" opacity=".6"/></svg>`;
}

/* ================= EXTRA: tap anywhere = tiny heart floats up ================= */
function actTouch() {
  addEventListener('pointermove', e => { const r = document.documentElement.style; r.setProperty('--ex', ((e.clientX / innerWidth) - .5) * 7); r.setProperty('--ey', ((e.clientY / innerHeight) - .5) * 5); }); // eyes follow your finger
  if (RM) return;
  addEventListener('pointerdown', e => {
    if (e.target.closest('button,a')) return;
    const h = document.createElement('span'); h.textContent = ['💛', '🌻', '✨'][Math.floor(rand(0, 3))];
    h.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:95;pointer-events:none;font-size:22px;translate:-50% -50%`;
    document.body.appendChild(h);
    gsap.to(h, { y: -90, x: rand(-30, 30), opacity: 0, scale: 1.6, rotate: rand(-30, 30), duration: 1.1, ease: 'power2.out', onComplete: () => h.remove() });
  });
}

actGate();
