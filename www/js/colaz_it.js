'use strict';
/* =====================================================================
   CAPITOLO 12: «La colazione» (lezione 63, livello 3). Si carica dopo verbs_it.js (i due colleghi).
   La mattina (il sole nell'angolo) Max o Isa mangiano o bevono qualcosa (la cosa alla bocca):
     A colazione Max mangia un cornetto.                  → ripete
     A colazione Max mangia un cornetto?                  → Sì, Max mangia un cornetto.
     Max mangia una mela?                                 → No, Max non mangia una mela.
     Max mangia un cornetto o il pane?                    → Max mangia un cornetto.
     Che cosa mangia Max a colazione?                     → Max mangia un cornetto.   (va bene anche «Mangia un cornetto.» o «Un cornetto.»)
   Le parole nuove: il cornetto, il pane con la marmellata, la mela, il latte, il caffè, il succo d'arancia.
   Il punto: mangia + cibo, beve + bevanda. Errori: «beve un cornetto», «mangia il latte», la cosa sbagliata.
   ===================================================================== */

const CZ_FOOD = {
  cornetto: { the: 'un cornetto',        verb: 'mangia', word: 'cornetto' },
  pane:     { the: 'il pane con la marmellata', short: 'il pane', verb: 'mangia', word: 'pane' },
  mela:     { the: 'una mela',           verb: 'mangia', word: 'mela' },
  latte:    { the: 'il latte',           verb: 'beve',   word: 'latte' },
  caffe:    { the: 'un caffè',           verb: 'beve',   word: 'caffe' },
  succo:    { the: 'un succo d\'arancia', verb: 'beve',  word: 'succo' }
};
const CZ = { cz_m_cornetto: 1, cz_f_pane: 1, cz_m_mela: 1, cz_f_latte: 1, cz_m_caffe: 1, cz_f_succo: 1 };
const isCz = (X) => !!CZ[X];
const czWho = (X) => X.charAt(3);
const czFood = (X) => X.slice(5);
const czName = (X) => vName(czWho(X));
const czDoes = (f, short) => CZ_FOOD[f].verb + ' ' + (short && CZ_FOOD[f].short ? CZ_FOOD[f].short : CZ_FOOD[f].the);     // «mangia un cornetto»
const czSay = (X, f, short) => czName(X) + ' ' + czDoes(f || czFood(X), short);
const czQ = (X) => 'Che cosa ' + CZ_FOOD[czFood(X)].verb + ' ' + czName(X) + ' a colazione?';
const czOther = (X) => pick(Object.keys(CZ_FOOD).filter(f => f !== czFood(X) && CZ_FOOD[f].verb === CZ_FOOD[czFood(X)].verb));

/* ---------- Figure: il cibo (da solo, per il menù) e la persona che lo mangia o lo beve, con il sole della mattina ---------- */
const CZ_FIG = {
  cornetto: '<path d="M22 58 q6 -26 28 -28 q22 2 28 28 q-6 6 -14 4 q-6 -14 -14 -14 q-8 0 -14 14 q-8 2 -14 -4z" fill="#d9a25a"/><path d="M36 40 q4 10 2 22 M50 34 v26 M64 40 q-4 10 -2 22" stroke="#b07a3a" stroke-width="2" fill="none"/>',
  pane: '<path d="M18 62 q0 -26 32 -26 q32 0 32 26z" fill="#d9a25a"/><path d="M18 62 h64 v8 h-64z" fill="#c48a44"/><path d="M30 46 q6 -4 12 0 M48 42 q6 -4 12 0 M64 46 q5 -3 10 0" stroke="#b07a3a" stroke-width="2" fill="none"/>' +
    '<ellipse cx="50" cy="40" rx="14" ry="4" fill="#b8323b" opacity=".9"/>',
  mela: '<circle cx="50" cy="54" r="22" fill="#c8323b"/><circle cx="42" cy="46" r="6" fill="#e05a62" opacity=".7"/><path d="M50 32 q2 -10 6 -14" stroke="#6e4f33" stroke-width="3" fill="none"/><path d="M54 26 q10 -8 16 0 q-8 6 -16 0z" fill="#5a9a46"/>',
  latte: '<path d="M36 20 h28 l-4 60 h-20z" fill="#eef2f6" opacity=".55"/><path d="M37.5 34 h25 l-3 46 h-19z" fill="#f7f8fa"/><path d="M36 20 h28" stroke="#cfd4dc" stroke-width="1.5"/>',
  caffe: '<path d="M34 46 h28 v14 q0 12 -14 12 q-14 0 -14 -12z" fill="#f3eee2"/><ellipse cx="48" cy="46" rx="14" ry="3.4" fill="#5a3a24"/><path d="M62 50 q8 0 8 6 q0 6 -8 6" fill="none" stroke="#f3eee2" stroke-width="3"/>' +
    '<ellipse cx="48" cy="74" rx="20" ry="3.4" fill="#e2dccd"/><path d="M42 40 q-3 -5 0 -10 M50 40 q-3 -5 0 -10" stroke="#e9edf2" stroke-width="1.8" fill="none" opacity=".8"/>',
  succo: '<path d="M36 20 h28 l-4 60 h-20z" fill="#eef2f6" opacity=".55"/><path d="M37.5 30 h25 l-3.3 50 h-18.4z" fill="#f0a030"/><path d="M36 20 h28" stroke="#cfd4dc" stroke-width="1.5"/>' +
    '<circle cx="64" cy="22" r="8" fill="#e8862a"/><circle cx="64" cy="22" r="5.5" fill="#f5c26b"/><path d="M64 16.5 v11 M58.5 22 h11" stroke="#e8862a" stroke-width="1"/>'
};
Object.keys(CZ_FOOD).forEach(f => { FIG['cz_' + f] = FLAT(CZ_FIG[f], 26); });
function czFig(X) {
  const k = p3Key(czWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return FIG['cz_' + czFood(X)];
  const food = '<g transform="translate(66 36) scale(.48) translate(-50 -50)">' + CZ_FIG[czFood(X)] + '</g>';
  const sun = '<g transform="translate(86 14)"><circle r="7" fill="#f3d36b"/><path d="M0 -12 v3 M0 9 v3 M-12 0 h3 M9 0 h3 M-8.5 -8.5 l2 2 M6.5 6.5 l2 2 M-8.5 8.5 l2 -2 M6.5 -6.5 l2 -2" stroke="#f3d36b" stroke-width="2" stroke-linecap="round"/></g>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' + sun +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 62], [64, 44]) + food, { mouth: 'open' }, -10) + '</svg>';
}
Object.keys(CZ).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => czFig(X) }); });

