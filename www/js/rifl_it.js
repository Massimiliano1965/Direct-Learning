'use strict';
/* =====================================================================
   CAPITOLO 13: «Verbi riflessivi» (lezione 68, livello 3). Si carica dopo verbs_it.js (i due colleghi) e chiama_it.js.
   Max o Isa: si alza (dalla sedia, freccia verde in su), si siede (freccia in giù), si lava le mani (l'acqua), si pettina (il pettine):
     Max si alza.                            → ripete
     Che cosa fa Max?                        → Max si alza.   (va bene anche «Si alza.»)
     Max si siede?                           → No, Max non si siede.
     Max si alza o si siede?                 → Max si alza.
   Il punto: «si» davanti al verbo (come «si chiama», lezione 59). «si …» sottolineato.
   Errori: «Max alza» (senza «si»), «Max si alzo», «Max mi alzo», il verbo sbagliato.
   ===================================================================== */

const RF_ACT = {
  alza:    { v: 'si alza' },
  siede:   { v: 'si siede' },
  lava:    { v: 'si lava le mani' },
  pettina: { v: 'si pettina' }
};
const RF = { rf_m_alza: 1, rf_f_siede: 1, rf_m_lava: 1, rf_f_pettina: 1, rf_m_siede: 1, rf_f_alza: 1 };
const isRf = (X) => !!RF[X];
const rfWho = (X) => X.charAt(3);
const rfAct = (X) => X.slice(5);
const rfName = (X) => vName(rfWho(X));
const rfSay = (X, a) => rfName(X) + ' ' + RF_ACT[a || rfAct(X)].v;
const rfQ = (X) => 'Che cosa fa ' + rfName(X) + '?';
const rfOther = (X) => { const a = rfAct(X); return a === 'alza' ? 'siede' : a === 'siede' ? 'alza' : pick(Object.keys(RF_ACT).filter(k => k !== a)); };

/* ---------- Figure ---------- */
// la sedia: lo schienale (dietro) e il sedile con le gambe (davanti)
const RF_BACK = (x, y) => '<rect x="' + x + '" y="' + y + '" width="28" height="26" rx="2" fill="#8e6741"/><rect x="' + (x + 3) + '" y="' + (y + 5) + '" width="22" height="3" fill="#a37a52"/><rect x="' + (x + 3) + '" y="' + (y + 13) + '" width="22" height="3" fill="#a37a52"/>';
const RF_SEAT = (x, y) => '<rect x="' + (x - 3) + '" y="' + y + '" width="34" height="6" rx="1.5" fill="#a37a52"/><rect x="' + (x - 1) + '" y="' + (y + 6) + '" width="3.6" height="' + (88 - y) + '" fill="#6e4f33"/><rect x="' + (x + 25.4) + '" y="' + (y + 6) + '" width="3.6" height="' + (88 - y) + '" fill="#6e4f33"/>';
function rfFig(X) {
  const k = p3Key(rfWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const a = rfAct(X), svg = (inner) => '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="36" ry="3" fill="#000" opacity=".25"/>' + inner + '</svg>';
  if (a === 'siede') {
    // seduto sulla sedia (il sedile davanti), la freccia verde in giù
    return svg(RF_BACK(36, 44) + '<g transform="translate(0 12)">' + tTorso(LK) + tHeadStill(LK, { mouth: 'smile' }) + tArm(LK, [35, 47], [30, 66], [36, 76]) + tArm(LK, [65, 47], [70, 66], [64, 76]) + '</g>' +
      RF_SEAT(36, 82) + vArrow([84, 14], [92, 28], [84, 44]));
  }
  if (a === 'alza') {
    // in piedi, accanto alla sedia vuota, la freccia verde in su
    return svg(RF_BACK(64, 38) + RF_SEAT(64, 70) + '<g transform="translate(-20 4)">' + tTorso(LK) + tHeadStill(LK, { mouth: 'smile' }) + tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [72, 64], [76, 72]) + '</g>' +
      vArrow([50, 40], [58, 26], [50, 10]));
  }
  if (a === 'lava') return svg('<path d="M64 6 h14 v8 h-6 v6" fill="none" stroke="#b9bdc8" stroke-width="3"/><path d="M72 22 q-2 6 0 10 M68 26 q-2 6 0 10 M76 26 q-2 6 0 10" stroke="#8fc4e6" stroke-width="2" fill="none"/>' +
    '<ellipse cx="72" cy="80" rx="20" ry="5" fill="#dfe4ea"/>' + V_PERSON(LK, tArm(LK, [35, 47], [50, 60], [66, 46]) + tArm(LK, [65, 47], [74, 62], [76, 46]), { mouth: 'smile' }, -14) +
    '<circle cx="66" cy="44" r="1.6" fill="#8fc4e6"/><circle cx="76" cy="42" r="1.6" fill="#8fc4e6"/>');
  // si pettina: il pettine sui capelli
  return svg(V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 34], [60, 14]) +
    '<g transform="rotate(-20 56 12)"><rect x="44" y="9" width="22" height="4" rx="1.5" fill="#e8b81e"/><path d="M46 13 v4 M49 13 v4 M52 13 v4 M55 13 v4 M58 13 v4 M61 13 v4 M64 13 v4" stroke="#e8b81e" stroke-width="1.2"/></g>', { mouth: 'smile' }));
}
Object.keys(RF).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => rfFig(X) }); });

