'use strict';
/* =====================================================================
   MOTORE COMUNE per i corsi di russo, arabo e cinese (lezioni 1 e 2: «Che cos'è? È un libro.»).
   Si carica dopo course_xx.js (che dà COURSE, ITEMS, LESSONS, TEACHERS e PH = le frasi della lingua) e logic.js.
   Il flusso della lezione (buildSteps, ripetizioni, punteggi) resta quello del corso di italiano;
   qui si cambiano solo le frasi dell'insegnante e il modo di capire le risposte.
   Ogni frase si scrive nella sua scrittura e sotto, più piccola, COME SI PRONUNCIA letta da chi studia:
   la pronuncia cambia con la lingua dello studente (italiano, inglese, tedesco): COURSE.translit (decisione di Massi).
   ===================================================================== */

// Le frasi (PH) danno sia il testo da mostrare/dire sia le «parole» per riconoscere le risposte (core)
np = (k) => ITEMS[k].word;
Q = PH.what;
altPrompt = (a, b) => PH.alt(a, b);
norm = (text) => {
  const s = ' ' + PH.tokens(text).join(' ') + ' ';
  return s.replace(/\s+/g, ' ');
};
const wCore = (str) => ' ' + PH.tokens(str).join(' ') + ' ';            // la frase come la scrive norm()
const W_ALL = () => Object.keys(ITEMS);
// Le affermazioni e le negazioni nella risposta (dopo aver tolto le negazioni, per non contarle due volte)
negations = (s) => W_ALL().filter(k => s.indexOf(wCore(PH.negCore(k))) !== -1);
claims = (s) => {
  let t = s;
  W_ALL().forEach(k => { t = t.split(wCore(PH.negCore(k))).join(' # '); });
  return W_ALL().filter(k => t.indexOf(wCore(PH.isCore(k))) !== -1);
};
// le forme sbagliate (es. in arabo: «هذه كتاب», il «questo» femminile con una parola maschile)
const wBad = (s) => W_ALL().some(k => (PH.badCores ? PH.badCores(k) : []).some(b => s.indexOf(wCore(b)) !== -1));
// sì / no: si cercano dopo aver tolto le frasi (in cinese «是» è anche dentro «这是书»)
function wYesNo(s) {
  let t = s.split(wCore(PH.what)).join(' # ');      // «这是什么»: il «是» della domanda non è un «sì»
  W_ALL().forEach(k => { t = t.split(wCore(PH.negCore(k))).join(' # ').split(wCore(PH.isCore(k))).join(' # '); });
  return { yes: PH.yesW.some(w => has(t, w)), no: PH.noW.some(w => has(t, w)) };
}
evaluate = function (step, text) {
  const s = norm(text), c = claims(s), n = negations(s), X = step.show, yn = wYesNo(s);
  if (wBad(s)) return { ok: false, full: false };
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: s.indexOf(wCore(PH.what)) !== -1 && !c.length, full: true };
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length, full: true };
    case 'yes': return { ok: yn.yes && !yn.no && !n.length && c.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg': return { ok: !yn.yes && n.indexOf(step.ask) !== -1 && n.indexOf(X) === -1 && onlyX, full: c.indexOf(X) !== -1 };
    default: return { ok: c.indexOf(X) !== -1 && onlyX && !n.length && !PH.orW.some(w => has(s, w)), full: true };
  }
};
// Le domande dell'allievo: «Che cos'è?», «È un libro?», «È un libro o una penna?»
evalAsk = function (X, text) {
  const s = norm(text), bad = (model) => ({ ok: false, model: model || PH.what });
  const yn = wYesNo(s);
  if (yn.yes || yn.no || negations(s).length || wBad(s)) return bad();
  if (s.indexOf(wCore(PH.what)) !== -1) return { ok: true, kind: 'what' };
  const said = W_ALL().filter(k => has(s, wCore(ITEMS[k].word).trim()));
  if (PH.orW.some(w => has(s, w)) && said.length === 2) return { ok: true, kind: 'alt', ask: said[0], ask2: said[1] };
  const asked = W_ALL().filter(k => s.indexOf(wCore(PH.askCore(k))) !== -1);
  if (asked.length === 1) return { ok: true, kind: asked[0] === X ? 'yes' : 'no', ask: asked[0] };
  if (said.length === 1) return bad(PH.isQ(said[0]));
  return bad();
};
answerAsk = function (X, r) {
  if (r.kind === 'what') return PH.is(X);
  if (r.kind === 'yes') return PH.yes(X);
  if (r.kind === 'alt') return PH.is(X);
  return PH.no(r.ask) + ' ' + PH.is(X);
};
Object.assign(S, {
  present: (X) => { const p = PH.is(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes:     (X) => ({ type: 'yes', show: X, prompt: PH.isQ(X), model: PH.yes(X) }),
  neg:  (X, Y) => ({ type: 'neg', show: X, ask: Y, prompt: PH.isQ(Y), model: PH.no(Y) }),
  alt:  (X, Y) => { const o = Math.random() < 0.5 ? [X, Y] : [Y, X]; return { type: 'alt', show: X, options: o, prompt: PH.alt(o[0], o[1]), model: PH.is(X) }; },
  key:     (X) => ({ type: 'key', show: X, prompt: PH.what, model: PH.is(X) }),
  reveal:  (X) => ({ type: 'reveal', show: X, prompt: PH.what + ' ' + PH.is(X), model: '' }),
  askQ:    (X) => ({ type: 'echo', check: 'question', show: X, prompt: PH.what, model: PH.what })
});
// Nessun «questo / questa» da insegnare a parte: nella lezione 2 restano le stesse frasi
dem = () => '';

/* ---------- La pronuncia, scritta per chi legge italiano, inglese o tedesco ----------
   PH.words(text) divide la frase in parole (il cinese senza spazi: con il vocabolario della lezione);
   TR[parola][lingua] = come si legge. La punteggiatura resta; la prima lettera maiuscola. */
COURSE.translit = function (text, ui) {
  const lang = ui === 'en' || ui === 'de' ? ui : 'it';
  const parts = PH.words(String(text || '')).map(w => {
    const t = TR[PH.trKey(w)];
    return t ? t[lang] : w;
  });
  let out = PH.joinTr(parts);
  out = out.replace(/\s+([.,?!])/g, '$1').trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
};
