'use strict';
/* =====================================================================
   LEZIONI DEI NUMERI (italiano): «Che numero è?»
   Si carica dopo logic.js (e colors_it.js). Le figure sono cartellini n1…n20 e le decine fino a n100 (lezioni 6, 7, 26–28).
   Stessa sequenza delle lezioni con gli oggetti: cambiano solo le frasi.
     È il numero tre.                 → ripete
     È il numero tre?                 → Sì, è il numero tre.
     È il numero due?                 → No, non è il numero due.
     È il numero tre o il numero sei? → È il numero tre.
     Che numero è?                    → È il numero tre.   (va bene anche «È il tre.»)
   Il microfono spesso scrive le cifre («è il numero 3»): si trasformano in parole.
   ===================================================================== */

const NUMS = { n1: 'uno', n2: 'due', n3: 'tre', n4: 'quattro', n5: 'cinque', n6: 'sei', n7: 'sette', n8: 'otto', n9: 'nove', n10: 'dieci',
  // lezione 26 (capitolo 5): da undici a venti
  n11: 'undici', n12: 'dodici', n13: 'tredici', n14: 'quattordici', n15: 'quindici', n16: 'sedici', n17: 'diciassette', n18: 'diciotto', n19: 'diciannove', n20: 'venti',
  // lezione 28: le decine
  n30: 'trenta', n40: 'quaranta', n50: 'cinquanta', n60: 'sessanta', n70: 'settanta', n80: 'ottanta', n90: 'novanta', n100: 'cento',
  // lezione 31: le centinaia e mille
  n200: 'duecento', n300: 'trecento', n400: 'quattrocento', n500: 'cinquecento', n1000: 'mille' };
const NUM_ALIAS = { quatro: 'quattro', cinqu: 'cinque', sete: 'sette', diece: 'dieci', dice: 'dieci', quatordici: 'quattordici', quattordic: 'quattordici', diciasette: 'diciassette', dicianove: 'diciannove', dicinove: 'diciannove', sedic: 'sedici', quarant: 'quaranta', cinquant: 'cinquanta', sesanta: 'sessanta', setanta: 'settanta' };
const NUM_KEY = {};
Object.keys(NUMS).forEach(k => { NUM_KEY[NUMS[k]] = k; });
const isNum = (k) => typeof k === 'string' && !!NUMS[k];
const QN = 'Che numero è?';
const numSay = (k) => 'il numero ' + NUMS[k];

