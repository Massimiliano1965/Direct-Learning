'use strict';
/* =====================================================================
   CAPITOLO 2, esercizio 5: «Città e paesi. A) In o a? B) Che cosa è Napoli?»
   Si carica dopo logic.js. Due lezioni (figure in geo_fig.js):
   Lezione 8 «Che cosa è Roma?» (geo: 'cat')
     Roma è una città.  L'Italia è un paese.
     Roma è una città?          → Sì, Roma è una città.
     Roma è un paese?           → No, Roma non è un paese.
     Roma è una città o un paese? → Roma è una città.
     Che cosa è Roma?           → Roma è una città.
   Lezione 9 «In o a?» (geo: 'dove'): monumento → «a» + città, «in» + paese
     Il Colosseo è a Roma.  Il Colosseo è in Italia.
     Il Colosseo è a Parigi?    → No, il Colosseo non è a Parigi.
     Dov'è il Colosseo?         → Il Colosseo è a Roma.  (va bene anche «è in Italia»)
   Errori: «Roma è un città», «il Colosseo è in Roma», «la Torre Eiffel è a Francia».
   ===================================================================== */

const GEO = {
  roma:        { name: 'Roma', type: 'citta', country: 'italia', fig: () => MON2.colosseo },
  parigi:      { name: 'Parigi', type: 'citta', country: 'francia', fig: () => MON2.eiffel },
  londra:      { name: 'Londra', type: 'citta', country: 'inghilterra', fig: () => MON2.bigben },
  newyork:     { name: 'New York', type: 'citta', country: 'america', fig: () => MON2.liberta },
  italia:      { name: 'Italia', art: 'l\'', type: 'paese', fig: () => MAP2('italia') },
  francia:     { name: 'Francia', art: 'la', type: 'paese', fig: () => MAP2('francia') },
  inghilterra: { name: 'Inghilterra', art: 'l\'', type: 'paese', fig: () => MAP2('inghilterra') },
  america:     { name: 'America', art: 'l\'', type: 'paese', fig: () => MAP2('america') },
  cina:        { name: 'Cina', art: 'la', type: 'paese', fig: () => MAP2('cina') },
  colosseo:    { name: 'Colosseo', art: 'il', type: 'mon', city: 'roma', country: 'italia', fig: () => MON2.colosseo },
  eiffel:      { name: 'Torre Eiffel', art: 'la', type: 'mon', city: 'parigi', country: 'francia', fig: () => MON2.eiffel },
  bigben:      { name: 'Big Ben', art: 'il', type: 'mon', city: 'londra', country: 'inghilterra', fig: () => MON2.bigben },
  liberta:     { name: 'Statua della Libertà', art: 'la', type: 'mon', city: 'newyork', country: 'america', fig: () => MON2.liberta },
  muraglia:    { name: 'Grande Muraglia', art: 'la', type: 'mon', city: null, country: 'cina', fig: () => MON2.muraglia }
};
// Figure: chiave «g_roma», «g_colosseo»…
Object.keys(GEO).forEach(k => { FIG['g_' + k] = GEO[k].fig(); });

const isGeo = (X) => typeof X === 'string' && X.slice(0, 2) === 'g_' && !!GEO[X.slice(2)];
const gk = (X) => X.slice(2);
const gcap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// «l'Italia», «la Francia», «il Colosseo», «Roma»
const gWith = (k) => { const g = GEO[k]; return g.art ? (g.art === 'l\'' ? 'l\'' : g.art + ' ') + g.name : g.name; };
const gSubj = (k) => gcap(gWith(k));
const gCat = (k) => GEO[k].type === 'citta' ? 'una città' : 'un paese';
const gOther = (k) => GEO[k].type === 'citta' ? 'un paese' : 'una città';
// luogo con la preposizione giusta: «a Roma», «in Italia»
const gAt = (place) => (GEO[place].type === 'citta' ? 'a ' : 'in ') + GEO[place].name;
const gWhere = (m) => GEO[m].city ? gAt(GEO[m].city) : gAt(GEO[m].country);
const QD = 'Dov\'è?';

