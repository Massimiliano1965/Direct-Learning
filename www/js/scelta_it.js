'use strict';
/* =====================================================================
   LIVELLO 4: le lezioni «le cose dell'Italia» (choiceLesson). Si carica dopo verbs_it.js (le persone) e colaz_it.js (il cibo).
   Ogni figura ha una risposta scelta tra poche (il cappuccino, il treno, Roma…); la frase è sempre la stessa forma:
     Lezione 90 «Al bar»:  Al bar Max prende un cappuccino.     Che cosa prende Max al bar?    → Max prende un cappuccino.
   Si capisce: la cosa con la parola davanti giusta («un cappuccino», «in treno», «a Roma»), il «non», chi lo fa.
   Va bene anche solo la cosa («Un cappuccino.»). Errori: la cosa sbagliata, la parola davanti sbagliata («una cappuccino»).
   ===================================================================== */

// proper(parola) = è un nome proprio (resta maiuscolo dopo «Sì,»); same(c1, c2) = le cose che si possono confrontare
// cfg: flag, CH = { chiave: { the: 'un cappuccino', alias: ['cappuccini'] } }, items = { X: { who: 'm' | 'f' | null, c: chiave } },
//      say(X, c, neg) = la frase, q(X) = la domanda chiave, lead(X) = parole davanti nella presentazione, fig(X), wrong = parole sbagliate al posto del verbo
function choiceLesson(cfg) {
  const IT = cfg.items, CH = cfg.CH;
  const isX = (X) => !!IT[X];
  const ch = (X) => IT[X].c;
  const others = (X) => Object.keys(CH).filter(c => c !== ch(X) && (!cfg.same || cfg.same(c, ch(X))));
  const other = (X) => pick(others(X));
  const say = (X, c, neg) => cfg.say(X, c || ch(X), !!neg);
  Object.keys(IT).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cfg.fig(X, IT[X]) }); });
  const SX = gTag(cfg.flag, {
    present: (X) => { const p = (cfg.lead ? cfg.lead(X) + ' ' + lc(say(X)) : say(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
    yes: (X) => ({ type: 'yes', show: X, prompt: say(X) + '?', model: 'Sì, ' + lc(say(X)) + '.' }),
    neg: (X) => { const o = other(X); return { type: 'neg', show: X, ask: o, prompt: say(X, o) + '?', model: 'No, ' + lc(say(X, o, true)) + '.', complete: say(X) + '.' }; },
    alt: (X) => { const o = other(X), ord = Math.random() < 0.5 ? [ch(X), o] : [o, ch(X)];
      return { type: 'alt', show: X, prompt: say(X, ord[0]) + ' o ' + CH[ord[1]].the + '?', model: say(X) + '.' }; },
    key: (X) => ({ type: 'key', show: X, prompt: cfg.q(X), model: say(X) + '.' }),
    reveal: (X) => ({ type: 'reveal', show: X, prompt: cfg.q(X) + ' ' + say(X) + '.', model: '' }),
    askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cfg.q(X), model: cfg.q(X) })
  });
  // i nomi propri restano maiuscoli: «Sì, Max prende…», «No, a Roma…» (lc toglie la maiuscola solo alle parole comuni)
  function lc(t) { const w = t.split(' ')[0]; return cfg.proper && cfg.proper(w) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  // le cose: la frase normalizzata e la parola principale (l'ultima), più gli alias
  const PH = {};
  Object.keys(CH).forEach(c => { const t = gNorm(CH[c].the).trim().split(' ');
    PH[c] = { pre: t.slice(0, -1), word: t[t.length - 1], alias: (CH[c].alias || []).map(a => gNorm(a).trim()),
      alt: (CH[c].alt || []).map(a => gNorm(a).trim().split(' ').slice(0, -1)) }; });   // alt = altre forme giuste («col treno»)
  const qN = (X) => gNorm(cfg.q(X)).trim();
  function statements(s, X) {
    s = s.replace(new RegExp(' ' + qN(X).replace(/ /g, ' ') + ' ', 'g'), ' # ');
    if (cfg.strip) s = s.replace(cfg.strip, ' # ');
    const names = vNames(), w = s.trim().split(' '), out = [];
    for (let i = 0; i < w.length; i++) {
      const c = Object.keys(PH).find(k => PH[k].word === w[i] || PH[k].alias.indexOf(w[i]) !== -1);
      if (!c) continue;
      const P = PH[c], fits = (pre) => pre.every((t, k) => w[i - pre.length + k] === t);
      const okPre = P.word === w[i] && ([P.pre].concat(P.alt).find(fits) || null), n = okPre ? okPre.length : P.pre.length, ok = !!okPre;
      // indietro, fino a 4 parole: il «non», il nome, una parola sbagliata
      let neg = false, who = null, bad = false;
      for (let j = i - n - 1; j >= Math.max(0, i - n - 5); j--) {
        if (w[j] === '#' || w[j] === 'o' || w[j] === 'si' || w[j] === 'no') break;
        if (w[j] === 'non') neg = true;
        if (names[w[j]]) { who = names[w[j]]; break; }
        if (cfg.wrong && cfg.wrong.indexOf(w[j]) !== -1) bad = true;
      }
      out.push({ c: c, ok: ok && !bad, neg: neg, who: who });
    }
    return out;
  }
  function evaluateX(step, text) {
    const s = gNorm(text), X = step.show;
    if (step.type === 'echo' && step.check === 'question') return { ok: has(s, qN(X)), full: true };
    const st = statements(s, X), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
    const whoOk = (x) => x.who === null || !IT[X].who || x.who === IT[X].who;
    const truth = (x) => x.ok && whoOk(x) && x.c === ch(X), allPos = pos.every(truth);
    switch (step.type) {
      case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
      case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
      case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && whoOk(neg[0]) && neg[0].c === step.ask && allPos, full: pos.some(truth) };
      default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
    }
  }
  function evalAskX(X, text) {
    const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cfg.q(X) });
    if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
    if (has(s, qN(X))) return { ok: true, kind: 'what' };
    const st = statements(s, X);
    if (st.length === 1 && st[0].ok && (st[0].who === null || !IT[X].who || st[0].who === IT[X].who)) return { ok: true, kind: st[0].c === ch(X) ? 'yes' : 'no', ask: st[0].c };
    if (st.length === 1) return bad(say(X, st[0].c) + '?');
    return bad();
  }
  function answerAskX(X, r) {
    if (r.kind === 'yes') return 'Sì, ' + lc(say(X)) + '.';
    if (r.kind === 'no') return 'No, ' + lc(say(X, r.ask, true)) + '. ' + say(X) + '.';
    return say(X) + '.';
  }
  gInstall(cfg.flag, isX, SX, evaluateX, evalAskX, answerAskX);
  return SX;
}

