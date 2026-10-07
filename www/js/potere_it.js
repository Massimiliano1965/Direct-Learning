'use strict';
/* =====================================================================
   CAPITOLO 14: «Potere» (lezione 71, livello 3). Si carica dopo celha_it.js (le figure «ce l'ha / non ce l'ha») e volere_it.js.
   Chi ha la cosa può fare l'azione; chi non ce l'ha (la cosa nella nuvoletta, barrata) non può:
     Max ha la chiave. Può aprire la porta.               Isa non ha la chiave. Non può aprire la porta.     → ripete
     Max può aprire la porta?                             → Sì, può aprire la porta.
     Isa può aprire la porta?                             → No, non può aprire la porta.
     Max può telefonare?                                  → No, non può telefonare.   (ha la chiave, non il telefono)
   Il punto: «può» + il verbo intero (come «vuole», lezione 70). «può» sottolineato.
   Errori: «può apre», «posso», il sì e il no scambiati, il verbo sbagliato.
   ===================================================================== */

const PO_THING = { key: 'open', phone: 'phone', book: 'read' };                    // la cosa → l'azione che si può fare
const PO_DO = { open: 'aprire la porta', phone: 'telefonare', read: 'leggere il libro' };
const PO = { po_m_key_1: 1, po_f_key_0: 1, po_m_phone_1: 1, po_f_phone_0: 1, po_m_book_1: 1, po_f_book_0: 1 };
const isPo = (X) => !!PO[X];
const poWho = (X) => X.charAt(3);
const poThing = (X) => X.split('_')[2];
const poHas = (X) => X.slice(-1) === '1';
const poAct = (X) => PO_THING[poThing(X)];
const poName = (X) => vName(poWho(X));
const poCan = (a, neg) => (neg ? 'non ' : '') + 'può ' + PO_DO[a];                    // «può aprire la porta»
const poQ = (X, a) => poName(X) + ' può ' + PO_DO[a || poAct(X)] + '?';
const poAns = (a, yes) => (yes ? 'Sì, ' : 'No, ') + poCan(a, !yes) + '.';
const poSay = (X) => (poHas(X) ? poName(X) + ' ha ' + gThe(poThing(X), 1) + '. ' : poName(X) + ' non ha ' + gThe(poThing(X), 1) + '. ') + gCap(poCan(poAct(X), !poHas(X))) + '.';
const poOther = (X) => pick(Object.keys(PO_DO).filter(a => a !== poAct(X)));
Object.keys(PO).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => clFig('cl_' + poWho(X) + '_' + poThing(X) + '_' + (poHas(X) ? 1 : 0)) }); });

const SPO = gTag('po', {
  present: (X) => { const p = poSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  // la domanda sulla sua azione: sì (ha la cosa) o no
  yes: (X) => ({ type: poHas(X) ? 'yes' : 'neg', show: X, ask: poAct(X), prompt: poQ(X), model: poAns(poAct(X), poHas(X)), complete: '' }),
  // un'altra azione: no (non ha quella cosa)
  neg: (X) => { const o = poOther(X); return { type: 'neg', show: X, ask: o, prompt: poQ(X, o), model: poAns(o, false), complete: '' }; },
  alt: (X) => { const a = poAct(X), ord = Math.random() < 0.5 ? ['', 'non '] : ['non ', ''];
    return { type: 'alt', show: X, prompt: poName(X) + ' ' + ord[0] + 'può o ' + ord[1] + 'può ' + PO_DO[a] + '?', model: poName(X) + ' ' + poCan(a, !poHas(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, ask: poAct(X), prompt: poQ(X), model: poAns(poAct(X), poHas(X)) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: poQ(X) + ' ' + poAns(poAct(X), poHas(X)), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: poQ(X), model: poQ(X) })
});

/* ---------- Capire le frasi: «(non) può aprire (la porta)» ---------- */
const PO_WORD = { aprire: 'open', telefonare: 'phone', leggere: 'read' };
function poStatements(s) {
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (!/^(puo|posso|puoi|potere)$/.test(w[i])) continue;
    const a = PO_WORD[w[i + 1]] || (VFORM[w[i + 1]] && PO_DO[VFORM[w[i + 1]].act] ? VFORM[w[i + 1]].act : null);
    if (!a) continue;
    const neg = w[i - 1] === 'non', subj = names[w[neg ? i - 2 : i - 1]] || null;
    const want = gNorm(PO_DO[a]).trim().split(' ').slice(1).join(' ');
    const objOk = !want || w.slice(i + 2, i + 2 + want.split(' ').length).join(' ') === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 2] || '');
    out.push({ act: a, ok: w[i] === 'puo' && PO_WORD[w[i + 1]] === a && objOk, neg: neg, subj: subj });
  }
  return out;
}
function poEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const st = poStatements(s), yes = has(s, 'si'), no = has(s, 'no');
  // vera: «può» solo per la sua azione (se ha la cosa); per tutto il resto «non può»
  const okFor = (x) => x.ok && (x.subj === null || x.subj === poWho(X)) && (x.neg === !(x.act === poAct(X) && poHas(X)));
  if (!st.length || !st.every(okFor)) return { ok: false, full: false };
  if (step.type === 'echo' || step.type === 'alt') return { ok: st.some(x => x.act === poAct(X)) && !yes && !no, full: true };
  const about = st.find(x => x.act === step.ask);
  if (!about) return { ok: false, full: false };
  if (step.type === 'key') return { ok: about.neg ? !yes : !no, full: true };
  return { ok: about.neg ? no && !yes : yes && !no, full: true };
}
function poEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || poQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const st = poStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === poAct(X) && poHas(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(poQ(X, st[0].act));
  return bad();
}
function poAnswerAsk(X, r) { return r.kind === 'yes' ? poAns(poAct(X), true) : poAns(r.ask, false); }
gInstall('po', isPo, SPO, poEvaluate, poEvalAsk, poAnswerAsk);
