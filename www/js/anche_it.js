'use strict';
/* =====================================================================
   CAPITOLO 3: «Anche — neanche» (lezione 19). «Neanche» è la forma più usata; «nemmeno» e «neppure» vanno bene.
   Si carica dopo colors_it.js (oggetti colorati) e altro_it.js (il primo oggetto piccolo sotto il palco).
   Due oggetti: il primo piccolo sotto il palco, il secondo sul palco.
     Il telefono è nero. Anche la valigia è nera.            → ripete «Anche la valigia è nera.»
     Il telefono non è rosso. Neanche la valigia è rossa.    → ripete «Neanche la valigia è rossa.»
     Il telefono è nero. Anche la valigia è nera?            → Sì, anche la valigia è nera.
     Il telefono è nero. Anche la tazza è nera?              → No, la tazza non è nera.
     Il telefono è nero. E la valigia?                       → Anche la valigia è nera.
     Il telefono non è rosso. E la valigia?                  → Neanche la valigia è rossa.
   Errori: «anche la valigia non è rossa» (ci vuole «neanche»), «neanche la valigia non è rossa»,
   «anche» con un colore diverso, articolo e accordo (come nella lezione 5).
   ===================================================================== */

const ANCHE_SAME = [['phone_nero', 'suitcase_nero'], ['laptop_bianco', 'cup_bianco'], ['coat_rosso', 'flask_rosso']];
const ANCHE_ALL = ANCHE_SAME.reduce((a, p) => a.concat(p), []);
const hC = (X) => combo(X).col, hO = (X) => combo(X).obj;
const hThe = (X) => theObj(hO(X));                       // «il telefono»
const hCol = (c, X) => colW(c, hO(X));                   // «nera»
// frase sul primo oggetto: «Il telefono è nero.» / «Il telefono non è rosso.»
const hFirst = (A, c, pos) => cap(hThe(A)) + (pos ? ' è ' : ' non è ') + colW(c, hO(A)) + '.';
const hAnche = (B) => 'Anche ' + hThe(B) + ' è ' + hCol(hC(B), B) + '.';
const hNeanche = (B, c, w) => (w || 'Neanche') + ' ' + hThe(B) + ' è ' + hCol(c, B) + '.';
// un colore che non hanno né A né B
const hNone = (A, B) => pick(Object.keys(COLORS).filter(c => c !== hC(A) && c !== hC(B)));

/* ---------- Frasi (anche = true; prev = il primo oggetto, piccolo sotto il palco) ---------- */
const SH = {
  presentAnche: (A, B) => ({ type: 'echo', check: 'claim', anche: true, form: 'anche', show: B, prev: A, col: hC(B),
    prompt: hFirst(A, hC(A), true) + ' ' + hAnche(B), model: hAnche(B) }),
  presentNeanche: (A, B, c) => ({ type: 'echo', check: 'claim', anche: true, form: 'neanche', show: B, prev: A, col: c,
    prompt: hFirst(A, c, false) + ' ' + hNeanche(B, c), model: hNeanche(B, c) }),
  // «Anche la valigia è nera?»: stesso colore → sì
  yes: (A, B) => ({ type: 'yes', anche: true, form: 'anche', show: B, prev: A, col: hC(B),
    prompt: hFirst(A, hC(A), true) + ' Anche ' + hThe(B) + ' è ' + hCol(hC(A), B) + '?', model: 'Sì, ' + hAnche(B).charAt(0).toLowerCase() + hAnche(B).slice(1) }),
  // colore diverso → no
  neg: (A, B) => ({ type: 'neg', anche: true, form: 'plain', show: B, prev: A, ask: hC(A), col: hC(A),
    prompt: hFirst(A, hC(A), true) + ' Anche ' + hThe(B) + ' è ' + hCol(hC(A), B) + '?',
    model: 'No, ' + hThe(B) + ' non è ' + hCol(hC(A), B) + '.', complete: cap(hThe(B)) + ' è ' + hCol(hC(B), B) + '.' }),
  // «E la valigia?»
  keyAnche: (A, B) => ({ type: 'key', anche: true, form: 'anche', show: B, prev: A, col: hC(B), prompt: hFirst(A, hC(A), true) + ' E ' + hThe(B) + '?', model: hAnche(B) }),
  keyNeanche: (A, B, c) => ({ type: 'key', anche: true, form: 'neanche', show: B, prev: A, col: c, prompt: hFirst(A, c, false) + ' E ' + hThe(B) + '?', model: hNeanche(B, c) }),
  keyDiff: (A, B) => ({ type: 'key', anche: true, form: 'diff', show: B, prev: A, col: hC(A), prompt: hFirst(A, hC(A), true) + ' E ' + hThe(B) + '?',
    model: cap(hThe(B)) + ' è ' + hCol(hC(B), B) + '.' })
};

/* ---------- Capire le frasi ----------
   «(anche|neanche|nemmeno|neppure) la valigia (non) è nera» con articolo e accordo controllati. */