/* ---------- Lezione 90: al bar ---------- */
const BAR_CH = {
  cappuccino: { the: 'un cappuccino', alias: ['cappuccini'] }, caffe: { the: 'un caffè', alias: ['caffe', 'espresso'] },
  cornetto: { the: 'un cornetto', alias: ['cornetti', 'brioche'] }, tramezzino: { the: 'un tramezzino', alias: ['tramezzini', 'panino'] },
  gelato: { the: 'un gelato', alias: ['gelati'] }, spremuta: { the: 'una spremuta', alias: ['spremute'] }
};
const BAR_FIG = {
  cappuccino: '<path d="M30 40 h40 v18 q0 18 -20 18 q-20 0 -20 -18z" fill="#f3eee2"/><ellipse cx="50" cy="40" rx="20" ry="5" fill="#e9d7b8"/><path d="M45 39 q2.5 -3 5 0 q2.5 -3 5 0 l-5 4z" fill="#a8774a"/>' +
    '<path d="M70 46 q10 0 10 8 q0 8 -10 8" fill="none" stroke="#f3eee2" stroke-width="4"/><ellipse cx="50" cy="80" rx="28" ry="5" fill="#e2dccd"/>',
  caffe: CZ_FIG.caffe,
  cornetto: CZ_FIG.cornetto,
  tramezzino: '<path d="M22 70 L50 30 L78 70z" fill="#f3eee2"/><path d="M24 66 L50 30 L76 66" fill="none" stroke="#e2c79a" stroke-width="2"/>' +
    '<path d="M26 64 q12 -6 24 0 q12 -6 24 0" stroke="#5a9a46" stroke-width="4" fill="none"/><path d="M28 60 h44" stroke="#e8a0a8" stroke-width="3"/><path d="M22 70 h56 v5 h-56z" fill="#e9dcc0"/>',
  gelato: '<path d="M38 50 L50 86 L62 50z" fill="#d9a25a"/><path d="M41 56 l15 -4 M43 64 l11 -3 M46 72 l7 -2" stroke="#b07a3a" stroke-width="1.4"/>' +
    '<circle cx="44" cy="44" r="10" fill="#f4a6c4"/><circle cx="56" cy="44" r="10" fill="#f3e3a0"/><circle cx="50" cy="34" r="10" fill="#9a6a44"/>',
  spremuta: CZ_FIG.succo
};
function barFig(X, it) {
  const k = p3Key(it.who), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return FLAT(BAR_FIG[it.c], 20);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    // il bancone del bar e l'insegna
    '<rect x="62" y="4" width="34" height="13" rx="3" fill="#2f5d4a"/><text x="79" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#f3d36b">BAR</text>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [72, 64], [80, 66]), { mouth: 'smile' }, -14) +
    '<rect x="52" y="70" width="48" height="27" rx="2" fill="#7a5735"/><rect x="50" y="66" width="50" height="5" rx="1.5" fill="#a87a4e"/>' +
    '<g transform="translate(77 48) scale(.52) translate(-50 -60)">' + BAR_FIG[it.c] + '</g></svg>';
}
const SBAR = choiceLesson({
  flag: 'bar', CH: BAR_CH,
  items: { bar_m_cappuccino: { who: 'm', c: 'cappuccino' }, bar_f_cornetto: { who: 'f', c: 'cornetto' }, bar_m_caffe: { who: 'm', c: 'caffe' },
    bar_f_gelato: { who: 'f', c: 'gelato' }, bar_m_tramezzino: { who: 'm', c: 'tramezzino' }, bar_f_spremuta: { who: 'f', c: 'spremuta' } },
  say: (X, c, neg) => vName(X.charAt(4)) + (neg ? ' non' : '') + ' prende ' + BAR_CH[c].the,
  lead: () => 'Al bar',
  proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
  q: (X) => 'Che cosa prende ' + vName(X.charAt(4)) + ' al bar?',
  fig: barFig,
  wrong: ['prendo', 'prendi', 'prendere', 'mangia', 'beve']
});

