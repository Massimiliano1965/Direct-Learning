'use strict';
/* =====================================================================
   CAPITOLO 18: «Si può…» (lezione 89, livello 4). Si carica dopo verbs_it.js (le azioni) e data.js (le cose).
   Due cartelli: verde (si può: la cosa nel cerchio verde) e rosso (non si può: la cosa barrata):
     Qui si può mangiare. Non si può fumare.               → ripete
     Qui si può mangiare?                                  → Sì, qui si può mangiare.
     Qui si può fumare?                                    → No, qui non si può fumare.
     Qui si può mangiare o fumare?                         → Qui si può mangiare.
     Che cosa si può fare qui?                             → Qui si può mangiare.
   I cartelli veri del turista (parole nuove con il disegno): fumare, parcheggiare (la P), fare foto, nuotare; e mangiare, telefonare.
   Il punto: «si può» + il verbo all'infinito.
   Errori: «si può mangia», «si può telefono», l'azione sbagliata.
   ===================================================================== */

const SPU_DO = { smoke: 'fumare', park: 'parcheggiare', photo: 'fare foto', swim: 'nuotare', eat: 'mangiare', phone: 'telefonare' };
const SIPU = { spu_eat_smoke: 1, spu_phone_photo: 1, spu_swim_eat: 1, spu_park_smoke: 1, spu_photo_swim: 1, spu_smoke_park: 1 };
const isSpu = (X) => !!SIPU[X];
const spuYes = (X) => X.split('_')[1];
const spuNo = (X) => X.split('_')[2];
const spuSay = (a, neg) => (neg ? 'non ' : '') + 'si può ' + SPU_DO[a];
const SPU_Q = 'Che cosa si può fare qui?';

/* ---------- Figure: il cartello verde e il cartello rosso barrato ---------- */
// i cartelli veri (Massi: non sempre il libro e il telefono): parole nuove, ognuna con il suo disegno
const SPU_DRAW = {
  smoke: '<rect x="-14" y="-2" width="22" height="5" rx="1" fill="#f3eee2" stroke="#5d6577" stroke-width="1"/><rect x="8" y="-2" width="6" height="5" fill="#e8862a"/>' +
    '<path d="M11 -4 q-3 -4 0 -7 q3 -3 0 -7" stroke="#8d93a3" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  park: '<rect x="-11" y="-11" width="22" height="22" rx="3" fill="#2f6fc0"/><text y="7.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" font-weight="bold" fill="#fff">P</text>',
  photo: '<rect x="-13" y="-7" width="26" height="17" rx="3" fill="#3a4152"/><rect x="-6" y="-10" width="9" height="4" rx="1" fill="#3a4152"/><circle cy="1.5" r="5.6" fill="#9fc6e2" stroke="#d5dbe3" stroke-width="1.6"/>' +
    '<circle cx="9" cy="-3.5" r="1.4" fill="#f3d36b"/>',
  swim: '<circle cx="-7" cy="-6" r="3.2" fill="#2c3e66"/><path d="M-4 -3 l9 3 l5 -6" stroke="#2c3e66" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M-14 6 q3.5 -3 7 0 t7 0 t7 0 t7 0 M-14 11 q3.5 -3 7 0 t7 0 t7 0 t7 0" stroke="#3f8fd0" stroke-width="2" fill="none"/>',
  eat: '<path d="M-6 -12 v8 q0 3 2 4 v12 M-8 -12 v7 M-4 -12 v7" stroke="#5d6577" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M5 12 v-24 q6 4 6 12 q0 3 -6 4" stroke="#5d6577" stroke-width="1.8" fill="#8d93a3" stroke-linejoin="round"/>',
  phone: '<path d="M-12 -6 q0 -6 6 -6 h12 q6 0 6 6 l-4 3 h-4 l-1 -3 h-6 l-1 3 h-4z" fill="#2c3e66" transform="rotate(-10)"/>' +
    '<path d="M-9 4 h18 l3 8 h-24z" fill="#2c3e66"/><circle cy="7.5" r="2.4" fill="#f3eee2"/>'
};
function spuSign(a, ok, x) {
  const icon = '<g transform="translate(' + x + ' 50)">' + SPU_DRAW[a] + '</g>';
  return '<circle cx="' + x + '" cy="50" r="22" fill="#f3eee2"/>' + icon +
    '<circle cx="' + x + '" cy="50" r="21" fill="none" stroke="' + (ok ? '#3fb35f' : '#d23c44') + '" stroke-width="5"/>' +
    (ok ? '<g transform="translate(' + (x + 14) + ' 32)"><circle r="7" fill="#3fb35f"/><path d="M-3.5 0 l2.5 2.6 l4.6 -5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>'
        : '<path d="M' + (x - 15) + ' 35 L' + (x + 15) + ' 65" stroke="#d23c44" stroke-width="5" stroke-linecap="round"/>') +
    '<rect x="' + (x - 2) + '" y="72" width="4" height="22" fill="#8d93a3"/>';
}
Object.keys(SIPU).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + spuSign(spuYes(X), true, 26) + spuSign(spuNo(X), false, 74) + '</svg>' }); });

