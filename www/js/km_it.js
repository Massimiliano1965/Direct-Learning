'use strict';
/* =====================================================================
   CAPITOLO 5: «Quanti chilometri ci sono…?» (lezione 29). Si carica dopo numbers_it.js e sum_it.js.
   Il cartello verde dell'autostrada: da una città all'altra, con i chilometri (strada, arrotondati alla decina).
     Da Roma a Milano ci sono cinquecentosettanta chilometri.        → ripete
     Da Roma a Napoli ci sono duecentoventi chilometri?              → Sì, ci sono duecentoventi chilometri.
     Da Roma a Firenze ci sono trecento chilometri?                  → No, non ci sono trecento chilometri.
     … ci sono centoquaranta o duecento chilometri?                  → Ci sono centoquaranta chilometri.
     Quanti chilometri ci sono da Milano a Torino?                   → Ci sono centoquaranta chilometri.
   Il microfono scrive spesso «570 km» o «cinquecento settanta»: va bene.
   Errori: il numero sbagliato, «c'è» / «è» invece di «ci sono».
   ===================================================================== */

const KMS = {
  km_roma_milano:     ['Roma', 'Milano', 570],
  km_roma_napoli:     ['Roma', 'Napoli', 220],
  km_roma_firenze:    ['Roma', 'Firenze', 270],
  km_milano_torino:   ['Milano', 'Torino', 140],
  km_firenze_bologna: ['Firenze', 'Bologna', 100],
  km_roma_venezia:    ['Roma', 'Venezia', 530]
};
const isKm = (X) => !!KMS[X];
const kmN = (X) => KMS[X][2];
const kmFromTo = (X) => 'da ' + KMS[X][0] + ' a ' + KMS[X][1];
const kmCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const kmAre = (n) => 'ci sono ' + numWord(n) + ' chilometri';
const kmSay = (X) => kmCap(kmFromTo(X)) + ' ' + kmAre(kmN(X)) + '.';
const kmQ = (X) => 'Quanti chilometri ci sono ' + kmFromTo(X) + '?';
const kmShort = (X) => kmCap(kmAre(kmN(X))) + '.';
function kmOther(X) {
  const r = kmN(X), c = [r + 100, r - 100, r + 50, r - 50, r + 200].filter(n => n >= 50 && n <= 1000 && n !== r);
  return pick(c);
}

/* ---------- Figura: il cartello verde dell'autostrada ---------- */
function kmFig(X) {
  const [a, b, n] = KMS[X];
  return FLAT('<rect x="47" y="60" width="6" height="32" fill="#8d93a3"/>' +
    '<rect x="6" y="12" width="88" height="52" rx="5" fill="#0d7a3e"/><rect x="9" y="15" width="82" height="46" rx="3.5" fill="none" stroke="#f3f6f4" stroke-width="1.6"/>' +
    '<text x="15" y="25" font-size="8" font-family="Arial, sans-serif" fill="#d8eadf">da ' + a.toUpperCase() + '</text>' +
    '<text x="15" y="40" font-size="' + (b.length > 6 ? 12 : 14) + '" font-weight="700" font-family="Arial, sans-serif" fill="#fff">' + b.toUpperCase() + '</text>' +
    '<path d="M15 50 h9 l5 4 l-5 4 h-9z" fill="#fff" opacity=".85"/>' +
    '<text x="86" y="57" font-size="15" font-weight="700" font-family="Arial, sans-serif" fill="#fff" text-anchor="end">' + n + ' km</text>', 34);
}
Object.keys(KMS).forEach(X => { FIG[X] = kmFig(X); });

