'use strict';
/* =====================================================================
   CAPITOLO 5: «La famiglia» (lezione 30). Le figure si disegnano solo quando servono (con tTorso/tHeadStill di teacher.js,
   che si carica dopo). Una famiglia di sei persone: i nonni e i genitori dietro,
   i due figli davanti. La persona di cui si parla ha la freccia d'oro sopra la testa, le altre sono sbiadite.
     È il padre.                      → ripete
     È la madre?                      → Sì, è la madre.
     È il nonno?                      → No, non è il nonno.
     È il figlio o la figlia?         → È il figlio.
     Chi è?                           → È la nonna.
   Parole nuove: padre, madre, figlio, figlia, nonno, nonna; «Chi è?».
   Errori: l'articolo («la padre», «il figlia», «un padre»), la persona sbagliata.
   ===================================================================== */

const FAM = {
  f_nonno: { word: 'nonno',  art: 'il' },
  f_nonna: { word: 'nonna',  art: 'la' },
  f_padre: { word: 'padre',  art: 'il' },
  f_madre: { word: 'madre',  art: 'la' },
  f_figlio: { word: 'figlio', art: 'il' },
  f_figlia: { word: 'figlia', art: 'la' }
};
const FAM_WORD = {};
Object.keys(FAM).forEach(k => { FAM_WORD[FAM[k].word] = k; });
FAM_WORD.nonni = 'f_nonno'; FAM_WORD.figli = 'f_figlio'; FAM_WORD.padri = 'f_padre';
const isFam = (X) => !!FAM[X];
const famThe = (X) => FAM[X].art + ' ' + FAM[X].word;          // «il padre»
const famSay = (X) => 'È ' + famThe(X) + '.';
const QF = 'Chi è?';
const famOther = (X) => pick(Object.keys(FAM).filter(k => k !== X));

