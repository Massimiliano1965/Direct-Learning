'use strict';
/* =====================================================================
   CAPITOLO 20: «Espressioni per il turista» (lezione 100, livello 4). Si carica dopo telef_it.js (il fumetto) e scelta_it.js (le cose).
   Mario o Anna in viaggio; nel fumetto non ci sono parole, c'è il disegno di quello che chiede (la stazione, il cartellino del prezzo…):
     Mario dice: «Scusi, dov'è la stazione?»          → ripete
     Che cosa dice Mario?                              → Scusi, dov'è la stazione?
     Anna dice «Quanto costa?»?                        → Sì, Anna dice: «Quanto costa?»
     Anna dice «Il conto, per favore»?                 → No, Anna non dice: «Il conto, per favore.»
   Le frasi: Scusi, dov'è la stazione? — Quanto costa? — Il conto, per favore. — Parla inglese? — Mi può aiutare? — Un biglietto per Roma, per favore.
   Agli sconosciuti si dà sempre del Lei (scusi, parla, può).
   ===================================================================== */

const TUR = {
  stazione: { say: 'Scusi, dov\'è la stazione?', need: ['dov', 'la stazione'] },
  costa:    { say: 'Quanto costa?', need: ['quanto costa'] },
  conto:    { say: 'Il conto, per favore.', need: ['il conto'] },
  inglese:  { say: 'Parla inglese?', need: ['parla inglese'] },
  aiuto:    { say: 'Mi può aiutare?', need: ['mi puo aiutare'] },
  biglietto: { say: 'Un biglietto per Roma, per favore.', need: ['un biglietto per roma'] }
};
const TU = { tu_m_stazione: 1, tu_f_costa: 1, tu_m_conto: 1, tu_f_inglese: 1, tu_m_aiuto: 1, tu_f_biglietto: 1 };
const isTu = (X) => !!TU[X];
const tuWho = (X) => X.charAt(3);
const tuK = (X) => X.slice(5);
const tuName = (X) => vName(tuWho(X));
const tuQuote = (k) => '«' + TUR[k].say + '»';
const tuSay = (X, k, neg) => tuName(X) + (neg ? ' non' : '') + ' dice: ' + tuQuote(k || tuK(X));
const tuQ = (X) => 'Che cosa dice ' + tuName(X) + '?';
const tuOther = (X) => pick(Object.keys(TUR).filter(k => k !== tuK(X)));

/* ---------- Figure: la persona e il fumetto con il disegno di quello che chiede ---------- */
const TU_ICON = {
  stazione: '<rect x="-16" y="-6" width="32" height="14" rx="3" fill="#d23c44"/><rect x="-12" y="-3" width="7" height="5" fill="#2a3346"/><rect x="-2" y="-3" width="7" height="5" fill="#2a3346"/><rect x="8" y="-3" width="5" height="5" fill="#2a3346"/>' +
    '<circle cx="-9" cy="10" r="2.4" fill="#3a3f4a"/><circle cx="9" cy="10" r="2.4" fill="#3a3f4a"/><text x="0" y="-11" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#c9a45c">?</text>',
  costa: '<path d="M-14 -8 h18 l10 10 l-10 10 h-18z" fill="#f3d36b" stroke="#8e6a2a" stroke-width="1"/><circle cx="-10" cy="2" r="2" fill="#2a3346"/><text x="2" y="6" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="#2a3346">€?</text>',
  conto: '<path d="M-10 -14 h20 v28 l-3 -2 l-3 2 l-3 -2 l-3 2 l-3 -2 l-3 2z" fill="#f3eee2" stroke="#c9c1ad" stroke-width="1"/><path d="M-6 -8 h12 M-6 -3 h9 M-6 2 h11" stroke="#a9a089" stroke-width="1.2"/><text x="5" y="11" text-anchor="end" font-family="Georgia,serif" font-size="6" font-weight="bold" fill="#2a3346">€</text>',
  inglese: '<g transform="translate(-14 -10) scale(.28 .2)">' + (typeof FLAG !== 'undefined' ? FLAG.inghilterra : '') + '</g><rect x="-14" y="-10" width="28" height="20" fill="none" stroke="#8d93a3" stroke-width=".8"/><text x="0" y="-13" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="#c9a45c">?</text>',
  aiuto: '<rect x="-15" y="-11" width="30" height="22" rx="2" fill="#f3eee2"/><path d="M-15 -11 l10 4 l10 -4 l10 4 v22 l-10 -4 l-10 4 l-10 -4z" fill="#dfe8d0" stroke="#a9a089" stroke-width=".8"/><path d="M-9 4 q6 -10 14 -2" stroke="#d23c44" stroke-width="1.4" fill="none" stroke-dasharray="2 1.4"/><circle cx="6" cy="3" r="2" fill="#d23c44"/>',
  biglietto: '<rect x="-17" y="-9" width="34" height="18" rx="2" fill="#f3eee2" stroke="#c9c1ad" stroke-width="1"/><rect x="-17" y="-9" width="34" height="5" rx="2" fill="#c8323b"/><text x="0" y="6" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" font-weight="bold" fill="#2a3346">ROMA</text>'
};
function tuFig(X) {
  const k = p3Key(tuWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="38" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 56], [80, 46]), { mouth: 'talk' }, -12) +
    '<path d="M54 8 h38 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-24 l-14 10 l4 -10 h-4 a6 6 0 0 1 -6 -6 v-24 a6 6 0 0 1 6 -6z" fill="#f3eee2" stroke="#c9a45c" stroke-width="1.2"/>' +
    '<g transform="translate(72 27)">' + TU_ICON[tuK(X)] + '</g></svg>';
}
Object.keys(TU).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => tuFig(X) }); });