/* ---------- Frasi dell'insegnante ---------- */
const SG = {
  // lezione 8
  present: (X) => { const k = gk(X), p = gSubj(k) + ' è ' + gCat(k) + '.'; return { type: 'echo', check: 'claim', geo: 'cat', show: X, prompt: p, model: p }; },
  yes: (X) => { const k = gk(X); return { type: 'yes', geo: 'cat', show: X, prompt: gSubj(k) + ' è ' + gCat(k) + '?', model: 'Sì, ' + gWith(k) + ' è ' + gCat(k) + '.' }; },
  neg: (X) => { const k = gk(X); return { type: 'neg', geo: 'cat', show: X, ask: 'x', prompt: gSubj(k) + ' è ' + gOther(k) + '?', model: 'No, ' + gWith(k) + ' non è ' + gOther(k) + '.', complete: gSubj(k) + ' è ' + gCat(k) + '.' }; },
  alt: (X) => { const k = gk(X), o = Math.random() < 0.5 ? ['una città', 'un paese'] : ['un paese', 'una città']; return { type: 'alt', geo: 'cat', show: X, prompt: gSubj(k) + ' è ' + o[0] + ' o ' + o[1] + '?', model: gSubj(k) + ' è ' + gCat(k) + '.' }; },
  key: (X) => { const k = gk(X); return { type: 'key', geo: 'cat', show: X, prompt: 'Che cosa è ' + gWith(k) + '?', model: gSubj(k) + ' è ' + gCat(k) + '.' }; },
  // lezione 9: place = città o paese del monumento
  dPresent: (X, place) => { const p = gSubj(gk(X)) + ' è ' + gAt(place) + '.'; return { type: 'echo', check: 'claim', geo: 'dove', place: place, show: X, prompt: p, model: p }; },
  dYes: (X, place) => ({ type: 'yes', geo: 'dove', place: place, show: X, prompt: gSubj(gk(X)) + ' è ' + gAt(place) + '?', model: 'Sì, ' + gWith(gk(X)) + ' è ' + gAt(place) + '.' }),
  dNeg: (X, wrong) => ({ type: 'neg', geo: 'dove', show: X, ask: wrong, prompt: gSubj(gk(X)) + ' è ' + gAt(wrong) + '?', model: 'No, ' + gWith(gk(X)) + ' non è ' + gAt(wrong) + '.', complete: gSubj(gk(X)) + ' è ' + gWhere(gk(X)) + '.' }),
  dAlt: (X, wrong) => {
    const m = gk(X), right = GEO[wrong].type === 'citta' ? GEO[m].city : GEO[m].country;
    const o = Math.random() < 0.5 ? [right, wrong] : [wrong, right];
    return { type: 'alt', geo: 'dove', show: X, places: o, prompt: gSubj(m) + ' è ' + gAt(o[0]) + ' o ' + gAt(o[1]) + '?', model: gSubj(m) + ' è ' + gAt(right) + '.' };
  },
  dKey: (X) => ({ type: 'key', geo: 'dove', show: X, prompt: 'Dov\'è ' + gWith(gk(X)) + '?', model: gSubj(gk(X)) + ' è ' + gWhere(gk(X)) + '.' }),
  dReveal: (X) => ({ type: 'reveal', geo: 'dove', show: X, prompt: 'Dov\'è ' + gWith(gk(X)) + '? ' + gSubj(gk(X)) + ' è ' + gWhere(gk(X)) + '.', model: '' }),
  dAskQ: (X) => ({ type: 'echo', check: 'question', geo: 'dove', show: X, prompt: QD, model: QD })
};

/* ---------- Capire le frasi ----------
   Prima i nomi di più parole diventano una parola sola («new york» → «newyork»). */
const GEO_WORDS = [['new york', 'newyork'], ['nuova york', 'newyork'], ['torre eiffel', 'eiffel'], ['tour eiffel', 'eiffel'], ['big ben', 'bigben'],
  ['statua della liberta', 'liberta'], ['grande muraglia', 'muraglia'], ['muraglia cinese', 'muraglia'], ['stati uniti', 'america'], ['dove e', 'dov e']];
