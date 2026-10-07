'use strict';
/* =====================================================================
   CAPITOLO 2: «Il suo, la sua» (lezione 12)
   Si carica dopo logic.js. Gli oggetti di due altre persone: un uomo e una donna
   (due colleghi dell'insegnante, con la loro faccia nel bollino: figure «p3_m_laptop», «p3_f_phone»).
   «Suo/sua» va con l'oggetto, non con la persona: il suo telefono (di Isa), la sua borsa (di Max).
     È il telefono di Isa.                 → ripete
     È il telefono di Isa?                 → Sì, è il suo telefono.
     È il telefono di Max?                    → No, non è il suo telefono.
     È il telefono di Isa o di Max?        → È il telefono di Isa.
     Di chi è questo telefono?                → È il telefono di Isa.
   Errori: «il sua telefono», «la suo borsa», la persona sbagliata.
   ===================================================================== */

const THIRD_OBJ = { m: ['laptop', 'bag', 'coat', 'backpack', 'agenda', 'key'], f: ['phone', 'suitcase', 'flask', 'mirror', 'umbrella', 'book'] };   // lezioni 12 e 17
const isThird = (X) => typeof X === 'string' && /^p3_[mf]_/.test(X);
const p3Who = (X) => X.charAt(3);                 // 'm' = il collega, 'f' = la collega
const p3Obj = (X) => X.slice(5);
const p3Fem = (k) => ITEMS[k].art === 'una' || ITEMS[k].art === 'un\'';   // un'agenda, un'arancia: femminili (Massi: «la sua agenda»)
// articolo determinativo: il telefono, la borsa, lo zaino, l'agenda, l'ombrello (lezione 17)
const p3Art = (k) => /^[aeiou]/.test(ITEMS[k].word) ? 'l\'' : ITEMS[k].art === 'uno' ? 'lo' : p3Fem(k) ? 'la' : 'il';
const p3The = (k) => (p3Art(k) === 'l\'' ? 'l\'' : p3Art(k) + ' ') + ITEMS[k].word;                // «l'agenda», «lo zaino»
const p3ArtN = (k) => p3Art(k) === 'l\'' ? 'l' : p3Art(k);                                          // come lo scrive norm()
const p3Dem = (k) => p3Fem(k) ? 'questa' : 'questo';
// I due colleghi: un uomo e una donna tra gli altri insegnanti (non quello che fa lezione)
// Massi: i personaggi delle frasi NON sono gli insegnanti (l'insegnante dice «io», all'allievo «Lei»; degli altri «lui / lei»):
// il signor Mario e la signora Laura, con la loro faccia (LOOKS.mario, LOOKS.laura in teacher.js)
const P3_CHARS = { mario: { name: 'Mario', gender: 'm' }, laura: { name: 'Laura', gender: 'f' } };
function p3People() { return { m: 'mario', f: 'laura' }; }
const p3Key = (w) => p3People()[w];
const p3Name = (w) => P3_CHARS[p3Key(w)].name;
const p3Of = (k, w) => p3The(k) + ' di ' + p3Name(w);          // «il telefono di Isa»
const p3Suo = (k) => (p3Fem(k) ? 'la sua ' : 'il suo ') + ITEMS[k].word;   // «il suo zaino»: davanti a «suo» sempre il/la   // «il suo telefono»
const p3OtherW = (w) => w === 'm' ? 'f' : 'm';

/* ---------- Figure: l'oggetto con la faccia di chi lo possiede ---------- */
function thirdFig(X) {
  const base = (FIG[p3Obj(X)] || '').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const k = p3Key(p3Who(X)), look = TEACHERS[k] ? (TEACHERS[k].look || k) : k;
  const head = (typeof tHeadStill === 'function' && typeof LOOKS !== 'undefined') ? tHeadStill(LOOKS[look] || LOOKS.luca, { mouth: 'smile' }) : '';
  const badge = '<circle cx="80" cy="80" r="16" fill="#1d2638"/><g transform="translate(80 79) scale(.62) translate(-50 -26)">' + head + '</g><circle cx="80" cy="80" r="15" fill="none" stroke="#c9a45c" stroke-width="2.6"/>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + base + badge + '</svg>';
}
['m', 'f'].forEach(w => THIRD_OBJ[w].forEach(k => {
  Object.defineProperty(FIG, 'p3_' + w + '_' + k, { get: () => thirdFig('p3_' + w + '_' + k), enumerable: true });
}));