/* ---------- Lezione 91: i vestiti (in negozio) ---------- */
const MODA_CH = {
  camicia: { the: 'una camicia', alias: ['camicie'] }, cravatta: { the: 'una cravatta', alias: ['cravatte'] },
  cappello: { the: 'un cappello', alias: ['cappelli'] }, sciarpa: { the: 'una sciarpa', alias: ['sciarpe'] },
  gonna: { the: 'una gonna', alias: ['gonne'] }, maglione: { the: 'un maglione', alias: ['maglioni'] },
  scarpe: { the: 'un paio di scarpe', alias: ['scarpa'], alt: ['le scarpe', 'delle scarpe'] }      // Massi: il negozio di scarpe
};
// le scarpe rosse con il tacco (anche nella lezione 85: «A Isa piacciono le scarpe»)
const SHOES = '<g><path d="M14 70 q2 -14 12 -16 q8 6 18 8 q10 2 14 8 v4 h-30 l-4 -4 l-4 12 h-4z" fill="#c8323b"/><path d="M18 82 l3 -10 h3 l-2 10z" fill="#8e1b2a"/><path d="M24 58 q8 6 18 8" stroke="#e8737c" stroke-width="1.6" fill="none"/></g>' +
  '<g transform="translate(30 6)"><path d="M14 70 q2 -14 12 -16 q8 6 18 8 q10 2 14 8 v4 h-30 l-4 -4 l-4 12 h-4z" fill="#d23c44"/><path d="M18 82 l3 -10 h3 l-2 10z" fill="#9e222a"/><path d="M24 58 q8 6 18 8" stroke="#ee8a92" stroke-width="1.6" fill="none"/></g>';
