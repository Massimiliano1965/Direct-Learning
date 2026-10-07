'use strict';
/* =====================================================================
   LEZIONE DEI COLORI (italiano): «Il o la? Nero o nera?»
   Si carica dopo logic.js. Le figure sono «oggetto_colore» (es. phone_nero):
   ogni oggetto ha il suo colore fisso nella lezione.
     Il telefono è nero.            La valigia è nera.
     Il telefono è nero?            → Sì, il telefono è nero.
     Il telefono è bianco?          → No, il telefono non è bianco.
     Il telefono è nero o bianco?   → Il telefono è nero.
     Di che colore è il telefono?   → Il telefono è nero.
   Errori da riconoscere: articolo («il tazza») e accordo («la valigia è nero»).
   Il resto della lezione (ripetizioni, punteggi, insegnante) è il motore di sempre.
   ===================================================================== */

const QC = 'Di che colore è?';

// «phone_nero» → { obj: 'phone', col: 'nero' }
function combo(X) {
  if (typeof X !== 'string' || X.indexOf('_') === -1) return null;
  const [obj, col] = X.split('_');
  return ITEMS[obj] && COLORS[col] ? { obj: obj, col: col } : null;
}
const isFem = (obj) => ITEMS[obj].art === 'una' || ITEMS[obj].art === "un'";
// il, la, lo, l' (lezione 22: l'ombrello, l'agenda); defArtN = come lo scrive norm() («l»)
const defArt = (obj) => /^[aeiou]/.test(ITEMS[obj].word) ? 'l\'' : ITEMS[obj].art === 'uno' ? 'lo' : isFem(obj) ? 'la' : 'il';
const defArtN = (obj) => defArt(obj).replace('\'', '');
const theObj = (obj) => defArt(obj) + (defArt(obj) === 'l\'' ? '' : ' ') + ITEMS[obj].word;   // «il telefono», «l'ombrello»
const colW = (col, obj) => COLORS[col][isFem(obj) ? 'f' : 'm'];                  // «nera»
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const colSay = (X) => { const c = combo(X); return cap(theObj(c.obj)) + ' è ' + colW(c.col, c.obj) + '.'; };   // «Il telefono è nero.»
const colQ = (obj) => 'Di che colore è ' + theObj(obj) + '?';

// Frasi dell'insegnante sui colori (col = true: valutate con le regole dei colori)
const SC = {
  present: (X) => { const p = colSay(X); return { type: 'echo', check: 'claim', col: true, show: X, prompt: p, model: p }; },
  yes: (X) => { const c = combo(X); return { type: 'yes', col: true, show: X, prompt: cap(theObj(c.obj)) + ' è ' + colW(c.col, c.obj) + '?', model: 'Sì, ' + theObj(c.obj) + ' è ' + colW(c.col, c.obj) + '.' }; },
  neg: (X, other) => {
    const c = combo(X);
    return { type: 'neg', col: true, show: X, ask: other, prompt: cap(theObj(c.obj)) + ' è ' + colW(other, c.obj) + '?',
             model: 'No, ' + theObj(c.obj) + ' non è ' + colW(other, c.obj) + '.', complete: colSay(X) };
  },
  alt: (X, other) => {
    const c = combo(X), o = Math.random() < 0.5 ? [c.col, other] : [other, c.col];
    return { type: 'alt', col: true, show: X, options: o, prompt: cap(theObj(c.obj)) + ' è ' + colW(o[0], c.obj) + ' o ' + colW(o[1], c.obj) + '?', model: colSay(X) };
  },
  key: (X) => ({ type: 'key', col: true, show: X, prompt: colQ(combo(X).obj), model: colSay(X) }),
  reveal: (X) => ({ type: 'reveal', col: true, show: X, prompt: colQ(combo(X).obj) + ' ' + colSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', col: true, show: X, prompt: QC, model: QC })
};

/* ---------- Capire le frasi sui colori ----------
   «il telefono è nero» / «il telefono non è bianco»: per ogni frase si controllano
   oggetto, articolo e accordo del colore. Una frase sbagliata vale come affermazione sbagliata. */
const COLOR_WORD = {};
Object.keys(COLORS).forEach(c => { COLOR_WORD[COLORS[c].m] = { col: c, g: 'm' }; COLOR_WORD[COLORS[c].f] = { col: c, g: 'f' }; });
function colStatements(s) {
  const out = [];
  const re = / (il|la|lo|l) ([a-z]+) (non )?e ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const obj = WORD2KEY[m[2]], cw = COLOR_WORD[m[4]];
    const okArt = obj && m[1] === defArtN(obj);
    const okAgr = obj && cw && cw.g === (isFem(obj) ? 'f' : 'm');
    out.push({ obj: obj, col: cw ? cw.col : null, neg: !!m[3], good: !!(okArt && okAgr) });
  }
  return out;
}
function colEvaluate(step, text) {
  const s = norm(text);
  const st = colStatements(s);
  const c = combo(step.show);
  const yes = has(s, 'si'), no = has(s, 'no');
  const pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const truth = (x) => x.good && x.obj === c.obj && x.col === c.col;
  const allPosTrue = pos.every(truth);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: has(s, 'di che colore e') && !st.length, full: true };
      return { ok: pos.some(truth) && allPosTrue && !neg.length, full: true };
    case 'yes':
      return { ok: yes && !no && !neg.length && pos.some(truth) && allPosTrue, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && x.obj === c.obj && x.col === step.ask);
      const denyTrue = neg.some(x => x.obj === c.obj && x.col === c.col);
      return { ok: !yes && said && !denyTrue && allPosTrue && neg.every(x => x.good), full: pos.some(truth) };
    }
    case 'alt':
    case 'key':
      // «Il telefono è nero o bianco» è la domanda ripetuta, non la risposta
      return { ok: pos.some(truth) && allPosTrue && !neg.length && !has(s, 'o') && !has(s, 'oppure') && !has(s, 'di che colore e'), full: true };
  }
  return { ok: false, full: false };
}

