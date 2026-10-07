'use strict';
/* =====================================================================
   CAPITOLO 9: «Biglietto da visita: nome, città, lavoro» (lezione 57, livello 2). Si carica dopo lui_it.js e geo_it.js.
   Due biglietti da visita (la faccia, il nome, la città, il segno del lavoro); la freccia d'oro indica la riga della domanda:
     Si chiama Marco Rossi.  Abita a Roma.  È un cuoco.      → ripete
     Come si chiama?                                          → Si chiama Marco Rossi.
     Dove abita?                                              → Abita a Roma.
     Che lavoro fa?                                           → È un cuoco.   (va bene anche «Fa il cuoco.»)
     Si chiama Anna Bianchi?                                  → No, non si chiama Anna Bianchi.
   Il punto: «si chiama», «abita a», «che lavoro fa?». Il lavoro come nella lezione 49 (un cuoco, una professoressa).
   Errori: il nome dell'altro biglietto, «abita in Roma», «è un professoressa», la riga sbagliata.
   ===================================================================== */

const BV_CARD = {
  1: { name: 'Marco Rossi',  g: 'm', city: 'roma',   job: 'cuoco',      look: 'f_padre' },
  2: { name: 'Anna Bianchi', g: 'f', city: 'parigi', job: 'professore', look: 'f_madre' }
};
const BV = { bv_1_nome: 1, bv_1_citta: 1, bv_1_lavoro: 1, bv_2_nome: 1, bv_2_citta: 1, bv_2_lavoro: 1 };
const BV_CITIES = ['roma', 'parigi', 'londra', 'newyork'];
const isBv = (X) => !!BV[X];
const bvC = (X) => BV_CARD[X.charAt(3)];
const bvKind = (X) => X.slice(5);
const bvJob = (c, j) => (c.g === 'f' ? 'una ' : 'un ') + LM_JOB[j || c.job][c.g];                  // «un cuoco», «una professoressa»
// le frasi per ogni riga: v = il valore (nome, città, lavoro); neg = con «non»
const bvLine = {
  nome:   (c, v, neg) => (neg ? 'non ' : '') + 'si chiama ' + (v || c.name),
  citta:  (c, v, neg) => (neg ? 'non ' : '') + 'abita a ' + GEO[v || c.city].name,
  lavoro: (c, v, neg) => (neg ? 'non ' : '') + 'è ' + bvJob(c, v)
};
const BV_Q = { nome: 'Come si chiama?', citta: 'Dove abita?', lavoro: 'Che lavoro fa?' };
const bvSay = (X, v, neg) => bvLine[bvKind(X)](bvC(X), v, neg);
const bvVal = (X) => { const c = bvC(X); return bvKind(X) === 'nome' ? c.name : bvKind(X) === 'citta' ? c.city : c.job; };
const bvOther = (X) => { const k = bvKind(X), c = bvC(X);
  if (k === 'nome') return BV_CARD[X.charAt(3) === '1' ? 2 : 1].name;
  if (k === 'citta') return pick(BV_CITIES.filter(x => x !== c.city));
  return pick(Object.keys(LM_JOB).filter(j => j !== c.job)); };

/* ---------- Figura: il biglietto da visita ---------- */
function bvFig(X) {
  const c = bvC(X), row = { nome: 0, citta: 1, lavoro: 2 }[bvKind(X)];
  const LK = typeof FAM_LOOK !== 'undefined' ? FAM_LOOK[c.look] : null;
  const face = LK && typeof tHeadStill === 'function' ? '<g transform="translate(22 46) scale(.62) translate(-50 -26)">' + tHeadStill(LK, { mouth: 'smile' }) + '</g>' : '';
  const jobIcon = c.job === 'cuoco'
    ? '<path d="M41 13 q-6 -4 -3 -10 q3 -5 8 -3 q4 -5 8 0 q5 -2 8 3 q3 6 -3 10z" fill="#f7f8fa" stroke="#9aa1ad" stroke-width="1"/><rect x="41" y="11" width="18" height="4" rx="1" fill="#f7f8fa" stroke="#9aa1ad" stroke-width="1"/>'
    : '<rect x="36" y="2" width="28" height="18" rx="1.5" fill="#3f6b4f" stroke="#8e6741" stroke-width="2"/><text x="40" y="15" font-size="8" font-family="Georgia, serif" fill="#f3eee2">a b c</text>';
  const ys = [44, 60, 76];
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="24" width="92" height="64" rx="5" fill="#f3eee2"/><rect x="4" y="24" width="92" height="6" rx="3" fill="#5b4a8b"/>' +
    '<circle cx="22" cy="48" r="13" fill="#d8d0bf"/>' + face +
    '<text x="40" y="' + (ys[0] + 3) + '" font-size="9" font-weight="700" font-family="Georgia, serif" fill="#1d2638">' + c.name + '</text>' +
    '<text x="40" y="' + (ys[1] + 3) + '" font-size="8" font-family="Inter, Arial, sans-serif" fill="#3a4258">' + GEO[c.city].name + '</text>' +
    '<g transform="translate(40 ' + (ys[2] - 11) + ') scale(.9) translate(-36 0)">' + jobIcon + '</g>' +
    // la freccia d'oro a sinistra della riga chiesta
    '<path d="M34 ' + (ys[row] - 4) + ' l5 4 l-5 4z" fill="#c9a45c"/></svg>';
}
Object.keys(BV).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => bvFig(X) }); });

