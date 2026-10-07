'use strict';
/* =====================================================================
   CAPITOLO 10: «Lo, la, li, le» (lezione 58, livello 2). Si carica dopo pron_it.js (lezione 25) e gen_it.js.
   Come la lezione 25 («lo prende, la chiude»), ma con due cose: Max o Isa le hanno in mano (o le mangiano):
     Max prende i libri. Li prende.              → ripete
     Max prende i libri?                         → Sì, li prende.
     Isa prende i libri?                         → No, non li prende.   (li prende Max)
     Che cosa fa Max con i libri?                → Li prende.
   i libri, gli ombrelli → li;  le chiavi, le penne, le arance, le tazze → le.  Come nella lezione 22: li azzurro, le rosa.
   Errori: «lo prende» / «la prende» per due cose, «li» per le chiavi, «le» per i libri, «prende i libri» (qui si dice «li»).
   ===================================================================== */

const LP = {
  lp_m_book:     { verb: 'prende', obj: 'book' },
  lp_f_key:      { verb: 'prende', obj: 'key' },
  lp_m_orange:   { verb: 'mangia', obj: 'orange' },
  lp_f_pen:      { verb: 'prende', obj: 'pen' },
  lp_m_cup:      { verb: 'prende', obj: 'cup' },
  lp_f_umbrella: { verb: 'prende', obj: 'umbrella' }
};
const LP_FORM = { prende: 3, prendo: 1, prendi: 2, prendere: 0, mangia: 3, mangio: 1, mangi: 2, mangiare: 0 };
const isLp = (X) => !!LP[X];
const lpWho = (X) => X.charAt(3);
const lpName = (X) => vName(lpWho(X));
const lpOtherName = (X) => vName(lpWho(X) === 'm' ? 'f' : 'm');
const lpPro = (X) => gFem(LP[X].obj) ? 'le' : 'li';
const lpThe = (X) => gThe(LP[X].obj, 2);                                         // «i libri», «gli ombrelli», «le chiavi»
const lpFull = (X, who) => (who || lpName(X)) + ' ' + LP[X].verb + ' ' + lpThe(X);  // «Max prende i libri»
const lpShort = (X, neg) => (neg ? 'non ' : '') + lpPro(X) + ' ' + LP[X].verb;     // «li prende»
const lpQ = (X) => 'Che cosa fa ' + lpName(X) + ' con ' + lpThe(X) + '?';
const lpFig1 = (o) => o === 'key' ? (FIG.key_giallo || FIG.key) : o === 'umbrella' ? (FIG.umbrella_giallo || FIG.umbrella) : FIG[o];

/* ---------- Figura: la persona con le due cose in mano (le arance: una alla bocca, una in mano) ---------- */
function lpFig(X) {
  const k = p3Key(lpWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const o = LP[X].obj, one = inner(lpFig1(o)).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const base = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="44" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>';
  const orange = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="6.5" fill="#e8862a"/><circle cx="' + (x - 2) + '" cy="' + (y - 2) + '" r="2" fill="#f2a54a" opacity=".7"/>';
  if (o === 'orange') return base + V_PERSON(LK, tArm(LK, [35, 47], [26, 64], [22, 56]) + orange(21, 58) + tArm(LK, [65, 47], [72, 62], [60, 38]) + orange(58, 32) +
    '<path d="M58 25.5 q4 -4 8 -1 q-4 3 -8 1z" fill="#5a9a46"/>', { mouth: 'open' }, -6) + '</svg>';
  return base + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [76, 64], [80, 56]), { mouth: 'smile' }, -10) +
    '<g transform="translate(66 60) scale(.3) translate(-50 -50)">' + one + '</g><g transform="translate(80 58) scale(.3) translate(-50 -50)">' + one + '</g></svg>';
}
Object.keys(LP).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => lpFig(X) }); });

const SLP = gTag('lp', {
  present: (X) => { const p = lpFull(X) + '. ' + gCap(lpShort(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: lpFull(X) + '?', model: 'Sì, ' + lpShort(X) + '.' }),
  neg: (X) => ({ type: 'neg', show: X, ask: lpWho(X) === 'm' ? 'f' : 'm', prompt: lpFull(X, lpOtherName(X)) + '?', model: 'No, ' + lpShort(X, true) + '.', complete: lpName(X) + ' ' + lpShort(X) + '.' }),
  key: (X) => ({ type: 'key', show: X, prompt: lpQ(X), model: gCap(lpShort(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: lpQ(X) + ' ' + gCap(lpShort(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: lpQ(X), model: lpQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) li prende», «Max prende i libri» ---------- */
function lpStatements(s) {
  s = s.replace(/ (che )?cosa fa [a-z]+ con /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const p = LP_FORM[w[i]];
    if (p === undefined) continue;
    let j = i - 1, pro = null, neg = false, subj = null;
    if (/^(lo|la|li|le|l)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]]; else if (w[j] === 'lui') subj = 'm'; else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    const n = /^(il|la|lo|l|i|gli|le)$/.test(w[i + 1] || '') ? gNoun(w[i + 2]) : null;
    out.push({ verb: w[i].slice(0, 4) === 'mang' ? 'mangia' : 'prende', p: p, pro: pro, neg: neg, subj: subj, obj: n ? { k: n.obj, pl: n.plural, art: w[i + 1] } : null });
  }
  return out;
}
// short = con «li / le»; W = di chi si parla
function lpGood(x, X, W, short) {
  if (x.p !== 3 || x.verb !== LP[X].verb || (x.subj !== null && x.subj !== W)) return false;
  if (short) return !x.obj && x.pro === lpPro(X);
  return !x.pro && !!x.obj && x.obj.k === LP[X].obj && x.obj.pl !== false && x.obj.art === gDef(LP[X].obj, 2);
}
function lpEvaluate(step, text) {
  const s = gNorm(text), X = step.show, W = lpWho(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(lpQ(X)).trim()), full: true };
  const st = lpStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && lpGood(pos[0], X, W, false) && lpGood(pos[1], X, W, true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.length > 0 && pos.every(x => lpGood(x, X, W, true)), full: true };
    case 'neg': return { ok: !yes && neg.length > 0 && neg.every(x => lpGood(x, X, step.ask, true)) && pos.every(x => lpGood(x, X, W, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => lpGood(x, X, W, true)) && !neg.length && !yes && !no, full: true };
  }
}
function lpEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || lpQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa fa')) return has(s, norm(lpOtherName(X)).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = lpStatements(s);
  if (st.length === 1) {
    const x = st[0], W = lpWho(X);
    if (lpGood(x, X, W, false)) return { ok: true, kind: 'yes' };
    if (x.subj && x.subj !== W && x.subj !== '?' && lpGood(x, X, x.subj, false)) return { ok: true, kind: 'no' };
    if (x.verb === LP[X].verb) return bad(lpFull(X) + '?');
  }
  return bad();
}
function lpAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + lpShort(X) + '.';
  if (r.kind === 'no') return 'No, ' + lpOtherName(X) + ' ' + lpShort(X, true) + '. ' + lpName(X) + ' ' + lpShort(X) + '.';
  return gCap(lpShort(X)) + '.';
}
gInstall('lp', isLp, SLP, lpEvaluate, lpEvalAsk, lpAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.lp ? ['li', 'le'] : bGw(lesson);
}
