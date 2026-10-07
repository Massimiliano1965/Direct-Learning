'use strict';
/* =====================================================================
   CAPITOLO 8: «Verbi al presente: loro» (lezione 53, livello 2). Si carica dopo verbs_it.js e perche_it.js (le scene).
   Max e Isa fanno la stessa cosa, insieme (le scene delle lezioni 23 e 24, una accanto all'altra):
     Max e Isa leggono un libro.                        → ripete
     Max e Isa leggono un libro?                        → Sì, Max e Isa leggono un libro.
     Max e Isa mangiano un'arancia?                     → No, Max e Isa non mangiano un'arancia.
     Max e Isa leggono un libro o bevono un'aranciata?  → Max e Isa leggono un libro.
     Che cosa fanno Max e Isa?                          → Max e Isa leggono un libro.   (va bene anche «Leggono un libro.»)
   Il punto: lui legge → loro leggono; -are → -ano (mangiano, telefonano), -ere → -ono (leggono, bevono, scrivono).
   Errori: il singolare («Max e Isa legge»), «mangiono», «leggano», il verbo sbagliato.
   ===================================================================== */

const LO_ACT = {
  read:  { v: 'leggono',    wrong: ['leggano', 'leggiono'] },
  eat:   { v: 'mangiano',   wrong: ['mangiono', 'mangono'] },
  drink: { v: 'bevono',     wrong: ['bevano', 'beveno'] },
  phone: { v: 'telefonano', wrong: ['telefonono'] },
  write: { v: 'scrivono',   wrong: ['scrivano'] }
};
const LO_FORM = {};
Object.keys(LO_ACT).forEach(a => { LO_FORM[LO_ACT[a].v] = { act: a, ok: true }; LO_ACT[a].wrong.forEach(w => { LO_FORM[w] = { act: a, ok: false }; }); });
// il singolare (lezione 23): si riconosce, ma qui è sbagliato
Object.keys(VFORM).forEach(w => { if (!LO_FORM[w] && LO_ACT[VFORM[w].act]) LO_FORM[w] = { act: VFORM[w].act, ok: false }; });
['scrive', 'scrivo', 'scrivi', 'scrivere'].forEach(w => { LO_FORM[w] = { act: 'write', ok: false }; });
const LO = { lo_read: 1, lo_eat: 1, lo_drink: 1, lo_phone: 1, lo_write: 1 };
const isLo = (X) => !!LO[X];
const loAct = (X) => X.slice(3);
const loWho = () => vName('m') + ' e ' + vName('f');
const loDoes = (a) => LO_ACT[a].v + (ACTS[a] && ACTS[a].obj ? ' ' + vObj(a) : '');         // «leggono un libro»
const loSay = (a) => loWho() + ' ' + loDoes(a);                                            // «Max e Isa leggono un libro»
const loQ = () => 'Che cosa fanno ' + loWho() + '?';
const loOther = (X) => pick(Object.keys(LO_ACT).filter(a => a !== loAct(X)));

/* ---------- Figura: i due colleghi, uno accanto all'altro, che fanno la stessa cosa ---------- */
function loFig(X) {
  const look = (w) => { const k = p3Key(w); return (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null; };
  const m = look('m'), f = look('f');
  if (!m || !f || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const a = loAct(X);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="96" rx="44" ry="3" fill="#000" opacity=".25"/>' +
    '<g transform="translate(-14 16) scale(.82)">' + V_SCENE[a](m) + '</g><g transform="translate(32 16) scale(.82)">' + V_SCENE[a](f) + '</g></svg>';
}
Object.keys(LO).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => loFig(X) }); });

const SLO = gTag('lo', {
  present: (X) => { const p = loSay(loAct(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: loSay(loAct(X)) + '?', model: 'Sì, ' + loSay(loAct(X)) + '.' }),
  neg: (X) => { const o = loOther(X);
    return { type: 'neg', show: X, ask: o, prompt: loSay(o) + '?', model: 'No, ' + loWho() + ' non ' + loDoes(o) + '.', complete: loSay(loAct(X)) + '.' }; },
  alt: (X) => { const o = loOther(X), ord = Math.random() < 0.5 ? [loAct(X), o] : [o, loAct(X)];
    return { type: 'alt', show: X, prompt: loSay(ord[0]) + ' o ' + loDoes(ord[1]) + '?', model: loSay(loAct(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: loQ(), model: loSay(loAct(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: loQ() + ' ' + loSay(loAct(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: loQ(), model: loQ() })
});

/* ---------- Capire le frasi: «(Max e Isa / loro) (non) leggono (un libro)» ---------- */
function loStatements(s) {
  s = s.replace(/ (che )?cosa fanno [a-z]+ e [a-z]+ /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = LO_FORM[w[i]];
    if (!f) continue;
    if (f.act === 'phone' && /^(il|un)$/.test(w[i - 1] || '')) continue;      // «il telefono»: la cosa, non il verbo
    const neg = w[i - 1] === 'non';
    const want = ACTS[f.act] && ACTS[f.act].obj ? gNorm(vObj(f.act)).trim() : '', n = want ? want.split(' ').length : 0;
    const after = w.slice(i + 1, i + 1 + n).join(' ');
    const objOk = !want || after === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '');
    out.push({ act: f.act, ok: f.ok && objOk, neg: neg });
  }
  return out;
}
function loEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'cosa fanno'), full: true };
  const st = loStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && x.act === loAct(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o') && !has(s, 'cosa fanno'), full: true };
  }
}
function loEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || loQ() });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa fanno')) return { ok: true, kind: 'what' };
  const st = loStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === loAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(loSay(st[0].act) + '?');
  return bad();
}
function loAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + loSay(loAct(X)) + '.';
  if (r.kind === 'no') return 'No, ' + loWho() + ' non ' + loDoes(r.ask) + '. ' + loSay(loAct(X)) + '.';
  return loSay(loAct(X)) + '.';
}
gInstall('lo', isLo, SLO, loEvaluate, loEvalAsk, loAnswerAsk);
