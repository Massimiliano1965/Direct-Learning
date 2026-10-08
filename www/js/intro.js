'use strict';
/* =====================================================================
   LO SPLASH INTRO (idea di Massi): una testa di profilo, tratto nero su bianco.
   Dall'orecchio entrano lettere di tutte le lingue mischiate (cinese, arabo, giapponese, russo, greco…),
   dentro la testa girano vorticosamente, poi si mettono in fila ed escono dalla bocca come saluti
   (Ciao, Hello, Привет, 你好…): dodici saluti che si dispongono in cerchio intorno alla testa,
   come le stelle della bandiera europea. Poi «CIAO» e il motto, e si entra nell'app.
   ~6 secondi, si salta toccando lo schermo. Tutto SVG disegnato qui: niente immagini, funziona offline.
   ===================================================================== */
(function () {
  if (typeof document === 'undefined' || !document.body || !window.requestAnimationFrame) return;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 360, H = 640;
  const EAR = [156, 305], MOUTH = [279, 355], VORTEX = [196, 282], RING = [190, 300], R = 148;
  const GLYPHS = '中文語書字愛話あいうえおカタナのを한글말عربيةشلمخحДЖЯЩЮЛБГЫЭШЦΩΣλΨßñçéøåèФ'.split('');
  const HELLO = ['Ciao', 'Hello', 'Привет', '你好', 'مرحبا', 'こんにちは', 'Hallo', 'Hola', 'Bonjour', 'Olá', '안녕', 'Γειά'];
  const N = 44;
  // i tempi (ms)
  const T_HEAD = 900, T_IN0 = 500, T_IN1 = 2300, T_SPIN = 3600, T_OUT0 = 3300, T_OUT1 = 4700, T_TITLE = 4900, T_END = 6600;

  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const clamp = t => t < 0 ? 0 : t > 1 ? 1 : t;
  const lerp = (a, b, t) => a + (b - a) * t;

  const box = document.createElement('div');
  box.id = 'intro';
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease;touch-action:manipulation';
  document.body.appendChild(box);
  const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }, null);
  box.appendChild(svg);

  // la testa di profilo (guarda a destra), disegnata a tratto come un'illustrazione: prima il contorno, poi i dettagli
  const LINE = (d, w, at, dur) => ({ d: d, w: w, at: at, dur: dur });
  const PARTS = [
    // il contorno: la nuca, poi il viso dalla fronte al collo (sopra ci sono i capelli, non il cranio liscio)
    LINE('M138 432 C140 400 122 372 116 340', 3.2, 0, 400),
    LINE('M263 262 C265 280 269 292 275 301 L288 324 C290 330 283 334 276 335 C279 341 280 345 276 349 C280 353 280 359 274 363 C272 374 269 384 258 388 C242 392 232 394 226 402 C229 410 232 416 227 422 L225 432', 3.2, 0, 900),
    // i capelli mossi: il contorno a onde, il ciuffo sulla fronte, le ciocche, la basetta
    LINE('M116 340 C104 318 103 290 110 266 C105 250 112 234 124 225 C127 209 142 199 158 197 C169 187 189 185 203 190 C219 183 239 189 249 201 C263 205 273 221 270 239 C274 251 269 260 263 262', 3, 150, 850),
    LINE('M263 262 C252 256 247 244 251 233 C243 242 238 252 241 263', 1.8, 750, 350),
    LINE('M150 207 C170 200 190 199 207 204', 1.5, 600, 400),
    LINE('M134 233 C150 222 168 218 186 220 C200 212 218 212 233 219', 1.5, 650, 450),
    LINE('M124 262 C136 246 152 238 170 236', 1.5, 700, 400),
    LINE('M119 300 C125 282 137 270 153 264', 1.5, 750, 400),
    LINE('M180 250 C184 264 183 278 178 290', 1.6, 800, 300),
    LINE('M116 340 C121 349 126 353 133 356', 1.6, 850, 250),
    // il sopracciglio, l'occhio con la pupilla e le ciglia
    LINE('M234 268 C244 261 257 261 267 267', 2.4, 850, 300),
    LINE('M244 285 C250 279 258 279 264 284 C258 288 250 289 244 285', 2, 950, 300),
    LINE('M262 281 L267 278', 1.4, 1100, 150),
    // la narice, la bocca, lo zigomo
    LINE('M270 326 C274 323 279 325 280 329', 1.8, 1000, 250),
    LINE('M261 350 C266 352 271 351 277 349', 1.8, 1050, 250),
    LINE('M236 312 C244 324 248 336 246 348', 1.2, 1100, 300),
    // l'orecchio con il padiglione, la mascella
    LINE('M162 286 C146 284 141 318 158 326 C166 329 170 321 167 314 C164 309 160 309 160 304', 2.6, 400, 400),
    LINE('M160 294 C153 298 152 310 157 315', 1.4, 800, 250),
    LINE('M170 330 C182 356 200 378 226 400', 1.4, 950, 400),
    // il colletto: camicia e revers di una giacca sartoriale
    LINE('M128 436 C160 450 204 450 238 438', 2.2, 900, 400),
    LINE('M178 448 L194 470 L210 448', 2, 1050, 350)
  ];
  const lines = PARTS.map(P => {
    const p = el('path', { d: P.d, fill: 'none', stroke: '#111', 'stroke-width': P.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const L = p.getTotalLength ? p.getTotalLength() : 600;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    return { p: p, L: L, at: P.at, dur: P.dur };
  });
  const pupil = el('circle', { cx: 257, cy: 284, r: 2.4, fill: '#111', opacity: 0 }, svg);

  // le lettere: ognuna parte da sinistra, entra nell'orecchio, gira nel vortice, esce dalla bocca
  const glyphs = [];
  for (let i = 0; i < N; i++) {
    const t = el('text', { x: 0, y: 0, 'font-size': 15 + Math.random() * 9, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#111',
      'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
    t.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    glyphs.push({ el: t, y0: 120 + Math.random() * 400, start: T_IN0 + i * ((T_IN1 - T_IN0 - 700) / N), a0: Math.random() * 6.28,
      r0: 16 + Math.random() * 38, spin: 5 + Math.random() * 4, rot: (Math.random() - .5) * 720, out: T_OUT0 + (i / N) * (T_OUT1 - T_OUT0 - 900) });
  }
  // i saluti: escono dalla bocca uno dopo l'altro e vanno al loro posto nel cerchio (come le stelle europee)
  const hellos = HELLO.map((w, i) => {
    const a = -Math.PI / 2 + Math.PI / 12 + i * Math.PI * 2 / HELLO.length;   // un mezzo passo: in basso c'è il colletto
    const t = el('text', { x: MOUTH[0], y: MOUTH[1], 'font-size': i ? 15 : 19, 'font-weight': i ? 600 : 800, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: '#111', 'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
    t.textContent = w;
    return { el: t, a: a, start: T_OUT0 + 300 + i * 110 };
  });
  const title = el('text', { x: W / 2, y: 562, 'font-size': 40, 'font-weight': 300, 'letter-spacing': 8, 'text-anchor': 'middle', fill: '#111', 'font-family': 'Georgia, serif', opacity: 0 }, svg);
  title.textContent = 'CIAO';
  const motto = el('text', { x: W / 2, y: 590, 'font-size': 13, 'text-anchor': 'middle', fill: '#555', 'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
  try { motto.textContent = typeof tx === 'function' ? tx('tagline') : ''; } catch (e) {}

  let t0 = null, done = false;
  function frame(now) {
    if (done) return;
    if (t0 === null) t0 = now;
    const t = now - t0;
    // 1. la testa si disegna
    lines.forEach(l => { l.p.style.strokeDashoffset = l.L * (1 - ease((t - l.at) / l.dur)); });
    pupil.setAttribute('opacity', clamp((t - 1150) / 200));
    // 2–3. le lettere
    glyphs.forEach(g => {
      const lt = t - g.start;
      if (lt < 0) { g.el.setAttribute('opacity', 0); return; }
      let x, y, op = 1, rot = 0;
      const fly = 650;
      if (lt < fly) {                                    // in volo verso l'orecchio
        const k = ease(lt / fly);
        x = lerp(-20, EAR[0], k); y = lerp(g.y0, EAR[1], k); rot = g.rot * (1 - k);
      } else if (t < g.out) {                            // nel vortice: gira sempre più veloce
        const k = (t - g.start - fly) / 1000, grow = clamp(k * 1.6);
        const a = g.a0 + k * g.spin + k * k * 2;
        const r = g.r0 * grow * (1 - clamp((t - T_SPIN + 600) / 1200) * .35);
        x = lerp(EAR[0], VORTEX[0] - 6 + Math.cos(a) * r * 1.1, grow); y = lerp(EAR[1], VORTEX[1] + Math.sin(a) * r, grow);
        rot = a * 57;
      } else {                                           // in fila verso la bocca, poi spariscono
        const k = ease((t - g.out) / 600);
        const a = g.a0 + ((g.out - g.start - fly) / 1000) * g.spin;
        const sx = VORTEX[0] + Math.cos(a) * g.r0 * .9, sy = VORTEX[1] + Math.sin(a) * g.r0 * .7;
        x = lerp(sx, MOUTH[0], k); y = lerp(sy, MOUTH[1], k); rot = 0; op = 1 - clamp((k - .7) / .3);
      }
      g.el.setAttribute('x', x.toFixed(1)); g.el.setAttribute('y', y.toFixed(1));
      g.el.setAttribute('transform', 'rotate(' + rot.toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      g.el.setAttribute('opacity', op.toFixed(2));
    });
    // 4. i saluti in cerchio, che poi girano piano
    const turn = clamp((t - T_OUT1) / 3000) * .5;
    hellos.forEach(s => {
      const lt = t - s.start;
      if (lt < 0) { s.el.setAttribute('opacity', 0); return; }
      const k = ease(lt / 900), a = s.a + turn;
      const ex = RING[0] + Math.cos(a) * R * .88, ey = RING[1] + Math.sin(a) * R * 1.32;
      // dalla bocca escono in avanti, poi curvano verso il loro posto
      const cx = MOUTH[0] + 60, cy = MOUTH[1];
      const x = (1 - k) * (1 - k) * MOUTH[0] + 2 * (1 - k) * k * cx + k * k * ex;   // ex: il cerchio entra nello schermo stretto
      const y = (1 - k) * (1 - k) * MOUTH[1] + 2 * (1 - k) * k * cy + k * k * ey;
      s.el.setAttribute('x', x.toFixed(1)); s.el.setAttribute('y', y.toFixed(1));
      s.el.setAttribute('opacity', clamp(lt / 250).toFixed(2));
      s.el.setAttribute('font-size', ((s.el.textContent === 'Ciao' ? 19 : 15) * lerp(.5, 1, k)).toFixed(1));
    });
    // 5. il nome e il motto
    const tt = clamp((t - T_TITLE) / 700);
    title.setAttribute('opacity', tt); motto.setAttribute('opacity', clamp((t - T_TITLE - 300) / 700));
    if (t >= T_END) { finish(); return; }
    requestAnimationFrame(frame);
  }
  function finish() {
    if (done) return;
    done = true;
    box.style.opacity = '0';
    setTimeout(() => { if (box.parentNode) box.parentNode.removeChild(box); }, 650);
  }
  box.addEventListener('click', finish);
  requestAnimationFrame(frame);
  window.introSkip = finish;
})();
