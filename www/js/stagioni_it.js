'use strict';
/* =====================================================================
   CAPITOLO 18: «Le quattro stagioni» (lezione 86, livello 4). Si carica dopo mesi_it.js (i mesi).
   Il paesaggio della stagione (l'albero con i fiori rosa, il sole d'estate, le foglie arancioni, la neve) e il foglietto con il mese:
     È aprile. È primavera.                → ripete
     È primavera?                          → Sì, è primavera.
     È inverno?                            → No, non è inverno.
     È estate o autunno?                   → È estate.
     Che stagione è?                       → È primavera.   (va bene anche «È la primavera.»)
   Errori: la stagione sbagliata, il mese sbagliato.
   ===================================================================== */

const SG_SEASONS = ['inverno', 'primavera', 'estate', 'autunno'];                  // come msSeason: 0 inverno, 1 primavera, 2 estate, 3 autunno
const STAG = { sg_apr: 3, sg_lug: 6, sg_ott: 9, sg_gen: 0, sg_mag: 4, sg_ago: 7, sg_nov: 10, sg_feb: 1 };
const isSg = (X) => STAG[X] !== undefined;
const sgSeason = (X) => SG_SEASONS[msSeason(STAG[X])];
const sgMonth = (X) => MONTHS[STAG[X]];
const SG_Q = 'Che stagione è?';
const sgOther = (X) => pick(SG_SEASONS.filter(s => s !== sgSeason(X)));

/* ---------- Figure: il paesaggio e il foglietto del mese ---------- */
const SG_LAND = {
  primavera: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#a8d8f0"/><circle cx="80" cy="18" r="7" fill="#f3d36b"/><path d="M2 70 q30 -8 60 -2 q20 4 36 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#7cc06a"/>' +
    '<rect x="44" y="44" width="7" height="28" fill="#8e6741"/><circle cx="47" cy="38" r="17" fill="#5aa04a"/><circle cx="36" cy="44" r="10" fill="#5aa04a"/><circle cx="58" cy="44" r="10" fill="#5aa04a"/>' +
    [[40, 30], [52, 28], [46, 40], [34, 44], [58, 42], [62, 34], [30, 38]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.6" fill="#f4a6c4"/>').join('') +
    [[16, 80], [24, 86], [72, 82], [82, 88], [88, 78]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2" fill="#f2c81e"/><circle cx="' + x + '" cy="' + y + '" r=".8" fill="#fff"/>').join(''),
  estate: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#5fb0e6"/><circle cx="76" cy="20" r="11" fill="#f3d36b"/>' +
    '<path d="M76 4 v3 M76 33 v3 M60 20 h3 M89 20 h3 M65 9 l2 2 M85 29 l2 2 M65 31 l2 -2 M85 11 l2 -2" stroke="#f3d36b" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M2 66 h96 v8 h-96z" fill="#3f7fb5"/><path d="M2 74 h96 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#ecd59a"/>' +
    '<path d="M30 74 q2 -24 -2 -40" stroke="#8e6741" stroke-width="3" fill="none"/><path d="M28 34 q-14 -4 -20 4 M28 34 q-6 -12 -18 -10 M28 34 q12 -10 22 -4 M28 34 q14 -2 18 8" stroke="#3f8f3f" stroke-width="4" fill="none" stroke-linecap="round"/>',
  autunno: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#b9c6d4"/><path d="M2 72 q40 -6 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#a5844e"/>' +
    '<rect x="44" y="44" width="7" height="30" fill="#7a5735"/><circle cx="47" cy="38" r="16" fill="#e8862a"/><circle cx="36" cy="46" r="9" fill="#c8562a"/><circle cx="59" cy="45" r="9" fill="#d9a23a"/>' +
    [[22, 50, 20], [70, 58, -30], [30, 66, 60], [78, 40, 10], [62, 76, -50]].map(([x, y, r]) => '<path transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" d="M0 -5 q5 2 3 7 q-2 2 -3 3 q-1 -1 -3 -3 q-2 -5 3 -7z" fill="#e8862a"/>').join(''),
  inverno: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#c3d2e0"/><path d="M2 68 q40 -8 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#f4f6f9"/>' +
    '<path d="M47 72 v-34 M47 52 l-14 -12 M47 46 l12 -12 M47 40 l-6 -12 M40 46 l-6 -2 M55 40 l6 -2" stroke="#6e4f33" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
    '<path d="M33 40 l-3 -1.5 M59 34 l2 -2 M41 28 l-1 -2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
    [[16, 20], [28, 12], [70, 16], [84, 28], [20, 46], [76, 50], [62, 24], [88, 56]].map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ')" stroke="#fff" stroke-width="1.2" stroke-linecap="round"><path d="M0 -3 v6 M-2.6 -1.5 l5.2 3 M-2.6 1.5 l5.2 -3"/></g>').join('') +
    '<ellipse cx="72" cy="80" rx="6" ry="2" fill="#dfe6ee"/><circle cx="72" cy="74" r="6" fill="#fff"/><circle cx="72" cy="64" r="4.5" fill="#fff"/><path d="M72 64 l4 1 l-4 1z" fill="#e8862a"/><circle cx="70.6" cy="62.8" r=".7" fill="#2a3346"/><circle cx="73.4" cy="62.8" r=".7" fill="#2a3346"/>'
};
function sgFig(X) {
  const m = sgMonth(X);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + SG_LAND[sgSeason(X)] +
    '<g transform="rotate(-4 22 14)"><rect x="5" y="6" width="38" height="19" rx="2.5" fill="#f3eee2" stroke="#8d93a3" stroke-width=".6"/><rect x="5" y="6" width="38" height="5" rx="2" fill="#5b4a8b"/>' +
    '<text x="24" y="21.5" text-anchor="middle" font-family="Georgia,serif" font-size="' + (m.length > 7 ? 7.5 : 8.5) + '" font-weight="bold" fill="#2a3346">' + m + '</text></g></svg>';
}
Object.keys(STAG).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => sgFig(X) }); });