function geoNorm(text) {
  let s = norm(text);
  GEO_WORDS.forEach(([a, b]) => { s = s.split(' ' + a + ' ').join(' ' + b + ' '); });
  return s;
}
const ART_OK = (k, a) => { const g = GEO[k]; if (!g) return false; const want = g.art ? (g.art === 'l\'' ? 'l' : g.art) : ''; return (a || '') === want; };
// Lezione 8: «[l'/la] X [non] è un/una città/paese»
function catStatements(s) {
  const out = [], re = / (?:(il|la|lo|l) )?([a-z]+) (non )?e (un|una|uno) (citta|paese)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = GEO[m[2]] ? m[2] : null, cat = m[5];
    const good = !!k && ART_OK(k, m[1]) && m[4] === (cat === 'citta' ? 'una' : 'un');
    out.push({ k: k, cat: cat, neg: !!m[3], good: good });
  }
  return out;
}
// Lezione 9: «[il/la] X [non] è a/in Y»
function doveStatements(s) {
  const out = [], re = / (?:(il|la|lo|l) )?([a-z]+) (non )?e (a|in) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = GEO[m[2]] ? m[2] : null, place = GEO[m[5]] ? m[5] : null;
    const prepOk = !!place && m[4] === (GEO[place].type === 'citta' ? 'a' : 'in');
    out.push({ k: k, place: place, neg: !!m[3], good: !!k && ART_OK(k, m[1]) && prepOk });
  }
  return out;
}
const isTrue = (m, place) => !!place && (GEO[m].city === place || GEO[m].country === place);

function geoEvaluate(step, text) {
  const s = geoNorm(text), X = gk(step.show), yes = has(s, 'si'), no = has(s, 'no');
  if (step.type === 'echo' && step.check === 'question') {
    const q = step.geo === 'dove' ? (has(s, 'dov e') || has(s, 'dove')) : has(s, 'che cosa e');
    return { ok: q && !/ e (?:a|in|un|una) /.test(s), full: true };
  }
  if (step.geo === 'cat') {
    const st = catStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
    const truth = (x) => x.good && x.k === X && x.cat === GEO[X].type;
    const allPos = pos.every(truth);
    switch (step.type) {
      case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
      case 'yes': return { ok: yes && !no && pos.some(truth) && allPos && !neg.length, full: true };
      case 'neg': return { ok: !yes && neg.some(x => x.good && x.k === X && x.cat !== GEO[X].type) && !neg.some(x => x.cat === GEO[X].type) && allPos, full: pos.some(truth) };
      default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa e'), full: true };
    }
  }
  const st = doveStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const truth = (x) => x.good && x.k === X && isTrue(X, x.place);
  const allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.place === step.place) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.some(x => truth(x) && x.place === step.place) && allPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.k === X && x.place === step.ask) && !neg.some(x => isTrue(X, x.place)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'dov e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ---------- */
function geoEvalAsk(Xkey, text) {
  const s = geoNorm(text), X = gk(Xkey), mon = GEO[X].type === 'mon';
  const bad = (model) => ({ ok: false, model: model || (mon ? 'Dov\'è ' + gWith(X) + '?' : 'Che cosa è ' + gWith(X) + '?') });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (mon) {
    if (has(s, 'dov e') || has(s, 'dove')) return { ok: true, kind: 'what' };
    if (has(s, 'che cosa e') || has(s, 'che cos e')) return { ok: true, kind: 'thing' };   // «Che cos'è?» → «È il Colosseo.»
    const alt = / e (a|in) ([a-z]+) o (a|in) ([a-z]+)(?= )/.exec(s);
    if (alt && GEO[alt[2]] && GEO[alt[4]] && alt[2] !== alt[4]) return { ok: true, kind: 'alt', ask: alt[2], ask2: alt[4] };
    const st = doveStatements(s).filter(x => x.k === X);
    if (st.length === 1 && st[0].good) return { ok: true, kind: isTrue(X, st[0].place) ? 'yes' : 'no', ask: st[0].place };
    if (st.length === 1 && st[0].place) return bad(gSubj(X) + ' è ' + gAt(st[0].place) + '?');   // preposizione sbagliata: si corregge
    return bad();
  }
  if (has(s, 'che cosa e') || has(s, 'che cos e')) return { ok: true, kind: 'what' };
  if (/ (citta|paese) o (?:un|una) (citta|paese) /.test(s)) return { ok: true, kind: 'alt' };
  const st = catStatements(s).filter(x => x.k === X);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].cat === GEO[X].type ? 'yes' : 'no', ask: st[0].cat };
  return bad();
}
function geoAnswerAsk(Xkey, r) {
  const X = gk(Xkey);
  if (GEO[X].type === 'mon') {
    const say = gSubj(X) + ' è ' + gWhere(X) + '.';
    if (r.kind === 'thing') return 'È ' + gWith(X) + '.';
    if (r.kind === 'what') return say;
    if (r.kind === 'yes') return 'Sì, ' + gWith(X) + ' è ' + gAt(r.ask) + '.';
    if (r.kind === 'alt') return [r.ask, r.ask2].some(p => isTrue(X, p)) ? gSubj(X) + ' è ' + gAt([r.ask, r.ask2].find(p => isTrue(X, p))) + '.'
      : gSubj(X) + ' non è né ' + gAt(r.ask) + ' né ' + gAt(r.ask2) + '. ' + say;
    return 'No, ' + gWith(X) + ' non è ' + gAt(r.ask) + '. ' + say;
  }
  const say = gSubj(X) + ' è ' + gCat(X) + '.';
  if (r.kind === 'yes') return 'Sì, ' + gWith(X) + ' è ' + gCat(X) + '.';
  if (r.kind === 'no') return 'No, ' + gWith(X) + ' non è ' + gOther(X) + '. ' + say;
  return say;
}