/* ---------- Figure: la famiglia, con la freccia d'oro sulla persona di cui si parla ---------- */
const FAM_LOOK = {
  f_nonno:  { man: true, skin: '#f0c6a4', skin2: '#dfae88', hair: '#e6e6ea', hair2: '#b9b9c2', style: 'back', glasses: 'thin', suit: '#5a6672', suit2: '#4a5560', shirt: '#f4f4f6', tie: '#2c3e66' },
  f_nonna:  { man: false, skin: '#f1c7a5', skin2: '#e0b08c', hair: '#e6e6ea', hair2: '#b9b9c2', style: 'bun', suit: '#7a5a8a', suit2: '#644a72', shirt: '#fbe3ef', pearls: true },
  f_padre:  { man: true, skin: '#eab892', skin2: '#d9a27c', hair: '#3a2a20', hair2: '#2a1d16', style: 'short', suit: '#2f4a6a', suit2: '#263d58', shirt: '#e8eefc', tie: '#c9a45c' },
  f_madre:  { man: false, skin: '#eab892', skin2: '#d9a27c', hair: '#5a3a28', hair2: '#45291c', style: 'bob', suit: '#b0607a', suit2: '#964e66', shirt: '#fbe3d8' },
  f_figlio: { man: true, skin: '#f1c7a5', skin2: '#e0b08c', hair: '#5a3a28', hair2: '#45291c', style: 'short', suit: '#3f7fb5', suit2: '#336a99', shirt: '#eef4f8', tie: '#3f7fb5' },
  f_figlia: { man: false, skin: '#f1c7a5', skin2: '#e0b08c', hair: '#e2c06a', hair2: '#c29a45', style: 'long', suit: '#d98aa8', suit2: '#c4718f', shirt: '#fff4f8' }
};
// dove sta ognuno: x del centro, y in alto, grandezza (dietro gli adulti, davanti i figli)
const FAM_POS = { f_nonno: [13, 20, .6], f_nonna: [35, 23, .57], f_padre: [65, 18, .62], f_madre: [87, 22, .58], f_figlio: [41, 52, .45], f_figlia: [60, 54, .43] };
const FAM_ORDER = ['f_nonno', 'f_nonna', 'f_padre', 'f_madre', 'f_figlio', 'f_figlia'];
function famPerson(k, on) {
  const L = FAM_LOOK[k], [x, y, sc] = FAM_POS[k];
  const body = tTorso(L) + tArm(L, ...DOWN_L) + tArm(L, ...DOWN_R) + tHeadStill(L, { mouth: 'smile' });
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ') translate(-50 -4)"' + (on ? '' : ' opacity=".3"') + '>' + body + '</g>';
}
function famFig(X) {
  if (typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const [x, y] = FAM_POS[X];
  const arrow = '<path d="M' + (x - 5) + ' ' + (y - 9) + ' h10 l-5 7z" fill="#c9a45c"/>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="94" rx="44" ry="3" fill="#000" opacity=".25"/>' +
    FAM_ORDER.map(k => famPerson(k, k === X)).join('') + arrow + '</svg>';
}
Object.keys(FAM).forEach(X => { Object.defineProperty(FIG, X, { get: () => famFig(X), enumerable: true }); });

/* ---------- Frasi (fam = true) ---------- */
const SFM = {
  present: (X) => { const p = famSay(X); return { type: 'echo', check: 'claim', fam: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', fam: true, show: X, prompt: 'È ' + famThe(X) + '?', model: 'Sì, è ' + famThe(X) + '.' }),
  neg: (X) => { const o = famOther(X); return { type: 'neg', fam: true, show: X, ask: o, prompt: 'È ' + famThe(o) + '?', model: 'No, non è ' + famThe(o) + '.', complete: famSay(X) }; },
  alt: (X) => { const o = famOther(X), ord = Math.random() < 0.5 ? [X, o] : [o, X];
    return { type: 'alt', fam: true, show: X, prompt: 'È ' + famThe(ord[0]) + ' o ' + famThe(ord[1]) + '?', model: famSay(X) }; },
  key: (X) => ({ type: 'key', fam: true, show: X, prompt: QF, model: famSay(X) }),
  reveal: (X) => ({ type: 'reveal', fam: true, show: X, prompt: QF + ' ' + famSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', fam: true, show: X, prompt: QF, model: QF })
};

/* ---------- Capire le frasi: «(non) è il padre» ---------- */
function famStatements(s) {
  const out = [], re = / (non )?e (il|la|lo|l|un|una|uno) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = FAM_WORD[m[3]];
    out.push({ k: k || '?', neg: !!m[1], good: !!k && m[2] === FAM[k].art });
  }
  return out;
}
function famEvaluate(step, text) {
  const s = norm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'chi e') && !famStatements(s).length, full: true };
  const st = famStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.k === X, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.k === step.ask) && !neg.some(x => x.k === X) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'chi e'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Chi è?», «È il padre?», «È il padre o il nonno?» ---------- */
function famEvalAsk(X, text) {
  const s = norm(text), bad = (model) => ({ ok: false, model: model || QF });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'chi e') || has(s, 'che cosa e')) return { ok: true, kind: 'what' };
  const alt = / e (il|la) ([a-z]+) (?:o|oppure) (il|la) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const A = FAM_WORD[alt[2]], B = FAM_WORD[alt[4]];
    if (A && B && A !== B && alt[1] === FAM[A].art && alt[3] === FAM[B].art) return { ok: true, kind: 'alt', ask: A, ask2: B };
    return A && B && A !== B ? bad('È ' + famThe(A) + ' o ' + famThe(B) + '?') : bad();
  }
  const st = famStatements(s);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].k === X ? 'yes' : 'no', ask: st[0].k };
  if (st.length === 1 && st[0].k !== '?') return bad('È ' + famThe(st[0].k) + '?');   // articolo sbagliato: si corregge
  return bad();
}
function famAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, è ' + famThe(X) + '.';
  if (r.kind === 'no') return 'No, non è ' + famThe(r.ask) + '. ' + famSay(X);
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? famSay(X) : 'Non è né ' + famThe(r.ask) + ' né ' + famThe(r.ask2) + '. ' + famSay(X);
  return famSay(X);
}

function famDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === famSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SFM[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildFamSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SFM.present(x), 'present')));
  shuffle(K).forEach(x => add(SFM.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SFM.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SFM.yes(X) : SFM.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SFM.alt(x), 'alt'));
  add(SFM.reveal(K[0]), 'reveal').pause = 1200;
  add(SFM.reveal(K[K.length - 1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SFM.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SFM.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', fam: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SFM[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', fam: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.fam ? buildFamSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.fam ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.fam ? famEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isFam(X) ? famEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isFam(X) ? famAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.fam ? famDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isFam(X) ? SFM.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isFam(X) ? SFM.present(X) : bPresent.apply(null, arguments); };
})();
