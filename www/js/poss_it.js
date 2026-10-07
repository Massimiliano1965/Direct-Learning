'use strict';
/* =====================================================================
   CAPITOLO 2, esercizio 6: «Il mio, la Sua, ecc.» (lezione 10)
   Si carica dopo logic.js. Gli stessi oggetti in doppio: dell'insegnante e dello studente
   (figure «o_t_phone» / «o_s_phone», con il bollino di chi è).
   Il punto di vista si inverte: l'insegnante parla dal suo, lo studente risponde dal proprio.
     (insegnante) È il mio telefono.         (studente) …
     È il mio telefono?                → Sì, è il Suo telefono.
     È il Suo telefono? (è dell'insegnante) → No, non è il mio telefono.
     È il mio telefono o il Suo telefono? → È il Suo telefono.
     Di chi è questo telefono?         → È il mio telefono.
   Si usa il «Lei» (Suo/Sua), come nel libro: «tuo/tua» è un errore.
   Errori: «la mio valigia», «il Sua telefono», possessivo sbagliato.
   ===================================================================== */

const POSS_OBJ = ['phone', 'laptop', 'suitcase', 'bag'];
const isPoss = (X) => typeof X === 'string' && /^o_[ts]_/.test(X);
const pOwner = (X) => X.charAt(2);                // 't' = dell'insegnante, 's' = dello studente
const pObj = (X) => X.slice(4);
const pFem = (k) => ITEMS[k].art === 'una';
// possessivo detto da chi parla: «il mio telefono», «la Sua valigia»
const pPoss = (k, mine) => (pFem(k) ? 'la ' : 'il ') + (mine ? (pFem(k) ? 'mia' : 'mio') : (pFem(k) ? 'Sua' : 'Suo')) + ' ' + ITEMS[k].word;
// frase dell'insegnante (suo punto di vista) e dello studente (punto di vista rovesciato)
const tSays = (X) => pPoss(pObj(X), pOwner(X) === 't');
const sSays = (X) => pPoss(pObj(X), pOwner(X) === 's');
const pOther = (X) => 'o_' + (pOwner(X) === 't' ? 's' : 't') + '_' + pObj(X);
const pDem = (k) => pFem(k) ? 'questa' : 'questo';

/* ---------- Figure: l'oggetto con il bollino di chi è ----------
   Insegnante = la sua faccia (cambia con l'insegnante scelto); studente = sagoma d'oro («tu»). */