/* ---------- Ripetizioni dopo un errore ---------- */
function geoDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const X = st.show, m = gk(X);
  for (let k = 1; out.length < n; k++) {
    let s;
    if (st.geo === 'cat') s = k % 3 === 1 ? SG.yes(X) : k % 3 === 2 ? SG.neg(X) : SG.present(X);
    else {
      const place = st.place || (GEO[m].city || GEO[m].country);
      s = k % 3 === 1 ? SG.dYes(X, place) : k % 3 === 2 ? SG.dNeg(X, geoWrong(m, GEO[place].type)) : SG.dPresent(X, place);
    }
    if (s.type === 'echo') s.prompt = s.model;
    s.drill = true;
    s.phase = st.phase;
    out.push(s);
  }
  return out;
}
// un luogo sbagliato dello stesso tipo (città o paese)
function geoWrong(m, type) {
  const right = type === 'citta' ? GEO[m].city : GEO[m].country;
  return pick(Object.keys(GEO).filter(k => GEO[k].type === type && k !== right));
}

/* ---------- Sequenze delle due lezioni ---------- */
function buildGeoSteps(lesson) {
  const st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  const mixK = (list, prevRef) => pick(list.filter(x => x !== prevRef));
  if (lesson.geo === 'cat') {
    const K = lesson.known.slice();
    presentRounds(K).forEach(round => round.forEach(x => add(SG.present(x), 'present')));
    shuffle(K).forEach(x => add(SG.yes(x), 'yes'));
    shuffle(K).forEach(x => add(SG.neg(x), 'neg'));
    shuffle(K).slice(0, 6).forEach(x => add(SG.alt(x), 'yesno'));
    shuffle(K).forEach(x => add(SG.key(x), 'key'));
    for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', geo: 'cat', prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
    let prev = null;
    for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
      const X = mixK(K, prev), t = pick(['yes', 'neg', 'alt', 'key']);
      const s = add(SG[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
    }
    for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', geo: 'cat', prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
    return st;
  }
  // lezione 9: «In o a?»
  const K = lesson.known.slice(), F = lesson.fresh, all = K.concat(F ? [F] : []);
  const cityOf = (X) => GEO[gk(X)].city, countryOf = (X) => GEO[gk(X)].country;
  // presentazione: prima la città («a»), poi il paese («in»); ogni monumento 2 o 3 volte
  presentRounds(K).forEach((round, r) => round.forEach(x => add(SG.dPresent(x, r === 1 ? countryOf(x) : (r === 0 ? cityOf(x) : pick([cityOf(x), countryOf(x)]))), 'present')));
  shuffle(K).forEach(x => add(SG.dYes(x, pick([cityOf(x), countryOf(x)])), 'yes'));
  shuffle(K).forEach(x => { const t = pick(['citta', 'paese']); add(SG.dNeg(x, geoWrong(gk(x), t)), 'neg'); });
  shuffle(K).forEach(x => add(SG.dAlt(x, geoWrong(gk(x), pick(['citta', 'paese']))), 'yesno'));
  if (F) {
    // il monumento nuovo: solo no (mai il suo paese), poi «Dov'è…?»
    shuffle(Object.keys(GEO).filter(k => GEO[k].type === 'paese' && k !== countryOf(F))).slice(0, 3).forEach(p => { add(SG.dNeg(F, p), 'fresh').fresh = true; });
    add(SG.dReveal(F), 'reveal').pause = 1500;
    add(SG.dReveal(K[0]), 'reveal');
    for (let i = 0; i < 2; i++) add(SG.dAskQ(F), 'askq');
    add(SG.dPresent(F, countryOf(F)), 'present');
  }
  for (let r = 0; r < 2; r++) shuffle(all).forEach(x => add(SG.dKey(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', geo: 'dove', prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  let prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = mixK(all, prev), m = gk(X), t = pick(['yes', 'neg', 'alt', 'key']);
    const type = GEO[m].city ? pick(['citta', 'paese']) : 'paese';
    const s = add(t === 'yes' ? SG.dYes(X, type === 'citta' ? GEO[m].city : GEO[m].country) : t === 'neg' ? SG.dNeg(X, geoWrong(m, type)) : t === 'alt' ? SG.dAlt(X, geoWrong(m, type)) : SG.dKey(X), 'mix');
    s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', geo: 'dove', prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

// Il motore usa queste funzioni: per le figure del capitolo 2 si passa alle regole qui sopra
(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.geo ? buildGeoSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.geo ? l.known.concat(l.fresh ? [l.fresh] : []) : bWords(l);
  evaluate = (step, text) => step && step.geo ? geoEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isGeo(X) ? geoEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isGeo(X) ? geoAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.geo ? geoDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isGeo(X) ? (GEO[gk(X)].type === 'mon' ? SG.dReveal(X) : { type: 'reveal', geo: 'cat', show: X, prompt: 'Che cosa è ' + gWith(gk(X)) + '? ' + gSubj(gk(X)) + ' è ' + gCat(gk(X)) + '.', model: '' }) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isGeo(X) ? (GEO[gk(X)].type === 'mon' ? SG.dPresent(X, GEO[gk(X)].city || GEO[gk(X)].country) : SG.present(X)) : bPresent.apply(null, arguments); };
})();

/* ---------- Luoghi colorati (aiuto nelle prime lezioni: lesson.placeHints) ----------
   Mentre l'insegnante fa la domanda i luoghi di cui parla pulsano in oro; dopo la risposta
   (o quando l'insegnante dà la frase giusta) il luogo vero diventa verde, quello sbagliato rosso. */
function stepPlaces(st) {
  if (!st || st.geo !== 'dove' || !st.show) return null;
  const m = gk(st.show);
  if (st.type === 'yes' || (st.type === 'echo' && st.check === 'claim')) return [st.place];
  if (st.type === 'neg') return [st.ask];
  if (st.type === 'alt') return st.places || null;
  if (st.type === 'key' || st.type === 'reveal') return [GEO[m].city || GEO[m].country];
  return null;
}
function placeIsTrue(st, p) { return isTrue(gk(st.show), p); }
