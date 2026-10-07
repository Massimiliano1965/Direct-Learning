'use strict';
/* =====================================================================
   CAPITOLO 2: «Questo o questa? Piccolo o piccola?» (lezione 11)
   Si carica dopo logic.js. Gli stessi oggetti in coppia, uno grande e uno piccolo
   (figure «z_big_book» / «z_small_book»: nello stesso riquadro, grande e piccolo si vedono a colpo d'occhio).
     Questo libro è grande.                → ripete
     Questa valigia è piccola?             → Sì, questa valigia è piccola.
     Questo libro è piccolo?               → No, questo libro non è piccolo.
     Questa tazza è grande o piccola?      → Questa tazza è piccola.
     Com'è questa valigia?                 → Questa valigia è grande.
   «Grande» resta uguale; «piccolo» diventa «piccola». Errori: «questa libro», «questo valigia»,
   «la valigia è piccolo» (accordo sbagliato).
   ===================================================================== */

const SIZE_OBJ = ['book', 'suitcase', 'cup'];
const SIZES = { big: { m: 'grande', f: 'grande' }, small: { m: 'piccolo', f: 'piccola' } };
const isSize = (X) => typeof X === 'string' && /^z_(big|small)_/.test(X);
const zSize = (X) => X.split('_')[1];
const zObj = (X) => X.split('_').slice(2).join('_');
const zFem = (k) => ITEMS[k].art === 'una';
const zDem = (k) => zFem(k) ? 'questa' : 'questo';
const zAdj = (size, k) => SIZES[size][zFem(k) ? 'f' : 'm'];
const zThis = (k) => zDem(k) + ' ' + ITEMS[k].word;                        // «questo libro»
const zCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const zSay = (X) => zCap(zThis(zObj(X))) + ' è ' + zAdj(zSize(X), zObj(X)) + '.';   // «Questo libro è grande.»
const zOther = (X) => zSize(X) === 'big' ? 'small' : 'big';
const zQ = (k) => 'Com\'è ' + zThis(k) + '?';
const QZ = 'Com\'è?';

/* ---------- Figure: lo stesso oggetto, grande o piccolo, appoggiato in basso ---------- */
function sizeFig(X) {
  const base = (FIG[zObj(X)] || '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const g = zSize(X) === 'big' ? '<g transform="translate(50 92) scale(1.08) translate(-50 -90)">' : '<g transform="translate(50 92) scale(.5) translate(-50 -90)">';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + g + base + '</g></svg>';
}
SIZE_OBJ.forEach(k => ['big', 'small'].forEach(z => {
  Object.defineProperty(FIG, 'z_' + z + '_' + k, { get: () => sizeFig('z_' + z + '_' + k), enumerable: true });
}));

/* ---------- Frasi dell'insegnante (size = true: valutate con queste regole) ---------- */
const SZ = {
  present: (X) => { const p = zSay(X); return { type: 'echo', check: 'claim', size: true, show: X, prompt: p, model: p }; },
  yes: (X) => { const k = zObj(X), a = zAdj(zSize(X), k); return { type: 'yes', size: true, show: X, prompt: zCap(zThis(k)) + ' è ' + a + '?', model: 'Sì, ' + zThis(k) + ' è ' + a + '.' }; },
  neg: (X) => {
    const k = zObj(X), a = zAdj(zOther(X), k);
    return { type: 'neg', size: true, show: X, ask: zOther(X), prompt: zCap(zThis(k)) + ' è ' + a + '?',
             model: 'No, ' + zThis(k) + ' non è ' + a + '.', complete: zSay(X) };
  },
  alt: (X) => {
    const k = zObj(X), o = Math.random() < 0.5 ? ['big', 'small'] : ['small', 'big'];
    return { type: 'alt', size: true, show: X, options: o, prompt: zCap(zThis(k)) + ' è ' + zAdj(o[0], k) + ' o ' + zAdj(o[1], k) + '?', model: zSay(X) };
  },
  key: (X) => ({ type: 'key', size: true, show: X, prompt: zQ(zObj(X)), model: zSay(X) }),
  reveal: (X) => ({ type: 'reveal', size: true, show: X, prompt: zQ(zObj(X)) + ' ' + zSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', size: true, show: X, prompt: QZ, model: QZ })
};

/* ---------- Capire le frasi ----------
   «questo libro è grande» / «questa valigia non è piccola»: si controllano oggetto,
   questo/questa e piccolo/piccola. Una frase sbagliata vale come affermazione sbagliata. */
const SIZE_WORD = { grande: { size: 'big', g: null }, piccolo: { size: 'small', g: 'm' }, piccola: { size: 'small', g: 'f' } };
function sizeStatements(s) {
  const out = [], re = / (questo|questa|quest) ([a-z]+) (non )?e ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[2]], w = SIZE_WORD[m[4]];
    const okDem = !!k && m[1] === zDem(k);
    const okAgr = !!k && !!w && (w.g === null || w.g === (zFem(k) ? 'f' : 'm'));
    out.push({ obj: k, size: w ? w.size : null, neg: !!m[3], good: okDem && okAgr });
  }
  return out;
}
function sizeEvaluate(step, text) {
  const s = norm(text), X = step.show, k = zObj(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'com e') && !sizeStatements(s).length, full: true };
  const st = sizeStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.obj === k && x.size === zSize(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && x.obj === k && x.size === step.ask);
      const denyTrue = neg.some(x => x.obj === k && x.size === zSize(X));
      return { ok: !yes && said && !denyTrue && allPos && neg.every(x => x.good), full: pos.some(truth) };
    }
    default:   // alt, key: «Questo libro è grande o piccolo» è la domanda ripetuta, non la risposta
      return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'oppure') && !has(s, 'com e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ----------
   «Com'è questo libro?» «Questo libro è grande?» «Questo libro è grande o piccolo?» (e «Che cos'è?»). */