/* ---------- Le domande dell'allievo sui colori ----------
   «Di che colore è il telefono?» «Il telefono è nero?» «Il telefono è nero o bianco?»
   (e anche «Che cos'è?»). L'oggetto della domanda deve essere quello toccato. */
function colEvalAsk(X, text) {
  const s = norm(text), c = combo(X);
  const bad = (model) => ({ ok: false, model: model || colQ(c.obj) });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'che cosa e') && !/ e (?:il|la) /.test(s)) return { ok: true, kind: 'thing' };
  const q = / di che colore e (il|la|lo|l) ([a-z]+)(?= )/.exec(s);
  if (q) {
    if (WORD2KEY[q[2]] !== c.obj || q[1] !== defArtN(c.obj)) return bad();
    return { ok: true, kind: 'what' };
  }
  if (has(s, 'di che colore e')) return { ok: true, kind: 'what' };
  const alt = / (il|la|lo|l) ([a-z]+) e ([a-z]+) (?:o|oppure) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const a = COLOR_WORD[alt[3]], b = COLOR_WORD[alt[4]];
    if (WORD2KEY[alt[2]] === c.obj && alt[1] === defArtN(c.obj) && a && b && a.col !== b.col && a.g === b.g && a.g === (isFem(c.obj) ? 'f' : 'm'))
      return { ok: true, kind: 'alt', ask: a.col, ask2: b.col };
    return bad();
  }
  const st = colStatements(s);
  if (st.length === 1 && st[0].good && st[0].obj === c.obj) return { ok: true, kind: st[0].col === c.col ? 'yes' : 'no', ask: st[0].col };
  // articolo o accordo sbagliati: si corregge quella domanda
  if (st.length === 1 && st[0].obj === c.obj && st[0].col) return bad(cap(theObj(c.obj)) + ' è ' + colW(st[0].col, c.obj) + '?');
  return bad();
}
function colAnswerAsk(X, r) {
  const c = combo(X), say = colSay(X);
  if (r.kind === 'thing') return 'È ' + np(c.obj) + '.';
  if (r.kind === 'what') return say;
  if (r.kind === 'yes') return 'Sì, ' + theObj(c.obj) + ' è ' + colW(c.col, c.obj) + '.';
  if (r.kind === 'alt') return (r.ask === c.col || r.ask2 === c.col) ? say
    : cap(theObj(c.obj)) + ' non è né ' + colW(r.ask, c.obj) + ' né ' + colW(r.ask2, c.obj) + '. ' + say;
  return 'No, ' + theObj(c.obj) + ' non è ' + colW(r.ask, c.obj) + '. ' + say;
}