const MODA_FIG = {
  scarpe: SHOES,
  camicia: '<path d="M30 26 l12 -6 h16 l12 6 l12 16 l-9 7 l-7 -8 v44 h-40 v-44 l-7 8 l-9 -7z" fill="#e9eef6"/><path d="M42 20 l8 10 l8 -10" fill="none" stroke="#b9c3d2" stroke-width="2"/>' +
    '<path d="M50 30 v52" stroke="#b9c3d2" stroke-width="1.4"/><circle cx="50" cy="40" r="1.4" fill="#8d97ad"/><circle cx="50" cy="52" r="1.4" fill="#8d97ad"/><circle cx="50" cy="64" r="1.4" fill="#8d97ad"/>',
  cravatta: '<path d="M44 14 h12 l-2 8 h-8z" fill="#3f6fb5"/><path d="M46 22 h8 l6 50 l-10 12 l-10 -12z" fill="#3f6fb5"/><path d="M47 34 l10 8 M45 48 l13 10 M44 62 l14 10" stroke="#f3d36b" stroke-width="2"/>',
  cappello: '<ellipse cx="50" cy="66" rx="36" ry="9" fill="#8e6741"/><path d="M30 64 q0 -32 20 -32 q20 0 20 32z" fill="#a37a52"/><path d="M30 58 q20 6 40 0 v6 q-20 6 -40 0z" fill="#3a3f4a"/>',
  sciarpa: '<path d="M26 30 q24 -10 48 0 q-4 10 -24 10 q-20 0 -24 -10z" fill="#c8323b"/><path d="M54 38 l6 44 h-12 l-4 -42z" fill="#c8323b"/>' +
    '<path d="M48 82 v6 M52 82 v6 M56 82 v6 M60 82 v6" stroke="#c8323b" stroke-width="1.6"/><path d="M30 30 q20 -6 40 0 M50 50 l4 0 M51 62 l5 0" stroke="#f3eee2" stroke-width="1.6" fill="none"/>',
  gonna: '<rect x="34" y="22" width="32" height="8" rx="2" fill="#5b4a8b"/><path d="M34 30 h32 l14 54 h-60z" fill="#7a63b5"/><path d="M42 30 l-6 54 M50 30 v54 M58 30 l6 54" stroke="#5b4a8b" stroke-width="1.4"/>',
  maglione: '<path d="M32 24 q18 -8 36 0 l14 18 l-8 8 l-6 -6 v40 h-36 v-40 l-6 6 l-8 -8z" fill="#3f8f6a"/><path d="M42 22 q8 6 16 0" fill="none" stroke="#2f6f52" stroke-width="3"/>' +
    '<path d="M32 76 h36 M32 80 h36" stroke="#2f6f52" stroke-width="2"/><path d="M38 40 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4" stroke="#f3eee2" stroke-width="1.4" fill="none"/>'
};
function modaFig(X, it) {
  const k = p3Key(it.who), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return FLAT(MODA_FIG[it.c], 20);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    // la vetrina del negozio: l'insegna MODA, la cosa appesa alla gruccia
    '<rect x="54" y="4" width="44" height="13" rx="3" fill="#5b4a8b"/><text x="76" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="' + (it.c === 'scarpe' ? 8 : 9) + '" font-weight="bold" letter-spacing="1.5" fill="#f3eee2">' + (it.c === 'scarpe' ? 'SCARPE' : 'MODA') + '</text>' +
    '<rect x="52" y="20" width="46" height="74" rx="4" fill="#f3eee2" opacity=".14" stroke="#c9a45c" stroke-width="1"/>' +
    '<path d="M75 22 v3 M68 30 l7 -5 l7 5" stroke="#8d93a3" stroke-width="1.4" fill="none"/>' +
    '<g transform="translate(75 60) scale(' + (it.c === 'scarpe' ? .5 : .6) + ') translate(-50 ' + (it.c === 'scarpe' ? -70 : -50) + ')">' + MODA_FIG[it.c] + '</g>' +
    // la persona con la borsa del negozio
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [70, 66], [66, 84]), { mouth: 'smile' }, -18) +
    '<path d="M42 86 h14 l2 14 h-18z" fill="#c9a45c"/><path d="M45 86 q4 -6 8 0" stroke="#8e6a2a" stroke-width="1.4" fill="none"/></svg>';
}
const SMODA = choiceLesson({
  flag: 'moda', CH: MODA_CH,
  items: { moda_f_sciarpa: { who: 'f', c: 'sciarpa' }, moda_m_cravatta: { who: 'm', c: 'cravatta' }, moda_f_gonna: { who: 'f', c: 'gonna' },
    moda_m_cappello: { who: 'm', c: 'cappello' }, moda_f_camicia: { who: 'f', c: 'camicia' }, moda_m_maglione: { who: 'm', c: 'maglione' },
    moda_f_scarpe: { who: 'f', c: 'scarpe' } },
  say: (X, c, neg) => vName(X.charAt(5)) + (neg ? ' non' : '') + ' compra ' + MODA_CH[c].the,
  lead: (X) => X === 'moda_f_scarpe' ? 'Nel negozio di scarpe' : 'In negozio',
  strip: / negozio di scarpe /g,
  proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
  q: (X) => 'Che cosa compra ' + vName(X.charAt(5)) + ' in negozio?',
  fig: modaFig,
  wrong: ['compro', 'compri', 'comprare', 'prende', 'porta']
});

