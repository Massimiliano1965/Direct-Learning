'use strict';
/* =====================================================================
   CAPITOLO 3: «Preposizioni articolate» (lezione 18) — su e in + il, la, lo, l'
   Si carica dopo logic.js e third_it.js (articoli il, la, lo, l'). Sei scene: un oggetto sopra o dentro un altro.
     Il libro è sul tavolo.            Il telefono è sulla sedia.       L'arancia è sull'agenda.
     La chiave è nel cappotto.         La penna è nello zaino.          La bottiglia è nella borsa.
     Il libro è sul tavolo?            → Sì, il libro è sul tavolo.
     Il libro è nella borsa?           → No, il libro non è nella borsa.
     Il libro è sul tavolo o sulla sedia? → Il libro è sul tavolo.
     Dov'è il libro?                   → Il libro è sul tavolo.   (va bene anche «È sul tavolo.»)
   Errori: «su il tavolo», «sullo tavolo», «nel borsa», «in la borsa», il posto sbagliato.
   ===================================================================== */

const inner = (svg) => String(svg || '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const PREP_SCENES = {
  q_book:   { obj: 'book',   place: 'table',    prep: 'su',
    fig: () => inner(FIG.table) + '<g transform="translate(50 37) scale(.32) translate(-50 -88)">' + inner(FIG.book) + '</g>' },
  q_phone:  { obj: 'phone',  place: 'chair',    prep: 'su',
    fig: () => inner(FIG.chair) + '<g transform="translate(50 59) scale(.3) translate(-50 -88)">' + inner(FIG.phone) + '</g>' },
  q_orange: { obj: 'orange', place: 'agenda',   prep: 'su',
    // l'agenda distesa sul piano, l'arancia sopra
    fig: () => '<ellipse cx="52" cy="90" rx="38" ry="3" fill="#000" opacity=".25"/><path d="M10 74 h66 l14 12 h-66z" fill="#2e2f37"/><path d="M24 86 h66 v4 h-66z" fill="#ece4d2"/>' +
      '<path d="M58 74 l14 12" stroke="#c9a45c" stroke-width="3"/><path d="M10 74 l14 12 v4 l-14 -12z" fill="#24252c"/>' +
      '<g transform="translate(48 79) scale(.5) translate(-50 -88)">' + inner(FIG.orange) + '</g>' },
  q_key:    { obj: 'key',    place: 'coat',     prep: 'in',
    // la chiave spunta dalla tasca del cappotto
    fig: () => inner(FIG.coat) + '<g transform="translate(64 52) scale(.5) rotate(-70) translate(-50 -50)">' + inner(FIG.key) + '</g>' +
      '<rect x="55" y="62" width="17" height="12" rx="2" fill="#3a3a45"/><path d="M55 62 h17" stroke="#2a2a33" stroke-width="1.5"/>' },
  q_pen:    { obj: 'pen',    place: 'backpack', prep: 'in',
    fig: () => '<g transform="translate(58 14) scale(.8) translate(-50 -50)">' + inner(FIG.pen) + '</g>' + inner(FIG.backpack) },
  q_bottle: { obj: 'bottle', place: 'bag',      prep: 'in',
    fig: () => '<g transform="translate(38 27) scale(.62) translate(-50 -50)">' + inner(FIG.bottle) + '</g>' + inner(FIG.bag) }
};
Object.keys(PREP_SCENES).forEach(X => {
  Object.defineProperty(FIG, X, { get: () => '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + PREP_SCENES[X].fig() + '</svg>', enumerable: true });
});
const isPrep = (X) => !!PREP_SCENES[X];

// «sul», «sulla», «sullo», «sull'», «nel», «nella», «nello», «nell'»
function prepArt(prep, k) {
  const a = p3Art(k);   // il, la, lo, l'
  const base = prep === 'su' ? 'su' : 'ne';
  return a === 'il' ? base + 'l' : a === 'l\'' ? base + 'll\'' : base + a.replace(/^l/, 'll');
}
const prepAt = (prep, k) => { const pa = prepArt(prep, k); return (pa.slice(-1) === '\'' ? pa : pa + ' ') + ITEMS[k].word; };   // «sull'agenda», «nello zaino»
const qSubj = (X) => { const k = PREP_SCENES[X].obj; return p3The(k); };                                                       // «il libro», «l'arancia»
const qCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const qWhere = (X) => prepAt(PREP_SCENES[X].prep, PREP_SCENES[X].place);
const qSay = (X) => qCap(qSubj(X)) + ' è ' + qWhere(X) + '.';
// un altro posto (di un'altra scena), con la sua preposizione
const qOtherPlace = (X) => { const o = pick(Object.keys(PREP_SCENES).filter(y => y !== X)); return { prep: PREP_SCENES[o].prep, place: PREP_SCENES[o].place }; };
const QP = 'Dov\'è?';

/* ---------- Frasi (prep = true) ---------- */
const SQ = {
  present: (X) => { const p = qSay(X); return { type: 'echo', check: 'claim', prep: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', prep: true, show: X, prompt: qCap(qSubj(X)) + ' è ' + qWhere(X) + '?', model: 'Sì, ' + qSubj(X) + ' è ' + qWhere(X) + '.' }),
  neg: (X) => {
    const o = qOtherPlace(X), at = prepAt(o.prep, o.place);
    return { type: 'neg', prep: true, show: X, ask: o.place, prompt: qCap(qSubj(X)) + ' è ' + at + '?', model: 'No, ' + qSubj(X) + ' non è ' + at + '.', complete: qSay(X) };
  },
  alt: (X) => {
    const o = qOtherPlace(X), a = [qWhere(X), prepAt(o.prep, o.place)], ord = Math.random() < 0.5 ? a : [a[1], a[0]];
    return { type: 'alt', prep: true, show: X, prompt: qCap(qSubj(X)) + ' è ' + ord[0] + ' o ' + ord[1] + '?', model: qSay(X) };
  },
  key: (X) => ({ type: 'key', prep: true, show: X, prompt: 'Dov\'è ' + qSubj(X) + '?', model: qSay(X) }),
  reveal: (X) => ({ type: 'reveal', prep: true, show: X, prompt: 'Dov\'è ' + qSubj(X) + '? ' + qSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', prep: true, show: X, prompt: QP, model: QP })
};

/* ---------- Capire le frasi ----------
   «(il libro) è sul tavolo», «non è nella borsa», anche le forme sbagliate («su il tavolo», «nel borsa»). */
const PREP_FORMS = { sul: 'su', sulla: 'su', sullo: 'su', sull: 'su', su: 'su', nel: 'in', nella: 'in', nello: 'in', nell: 'in', in: 'in' };
function prepStatements(s) {
  const out = [], re = / (?:(il|la|lo|l) ([a-z]+) )?(non )?e (sul|sulla|sullo|sull|su|nel|nella|nello|nell|in)(?: (il|la|lo|l))? ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const subj = m[2] ? WORD2KEY[m[2]] || '?' : null, place = WORD2KEY[m[6]] || '?';
    const subjOk = !m[2] || (subj !== '?' && m[1] === p3ArtN(subj));
    // forma giusta: la preposizione articolata intera, senza articolo staccato
    const want = place !== '?' ? prepArt(PREP_FORMS[m[4]], place).replace('\'', '') : '';
    const formOk = place !== '?' && !m[5] && m[4] === want;
    out.push({ subj: subj, place: place, prep: PREP_FORMS[m[4]], neg: !!m[3], good: subjOk && formOk });
  }
  return out;
}
function prepEvaluate(step, text) {
  const s = norm(text), X = step.show, sc = PREP_SCENES[X];
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'dov e') && !prepStatements(s).length, full: true };
  const st = prepStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && (x.subj === null || x.subj === sc.obj) && x.place === sc.place && x.prep === sc.prep, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && (x.subj === null || x.subj === sc.obj) && x.place === step.ask);
      return { ok: !yes && said && !neg.some(x => x.place === sc.place) && allPos, full: pos.some(truth) };
    }
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'dov e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ----------
   «Dov'è il libro?» «Il libro è sul tavolo?» (e «Che cos'è?») */
function prepEvalAsk(X, text) {
  const s = norm(text), sc = PREP_SCENES[X];
  const bad = (model) => ({ ok: false, model: model || 'Dov\'è ' + qSubj(X) + '?' });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'dov e')) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = prepStatements(s).filter(x => x.subj === sc.obj || x.subj === null);
  if (st.length === 1 && st[0].good && st[0].place !== '?') return { ok: true, kind: st[0].place === sc.place ? 'yes' : 'no', ask: st[0] };
  if (st.length === 1 && st[0].place !== '?' && ITEMS[st[0].place]) return bad(qCap(qSubj(X)) + ' è ' + prepAt(st[0].prep, st[0].place) + '?');
  return bad();
}
function prepAnswerAsk(X, r) {
  if (r.kind === 'thing') return 'È ' + np(PREP_SCENES[X].obj) + '.';
  if (r.kind === 'yes') return 'Sì, ' + qSubj(X) + ' è ' + qWhere(X) + '.';
  if (r.kind === 'no') return 'No, ' + qSubj(X) + ' non è ' + prepAt(r.ask.prep, r.ask.place) + '. ' + qSay(X);
  return qSay(X);
}

function prepDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === qSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SQ[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza (come le lezioni 11-13) ---------- */
function buildPrepSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SQ.present(x), 'present')));
  shuffle(K).forEach(x => add(SQ.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SQ.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SQ.yes(X) : SQ.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SQ.alt(x), 'alt'));
  add(SQ.reveal(K[0]), 'reveal').pause = 1200;
  add(SQ.reveal(K[K.length - 1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SQ.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SQ.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', prep: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SQ[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', prep: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.prep ? buildPrepSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.prep ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.prep ? prepEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isPrep(X) ? prepEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isPrep(X) ? prepAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.prep ? prepDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isPrep(X) ? SQ.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isPrep(X) ? SQ.present(X) : bPresent.apply(null, arguments); };
})();