// Ripetizioni dopo un errore: sempre sullo stesso oggetto colorato, variando la frase
function colDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const X = st.show, others = Object.keys(COLORS).filter(k => k !== combo(X).col);
  const kinds = ['present', 'yes', 'neg'];
  const k0 = st.model === colSay(X) ? 1 : 0;
  for (let k = k0; out.length < n; k++) {
    const kind = kinds[k % 3];
    const s = kind === 'present' ? SC.present(X) : kind === 'yes' ? SC.yes(X) : SC.neg(X, pick(others));
    if (kind === 'present') s.prompt = s.model;
    s.drill = true;
    s.phase = st.phase;
    out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione dei colori ----------
   1. presentazione degli oggetti neri e bianchi, 3 giri       «Il telefono è nero.»
   2. domande col sì                                         «Il telefono è nero?»
   3. domande col no                                         «Il telefono è bianco?»
   4. sì e no mescolati
   5. oggetti rossi: solo no, senza mai dire «rosso»
   6. pausa e sfogo: «Di che colore è il cappotto? Il cappotto è rosso.»
   7. l'allievo ripete «Di che colore è?», poi «Il cappotto è rosso.»
   8. domanda chiave su tutto: «Di che colore è la tazza?»
   9. prime domande dell'allievo, poi tutto mescolato, sempre più veloce, e domande finali */
function buildColorSteps(lesson) {
  const K = lesson.known.slice(), R = (lesson.reds || []).slice(), all = K.concat(R);
  const known = Object.keys(COLORS).filter(c => c !== 'rosso');
  const other = (X, pool) => pick(pool.filter(c => c !== combo(X).col));
  const st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };

  presentRounds(K).forEach(round => round.forEach(x => add(SC.present(x), 'present')));   // ogni oggetto 2 o 3 volte
  shuffle(K).forEach(x => add(SC.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SC.neg(x, other(x, known)), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const X = pick(K.filter(x => x !== prev));
    add(Math.random() < 0.5 ? SC.yes(X) : SC.neg(X, other(X, known)), 'yesno');
    prev = X;
  }
  if (R.length) {
    R.forEach(x => known.forEach(c => { add(SC.neg(x, c), 'fresh').fresh = true; }));
    add(SC.reveal(R[0]), 'reveal').pause = 1500;
    add(SC.reveal(K[0]), 'reveal');
    for (let i = 0; i < 2; i++) add(SC.askQ(R[0]), 'askq');
    R.forEach(x => add(SC.present(x), 'present'));
  }
  for (let r = 0; r < 2; r++) shuffle(all).forEach(x => add(SC.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', col: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  const colors = Object.keys(COLORS);
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) {
    for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
      const X = pick(all.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
      const s = add(t === 'yes' ? SC.yes(X) : t === 'neg' ? SC.neg(X, other(X, colors)) : t === 'alt' ? SC.alt(X, other(X, colors)) : SC.key(X), 'mix');
      s.speed = 1 + 0.06 * (b + 1);
      prev = X;
    }
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', col: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

// Il motore usa queste funzioni: per gli oggetti colorati si passa alle regole dei colori
const baseBuildSteps = buildSteps, baseEvaluate = evaluate, baseEvalAsk = evalAsk, baseAnswerAsk = answerAsk;
const baseBuildDrill = buildDrill, baseLessonWords = lessonWords, baseReveal = S.reveal, basePresent = S.present;
buildSteps = (lesson) => lesson.colors ? buildColorSteps(lesson) : baseBuildSteps(lesson);
lessonWords = (l) => l.colors ? l.known.concat(l.reds || []) : baseLessonWords(l);
evaluate = (step, text) => step && step.col ? colEvaluate(step, text) : baseEvaluate(step, text);
evalAsk = (X, text) => combo(X) ? colEvalAsk(X, text) : baseEvalAsk(X, text);
answerAsk = (X, r) => combo(X) ? colAnswerAsk(X, r) : baseAnswerAsk(X, r);
buildDrill = (st, n, items) => st.col ? colDrill(st, n) : baseBuildDrill(st, n, items);
S.reveal = (X) => combo(X) ? SC.reveal(X) : baseReveal(X);
S.present = (X, dq) => combo(X) ? SC.present(X) : basePresent(X, dq);