/* ---------- Lezione 92: i trasporti ---------- */
const VIA_CH = {
  treno: { the: 'in treno', alias: ['treni'], alt: ['col treno', 'con il treno'] }, autobus: { the: 'in autobus', alias: ['pullman'], alt: ['con l autobus'] },
  taxi: { the: 'in taxi', alt: ['con il taxi', 'col taxi'] }, aereo: { the: 'in aereo', alt: ['con l aereo'] },
  bicicletta: { the: 'in bicicletta', alias: ['bici'], alt: ['con la bicicletta'] }, piedi: { the: 'a piedi' }
};
const VIA_CITY = { roma: 'Roma', milano: 'Milano', firenze: 'Firenze', venezia: 'Venezia', napoli: 'Napoli', pisa: 'Pisa' };
const VIA_FIG = {
  treno: '<path d="M8 62 q4 -22 26 -24 h56 v32 h-82z" fill="#d23c44"/><path d="M14 56 q4 -12 18 -13 h10 v13z" fill="#2a3346"/><rect x="48" y="44" width="10" height="9" rx="1" fill="#2a3346"/><rect x="62" y="44" width="10" height="9" rx="1" fill="#2a3346"/><rect x="76" y="44" width="10" height="9" rx="1" fill="#2a3346"/>' +
    '<path d="M8 62 h82 v4 h-82z" fill="#f3eee2"/><circle cx="26" cy="72" r="4" fill="#3a3f4a"/><circle cx="74" cy="72" r="4" fill="#3a3f4a"/><path d="M2 76 h96" stroke="#8d93a3" stroke-width="2"/>',
  autobus: '<rect x="10" y="30" width="80" height="40" rx="6" fill="#e8862a"/><rect x="16" y="36" width="14" height="14" rx="2" fill="#bfe0ee"/><rect x="34" y="36" width="14" height="14" rx="2" fill="#bfe0ee"/><rect x="52" y="36" width="14" height="14" rx="2" fill="#bfe0ee"/>' +
    '<rect x="70" y="36" width="14" height="26" rx="2" fill="#bfe0ee"/><circle cx="26" cy="72" r="6" fill="#3a3f4a"/><circle cx="74" cy="72" r="6" fill="#3a3f4a"/><rect x="10" y="56" width="58" height="4" fill="#f3eee2"/>',
  taxi: '<path d="M14 62 v-10 q0 -6 6 -7 l10 -12 h36 l12 12 q8 1 8 7 v10z" fill="#f3eee2"/><path d="M34 36 h30 l9 10 h-48z" fill="#bfe0ee"/><path d="M49 36 v10" stroke="#f3eee2" stroke-width="2"/>' +
    '<rect x="40" y="24" width="20" height="8" rx="2" fill="#f2c81e"/><text x="50" y="30.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="6" font-weight="bold" fill="#2a3346">TAXI</text>' +
    '<circle cx="28" cy="64" r="7" fill="#3a3f4a"/><circle cx="72" cy="64" r="7" fill="#3a3f4a"/><circle cx="28" cy="64" r="2.6" fill="#8d93a3"/><circle cx="72" cy="64" r="2.6" fill="#8d93a3"/>',
  aereo: null,
  bicicletta: '<circle cx="28" cy="62" r="14" fill="none" stroke="#3f8fd0" stroke-width="3"/><circle cx="72" cy="62" r="14" fill="none" stroke="#3f8fd0" stroke-width="3"/>' +
    '<path d="M28 62 l14 -22 h22 l8 22 M42 40 l8 22 l14 -22 M50 62 h-22 M40 36 h8 M64 40 l-2 -8 h8" stroke="#d23c44" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
  // a piedi: le orme delle scarpe, una dopo l'altra, verso la città
  piedi: [[14, 78, -20], [34, 66, 20], [50, 50, -20], [70, 38, 20], [86, 22, -20]].map(([x, y, r], i) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + (r + 40) + ')" fill="#c9a45c" opacity="' + (.45 + i * .13) + '">' +
    '<ellipse cx="0" cy="-3" rx="5" ry="7"/><ellipse cx="0" cy="8" rx="3.6" ry="4"/></g>').join('')
};
function viaFig(X, it) {
  const k = p3Key(it.who), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  const veh = it.c === 'aereo' ? inner(FIG.plane) : VIA_FIG[it.c];
  const city = VIA_CITY[X.split('_')[3]];
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    // il cartello verde della città (come in autostrada), con la freccia
    '<rect x="50" y="3" width="48" height="16" rx="2" fill="#2f7d4a" stroke="#f3eee2" stroke-width="1.2"/><text x="71" y="14.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" font-weight="bold" fill="#f3eee2">' + city.toUpperCase() + '</text>' +
    '<path d="M92 11 l4 0 M93 8 l3 3 l-3 3" stroke="#f3eee2" stroke-width="1.4" fill="none"/>' +
    (LK && typeof tTorso === 'function' ? '<g transform="translate(-6 18) scale(.6)">' + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'smile' }) + '</g>' : '') +
    '<g transform="translate(66 64) scale(.56) translate(-50 -54)">' + veh + '</g></svg>';
}
const SVIA = choiceLesson({
  flag: 'via', CH: VIA_CH,
  items: { via_m_treno_roma: { who: 'm', c: 'treno' }, via_f_aereo_napoli: { who: 'f', c: 'aereo' }, via_m_taxi_milano: { who: 'm', c: 'taxi' },
    via_f_bicicletta_pisa: { who: 'f', c: 'bicicletta' }, via_m_autobus_firenze: { who: 'm', c: 'autobus' }, via_f_piedi_venezia: { who: 'f', c: 'piedi' } },
  say: (X, c, neg) => vName(X.charAt(4)) + (neg ? ' non' : '') + ' va a ' + VIA_CITY[X.split('_')[3]] + ' ' + VIA_CH[c].the,
  proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
  q: (X) => 'Come va ' + vName(X.charAt(4)) + ' a ' + VIA_CITY[X.split('_')[3]] + '?',
  fig: viaFig,
  wrong: ['vado', 'vai', 'andare', 'prende']
});