/* ---------- Frasi (third = true: valutate con queste regole) ---------- */
const SW = {
  present: (X) => { const p = 'È ' + p3Of(p3Obj(X), p3Who(X)) + '.'; return { type: 'echo', check: 'claim', third: true, show: X, prompt: p, model: p }; },
  // def = lezione 17 (il, la, l', lo): la risposta ripete «lo zaino di Max» invece di «il suo zaino»
  yes: (X, def) => { const k = p3Obj(X); return { type: 'yes', third: true, def: !!def, show: X, prompt: 'È ' + p3Of(k, p3Who(X)) + '?', model: 'Sì, è ' + (def ? p3Of(k, p3Who(X)) : p3Suo(k)) + '.' }; },
  neg: (X, def) => {
    const k = p3Obj(X), o = p3OtherW(p3Who(X));
    return { type: 'neg', third: true, def: !!def, show: X, ask: o, prompt: 'È ' + p3Of(k, o) + '?', model: 'No, non è ' + (def ? p3Of(k, o) : p3Suo(k)) + '.', complete: 'È ' + p3Of(k, p3Who(X)) + '.' };
  },
  alt: (X) => {
    const k = p3Obj(X), o = Math.random() < 0.5 ? ['m', 'f'] : ['f', 'm'];
    return { type: 'alt', third: true, show: X, prompt: 'È ' + p3Of(k, o[0]) + ' o di ' + p3Name(o[1]) + '?', model: 'È ' + p3Of(k, p3Who(X)) + '.' };
  },
  key: (X) => { const k = p3Obj(X); return { type: 'key', third: true, show: X, prompt: 'Di chi è ' + p3Dem(k) + ' ' + ITEMS[k].word + '?', model: 'È ' + p3Of(k, p3Who(X)) + '.' }; },
  reveal: (X) => { const k = p3Obj(X); return { type: 'reveal', third: true, show: X, prompt: 'Di chi è ' + p3Dem(k) + ' ' + ITEMS[k].word + '? È ' + p3Of(k, p3Who(X)) + '.', model: '' }; }
};

/* ---------- Capire le frasi ----------
   «è il telefono di giulia» (di chi) / «è il suo telefono» (suo = della persona della domanda).
   Ogni frase: oggetto, articolo, suo/sua giusto, persona. */
