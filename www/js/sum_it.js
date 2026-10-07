'use strict';
/* =====================================================================
   CAPITOLO 5: «Quanto fa…?» (lezione 30). Si carica dopo numbers_it.js (numWord, NUM_VAL, numNorm).
   Cartellini con un'addizione («10 + 20») fatta con i numeri già imparati:
     Dieci più venti fa trenta.                      → ripete
     Dieci più venti fa trenta?                      → Sì, fa trenta.
     Dieci più venti fa quaranta?                    → No, non fa quaranta.
     Dieci più venti fa trenta o quaranta?           → Fa trenta.
     Quanto fa dieci più venti?                      → Fa trenta.   (va bene anche la frase intera)
   Parole nuove: più, fa, quanto. Il microfono scrive spesso le cifre e il «+» («10 + 20 fa 30»): vanno bene.
   Errori: il risultato sbagliato, «è trenta», «fanno trenta» (qui si dice «fa»).
   ===================================================================== */

const SUMS = {
  sm_10_20: [10, 20], sm_20_30: [20, 30], sm_40_40: [40, 40], sm_50_50: [50, 50], sm_3_10: [3, 10], sm_8_8: [8, 8]
};
const isSum = (X) => !!SUMS[X];
const smRes = (X) => SUMS[X][0] + SUMS[X][1];
const smW = (n) => numWord(n);
const smCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const smOp = (X) => smW(SUMS[X][0]) + ' più ' + smW(SUMS[X][1]);                 // «dieci più venti»
const smSay = (X) => smCap(smOp(X)) + ' fa ' + smW(smRes(X)) + '.';
const smQ = (X) => 'Quanto fa ' + smOp(X) + '?';
const smShort = (X) => 'Fa ' + smW(smRes(X)) + '.';
// un risultato sbagliato ma vicino (dieci in più o in meno, oppure uno vicino)
function smOther(X) {
  const r = smRes(X), c = [r + 10, r - 10, r + 1, r - 1, r + 2].filter(n => n >= 1 && n <= 100 && n !== r);
  return pick(c);
}

/* ---------- Figura: il cartellino con l'addizione ---------- */
function sumFig(X) {
  const t = SUMS[X][0] + ' + ' + SUMS[X][1];
  return FLAT('<rect x="6" y="22" width="88" height="56" rx="8" fill="#2c3e66"/><rect x="10" y="26" width="80" height="48" rx="5" fill="none" stroke="#c9a45c" stroke-width="1.5"/>' +
    '<text x="50" y="60" font-size="' + (t.length > 6 ? 21 : 26) + '" font-family="Georgia, \'Times New Roman\', serif" fill="#e0c287" text-anchor="middle">' + t + '</text>', 40);
}
Object.keys(SUMS).forEach(X => { FIG[X] = sumFig(X); });

/* ---------- Frasi (sum = true) ---------- */
const SSM = {
  present: (X) => { const p = smSay(X); return { type: 'echo', check: 'claim', sum: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', sum: true, show: X, prompt: smSay(X).slice(0, -1) + '?', model: 'Sì, fa ' + smW(smRes(X)) + '.' }),
  neg: (X) => { const o = smOther(X); return { type: 'neg', sum: true, show: X, ask: o, prompt: smCap(smOp(X)) + ' fa ' + smW(o) + '?', model: 'No, non fa ' + smW(o) + '.', complete: smShort(X) }; },
  alt: (X) => { const r = smRes(X), o = smOther(X), ord = Math.random() < 0.5 ? [r, o] : [o, r];
    return { type: 'alt', sum: true, show: X, prompt: smCap(smOp(X)) + ' fa ' + smW(ord[0]) + ' o ' + smW(ord[1]) + '?', model: smShort(X) }; },
  key: (X) => ({ type: 'key', sum: true, show: X, prompt: smQ(X), model: smShort(X) }),
  reveal: (X) => ({ type: 'reveal', sum: true, show: X, prompt: smQ(X) + ' ' + smShort(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', sum: true, show: X, prompt: smQ(X), model: smQ(X) })
};

/* ---------- Capire le frasi ----------
   «(dieci più venti) (non) fa trenta»: il risultato; se dice anche l'addizione, deve essere quella del cartellino. */
const smNum = (w) => NUM_VAL[w] || null;
function smStatements(s) {
  s = s.replace(/ quanto fa /g, ' # ');   // la domanda non è una risposta
  const out = [], re = / (?:([a-z]+) piu ([a-z]+) )?(non )?(fa|fanno|e) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = smNum(m[5]);
    if (!n) continue;
    out.push({ a: m[1] ? smNum(m[1]) : null, b: m[2] ? smNum(m[2]) : null, op: !!m[1], neg: !!m[3], verb: m[4], n: n });
  }
  return out;
}
const smOpOk = (x, X) => !x.op || (x.a === SUMS[X][0] && x.b === SUMS[X][1]) || (x.a === SUMS[X][1] && x.b === SUMS[X][0]);
function sumEvaluate(step, text) {
  const s = numNorm(text), X = step.show, r = smRes(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'quanto fa') && !smStatements(s).length, full: true };
  const st = smStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.verb === 'fa' && x.n === r && smOpOk(x, X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.op) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.verb === 'fa' && x.n === step.ask && smOpOk(x, X)) && !neg.some(x => x.n === r) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'quanto fa'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Quanto fa dieci più venti?», «Dieci più venti fa trenta?» ---------- */
function sumEvalAsk(X, text) {
  const s = numNorm(text), bad = (model) => ({ ok: false, model: model || smQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'quanto fa')) {
    const m = / quanto fa ([a-z]+) piu ([a-z]+)(?= )/.exec(s);
    return !m || smOpOk({ op: true, a: smNum(m[1]), b: smNum(m[2]) }, X) ? { ok: true, kind: 'what' } : bad();
  }
  if (has(s, 'che cosa e') || has(s, 'che numero e')) return { ok: true, kind: 'what' };
  const st = smStatements(s);
  if (st.length === 1 && st[0].verb === 'fa' && smOpOk(st[0], X)) return { ok: true, kind: st[0].n === smRes(X) ? 'yes' : 'no', ask: st[0].n };
  if (st.length === 1 && smOpOk(st[0], X)) return bad(smCap(smOp(X)) + ' fa ' + smW(st[0].n) + '?');   // «è / fanno» → «fa»
  return bad();
}
function sumAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, fa ' + smW(smRes(X)) + '.';
  if (r.kind === 'no') return 'No, non fa ' + smW(r.ask) + '. ' + smShort(X);
  return smShort(X);
}

function sumDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === smSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SSM[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildSumSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SSM.present(x), 'present')));
  shuffle(K).forEach(x => add(SSM.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SSM.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SSM.yes(X) : SSM.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SSM.alt(x), 'alt'));
  add(SSM.reveal(K[0]), 'reveal').pause = 1200;
  add(SSM.reveal(K[K.length - 1]), 'reveal');
  add(SSM.askQ(K[0]), 'askq');
  add(SSM.askQ(K[K.length - 1]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SSM.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', sum: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SSM[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', sum: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const bEcho = isEcho, bTrim = trimEcho;
  buildSteps = (lesson) => lesson.sum ? buildSumSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.sum ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.sum ? sumEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isSum(X) ? sumEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isSum(X) ? sumAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.sum ? sumDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isSum(X) ? SSM.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isSum(X) ? SSM.present(X) : bPresent.apply(null, arguments); };
  isEcho = (step, text) => bEcho(step, step && step.sum ? numDigits(text) : text);
  trimEcho = (step, text) => bTrim(step, step && step.sum ? numDigits(text) : text);
})();
