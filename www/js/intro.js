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
  const EAR = [166, 295], MOUTH = [261, 320], VORTEX = [182, 228], RING = [180, 262], R = 145;
  const INK = '#222', PAPER = '#f1eee6';   // il tratto e la carta del disegno di Massi
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
  box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:' + PAPER + ';display:flex;align-items:center;justify-content:center;transition:opacity .6s ease;touch-action:manipulation';
  document.body.appendChild(box);
  const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }, null);
  box.appendChild(svg);

  // la testa di profilo: RICALCATA dal disegno di Massi (busto a tratto sottile, cranio chiuso, bocca aperta),
  // senza le lettere; aggiunti l'orecchio e l'occhio. Coordinate del disegno (498×1024), rimpicciolite nel gruppo.
  const LINE = (d, w, at, dur) => ({ d: d, w: w, at: at, dur: dur });
  const PARTS = [
    LINE('M38 752 C39 751 42 747 44 744 C46 741 48 739 50 736 C52 734 54 731 56 729 C59 726 61 724 63 722 C65 720 67 717 70 715 C72 713 74 711 76 708 C79 706 81 704 83 702 C86 700 88 697 90 695 C93 693 95 691 97 689 C100 687 102 685 105 683 C107 681 110 679 113 677 C115 675 117 673 120 671 C122 669 124 666 126 664 C128 662 131 660 134 658 C136 657 139 655 141 653 C144 651 146 649 147 646 C149 644 151 641 152 638 C154 635 155 632 156 629 C156 626 157 623 158 620 C159 616 159 613 160 610 C161 607 161 604 161 600 C162 597 161 594 161 591 C160 588 159 585 158 582 C157 579 155 576 154 572 C153 569 152 566 150 563 C149 560 148 557 146 554 C145 551 143 548 142 545 C140 542 139 539 138 536 C136 533 135 530 134 528 C132 525 131 522 129 519 C127 517 126 514 124 511 C123 508 121 505 120 502 C118 499 117 496 115 493 C114 490 112 487 111 484 C109 481 108 478 107 475 C106 472 105 469 103 466 C102 463 101 460 100 457 C100 454 99 450 98 447 C98 444 97 441 97 437 C97 434 97 431 96 428 C96 424 96 421 96 418 C96 414 95 411 95 408 C95 405 95 401 95 398 C95 395 95 392 96 389 C97 385 97 382 98 379 C99 376 100 373 101 370 C102 367 103 364 104 361 C106 358 107 355 108 352 C109 348 110 345 112 342 C113 339 114 336 116 334 C118 331 121 329 123 327 C125 325 128 323 131 321 C134 319 136 317 139 315 C142 313 144 311 147 309 C149 308 152 306 155 304 C158 303 161 301 164 300 C167 298 170 297 173 295 C176 294 179 293 182 291 C185 290 188 289 191 288 C195 287 198 287 201 286 C205 286 208 286 211 286 C215 286 218 286 221 286 C224 286 228 287 231 287 C234 287 238 287 241 287 C244 287 248 287 251 288 C254 288 257 289 261 289 C264 290 267 291 270 292 C273 293 276 294 279 295 C282 296 285 297 289 298 C292 299 295 300 298 301 C301 302 304 304 307 305 C310 306 313 308 316 310 C319 311 321 313 324 315 C327 316 330 318 332 320 C335 322 337 324 340 326 C342 329 344 331 346 333 C348 336 350 338 352 341 C354 343 356 346 358 348 C360 351 362 354 364 357 C365 359 367 363 368 365 C370 368 371 371 373 374 C374 377 375 380 376 383 C377 386 377 389 378 393 C378 396 378 399 379 402 C380 405 381 408 382 411 C382 415 384 418 384 421 C384 424 385 427 384 430 C384 433 382 435 380 438 C379 441 377 443 377 446 C376 449 377 452 378 455 C379 458 381 461 382 464 C384 467 386 470 387 473 C389 476 390 479 392 481 C394 484 395 488 397 490 C398 493 400 496 401 498 C402 500 404 502 404 503  C405 505 408 510 409 513 C410 516 411 518 410 520 C409 522 407 525 404 527 C401 529 395 530 392 531 C389 532 385 532 384 533 C383 534 386 538 386 540 C386 542 388 544 387 546 C386 548 383 548 381 549 C379 550 376 549 376 551 C376 553 378 556 379 559 C380 562 383 564 383 566 C383 568 381 571 379 573 C377 575 374 576 373 579 C372 582 374 585 375 588 C376 591 378 594 378 598 C378 602 377 606 375 610 C373 614 371 617 368 620 C365 623 359 626 357 627', 2.2, 0, 1300),
    LINE('M233 540 C233 542 233 547 233 550 C233 553 233 557 233 560 C234 563 235 567 236 570 C237 573 238 576 240 578 C242 581 244 583 246 585 C248 588 251 590 253 592 C256 594 258 596 261 598 C264 600 266 602 269 603 C272 605 275 606 278 608 C281 610 284 611 287 613 C290 614 293 616 296 617 C299 618 302 620 305 621 C308 622 311 623 314 624 C318 625 321 625 324 626 C327 627 330 627 333 628 C336 628 340 629 343 629 C345 629 348 629 350 629 C352 629 353 628 354 628', 2.2, 650, 450),
    LINE('M314 629 C314 631 313 635 312 638 C311 642 310 645 309 648 C308 651 306 654 305 657 C304 660 302 663 302 666 C301 669 300 672 300 676 C299 679 298 682 298 685 C298 688 297 692 297 694 C296 697 296 700 296 703 C295 706 295 708 295 711 C294 713 294 716 294 718 C295 720 295 723 295 724', 2.2, 850, 300),
    LINE('M301 706 C302 707 307 709 310 710 C313 712 316 713 319 715 C322 717 325 718 327 720 C330 722 333 723 336 725 C339 727 342 729 344 731 C347 733 350 735 352 737 C355 739 357 741 359 743 C361 746 363 748 365 751 C367 754 368 756 370 759 C372 761 374 765 375 766', 2.2, 1000, 300),
    LINE('M236 486 C214 480 206 512 214 530 C218 540 230 542 232 532 C233 526 226 522 227 515', 2, 900, 350),
    LINE('M228 495 C220 499 220 512 225 518', 1.3, 1150, 200),
    LINE('M356 436 C364 431 373 431 380 435', 2, 1050, 250),
    LINE('M356 450 C362 446 369 447 374 451 C368 454 361 455 356 452', 1.6, 1150, 250)
  ];
  const headG = el('g', { transform: 'translate(25 -21) scale(0.62)' }, svg);
  const lines = PARTS.map(P => {
    const p = el('path', { d: P.d, fill: 'none', stroke: INK, 'stroke-width': P.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, headG);
    const L = p.getTotalLength ? p.getTotalLength() : 600;
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    return { p: p, L: L, at: P.at, dur: P.dur };
  });
  const pupil = el('circle', { cx: 366, cy: 450.5, r: 2.4, fill: INK, opacity: 0 }, headG);

  // le lettere: ognuna parte da sinistra, entra nell'orecchio, gira nel vortice, esce dalla bocca
  const glyphs = [];
  for (let i = 0; i < N; i++) {
    const t = el('text', { x: 0, y: 0, 'font-size': 15 + Math.random() * 9, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK,
      'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
    t.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
    glyphs.push({ el: t, y0: 120 + Math.random() * 400, start: T_IN0 + i * ((T_IN1 - T_IN0 - 700) / N), a0: Math.random() * 6.28,
      r0: 16 + Math.random() * 38, spin: 5 + Math.random() * 4, rot: (Math.random() - .5) * 720, out: T_OUT0 + (i / N) * (T_OUT1 - T_OUT0 - 900) });
  }
  // i saluti: escono dalla bocca uno dopo l'altro e vanno al loro posto nel cerchio (come le stelle europee)
  const hellos = HELLO.map((w, i) => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / HELLO.length;   // «Ciao» in alto, uno in basso sul petto, tra le linee del collo
    const t = el('text', { x: MOUTH[0], y: MOUTH[1], 'font-size': i ? 15 : 19, 'font-weight': i ? 600 : 800, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: INK, 'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
    t.textContent = w;
    return { el: t, a: a, start: T_OUT0 + 300 + i * 110 };
  });
  const title = el('text', { x: W / 2, y: 545, 'font-size': 40, 'font-weight': 300, 'letter-spacing': 8, 'text-anchor': 'middle', fill: INK, 'font-family': 'Georgia, serif', opacity: 0 }, svg);
  title.textContent = 'CIAO';
  const motto = el('text', { x: W / 2, y: 573, 'font-size': 13, 'text-anchor': 'middle', fill: '#555', 'font-family': 'system-ui, sans-serif', opacity: 0 }, svg);
  try { motto.textContent = typeof tx === 'function' ? tx('tagline') : ''; } catch (e) {}

  let t0 = null, done = false;
  function frame(now) {
    if (done) return;
    if (t0 === null) t0 = now;
    const t = now - t0;
    // 1. la testa si disegna
    lines.forEach(l => { l.p.style.strokeDashoffset = l.L * (1 - ease((t - l.at) / l.dur)); });
    pupil.setAttribute('opacity', clamp((t - 1300) / 200));
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
    const turn = 0;   // il cerchio sta fermo: i saluti restano lontani dal viso
    hellos.forEach(s => {
      const lt = t - s.start;
      if (lt < 0) { s.el.setAttribute('opacity', 0); return; }
      const k = ease(lt / 900), a = s.a + turn;
      const ex = RING[0] + Math.cos(a) * R, ey = RING[1] + Math.sin(a) * R * 1.12;
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
