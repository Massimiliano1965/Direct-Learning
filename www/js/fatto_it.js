'use strict';
/* =====================================================================
   CAPITOLO 16: «Di che cosa è fatto?» (lezione 83, livello 4). Si carica dopo colors_it.js (il, la) e data.js (le cose).
   La cosa e, nel cerchio in alto a destra, un pezzetto del materiale (legno, plastica, vetro, metallo, pelle, lana):
     Il tavolo è di legno.                               → ripete
     La bottiglia è di vetro?                            → Sì, la bottiglia è di vetro.
     La sedia è di legno?                                → No, la sedia non è di legno.
     La borsa è di pelle o di plastica?                  → La borsa è di pelle.
     Di che cosa è fatta la chiave?                      → La chiave è di metallo.
   Il punto: «di» + il materiale; la domanda si accorda: fatto (il tavolo), fatta (la sedia). Va bene anche «è fatta di vetro».
   Errori: il materiale sbagliato, «la sedia è fatto», «il sedia».
   ===================================================================== */

const MD = { md_table_legno: 1, md_bottle_vetro: 1, md_chair_plastica: 1, md_coat_lana: 1, md_key_metallo: 1, md_bag_pelle: 1 };
const MD_MAT = ['legno', 'plastica', 'vetro', 'metallo', 'pelle', 'lana'];
const isMd = (X) => !!MD[X];
const mdObj = (X) => X.split('_')[1];
const mdMat = (X) => X.split('_')[2];
const mdFatto = (o) => isFem(o) ? 'fatta' : 'fatto';
const mdSay = (X, m, neg) => gCap(theObj(mdObj(X))) + (neg ? ' non' : '') + ' è di ' + (m || mdMat(X));
const mdQ = (X) => 'Di che cosa è ' + mdFatto(mdObj(X)) + ' ' + theObj(mdObj(X)) + '?';
const mdOther = (X) => pick(MD_MAT.filter(m => m !== mdMat(X)));

/* ---------- Figure: la cosa e il pezzetto di materiale ---------- */
const MD_SWATCH = {
  legno: '<circle r="11" fill="#a0703f"/><path d="M-9 -4 q5 -3 9 0 t9 0 M-10 1 q5 -3 10 0 t10 0 M-9 6 q5 -3 9 0 t9 0" fill="none" stroke="#6f4a28" stroke-width="1.2"/><ellipse cx="3" cy="1" rx="2.5" ry="1.6" fill="none" stroke="#6f4a28" stroke-width="1"/>',
  plastica: '<circle r="11" fill="#d23c44"/><ellipse cx="-4" cy="-5" rx="4" ry="2.2" fill="#fff" opacity=".55" transform="rotate(-30 -4 -5)"/>',
  vetro: '<circle r="11" fill="#bfe0ee" opacity=".8"/><circle r="11" fill="none" stroke="#e8f4fa" stroke-width="1.2"/><path d="M-6 4 l8 -9 M-2 7 l8 -9" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  metallo: '<circle r="11" fill="#9aa3b0"/><circle r="11" fill="none" stroke="#d5dbe3" stroke-width="1.4"/><circle r="4" fill="#7f8896"/><path d="M-3 0 h6" stroke="#4f5663" stroke-width="1.4"/><path d="M-8 -5 a10 10 0 0 1 6 -4" stroke="#eef1f5" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  pelle: '<circle r="11" fill="#7a4a2a"/><circle r="8" fill="none" stroke="#e0c287" stroke-width="1" stroke-dasharray="2 1.6"/><circle cx="-3" cy="-2" r=".7" fill="#5e371e"/><circle cx="3" cy="3" r=".7" fill="#5e371e"/>',
  lana: '<circle r="11" fill="#c7cfdf"/><path d="M-8 -4 l3 3 l3 -3 l3 3 l3 -3 l3 3 M-8 2 l3 3 l3 -3 l3 3 l3 -3 l3 3" fill="none" stroke="#8d97ad" stroke-width="1.2"/>'
};
// la sedia di plastica (rossa, tutta d'un pezzo) e la chiave di metallo (grigia)
const MD_ART = {
  chair: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="91" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    '<path d="M31 12 q19 -6 38 0 l-3 44 h-32z" fill="#d23c44"/><path d="M36 18 q14 -4 28 0 v8 q-14 -4 -28 0z" fill="#b22a33"/>' +
    '<path d="M24 56 h52 l2 8 h-56z" fill="#e0545b"/><path d="M27 64 l-4 26 h5 l5 -26z M73 64 l4 26 h-5 l-5 -26z" fill="#b22a33"/>' +
    '<path d="M35 14 q4 -2 9 -2 l-1 30 h-5z" fill="#fff" opacity=".22"/></svg>',
  key: null
};
function mdFig(X) {
  const o = mdObj(X), m = mdMat(X);
  let base = o === 'chair' ? MD_ART.chair : FIG[o];
  if (o === 'key') base = base.replace(/#c9a45c/g, '#9aa3b0').replace(/#b8923f/g, '#7f8896').replace(/#e0c287/g, '#dfe4ea');
  return base.replace(/<\/svg>$/, '<g transform="translate(86 13)">' + MD_SWATCH[m] + '<circle r="12" fill="none" stroke="#c9a45c" stroke-width="1.4"/></g></svg>');
}
Object.keys(MD).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => mdFig(X) }); });

