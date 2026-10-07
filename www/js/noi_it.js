'use strict';
/* =====================================================================
   CAPITOLO 8: «Verbi al presente: noi e voi» (lezione 54, livello 2). Si carica dopo loro_it.js.
   L'insegnante e Max fanno la stessa cosa (l'insegnante a sinistra, Max a destra). L'insegnante dice «noi»,
   l'allievo risponde «voi»:
     Io e Max leggiamo un libro.                         → ripete
     Io e Max leggiamo un libro?                         → Sì, voi leggete un libro.
     Io e Max mangiamo un'arancia?                       → No, voi non mangiate un'arancia.
     Io e Max leggiamo un libro o beviamo un'aranciata?  → Voi leggete un libro.
     Che cosa facciamo io e Max?                         → Voi leggete un libro.   (va bene anche «Leggete un libro.»)
   Il punto: noi → -iamo (leggiamo, mangiamo); voi → -ate / -ete (mangiate, telefonate; leggete, bevete, scrivete).
   Errori: «Noi leggiamo» nella risposta (è l'insegnante che dice «noi»), «leggono», «legge», «leggiate», il verbo sbagliato.
   ===================================================================== */

const NV_ACT = {
  read:  { noi: 'leggiamo',    voi: 'leggete' },
  eat:   { noi: 'mangiamo',    voi: 'mangiate' },
  drink: { noi: 'beviamo',     voi: 'bevete' },
  phone: { noi: 'telefoniamo', voi: 'telefonate' },
  write: { noi: 'scriviamo',   voi: 'scrivete' }
};
// tutte le forme: p = 'noi' / 'voi' / 'x' (le altre persone: qui sbagliate)
const NV_FORM = {};
Object.keys(LO_FORM).forEach(w => { NV_FORM[w] = { act: LO_FORM[w].act, p: 'x' }; });
Object.keys(NV_ACT).forEach(a => { NV_FORM[NV_ACT[a].noi] = { act: a, p: 'noi' }; NV_FORM[NV_ACT[a].voi] = { act: a, p: 'voi' }; });
['leggiate', 'mangiete', 'bevate', 'scrivate', 'telefonete'].forEach(w => { NV_FORM[w] = { act: 'read', p: 'x' }; });
const NV = { nv_read: 1, nv_eat: 1, nv_drink: 1, nv_phone: 1, nv_write: 1 };
const isNv = (X) => !!NV[X];
const nvAct = (X) => X.slice(3);
const nvObj = (a) => ACTS[a] && ACTS[a].obj ? ' ' + vObj(a) : '';
const nvWe = (a) => 'Io e ' + vName('m') + ' ' + NV_ACT[a].noi + nvObj(a);           // «Io e Max leggiamo un libro»
const nvYou = (a, neg) => 'voi ' + (neg ? 'non ' : '') + NV_ACT[a].voi + nvObj(a);    // «voi leggete un libro»
const nvQ = () => 'Che cosa facciamo io e ' + vName('m') + '?';
const nvOther = (X) => pick(Object.keys(NV_ACT).filter(a => a !== nvAct(X)));

/* ---------- Figura: l'insegnante (a sinistra) e Max (a destra), che fanno la stessa cosa ---------- */
function nvFig(X) {
  const tk = typeof selectedTeacherKey === 'function' ? selectedTeacherKey() : 'luca';
  const look = (k) => (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  const t = look(tk), m = look(p3Key('m'));
  if (!t || !m || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const a = nvAct(X);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="96" rx="44" ry="3" fill="#000" opacity=".25"/>' +
    '<g transform="translate(-14 16) scale(.82)">' + V_SCENE[a](t) + '</g><g transform="translate(32 16) scale(.82)">' + V_SCENE[a](m) + '</g></svg>';
}
Object.keys(NV).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => nvFig(X) }); });

const SNV = gTag('nv', {
  present: (X) => { const p = nvWe(nvAct(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: nvWe(nvAct(X)) + '?', model: 'Sì, ' + nvYou(nvAct(X)) + '.' }),
  neg: (X) => { const o = nvOther(X);
    return { type: 'neg', show: X, ask: o, prompt: nvWe(o) + '?', model: 'No, ' + nvYou(o, true) + '.', complete: gCap(nvYou(nvAct(X))) + '.' }; },
  alt: (X) => { const o = nvOther(X), ord = Math.random() < 0.5 ? [nvAct(X), o] : [o, nvAct(X)];
    return { type: 'alt', show: X, prompt: nvWe(ord[0]) + ' o ' + NV_ACT[ord[1]].noi + nvObj(ord[1]) + '?', model: gCap(nvYou(nvAct(X))) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: nvQ(), model: gCap(nvYou(nvAct(X))) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: nvQ() + ' ' + gCap(nvYou(nvAct(X))) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: nvQ(), model: nvQ() })
});

/* ---------- Capire le frasi: «(voi) (non) leggete (un libro)»; nella frase da ripetere «io e Max leggiamo» ---------- */
function nvStatements(s) {
  s = s.replace(/ (che )?cosa facciamo io e [a-z]+ /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = NV_FORM[w[i]];
    if (!f) continue;
    if (f.act === 'phone' && /^(il|un)$/.test(w[i - 1] || '')) continue;
    const neg = w[i - 1] === 'non';
    const want = ACTS[f.act] && ACTS[f.act].obj ? gNorm(vObj(f.act)).trim() : '', n = want ? want.split(' ').length : 0;
    const objOk = !want || w.slice(i + 1, i + 1 + n).join(' ') === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '');
    out.push({ act: f.act, p: f.p, ok: objOk, neg: neg });
  }
  return out;
}
function nvEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'cosa facciamo'), full: true };
  const st = nvStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const p = step.type === 'echo' ? 'noi' : 'voi';                    // si ripete «noi»; si risponde «voi»
  const truth = (x) => x.ok && x.p === p && x.act === nvAct(X), allPos = pos.every(truth);
  if (step.type !== 'echo' && (has(s, 'noi') || has(s, 'io'))) return { ok: false, full: false };
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].p === 'voi' && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo chiede all'insegnante: «Che cosa fate voi?» / «Voi leggete un libro?» → l'insegnante risponde con «noi»
function nvEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || 'Che cosa fate?' });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa fate')) return { ok: true, kind: 'what' };
  const st = nvStatements(s);
  if (st.length === 1 && st[0].ok && st[0].p === 'voi') return { ok: true, kind: st[0].act === nvAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(gCap(nvYou(st[0].act)) + '?');
  return bad();
}
function nvAnswerAsk(X, r) {
  const we = (a, neg) => 'noi ' + (neg ? 'non ' : '') + NV_ACT[a].noi + nvObj(a);
  if (r.kind === 'yes') return 'Sì, ' + we(nvAct(X)) + '.';
  if (r.kind === 'no') return 'No, ' + we(r.ask, true) + '. ' + gCap(we(nvAct(X))) + '.';
  return gCap(we(nvAct(X))) + '.';
}
gInstall('nv', isNv, SNV, nvEvaluate, nvEvalAsk, nvAnswerAsk);