const NEANCHE = { neanche: 1, nemmeno: 1, neppure: 1, nemmanco: 1 };
function ancheStatements(s) {
  const out = [], re = / (?:(anche|neanche|nemmeno|neppure) )?(il|la|lo|l) ([a-z]+) (non )?e ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const obj = WORD2KEY[m[3]], cw = COLOR_WORD[m[5]];
    const good = !!obj && !!cw && m[2] === defArt(obj) && cw.g === (isFem(obj) ? 'f' : 'm');
    out.push({ pre: m[1] ? (NEANCHE[m[1]] ? 'neanche' : 'anche') : null, obj: obj, col: cw ? cw.col : null, neg: !!m[4], good: good });
  }
  return out;
}
function ancheEvaluate(step, text) {
  const s = norm(text), B = step.show, o = hO(B), cB = hC(B);
  const st = ancheStatements(s).filter(x => x.obj === o || !x.obj);
  const yes = has(s, 'si'), no = has(s, 'no');
  const okForm = (x) => {
    if (!x.good || x.obj !== o) return false;
    if (step.form === 'anche') return !x.neg && x.col === cB && (x.pre === 'anche' || (step.type === 'yes' && x.pre === null));
    if (step.form === 'neanche') return !x.neg && x.pre === 'neanche' && x.col === step.col;
    if (step.form === 'diff') return x.pre === null && ((!x.neg && x.col === cB) || (x.neg && x.col === step.col));
    return x.pre === null && x.neg && x.col === step.col;   // plain: «la tazza non è nera»
  };
  const any = st.length > 0, all = st.every(okForm);
  switch (step.type) {
    case 'yes': return { ok: yes && !no && any && all, full: true };
    case 'neg': return { ok: !yes && any && all, full: st.some(x => !x.neg && x.col === cB) };
    case 'echo': return { ok: any && all, full: true };
    default: return { ok: any && all && !has(s, 'e la') && !has(s, 'e il') && !has(s, 'e l') && !has(s, 'e lo'), full: true };
  }
}

// Ripetizioni: con «neanche» la voce alterna anche «nemmeno» (vanno bene tutte e due)
function ancheDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  while (out.length < n) {
    const d = Object.assign({}, first, { prompt: out.length % 2 ? st.prompt : st.model });
    if (st.form === 'neanche' && out.length % 2 === 0) { d.model = hNeanche(st.show, st.col, 'Nemmeno'); d.prompt = d.model; }
    out.push(d);
  }
  return out;
}

/* ---------- Sequenza della lezione ---------- */
function buildAncheSteps(lesson) {
  const st = [], add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  const same = () => { const p = pick(ANCHE_SAME); return Math.random() < 0.5 ? p : [p[1], p[0]]; };
  const diff = () => { const A = pick(ANCHE_ALL); return [A, pick(ANCHE_ALL.filter(x => hC(x) !== hC(A)))]; };
  // 1. presentazione: anche (ogni coppia nei due versi), poi neanche
  ANCHE_SAME.forEach(p => { add(SH.presentAnche(p[0], p[1]), 'present'); add(SH.presentAnche(p[1], p[0]), 'present'); });
  shuffle(ANCHE_SAME.slice()).forEach(p => add(SH.presentNeanche(p[0], p[1], hNone(p[0], p[1])), 'present'));
  // 2. «Anche…?» sì e no
  shuffle(ANCHE_SAME.slice()).forEach(p => add(SH.yes(p[1], p[0]), 'yes'));
  for (let i = 0; i < 3; i++) { const [A, B] = diff(); add(SH.neg(A, B), 'neg'); }
  for (let i = 0; i < 4; i++) { if (Math.random() < 0.5) { const [A, B] = same(); add(SH.yes(A, B), 'yesno'); } else { const [A, B] = diff(); add(SH.neg(A, B), 'yesno'); } }
  // 3. «E la valigia?»: anche, neanche, o un colore diverso
  for (let r = 0; r < 2; r++) shuffle(ANCHE_SAME.slice()).forEach(p => {
    const [A, B] = Math.random() < 0.5 ? p : [p[1], p[0]];
    add(SH.keyAnche(A, B), 'key');
    add(SH.keyNeanche(A, B, hNone(A, B)), 'key');
  });
  for (let i = 0; i < 2; i++) { const [A, B] = diff(); add(SH.keyDiff(A, B), 'key'); }
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', anche: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const t = pick(['yes', 'neg', 'anche', 'neanche', 'neanche', 'diff']);
    let s;
    if (t === 'yes' || t === 'anche' || t === 'neanche') { const [A, B] = same(); s = t === 'yes' ? SH.yes(A, B) : t === 'anche' ? SH.keyAnche(A, B) : SH.keyNeanche(A, B, hNone(A, B)); }
    else { const [A, B] = diff(); s = t === 'neg' ? SH.neg(A, B) : SH.keyDiff(A, B); }
    add(s, 'mix').speed = 1 + 0.06 * (b + 1);
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', anche: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bDrill = buildDrill;
  buildSteps = (lesson) => lesson.anche ? buildAncheSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.anche ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.anche ? ancheEvaluate(step, text) : bEval(step, text);
  buildDrill = (st, n, items) => st.anche ? ancheDrill(st, n) : bDrill(st, n, items);
  // le domande dell'allievo (su un oggetto solo) sono quelle della lezione 5: «Di che colore è il telefono?»
})();
