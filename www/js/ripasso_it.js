'use strict';
/* =====================================================================
   RIPASSO IN TUTTA LA LEZIONE (deciso con Massi: «prima cosa, la ripetizione»).
   Le domande chiave delle lezioni passate («Che ore sono?», «Cosa fa Max?», «Quanto costa il libro?»…) tornano
   in ogni lezione, con le loro regole, per fissarle nella memoria:
     - durante l'introduzione: una dopo la presentazione, una dopo i sì/no, una prima delle domande chiave;
     - negli esercizi misti alla fine: 2 per ogni blocco di 8 (al 3° e al 7° posto).
   Ogni volta lezioni passate diverse, scelte a caso. Si carica dopo tutte le lezioni.
   Se l'allievo sbaglia, le ripetizioni usano le parole di quella lezione (reviewItems).
   ===================================================================== */

// Le lezioni che hanno bisogno del loro palco (i luoghi, «un altro», «anche», «io / Lei») non vanno nel ripasso
const reviewSkip = (l) => l.test || l.placeHints || l.altro || l.anche || l.ess;

// Le domande chiave di una lezione, che l'app sa mostrare e correggere (calcolate una volta sola, poi in memoria)
const REVIEW_KEYS = {};
function reviewKeys(l, build) {
  // i nomi dei colleghi cambiano con l'insegnante scelto: la memoria vale per quei due nomi
  const id = l.id + '|' + (typeof vName === 'function' ? vName('m') + vName('f') : '');
  if (REVIEW_KEYS[id]) return REVIEW_KEYS[id];
  let keys = [];
  const items = lessonWords(l);
  try {
    keys = build(l).filter(s => s.phase === 'key' && s.show && FIG[s.show] && !s.prev && s.model && evaluate(s, s.model).ok &&
      buildDrill(s, 3, items).every(d => evaluate(d, d.model).ok));
  } catch (e) { keys = []; }
  return (REVIEW_KEYS[id] = { lesson: l.id, keys: keys, items: items });
}
// Le domande chiave delle lezioni prima di questa
function reviewPool(lesson, build) {
  const all = LESSONS.filter(l => !l.test), before = all.slice(0, all.indexOf(lesson));
  return before.filter(l => !reviewSkip(l)).map(l => reviewKeys(l, build)).filter(p => p.keys.length);
}

// n domande di ripasso: una lezione diversa per volta (se le lezioni sono poche, si ricomincia), mai la stessa domanda due volte
function reviewSteps(lesson, build, n) {
  const pool = shuffle(reviewPool(lesson, build)), out = [], used = {};
  const fresh = lesson.fresh && typeof ITEMS !== 'undefined' && ITEMS[lesson.fresh] ? ITEMS[lesson.fresh].word : '';
  for (let i = 0; pool.length && out.length < n && i < n * 4; i++) {
    const p = pool[i % pool.length], id = (k) => k.show + '|' + k.prompt;
    // mai la parola nuova di questa lezione (si scopre solo con «Che cos'è?»)
    const free = p.keys.filter(k => !used[id(k)] && !(fresh && (k.prompt + k.model).indexOf(fresh) !== -1));
    if (!free.length) continue;
    const r = Object.assign({}, pick(free));
    used[id(r)] = true;
    r.review = p.lesson; r.reviewItems = p.items;
    out.push(r);
  }
  return out;
}

(function () {
  const bBuild = buildSteps;
  buildSteps = (lesson) => {
    const st = bBuild(lesson);
    if (reviewSkip(lesson)) return st;
    const mix = st.map((s, i) => s.phase === 'mix' ? i : -1).filter(i => i >= 0);
    const slots = mix.filter((_, k) => k % MIX_BLOCK_SIZE === 2 || k % MIX_BLOCK_SIZE === 6);
    const last = (ph) => { let j = -1; st.forEach((s, i) => { if (ph.indexOf(s.phase) !== -1) j = i; }); return j; };
    // le lezioni lunghe dei numeri grandi (big): il ripasso solo negli esercizi misti, per non allungarle
    const after = lesson.big ? [] : [last(['present']), last(['yesno', 'neg', 'yes']), last(['askq'])].filter(i => i >= 0);
    const rs = reviewSteps(lesson, bBuild, slots.length + after.length);
    if (!rs.length) return st;
    // prima si cambiano i posti negli esercizi misti (gli indici non si spostano), poi si inseriscono quelle dell'introduzione
    // mai la stessa figura due volte di fila
    const take = (i, j) => { const k = rs.findIndex(r => (!st[i] || r.show !== st[i].show) && (!st[j] || r.show !== st[j].show)); return k < 0 ? null : rs.splice(k, 1)[0]; };
    slots.forEach(i => { const r = take(i - 1, i + 1); if (r) { r.phase = 'mix'; r.speed = st[i].speed; st[i] = r; } });
    after.sort((a, b) => b - a).forEach(i => { const r = take(i, i + 1); if (r) { r.phase = 'review'; st.splice(i + 1, 0, r); } });
    return st;
  };
})();