const SRF = gTag('rf', {
  present: (X) => { const p = rfSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: rfSay(X) + '?', model: 'Sì, ' + rfSay(X) + '.' }),
  neg: (X) => { const o = rfOther(X); return { type: 'neg', show: X, ask: o, prompt: rfSay(X, o) + '?', model: 'No, ' + rfName(X) + ' non ' + RF_ACT[o].v + '.', complete: rfSay(X) + '.' }; },
  alt: (X) => { const o = rfOther(X), ord = Math.random() < 0.5 ? [rfAct(X), o] : [o, rfAct(X)];
    return { type: 'alt', show: X, prompt: rfSay(X, ord[0]) + ' o ' + RF_ACT[ord[1]].v + '?', model: rfSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: rfQ(X), model: rfSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: rfQ(X) + ' ' + rfSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: rfQ(X), model: rfQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) si alza» ---------- */
// le forme del verbo che si riconoscono (le sbagliate: si leggono, ma sono sbagliate)
const RF_FORM = { alza: 'alza', alzo: 'alza', alzare: 'alza', siede: 'siede', siedo: 'siede', sede: 'siede', lava: 'lava', lavo: 'lava', pettina: 'pettina', pettino: 'pettina', pettinare: 'pettina' };
// il «si» del verbo non è un «sì»
const rfNoRefl = (s) => s.replace(/ si ([a-z]+)(?= )/g, (m, v) => RF_FORM[v] ? ' # ' + v : m);
function rfStatements(s) {
  s = s.replace(/ (che )?cosa fa [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const a = RF_FORM[w[i]];
    if (!a) continue;
    let j = i - 1, refl = null, neg = false, subj = null;
    if (/^(si|mi|ti|ci|vi)$/.test(w[j] || '')) { refl = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]];
    const form = RF_ACT[a].v.split(' ')[1];
    const objOk = a !== 'lava' || (w[i + 1] === 'le' && w[i + 2] === 'mani');
    out.push({ act: a, ok: refl === 'si' && w[i] === form && objOk, neg: neg, subj: subj });
  }
  return out;
}
function rfEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(rfQ(X)).trim()), full: true };
  // «sì» all'inizio, non il «si» del verbo
  const st = rfStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(rfNoRefl(s), 'si'), no = has(s, 'no');
  const truth = (x) => x.ok && x.act === rfAct(X) && (x.subj === null || x.subj === rfWho(X)), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function rfEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || rfQ(X) });
  if (has(rfNoRefl(s), 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa fa')) return has(s, norm(vName(rfWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = rfStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === rfAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(rfSay(X, st[0].act) + '?');
  return bad();
}
function rfAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + rfSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + rfName(X) + ' non ' + RF_ACT[r.ask].v + '. ' + rfSay(X) + '.';
  return rfSay(X) + '.';
}
gInstall('rf', isRf, SRF, rfEvaluate, rfEvalAsk, rfAnswerAsk);
