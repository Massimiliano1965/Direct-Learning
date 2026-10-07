'use strict';
/* =====================================================================
   CAPITOLO 4: «A che ora?» (lezione 21). Si carica dopo ora_it.js (orologi e ore).
   Sei impegni di chi viaggia e lavora, ognuno con il suo orologio piccolo:
     L'aereo è alle tre.  Il pranzo è all'una.        → ripete
     La riunione è alle nove?                         → Sì, la riunione è alle nove.
     La cena è alle sette?                            → No, la cena non è alle sette.
     L'aereo è alle tre o alle cinque?                → L'aereo è alle tre.
     A che ora è la cena?                             → La cena è alle otto.   (va bene anche «Alle otto.»)
   Il punto: «alle due, alle tre…» ma «all'una».
   Errori: «alla tre», «a le tre», «alle una», l'ora sbagliata. Le cifre del microfono («alle 8») vanno bene.
   ===================================================================== */

const APPTS = {
  a_plane:     { word: 'aereo',     art: 'l\'', h: 3 },
  a_meeting:   { word: 'riunione',  art: 'la',  h: 9 },
  a_dinner:    { word: 'cena',      art: 'la',  h: 8 },
  a_lunch:     { word: 'pranzo',    art: 'il',  h: 1 },
  a_taxi:      { word: 'taxi',      art: 'il',  h: 5 },
  a_breakfast: { word: 'colazione', art: 'la',  h: 7 }
};
const APPT_WORD = {};
Object.keys(APPTS).forEach(k => { APPT_WORD[APPTS[k].word] = k; });
APPT_WORD.aerei = 'a_plane'; APPT_WORD.riunioni = 'a_meeting'; APPT_WORD.tassi = 'a_taxi'; APPT_WORD.tassì = 'a_taxi';
const isAppt = (X) => !!APPTS[X];
const apThe = (X) => { const a = APPTS[X]; return a.art === 'l\'' ? 'l\'' + a.word : a.art + ' ' + a.word; };   // «l'aereo», «la cena»
const apArtN = (X) => APPTS[X].art === 'l\'' ? 'l' : APPTS[X].art;
const apAt = (n) => n === 1 ? 'all\'una' : 'alle ' + hWord(n);                                               // «all'una», «alle tre»
const apCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const apSay = (X) => apCap(apThe(X)) + ' è ' + apAt(APPTS[X].h) + '.';
const apQ = (X) => 'A che ora è ' + apThe(X) + '?';
const QA = 'A che ora è?';
const apOther = (X) => pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => n !== APPTS[X].h));

