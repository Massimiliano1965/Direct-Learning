'use strict';
/* =====================================================================
   CAPITOLO 6: «Imperativo» (lezione 42), con il Lei. Si carica dopo verbs_it.js e perche_it.js (le scene).
   Un collega dice all'altro che cosa fare; nella nuvoletta si vede l'azione (le scene della lezione 23):
     Isa dice: «Apra la porta!»                      → ripete
     Che cosa dice Isa?                              → Apra la porta!
     Isa dice «Apra la porta»?                       → Sì, Isa dice: «Apra la porta!»
     Isa dice «Chiuda la finestra»?                  → No, Isa non dice: «Chiuda la finestra!»
     Isa dice «Apra la porta» o «Legga il libro»?    → Apra la porta!
   Il punto: con il Lei, -are → -i (mangi, telefoni), -ere / -ire → -a (apra, chiuda, legga, beva). Il verbo sottolineato.
   Errori: «apre» (il presente), «apri» (il tu), «aprire», la cosa sbagliata.
   ===================================================================== */

const IMP_ACT = {
  open:  { imp: 'apra',     obj: 'la porta',       wrong: ['apri', 'apre', 'aprire', 'aprite'] },
  close: { imp: 'chiuda',   obj: 'la finestra',    wrong: ['chiudi', 'chiude', 'chiudere'] },
  read:  { imp: 'legga',    obj: 'il libro',       wrong: ['leggi', 'legge', 'leggere'] },
  drink: { imp: 'beva',     obj: 'l\'aranciata',   wrong: ['bevi', 'beve', 'bere'] },
  eat:   { imp: 'mangi',    obj: 'l\'arancia',     wrong: ['mangia', 'mangiare', 'mangio'] },
  phone: { imp: 'telefoni', obj: '',               wrong: ['telefona', 'telefonare', 'telefono'] }
};
const IMP_FORM = {};
Object.keys(IMP_ACT).forEach(a => { IMP_FORM[IMP_ACT[a].imp] = { act: a, ok: true }; IMP_ACT[a].wrong.forEach(w => { IMP_FORM[w] = { act: a, ok: false }; }); });
const IMP = { im_f_open: 1, im_m_close: 1, im_f_read: 1, im_m_drink: 1, im_f_eat: 1, im_m_phone: 1 };
const isImp = (X) => !!IMP[X];
const imWho = (X) => X.charAt(3);
const imAct = (X) => X.slice(5);
const imName = (X) => vName(imWho(X));
const imOrder = (a) => gCap(IMP_ACT[a].imp) + (IMP_ACT[a].obj ? ' ' + IMP_ACT[a].obj : '');           // «Apra la porta»
const imSay = (X) => imName(X) + ' dice: «' + imOrder(imAct(X)) + '!»';
const imQ = (X) => 'Che cosa dice ' + imName(X) + '?';
const imOther = (X) => imAct(X) === 'open' ? 'close' : imAct(X) === 'close' ? 'open' : pick(Object.keys(IMP_ACT).filter(a => a !== imAct(X)));

/* ---------- Figura: chi parla (a sinistra, indica) e, nella nuvoletta, l'altro collega che fa la cosa ---------- */
function impFig(X) {
  const w = imWho(X), k = p3Key(w), k2 = p3Key(w === 'm' ? 'f' : 'm');
  const LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  const LK2 = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k2] ? (TEACHERS[k2].look || k2) : k2]) || null;
  if (!LK || !LK2 || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const scene = inner('<svg>' + V_SCENE[imAct(X)](LK2) + '</svg>');
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [80, 50], [92, 42], [4, -3]), { mouth: 'talk' }, -20) +
    '<path d="M44 26 l10 -4 l-2 8z" fill="#f3eee2"/><rect x="50" y="1" width="49" height="49" rx="12" fill="#f3eee2"/><rect x="52.5" y="3.5" width="44" height="44" rx="10" fill="#1d2638"/>' +
    '<g transform="translate(53 4) scale(.43)">' + scene + '</g></svg>';
}
Object.keys(IMP).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => impFig(X) }); });

const SIM = gTag('imp', {
  present: (X) => { const p = imSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: imName(X) + ' dice «' + imOrder(imAct(X)) + '»?', model: 'Sì, ' + imSay(X) }),
  neg: (X) => { const o = imOther(X);
    return { type: 'neg', show: X, ask: o, prompt: imName(X) + ' dice «' + imOrder(o) + '»?', model: 'No, ' + imName(X) + ' non dice: «' + imOrder(o) + '!»', complete: imOrder(imAct(X)) + '!' }; },
  alt: (X) => { const o = imOther(X), ord = Math.random() < 0.5 ? [imAct(X), o] : [o, imAct(X)];
    return { type: 'alt', show: X, prompt: imName(X) + ' dice «' + imOrder(ord[0]) + '» o «' + imOrder(ord[1]) + '»?', model: imOrder(imAct(X)) + '!' }; },
  key: (X) => ({ type: 'key', show: X, prompt: imQ(X), model: imOrder(imAct(X)) + '!' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: imQ(X) + ' ' + imOrder(imAct(X)) + '!', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: imQ(X), model: imQ(X) })
});

/* ---------- Capire le frasi: gli ordini detti («apra la porta»), con o senza «Isa dice», anche con «non dice» ---------- */
function impOrders(s) {
  s = s.replace(/ che cosa dice [a-z]+ /g, ' # ');
  const out = [], w = s.trim().split(' ');
  let neg = false;
  for (let i = 0; i < w.length; i++) {
    if (w[i] === 'dice') neg = w[i - 1] === 'non';   // «non dice» vale fino al prossimo «dice»
    const f = IMP_FORM[w[i]];
    if (!f) continue;
    // la cosa dopo il verbo, se c'è, deve essere quella giusta («apra la porta», non «apra la finestra»)
    const want = gNorm(IMP_ACT[f.act].obj).trim(), after = w.slice(i + 1, i + 1 + (want ? want.split(' ').length : 0)).join(' ');
    const objOk = !want || after === want || !/^(il|la|lo|l|un|una)$/.test(w[i + 1] || '');
    out.push({ act: f.act, ok: f.ok && objOk, neg: neg });
  }
  return out;
}
function impEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(imQ(X)).trim()), full: true };
  const st = impOrders(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && x.act === imAct(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.ok && x.act === step.ask) && !neg.some(x => x.act === imAct(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa dice'), full: true };
  }
}
function impEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || imQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa dice')) return has(s, norm(vName(imWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = impOrders(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === imAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(imName(X) + ' dice «' + imOrder(st[0].act) + '»?');
  return bad();
}
function impAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + imSay(X);
  if (r.kind === 'no') return 'No, ' + imName(X) + ' non dice: «' + imOrder(r.ask) + '!» ' + imSay(X);
  return imOrder(imAct(X)) + '!';
}
gInstall('imp', isImp, SIM, impEvaluate, impEvalAsk, impAnswerAsk);
