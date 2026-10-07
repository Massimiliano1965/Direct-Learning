'use strict';
/* =====================================================================
   CAPITOLO 2: «Un altro, un'altra» (lezione 15)
   Si carica dopo colors_it.js (oggetti colorati della lezione 5). Tre coppie dello stesso oggetto,
   di colore diverso: telefono nero e bianco, valigia nera e rossa, tazza bianca e rossa.
   Quando sotto il palco c'è il primo oggetto (piccolo), quello sul palco è «un altro»:
     È un telefono.                          (solo il telefono)            → ripete
     È un altro telefono.                    (sotto, il primo telefono)    → ripete
     È un altro telefono?                    → Sì, è un altro telefono.
     È un'altra valigia?                     → No, non è un'altra valigia.
     È un altro telefono o un'altra tazza?   → È un altro telefono.
     Che cos'è?                              → È un altro telefono. / È un telefono. (senza il primo sotto)
   Errori: «un altra telefono», «un altro valigia», dimenticare «altro» quando c'è il primo.
   ===================================================================== */

const ALTRO_PAIRS = [['phone_nero', 'phone_bianco'], ['suitcase_nero', 'suitcase_rosso'], ['cup_bianco', 'cup_rosso']];
const aObj = (X) => X.split('_')[0];
const aFem = (k) => ITEMS[k].art === 'una' || ITEMS[k].art === 'un\'';   // un'agenda, un'arancia: femminili (Massi: «la sua agenda»)
const aAltro = (k) => (aFem(k) ? 'un\'altra ' : 'un altro ') + ITEMS[k].word;     // «un altro telefono», «un'altra valigia»
const aSay = (k, other) => other ? aAltro(k) : np(k);
const aMate = (X) => { const p = ALTRO_PAIRS.find(p => p.indexOf(X) !== -1); return p ? (p[0] === X ? p[1] : p[0]) : null; };
const aOtherObj = (k) => pick(ALTRO_PAIRS.map(p => aObj(p[0])).filter(o => o !== k));

/* ---------- Frasi (altro = true). prev = il primo oggetto, mostrato piccolo sotto il palco ---------- */
const SA = {
  present: (X, prev) => { const p = 'È ' + aSay(aObj(X), !!prev) + '.'; return { type: 'echo', check: 'claim', altro: true, show: X, prev: prev || null, prompt: p, model: p }; },
  yes: (X, prev) => { const k = aObj(X); return { type: 'yes', altro: true, show: X, prev: prev || null, prompt: 'È ' + aSay(k, !!prev) + '?', model: 'Sì, è ' + aSay(k, !!prev) + '.' }; },
  neg: (X, prev) => {
    const k = aObj(X), o = aOtherObj(k);
    return { type: 'neg', altro: true, show: X, prev: prev || null, ask: o, prompt: 'È ' + aSay(o, !!prev) + '?', model: 'No, non è ' + aSay(o, !!prev) + '.', complete: 'È ' + aSay(k, !!prev) + '.' };
  },
  alt: (X, prev) => {
    const k = aObj(X), o = aOtherObj(k), ord = Math.random() < 0.5 ? [k, o] : [o, k];
    return { type: 'alt', altro: true, show: X, prev: prev || null, prompt: 'È ' + aSay(ord[0], !!prev) + ' o ' + aSay(ord[1], !!prev) + '?', model: 'È ' + aSay(k, !!prev) + '.' };
  },
  key: (X, prev) => ({ type: 'key', altro: true, show: X, prev: prev || null, prompt: 'Che cos\'è?', model: 'È ' + aSay(aObj(X), !!prev) + '.' })
};

/* ---------- Capire le frasi ----------
   «è un altro telefono», «è un'altra valigia» (il microfono scrive «un altra»), «è un telefono». */
function altroStatements(s) {
  const out = [], re = / (non )?e (un|una|uno) (?:(altro|altra) )?([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[4]];
    if (!k) { out.push({ obj: '?', neg: !!m[1], altro: !!m[3], good: false }); continue; }
    const fem = aFem(k);
    const good = m[3] ? (m[3] === (fem ? 'altra' : 'altro') && (fem ? (m[2] === 'un' || m[2] === 'una') : m[2] === 'un'))
                      : m[2] === (fem ? 'una' : 'un');
    out.push({ obj: k, neg: !!m[1], altro: !!m[3], good: good });
  }
  return out;
}
function altroEvaluate(step, text) {
  const s = norm(text), k = aObj(step.show), other = !!step.prev;
  const st = altroStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.obj === k && x.altro === other, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && x.obj === step.ask && x.altro === other);
      return { ok: !yes && said && !neg.some(x => x.obj === k) && allPos, full: pos.some(truth) };
    }
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa e'), full: true };
  }
}

function altroDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first], kinds = ['present', 'yes', 'neg'];
  for (let i = st.type === 'echo' ? 1 : 0; out.length < n; i++) {
    const s = SA[kinds[i % 3]](st.show, st.prev);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione ---------- */
function buildAltroSteps(lesson) {
  const st = [], add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  // coppia a caso, e a caso quale dei due è «il primo»
  const pair = () => { const p = pick(ALTRO_PAIRS); return Math.random() < 0.5 ? p : [p[1], p[0]]; };
  // 1. presentazione: il primo, poi l'altro con il primo sotto (2 giri)
  for (let r = 0; r < 2; r++) shuffle(ALTRO_PAIRS.slice()).forEach(p => {
    const [a, b] = r ? [p[1], p[0]] : p;
    add(SA.present(a), 'present');
    add(SA.present(b, a), 'present');
  });
  // 2. sì, 3. no, 4. o (sempre con il primo sotto)
  shuffle(ALTRO_PAIRS.slice()).forEach(p => add(SA.yes(p[1], p[0]), 'yes'));
  shuffle(ALTRO_PAIRS.slice()).forEach(p => add(SA.neg(p[0], p[1]), 'neg'));
  for (let i = 0; i < 4; i++) { const [a, b] = pair(); add(Math.random() < 0.5 ? SA.yes(b, a) : SA.neg(b, a), 'yesno'); }
  for (let i = 0; i < 3; i++) { const [a, b] = pair(); add(SA.alt(b, a), 'alt'); }
  // 5. «Che cos'è?»: a volte il primo da solo («È un telefono.»), poi l'altro («È un altro telefono.»)
  for (let r = 0; r < 2; r++) shuffle(ALTRO_PAIRS.slice()).forEach(p => {
    const [a, b] = Math.random() < 0.5 ? p : [p[1], p[0]];
    add(SA.key(a), 'key');
    add(SA.key(b, a), 'key');
  });
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', altro: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const [a, x] = pair(), t = pick(['yes', 'neg', 'alt', 'key', 'key']);
    const s = add(t === 'key' && Math.random() < 0.3 ? SA.key(x) : SA[t](x, a), 'mix'); s.speed = 1 + 0.06 * (b + 1);
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', altro: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill;
  // le domande dell'allievo, qui, sono quelle della lezione 1 sull'oggetto («È un telefono?», «Che cos'è?»)
  const inLesson = (X) => typeof L !== 'undefined' && L && L.lesson && L.lesson.altro && typeof X === 'string' && X.indexOf('_') !== -1;
  buildSteps = (lesson) => lesson.altro ? buildAltroSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.altro ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.altro ? altroEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => inLesson(X) ? bAsk(aObj(X), text) : bAsk(X, text);
  answerAsk = (X, r) => inLesson(X) ? bAns(aObj(X), r) : bAns(X, r);
  buildDrill = (st, n, items) => st.altro ? altroDrill(st, n) : bDrill(st, n, items);
})();