const SCZ = gTag('cz', {
  present: (X) => { const p = 'A colazione ' + czSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: 'A colazione ' + czSay(X) + '?', model: 'Sì, ' + czSay(X) + '.' }),
  neg: (X) => { const o = czOther(X); return { type: 'neg', show: X, ask: o, prompt: czSay(X, o) + '?', model: 'No, ' + czName(X) + ' non ' + czDoes(o) + '.', complete: czSay(X) + '.' }; },
  alt: (X) => { const o = czOther(X), ord = Math.random() < 0.5 ? [czFood(X), o] : [o, czFood(X)];
    return { type: 'alt', show: X, prompt: czSay(X, ord[0], true) + ' o ' + (CZ_FOOD[ord[1]].short || CZ_FOOD[ord[1]].the) + '?', model: czSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: czQ(X), model: czSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: czQ(X) + ' ' + czSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: czQ(X), model: czQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) mangia un cornetto», «beve il latte», anche solo «un cornetto» ---------- */
const CZ_WORD = { cornetto: 'cornetto', cornetti: 'cornetto', pane: 'pane', mela: 'mela', mele: 'mela', latte: 'latte', caffe: 'caffe', succo: 'succo', spremuta: 'succo' };
function czStatements(s) {
  s = s.replace(/ (che )?cosa (mangia|beve) [a-z]+ a colazione /g, ' # ').replace(/ a colazione /g, ' ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = CZ_WORD[w[i]];
    if (!f) continue;
    // indietro: l'articolo, il verbo, il «non», il nome
    let j = i - 1;
    if (/^(un|una|uno|il|la|lo|l|del|della|dello|dell)$/.test(w[j] || '')) j--;
    let verb = null, neg = false, subj = null;
    if (/^(mangia|beve|mangio|bevo|mangiano|bevono|mangiare|bere)$/.test(w[j] || '')) { verb = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]];
    // «il pane con la marmellata»: la marmellata non è un'altra cosa
    if (f === 'pane' && w[i + 1] === 'con') i += 3;
    out.push({ f: f, verb: verb, neg: neg, subj: subj });
  }
  return out;
}
const czGood = (x, X, f) => x.f === f && (x.verb === null || x.verb === CZ_FOOD[f].verb) && (x.subj === null || x.subj === czWho(X));
function czEvaluate(step, text) {
  const s = gNorm(text), X = step.show, f = czFood(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(czQ(X)).trim()) || has(s, gNorm(czQ(X)).trim().replace(/ a colazione$/, '')), full: true };
  const st = czStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => czGood(x, X, f), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.verb) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && czGood(neg[0], X, step.ask) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function czEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || czQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa mangia') || has(s, 'cosa beve')) return has(s, 'cosa ' + CZ_FOOD[czFood(X)].verb) ? { ok: true, kind: 'what' } : bad();
  const st = czStatements(s);
  if (st.length === 1 && st[0].verb === CZ_FOOD[st[0].f].verb && (st[0].subj === null || st[0].subj === czWho(X))) return { ok: true, kind: st[0].f === czFood(X) ? 'yes' : 'no', ask: st[0].f };
  if (st.length === 1) return bad(czSay(X, st[0].f) + '?');
  return bad();
}
function czAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + czSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + czName(X) + ' non ' + czDoes(r.ask) + '. ' + czSay(X) + '.';
  return czSay(X) + '.';
}
gInstall('cz', isCz, SCZ, czEvaluate, czEvalAsk, czAnswerAsk);
