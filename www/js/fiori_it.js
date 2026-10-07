'use strict';
/* =====================================================================
   CAPITOLO 12: «I fiori» (lezione 65, livello 3). Si carica dopo gen_it.js (i colori).
   Quattro fiori, di colori diversi: la rosa, il tulipano, la margherita, il girasole.
     È una rosa rossa.                     → ripete
     Che fiore è?                          → È una rosa rossa.   (va bene anche «È una rosa.»)
     È una rosa rossa?                     → Sì, è una rosa rossa.
     È un tulipano?                        → No, non è un tulipano.
     È una rosa o un tulipano?             → È una rosa.
   Il punto: un / una con il fiore, il colore accordato (una rosa rossa, un tulipano rosso). -o azzurra, -a rosa.
   Errori: «un rosa», «una tulipano», «una rosa rosso», il fiore sbagliato, il colore sbagliato.
   ===================================================================== */

const FI_FLOWER = { rosa: { art: 'una', g: 'f' }, tulipano: { art: 'un', g: 'm' }, margherita: { art: 'una', g: 'f' }, girasole: { art: 'un', g: 'm' } };
const FI = { fi_rosa_rosso: 1, fi_tulipano_giallo: 1, fi_margherita_bianco: 1, fi_girasole_giallo: 1, fi_rosa_bianco: 1, fi_tulipano_rosso: 1 };
const FI_WORD = { rosa: 'rosa', rose: 'rosa', tulipano: 'tulipano', tulipani: 'tulipano', margherita: 'margherita', margherite: 'margherita', girasole: 'girasole', girasoli: 'girasole' };
const isFi = (X) => !!FI[X];
const fiF = (X) => X.split('_')[1];
const fiC = (X) => X.split('_')[2];
const fiCol = (f, c) => G_COLORS[c][FI_FLOWER[f].g];                         // «rossa», «rosso»
const fiNoun = (f) => FI_FLOWER[f].art + ' ' + f;                            // «una rosa»
const fiSay = (X) => 'È ' + fiNoun(fiF(X)) + ' ' + fiCol(fiF(X), fiC(X));      // «È una rosa rossa»
const fiOther = (X) => pick(Object.keys(FI_FLOWER).filter(f => f !== fiF(X)));
const FI_Q = 'Che fiore è?';

/* ---------- Figure: il fiore con il gambo verde ---------- */
const FI_HEX = { rosso: ['#c8323b', '#9e222a'], giallo: ['#f2c81e', '#c9a21a'], bianco: ['#f4f4f6', '#c9ccd4'] };
const FI_STEM = '<path d="M50 50 q-2 22 0 40" stroke="#4f8f4f" stroke-width="3" fill="none"/><path d="M50 72 q-14 -8 -18 -2 q8 6 18 2z M50 64 q12 -10 18 -4 q-8 8 -18 4z" fill="#5a9a46"/>';
function fiHead(f, c) {
  const [a, b] = FI_HEX[c];
  if (f === 'rosa') return '<circle cx="50" cy="36" r="14" fill="' + a + '"/><path d="M42 34 q8 -10 16 0 q-8 8 -16 0z M44 40 q6 6 12 0" fill="none" stroke="' + b + '" stroke-width="2"/><path d="M46 30 q4 -4 8 0" stroke="' + b + '" stroke-width="1.6" fill="none"/>';
  if (f === 'tulipano') return '<path d="M38 26 l6 8 l6 -12 l6 12 l6 -8 v16 q0 10 -12 10 q-12 0 -12 -10z" fill="' + a + '" stroke="' + b + '" stroke-width="1.2"/>';
  if (f === 'margherita') return [0, 45, 90, 135, 180, 225, 270, 315].map(r => '<ellipse cx="50" cy="26" rx="4" ry="9" fill="' + a + '" stroke="' + b + '" stroke-width=".8" transform="rotate(' + r + ' 50 36)"/>').join('') + '<circle cx="50" cy="36" r="5.5" fill="#f2c81e"/>';
  return Array.from({ length: 12 }, (_, i) => '<ellipse cx="50" cy="20" rx="4" ry="9" fill="' + a + '" stroke="' + b + '" stroke-width=".8" transform="rotate(' + i * 30 + ' 50 36)"/>').join('') +
    '<circle cx="50" cy="36" r="9" fill="#6e4f33"/><circle cx="50" cy="36" r="6" fill="#5a3f28"/>';
}
Object.keys(FI).forEach(X => { FIG[X] = FLAT(FI_STEM + fiHead(fiF(X), fiC(X)), 20); });

const SFI = gTag('fi', {
  present: (X) => { const p = fiSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: fiSay(X) + '?', model: 'Sì, ' + fiSay(X).toLowerCase().replace(/^è/, 'è') + '.' }),
  neg: (X) => { const o = fiOther(X); return { type: 'neg', show: X, ask: o, prompt: 'È ' + fiNoun(o) + '?', model: 'No, non è ' + fiNoun(o) + '.', complete: fiSay(X) + '.' }; },
  alt: (X) => { const o = fiOther(X), ord = Math.random() < 0.5 ? [fiF(X), o] : [o, fiF(X)];
    return { type: 'alt', show: X, prompt: 'È ' + fiNoun(ord[0]) + ' o ' + fiNoun(ord[1]) + '?', model: 'È ' + fiNoun(fiF(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: FI_Q, model: fiSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: FI_Q + ' ' + fiSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: FI_Q, model: FI_Q })
});

/* ---------- Capire le frasi: «(non) è un tulipano (rosso)» ---------- */
function fiStatements(s) {
  s = s.replace(/ che fiore e /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = FI_WORD[w[i]];
    if (!f) continue;
    const art = w[i - 1], neg = w[i - 2] === 'non' || w[i - 3] === 'non';
    // l'articolo, se c'è, deve andare con il fiore (una rosa, un tulipano)
    const artOk = !/^(un|una|uno|il|la|lo|l)$/.test(art || '') || art === FI_FLOWER[f].art || art === (FI_FLOWER[f].g === 'f' ? 'la' : 'il');
    const cw = G_COLOR_WORD[w[i + 1]];
    out.push({ f: f, neg: neg, ok: artOk && f === w[i] && (!cw || (!cw.plural && cw.g === FI_FLOWER[f].g)), col: cw ? cw.col : null });
  }
  return out;
}
function fiEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che fiore e'), full: true };
  const st = fiStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && x.f === fiF(X) && (x.col === null || x.col === fiC(X)), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.col) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].f === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function fiEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || FI_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che fiore e')) return { ok: true, kind: 'what' };
  if (has(s, 'di che colore e')) return { ok: true, kind: 'col' };
  const st = fiStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].f === fiF(X) && (st[0].col === null || st[0].col === fiC(X)) ? 'yes' : 'no', f: st[0].f, col: st[0].col };
  if (st.length === 1) return bad('È ' + fiNoun(st[0].f) + (st[0].col ? ' ' + fiCol(st[0].f, st[0].col) : '') + '?');
  return bad();
}
function fiAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + fiSay(X).charAt(0).toLowerCase() + fiSay(X).slice(1) + '.';
  if (r.kind === 'no') return 'No. ' + fiSay(X) + '.';
  if (r.kind === 'col') return 'È ' + fiCol(fiF(X), fiC(X)) + '.';
  return fiSay(X) + '.';
}
gInstall('fi', isFi, SFI, fiEvaluate, fiEvalAsk, fiAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.fi ? ['rosa', 'tulipano', 'margherita', 'una', 'rossa', 'rosso', 'gialla', 'giallo', 'bianca', 'bianco'] : bGw(lesson);
}
