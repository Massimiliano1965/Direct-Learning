'use strict';
/* =====================================================================
   CAPITOLO 10: «Il verbo chiamarsi» (lezione 59, livello 2). Si carica dopo essere_it.js (la figura dell'insegnante),
   verbs_it.js (i due colleghi) e bigl_it.js (i biglietti da visita).
     Io mi chiamo Pietro.   Lui si chiama Max.   Lei si chiama Isa.        → ripete
     Come mi chiamo io?                    → Lei si chiama Pietro.   (l'allievo parla all'insegnante con il Lei)
     Come si chiama lui?                   → Lui si chiama Max.     (va bene anche «Si chiama Max.»)
     Io mi chiamo Max?                     → No, Lei non si chiama Max.
     Lui si chiama Max o Marco?            → Lui si chiama Max.
   E l'allievo chiede all'insegnante: «Come si chiama Lei?» → «Mi chiamo Pietro.»
   Il punto: io mi chiamo, Lei / lui / lei si chiama. «mi chiamo» e «si chiama» sottolineati.
   Errori: «Lei mi chiamo», «si chiamo», «chiama» senza «si», il nome sbagliato, «Io mi chiamo Pietro» come risposta.
   ===================================================================== */

const CM = { cm_me: 1, cm_m: 1, cm_f: 1, cm_c1: 1, cm_c2: 1 };
const isCm = (X) => !!CM[X];
const cmMe = (X) => X === 'cm_me';
const cmName = (X) => X === 'cm_me' ? eTeacher().name : X === 'cm_m' ? vName('m') : X === 'cm_f' ? vName('f') : X === 'cm_c1' ? BV_CARD[1].name : BV_CARD[2].name;
const cmPron = (X) => X === 'cm_f' || X === 'cm_c2' ? 'lei' : 'lui';
const cmG = (X) => cmMe(X) ? eTG() : cmPron(X) === 'lei' ? 'f' : 'm';
// la domanda «no»: un altro nome da uomo per un uomo, da donna per una donna
const cmOther = (X) => pick(Object.keys(CM).filter(k => k !== X && cmG(k) === cmG(X)).map(cmName));
// la frase: per l'insegnante «Io mi chiamo» (l'insegnante) / «Lei si chiama» (l'allievo); per gli altri «Lui / Lei si chiama»
const cmSay = (X, n, neg) => cmMe(X) ? 'Io ' + (neg ? 'non ' : '') + 'mi chiamo ' + (n || cmName(X)) : gCap(cmPron(X)) + ' ' + (neg ? 'non ' : '') + 'si chiama ' + (n || cmName(X));
const cmAns = (X, n, neg) => cmMe(X) ? 'Lei ' + (neg ? 'non ' : '') + 'si chiama ' + (n || cmName(X)) : cmSay(X, n, neg);
const cmQ = (X) => cmMe(X) ? 'Come mi chiamo io?' : 'Come si chiama ' + cmPron(X) + '?';
// Max e Isa: in piedi, che salutano con la mano (si presentano)
function cmPerson(w) {
  const k = p3Key(w), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 36], [72, 22]), { mouth: 'smile' }) + '</svg>';
}
const CM_FIG = { cm_me: () => FIG.e_me, cm_m: () => cmPerson('m'), cm_f: () => cmPerson('f'), cm_c1: () => FIG.bv_1_nome, cm_c2: () => FIG.bv_2_nome };
Object.keys(CM).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => CM_FIG[X]() }); });

