'use strict';
/* =====================================================================
   CAPITOLO 18: «Piace — piacciono» (lezione 85, livello 4). Si carica dopo colaz_it.js (il cibo) e fiori_it.js (i fiori).
   Max o Isa sorride, il cuore rosa, e la cosa che gli piace (una sola) o le cose (due o tre):
     A Max piace il caffè.                         → ripete
     A Isa piacciono i fiori?                      → Sì, a Isa piacciono i fiori.   (va bene anche «Sì, le piacciono i fiori.»)
     A Max piace il vino?                          → No, a Max non piace il vino.
     A Max piace il caffè o il vino?               → A Max piace il caffè.
     Che cosa piace a Isa?                         → A Isa piacciono i fiori.
   Il punto: una cosa → piace; più cose → piacciono. «A Max», «gli» (a lui), «le» (a lei).
   Errori: «piace i fiori», «piacciono il caffè», «Max piace» (senza «a»), «gli» per Isa, l'articolo sbagliato.
   ===================================================================== */

const PI_THING = {
  caffe: { the: 'il caffè', pl: false },  pizza: { the: 'la pizza', pl: false }, vino: { the: 'il vino', pl: false },
  fiori: { the: 'i fiori', pl: true },    mele: { the: 'le mele', pl: true },    libri: { the: 'i libri', pl: true }
};
const PI_WORD = { caffe: 'caffe', pizza: 'pizza', pizze: 'pizza', vino: 'vino', fiori: 'fiori', fiore: 'fiori', mele: 'mele', mela: 'mele', libri: 'libri', libro: 'libri' };
const PI = { pi_m_caffe: 1, pi_f_fiori: 1, pi_m_libri: 1, pi_f_pizza: 1, pi_m_mele: 1, pi_f_vino: 1 };
const isPi = (X) => !!PI[X];
const piWho = (X) => X.charAt(3);
const piT = (X) => X.slice(5);
const piName = (X) => vName(piWho(X));
const piVerb = (t) => PI_THING[t].pl ? 'piacciono' : 'piace';
const piSay = (X, t, neg) => 'A ' + piName(X) + (neg ? ' non ' : ' ') + piVerb(t || piT(X)) + ' ' + PI_THING[t || piT(X)].the;
const piQ = (X) => 'Che cosa piace a ' + piName(X) + '?';
const piOther = (X, same) => pick(Object.keys(PI_THING).filter(t => t !== piT(X) && (!same || PI_THING[t].pl === PI_THING[piT(X)].pl)));

/* ---------- Figure: la persona che sorride, il cuore rosa, la cosa (o le cose) ---------- */
const PI_HEART = '<path d="M0 3 c-6 -4 -8 -8 -5 -10.5 c2 -1.6 4 -.8 5 1 c1 -1.8 3 -2.6 5 -1 c3 2.5 1 6.5 -5 10.5z" fill="#e8739a" stroke="#f3eee2" stroke-width=".8"/>';
function piThings(t) {
  const food = (f, x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ') translate(-50 -50)">' + CZ_FIG[f] + '</g>';
  const box = (svg, x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + inner(svg) + '</g>';
  if (t === 'caffe' || t === 'pizza' || t === 'vino') return food(t, 77, 62, .5);
  if (t === 'mele') return food('mela', 70, 66, .38) + food('mela', 86, 70, .38) + food('mela', 78, 52, .38);
  if (t === 'libri') return box(FIG.book, 58, 44, .3) + box(FIG.book, 72, 52, .3);
  return box(FIG.fi_rosa_rosso, 50, 34, .4) + box(FIG.fi_tulipano_giallo, 63, 40, .4) + box(FIG.fi_margherita_bianco, 74, 34, .4);
}
function piFig(X) {
  const k = p3Key(piWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="34" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 60], [80, 52]), { mouth: 'smile' }, -16) +
    '<g transform="translate(66 24) scale(1.5)">' + PI_HEART + '</g><g transform="translate(78 14) scale(.8)" opacity=".8">' + PI_HEART + '</g>' + piThings(piT(X)) + '</svg>';
}
Object.keys(PI).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => piFig(X) }); });

const SPI = gTag('pi', {
  present: (X) => { const p = piSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: piSay(X) + '?', model: 'Sì, ' + piSay(X).charAt(0).toLowerCase() + piSay(X).slice(1) + '.' }),
  neg: (X) => { const o = piOther(X); return { type: 'neg', show: X, ask: o, prompt: piSay(X, o) + '?', model: 'No, a ' + piName(X) + ' non ' + piVerb(o) + ' ' + PI_THING[o].the + '.', complete: piSay(X) + '.' }; },
  alt: (X) => { const o = piOther(X, true), ord = Math.random() < 0.5 ? [piT(X), o] : [o, piT(X)];
    return { type: 'alt', show: X, prompt: piSay(X, ord[0]) + ' o ' + PI_THING[ord[1]].the + '?', model: piSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: piQ(X), model: piSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: piQ(X) + ' ' + piSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: piQ(X), model: piQ(X) })
});

/* ---------- Capire le frasi: «a Max (non) piace il caffè», «(non) gli piacciono i libri», «a lei piace…» ---------- */
function piStatements(s) {
  s = s.replace(/ (che )?cosa piace a [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'piace' && w[i] !== 'piacciono') continue;
    let j = i - 1, neg = false, who = null, subjOk = true;
    if (w[j] === 'non') { neg = true; j--; }
    if (w[j] === 'gli' || w[j] === 'le') { who = w[j] === 'gli' ? 'm' : 'f'; j--; if (w[j] === 'non') neg = true; }
    else if (w[j - 1] === 'a' && (names[w[j]] || w[j] === 'lui' || w[j] === 'lei')) who = names[w[j]] || (w[j] === 'lui' ? 'm' : 'f');
    else if (names[w[j]]) { who = names[w[j]]; subjOk = false; }                 // «Max piace…»: manca la «a»
    const art = w[i + 1], t = PI_WORD[w[i + 2]] || null;
    const ok = subjOk && !!t && art === PI_THING[t].the.split(' ')[0] && w[i + 2] === gNorm(PI_THING[t].the).trim().split(' ')[1] && (w[i] === 'piacciono') === PI_THING[t].pl;
    out.push({ neg: neg, who: who, t: t, ok: ok });
  }
  return out;
}
function evaluatePi(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(piQ(X)).trim()), full: true };
  const st = piStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const whoOk = (x) => x.who === null || x.who === piWho(X);
  const truth = (x) => x.ok && whoOk(x) && x.t === piT(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && whoOk(neg[0]) && neg[0].t === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskPi(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || piQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(piQ(X)).trim())) return { ok: true, kind: 'what' };
  if (has(s, 'che cosa piace')) return bad();
  const st = piStatements(s);
  if (st.length === 1 && st[0].ok && (st[0].who === null || st[0].who === piWho(X))) return { ok: true, kind: st[0].t === piT(X) ? 'yes' : 'no', ask: st[0].t };
  if (st.length === 1 && st[0].t) return bad(piSay(X, st[0].t) + '?');
  return bad();
}
function answerAskPi(X, r) {
  if (r.kind === 'yes') return 'Sì, a ' + piName(X) + ' ' + piVerb(piT(X)) + ' ' + PI_THING[piT(X)].the + '.';
  if (r.kind === 'no') return 'No, a ' + piName(X) + ' non ' + piVerb(r.ask) + ' ' + PI_THING[r.ask].the + '. ' + piSay(X) + '.';
  return piSay(X) + '.';
}
gInstall('pi', isPi, SPI, evaluatePi, evalAskPi, answerAskPi);
