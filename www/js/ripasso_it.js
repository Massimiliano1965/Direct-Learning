'use strict';
/* =====================================================================
   RIPASSO NEGLI ESERCIZI (deciso con Massi): dal livello 2, negli esercizi misti alla fine della lezione,
   ogni tanto torna la domanda chiave di una lezione passata («Che ore sono?», «Cosa fa Max?», «Quanto costa il libro?»…),
   con le sue regole. 2 domande di ripasso per blocco, ognuna di una lezione diversa. Si carica dopo tutte le lezioni.
   ===================================================================== */

const REVIEW_PER_BLOCK = 2;

// Se l'allievo sbaglia, le ripetizioni usano le parole di quella lezione (reviewItems)
// Le domande chiave delle lezioni prima di questa (senza i test), che l'app sa mostrare e correggere
function reviewPool(lesson, build) {
  const all = LESSONS.filter(l => !l.test), before = all.slice(0, all.indexOf(lesson));
  const out = [];
  before.forEach(l => {
    let keys = [];
    try { keys = build(l).filter(s => s.phase === 'key' && s.show && FIG[s.show] && s.model && evaluate(s, s.model).ok); } catch (e) { keys = []; }
    if (keys.length) out.push({ lesson: l.id, keys: keys, items: lessonWords(l) });
  });
  return out;
}

(function () {
  const bBuild = buildSteps;
  buildSteps = (lesson) => {
    const st = bBuild(lesson);
    if (lesson.test || (lesson.level || 1) < 2) return st;
    const mix = st.map((s, i) => s.phase === 'mix' ? i : -1).filter(i => i >= 0);
    const pool = shuffle(reviewPool(lesson, bBuild));
    // in ogni blocco di 8: il ripasso al 3° e al 7° posto (mai due di fila, mai all'inizio)
    const slots = mix.filter((_, k) => k % MIX_BLOCK_SIZE === 2 || k % MIX_BLOCK_SIZE === 6).slice(0, pool.length);
    slots.forEach((i, n) => {
      const r = Object.assign({}, pick(pool[n].keys));
      r.phase = 'mix'; r.review = pool[n].lesson; r.reviewItems = pool[n].items; r.speed = st[i].speed;
      st[i] = r;
    });
    return st;
  };
})();