const SCM = gTag('cm', {
  present: (X) => { const p = cmSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: cmSay(X) + '?', model: 'Sì, ' + cmAns(X).charAt(0).toLowerCase() + cmAns(X).slice(1) + '.' }),
  neg: (X) => { const o = cmOther(X); return { type: 'neg', show: X, ask: o, prompt: cmSay(X, o) + '?', model: 'No, ' + cmAns(X, o, true).charAt(0).toLowerCase() + cmAns(X, o, true).slice(1) + '.', complete: cmAns(X) + '.' }; },
  alt: (X) => { const o = cmOther(X), ord = Math.random() < 0.5 ? [cmName(X), o] : [o, cmName(X)];
    return { type: 'alt', show: X, prompt: cmSay(X, ord[0]) + ' o ' + ord[1] + '?', model: cmAns(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: cmQ(X), model: cmAns(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: cmQ(X) + ' ' + cmAns(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cmQ(X), model: cmQ(X) })
});

/* ---------- Capire le frasi: «(io / Lei / lui / lei) (non) mi chiamo / si chiama + nome» ---------- */
function cmStatements(s) {
  s = s.replace(/ come (mi|si|ti) (chiamo|chiama|chiami)( io| lui| lei)? /g, ' # ');
  const out = [], re = / (?:(io|lui|lei|tu) )?(non )?(?:(mi|ti|si) )?(chiamo|chiami|chiama) ([a-z]+)(?: ([a-z]+))?(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const form = (m[3] || '') + ' ' + m[4];
    out.push({ subj: m[1] || null, neg: !!m[2], form: form, name: m[5], last: m[6] || null });
  }
  return out;
}
// la frase giusta per X: per l'insegnante l'allievo dice «Lei si chiama» (nella ripetizione «io mi chiamo»)
const cmGood = (x, X, echo) => {
  if (cmMe(X)) return echo ? x.form === 'mi chiamo' && (x.subj === null || x.subj === 'io') : x.form === 'si chiama' && (x.subj === null || x.subj === 'lei');
  return x.form === 'si chiama' && (x.subj === null || x.subj === cmPron(X));
};
// il nome giusto (il cognome si può dire o no; un cognome sbagliato è sbagliato)
const CM_LAST = ['rossi', 'bianchi'];
const cmNameIs = (x, n) => { const p = gNorm(n).trim().split(' '); return x.name === p[0] && !(x.last && CM_LAST.indexOf(x.last) !== -1 && x.last !== p[1]); };
function cmEvaluate(step, text) {
  const s = gNorm(text), X = step.show, echo = step.type === 'echo';
  if (echo && step.check === 'question') return { ok: has(s, gNorm(cmQ(X)).trim()), full: true };
  const st = cmStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s.replace(/ si chiama /g, ' # '), 'si'), no = has(s, 'no');   // «si chiama» non è un «sì»
  const truth = (x) => cmGood(x, X, echo) && cmNameIs(x, cmName(X)), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && cmGood(neg[0], X, false) && cmNameIs(neg[0], step.ask) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo chiede: all'insegnante «Come si chiama Lei?» (→ «Mi chiamo Pietro.»), «Come si chiama lui?», «Lui si chiama Max?»
function cmEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || (cmMe(X) ? 'Come si chiama Lei?' : cmQ(X)) });
  if (has(s.replace(/ si chiama /g, ' # '), 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (cmMe(X) ? has(s, 'come si chiama lei') || has(s, 'come si chiama') : has(s, 'come si chiama ' + cmPron(X)) || has(s, 'come si chiama')) return { ok: true, kind: 'what' };
  const st = cmStatements(s);
  if (st.length === 1 && st[0].form === 'si chiama') return { ok: true, kind: cmNameIs(st[0], cmName(X)) ? 'yes' : 'no', name: st[0].name };
  return bad();
}
function cmAnswerAsk(X, r) {
  const me = (neg, n) => (neg ? 'non ' : '') + 'mi chiamo ' + (n || cmName(X));
  if (cmMe(X)) {
    if (r.kind === 'yes') return 'Sì, ' + me() + '.';
    if (r.kind === 'no') return 'No, ' + me(true, gCap(r.name)) + '. ' + gCap(me()) + '.';
    return gCap(me()) + '.';
  }
  if (r.kind === 'yes') return 'Sì, si chiama ' + cmName(X) + '.';
  if (r.kind === 'no') return 'No, non si chiama ' + gCap(r.name) + '. ' + cmSay(X) + '.';
  return cmSay(X) + '.';
}
gInstall('cm', isCm, SCM, cmEvaluate, cmEvalAsk, cmAnswerAsk);