function thirdStatements(s) {
  const P = p3People(), byName = {};
  ['m', 'f'].forEach(w => { byName[norm(P3_CHARS[P[w]].name).trim()] = w; });
  const out = [];
  // «è il telefono di giulia»
  let m, re = / (non )?e (il|la|lo|l) ([a-z]+) di ([a-z]+)(?= )/g;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[3]];
    out.push({ obj: k, who: byName[m[4]] || '?', neg: !!m[1], suo: false, good: !!k && m[2] === p3ArtN(k) });
  }
  // «è il suo telefono» (anche «suoi», «tuo»: sbagliati)
  re = / (non )?e (il|la|lo|l) (suo|sua|tuo|tua|mio|mia) ([a-z]+)(?= )/g;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[4]];
    const good = !!k && m[2] === (p3Fem(k) ? 'la' : 'il') && m[3] === (p3Fem(k) ? 'sua' : 'suo');
    out.push({ obj: k, who: null, neg: !!m[1], suo: true, good: good });
  }
  return out;
}
// step.ask = la persona della domanda («È il telefono di Max?» → ask 'm'); senza domanda su una persona, «suo» non dice di chi
function thirdEvaluate(step, text) {
  const s = norm(text), X = step.show, k = p3Obj(X), W = p3Who(X);
  const st = thirdStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const whoOf = (x) => x.suo ? (step.type === 'yes' ? W : step.type === 'neg' ? step.ask : null) : x.who;
  const truth = (x) => x.good && x.obj === k && whoOf(x) === W;
  const allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && !x.suo) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && x.obj === k && whoOf(x) === step.ask);
      const denyTrue = neg.some(x => x.obj === k && whoOf(x) === W);
      return { ok: !yes && said && !denyTrue && allPos && neg.every(x => x.good), full: pos.some(truth) };
    }
    default:   // alt, key: serve il nome («È il telefono di Isa.»), non la domanda ripetuta
      return { ok: pos.some(x => truth(x) && !x.suo) && allPos && !neg.length && !has(s, 'o di') && !has(s, 'di chi e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ----------
   «Di chi è questo telefono?» «È il telefono di Isa?» «È il telefono di Isa o di Max?» (e «Che cos'è?»). */
function thirdEvalAsk(X, text) {
  const s = norm(text), k = p3Obj(X);
  const bad = (model) => ({ ok: false, model: model || 'Di chi è ' + p3Dem(k) + ' ' + ITEMS[k].word + '?' });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'di chi e')) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = thirdStatements(s).filter(x => x.obj === k && !x.suo);
  if (st.length === 1 && st[0].good && st[0].who !== '?') return { ok: true, kind: st[0].who === p3Who(X) ? 'yes' : 'no', ask: st[0].who };
  if (st.length === 1 && st[0].who !== '?') return bad('È ' + p3Of(k, st[0].who) + '?');   // articolo sbagliato: si corregge
  return bad();
}
function thirdAnswerAsk(X, r) {
  const k = p3Obj(X), say = 'È ' + p3Of(k, p3Who(X)) + '.';
  if (r.kind === 'thing') return 'È ' + np(k) + '.';
  if (r.kind === 'what') return say;
  const def = typeof L !== 'undefined' && L && L.lesson && L.lesson.def;
  if (r.kind === 'yes') return 'Sì, è ' + (def ? p3Of(k, p3Who(X)) : p3Suo(k)) + '.';
  return 'No, non è ' + (def ? p3Of(k, r.ask) : p3Suo(k)) + '. ' + say;
}

function thirdDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  const X = st.show, kinds = ['present', 'yes', 'neg'];
  for (let i = st.type === 'echo' ? 1 : 0; out.length < n; i++) {
    const s = SW[kinds[i % 3]](X, st.def);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione ----------
   presentazione (2-3 giri), sì («il suo»), no, sì e no mescolati, «o di…?»,
   «Di chi è…?» (già nota dalla lezione 10) con la risposta dell'insegnante, poi domanda chiave,
   domande dell'allievo, tutto mescolato, domande finali */
function buildThirdSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SW.present(x), 'present')));
  const D = !!lesson.def;
  shuffle(K).forEach(x => add(SW.yes(x, D), 'yes'));
  shuffle(K).forEach(x => add(SW.neg(x, D), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const X = pick(K.filter(x => x !== prev));
    add(Math.random() < 0.5 ? SW.yes(X, D) : SW.neg(X, D), 'yesno');
    prev = X;
  }
  shuffle(K).slice(0, 4).forEach(x => add(SW.alt(x), 'alt'));
  add(SW.reveal(K[0]), 'reveal').pause = 1200;
  add(SW.reveal(K[K.length - 1]), 'reveal');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SW.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', third: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SW[t](X, D), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', third: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.third ? buildThirdSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.third ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.third ? thirdEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isThird(X) ? thirdEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isThird(X) ? thirdAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.third ? thirdDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isThird(X) ? SW.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isThird(X) ? SW.present(X) : bPresent.apply(null, arguments); };
})();
