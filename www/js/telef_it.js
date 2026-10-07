'use strict';
/* =====================================================================
   CAPITOLO 14: «Al telefono» (lezione 74, livello 3). Si carica dopo verbs_it.js, fam_it.js e bigl_it.js (le persone).
   Qualcuno telefona (il telefono all'orecchio e il fumetto con «Pronto, sono …» che esce dalla bocca): Mario, Anna, Carlo Rossi, Lucia Rossi, il nonno, la nonna.
     Pronto, sono Max.                → ripete
     Chi parla?                       → Parla Max.   (va bene anche «È Max.»)
     Parla Isa?                       → No, non parla Isa.
     Parla Mario o Carlo?             → Parla Mario.
     Parla il nonno?                  → Sì, parla il nonno.
   Il punto: al telefono «Pronto, sono …», e chi ascolta chiede «Chi parla?». «Pronto» e «parla» sottolineati.
   Errori: la persona sbagliata, «parla nonno» (senza «il»), «sono Max» come risposta a «Chi parla?».
   ===================================================================== */

const TL = { tl_m: 1, tl_f: 1, tl_marco: 1, tl_anna: 1, tl_nonno: 1, tl_nonna: 1 };
const isTl = (X) => !!TL[X];
const tlWho = (X) => X.slice(3);
// il nome (con «il / la» per il nonno e la nonna) e la faccia
const tlName = (k) => k === 'm' ? vName('m') : k === 'f' ? vName('f') : k === 'marco' ? 'Carlo' : k === 'anna' ? 'Lucia' : k === 'nonno' ? 'il nonno' : 'la nonna';
const tlLook = (k) => {
  if (k === 'm' || k === 'f') { const key = p3Key(k); return (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[key] ? (TEACHERS[key].look || key) : key]) || null; }
  return typeof FAM_LOOK !== 'undefined' ? FAM_LOOK[{ marco: 'f_padre', anna: 'f_madre', nonno: 'f_nonno', nonna: 'f_nonna' }[k]] : null;
};
const tlSays = (X) => 'Pronto, sono ' + tlName(tlWho(X)) + '.';
const tlIs = (k, neg) => (neg ? 'non ' : '') + 'parla ' + tlName(k);                    // «parla Max», «parla il nonno»
const TL_Q = 'Chi parla?';
const tlOther = (X) => pick(Object.keys(TL).map(tlWho).filter(k => k !== tlWho(X)));

/* ---------- Figura: la persona al telefono (il telefono all'orecchio: «Pronto» si dice solo al telefono) e il fumetto con le parole dalla bocca ---------- */
function tlFig(X) {
  const LK = tlLook(tlWho(X));
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="62" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' +
    // al telefono (lezione 74): il telefono all'orecchio (senza le onde) e il fumetto con le parole
    '<g transform="translate(12 0)">' + V_SCENE.phone(LK).replace(/<path d="M70 14[^>]*\/>/, '') + '</g>' + tlTalk(X) + '</svg>';
}
// il fumetto che esce dalla bocca (Massi): dentro parole già conosciute (un ripasso da leggere), non «bla bla».
// box = [x, y, larghezza, altezza], tail = [x, y] la punta verso la bocca; le parole escono dalla bocca, restano da leggere, poi ricominciano.
function sayBubble(box, tail, lines, size) {
  const [x, y, w, h] = box, cx = x + w / 2, by = y + h, tx = Math.min(Math.max(tail[0], x + 8), x + w - 8);
  const path = 'M' + (x + 6) + ' ' + y + ' h' + (w - 12) + ' a6 6 0 0 1 6 6 v' + (h - 12) + ' a6 6 0 0 1 -6 6 H' + (tx + 4) + ' L' + tail[0] + ' ' + tail[1] + ' L' + (tx - 4) + ' ' + by +
    ' H' + (x + 6) + ' a6 6 0 0 1 -6 -6 v' + (12 - h) + ' a6 6 0 0 1 6 -6z';
  const top = y + h / 2 - (lines.length - 1) * size * .6 + size * .35;
  const text = lines.map((t, i) => '<text x="' + cx + '" y="' + (top + i * size * 1.2).toFixed(1) + '" text-anchor="middle" font-family="Georgia,serif" font-size="' + size + '" font-weight="bold" fill="#2a3346">' + t + '</text>').join('');
  const dx = tail[0] - cx, dy = tail[1] - (y + h / 2);
  return '<path d="' + path + '" fill="#f3eee2" stroke="#c9a45c" stroke-width="1.2"/><g>' + text +
    '<animateTransform attributeName="transform" type="translate" values="' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ';0 0;0 0" keyTimes="0;.12;1" dur="3.5s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.94;1" dur="3.5s" repeatCount="indefinite"/></g>';
}
// lezione 74: nel fumetto quello che dice: «Pronto, sono Max.»
const tlTalk = (X) => sayBubble([1, 2, 44, 26], [53, 33], ['Pronto,', 'sono ' + tlName(tlWho(X)) + '.'], tlName(tlWho(X)).length > 6 ? 6.6 : 7.5);
Object.keys(TL).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => tlFig(X) }); });

