'use strict';
/* =====================================================================
   LA RICERCA (idea di Massi): l'allievo cerca una parola, un verbo, un articolo, scritta o a voce.
   Il risultato è una lezione, o il punto della lezione dove c'è la parola: toccando, la lezione parte da lì
   (si può interrompere con «Esci» e ripetere quante volte si vuole). Niente traduzioni: si impara dentro la scena.
   - L'elenco si fa una volta sola, dalle frasi delle lezioni (buildSteps): funziona senza internet.
   - Cerca la frase intera («ce l'ha»), poi l'inizio della parola («legg» → legge, leggere…),
     i verbi anche dall'infinito («leggere» → legge, leggo…), e se non trova nulla propone le parole più vicine.
   ===================================================================== */

let SEARCH_IX = null;    // [{ id, i, show, text, norm }]: una frase per passo, una volta per lezione
let SEARCH_STEPS = {};   // le sequenze usate per l'elenco: si riparte proprio da quel passo
let SEARCH_WORDS = null; // tutte le parole che ci sono, per «Forse cercavi…»

function sNorm(t) {
  return ' ' + String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’`´]/g, ' ').replace(/[^a-z0-9Ѐ-ӿ؀-ۿ぀-ヿ一-鿿\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}
function searchIndex() {
  if (SEARCH_IX) return SEARCH_IX;
  SEARCH_IX = []; SEARCH_STEPS = {}; SEARCH_WORDS = new Set();
  LESSONS.filter(l => !l.test).forEach(l => {
    let steps;
    try { steps = buildSteps(l); } catch (e) { return; }
    SEARCH_STEPS[l.id] = steps;
    const seen = new Set();
    steps.forEach((st, i) => {
      if (st.review) return;   // le domande di ripasso sono di un'altra lezione
      [st.model, st.prompt].forEach(t => {
        if (!t) return;
        const text = shown(t), norm = sNorm(text);
        if (seen.has(norm)) return;
        seen.add(norm);
        SEARCH_IX.push({ id: l.id, i: i, show: st.show, text: text, norm: norm });
        norm.trim().split(' ').forEach(w => { if (w.length > 1) SEARCH_WORDS.add(w); });
      });
    });
  });
  return SEARCH_IX;
}
// i verbi: dall'infinito a tutte le forme che si conoscono (VFORM della lezione 23, i verbi di movimento)
function searchForms(q) {
  const out = [];
  if (typeof VFORM !== 'undefined' && VFORM[q] && VFORM[q].p === 0) Object.keys(VFORM).forEach(w => { if (VFORM[w].act === VFORM[q].act && w !== q) out.push(w); });
  if (typeof MOV_VERB !== 'undefined') Object.keys(MOV_VERB).forEach(f => { if (MOV_VERB[f][0] === q) out.push(f); });
  return out;
}
// distanza tra due parole (quante lettere cambiare): per «Forse cercavi…»
function sDist(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// cerca: { hits: [{ lesson, rows: [frasi] }], maybe: [parole vicine] }
function searchFind(query) {
  const q = sNorm(query).trim();
  if (!q) return { hits: [], maybe: [] };
  const ix = searchIndex();
  let rows = ix.filter(r => r.norm.indexOf(' ' + q + ' ') !== -1);                                   // la parola o la frase intera
  const forms = q.indexOf(' ') === -1 ? searchForms(q) : [];
  if (forms.length) rows = rows.concat(ix.filter(r => forms.some(f => r.norm.indexOf(' ' + f + ' ') !== -1)));
  if (!rows.length && q.length >= 3) rows = ix.filter(r => r.norm.indexOf(' ' + q) !== -1);           // l'inizio della parola
  const byLesson = new Map();
  rows.forEach(r => { if (!byLesson.has(r.id)) byLesson.set(r.id, []); const a = byLesson.get(r.id); if (a.length < 2 && !a.some(x => x.norm === r.norm)) a.push(r); });
  const hits = LESSONS.filter(l => byLesson.has(l.id)).map(l => ({ lesson: l, rows: byLesson.get(l.id) })).slice(0, 20);
  let maybe = [];
  if (!hits.length && q.indexOf(' ') === -1) {
    const lim = q.length <= 4 ? 1 : 2;
    maybe = [...SEARCH_WORDS].map(w => [w, sDist(q, w)]).filter(x => x[1] <= lim).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => x[0]);
  }
  return { hits: hits, maybe: maybe, q: q, forms: forms };
}

/* ---------- La schermata ---------- */
const LENS = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 L21 21"/></svg>';
const MIC = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11 a6.5 6.5 0 0 0 13 0 M12 17.5 V21"/></svg>';
function showSearch() {
  $('search-q').value = '';
  $('search-out').innerHTML = '<p class="muted search-tip">' + tx('searchTip') + '</p>';
  applyStaticText();
  showScreen('search');
  setTimeout(() => { try { $('search-q').focus(); } catch (e) {} }, 60);
}
function hiliteRow(text, words) {
  // la parola cercata in oro (si confronta senza accenti e maiuscole)
  return text.split(/(\s+)/).map(t => { const n = sNorm(t).trim(); return n && words.some(w => n === w || (w.length >= 3 && n.indexOf(w) === 0)) ? '<b class="s-hit">' + t + '</b>' : t; }).join('');
}
function runSearch() {
  const out = $('search-out'), query = $('search-q').value;
  if (!sNorm(query).trim()) { out.innerHTML = '<p class="muted search-tip">' + tx('searchTip') + '</p>'; return; }
  if (!SEARCH_IX) out.innerHTML = '<p class="muted">…</p>';
  setTimeout(() => {   // la prima volta l'elenco si prepara (un attimo): prima si fa vedere «…»
    const r = searchFind(query), words = [r.q].concat(r.forms || []).join(' ').split(' ');
    if (!r.hits.length) {
      out.innerHTML = '<p class="muted">' + tx('searchNone') + '</p>' +
        (r.maybe.length ? '<p class="muted">' + tx('searchMaybe') + ' ' + r.maybe.map(w => '<button class="s-maybe">' + w + '</button>').join(' ') + '</p>' : '');
      out.querySelectorAll('.s-maybe').forEach(b => { b.onclick = () => { $('search-q').value = b.textContent; runSearch(); }; });
      return;
    }
    out.innerHTML = '<p class="muted s-count">' + tx('searchFound', { n: r.hits.length }) + '</p>' + r.hits.map(h => {
      const l = h.lesson, name = l.test ? '' : tx('lesson', { n: typeof lessonNumber === 'function' ? lessonNumber(l) : LESSONS.indexOf(l) + 1 });
      const ch = typeof CHAPTERS !== 'undefined' && l.chapter != null && CHAPTERS[l.chapter] ? (CHAPTERS[l.chapter][1][UI_LANG] || CHAPTERS[l.chapter][1].en) : '';
      return '<div class="s-lesson lv' + (l.level || 1) + '"><div class="s-head"><span class="s-name">' + name + '</span><span class="s-ch">' + ch + '</span></div>' +
        h.rows.map(row => '<button class="s-row" data-id="' + row.id + '" data-i="' + row.i + '"><span class="s-fig">' + (row.show && FIG[row.show] ? FIG[row.show] : '') + '</span>' +
          '<span class="s-text">' + hiliteRow(row.text, words) + '</span><span class="s-go">▶</span></button>').join('') + '</div>';
    }).join('');
    out.querySelectorAll('.s-row').forEach(b => {
      b.onclick = once(() => {
        const l = LESSONS.find(x => x.id === b.dataset.id);
        startLesson(l.id, { lesson: l, items: lessonItems(l), steps: SEARCH_STEPS[l.id], at: +b.dataset.i });
      });
    });
  }, SEARCH_IX ? 0 : 30);
}
// a voce: il microfono ascolta la parola (nella lingua del corso) e la scrive nella casella
function searchByVoice() {
  const mb = $('search-mic');
  if (mb.classList.contains('rec')) { Ears.abort(); mb.classList.remove('rec'); return; }
  mb.classList.add('rec');
  $('search-out').innerHTML = '<p class="muted">' + tx('speakNow') + '</p>';
  Ears.listen(
    (alts) => { mb.classList.remove('rec'); $('search-q').value = (alts && alts[0]) || ''; runSearch(); },
    (code) => { mb.classList.remove('rec'); $('search-out').innerHTML = '<p class="muted">' + (code === 'unsupported' ? tx('noSR') : tx('notHeard')) + '</p>'; }
  );
}
(function () {
  if (typeof document === 'undefined' || !document.getElementById('screen-search')) return;
  $('search-lens').innerHTML = LENS;
  $('search-mic').innerHTML = MIC;
  let t = null;
  $('search-q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(runSearch, 250); });
  $('search-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { clearTimeout(t); runSearch(); try { e.target.blur(); } catch (x) {} } });
  $('search-mic').onclick = searchByVoice;
  $('btn-search-home').onclick = () => { Ears.abort(); renderHome(); showScreen('home'); };
})();
