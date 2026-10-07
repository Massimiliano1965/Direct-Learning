'use strict';
/* =====================================================================
   CAPITOLO 5: «Quanto costa? Quanto costano?» (lezione 34). Si carica dopo gen_it.js e numbers_it.js.
   Le cose con il cartellino del prezzo (in euro). Una cosa «costa», più cose «costano»;
   e gli articoli al plurale: il libro → i libri, la penna → le penne.
     Il libro costa dodici euro.  Le penne costano tre euro.   → ripete
     Il libro costa dodici euro?                               → Sì, costa dodici euro.
     Le tazze costano dieci euro?                              → No, non costano dieci euro.
     Il libro costa dodici o venti euro?                       → Costa dodici euro.
     Quanto costa il libro? / Quanto costano le penne?         → Costa dodici euro. / Costano tre euro.
   «costa» e «costano» sottolineati in oro. Il microfono scrive spesso «12 €»: va bene.
   Errori: «costano» per una cosa, «costa» per più cose, «è dodici euro», il prezzo sbagliato.
   ===================================================================== */

const COSTS = {
  co_book_1: 12, co_pen_2: 3, co_suitcase_1: 80, co_cup_2: 8, co_phone_1: 300, co_notebook_3: 6
};
const isCo = (X) => !!COSTS[X];
const coObj = (X) => X.split('_')[1];
const coN = (X) => +X.split('_')[2];
const coP = (X) => COSTS[X];
const coVerb = (n) => n === 1 ? 'costa' : 'costano';
const coThe = (X) => gThe(coObj(X), coN(X));                                         // «il libro», «le penne»
const coEuro = (p) => numWord(p) + ' euro';
const coSay = (X, p) => gCap(coThe(X)) + ' ' + coVerb(coN(X)) + ' ' + coEuro(p || coP(X));     // «Le penne costano tre euro»
const coShort = (X) => gCap(coVerb(coN(X))) + ' ' + coEuro(coP(X)) + '.';
const coQ = (X) => 'Quanto ' + coVerb(coN(X)) + ' ' + coThe(X) + '?';
function coOther(X) {
  const p = coP(X), c = [p * 2, p + 10, p + 5, p > 3 ? p - 2 : p + 1].filter(x => x !== p && x >= 1 && x <= 1000);
  return pick(c);
}

/* ---------- Figura: la cosa (o le cose) con il cartellino del prezzo ---------- */
function coFig(X) {
  const t = coP(X) + ' €', w = 10 + t.length * 6.4;
  const svg = gMany(FIG[coObj(X)], coN(X));
  const tag = '<g transform="rotate(-8 80 22)"><path d="M' + (92 - w) + ' 14 h' + w + ' v16 h-' + w + ' l-6 -8z" fill="#f3eee2" stroke="#c9a45c" stroke-width="1.2"/>' +
    '<circle cx="' + (92 - w + 1) + '" cy="22" r="1.6" fill="#c9a45c"/>' +
    '<text x="' + (92 - w / 2 + 2) + '" y="26.5" font-size="12" font-weight="700" font-family="Arial, sans-serif" fill="#1d2638" text-anchor="middle">' + t + '</text></g>';
  return svg.replace('</svg>', tag + '</svg>');
}
Object.keys(COSTS).forEach(X => { FIG[X] = coFig(X); });

const SCO = gTag('co', {
  present: (X) => { const p = coSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: coSay(X) + '?', model: 'Sì, ' + coVerb(coN(X)) + ' ' + coEuro(coP(X)) + '.' }),
  neg: (X) => { const o = coOther(X); return { type: 'neg', show: X, ask: o, prompt: coSay(X, o) + '?', model: 'No, non ' + coVerb(coN(X)) + ' ' + coEuro(o) + '.', complete: coShort(X) }; },
  alt: (X) => { const o = coOther(X), ord = Math.random() < 0.5 ? [coP(X), o] : [o, coP(X)];
    return { type: 'alt', show: X, prompt: gCap(coThe(X)) + ' ' + coVerb(coN(X)) + ' ' + numWord(ord[0]) + ' o ' + numWord(ord[1]) + ' euro?', model: coShort(X) }; },
  key: (X) => ({ type: 'key', show: X, prompt: coQ(X), model: coShort(X) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: coQ(X) + ' ' + coShort(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: coQ(X), model: coQ(X) })
});

/* ---------- Capire le frasi: «(il libro) (non) costa dodici euro» ---------- */
const coNorm = (text) => gNorm(numDigits(String(text || '').replace(/€/g, ' euro ')));
function coStatements(s) {
  s = s.replace(/ quanto (costa|costano) /g, ' # ');
  const out = [], re = / (?:(il|lo|la|l|i|gli|le) ([a-z]+) )?(non )?(costa|costano|costo|costi|e|sono) ([a-z]+) euro(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const p = NUM_VAL[m[5]];
    if (!p) continue;
    const nn = m[2] ? gNoun(m[2]) : null;
    out.push({ p: p, neg: !!m[3], verb: m[4], art: m[1] || null, noun: nn, said: !!m[2] });
  }
  return out;
}
function coEvaluate(step, text) {
  const s = coNorm(text), X = step.show, n = coN(X), o = coObj(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'quanto ' + coVerb(n)) && has(s, gNorm(coThe(X)).trim()) && !coStatements(s).length, full: true };
  const st = coStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  // la cosa, se la dice, con l'articolo giusto (il libro, le penne); il verbo accordato
  const subjOk = (x) => !x.said || (x.noun && x.noun.obj === o && x.noun.plural === (n > 1) && x.art === gDef(o, n).replace('\'', ''));
  const verbOk = (x) => x.verb === coVerb(n);
  const truth = (x) => x.p === coP(X) && verbOk(x) && subjOk(x), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.said) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.p === step.ask && verbOk(x) && subjOk(x)) && !neg.some(x => x.p === coP(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'quanto'), full: true };
  }
}
function coEvalAsk(X, text) {
  const s = coNorm(text), bad = (model) => ({ ok: false, model: model || coQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'quanto costa') || has(s, 'quanto costano')) return has(s, 'quanto ' + coVerb(coN(X))) ? { ok: true, kind: 'what' } : bad();
  const st = coStatements(s);
  if (st.length === 1 && st[0].verb === coVerb(coN(X))) return { ok: true, kind: st[0].p === coP(X) ? 'yes' : 'no', ask: st[0].p };
  if (st.length === 1) return bad(coSay(X, st[0].p) + '?');
  return bad();
}
function coAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + coVerb(coN(X)) + ' ' + coEuro(coP(X)) + '.';
  if (r.kind === 'no') return 'No, non ' + coVerb(coN(X)) + ' ' + coEuro(r.ask) + '. ' + coShort(X);
  return coShort(X);
}
gInstall('co', isCo, SCO, coEvaluate, coEvalAsk, coAnswerAsk, { digits: true });