function sizeEvalAsk(X, text) {
  const s = norm(text), k = zObj(X);
  const bad = (model) => ({ ok: false, model: model || zQ(k) });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const q = / com e (questo|questa|quest) ([a-z]+)(?= )/.exec(s);
  if (q) return WORD2KEY[q[2]] === k && q[1] === zDem(k) ? { ok: true, kind: 'what' } : bad();
  if (has(s, 'com e')) return { ok: true, kind: 'what' };
  const alt = / (questo|questa|quest) ([a-z]+) e ([a-z]+) (?:o|oppure) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const a = SIZE_WORD[alt[3]], b = SIZE_WORD[alt[4]], g = zFem(k) ? 'f' : 'm';
    const agr = (w) => w && (w.g === null || w.g === g);
    if (WORD2KEY[alt[2]] === k && alt[1] === zDem(k) && agr(a) && agr(b) && a.size !== b.size) return { ok: true, kind: 'alt' };
    return bad(zCap(zThis(k)) + ' è grande o ' + zAdj('small', k) + '?');
  }
  const st = sizeStatements(s);
  if (st.length === 1 && st[0].good && st[0].obj === k) return { ok: true, kind: st[0].size === zSize(X) ? 'yes' : 'no', ask: st[0].size };
  // questo/questa o piccolo/piccola sbagliati: si corregge quella domanda
  if (st.length === 1 && st[0].obj === k && st[0].size) return bad(zCap(zThis(k)) + ' è ' + zAdj(st[0].size, k) + '?');
  return bad();
}
function sizeAnswerAsk(X, r) {
  const k = zObj(X);
  if (r.kind === 'thing') return 'È ' + np(k) + '.';
  if (r.kind === 'what' || r.kind === 'alt') return zSay(X);
  if (r.kind === 'yes') return 'Sì, ' + zThis(k) + ' è ' + zAdj(zSize(X), k) + '.';
  return 'No, ' + zThis(k) + ' non è ' + zAdj(r.ask, k) + '. ' + zSay(X);
}

// Ripetizioni dopo un errore: sempre sulla stessa figura, variando la frase
function sizeDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const X = st.show, kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === zSay(X) ? 1 : 0; out.length < n; i++) {
    const s = SZ[kinds[i % 3]](X);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione ----------
   presentazione (2-3 giri), sì, no, sì e no mescolati, «Com'è…?» con la risposta dell'insegnante,
   l'allievo ripete «Com'è?», domanda chiave, prime domande dell'allievo, tutto mescolato, domande finali */
function buildSizeSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SZ.present(x), 'present')));
  shuffle(K).forEach(x => add(SZ.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SZ.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const X = pick(K.filter(x => x !== prev));
    add(Math.random() < 0.5 ? SZ.yes(X) : SZ.neg(X), 'yesno');
    prev = X;
  }
  shuffle(K).slice(0, 4).forEach(x => add(SZ.alt(x), 'alt'));
  add(SZ.reveal(K[0]), 'reveal').pause = 1200;
  add(SZ.reveal(K[3] || K[1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SZ.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SZ.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', size: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SZ[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', size: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.size ? buildSizeSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.size ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.size ? sizeEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isSize(X) ? sizeEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isSize(X) ? sizeAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.size ? sizeDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isSize(X) ? SZ.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isSize(X) ? SZ.present(X) : bPresent.apply(null, arguments); };
})();
