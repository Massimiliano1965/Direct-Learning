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
// (Massi: «deve riconoscere anche la parlata normale») il microfono a volte perde il piccolo «questo» (это, هذا, 这):
// la parola da sola vale la frase, e «не стол» / «ليس كتاب» / «不是书» vale la negazione. PH.notW = il «non» di ogni lingua.
const wBare = (k) => wCore(ITEMS[k].word).trim();
const wBareNeg = (s, k) => PH.bareOk && (PH.notW || []).some(n => s.indexOf(' ' + wCore(n).trim() + ' ' + wBare(k) + ' ') !== -1);
negations = (s) => W_ALL().filter(k => s.indexOf(wCore(PH.negCore(k))) !== -1 || wBareNeg(s, k));
claims = (s) => {
  let t = s;
  W_ALL().forEach(k => { t = t.split(wCore(PH.negCore(k))).join(' # '); });
  const c = W_ALL().filter(k => t.indexOf(wCore(PH.isCore(k))) !== -1);
  if (!c.length && PH.bareOk) return W_ALL().filter(k => has(t, wBare(k)) && !wBareNeg(t, k));
  return c;
};
// le forme sbagliate (es. in arabo: «هذه كتاب», il «questo» femminile con una parola maschile)
const wBad = (s) => W_ALL().some(k => (PH.badCores ? PH.badCores(k) : []).some(b => s.indexOf(wCore(b)) !== -1));
// sì / no: si cercano dopo aver tolto le frasi (in cinese «是» è anche dentro «这是书»)
function wYesNo(s) {
  let t = s.split(wCore(PH.what)).join(' # ');      // «这是什么»: il «是» della domanda non è un «sì»
  W_ALL().forEach(k => { t = t.split(wCore(PH.negCore(k))).join(' # ').split(wCore(PH.isCore(k))).join(' # '); });
  if (PH.bareOk) W_ALL().forEach(k => (PH.notW || []).forEach(n => { t = t.split(' ' + wCore(n).trim() + ' ' + wBare(k) + ' ').join(' # '); }));
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
// A ORECCHIO (Massi: «quel tavolo non me lo riconosce proprio, ci vogliono molti tentativi»): se le parole esatte non tornano,
// si confronta come SUONA quello che ha scritto il microfono con tutte le frasi possibili del passo, giuste e sbagliate
// (PH.sound = la frase in suoni semplici). Vince la più vicina: se è giusta e abbastanza vicina, va bene. Come in inglese.
function wSim(a, b) {
  if (!a.length || !b.length) return 0;
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
}
function wCandidates(step) {
  const all = W_ALL(), X = step.show, out = [];
  const add = (t, ok, full) => out.push({ snd: PH.sound(t), ok: ok, full: !!full });
  if (step.type === 'echo' && step.check === 'question') { add(PH.what, true); all.forEach(k => add(PH.is(k), false)); return out; }
  if (step.type === 'yes') { all.forEach(k => { add(PH.yes(k), k === X); add(PH.no(k), false); }); return out; }
  if (step.type === 'neg') {
    all.forEach(k => { add(PH.no(k), k === step.ask); add(PH.yes(k), false); add(PH.is(k), false); });
    all.forEach(k => { if (k !== step.ask) add(PH.no(step.ask) + ' ' + PH.is(k), k === X, true); });
    return out;
  }
  all.forEach(k => { add(PH.is(k), k === X); add(PH.no(k), false); });
  return out;
}
const W_TOL = 0.7;
function wBySound(step, text) {
  if (!PH.sound) return null;
  const heard = PH.sound(text);
  if (heard.length < 2) return null;
  let best = null, bestWrong = 0;
  wCandidates(step).forEach(c => {
    const s = wSim(heard, c.snd);
    if (c.ok) { if (!best || s > best.s) best = { s: s, full: c.full }; }
    else bestWrong = Math.max(bestWrong, s);
  });
  if (!best || best.s < W_TOL || best.s <= bestWrong) return null;
  return { ok: true, full: best.full || step.type !== 'neg', bySound: true };
}
{
  const exact = evaluate;
  evaluate = function (step, text) { const r = exact(step, text); return r.ok ? r : (wBySound(step, text) || r); };
}

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
