'use strict';
/* =====================================================================
   CAPITOLO 16: «Ci vuole — ci vogliono» (lezione 84, livello 4). Si carica dopo telef_it.js (il fumetto), geo_fig.js, verbs_it.js.
   A sinistra lo scopo (la porta, Isa che legge, la Statua della Libertà…), a destra, con la freccia d'oro, quello che serve:
     Per aprire la porta ci vuole una chiave.                         → ripete
     Per leggere ci vogliono un libro e una lampada.                  → ripete
     Per telefonare ci vuole un telefono?                             → Sì, ci vuole un telefono.
     Per andare a New York ci vuole un orologio?                      → No, non ci vuole un orologio.
     Che cosa ci vuole per fare colazione?                            → Ci vogliono un caffè e un uovo.
   Il punto: una cosa → ci vuole; due cose → ci vogliono. La domanda resta «Che cosa ci vuole…?».
   Errori: «ci vuole un libro e una lampada», «ci vogliono una chiave», la cosa sbagliata.
   ===================================================================== */

const CU = { cu_porta: 1, cu_leggere: 1, cu_telefono: 1, cu_colazione: 1, cu_newyork: 1, cu_ora: 1 };
const CU_FOR = { porta: 'aprire la porta', leggere: 'leggere', telefono: 'telefonare', colazione: 'fare colazione', newyork: 'andare a New York', ora: 'vedere l\'ora' };
const CU_NEED = { porta: ['key'], leggere: ['book', 'lamp'], telefono: ['phone'], colazione: ['coffee', 'egg'], newyork: ['plane'], ora: ['clock'] };
const isCu = (X) => !!CU[X];
const cuK = (X) => X.slice(3);
const cuA = (o) => (ITEMS[o].art === 'un\'' ? 'un\'' : ITEMS[o].art + ' ') + ITEMS[o].word;            // «una chiave»
const cuList = (l) => l.map(cuA).join(' e ');
const cuVerb = (l) => l.length > 1 ? 'ci vogliono' : 'ci vuole';
const cuNeed = (l, neg) => (neg ? 'non ' : '') + cuVerb(l) + ' ' + cuList(l);                          // «ci vogliono un libro e una lampada»
const cuSay = (X, l) => 'Per ' + CU_FOR[cuK(X)] + ' ' + cuNeed(l || CU_NEED[cuK(X)]);
const cuQ = (X) => 'Che cosa ci vuole per ' + CU_FOR[cuK(X)] + '?';
// un'altra cosa (o due) che qui non serve: una sola per le cose singole, due per le coppie
const cuOther = (X) => { const n = CU_NEED[cuK(X)].length; return pick(Object.keys(CU_NEED).filter(k => k !== cuK(X) && CU_NEED[k].length === n).map(k => CU_NEED[k])); };

/* ---------- Figure: lo scopo a sinistra, la freccia d'oro, quello che serve a destra ---------- */
const cuBox = (svg, x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + inner(svg) + '</g>';
function cuGoal(k) {
  if (k === 'porta') return cuBox(FIG.door, 0, 6, .58);
  if (k === 'leggere') return cuBox(FIG.v_f_read, -2, 4, .6);
  if (k === 'telefono') return cuBox(FIG.v_m_phone, -2, 4, .6);
  if (k === 'newyork') return cuBox(MON2.liberta, 0, 18, .54);
  if (k === 'ora') {      // Isa chiede «Che ora è?» (parole conosciute nel fumetto)
    const LK = tlLook('f');
    return LK && typeof tTorso === 'function' ? '<g transform="translate(0 6) scale(.6)">' + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'talk' }, 12) +
      sayBubble([0, 0, 44, 22], [53, 32], ['Che ora è?'], 8) + '</g>' : '';
  }
  // fare colazione: il sole del mattino e la tavola apparecchiata, vuota
  return '<g transform="translate(0 8)"><circle cx="38" cy="20" r="10" fill="#f3d36b"/><path d="M38 4 v-3 M50 8 l2 -2 M26 8 l-2 -2 M54 20 h3 M22 20 h-3" stroke="#f3d36b" stroke-width="2" stroke-linecap="round"/>' +
    '<rect x="4" y="44" width="48" height="5" rx="1.5" fill="#b58a5e"/><rect x="8" y="49" width="4" height="30" fill="#8e6741"/><rect x="44" y="49" width="4" height="30" fill="#8e6741"/>' +
    '<ellipse cx="28" cy="42" rx="12" ry="3" fill="#f3eee2"/><ellipse cx="28" cy="41.5" rx="7" ry="1.6" fill="#dcd4c2"/></g>';
}
function cuFig(X) {
  const l = CU_NEED[cuK(X)];
  const things = l.length === 1 ? cuBox(FIG[l[0]], 58, 26, .46) : cuBox(FIG[l[0]], 60, 4, .42) + cuBox(FIG[l[1]], 60, 50, .42);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + cuGoal(cuK(X)) +
    '<path d="M60 50 h-5" stroke="#c9a45c" stroke-width="3" stroke-linecap="round"/><path d="M51 50 l6 -5 v10z" fill="#c9a45c"/>' +
    '<rect x="60" y="' + (l.length === 1 ? 22 : 2) + '" width="40" height="' + (l.length === 1 ? 56 : 96) + '" rx="8" fill="none" stroke="#c9a45c" stroke-width="1.2" stroke-dasharray="3 2" opacity=".8"/>' + things + '</svg>';
}
Object.keys(CU).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cuFig(X) }); });

