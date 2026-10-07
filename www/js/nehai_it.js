'use strict';
/* =====================================================================
   CAPITOLO 13: «Ne» (lezione 67, livello 3). Si carica dopo suoi_it.js (la figura con il bollino) e gen_it.js.
   Max o Isa hanno una, due o tre cose (il bollino con la faccia dice di chi sono):
     Max ha tre libri. Ne ha tre.            → ripete
     Quanti libri ha Max?                    → Ne ha tre.
     Max ha tre libri?                       → Sì, ne ha tre.
     Max ha due libri?                       → No, non ne ha due.
     Max ha due o tre libri?                 → Ne ha tre.
   Con una cosa: «ne ha uno» (un ombrello), «ne ha una» (un'arancia).  Il punto: «ne» al posto di «libri». «ne» sottolineato.
   Errori: «Ha tre.», «Ne ha tre libri.», «Ne ha uno» per l'arancia, il numero sbagliato.
   ===================================================================== */

const NH = { nh_m_book_3: 1, nh_f_key_2: 1, nh_m_orange_1: 1, nh_f_bottle_3: 1, nh_m_cup_2: 1, nh_f_umbrella_1: 1 };
const isNh = (X) => !!NH[X];
const nhWho = (X) => X.charAt(3);
const nhObj = (X) => X.split('_')[2];
const nhN = (X) => +X.split('_')[3];
const nhName = (X) => vName(nhWho(X));
const nhNum = (X, n) => n === 1 ? (gFem(nhObj(X)) ? 'una' : 'uno') : gNumW(n);                 // «uno», «una», «due», «tre»
const nhHas = (X, n) => nhName(X) + ' ha ' + gCount(nhObj(X), n || nhN(X));                     // «Max ha tre libri»
const nhNe = (X, n, neg) => (neg ? 'non ' : '') + 'ne ha ' + nhNum(X, n || nhN(X));              // «ne ha tre»
const nhQ = (X) => (gFem(nhObj(X)) ? 'Quante ' : 'Quanti ') + PLURAL[nhObj(X)] + ' ha ' + nhName(X) + '?';
const nhOther = (X) => pick([1, 2, 3].filter(n => n !== nhN(X)));
const nhFig1 = (o) => o === 'key' ? (FIG.key_giallo || FIG.key) : o === 'umbrella' ? (FIG.umbrella_giallo || FIG.umbrella) : FIG[o];

/* ---------- Figura: le cose e il bollino con la faccia ---------- */
function nhFig(X) {
  const base = inner(gMany(nhFig1(nhObj(X)), nhN(X)));
  const k = p3Key(nhWho(X)), look = TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca';
  const head = (typeof tHeadStill === 'function' && typeof LOOKS !== 'undefined') ? tHeadStill(LOOKS[look] || LOOKS.luca, { mouth: 'smile' }) : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + base + '<circle cx="84" cy="18" r="14" fill="#1d2638"/><g transform="translate(84 17) scale(.55) translate(-50 -26)">' + head + '</g>' +
    '<circle cx="84" cy="18" r="13" fill="none" stroke="#c9a45c" stroke-width="2.4"/></svg>';
}
Object.keys(NH).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => nhFig(X) }); });

const SNH = gTag('nh', {
  present: (X) => { const p = nhHas(X) + '. ' + gCap(nhNe(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: nhHas(X) + '?', model: 'Sì, ' + nhNe(X) + '.' }),
  neg: (X) => { const o = nhOther(X); return { type: 'neg', show: X, ask: o, prompt: nhHas(X, o) + '?', model: 'No, ' + nhNe(X, o, true) + '.', complete: gCap(nhNe(X)) + '.' }; },
  alt: (X) => { const o = nhOther(X), ord = [nhN(X), o].sort();
    return { type: 'alt', show: X, prompt: nhName(X) + ' ha ' + nhNum(X, ord[0]) + ' o ' + gCount(nhObj(X), ord[1]).replace(/^un /, 'uno ') + '?', model: gCap(nhNe(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: nhQ(X), model: gCap(nhNe(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: nhQ(X) + ' ' + gCap(nhNe(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: nhQ(X), model: nhQ(X) })
});

/* ---------- Capire le frasi: «(non) ne ha tre», e la frase intera «Max ha tre libri» ---------- */
const NH_NUM = { uno: 1, una: 1, un: 1, due: 2, tre: 3, quattro: 4 };
function nhStatements(s) {
  s = s.replace(/ quant[ie] [a-z]+ ha [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'ha' || NH_NUM[w[i + 1]] === undefined) continue;
    const ne = w[i - 1] === 'ne', neg = w[ne ? i - 2 : i - 1] === 'non', n = NH_NUM[w[i + 1]];
    const after = gNoun(w[i + 2]);
    let subj = names[w[ne ? (neg ? i - 3 : i - 2) : (neg ? i - 2 : i - 1)]] || null;
    out.push({ ne: ne, neg: neg, n: n, numW: w[i + 1], obj: after ? after.obj : null, subj: subj });
  }
  return out;
}
// short = con «ne» (senza la cosa); full = «Max ha tre libri»
function nhGood(x, X, n, short) {
  if (x.n !== n || (x.subj !== null && x.subj !== nhWho(X))) return false;
  if (n === 1 && x.numW !== nhNum(X, 1) && !(x.obj && x.numW === 'un')) return false;          // «uno» / «una»
  return short ? x.ne && !x.obj : !x.ne && x.obj === nhObj(X);
}
function nhEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(nhQ(X)).trim()), full: true };
  const st = nhStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && nhGood(pos[0], X, nhN(X), false) && nhGood(pos[1], X, nhN(X), true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.length > 0 && pos.every(x => nhGood(x, X, nhN(X), true)) && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && nhGood(neg[0], X, step.ask, true) && pos.every(x => nhGood(x, X, nhN(X), true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => nhGood(x, X, nhN(X), true)) && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function nhEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || nhQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'quanti') || has(s, 'quante')) return has(s, gNorm(nhQ(X)).trim()) ? { ok: true, kind: 'what' } : bad();
  const st = nhStatements(s);
  if (st.length === 1 && !st[0].ne && st[0].obj === nhObj(X)) return { ok: true, kind: st[0].n === nhN(X) ? 'yes' : 'no', n: st[0].n };
  return bad();
}
function nhAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + nhNe(X) + '.';
  if (r.kind === 'no') return 'No, ' + nhNe(X, r.n, true) + '. ' + gCap(nhNe(X)) + '.';
  return gCap(nhNe(X)) + '.';
}
gInstall('nh', isNh, SNH, nhEvaluate, nhEvalAsk, nhAnswerAsk);
