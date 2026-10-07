'use strict';
/* =====================================================================
   CAPITOLO 7: «Qual è la domanda?» (lezione 43, livello 2). Si carica dopo tutte le lezioni del livello 1 (le figure).
   L'insegnante dice la risposta; l'allievo trova la domanda. Le figure e le domande sono quelle già imparate:
     Sono le otto. La domanda è: «Che ore sono?»                → ripete
     Sono le otto. Qual è la domanda?                           → Che ore sono?
     Sono le otto. La domanda è «Che ore sono?»                 → Sì, la domanda è: «Che ore sono?»
     Sono le otto. La domanda è «Come sta Isa?»                 → No, la domanda non è: «Come sta Isa?»
     Sono le otto. La domanda è «Che ore sono?» o «Chi è?»      → Che ore sono?
   Errori: la domanda di un'altra figura, una risposta al posto della domanda.
   ===================================================================== */

// fig = la figura già conosciuta; a = la risposta; q = la domanda; v = i modi giusti di dirla (scritti come li capisce gNorm)
const QDM = {
  qd_ora:    { fig: 'h8',        a: () => 'Sono le otto.',                 q: () => 'Che ore sono?',                         v: () => ['che ore sono', 'che ora e'] },
  qd_fa:     { fig: 'v_m_read',  a: () => vName('m') + ' legge un libro.', q: () => 'Che cosa fa ' + vName('m') + '?',      v: () => ['cosa fa ' + qdN('m')] },
  qd_costa:  { fig: 'co_book_1', a: () => 'Costa dodici euro.',            q: () => 'Quanto costa il libro?',                 v: () => ['quanto costa il libro', 'quanto costa'] },
  qd_sta:    { fig: 'st_f_male', a: () => vName('f') + ' sta male.',       q: () => 'Come sta ' + vName('f') + '?',           v: () => ['come sta ' + qdN('f')] },
  qd_chi:    { fig: 'f_nonno',   a: () => 'È il nonno.',                   q: () => 'Chi è?',                                 v: () => ['chi e'] },
  qd_perche: { fig: 'pp_m_key',  a: () => 'Per aprire la porta.',          q: () => 'Perché ' + vName('m') + ' prende la chiave?', v: () => ['perche ' + qdN('m') + ' prende la chiave'] }
};
const qdN = (w) => gNorm(vName(w)).trim();
const isQd = (X) => !!QDM[X];
const qdA = (X) => QDM[X].a();
const qdQ = (X) => QDM[X].q();
const qdHas = (s, X) => QDM[X].v().some(v => has(s, v));
const qdOthers = (s, X) => Object.keys(QDM).filter(k => k !== X && qdHas(s, k));
const qdOther = (X) => pick(Object.keys(QDM).filter(k => k !== X));
const qdSay = (X) => 'La domanda è: «' + qdQ(X) + '»';
Object.keys(QDM).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => FIG[QDM[X].fig] }); });

const SQD = gTag('qd', {
  present: (X) => { const p = qdA(X) + ' ' + qdSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: qdA(X) + ' La domanda è «' + qdQ(X) + '»', model: 'Sì, ' + qdSay(X).charAt(0).toLowerCase() + qdSay(X).slice(1) }),
  neg: (X) => { const o = qdOther(X);
    return { type: 'neg', show: X, ask: o, prompt: qdA(X) + ' La domanda è «' + qdQ(o) + '»', model: 'No, la domanda non è: «' + qdQ(o) + '»', complete: qdSay(X) }; },
  alt: (X) => { const o = qdOther(X), ord = Math.random() < 0.5 ? [X, o] : [o, X];
    return { type: 'alt', show: X, prompt: qdA(X) + ' La domanda è «' + qdQ(ord[0]) + '» o «' + qdQ(ord[1]) + '»', model: qdQ(X) }; },
  key: (X) => ({ type: 'key', show: X, prompt: qdA(X) + ' Qual è la domanda?', model: qdQ(X) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: qdA(X) + ' Qual è la domanda? ' + qdQ(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: 'Qual è la domanda?', model: 'Qual è la domanda?' })
});

/* ---------- Capire le risposte: la domanda giusta, senza le domande delle altre figure ---------- */
function qdEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'qual e la domanda'), full: true };
  const yes = has(s, 'si'), no = has(s, 'no'), right = qdHas(s, X), others = qdOthers(s, X);
  switch (step.type) {
    case 'echo': return { ok: right && !others.length, full: true };
    case 'yes': return { ok: yes && !no && !has(s, 'non') && right && !others.length, full: true };
    case 'neg': return { ok: no && !yes && has(s, 'non') && others.length === 1 && others[0] === step.ask, full: right };
    default: return { ok: right && !others.length && !yes && !no, full: true };
  }
}
// L'allievo: fa la domanda della figura (l'insegnante risponde) oppure chiede «Qual è la domanda?»
function qdEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || qdQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'qual e la domanda')) return { ok: true, kind: 'what' };
  const others = qdOthers(s, X);
  if (qdHas(s, X) && !others.length) return { ok: true, kind: 'q' };
  return bad();
}
function qdAnswerAsk(X, r) { return r.kind === 'what' ? qdSay(X) + '.' : qdA(X); }
gInstall('qd', isQd, SQD, qdEvaluate, qdEvalAsk, qdAnswerAsk);
