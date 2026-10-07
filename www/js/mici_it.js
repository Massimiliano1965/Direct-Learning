'use strict';
/* =====================================================================
   CAPITOLO 12: «Mi, Le, ci» (lezione 76, livello 3). Si carica dopo dare_it.js (lezione 55: gli / le) ed essere_it.js.
   Max o Isa danno una cosa all'insegnante («mi») oppure all'insegnante e all'allievo insieme («ci»: l'insegnante e la sagoma d'oro).
   L'insegnante dice «mi», l'allievo risponde con il Lei («Le»), come nelle lezioni 54 e 60:
     Max mi dà il libro.                    → ripete
     Che cosa mi dà Max?                    → Le dà il libro.
     Isa ci dà la tazza.                    → ripete
     Che cosa ci dà Isa?                    → Ci dà la tazza.
     Max mi dà la penna?                    → No, non Le dà la penna.
   Il punto: a me → mi (a Lei → Le), a noi → ci. «mi», «Le» e «ci» sottolineati.
   Errori: «Mi dà il libro» nella risposta (è l'insegnante che dice «mi»), «gli dà», «le» e «ci» scambiati, la cosa sbagliata.
   ===================================================================== */

const MC = { mc_m_me_book: 1, mc_f_us_cup: 1, mc_f_me_key: 1, mc_m_us_phone: 1, mc_m_me_pen: 1, mc_f_us_umbrella: 1 };
const isMc = (X) => !!MC[X];
const mcWho = (X) => X.charAt(3);
const mcUs = (X) => X.split('_')[2] === 'us';
const mcObj = (X) => X.split('_')[3];
const mcName = (X) => vName(mcWho(X));
const mcTeach = (X, o, neg) => mcName(X) + (neg ? ' non ' : ' ') + (mcUs(X) ? 'ci' : 'mi') + ' dà ' + daThe(o || mcObj(X));          // «Max mi dà il libro»
const mcAns = (X, o, neg) => (neg ? 'non ' : '') + (mcUs(X) ? 'ci' : 'Le') + ' dà ' + daThe(o || mcObj(X));                         // «Le dà il libro»
const mcQ = (X) => 'Che cosa ' + (mcUs(X) ? 'ci' : 'mi') + ' dà ' + mcName(X) + '?';
const mcOther = (X) => pick(Object.keys(MC).map(mcObj).filter(o => o !== mcObj(X)));

/* ---------- Figura: chi dà (a sinistra) e chi riceve: l'insegnante, o l'insegnante con la sagoma d'oro dell'allievo ---------- */
function mcFig(X) {
  const gk = p3Key(mcWho(X)), G = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[gk] ? (TEACHERS[gk].look || gk) : gk]) || null;
  const t = eTeacher(), T = (typeof LOOKS !== 'undefined' && LOOKS[t.look || t.key || 'luca']) || null;
  if (!G || !T || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const thing = inner(daFig1(mcObj(X))).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const you = mcUs(X) ? '<g transform="translate(90 60) scale(.36)"><circle cx="0" cy="-30" r="17" fill="#c9a45c"/><path d="M-32 34 q0 -40 32 -40 q32 0 32 40z" fill="#c9a45c"/></g>' : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="46" ry="3" fill="#000" opacity=".25"/>' +
    '<g transform="translate(-22 16) scale(.8)">' + V_PERSON(G, tArm(G, ...DOWN_L) + tArm(G, [65, 47], [76, 58], [86, 54]), { mouth: 'smile' }) + '</g>' +
    '<g transform="translate(' + (mcUs(X) ? 30 : 42) + ' 16) scale(.8)">' + V_PERSON(T, tArm(T, [35, 47], [26, 60], [18, 58]) + tArm(T, ...DOWN_R), { mouth: 'open' }) + '</g>' + you +
    '<g transform="translate(' + (mcUs(X) ? 44 : 50) + ' 60) scale(.32) translate(-50 -50)">' + thing + '</g>' + vArrow([34, 30], [46, 20], [58, 30]) + '</svg>';
}
Object.keys(MC).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => mcFig(X) }); });

const SMC = gTag('mc', {
  present: (X) => { const p = mcTeach(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: mcTeach(X) + '?', model: 'Sì, ' + mcAns(X) + '.' }),
  neg: (X) => { const o = mcOther(X); return { type: 'neg', show: X, ask: o, prompt: mcTeach(X, o) + '?', model: 'No, ' + mcAns(X, o, true) + '.', complete: gCap(mcAns(X)) + '.' }; },
  alt: (X) => { const o = mcOther(X), ord = Math.random() < 0.5 ? [mcObj(X), o] : [o, mcObj(X)];
    return { type: 'alt', show: X, prompt: mcTeach(X, ord[0]) + ' o ' + daThe(ord[1]) + '?', model: gCap(mcAns(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: mcQ(X), model: gCap(mcAns(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: mcQ(X) + ' ' + gCap(mcAns(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: mcQ(X), model: mcQ(X) })
});

/* ---------- Capire le frasi: «(non) Le / ci / mi dà il libro» ---------- */
function mcStatements(s) {
  s = s.replace(/ (che )?cosa (mi|ci|le|ti) da [a-z]+ /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'da' || !/^(mi|ci|le|gli|ti|vi|lo|la)$/.test(w[i - 1] || '')) continue;
    const pro = w[i - 1], neg = w[i - 2] === 'non', n = gNoun(w[i + 2]);
    const artOk = !!n && w[i + 1] === gDef(n.obj, 1).replace('\'', '') && n.plural !== true;
    out.push({ pro: pro, neg: neg, obj: n ? n.obj : null, ok: artOk });
  }
  return out;
}
function mcEvaluate(step, text) {
  const s = gNorm(text), X = step.show, echo = step.type === 'echo';
  if (echo && step.check === 'question') return { ok: has(s, gNorm(mcQ(X)).trim()), full: true };
  const st = mcStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  // nella ripetizione «mi / ci» (l'insegnante); nella risposta «Le / ci» (l'allievo)
  const want = mcUs(X) ? 'ci' : (echo ? 'mi' : 'le');
  const good = (x, o) => x.ok && x.pro === want && x.obj === o;
  switch (step.type) {
    case 'echo': return { ok: pos.length > 0 && pos.every(x => good(x, mcObj(X))) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.length > 0 && pos.every(x => good(x, mcObj(X))) && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && good(neg[0], step.ask) && pos.every(x => good(x, mcObj(X))), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => good(x, mcObj(X))) && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo chiede all'insegnante: «Che cosa Le dà Max?» → «Mi dà il libro.»
function mcEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || 'Che cosa ' + (mcUs(X) ? 'ci' : 'Le') + ' dà ' + mcName(X) + '?' });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ' + (mcUs(X) ? 'ci' : 'le') + ' da')) return { ok: true, kind: 'what' };
  return bad();
}
function mcAnswerAsk(X) { return gCap((mcUs(X) ? 'ci' : 'mi') + ' dà ' + daThe(mcObj(X))) + '.'; }
gInstall('mc', isMc, SMC, mcEvaluate, mcEvalAsk, mcAnswerAsk);