const SSPU = gTag('spu', {
  present: (X) => { const p = 'Qui ' + spuSay(spuYes(X)) + '. ' + gCap(spuSay(spuNo(X), true)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: 'Qui ' + spuSay(spuYes(X)) + '?', model: 'Sì, qui ' + spuSay(spuYes(X)) + '.' }),
  neg: (X) => ({ type: 'neg', show: X, ask: spuNo(X), prompt: 'Qui ' + spuSay(spuNo(X)) + '?', model: 'No, qui ' + spuSay(spuNo(X), true) + '.', complete: 'Qui ' + spuSay(spuYes(X)) + '.' }),
  alt: (X) => { const ord = Math.random() < 0.5 ? [spuYes(X), spuNo(X)] : [spuNo(X), spuYes(X)];
    return { type: 'alt', show: X, prompt: 'Qui ' + spuSay(ord[0]) + ' o ' + SPU_DO[ord[1]] + '?', model: 'Qui ' + spuSay(spuYes(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: SPU_Q, model: 'Qui ' + spuSay(spuYes(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: SPU_Q + ' Qui ' + spuSay(spuYes(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: SPU_Q, model: SPU_Q })
});

/* ---------- Capire le frasi: «(qui) (non) si può leggere» ---------- */
const SPU_WORD = {};
Object.keys(SPU_DO).forEach(a => { SPU_WORD[SPU_DO[a].split(' ')[0]] = a; });
function spuStatements(s) {
  s = s.replace(/ che cosa si puo fare( qui)? /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'si' || w[i + 1] !== 'puo') continue;
    const neg = w[i - 1] === 'non', v = w[i + 2], a = SPU_WORD[v] || (VFORM[v] && VFORM[v].act) || null;
    let ok = !!SPU_WORD[v];
    if (ok && a === 'photo') ok = /^(foto|fotografie)$/.test(w[i + 3] || '') || w[i + 3] === 'le' && w[i + 4] === 'foto';
    out.push({ a: a, neg: neg, ok: ok });
    i += 2;
  }
  return out;
}
function evaluateSpu(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che cosa si puo fare'), full: true };
  const st = spuStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s.replace(/ si (?=puo )/g, ' '), 'si'), no = has(s, 'no');      // il «sì» della risposta, non il «si» di «si può»
  const okPos = (x) => x.ok && x.a === spuYes(X), okNeg = (x) => x.ok && x.a === spuNo(X), allPos = pos.every(okPos), allNeg = neg.every(okNeg);
  switch (step.type) {
    case 'echo': return { ok: pos.some(okPos) && allPos && allNeg, full: true };
    case 'yes': return { ok: yes && !no && pos.some(okPos) && allPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && okNeg(neg[0]) && allPos, full: pos.some(okPos) };
    default: return { ok: pos.some(okPos) && allPos && allNeg && !no && !has(s, 'o'), full: true };
  }
}
function evalAskSpu(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || SPU_Q });
  if (has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa si puo fare')) return { ok: true, kind: 'what' };
  const st = spuStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].a === spuYes(X) ? 'yes' : st[0].a === spuNo(X) ? 'no' : 'none', ask: st[0].a };
  return bad();
}
function answerAskSpu(X, r) {
  if (r.kind === 'yes') return 'Sì, qui ' + spuSay(spuYes(X)) + '.';
  if (r.kind === 'no') return 'No, qui ' + spuSay(spuNo(X), true) + '. Qui ' + spuSay(spuYes(X)) + '.';
  if (r.kind === 'none') return 'Qui ' + spuSay(spuYes(X)) + '. ' + gCap(spuSay(spuNo(X), true)) + '.';
  return 'Qui ' + spuSay(spuYes(X)) + '.';
}
gInstall('spu', isSpu, SSPU, evaluateSpu, evalAskSpu, answerAskSpu);
