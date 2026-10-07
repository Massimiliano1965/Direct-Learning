'use strict';
/* =====================================================================
   CAPITOLO 4: «Che ora è?» (lezione 20). Si carica dopo numbers_it.js (numeri e cifre del microfono).
   Sei orologi con le ore intere (numeri già noti dalle lezioni 6 e 7).
     È l'una.  Sono le tre.                 → ripete
     Sono le tre?                           → Sì, sono le tre.
     Sono le cinque?                        → No, non sono le cinque.
     È l'una? (sono le tre)                 → No, non è l'una.
     Sono le due o le tre?                  → Sono le tre.
     Che ora è?                             → Sono le tre.   (va bene anche «Che ore sono?»)
   Il punto: «è l'una» (una sola) ma «sono le due, le tre…» (più ore).
   Errori: «è le tre», «sono l'una», «la una», l'ora sbagliata. Il microfono scrive le cifre: «sono le 3» va bene.
   ===================================================================== */

const HOURS = { h1: 1, h2: 2, h3: 3, h5: 5, h8: 8, h10: 10 };
const isHour = (X) => typeof X === 'string' && !!HOURS[X];
const hNum = (X) => HOURS[X];
const hWord = (n) => n === 1 ? 'una' : NUMS['n' + n];
const hIs = (n) => n === 1 ? 'è l\'una' : 'sono le ' + hWord(n);              // «è l'una», «sono le tre»
const hIsNot = (n) => n === 1 ? 'non è l\'una' : 'non sono le ' + hWord(n);
const hCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const hSay = (X) => hCap(hIs(hNum(X))) + '.';
const QH = 'Che ora è?';
const hOther = (X) => pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => n !== hNum(X)));

/* ---------- Figure: orologio sobrio (blu e oro), lancetta delle ore sull'ora, minuti sulle 12 ---------- */
function clockFig(n) {
  const a = (n % 12) * 30 * Math.PI / 180, hx = 50 + Math.sin(a) * 20, hy = 48 - Math.cos(a) * 20;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const b = i * 30 * Math.PI / 180, r1 = i % 3 ? 32 : 29, x1 = 50 + Math.sin(b) * r1, y1 = 48 - Math.cos(b) * r1, x2 = 50 + Math.sin(b) * 35, y2 = 48 - Math.cos(b) * 35;
    ticks += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="#1d2638" stroke-width="' + (i % 3 ? 1.6 : 3) + '" stroke-linecap="round"/>';
  }
  return FLAT('<circle cx="50" cy="48" r="42" fill="#c9a45c"/><circle cx="50" cy="48" r="38" fill="#f3eee2"/>' + ticks +
    '<path d="M50 48 V18" stroke="#1d2638" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M50 48 L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" stroke="#1d2638" stroke-width="4.4" stroke-linecap="round"/>' +
    '<circle cx="50" cy="48" r="3.2" fill="#a3263a"/>', 32);
}
Object.keys(HOURS).forEach(X => { FIG[X] = clockFig(HOURS[X]); });

/* ---------- Frasi (ora = true) ---------- */
const SO = {
  present: (X) => { const p = hSay(X); return { type: 'echo', check: 'claim', ora: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', ora: true, show: X, prompt: hCap(hIs(hNum(X))) + '?', model: 'Sì, ' + hIs(hNum(X)) + '.' }),
  neg: (X) => { const o = hOther(X); return { type: 'neg', ora: true, show: X, ask: o, prompt: hCap(hIs(o)) + '?', model: 'No, ' + hIsNot(o) + '.', complete: hSay(X) }; },
  alt: (X) => {
    const n = hNum(X), o = hOther(X), ord = Math.random() < 0.5 ? [n, o] : [o, n];
    // «Sono le due o le tre?»; con l'una: «È l'una o sono le due?»
    const q = ord.indexOf(1) === -1 ? 'Sono le ' + hWord(ord[0]) + ' o le ' + hWord(ord[1]) + '?' : hCap(hIs(ord[0])) + ' o ' + hIs(ord[1]) + '?';
    return { type: 'alt', ora: true, show: X, prompt: q, model: hSay(X) };
  },
  key: (X) => ({ type: 'key', ora: true, show: X, prompt: QH, model: hSay(X) }),
  reveal: (X) => ({ type: 'reveal', ora: true, show: X, prompt: QH + ' ' + hSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', ora: true, show: X, prompt: QH, model: QH })
};

/* ---------- Capire le frasi ----------
   «(non) è l'una», «(non) sono le tre»; cifre del microfono → parole (numDigits). */
const oraNorm = (text) => numNorm(text);
function oraStatements(s) {
  const out = [], re = / (non )?(e|sono) (l|le|la|lo|il) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = m[4] === 'una' || m[4] === 'uno' ? 1 : (NUM_KEY[m[4]] ? +NUM_KEY[m[4]].slice(1) : null);
    if (!n) continue;
    // «l'1» del microfono diventa «l uno»: va bene
    const good = n === 1 ? (m[2] === 'e' && m[3] === 'l') : (m[2] === 'sono' && m[3] === 'le');
    out.push({ n: n, neg: !!m[1], good: good });
  }
  return out;
}
const isTimeQ = (s) => has(s, 'che ora e') || has(s, 'che ore sono');
function oraEvaluate(step, text) {
  const s = oraNorm(text), n = hNum(step.show);
  if (step.type === 'echo' && step.check === 'question') return { ok: isTimeQ(s) && !oraStatements(s).length, full: true };
  const st = oraStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.n === n, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.n === step.ask) && !neg.some(x => x.n === n) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !isTimeQ(s), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Che ora è?», «Sono le tre?», «È l'una?» ---------- */
function oraEvalAsk(X, text) {
  const s = oraNorm(text), bad = (model) => ({ ok: false, model: model || QH });
  if (has(s, 'si') || has(s, 'no') || / non (e|sono) /.test(s)) return bad();
  if (isTimeQ(s)) return { ok: true, kind: 'what' };
  const st = oraStatements(s);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].n === hNum(X) ? 'yes' : 'no', ask: st[0].n };
  if (st.length === 1) return bad(hCap(hIs(st[0].n)) + '?');   // «è le tre?» → «Sono le tre?»
  return bad();
}
function oraAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + hIs(hNum(X)) + '.';
  if (r.kind === 'no') return 'No, ' + hIsNot(r.ask) + '. ' + hSay(X);
  return hSay(X);
}

function oraDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === hSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SO[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza (come le lezioni 6 e 7) ---------- */
function buildOraSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SO.present(x), 'present')));
  shuffle(K).forEach(x => add(SO.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SO.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SO.yes(X) : SO.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SO.alt(x), 'alt'));
  add(SO.reveal(K[0]), 'reveal').pause = 1200;
  add(SO.reveal(K[K.length - 1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SO.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SO.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', ora: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SO[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', ora: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const bEcho = isEcho, bTrim = trimEcho;
  buildSteps = (lesson) => lesson.ora ? buildOraSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.ora ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.ora ? oraEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isHour(X) ? oraEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isHour(X) ? oraAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.ora ? oraDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isHour(X) ? SO.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isHour(X) ? SO.present(X) : bPresent.apply(null, arguments); };
  // eco della domanda anche quando il microfono scrive le cifre («sono le 3»)
  isEcho = (step, text) => bEcho(step, step && step.ora ? numDigits(text) : text);
  trimEcho = (step, text) => bTrim(step, step && step.ora ? numDigits(text) : text);
})();