const SMD = gTag('md', {
  present: (X) => { const p = mdSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: mdSay(X) + '?', model: 'Sì, ' + theObj(mdObj(X)) + ' è di ' + mdMat(X) + '.' }),
  neg: (X) => { const o = mdOther(X); return { type: 'neg', show: X, ask: o, prompt: mdSay(X, o) + '?', model: 'No, ' + theObj(mdObj(X)) + ' non è di ' + o + '.', complete: mdSay(X) + '.' }; },
  alt: (X) => { const o = mdOther(X), ord = Math.random() < 0.5 ? [mdMat(X), o] : [o, mdMat(X)];
    return { type: 'alt', show: X, prompt: mdSay(X, ord[0]) + ' o di ' + ord[1] + '?', model: mdSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: mdQ(X), model: mdSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: mdQ(X) + ' ' + mdSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: mdQ(X), model: mdQ(X) })
});

/* ---------- Capire le frasi: «(il tavolo) (non) è (fatto) di legno» ---------- */
function mdStatements(s) {
  s = s.replace(/ di che cosa e fatt[oaie] (il|la|lo|l) [a-z]+ /g, ' # ').replace(/ di che cosa e fatt[oaie] /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'di' || MD_MAT.indexOf(w[i + 1]) === -1) continue;
    let j = i - 1, fatto = null;
    if (/^fatt[oaie]$/.test(w[j] || '')) { fatto = w[j]; j--; }
    if (w[j] !== 'e') continue;
    j--;
    const neg = w[j] === 'non';
    if (neg) j--;
    let obj = null, artOk = true;
    if (WORD2KEY[w[j]]) { obj = WORD2KEY[w[j]]; artOk = w[j - 1] === defArtN(obj); }
    out.push({ mat: w[i + 1], neg: neg, obj: obj, artOk: artOk, fatto: fatto });
  }
  return out;
}
const mdGood = (x, X) => x.artOk && (x.obj === null || x.obj === mdObj(X)) && (x.fatto === null || x.fatto === mdFatto(mdObj(X)));
function evaluateMd(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(mdQ(X)).trim()), full: true };
  const st = mdStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => mdGood(x, X) && x.mat === mdMat(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && mdGood(neg[0], X) && neg[0].mat === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskMd(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || mdQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(mdQ(X)).trim())) return { ok: true, kind: 'what' };
  if (has(s, 'di che cosa e')) return bad();
  const st = mdStatements(s);
  if (st.length === 1 && mdGood(st[0], X)) return { ok: true, kind: st[0].mat === mdMat(X) ? 'yes' : 'no', ask: st[0].mat };
  if (st.length === 1) return bad(mdSay(X, st[0].mat) + '?');
  return bad();
}
function answerAskMd(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + theObj(mdObj(X)) + ' è di ' + mdMat(X) + '.';
  if (r.kind === 'no') return 'No, ' + theObj(mdObj(X)) + ' non è di ' + r.ask + '. ' + mdSay(X) + '.';
  return mdSay(X) + '.';
}
gInstall('md', isMd, SMD, evaluateMd, evalAskMd, answerAskMd);