/* ---------- Figure: l'impegno con il suo orologio piccolo ---------- */
const APPT_ICON = {
  a_plane: '<path d="M10 52 l30 -4 l22 -22 h8 l-10 22 l20 -2 l8 -8 h6 l-4 12 l4 12 h-6 l-8 -8 l-20 -2 l10 22 h-8 l-22 -22 l-30 -4z" fill="#d9dee8"/><path d="M40 48 l30 0" stroke="#9aa6bd" stroke-width="1.5"/>',
  a_meeting: '<rect x="18" y="20" width="64" height="38" rx="3" fill="#ece4d2"/><path d="M26 48 l12 -12 l10 8 l14 -16 l12 10" fill="none" stroke="#2c3e66" stroke-width="3"/><rect x="47" y="58" width="6" height="10" fill="#8d93a3"/>' +
    '<circle cx="26" cy="74" r="6" fill="#3a4f7e"/><path d="M17 90 q9 -12 18 0z" fill="#3a4f7e"/><circle cx="50" cy="74" r="6" fill="#5a6b8c"/><path d="M41 90 q9 -12 18 0z" fill="#5a6b8c"/><circle cx="74" cy="74" r="6" fill="#3a4f7e"/><path d="M65 90 q9 -12 18 0z" fill="#3a4f7e"/>',
  a_dinner: '<ellipse cx="46" cy="68" rx="30" ry="12" fill="#ece4d2"/><ellipse cx="46" cy="66" rx="18" ry="7" fill="#d9cdb2"/><path d="M10 54 v24 M14 54 v10 q-2 4 -4 4 M6 54 v10 q2 4 4 4" stroke="#b9bdc8" stroke-width="2" fill="none"/>' +
    '<path d="M82 54 v24" stroke="#b9bdc8" stroke-width="2.4"/><path d="M82 54 q5 4 0 12" fill="#b9bdc8"/><rect x="64" y="24" width="6" height="24" rx="1" fill="#f3eee2"/><path d="M67 14 q4 6 0 9 q-4 -3 0 -9z" fill="#e8a33a"/>',
  a_lunch: '<ellipse cx="50" cy="66" rx="32" ry="13" fill="#ece4d2"/><ellipse cx="50" cy="64" rx="20" ry="8" fill="#e8d4a8"/><path d="M38 62 q12 -10 24 0" fill="#c96f1e"/><path d="M12 52 v24 M16 52 v10 q-2 4 -4 4 M8 52 v10 q2 4 4 4" stroke="#b9bdc8" stroke-width="2" fill="none"/>' +
    '<path d="M88 52 v24" stroke="#b9bdc8" stroke-width="2.4"/><path d="M88 52 q5 4 0 12" fill="#b9bdc8"/><path d="M60 22 h14 l-2 22 h-10z" fill="#9fbcd0" opacity=".85"/>',
  a_taxi: '<path d="M16 62 l8 -18 h52 l8 18 v14 h-68z" fill="#e8b82a"/><rect x="40" y="34" width="20" height="8" rx="1.5" fill="#1d2638"/><text x="50" y="40.5" font-size="6" font-family="Arial" font-weight="700" fill="#e8b82a" text-anchor="middle">TAXI</text>' +
    '<path d="M28 46 h18 v14 h-24z M54 46 h18 l6 14 h-24z" fill="#9fbcd0"/><circle cx="32" cy="78" r="8" fill="#1d2638"/><circle cx="68" cy="78" r="8" fill="#1d2638"/><circle cx="32" cy="78" r="3" fill="#8d93a3"/><circle cx="68" cy="78" r="3" fill="#8d93a3"/>',
  a_breakfast: '<path d="M18 50 h36 l-4 28 a5 5 0 0 1 -5 4 h-18 a5 5 0 0 1 -5 -4z" fill="#f3eee2"/><path d="M53 56 h5 a7 7 0 0 1 0 14 h-6" fill="none" stroke="#f3eee2" stroke-width="4"/><ellipse cx="36" cy="50" rx="18" ry="3.5" fill="#5a3826"/>' +
    '<path d="M28 40 q3 -6 0 -12 M38 40 q3 -6 0 -12" stroke="#b9bdc8" stroke-width="1.6" fill="none"/><path d="M58 76 q6 -16 18 -12 q12 4 14 14 q-14 6 -32 -2z" fill="#d99a4a"/><path d="M66 70 q4 -4 8 2 M76 68 q4 -2 6 4" stroke="#b5762c" stroke-width="1.6" fill="none"/>'
};
function apptFig(X) {
  const clock = inner(clockFig(APPTS[X].h)).replace(/<ellipse[^>]*opacity="\.25"\/>/, '');
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="92" rx="32" ry="3" fill="#000" opacity=".25"/>' + APPT_ICON[X] +
    '<circle cx="80" cy="80" r="17" fill="#1d2638"/><g transform="translate(80 80) scale(.38) translate(-50 -48)">' + clock + '</g></svg>';
}
Object.keys(APPTS).forEach(X => { FIG[X] = apptFig(X); });