const SCU = gTag('cu', {
  present: (X) => { const p = cuSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: cuSay(X) + '?', model: 'Sì, ' + cuNeed(CU_NEED[cuK(X)]) + '.' }),
  neg: (X) => { const o = cuOther(X); return { type: 'neg', show: X, ask: o.join(), prompt: cuSay(X, o) + '?', model: 'No, ' + cuNeed(o, true) + '.', complete: gCap(cuNeed(CU_NEED[cuK(X)])) + '.' }; },
  alt: (X) => { const n = CU_NEED[cuK(X)], o = cuOther(X), ord = Math.random() < 0.5 ? [n, o] : [o, n];
    return { type: 'alt', show: X, prompt: cuSay(X, ord[0]) + ' o ' + cuList(ord[1]) + '?', model: cuSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: cuQ(X), model: gCap(cuNeed(CU_NEED[cuK(X)])) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: cuQ(X) + ' ' + gCap(cuNeed(CU_NEED[cuK(X)])) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cuQ(X), model: cuQ(X) })
});

/* ---------- Capire le frasi: «(non) ci vuole una chiave», «ci vogliono un libro e una lampada» ---------- */
function cuStatements(s) {
  s = s.replace(/ che cosa ci vuole /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'ci' || !/^(vuole|vogliono)$/.test(w[i + 1] || '')) continue;
    const neg = w[i - 1] === 'non', pl = w[i + 1] === 'vogliono', items = [];
    let ok = true, j = i + 2;
    while (/^(un|una|uno|il|la|lo|l)$/.test(w[j] || '') && w[j + 1]) {
      const k = WORD2KEY[w[j + 1]];
      if (!k) { ok = false; items.push('?'); }
      else {
        const indef = ITEMS[k].art === 'un\'' ? 'un' : ITEMS[k].art;
        if (w[j] !== indef && w[j] !== defArtN(k)) ok = false;
        items.push(k);
      }
      j += 2;
      if (w[j] === 'e' && /^(un|una|uno|il|la|lo|l)$/.test(w[j + 1] || '')) j++; else break;
    }
    if (!items.length) ok = false;
    out.push({ neg: neg, pl: pl, items: items, ok: ok && pl === (items.length > 1) });
    i = j - 1;
  }
  return out;
}
const cuSame = (a, b) => a.length === b.length && a.every(k => b.indexOf(k) !== -1);
function evaluateCu(step, text) {
  const s = gNorm(text), X = step.show, need = CU_NEED[cuK(X)];
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(cuQ(X)).trim()), full: true };
  const st = cuStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && cuSame(x.items, need), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && cuSame(neg[0].items, step.ask.split(',')) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskCu(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cuQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(cuQ(X)).trim())) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa ci vuole')) return bad();
  const st = cuStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: cuSame(st[0].items, CU_NEED[cuK(X)]) ? 'yes' : 'no', ask: st[0].items };
  return bad();
}
function answerAskCu(X, r) {
  const need = CU_NEED[cuK(X)];
  if (r.kind === 'yes') return 'Sì, ' + cuNeed(need) + '.';
  if (r.kind === 'no') return 'No, ' + cuNeed(r.ask, true) + '. ' + gCap(cuNeed(need)) + '.';
  return cuSay(X) + '.';
}
gInstall('cu', isCu, SCU, evaluateCu, evalAskCu, answerAskCu);