const STL = gTag('tl', {
  present: (X) => { const p = tlSays(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: gCap(tlIs(tlWho(X))) + '?', model: 'Sì, ' + tlIs(tlWho(X)) + '.' }),
  neg: (X) => { const o = tlOther(X); return { type: 'neg', show: X, ask: o, prompt: gCap(tlIs(o)) + '?', model: 'No, ' + tlIs(o, true) + '.', complete: gCap(tlIs(tlWho(X))) + '.' }; },
  alt: (X) => { const o = tlOther(X), ord = Math.random() < 0.5 ? [tlWho(X), o] : [o, tlWho(X)];
    return { type: 'alt', show: X, prompt: gCap(tlIs(ord[0])) + ' o ' + tlName(ord[1]) + '?', model: gCap(tlIs(tlWho(X))) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: TL_Q, model: gCap(tlIs(tlWho(X))) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: tlSays(X) + ' ' + TL_Q + ' ' + gCap(tlIs(tlWho(X))) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: TL_Q, model: TL_Q })
});

/* ---------- Capire le frasi: «(non) parla Max», «è il nonno», «pronto, sono Max» ---------- */
function tlWhoIs(w1, w2) {
  const names = vNames();
  if (names[w1]) return { k: names[w1], n: 1 };
  if (w1 === 'carlo' || w1 === 'lucia') return { k: w1 === 'carlo' ? 'marco' : 'anna', n: 1 };   // le chiavi marco / anna: i nomi detti sono Carlo e Lucia
  if (/^(il|la)$/.test(w1) && /^(nonno|nonna)$/.test(w2)) return { k: w2, n: 2, ok: (w1 === 'il') === (w2 === 'nonno') };
  if (/^(nonno|nonna)$/.test(w1)) return { k: w1, n: 1, ok: false };          // senza «il / la»
  return null;
}
function tlStatements(s) {
  s = s.replace(/ chi parla /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (!/^(parla|e|sono)$/.test(w[i])) continue;
    const p = tlWhoIs(w[i + 1], w[i + 2]);
    if (!p) continue;
    out.push({ verb: w[i], k: p.k, ok: p.ok !== false, neg: w[i - 1] === 'non' });
  }
  return out;
}
function tlEvaluate(step, text) {
  const s = gNorm(text), X = step.show, W = tlWho(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'chi parla'), full: true };
  const st = tlStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  // chi telefona dice «sono …»; chi ascolta dice «parla …» (o «è …»)
  const truth = (x, echo) => x.ok && x.k === W && (echo ? x.verb === 'sono' : x.verb !== 'sono');
  if (step.type === 'echo') return { ok: has(s, 'pronto') && pos.some(x => truth(x, true)) && pos.every(x => truth(x, true)), full: true };
  const allPos = pos.every(x => truth(x));
  switch (step.type) {
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(x => truth(x)) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].k === step.ask && neg[0].verb !== 'sono' && allPos, full: pos.some(x => truth(x)) };
    default: return { ok: pos.some(x => truth(x)) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo: «Chi parla?» (→ «Pronto, sono Max.»), «Parla Max?»
function tlEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || TL_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'chi parla')) return { ok: true, kind: 'what' };
  const st = tlStatements(s).filter(x => x.verb !== 'sono');
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].k === tlWho(X) ? 'yes' : 'no', k: st[0].k };
  return bad();
}
function tlAnswerAsk(X, r) {
  if (r.kind === 'what') return tlSays(X);
  if (r.kind === 'yes') return 'Sì, ' + tlIs(tlWho(X)) + '.';
  return 'No, ' + tlIs(r.k, true) + '. ' + gCap(tlIs(tlWho(X))) + '.';
}
gInstall('tl', isTl, STL, tlEvaluate, tlEvalAsk, tlAnswerAsk);
