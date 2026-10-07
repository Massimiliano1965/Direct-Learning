'use strict';
/* =====================================================================
   CAPITOLO 8: «Calendario: i giorni» (lezione 50, livello 2). Si carica dopo gen_it.js.
   La settimana: sette caselle (L M M G V S D), il giorno di oggi in oro con la freccia:
     Oggi è martedì.                         → ripete
     Oggi è martedì?                         → Sì, oggi è martedì.
     Oggi è giovedì?                         → No, oggi non è giovedì.
     Oggi è martedì o mercoledì?             → Oggi è martedì.
     Che giorno è oggi?                      → Oggi è martedì.   (va bene anche «È martedì.»)
   Errori: il giorno sbagliato (guardare il posto nella settimana: martedì e mercoledì hanno tutti e due la M).
   ===================================================================== */

const DAYS = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const DAY_INIT = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const DAY_WORD = {};
DAYS.forEach((d, i) => { DAY_WORD[d.replace('ì', 'i')] = i; });
const GD = { gd_lun: 0, gd_mar: 1, gd_mer: 2, gd_gio: 3, gd_ven: 4, gd_sab: 5, gd_dom: 6 };
const isGd = (X) => GD[X] !== undefined;
const gdDay = (X, i) => DAYS[i === undefined ? GD[X] : i];
const gdSay = (X, i) => 'Oggi è ' + gdDay(X, i);
const GD_Q = 'Che giorno è oggi?';
// la domanda «no»: spesso il giorno vicino, così si guarda bene il posto
const gdOther = (X) => { const i = GD[X], near = [i - 1, i + 1].filter(j => j >= 0 && j < 7); return Math.random() < 0.6 ? pick(near) : pick([0, 1, 2, 3, 4, 5, 6].filter(j => j !== i)); };

/* ---------- Figura: la settimana, oggi in oro (sabato e domenica in rosa) ---------- */
function gdFig(X) {
  const t = GD[X];
  let s = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="26" width="92" height="44" rx="6" fill="#f3eee2"/><rect x="4" y="26" width="92" height="10" rx="5" fill="#5b4a8b"/>' +
    '<circle cx="24" cy="26" r="2.4" fill="#2a3346"/><circle cx="76" cy="26" r="2.4" fill="#2a3346"/>';
  for (let i = 0; i < 7; i++) {
    const x = 7 + i * 12.6, on = i === t, we = i >= 5;
    s += '<rect x="' + x + '" y="40" width="11" height="26" rx="2.5" fill="' + (on ? '#c9a45c' : we ? '#f4dbe6' : '#e2dccd') + '"' + (on ? ' stroke="#8e6a2a" stroke-width="1"' : '') + '/>' +
      '<text x="' + (x + 5.5) + '" y="58" text-anchor="middle" font-size="9" font-weight="700" font-family="Inter, Arial, sans-serif" fill="' + (on ? '#1d2638' : we ? '#b0607a' : '#5a5f6e') + '">' + DAY_INIT[i] + '</text>';
  }
  const ax = 7 + t * 12.6 + 5.5;
  return s + '<path d="M' + (ax - 5) + ' 10 h10 l-5 9z" fill="#c9a45c"/></svg>';
}
Object.keys(GD).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => gdFig(X) }); });

const SGD = gTag('gd', {
  present: (X) => { const p = gdSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: gdSay(X) + '?', model: 'Sì, oggi è ' + gdDay(X) + '.' }),
  neg: (X) => { const o = gdOther(X); return { type: 'neg', show: X, ask: o, prompt: gdSay(X, o) + '?', model: 'No, oggi non è ' + DAYS[o] + '.', complete: gdSay(X) + '.' }; },
  alt: (X) => { const o = gdOther(X), ord = Math.random() < 0.5 ? [GD[X], o] : [o, GD[X]];
    return { type: 'alt', show: X, prompt: 'Oggi è ' + DAYS[ord[0]] + ' o ' + DAYS[ord[1]] + '?', model: gdSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: GD_Q, model: gdSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: GD_Q + ' ' + gdSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: GD_Q, model: GD_Q })
});

/* ---------- Capire le frasi: «(oggi) (non) è martedì» ---------- */
function gdStatements(s) {
  s = s.replace(/ che giorno e oggi /g, ' # ');
  const out = [], re = / (non )?(?:e )?([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (DAY_WORD[m[2]] === undefined) { if (m[1]) re.lastIndex -= m[2].length + 1; continue; }
    out.push({ d: DAY_WORD[m[2]], neg: !!m[1] });
  }
  return out;
}
function gdEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che giorno e'), full: true };
  const st = gdStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const allPos = pos.every(x => x.d === GD[X]), hasPos = pos.length > 0 && allPos;
  switch (step.type) {
    case 'echo': return { ok: hasPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && hasPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].d === step.ask && allPos, full: hasPos };
    default: return { ok: hasPos && !neg.length && !yes && !no && !has(s, 'o') && !has(s, 'che giorno'), full: true };
  }
}
function gdEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || GD_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che giorno e')) return { ok: true, kind: 'what' };
  const st = gdStatements(s);
  if (st.length === 1) return { ok: true, kind: st[0].d === GD[X] ? 'yes' : 'no', ask: st[0].d };
  return bad();
}
function gdAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, oggi è ' + gdDay(X) + '.';
  if (r.kind === 'no') return 'No, oggi non è ' + DAYS[r.ask] + '. ' + gdSay(X) + '.';
  return gdSay(X) + '.';
}
gInstall('gd', isGd, SGD, gdEvaluate, gdEvalAsk, gdAnswerAsk);