const SSG = gTag('sg', {
  present: (X) => { const p = 'È ' + sgMonth(X) + '. È ' + sgSeason(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: 'È ' + sgSeason(X) + '?', model: 'Sì, è ' + sgSeason(X) + '.' }),
  neg: (X) => { const o = sgOther(X); return { type: 'neg', show: X, ask: o, prompt: 'È ' + o + '?', model: 'No, non è ' + o + '.', complete: 'È ' + sgSeason(X) + '.' }; },
  alt: (X) => { const o = sgOther(X), ord = Math.random() < 0.5 ? [sgSeason(X), o] : [o, sgSeason(X)];
    return { type: 'alt', show: X, prompt: 'È ' + ord[0] + ' o ' + ord[1] + '?', model: 'È ' + sgSeason(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: SG_Q, model: 'È ' + sgSeason(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: 'È ' + sgMonth(X) + '. ' + SG_Q + ' È ' + sgSeason(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: SG_Q, model: SG_Q })
});

/* ---------- Capire le frasi: «(non) è (la / l') primavera», «è aprile» ---------- */
function sgStatements(s) {
  s = s.replace(/ che stagione e /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'e') continue;
    let j = i + 1;
    if (/^(la|l)$/.test(w[j] || '')) j++;
    const season = SG_SEASONS.indexOf(w[j]) !== -1 ? w[j] : null, month = MONTH_WORD[w[j]];
    if (!season && month === undefined) continue;
    const artOk = j === i + 1 || (season && w[i + 1] === (season === 'primavera' ? 'la' : 'l'));
    out.push({ neg: w[i - 1] === 'non', season: season, month: month === undefined ? null : month, ok: artOk });
  }
  return out;
}
function evaluateSg(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che stagione e'), full: true };
  const st = sgStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const right = (x) => x.ok && (x.season ? x.season === sgSeason(X) : x.month === STAG[X]);
  const allPos = pos.every(right), said = pos.some(x => x.season && right(x));
  switch (step.type) {
    case 'echo': return { ok: said && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && said && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].season === step.ask && allPos, full: said };
    default: return { ok: said && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskSg(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || SG_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che stagione e')) return { ok: true, kind: 'what' };
  const st = sgStatements(s).filter(x => x.season);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].season === sgSeason(X) ? 'yes' : 'no', ask: st[0].season };
  return bad();
}
function answerAskSg(X, r) {
  if (r.kind === 'yes') return 'Sì, è ' + sgSeason(X) + '.';
  if (r.kind === 'no') return 'No, non è ' + r.ask + '. È ' + sgSeason(X) + '.';
  return 'È ' + sgSeason(X) + '.';
}
gInstall('sg', isSg, SSG, evaluateSg, evalAskSg, answerAskSg);
