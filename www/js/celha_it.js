'use strict';
/* =====================================================================
   CAPITOLO 6: «Ce l'ho — ce l'ha» (lezione 41). Si carica dopo gen_it.js e verbs_it.js (i due colleghi).
   Max o Isa hanno in mano una cosa, oppure non ce l'hanno (la cosa nella nuvoletta, barrata in rosso):
     Max ha il telefono. Ce l'ha.            Isa non ha la valigia. Non ce l'ha.     → ripete
     Max ha il telefono?                     → Sì, ce l'ha.
     Isa ha la valigia?                      → No, non ce l'ha.
     Max ha la borsa?                        → No, non ce l'ha.
   Il punto: alla domanda «ha il…? / ha la…?» si risponde «ce l'ha» (non si ripete la cosa). «ce l'ha» sottolineato.
   Errori: «Sì, ce l'ho», «Sì, ce la ha», «Sì, l'ha», «Sì, ha», «No, non l'ha», il sì e il no scambiati.
   ===================================================================== */

const CLH = { cl_m_phone_1: 1, cl_f_suitcase_0: 1, cl_m_umbrella_0: 1, cl_f_key_1: 1, cl_m_book_1: 1, cl_f_bag_0: 1 };
const isCl = (X) => !!CLH[X];
const clWho = (X) => X.charAt(3);
const clObj = (X) => X.split('_')[2];
const clHas = (X) => X.slice(-1) === '1';
const clName = (X) => vName(clWho(X));
const clQ = (X, obj) => clName(X) + ' ha ' + gThe(obj || clObj(X), 1) + '?';            // «Max ha il telefono?»
const clSay = (X) => clHas(X) ? clName(X) + ' ha ' + gThe(clObj(X), 1) + '. Ce l\'ha.' : clName(X) + ' non ha ' + gThe(clObj(X), 1) + '. Non ce l\'ha.';
const clAns = (has) => has ? 'Sì, ce l\'ha.' : 'No, non ce l\'ha.';
const clOther = (X) => pick(Object.keys(CLH).map(clObj).filter(o => o !== clObj(X)));
FIG.key_giallo = FIG.key_giallo || FIG.key;

/* ---------- Figure: la cosa in mano, oppure le mani vuote e la cosa nella nuvoletta, barrata ---------- */
function clFig(X) {
  const k = p3Key(clWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const o = clObj(X), f = o === 'key' ? FIG.key_giallo : o === 'phone' ? (FIG.phone_giallo || FIG.phone) : FIG[o];   // chiave e telefono gialli: si vedono
  const thing = inner(f).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const base = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="44" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>';
  if (clHas(X)) return base + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [76, 64], [84, 54]), { mouth: 'smile' }, -8) +
    '<g transform="translate(72 60) scale(.42) translate(-50 -50)">' + thing + '</g></svg>';
  // non ce l'ha: le braccia aperte (mani vuote) e la cosa nella nuvoletta, con la croce rossa
  return base + V_PERSON(LK, tArm(LK, [35, 47], [24, 66], [14, 60]) + tArm(LK, [65, 47], [76, 66], [86, 60]), { mouth: 'flat', brow: 1 }, -10) +
    '<circle cx="54" cy="18" r="1.8" fill="#f3eee2"/><circle cx="60" cy="13" r="2.6" fill="#f3eee2"/><circle cx="80" cy="20" r="18" fill="#f3eee2"/>' +
    '<g transform="translate(80 20) scale(.27) translate(-50 -50)">' + thing + '</g>' +
    '<path d="M69 9 l22 22 M91 9 l-22 22" stroke="#d23a3a" stroke-width="3.2" stroke-linecap="round"/></svg>';
}
Object.keys(CLH).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => clFig(X) }); });

const SCL = gTag('cl', {
  present: (X) => { const p = clSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  // la domanda sulla sua cosa: sì (ce l'ha) o no (non ce l'ha)
  yes: (X) => ({ type: clHas(X) ? 'yes' : 'neg', show: X, has: clHas(X), prompt: clQ(X), model: clAns(clHas(X)), complete: clHas(X) ? '' : clSay(X) }),
  // un'altra cosa, che non ha: no
  neg: (X) => { const o = clOther(X); return { type: 'neg', show: X, has: false, ask: o, prompt: clQ(X, o), model: clAns(false), complete: clSay(X) }; },
  key: (X) => ({ type: 'key', show: X, has: clHas(X), prompt: clQ(X), model: clAns(clHas(X)) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: clQ(X) + ' ' + clAns(clHas(X)), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: clQ(X), model: clQ(X) })
});

/* ---------- Capire le risposte: «sì, ce l'ha» / «no, non ce l'ha» ---------- */
function clParse(s) {
  const pos = / ce l ha /.test(s.replace(/ non ce l ha /g, ' # ')), neg = / non ce l ha /.test(s);
  const bad = / ce l ho | ce la ha | ce lo ha | non l ha | l ha /.test(s.replace(/ ce l ha /g, ' # ')) || / (si|no) (non )?ha /.test(s);
  return { pos: pos, neg: neg, bad: bad, yes: has(s, 'si'), no: has(s, 'no') };
}
function clEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const p = clParse(s);
  if (step.type === 'echo') return { ok: !p.bad && (clHas(X) ? p.pos && !p.neg : p.neg && !p.pos), full: true };
  if (p.bad) return { ok: false, full: false };
  if (step.has) return { ok: p.pos && !p.neg && !p.no, full: true };
  return { ok: p.neg && !p.pos && !p.yes, full: true };
}
function clEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || clQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const m = / ha (il|la|lo|l) ([a-z]+)(?= )/.exec(s), nn = m && gNoun(m[2]);
  if (nn && m[1] === gDef(nn.obj, 1).replace('\'', '')) return { ok: true, kind: nn.obj === clObj(X) && clHas(X) ? 'yes' : 'no' };
  if (nn) return bad(clQ(X, nn.obj));
  if (has(s, 'che cosa ha')) return { ok: true, kind: 'what' };
  return bad();
}
function clAnswerAsk(X, r) {
  if (r.kind === 'yes') return clAns(true);
  if (r.kind === 'no') return clAns(false);
  return clSay(X);
}
gInstall('cl', isCl, SCL, clEvaluate, clEvalAsk, clAnswerAsk);
