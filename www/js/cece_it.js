'use strict';
/* =====================================================================
   CAPITOLO 5: «C'è un…, ci sono due…» (lezione 33). Si carica dopo gen_it.js e plur_it.js.
   Sul tavolo (lezione 18: «sul tavolo») c'è una cosa o ci sono più cose:
     Sul tavolo c'è un telefono.  Sul tavolo ci sono due tazze.   → ripete
     Sul tavolo c'è un telefono?                                  → Sì, c'è un telefono.
     Sul tavolo c'è una chiave?                                   → No, non c'è una chiave.
     Sul tavolo ci sono due tazze o due libri?                    → Ci sono due tazze.
     Che cosa c'è sul tavolo?                                     → C'è un telefono. / Ci sono due tazze.
   «c'è» e «ci sono» sottolineati in oro.
   Errori: «c'è due tazze», «ci sono un telefono», «è un telefono», «ci sono due tazza».
   ===================================================================== */

const CE = { ce_phone_1: 1, ce_cup_2: 1, ce_key_1: 1, ce_pen_3: 1, ce_orange_1: 1, ce_book_2: 1 };
const isCe = (X) => !!CE[X];
const ceObj = (X) => X.split('_')[1];
const ceN = (X) => +X.split('_')[2];
const ceIs = (n) => n === 1 ? 'c\'è' : 'ci sono';
const ceSay = (X, obj) => ceIs(ceN(X)) + ' ' + gCount(obj || ceObj(X), ceN(X));        // «ci sono due tazze»
const ceQ = 'Che cosa c\'è sul tavolo?';
const ceOther = (X) => pick(Object.keys(CE).filter(x => ceN(x) > 1 === ceN(X) > 1 && ceObj(x) !== ceObj(X)).map(ceObj).concat(ceN(X) === 1 ? ['book'] : ['phone']));

/* ---------- Figura: il tavolo con sopra la cosa (o le cose) ---------- */
function ceFig(X) {
  const n = ceN(X), body = inner(FIG[ceObj(X)]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const sc = n === 1 ? .36 : n === 2 ? .3 : .26, xs = n === 1 ? [50] : n === 2 ? [38, 62] : [30, 50, 70];
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + inner(FIG.table) +
    xs.map(x => '<g transform="translate(' + x + ' 36) scale(' + sc + ') translate(-50 -88)">' + body + '</g>').join('') + '</svg>';
}
Object.keys(CE).forEach(X => { FIG[X] = ceFig(X); });

const SCE = gTag('ce', {
  present: (X) => { const p = 'Sul tavolo ' + ceSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: 'Sul tavolo ' + ceSay(X) + '?', model: 'Sì, ' + ceSay(X) + '.' }),
  neg: (X) => { const o = ceOther(X);
    return { type: 'neg', show: X, ask: o, prompt: 'Sul tavolo ' + ceSay(X, o) + '?', model: 'No, non ' + ceSay(X, o) + '.', complete: gCap(ceSay(X)) + '.' }; },
  alt: (X) => { const o = ceOther(X), ord = Math.random() < 0.5 ? [ceObj(X), o] : [o, ceObj(X)];
    return { type: 'alt', show: X, prompt: 'Sul tavolo ' + ceIs(ceN(X)) + ' ' + gCount(ord[0], ceN(X)) + ' o ' + gCount(ord[1], ceN(X)) + '?', model: gCap(ceSay(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: ceQ, model: gCap(ceSay(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: ceQ + ' ' + gCap(ceSay(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: ceQ, model: ceQ })
});

/* ---------- Capire le frasi: «(non) c'è un telefono», «(non) ci sono due tazze» ---------- */
function ceStatements(s) {
  s = s.replace(/ che cosa c e /g, ' # ');
  const out = [], re = / (non )?(c e|ce|ci sono|e|sono) (un|una|uno|due|tre|quattro) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const nn = gNoun(m[4]), n = PL_NUM[m[3]];
    if (!nn) { out.push({ obj: '?', neg: !!m[1], good: false }); continue; }
    const verb = m[2] === 'ce' ? 'c e' : m[2];
    const artOk = n > 1 || m[3] === (ITEMS[nn.obj].art === 'un\'' ? 'un' : ITEMS[nn.obj].art);
    const good = artOk && (nn.plural === null || nn.plural === (n > 1)) && (n === 1 ? verb === 'c e' : verb === 'ci sono');
    out.push({ obj: nn.obj, n: n, neg: !!m[1], good: good });
  }
  return out;
}
function ceEvaluate(step, text) {
  const s = gNorm(text), X = step.show, o = ceObj(X), n = ceN(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che cosa c e') && has(s, 'sul tavolo') && !ceStatements(s).length, full: true };
  const st = ceStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.obj === o && x.n === n, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.obj === step.ask) && !neg.some(x => x.obj === o) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa'), full: true };
  }
}
function ceEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || ceQ });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa c e')) return { ok: true, kind: 'what' };
  const st = ceStatements(s);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].obj === ceObj(X) && st[0].n === ceN(X) ? 'yes' : 'no', ask: st[0].obj, n: st[0].n };
  if (st.length === 1 && st[0].obj !== '?') return bad('Sul tavolo ' + ceIs(st[0].n) + ' ' + gCount(st[0].obj, st[0].n) + '?');
  return bad();
}
function ceAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + ceSay(X) + '.';
  if (r.kind === 'no') return 'No, non ' + ceIs(r.n) + ' ' + gCount(r.ask, r.n) + '. ' + gCap(ceSay(X)) + '.';
  return gCap(ceSay(X)) + '.';
}
gInstall('ce', isCe, SCE, ceEvaluate, ceEvalAsk, ceAnswerAsk);