/* ---------- Frasi (appt = true) ---------- */
const SA2 = {
  present: (X) => { const p = apSay(X); return { type: 'echo', check: 'claim', appt: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', appt: true, show: X, prompt: apCap(apThe(X)) + ' è ' + apAt(APPTS[X].h) + '?', model: 'Sì, ' + apThe(X) + ' è ' + apAt(APPTS[X].h) + '.' }),
  neg: (X) => { const o = apOther(X); return { type: 'neg', appt: true, show: X, ask: o, prompt: apCap(apThe(X)) + ' è ' + apAt(o) + '?', model: 'No, ' + apThe(X) + ' non è ' + apAt(o) + '.', complete: apSay(X) }; },
  alt: (X) => { const n = APPTS[X].h, o = apOther(X), ord = Math.random() < 0.5 ? [n, o] : [o, n];
    return { type: 'alt', appt: true, show: X, prompt: apCap(apThe(X)) + ' è ' + apAt(ord[0]) + ' o ' + apAt(ord[1]) + '?', model: apSay(X) }; },
  key: (X) => ({ type: 'key', appt: true, show: X, prompt: apQ(X), model: apSay(X) }),
  reveal: (X) => ({ type: 'reveal', appt: true, show: X, prompt: apQ(X) + ' ' + apSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', appt: true, show: X, prompt: QA, model: QA })
};

/* ---------- Capire le frasi ----------
   «(la cena) (non) è alle otto», «è all'una», e la risposta breve «alle otto». */
function apptStatements(s) {
  const out = [], re = / (?:(il|la|lo|l) ([a-z]+) )?(non )?(?:e )?(alle|all|alla|al|a le|a l|a) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = m[5] === 'una' || m[5] === 'uno' ? 1 : (NUM_KEY[m[5]] ? +NUM_KEY[m[5]].slice(1) : null);
    if (!n) continue;
    const subj = m[2] ? APPT_WORD[m[2]] || '?' : null;
    const subjOk = !m[2] || (subj !== '?' && m[1] === apArtN(subj));
    const prepOk = n === 1 ? m[4] === 'all' : m[4] === 'alle';
    out.push({ subj: subj, n: n, neg: !!m[3], good: subjOk && prepOk });
  }
  return out;
}
const isApptQ = (s) => has(s, 'a che ora e') || has(s, 'a che ora');
function apptEvaluate(step, text) {
  const s = numNorm(text), X = step.show, h = APPTS[X].h;
  if (step.type === 'echo' && step.check === 'question') return { ok: isApptQ(s) && !apptStatements(s).length, full: true };
  const st = apptStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && (x.subj === null || x.subj === X) && x.n === h, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.subj === X) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.n === step.ask) && !neg.some(x => x.n === h) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !isApptQ(s), full: true };
  }
}

/* ---------- Le domande dell'allievo: «A che ora è la cena?», «La cena è alle otto?» ---------- */
function apptEvalAsk(X, text) {
  const s = numNorm(text), bad = (model) => ({ ok: false, model: model || apQ(X) });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (isApptQ(s)) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = apptStatements(s).filter(x => x.subj === X || x.subj === null);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].n === APPTS[X].h ? 'yes' : 'no', ask: st[0].n };
  if (st.length === 1) return bad(apCap(apThe(X)) + ' è ' + apAt(st[0].n) + '?');
  return bad();
}
function apptAnswerAsk(X, r) {
  if (r.kind === 'thing') return 'È ' + (APPTS[X].art === 'la' ? 'una ' : 'un ') + APPTS[X].word + '.';
  if (r.kind === 'yes') return 'Sì, ' + apThe(X) + ' è ' + apAt(APPTS[X].h) + '.';
  if (r.kind === 'no') return 'No, ' + apThe(X) + ' non è ' + apAt(r.ask) + '. ' + apSay(X);
  return apSay(X);
}

function apptDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === apSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SA2[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildApptSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SA2.present(x), 'present')));
  shuffle(K).forEach(x => add(SA2.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SA2.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SA2.yes(X) : SA2.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SA2.alt(x), 'alt'));
  add(SA2.reveal(K[0]), 'reveal').pause = 1200;
  add(SA2.reveal(K[K.length - 1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SA2.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SA2.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', appt: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SA2[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', appt: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const bEcho = isEcho, bTrim = trimEcho;
  buildSteps = (lesson) => lesson.appt ? buildApptSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.appt ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.appt ? apptEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isAppt(X) ? apptEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isAppt(X) ? apptAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.appt ? apptDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isAppt(X) ? SA2.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isAppt(X) ? SA2.present(X) : bPresent.apply(null, arguments); };
  isEcho = (step, text) => bEcho(step, step && step.appt ? numDigits(text) : text);
  trimEcho = (step, text) => bTrim(step, step && step.appt ? numDigits(text) : text);
})();