/* ---------- Frasi (km = true) ---------- */
const SKM = {
  present: (X) => { const p = kmSay(X); return { type: 'echo', check: 'claim', km: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', km: true, show: X, prompt: kmSay(X).slice(0, -1) + '?', model: 'Sì, ' + kmAre(kmN(X)) + '.' }),
  neg: (X) => { const o = kmOther(X); return { type: 'neg', km: true, show: X, ask: o, prompt: kmCap(kmFromTo(X)) + ' ' + kmAre(o) + '?', model: 'No, non ' + kmAre(o) + '.', complete: kmShort(X) }; },
  alt: (X) => { const r = kmN(X), o = kmOther(X), ord = Math.random() < 0.5 ? [r, o] : [o, r];
    return { type: 'alt', km: true, show: X, prompt: kmCap(kmFromTo(X)) + ' ci sono ' + numWord(ord[0]) + ' o ' + numWord(ord[1]) + ' chilometri?', model: kmShort(X) }; },
  key: (X) => ({ type: 'key', km: true, show: X, prompt: kmQ(X), model: kmShort(X) }),
  reveal: (X) => ({ type: 'reveal', km: true, show: X, prompt: kmQ(X) + ' ' + kmShort(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', km: true, show: X, prompt: kmQ(X), model: kmQ(X) })
};

/* ---------- Capire le frasi ----------
   «(non) ci sono cinquecentosettanta chilometri», anche «570 km» e «cinquecento settanta». */
function kmNorm(text) {
  let s = numNorm(text).replace(/ km(?= )/g, ' chilometri').replace(/ chilometro(?= )/g, ' chilometri');
  // «cinquecento settanta» (due parole) → «cinquecentosettanta»
  s = s.replace(/ ([a-z]*cento|mille) ([a-z]+)(?= )/g, (m, a, b) => NUM_VAL[a + b] ? ' ' + a + b : m);
  return s;
}
function kmStatements(s) {
  s = s.replace(/ quanti chilometri ci sono /g, ' # ');
  const out = [], re = / (non )?(ci sono |c e |e |sono )?([a-z]+) chilometri(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = NUM_VAL[m[3]];
    if (!n) continue;
    out.push({ n: n, neg: !!m[1], verb: (m[2] || '').trim() });
  }
  return out;
}
// le città, se le dice, devono essere quelle del cartello (in un ordine o nell'altro)
function kmCitiesOk(s, X) {
  const m = / da ([a-z]+) a ([a-z]+)(?= )/.exec(s);
  if (!m) return true;
  const a = KMS[X][0].toLowerCase(), b = KMS[X][1].toLowerCase();
  return (m[1] === a && m[2] === b) || (m[1] === b && m[2] === a);
}
function kmEvaluate(step, text) {
  const s = kmNorm(text), X = step.show, r = kmN(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'quanti chilometri ci sono') && kmCitiesOk(s, X) && / da [a-z]+ a [a-z]+ /.test(s), full: true };
  const st = kmStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no'), cities = kmCitiesOk(s, X);
  const verbOk = (x) => x.verb === 'ci sono' || x.verb === '';
  const truth = (x) => x.n === r && verbOk(x), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: cities && pos.some(x => truth(x) && x.verb === 'ci sono') && allPos && !neg.length, full: true };
    case 'yes': return { ok: cities && yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: cities && !yes && neg.some(x => x.n === step.ask && x.verb === 'ci sono') && !neg.some(x => x.n === r) && allPos, full: pos.some(truth) };
    default: return { ok: cities && pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'quanti'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Quanti chilometri ci sono da Roma a Milano?», «… ci sono cinquecento chilometri?» ---------- */
function kmEvalAsk(X, text) {
  const s = kmNorm(text), bad = (model) => ({ ok: false, model: model || kmQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non') || !kmCitiesOk(s, X)) return bad();
  if (has(s, 'quanti chilometri')) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = kmStatements(s);
  if (st.length === 1 && st[0].verb === 'ci sono') return { ok: true, kind: st[0].n === kmN(X) ? 'yes' : 'no', ask: st[0].n };
  if (st.length === 1) return bad(kmCap(kmFromTo(X)) + ' ' + kmAre(st[0].n) + '?');   // «c'è / è» → «ci sono»
  return bad();
}
function kmAnswerAsk(X, r) {
  if (r.kind === 'thing') return kmSay(X);
  if (r.kind === 'yes') return 'Sì, ' + kmAre(kmN(X)) + '.';
  if (r.kind === 'no') return 'No, non ' + kmAre(r.ask) + '. ' + kmShort(X);
  return kmShort(X);
}

function kmDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === kmSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SKM[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildKmSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SKM.present(x), 'present')));
  shuffle(K).forEach(x => add(SKM.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SKM.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SKM.yes(X) : SKM.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SKM.alt(x), 'alt'));
  add(SKM.reveal(K[0]), 'reveal').pause = 1200;
  add(SKM.reveal(K[K.length - 1]), 'reveal');
  add(SKM.askQ(K[0]), 'askq');
  add(SKM.askQ(K[K.length - 1]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SKM.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', km: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SKM[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', km: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const bEcho = isEcho, bTrim = trimEcho;
  buildSteps = (lesson) => lesson.km ? buildKmSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.km ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.km ? kmEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isKm(X) ? kmEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isKm(X) ? kmAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.km ? kmDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isKm(X) ? SKM.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isKm(X) ? SKM.present(X) : bPresent.apply(null, arguments); };
  isEcho = (step, text) => bEcho(step, step && step.km ? numDigits(text) : text);
  trimEcho = (step, text) => bTrim(step, step && step.km ? numDigits(text) : text);
})();