const SN = {
  present: (X) => { const p = 'È ' + numSay(X) + '.'; return { type: 'echo', check: 'claim', num: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', num: true, show: X, prompt: 'È ' + numSay(X) + '?', model: 'Sì, è ' + numSay(X) + '.' }),
  neg: (X, Y) => ({ type: 'neg', num: true, show: X, ask: Y, prompt: 'È ' + numSay(Y) + '?', model: 'No, non è ' + numSay(Y) + '.' }),
  alt: (X, Y) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', num: true, show: X, options: o, prompt: 'È ' + numSay(o[0]) + ' o ' + numSay(o[1]) + '?', model: 'È ' + numSay(X) + '.' };
  },
  key: (X) => ({ type: 'key', num: true, show: X, prompt: QN, model: 'È ' + numSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', num: true, show: X, prompt: QN + ' È ' + numSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', num: true, show: X, prompt: QN, model: QN })
};

// Tutti i numeri da 1 a 1000 in parole (lezioni 30 e seguenti): «ventuno», «trentotto», «ventitré», «duecentocinquanta», «mille»
const NUM_U = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
const NUM_T = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
function numWord(n) {
  if (n === 1000) return 'mille';
  if (n >= 100) { const h = Math.floor(n / 100), r = n % 100; return (h === 1 ? '' : NUM_U[h]) + 'cento' + (r ? numWord(r) : ''); }
  if (n < 20) return NUM_U[n];
  const t = NUM_T[Math.floor(n / 10)], u = n % 10;
  return (u === 1 || u === 8 ? t.slice(0, -1) : t) + (u === 3 ? 'tré' : NUM_U[u]);
}
// parola (come la scrive norm(), senza accenti) → numero
const NUM_VAL = {};
for (let n = 1; n <= 1000; n++) NUM_VAL[numWord(n).replace('é', 'e')] = n;
NUM_VAL.centotto = 108;

// Cifre → parole («3» → «tre»), poi la solita pulizia; alias del microfono
const numDigits = (text) => String(text || '').replace(/(\d)\s*\+\s*(\d)/g, '$1 più $2').replace(/\b(\d{1,4})\b/g, (d) => +d >= 1 && +d <= 1000 ? ' ' + numWord(+d) + ' ' : d);
function numNorm(text) {
  let s = norm(numDigits(text));
  Object.keys(NUM_ALIAS).forEach(a => { s = s.replace(new RegExp(' ' + a + '(?= )', 'g'), ' ' + NUM_ALIAS[a]); });
  return s;
}
// «è il numero tre» / «è il tre» / «è l otto» / «non è il numero due»
function numStatements(s) {
  const out = [];
  const re = / (non )?e (?:il numero |il |l |lo )([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) out.push({ k: NUM_KEY[m[2]] || ('?' + m[2]), neg: !!m[1] });
  return out;
}
function numEvaluate(step, text) {
  const s = numNorm(text);
  const st = numStatements(s), X = step.show;
  const pos = st.filter(x => !x.neg).map(x => x.k), neg = st.filter(x => x.neg).map(x => x.k);
  const yes = has(s, 'si'), no = has(s, 'no');
  const onlyX = pos.every(k => k === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: has(s, 'che numero e') && !st.length, full: true };
      return { ok: pos.indexOf(X) !== -1 && onlyX && !neg.length, full: true };
    case 'yes':
      return { ok: yes && !no && !neg.length && pos.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg':
      return { ok: !yes && neg.indexOf(step.ask) !== -1 && neg.indexOf(X) === -1 && onlyX, full: pos.indexOf(X) !== -1 };
    case 'alt':
    case 'key':
      return { ok: pos.indexOf(X) !== -1 && onlyX && !neg.length && !has(s, 'o') && !has(s, 'che numero e'), full: true };
  }
  return { ok: false, full: false };
}

// Domande dell'allievo sul cartellino che ha toccato
function numEvalAsk(X, text) {
  const s = numNorm(text);
  const bad = (model) => ({ ok: false, model: model || QN });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'che numero e') || has(s, 'che cosa e')) return { ok: true, kind: 'what' };
  const alt = / e (?:il numero |il |l )([a-z]+) (?:o|oppure) (?:il numero |il |l )?([a-z]+)(?= )/.exec(s);
  if (alt) {
    const A = NUM_KEY[alt[1]], B = NUM_KEY[alt[2]];
    return A && B && A !== B ? { ok: true, kind: 'alt', ask: A, ask2: B } : bad();
  }
  const st = numStatements(s);
  if (st.length === 1 && isNum(st[0].k)) return { ok: true, kind: st[0].k === X ? 'yes' : 'no', ask: st[0].k };
  return bad();
}
function numAnswerAsk(X, r) {
  const say = 'È ' + numSay(X) + '.';
  if (r.kind === 'what') return say;
  if (r.kind === 'yes') return 'Sì, è ' + numSay(X) + '.';
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? say : 'Non è né ' + numSay(r.ask) + ' né ' + numSay(r.ask2) + '. ' + say;
  return 'No, non è ' + numSay(r.ask) + '. ' + say;
}

// Il motore resta quello: per i cartellini dei numeri si usano queste frasi e queste regole
(function () {
  const base = Object.assign({}, S);
  ['present', 'yes', 'key', 'reveal', 'askQ'].forEach(f => { S[f] = function (X) { return isNum(X) ? SN[f](X) : base[f].apply(null, arguments); }; });
  S.neg = function (X, Y) { return isNum(X) ? SN.neg(X, Y) : base.neg.apply(null, arguments); };
  S.alt = function (X, Y) { return isNum(X) ? SN.alt(X, Y) : base.alt.apply(null, arguments); };
  const bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bEcho = isEcho, bTrim = trimEcho;
  // eco della domanda anche quando il microfono scrive le cifre
  isEcho = (step, text) => bEcho(step, step && step.num ? numDigits(text) : text);
  trimEcho = (step, text) => bTrim(step, step && step.num ? numDigits(text) : text);
  evaluate = (step, text) => step && step.num ? numEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isNum(X) ? numEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isNum(X) ? numAnswerAsk(X, r) : bAns(X, r);
})();
