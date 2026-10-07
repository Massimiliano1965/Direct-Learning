'use strict';
/* =====================================================================
   CAPITOLO 8: «Calendario: i mesi» (lezione 51, livello 2). Si carica dopo giorni_it.js.
   L'anno: dodici caselle (G F M A M G L A S O N D), il mese in oro con la freccia, e la stagione nell'angolo
   (il fiocco di neve, il fiore, il sole, la foglia):
     È luglio.                         → ripete
     È luglio?                         → Sì, è luglio.
     È giugno?                         → No, non è giugno.
     È luglio o agosto?                → È luglio.
     Che mese è?                       → È luglio.
   Errori: il mese sbagliato (guardare il posto nell'anno: G, M e A ci sono due volte).
   ===================================================================== */

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MONTH_INIT = 'GFMAMGLASOND'.split('');
const MONTH_WORD = {};
MONTHS.forEach((m, i) => { MONTH_WORD[m] = i; });
const MS = { ms_gen: 0, ms_apr: 3, ms_mag: 4, ms_lug: 6, ms_ott: 9, ms_dic: 11 };
const isMs = (X) => MS[X] !== undefined;
const msSay = (X, i) => 'È ' + MONTHS[i === undefined ? MS[X] : i];
const MS_Q = 'Che mese è?';
const msOther = (X) => { const i = MS[X], near = [i - 1, i + 1].filter(j => j >= 0 && j < 12); return Math.random() < 0.6 ? pick(near) : pick(MONTHS.map((_, j) => j).filter(j => j !== i)); };

/* ---------- Figura: l'anno, il mese in oro, la stagione ---------- */
const MS_SEASON = [
  '<g stroke="#9fd0ee" stroke-width="2" stroke-linecap="round"><path d="M0 -8 v16 M-7 -4 l14 8 M-7 4 l14 -8"/></g>',                                    // inverno: il fiocco di neve
  '<g><circle r="3" fill="#f3d36b"/>' + [0, 72, 144, 216, 288].map(a => '<ellipse cx="0" cy="-6" rx="3" ry="4" fill="#f4a6c4" transform="rotate(' + a + ')"/>').join('') + '<circle r="3" fill="#f3d36b"/></g>',   // primavera: il fiore
  '<g><circle r="5" fill="#f3d36b"/><path d="M0 -10 v3 M0 7 v3 M-10 0 h3 M7 0 h3 M-7 -7 l2 2 M5 5 l2 2 M-7 7 l2 -2 M5 -5 l2 -2" stroke="#f3d36b" stroke-width="2" stroke-linecap="round"/></g>',   // estate: il sole
  '<g><path d="M0 -9 q8 4 5 11 q-3 4 -5 6 q-2 -2 -5 -6 q-3 -7 5 -11z" fill="#e8862a"/><path d="M0 -7 v16" stroke="#a5521a" stroke-width="1"/></g>'   // autunno: la foglia
];
const msSeason = (i) => (i === 11 || i < 2) ? 0 : i < 5 ? 1 : i < 8 ? 2 : 3;
function msFig(X) {
  const t = MS[X];
  let s = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="22" width="88" height="70" rx="6" fill="#f3eee2"/><rect x="6" y="22" width="88" height="10" rx="5" fill="#5b4a8b"/>' +
    '<circle cx="26" cy="22" r="2.4" fill="#2a3346"/><circle cx="74" cy="22" r="2.4" fill="#2a3346"/>';
  for (let i = 0; i < 12; i++) {
    const x = 10 + (i % 6) * 13.6, y = 37 + Math.floor(i / 6) * 26, on = i === t;
    s += '<rect x="' + x + '" y="' + y + '" width="12" height="22" rx="2.5" fill="' + (on ? '#c9a45c' : '#e2dccd') + '"' + (on ? ' stroke="#8e6a2a" stroke-width="1"' : '') + '/>' +
      '<text x="' + (x + 6) + '" y="' + (y + 15) + '" text-anchor="middle" font-size="9" font-weight="700" font-family="Inter, Arial, sans-serif" fill="' + (on ? '#1d2638' : '#5a5f6e') + '">' + MONTH_INIT[i] + '</text>';
  }
  const ax = 10 + (t % 6) * 13.6 + 6, ay = t < 6 ? 6 : 6;
  // la freccia sopra il mese (per la seconda fila, la freccia scende lungo il lato)
  s += t < 6 ? '<path d="M' + (ax - 5) + ' ' + ay + ' h10 l-5 9z" fill="#c9a45c"/>' : '<path d="M' + (ax - 5) + ' 96 h10 l-5 -6z" fill="#c9a45c"/>';
  return s + '<g transform="translate(86 10)">' + MS_SEASON[msSeason(t)] + '</g></svg>';
}
Object.keys(MS).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => msFig(X) }); });

const SMS = gTag('ms', {
  present: (X) => { const p = msSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: msSay(X) + '?', model: 'Sì, è ' + MONTHS[MS[X]] + '.' }),
  neg: (X) => { const o = msOther(X); return { type: 'neg', show: X, ask: o, prompt: msSay(X, o) + '?', model: 'No, non è ' + MONTHS[o] + '.', complete: msSay(X) + '.' }; },
  alt: (X) => { const o = msOther(X), ord = Math.random() < 0.5 ? [MS[X], o] : [o, MS[X]];
    return { type: 'alt', show: X, prompt: 'È ' + MONTHS[ord[0]] + ' o ' + MONTHS[ord[1]] + '?', model: msSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: MS_Q, model: msSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: MS_Q + ' ' + msSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: MS_Q, model: MS_Q })
});

/* ---------- Capire le frasi: «(non) è luglio» ---------- */
function msStatements(s) {
  s = s.replace(/ che mese e /g, ' # ');
  const out = [], re = / (non )?(?:e )?([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (MONTH_WORD[m[2]] === undefined) { if (m[1]) re.lastIndex -= m[2].length + 1; continue; }
    out.push({ d: MONTH_WORD[m[2]], neg: !!m[1] });
  }
  return out;
}
function msEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che mese e'), full: true };
  const st = msStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const allPos = pos.every(x => x.d === MS[X]), hasPos = pos.length > 0 && allPos;
  switch (step.type) {
    case 'echo': return { ok: hasPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && hasPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].d === step.ask && allPos, full: hasPos };
    default: return { ok: hasPos && !neg.length && !yes && !no && !has(s, 'o') && !has(s, 'che mese'), full: true };
  }
}
function msEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || MS_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che mese e')) return { ok: true, kind: 'what' };
  const st = msStatements(s);
  if (st.length === 1) return { ok: true, kind: st[0].d === MS[X] ? 'yes' : 'no', ask: st[0].d };
  return bad();
}
function msAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, è ' + MONTHS[MS[X]] + '.';
  if (r.kind === 'no') return 'No, non è ' + MONTHS[r.ask] + '. ' + msSay(X) + '.';
  return msSay(X) + '.';
}
gInstall('ms', isMs, SMS, msEvaluate, msEvalAsk, msAnswerAsk);
