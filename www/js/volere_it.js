'use strict';
/* =====================================================================
   CAPITOLO 14: «Volere» (lezione 70, livello 3). Si carica dopo passato_it.js (la nuvoletta) e verbs_it.js (le scene).
   Max o Isa pensano a quello che vogliono fare: nella nuvoletta la scena, con il cuore rosa:
     Max vuole mangiare un'arancia.                      → ripete
     Che cosa vuole fare Max?                            → Max vuole mangiare un'arancia.   (va bene anche «Vuole mangiare un'arancia.»)
     Max vuole bere un'aranciata?                        → No, Max non vuole bere un'aranciata.
     Max vuole mangiare un'arancia o leggere un libro?   → Max vuole mangiare un'arancia.
   Il punto: «vuole» + il verbo intero (l'infinito): vuole leggere, vuole bere. «vuole» sottolineato.
   Errori: «vuole mangia», «voglio», «vole», il verbo sbagliato.
   ===================================================================== */

const VO_INF = { read: 'leggere', eat: 'mangiare', drink: 'bere', phone: 'telefonare', open: 'aprire', close: 'chiudere' };
const VO = { vo_m_eat: 1, vo_f_drink: 1, vo_m_read: 1, vo_f_phone: 1, vo_m_open: 1, vo_f_close: 1 };
const isVo = (X) => !!VO[X];
const voWho = (X) => X.charAt(3);
const voAct = (X) => X.slice(5);
const voName = (X) => vName(voWho(X));
const voDo = (a) => VO_INF[a] + (ACTS[a].obj ? ' ' + vObj(a) : '');                         // «mangiare un'arancia»
const voSay = (X, a, neg) => voName(X) + (neg ? ' non' : '') + ' vuole ' + voDo(a || voAct(X));
const voQ = (X) => 'Che cosa vuole fare ' + voName(X) + '?';
const voOther = (X) => pick(Object.keys(VO_INF).filter(a => a !== voAct(X)));
Object.keys(VO).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(voWho(X), (LK) => V_SCENE[voAct(X)](LK), null, 'want') }); });

const SVO = gTag('vo', {
  present: (X) => { const p = voSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: voSay(X) + '?', model: 'Sì, ' + voSay(X) + '.' }),
  neg: (X) => { const o = voOther(X); return { type: 'neg', show: X, ask: o, prompt: voSay(X, o) + '?', model: 'No, ' + voSay(X, o, true) + '.', complete: voSay(X) + '.' }; },
  alt: (X) => { const o = voOther(X), ord = Math.random() < 0.5 ? [voAct(X), o] : [o, voAct(X)];
    return { type: 'alt', show: X, prompt: voSay(X, ord[0]) + ' o ' + voDo(ord[1]) + '?', model: voSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: voQ(X), model: voSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: voQ(X) + ' ' + voSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: voQ(X), model: voQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) vuole mangiare (un'arancia)» ---------- */
const VO_WORD = {};
Object.keys(VO_INF).forEach(a => { VO_WORD[VO_INF[a]] = { act: a, ok: true }; });
Object.keys(VFORM).forEach(w => { if (!VO_WORD[w] && VO_INF[VFORM[w].act]) VO_WORD[w] = { act: VFORM[w].act, ok: false }; });   // «vuole mangia»: sbagliato
function voStatements(s) {
  s = s.replace(/ (che )?cosa vuole fare [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (!/^(vuole|voglio|vuoi|vole|volere)$/.test(w[i])) continue;
    const f = VO_WORD[w[i + 1]];
    if (!f) continue;
    const neg = w[i - 1] === 'non', subj = names[w[neg ? i - 2 : i - 1]] || null;
    const want = ACTS[f.act].obj ? gNorm(vObj(f.act)).trim() : '', n = want ? want.split(' ').length : 0;
    const objOk = !want || w.slice(i + 2, i + 2 + n).join(' ') === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 2] || '');
    out.push({ act: f.act, ok: f.ok && w[i] === 'vuole' && objOk, neg: neg, subj: subj });
  }
  return out;
}
function voEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(voQ(X)).trim()), full: true };
  const st = voStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && x.act === voAct(X) && (x.subj === null || x.subj === voWho(X)), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function voEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || voQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa vuole fare')) return has(s, norm(vName(voWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = voStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === voAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(voSay(X, st[0].act) + '?');
  return bad();
}
function voAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + voSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + voSay(X, r.ask, true) + '. ' + voSay(X) + '.';
  return voSay(X) + '.';
}
gInstall('vo', isVo, SVO, voEvaluate, voEvalAsk, voAnswerAsk);