const STU = gTag('tu', {
  present: (X) => { const p = tuSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: tuName(X) + ' dice ' + tuQuote(tuK(X)).replace(/[.?]»$/, '»') + '?', model: 'Sì, ' + tuSay(X) }),
  neg: (X) => { const o = tuOther(X); return { type: 'neg', show: X, ask: o, prompt: tuName(X) + ' dice ' + tuQuote(o).replace(/[.?]»$/, '»') + '?', model: 'No, ' + tuSay(X, o, true), complete: TUR[tuK(X)].say }; },
  alt: (X) => { const o = tuOther(X), ord = Math.random() < 0.5 ? [tuK(X), o] : [o, tuK(X)];
    return { type: 'alt', show: X, prompt: tuName(X) + ' dice ' + tuQuote(ord[0]).replace(/[.?]»$/, '»') + ' o ' + tuQuote(ord[1]).replace(/[.?]»$/, '»') + '?', model: TUR[tuK(X)].say }; },
  key: (X) => ({ type: 'key', show: X, prompt: tuQ(X), model: TUR[tuK(X)].say }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: tuQ(X) + ' ' + TUR[tuK(X)].say, model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: tuQ(X), model: tuQ(X) })
});

/* ---------- Capire: quali frasi ha detto, e se dopo «non dice» ---------- */
function tuSaid(s) {
  s = s.replace(/ (che )?cosa dice [a-z]+ /g, ' # ');
  const out = [];
  Object.keys(TUR).forEach(k => {
    const at = TUR[k].need.map(n => s.indexOf(' ' + n + ' ')), first = at.some(i => i < 0) ? -1 : Math.min(...at);
    if (first < 0 || !TUR[k].need.every(n => has(s, n))) return;
    const before = s.slice(0, first + 1), lastDice = before.lastIndexOf(' dice ');
    // «non dice» vale solo per la frase subito dopo (al massimo una parola in mezzo: «non dice: scusi, dov'è…»)
    const between = lastDice < 0 ? '' : before.slice(lastDice + 6).trim();
    out.push({ k: k, neg: lastDice > 0 && before.slice(0, lastDice + 1).endsWith(' non ') && between.split(' ').filter(Boolean).length <= 1 });
  });
  return out;
}
function evaluateTu(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(tuQ(X)).trim()), full: true };
  const st = tuSaid(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const who = Object.keys(vNames()).find(n => has(s, n)), whoOk = !who || vNames()[who] === tuWho(X);
  const truth = (x) => x.k === tuK(X), allPos = pos.every(truth) && whoOk;
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].k === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !/ o (quanto|il|parla|mi|un|scusi) /.test(s), full: true };
  }
}
function evalAskTu(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || tuQ(X) });
  if (has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa dice') || has(s, 'cosa dice')) return { ok: true, kind: 'what' };
  const st = tuSaid(s);
  if (st.length === 1) return { ok: true, kind: st[0].k === tuK(X) ? 'yes' : 'no', ask: st[0].k };
  return bad();
}
function answerAskTu(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + tuSay(X);
  if (r.kind === 'no') return 'No, ' + tuSay(X, r.ask, true) + ' ' + tuSay(X);
  return tuSay(X);
}
gInstall('tu', isTu, STU, evaluateTu, evalAskTu, answerAskTu);
