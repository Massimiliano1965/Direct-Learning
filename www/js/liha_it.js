'use strict';
/* =====================================================================
   CAPITOLO 11: «L'ho, li ho, le ho» (lezione 61, livello 3). Si carica dopo lile_it.js (lezione 58) e passato_it.js.
   Come la lezione 58 («li prende, le prende»), ma al passato: Max o Isa ricordano (la nuvoletta della lezione 45).
   Con «li» e «le» davanti a «ha», il participio prende la -i o la -e delle cose:
     Max ha preso i libri. Li ha presi.               → ripete
     Max ha preso i libri?                            → Sì, li ha presi.
     Isa ha preso i libri?                            → No, non li ha presi.   (li ha presi Max)
     Che cosa ha fatto Max con i libri?               → Li ha presi.
   i libri, gli ombrelli → li ha presi;  le chiavi, le penne, le tazze → le ha prese;  le arance → le ha mangiate.
   Errori: «li ha preso», «le ha presi», «l'ha presi», «ha preso i libri» (qui si dice «li»).
   ===================================================================== */

const LHP = {
  lq_m_book: 'lp_m_book', lq_f_key: 'lp_f_key', lq_m_orange: 'lp_m_orange', lq_f_pen: 'lp_f_pen', lq_m_cup: 'lp_m_cup', lq_f_umbrella: 'lp_f_umbrella'
};
const LHP_PART = { prende: 'pres', mangia: 'mangiat' };
const LHP_ROOT = { pres: 'prende', mangiat: 'mangia', prendut: 'prende', prendit: 'prende', mangiut: 'mangia' };
const isLq = (X) => !!LHP[X];
const lqP = (X) => LP[LHP[X]];
const lqWho = (X) => X.charAt(3);
const lqName = (X) => vName(lqWho(X));
const lqOtherName = (X) => vName(lqWho(X) === 'm' ? 'f' : 'm');
const lqFem = (X) => gFem(lqP(X).obj);
const lqPro = (X) => lqFem(X) ? 'le' : 'li';
const lqPart = (X, end) => LHP_PART[lqP(X).verb] + (end || (lqFem(X) ? 'e' : 'i'));        // «presi», «prese», «mangiate»
const lqThe = (X) => gThe(lqP(X).obj, 2);
const lqFull = (X, who) => (who || lqName(X)) + ' ha ' + lqPart(X, 'o') + ' ' + lqThe(X);     // «Max ha preso i libri»
const lqShort = (X, neg) => (neg ? 'non ' : '') + lqPro(X) + ' ha ' + lqPart(X);               // «li ha presi»
const lqQ = (X) => 'Che cosa ha fatto ' + lqName(X) + ' con ' + lqThe(X) + '?';
Object.keys(LHP).forEach(X => {
  Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(lqWho(X), () => inner(FIG[LHP[X]]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '')) });
});

const SLQ = gTag('lq', {
  present: (X) => { const p = lqFull(X) + '. ' + gCap(lqShort(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: lqFull(X) + '?', model: 'Sì, ' + lqShort(X) + '.' }),
  neg: (X) => ({ type: 'neg', show: X, ask: lqWho(X) === 'm' ? 'f' : 'm', prompt: lqFull(X, lqOtherName(X)) + '?', model: 'No, ' + lqShort(X, true) + '.', complete: lqName(X) + ' ' + lqShort(X) + '.' }),
  key: (X) => ({ type: 'key', show: X, prompt: lqQ(X), model: gCap(lqShort(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: lqQ(X) + ' ' + gCap(lqShort(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: lqQ(X), model: lqQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) li ha presi», «Max ha preso i libri» ---------- */
function lqStatements(s) {
  s = s.replace(/ (che )?cosa ha fatto [a-z]+ con /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const m = /^([a-z]+)([oaie])$/.exec(w[i]);
    if (!m || !LHP_ROOT[m[1]] || w[i - 1] !== 'ha') continue;
    let j = i - 2, pro = null, neg = false, subj = null;
    if (/^(l|lo|la|li|le)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]]; else if (w[j] === 'lui') subj = 'm'; else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    const n = /^(il|la|lo|l|i|gli|le)$/.test(w[i + 1] || '') ? gNoun(w[i + 2]) : null;
    out.push({ verb: LHP_ROOT[m[1]], ok: !!LHP_PART[LHP_ROOT[m[1]]] && LHP_PART[LHP_ROOT[m[1]]] === m[1], end: m[2], pro: pro, neg: neg, subj: subj,
      obj: n ? { k: n.obj, pl: n.plural, art: w[i + 1] } : null });
  }
  return out;
}
function lqGood(x, X, W, short) {
  if (!x.ok || x.verb !== lqP(X).verb || (x.subj !== null && x.subj !== W)) return false;
  if (short) return !x.obj && x.pro === lqPro(X) && x.end === (lqFem(X) ? 'e' : 'i');
  return !x.pro && !!x.obj && x.obj.k === lqP(X).obj && x.obj.pl !== false && x.obj.art === gDef(lqP(X).obj, 2) && x.end === 'o';
}
function lqEvaluate(step, text) {
  const s = gNorm(text), X = step.show, W = lqWho(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(lqQ(X)).trim()), full: true };
  const st = lqStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && lqGood(pos[0], X, W, false) && lqGood(pos[1], X, W, true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.length > 0 && pos.every(x => lqGood(x, X, W, true)), full: true };
    case 'neg': return { ok: !yes && neg.length > 0 && neg.every(x => lqGood(x, X, step.ask, true)) && pos.every(x => lqGood(x, X, W, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => lqGood(x, X, W, true)) && !neg.length && !yes && !no, full: true };
  }
}
function lqEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || lqQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ha fatto')) return has(s, norm(lqOtherName(X)).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = lqStatements(s);
  if (st.length === 1) {
    const x = st[0], W = lqWho(X);
    if (lqGood(x, X, W, false)) return { ok: true, kind: 'yes' };
    if (x.subj && x.subj !== W && x.subj !== '?' && lqGood(x, X, x.subj, false)) return { ok: true, kind: 'no' };
    if (x.verb === lqP(X).verb) return bad(lqFull(X) + '?');
  }
  return bad();
}
function lqAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + lqShort(X) + '.';
  if (r.kind === 'no') return 'No, ' + lqOtherName(X) + ' ' + lqShort(X, true) + '. ' + lqName(X) + ' ' + lqShort(X) + '.';
  return gCap(lqShort(X)) + '.';
}
gInstall('lq', isLq, SLQ, lqEvaluate, lqEvalAsk, lqAnswerAsk);
