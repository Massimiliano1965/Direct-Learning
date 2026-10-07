'use strict';
/* =====================================================================
   CAPITOLO 7: «L'ho letto — l'ho letta» (lezione 46, livello 2). Si carica dopo pron_it.js e passato_it.js.
   Come la lezione 25 («lo legge, la chiude»), ma al passato: Max o Isa ricordano (la nuvoletta della lezione 45).
   Con «l'» davanti a «ha», il participio prende la -o o la -a della cosa:
     Max ha letto il libro. L'ha letto.              → ripete
     Max ha letto il libro?                          → Sì, l'ha letto.
     Isa ha letto il libro?                          → No, non l'ha letto.   (l'ha letto Max)
     Che cosa ha fatto Max con il libro?             → L'ha letto.
   libro, telefono, quaderno → l'ha letto, l'ha preso;  arancia, aranciata, finestra → l'ha mangiata, l'ha bevuta, l'ha chiusa.
   Come nella lezione 22, -o azzurra e -a rosa. Errori: «l'ha letta» (per il libro), «ha letto il libro» (qui si dice «l'»), «l'ha leggiuto».
   ===================================================================== */

// le scene: le stesse della lezione 25 (ld_…), con il participio (radice + o / a)
const LH = {
  lh_m_book:     { ld: 'ld_m_book',     part: 'lett',    act: 'read' },
  lh_f_phone:    { ld: 'ld_f_phone',    part: 'pres',    act: 'take' },
  lh_m_notebook: { ld: 'ld_m_notebook', part: 'pres',    act: 'take' },
  lh_m_orange:   { ld: 'ld_m_orange',   part: 'mangiat', act: 'eat' },
  lh_f_soda:     { ld: 'ld_f_soda',     part: 'bevut',   act: 'drink' },
  lh_f_window:   { ld: 'ld_f_window',   part: 'chius',   act: 'close' }
};
const LH_ACT = { lett: 'read', pres: 'take', mangiat: 'eat', bevut: 'drink', chius: 'close' };
const LH_WRONG = { leggiut: 'read', leggit: 'read', prendut: 'take', prendit: 'take', mangiut: 'eat', bevit: 'drink', bevet: 'drink', chiudit: 'close', chiudut: 'close' };
const isLh = (X) => !!LH[X];
const lhWho = (X) => X.charAt(3);
const lhName = (X) => vName(lhWho(X));
const lhOtherName = (X) => vName(lhWho(X) === 'm' ? 'f' : 'm');
const lhObj = (X) => LD[LH[X].ld].obj;
const lhG = (X) => ldPro(LH[X].ld) === 'la' ? 'a' : 'o';                       // la cosa: maschile (-o) o femminile (-a)
const lhPart = (X, g) => LH[X].part + (g || lhG(X));                             // «letto», «chiusa»
const lhFull = (X, who) => (who || lhName(X)) + ' ha ' + lhPart(X, 'o') + ' ' + p3The(lhObj(X));   // «Max ha letto il libro»
const lhShort = (X) => 'l\'ha ' + lhPart(X);                                     // «l'ha letto»
const lhQ = (X) => 'Che cosa ha fatto ' + lhName(X) + ' con ' + p3The(lhObj(X)) + '?';
const lhCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
Object.keys(LH).forEach(X => {
  Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(lhWho(X), () => inner(FIG[LH[X].ld]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '')) });
});

