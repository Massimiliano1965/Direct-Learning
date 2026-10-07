'use strict';
/* =====================================================================
   CAPITOLO 5: «Plurale: o → i, a → e» (lezione 32). Si carica dopo gen_it.js.
   Una cosa o più cose uguali: «È un libro.» / «Sono due libri.»
     È un libro.  Sono due libri.  Sono tre penne.   → ripete
     Sono due libri?                                 → Sì, sono due libri.
     Sono due quaderni?                              → No, non sono due quaderni.
     Sono tre penne o tre tazze?                     → Sono tre penne.
     Che cos'è? / Che cosa sono?                     → È un libro. / Sono due libri.
   Come nella lezione 22, la -o / -i finale è azzurra e la -a / -e finale rosa; «è» e «sono» sottolineati.
   Errori: «sono due libro», «è due libri», «sono due penna», «una libri», il numero sbagliato.
   ===================================================================== */

const PL = { pl_book_1: 1, pl_book_2: 1, pl_pen_1: 1, pl_pen_3: 1, pl_cup_2: 1, pl_notebook_3: 1 };
const isPl = (X) => !!PL[X];
const plObj = (X) => X.split('_')[1];
const plN = (X) => +X.split('_')[2];
const plIs = (n) => n === 1 ? 'è' : 'sono';
const plSay = (X, obj) => gCap(plIs(plN(X))) + ' ' + gCount(obj || plObj(X), plN(X));     // «Sono due libri»
const plQ = (X) => plN(X) === 1 ? 'Che cos\'è?' : 'Che cosa sono?';
const plOther = (X) => pick(Object.keys(PL).map(plObj).filter((o, i, a) => o !== plObj(X) && a.indexOf(o) === i));
Object.keys(PL).forEach(X => { FIG[X] = gMany(FIG[plObj(X)], plN(X)); });

const SPL = gTag('pl', {
  present: (X) => { const p = plSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: plSay(X) + '?', model: 'Sì, ' + plIs(plN(X)) + ' ' + gCount(plObj(X), plN(X)) + '.' }),
  neg: (X) => { const o = plOther(X);
    return { type: 'neg', show: X, ask: o, prompt: plSay(X, o) + '?', model: 'No, non ' + plIs(plN(X)) + ' ' + gCount(o, plN(X)) + '.', complete: plSay(X) + '.' }; },
  alt: (X) => { const o = plOther(X), ord = Math.random() < 0.5 ? [plObj(X), o] : [o, plObj(X)];
    return { type: 'alt', show: X, prompt: gCap(plIs(plN(X))) + ' ' + gCount(ord[0], plN(X)) + ' o ' + gCount(ord[1], plN(X)) + '?', model: plSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: plQ(X), model: plSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: plQ(X) + ' ' + plSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: plQ(X), model: plQ(X) })
});

/* ---------- Capire le frasi: «(non) è un libro», «(non) sono due libri» ---------- */
const PL_NUM = { un: 1, una: 1, uno: 1, due: 2, tre: 3, quattro: 4 };
function plStatements(s) {
  const out = [], re = / (non )?(e|sono) (un|una|uno|due|tre|quattro) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const nn = gNoun(m[4]), n = PL_NUM[m[3]];
    if (!nn) { out.push({ obj: '?', neg: !!m[1], good: false }); continue; }
    const artOk = n > 1 || m[3] === (ITEMS[nn.obj].art === 'un\'' ? 'un' : ITEMS[nn.obj].art);
    const good = artOk && (nn.plural === null || nn.plural === (n > 1)) && (m[2] === 'e') === (n === 1);
    out.push({ obj: nn.obj, n: n, neg: !!m[1], good: good });
  }
  return out;
}
function plEvaluate(step, text) {
  const s = gNorm(text), X = step.show, o = plObj(X), n = plN(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, n === 1 ? 'che cosa e' : 'che cosa sono') && !plStatements(s).length, full: true };
  const st = plStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.obj === o && x.n === n, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.obj === step.ask && x.n === n) && !neg.some(x => x.obj === o) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa'), full: true };
  }
}
function plEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || plQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa e') || has(s, 'che cosa sono')) return has(s, plN(X) === 1 ? 'che cosa e' : 'che cosa sono') ? { ok: true, kind: 'what' } : bad();
  const st = plStatements(s);
  if (st.length === 1 && st[0].good && st[0].n === plN(X)) return { ok: true, kind: st[0].obj === plObj(X) ? 'yes' : 'no', ask: st[0].obj };
  if (st.length === 1 && st[0].obj !== '?') return bad(plSay(X, st[0].obj) + '?');   // «sono due libro?» → «Sono due libri?»
  return bad();
}
function plAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + plIs(plN(X)) + ' ' + gCount(plObj(X), plN(X)) + '.';
  if (r.kind === 'no') return 'No, non ' + plIs(plN(X)) + ' ' + gCount(r.ask, plN(X)) + '. ' + plSay(X) + '.';
  return plSay(X) + '.';
}
gInstall('pl', isPl, SPL, plEvaluate, plEvalAsk, plAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.pl ? gGenderWords(lesson.known.map(plObj)) : bGw(lesson);
}