const SBV = gTag('bv', {
  present: (X) => { const p = gCap(bvSay(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: gCap(bvSay(X)) + '?', model: 'Sì, ' + bvSay(X) + '.' }),
  neg: (X) => { const o = bvOther(X); return { type: 'neg', show: X, ask: o, prompt: gCap(bvSay(X, o)) + '?', model: 'No, ' + bvSay(X, o, true) + '.', complete: gCap(bvSay(X)) + '.' }; },
  alt: (X) => { const o = bvOther(X), ord = Math.random() < 0.5 ? [bvVal(X), o] : [o, bvVal(X)], c = bvC(X), k = bvKind(X);
    const second = k === 'nome' ? ord[1] : k === 'citta' ? 'a ' + GEO[ord[1]].name : bvJob(c, ord[1]);
    return { type: 'alt', show: X, prompt: gCap(bvSay(X, ord[0])) + ' o ' + second + '?', model: gCap(bvSay(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: BV_Q[bvKind(X)], model: gCap(bvSay(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: BV_Q[bvKind(X)] + ' ' + gCap(bvSay(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: BV_Q[bvKind(X)], model: BV_Q[bvKind(X)] })
});

/* ---------- Capire le frasi: «(non) si chiama…», «(non) abita a…», «(non) è un cuoco» / «fa il cuoco» ---------- */
function bvStatements(s, X) {
  s = s.replace(/ come si chiama /g, ' # ').replace(/ dove abita /g, ' # ').replace(/ che lavoro fa /g, ' # ').replace(/ new york /g, ' newyork ');
  const c = bvC(X), out = [];
  const names = {};
  Object.keys(BV_CARD).forEach(k => { const n = gNorm(BV_CARD[k].name).trim(); names[n] = BV_CARD[k].name; names[n.split(' ')[0]] = BV_CARD[k].name; });
  let m;
  const reN = / (non )?si chiama ([a-z]+(?: [a-z]+)?)(?= )/g;
  while ((m = reN.exec(s)) !== null) {
    const two = m[2], one = two.split(' ')[0];
    out.push({ k: 'nome', neg: !!m[1], v: names[two] || names[one] || '?' });
  }
  const reC = / (non )?abita (a|in) ([a-z]+)(?= )/g;
  while ((m = reC.exec(s)) !== null) out.push({ k: 'citta', neg: !!m[1], v: BV_CITIES.indexOf(m[3]) !== -1 ? m[3] : '?', ok: m[2] === 'a' });
  const reL = / (non )?(?:(?:e )?(un|una|uno)|fa (il|la|lo)) ([a-z]+)(?= )/g;
  while ((m = reL.exec(s)) !== null) {
    const w = LM_WORD[m[4]];
    if (!w) continue;
    const art = m[2] || m[3], artG = /^(una|la)$/.test(art) ? 'f' : 'm';
    out.push({ k: 'lavoro', neg: !!m[1], v: w.j, ok: w.g === c.g && artG === c.g });
  }
  return out;
}
function bvEvaluate(step, text) {
  const s = gNorm(text), X = step.show, k = bvKind(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(BV_Q[k]).trim()), full: true };
  // «si chiama» non è un «sì»
  const st = bvStatements(s, X), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s.replace(/ si chiama /g, ' chiama '), 'si'), no = has(s, 'no');
  const truth = (x) => x.k === k && x.ok !== false && x.v === bvVal(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].k === k && neg[0].ok !== false && neg[0].v === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function bvEvalAsk(X, text) {
  const s = gNorm(text), k = bvKind(X), bad = (model) => ({ ok: false, model: model || BV_Q[k] });
  if (has(s.replace(/ si chiama /g, ' chiama '), 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(BV_Q[k]).trim())) return { ok: true, kind: 'what' };
  const st = bvStatements(s, X).filter(x => x.k === k);
  if (st.length === 1 && st[0].ok !== false && st[0].v !== '?') return { ok: true, kind: st[0].v === bvVal(X) ? 'yes' : 'no', v: st[0].v };
  return bad();
}
function bvAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + bvSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + bvSay(X, r.v, true) + '. ' + gCap(bvSay(X)) + '.';
  return gCap(bvSay(X)) + '.';
}
gInstall('bv', isBv, SBV, bvEvaluate, bvEvalAsk, bvAnswerAsk);