const YOU_BADGE = '<circle cx="80" cy="80" r="16" fill="#1d2638" stroke="#c9a45c" stroke-width="2.4"/><circle cx="80" cy="75" r="5.4" fill="#c9a45c"/><path d="M70 91 q10 -12 20 0" fill="#c9a45c"/>';
function possFig(X) {
  const base = (FIG[pObj(X)] || '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  let badge = YOU_BADGE;
  if (pOwner(X) === 't') {
    // la testa dell'insegnante disegnata dentro il bollino (niente svg annidati né id: lo stile li deformerebbe)
    const look = (typeof L !== 'undefined' && L && L.teacher) ? (L.teacher.look || L.teacher.key) : 'luca';
    const head = (typeof tHeadStill === 'function' && typeof LOOKS !== 'undefined') ? tHeadStill(LOOKS[look] || LOOKS.luca, { mouth: 'smile' }) : '';
    badge = '<circle cx="80" cy="80" r="16" fill="#1d2638"/><g transform="translate(80 79) scale(.62) translate(-50 -26)">' + head + '</g><circle cx="80" cy="80" r="15" fill="none" stroke="#c9a45c" stroke-width="2.6"/>';
  }
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + base + badge + '</svg>';
}
POSS_OBJ.forEach(k => ['t', 's'].forEach(o => {
  Object.defineProperty(FIG, 'o_' + o + '_' + k, { get: () => possFig('o_' + o + '_' + k), enumerable: true });
}));

/* ---------- Frasi ---------- */
const QW = 'Di chi è?';
const SP = {
  // presentazione: l'insegnante dice di chi è (lo studente ascolta e guarda il gesto)
  intro: (X) => ({ type: 'reveal', poss: true, show: X, prompt: gcapP(pDem(pObj(X))) + ' è ' + tSays(X) + '.', model: '' }),
  yes: (X) => ({ type: 'yes', poss: true, show: X, prompt: 'È ' + tSays(X) + '?', model: 'Sì, è ' + sSays(X) + '.' }),
  neg: (X) => ({ type: 'neg', poss: true, show: X, ask: pOther(X), prompt: 'È ' + tSays(pOther(X)) + '?', model: 'No, non è ' + sSays(pOther(X)) + '.', complete: 'È ' + sSays(X) + '.' }),
  alt: (X) => {
    const o = Math.random() < 0.5 ? [X, pOther(X)] : [pOther(X), X];
    return { type: 'alt', poss: true, show: X, prompt: 'È ' + tSays(o[0]) + ' o ' + tSays(o[1]) + '?', model: 'È ' + sSays(X) + '.' };
  },
  key: (X) => ({ type: 'key', poss: true, show: X, prompt: 'Di chi è ' + pDem(pObj(X)) + ' ' + ITEMS[pObj(X)].word + '?', model: 'È ' + sSays(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', poss: true, show: X, prompt: 'Di chi è ' + pDem(pObj(X)) + ' ' + ITEMS[pObj(X)].word + '? È ' + tSays(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', poss: true, show: X, prompt: QW, model: QW })
};
function gcapP(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------- Capire le frasi (punto di vista dello studente) ----------
   «è il mio telefono» = dello studente; «è il Suo telefono» = dell'insegnante. */
function possStatements(s) {
  const out = [], re = / (non )?e (il|la|lo|l) (mio|mia|suo|sua|tuo|tua) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[4]], fem = k && pFem(k);
    const mine = m[3].slice(0, 2) === 'mi', formal = m[3].slice(0, 2) === 'su';
    const good = !!k && (m[2] === (fem ? 'la' : 'il')) && (m[3].slice(-1) === (fem ? 'a' : 'o')) && (mine || formal);
    out.push({ key: k ? 'o_' + (mine ? 's' : 't') + '_' + k : null, neg: !!m[1], good: good });
  }
  return out;
}
function possEvaluate(step, text) {
  const s = norm(text), X = step.show, yes = has(s, 'si'), no = has(s, 'no');
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'di chi e') && !possStatements(s).length, full: true };
  const st = possStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const truth = (x) => x.good && x.key === X, allPos = pos.every(truth);
  switch (step.type) {
    case 'yes': return { ok: yes && !no && pos.some(truth) && allPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.key === step.ask) && !neg.some(x => x.key === X) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'di chi e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ----------
   «Di chi è questo telefono?» → l'insegnante: «È il mio telefono.» / «È il Suo telefono.»
   «È il Suo telefono?» (dell'insegnante?) → «Sì, è il mio telefono.» */
function possEvalAsk(X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || 'Di chi è ' + pDem(pObj(X)) + ' ' + ITEMS[pObj(X)].word + '?' });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'di chi e')) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa e') || has(s, 'che cos e')) return { ok: true, kind: 'thing' };
  const st = possStatements(s).filter(x => x.key && pObj(x.key) === pObj(X));
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].key === X ? 'yes' : 'no', ask: st[0].key };
  if (st.length === 1) return bad('È ' + sSays(st[0].key) + '?');   // articolo o forma sbagliati: si corregge
  return bad();
}
function possAnswerAsk(X, r) {
  if (r.kind === 'thing') return 'È ' + np(pObj(X)) + '.';
  if (r.kind === 'what') return 'È ' + tSays(X) + '.';
  if (r.kind === 'yes') return 'Sì, è ' + tSays(X) + '.';
  return 'No, non è ' + tSays(r.ask) + '. È ' + tSays(X) + '.';
}

function possDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const X = st.show;
  for (let k = 1; out.length < n; k++) {
    const s = k % 2 ? SP.yes(X) : SP.neg(X);
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione ---------- */
function buildPossSteps(lesson) {
  const K = lesson.known.slice(), F = lesson.fresh, all = K.concat(F ? [F] : []);
  const st = [], add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  // 1. l'insegnante presenta: il suo e il Suo, con il gesto (si ascolta)
  K.forEach(x => add(SP.intro(x), 'intro'));
  // 2. domande col sì (le prime con l'esempio dell'insegnante), 3. col no, 4. «o»
  shuffle(K).forEach(x => add(SP.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SP.neg(x), 'neg'));
  shuffle(K).slice(0, 6).forEach(x => add(SP.alt(x), 'yesno'));
  // 5. «Di chi è…?»: l'insegnante si risponde da solo, poi lo studente ripete la domanda
  add(SP.reveal(K[0]), 'reveal').pause = 1200;
  add(SP.reveal(K[1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SP.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(all).forEach(x => add(SP.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', poss: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  let prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(all.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SP[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', poss: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}
// Gesto dell'insegnante: le sue cose → mano sul petto; quelle dello studente → lo indica
function possPose(st) { return st && isPoss(st.show) ? (pOwner(st.show) === 't' ? 'me' : 'you') : null; }

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.poss ? buildPossSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.poss ? l.known.concat(l.fresh ? [l.fresh] : []) : bWords(l);
  evaluate = (step, text) => step && step.poss ? possEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isPoss(X) ? possEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isPoss(X) ? possAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.poss ? possDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isPoss(X) ? SP.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isPoss(X) ? { type: 'echo', check: 'claim', poss: true, show: X, prompt: 'È ' + sSays(X) + '.', model: 'È ' + sSays(X) + '.' } : bPresent.apply(null, arguments); };
})();
