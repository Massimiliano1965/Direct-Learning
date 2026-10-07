'use strict';
/* =====================================================================
   CAPITOLO 16: «Il congiuntivo: voglio che…» (lezione 99, livello 4). Si carica dopo calendario_it.js (le cose da fare) e passato_it.js (la nuvoletta).
   Mario (o Anna) pensa con il cuore rosa (come nella lezione 70: vuole) all'altro che fa una cosa:
     Mario vuole che Anna cucini.                    → ripete
     Che cosa vuole Mario?                           → Mario vuole che Anna cucini.
     Mario vuole che Anna balli?                     → No, Mario non vuole che Anna balli.
     Mario vuole che Anna cucini o che canti?        → Mario vuole che Anna cucini.
   Il punto: dopo «vuole che» il congiuntivo: cucini, balli, canti, nuoti, giochi (a tennis), dorma.
   Errori: «vuole che Anna cucina» (l'indicativo), «vuole che Anna cucinare», la persona o la cosa sbagliata.
   ===================================================================== */

const CG_SUB = { cook: 'cucini', dance: 'balli', sing: 'canti', swim: 'nuoti', tennis: 'giochi', sleep: 'dorma' };
const CG = { cg_m_cook: 1, cg_f_dance: 1, cg_m_sing: 1, cg_f_tennis: 1, cg_m_swim: 1, cg_f_sleep: 1 };
const isCg = (X) => !!CG[X];
const cgWho = (X) => X.charAt(3);                            // chi vuole
const cgOther = (w) => w === 'm' ? 'f' : 'm';                // chi fa la cosa
const cgAct = (X) => X.slice(5);
const cgDo = (a) => CG_SUB[a] + (CAL_ACT[a].extra || '');      // «cucini», «giochi a tennis»
const cgSay = (X, a, neg) => vName(cgWho(X)) + (neg ? ' non' : '') + ' vuole che ' + vName(cgOther(cgWho(X))) + ' ' + cgDo(a || cgAct(X));
const cgQ = (X) => 'Che cosa vuole ' + vName(cgWho(X)) + '?';
const cgOtherAct = (X) => pick(Object.keys(CG_SUB).filter(a => a !== cgAct(X)));

/* ---------- Figura: chi vuole, e nella nuvoletta con il cuore l'altro che fa la cosa ---------- */
function cgFig(X) {
  const k2 = p3Key(cgOther(cgWho(X))), L2 = (typeof LOOKS !== 'undefined' && LOOKS[k2]) || null;
  return psMemFig(cgWho(X), () => L2 && typeof calScene === 'function' ? calScene(cgAct(X), L2) : '', null, 'want');
}
Object.keys(CG).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cgFig(X) }); });

const SCG = gTag('cg', {
  present: (X) => { const p = cgSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: cgSay(X) + '?', model: 'Sì, ' + cgSay(X) + '.' }),
  neg: (X) => { const o = cgOtherAct(X); return { type: 'neg', show: X, ask: o, prompt: cgSay(X, o) + '?', model: 'No, ' + cgSay(X, o, true) + '.', complete: cgSay(X) + '.' }; },
  alt: (X) => { const o = cgOtherAct(X), ord = Math.random() < 0.5 ? [cgAct(X), o] : [o, cgAct(X)];
    return { type: 'alt', show: X, prompt: cgSay(X, ord[0]) + ' o che ' + cgDo(ord[1]) + '?', model: cgSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: cgQ(X), model: cgSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: cgQ(X) + ' ' + cgSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cgQ(X), model: cgQ(X) })
});

/* ---------- Capire le frasi: «(Mario) (non) vuole che (Anna) cucini» ---------- */
const CG_FORM = {};
Object.keys(CG_SUB).forEach(a => {
  CG_FORM[CG_SUB[a]] = { a: a, ok: true };
  [CAL_ACT[a].pres].concat(CAL_ACT[a].inf).forEach(w => { if (!CG_FORM[gNorm(w).trim()]) CG_FORM[gNorm(w).trim()] = { a: a, ok: false }; });
});
function cgStatements(s) {
  s = s.replace(/ (che )?cosa vuole [a-z]+ /g, ' # ');
  const names = vNames(), w = s.trim().split(' '), out = [];
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'vuole' || w[i + 1] !== 'che') continue;
    const neg = w[i - 1] === 'non', who = names[w[neg ? i - 2 : i - 1]] || null;
    let j = i + 2, doer = null;
    if (names[w[j]]) { doer = names[w[j]]; j++; } else if (w[j] === 'lui' || w[j] === 'lei') { doer = w[j] === 'lui' ? 'm' : 'f'; j++; }
    const f = CG_FORM[w[j]] || null;
    out.push({ neg: neg, who: who, doer: doer, a: f ? f.a : null, ok: !!f && f.ok });
  }
  // «… o che canti»: la seconda cosa nella domanda con «o» non è una frase
  return out;
}
const cgGood = (x, X) => x.ok && (x.who === null || x.who === cgWho(X)) && (x.doer === null || x.doer === cgOther(cgWho(X)));
function evaluateCg(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(cgQ(X)).trim()), full: true };
  const st = cgStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => cgGood(x, X) && x.a === cgAct(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && cgGood(neg[0], X) && neg[0].a === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskCg(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cgQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(cgQ(X)).trim())) return { ok: true, kind: 'what' };
  const st = cgStatements(s);
  if (st.length === 1 && cgGood(st[0], X)) return { ok: true, kind: st[0].a === cgAct(X) ? 'yes' : 'no', ask: st[0].a };
  if (st.length === 1 && st[0].a) return bad(cgSay(X, st[0].a) + '?');
  return bad();
}
function answerAskCg(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + cgSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + cgSay(X, r.ask, true) + '. ' + cgSay(X) + '.';
  return cgSay(X) + '.';
}
gInstall('cg', isCg, SCG, evaluateCg, evalAskCg, answerAskCg);