/* ---------- Lezione 93: in albergo ---------- */
const HOT_CH = {
  reception: { the: 'alla reception' }, camera: { the: 'in camera', alt: ['nella camera', 'nella sua camera'] },
  ascensore: { the: 'in ascensore', alt: ['nell ascensore'] }, ristorante: { the: 'al ristorante' },
  piscina: { the: 'in piscina', alt: ['nella piscina'] }, bar: { the: 'al bar' }
};
const HOT_FIG = {
  reception: '<rect x="8" y="50" width="84" height="40" rx="3" fill="#8e6741"/><rect x="6" y="46" width="88" height="6" rx="2" fill="#a87a4e"/>' +
    '<rect x="20" y="8" width="60" height="12" rx="2" fill="#2f5d4a"/><text x="50" y="17" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" font-weight="bold" fill="#f3d36b">RECEPTION</text>' +
    '<path d="M60 44 a8 8 0 0 1 16 0z" fill="#f3d36b"/><rect x="58" y="44" width="20" height="2.4" rx="1" fill="#c9a45c"/><circle cx="68" cy="34.6" r="1.6" fill="#c9a45c"/>' +
    '<rect x="20" y="24" width="30" height="16" rx="2" fill="#5a4030"/>' + [0, 1, 2, 3].map(i => '<path d="M' + (25 + i * 7) + ' 27 v6" stroke="#f3d36b" stroke-width="1.6"/><circle cx="' + (25 + i * 7) + '" cy="35" r="1.6" fill="#f3d36b"/>').join(''),
  camera: '<rect x="10" y="30" width="16" height="44" rx="2" fill="#8e6741"/><rect x="10" y="56" width="80" height="18" rx="3" fill="#f3eee2"/><rect x="14" y="48" width="18" height="10" rx="4" fill="#ffffff"/>' +
    '<rect x="30" y="52" width="60" height="10" rx="3" fill="#5b4a8b"/><rect x="12" y="74" width="4" height="10" fill="#5a4030"/><rect x="84" y="74" width="4" height="10" fill="#5a4030"/>' +
    '<rect x="66" y="10" width="22" height="12" rx="2" fill="#f3eee2"/><text x="77" y="19" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#2a3346">205</text>',
  ascensore: '<rect x="18" y="8" width="64" height="82" rx="3" fill="#8d93a3"/><rect x="22" y="20" width="27" height="68" fill="#c9ced8"/><rect x="51" y="20" width="27" height="68" fill="#c9ced8"/>' +
    '<path d="M49 20 v68" stroke="#5d6577" stroke-width="2"/><rect x="38" y="10" width="24" height="8" rx="2" fill="#2a3346"/><path d="M44 16 l3 -4 l3 4z M53 12 l3 4 l3 -4z" fill="#f3d36b"/>' +
    '<rect x="84" y="44" width="8" height="16" rx="2" fill="#5d6577"/><circle cx="88" cy="49" r="2" fill="#f3d36b"/><circle cx="88" cy="55" r="2" fill="#f3eee2"/>',
  ristorante: '<rect x="12" y="56" width="76" height="6" rx="2" fill="#f3eee2"/><path d="M16 62 l-4 26 M84 62 l4 26" stroke="#8e6741" stroke-width="3"/><path d="M12 56 h76 l-6 10 h-64z" fill="#c8323b" opacity=".85"/>' +
    '<ellipse cx="50" cy="52" rx="16" ry="4" fill="#ffffff"/><ellipse cx="50" cy="51" rx="9" ry="2" fill="#f2c55a"/><path d="M30 54 v-14 M28 40 v6 M32 40 v6" stroke="#8d93a3" stroke-width="1.6"/>' +
    '<path d="M70 54 v-16 q5 2 5 10 q0 3 -5 3" stroke="#8d93a3" stroke-width="1.6" fill="#8d93a3"/><path d="M60 32 h8 q0 10 -4 12 q-4 -2 -4 -12z M64 44 v8 M60 52 h8" stroke="#dfe4ea" stroke-width="1.2" fill="#8e1b3a"/>' +
    '<rect x="26" y="10" width="48" height="12" rx="2" fill="#5a4030"/><text x="50" y="19" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" font-weight="bold" fill="#f3d36b">RISTORANTE</text>',
  piscina: '<rect x="6" y="40" width="88" height="46" rx="6" fill="#dfe4ea"/><rect x="12" y="46" width="76" height="34" rx="4" fill="#3f9fd6"/>' +
    '<path d="M16 56 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 M16 68 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0" stroke="#bfe6f8" stroke-width="2" fill="none"/>' +
    '<path d="M76 30 v24 M86 30 v24 M76 38 h10 M76 46 h10" stroke="#c9ced8" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="24" cy="22" r="8" fill="#f3d36b"/>',
  bar: '<rect x="62" y="4" width="34" height="13" rx="3" fill="#2f5d4a"/><text x="79" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#f3d36b">BAR</text>' +
    '<rect x="8" y="56" width="84" height="34" rx="2" fill="#7a5735"/><rect x="6" y="52" width="88" height="5" rx="1.5" fill="#a87a4e"/>' +
    '<g transform="translate(32 40) scale(.3) translate(-50 -60)">' + CZ_FIG.caffe + '</g><g transform="translate(64 38) scale(.32) translate(-50 -60)">' + BAR_FIG.cappuccino + '</g>'
};
function hotFig(X, it) {
  const k = p3Key(it.who), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g transform="translate(36 18) scale(.66)">' + HOT_FIG[it.c] + '</g>' +
    // l'insegna dell'albergo: HOTEL e le stelle
    '<rect x="3" y="3" width="34" height="13" rx="2" fill="#1d2638" stroke="#c9a45c" stroke-width="1"/><text x="20" y="11.4" text-anchor="middle" font-family="Georgia,serif" font-size="7" font-weight="bold" fill="#f3d36b">HOTEL</text>' +
    '<text x="20" y="15.4" text-anchor="middle" font-size="3.6" fill="#f3d36b">★★★★</text>' +
    (LK && typeof tTorso === 'function' ? '<g transform="translate(-10 22) scale(.74)">' + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'smile' }) + '</g>' : '') + '</svg>';
}
const SHOT = choiceLesson({
  flag: 'hot', CH: HOT_CH,
  items: { hot_m_reception: { who: 'm', c: 'reception' }, hot_f_camera: { who: 'f', c: 'camera' }, hot_m_ascensore: { who: 'm', c: 'ascensore' },
    hot_f_ristorante: { who: 'f', c: 'ristorante' }, hot_m_piscina: { who: 'm', c: 'piscina' }, hot_f_bar: { who: 'f', c: 'bar' } },
  say: (X, c, neg) => vName(X.charAt(4)) + (neg ? ' non' : '') + ' è ' + HOT_CH[c].the,
  lead: () => 'In albergo',
  proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
  q: (X) => 'Dov\'è ' + vName(X.charAt(4)) + '?',
  fig: hotFig,
  wrong: ['sono', 'sei', 'va', 'sta']
});