const SLH = gTag('lh', {
  present: (X) => { const p = lhFull(X) + '. ' + lhCap(lhShort(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: lhFull(X) + '?', model: 'Sì, ' + lhShort(X) + '.' }),
  // l'altra persona: «Isa ha letto il libro?» → «No, non l'ha letto.»
  neg: (X) => ({ type: 'neg', show: X, ask: lhWho(X) === 'm' ? 'f' : 'm', prompt: lhFull(X, lhOtherName(X)) + '?', model: 'No, non ' + lhShort(X) + '.', complete: lhName(X) + ' ' + lhShort(X) + '.' }),
  key: (X) => ({ type: 'key', show: X, prompt: lhQ(X), model: lhCap(lhShort(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: lhQ(X) + ' ' + lhCap(lhShort(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: lhQ(X), model: lhQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) l'ha letto» (gNorm scrive «l ha letto»), e la frase intera «Max ha letto il libro» ---------- */
function lhStatements(s) {
  s = s.replace(/ (che )?cosa ha fatto [a-z]+ con /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const m = /^([a-z]+)([oaie])$/.exec(w[i]);
    if (!m || (!LH_ACT[m[1]] && !LH_WRONG[m[1]]) || w[i - 1] !== 'ha') continue;
    let j = i - 2, pro = null, neg = false, subj = null;
    if (/^(l|lo|la)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]]; else if (w[j] === 'lui') subj = 'm'; else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    const obj = /^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '') && WORD2KEY[w[i + 2]] ? { art: w[i + 1], k: WORD2KEY[w[i + 2]] } : null;
    out.push({ act: LH_ACT[m[1]] || null, g: m[2], pro: pro, neg: neg, subj: subj, obj: obj });
  }
  return out;
}
// la frase è giusta per la scena X? short = con «l'» (e il participio accordato); W = di chi si parla
function lhGood(x, X, W, short) {
  if (x.act !== LH[X].act || (x.subj !== null && x.subj !== W)) return false;
  if (short) return !!x.pro && !x.obj && x.g === lhG(X) && (x.pro === 'l' || x.pro === (lhG(X) === 'a' ? 'la' : 'lo'));
  return !x.pro && !!x.obj && x.obj.k === lhObj(X) && x.obj.art === p3ArtN(lhObj(X)) && x.g === 'o';
}
function lhEvaluate(step, text) {
  const s = gNorm(text), X = step.show, W = lhWho(X);
  if (step.type === 'echo' && step.check === 'question')
    return { ok: has(s, 'cosa ha fatto') && has(s, 'con') && has(s, norm(ITEMS[lhObj(X)].word).trim()) && has(s, norm(lhName(X)).trim()), full: true };
  const st = lhStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && lhGood(pos[0], X, W, false) && lhGood(pos[1], X, W, true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.length > 0 && pos.every(x => lhGood(x, X, W, true)), full: true };
    case 'neg': return { ok: !yes && neg.length > 0 && neg.every(x => lhGood(x, X, step.ask, true)) && pos.every(x => lhGood(x, X, W, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => lhGood(x, X, W, true)) && !neg.length && !yes && !no, full: true };
  }
}
/* ---------- L'allievo: «Che cosa ha fatto Max con il libro?», «Max ha letto il libro?», «Isa ha letto il libro?» ---------- */
function lhEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || lhQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ha fatto')) return has(s, norm(lhOtherName(X)).trim()) || !has(s, norm(ITEMS[lhObj(X)].word).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = lhStatements(s);
  if (st.length === 1) {
    const x = st[0], W = lhWho(X);
    if (lhGood(x, X, W, false)) return { ok: true, kind: 'yes' };
    if (x.subj && x.subj !== W && x.subj !== '?' && lhGood(x, X, x.subj, false)) return { ok: true, kind: 'no' };
    if (x.act === LH[X].act) return bad(lhFull(X) + '?');
  }
  return bad();
}
function lhAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + lhShort(X) + '.';
  if (r.kind === 'no') return 'No, ' + lhOtherName(X) + ' non ' + lhShort(X) + '. ' + lhName(X) + ' ' + lhShort(X) + '.';
  return lhCap(lhShort(X)) + '.';
}
gInstall('lh', isLh, SLH, lhEvaluate, lhEvalAsk, lhAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.lh ? ['letto', 'preso', 'mangiata', 'bevuta', 'chiusa', 'libro', 'telefono', 'quaderno', 'arancia', 'aranciata', 'finestra'] : bGw(lesson);
}
