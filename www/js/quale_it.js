'use strict';
/* =====================================================================
   CAPITOLO 12: «Questo / quello; quale?» (lezione 64, livello 3). Si carica dopo det_it.js (lezioni 35 e 37).
   Due cose uguali di colore diverso: una vicina (grande, davanti) e una lontana (piccola, dietro).
     Questa tazza è rossa. Quella tazza è bianca.          → ripete
     Quale tazza è rossa?                                  → Questa tazza.   (va bene anche «Questa.» o «Questa tazza è rossa.»)
     Quale telefono è rosso?                               → Quel telefono.
     Questa tazza è rossa?                                 → Sì, questa tazza è rossa.
     Quella tazza è rossa?                                 → No, quella tazza non è rossa.
   Il punto: «quale?» e la risposta con questo / questa (vicino) o quel / quello / quell' / quella (lontano).
   Errori: vicino e lontano scambiati, «quello telefono», «questo tazza», il colore non accordato.
   ===================================================================== */

// qu_<cosa>_<colore vicino>_<colore lontano>_<quella chiesta: n vicina, f lontana>
const QU = {
  qu_cup_rosso_bianco_n: 1, qu_phone_bianco_rosso_f: 1, qu_suitcase_bianco_rosso_n: 1,
  qu_umbrella_nero_giallo_f: 1, qu_laptop_rosso_bianco_n: 1, qu_coat_bianco_rosso_f: 1
};
const isQu = (X) => !!QU[X];
const quObj = (X) => X.split('_')[1];
const quCol = (X, side) => X.split('_')[side === 'n' ? 2 : 3];
const quSide = (X) => X.split('_')[4];
const quOpp = (side) => side === 'n' ? 'f' : 'n';
const quDem = (X, side) => gJoin(dDet(side === 'n' ? 'q' : 'l', quObj(X), 1), gWord(quObj(X), 1));     // «questa tazza», «quell'ombrello»
const quIs = (X, side, col, neg) => quDem(X, side) + (neg ? ' non' : '') + ' è ' + gCol(col || quCol(X, side), quObj(X), 1);
const quTarget = (X) => quCol(X, quSide(X));
const quQ = (X) => 'Quale ' + gWord(quObj(X), 1) + ' è ' + gCol(quTarget(X), quObj(X), 1) + '?';

/* ---------- Figura: la cosa vicina (grande) e quella lontana (piccola, dietro la riga) ---------- */
function quFig(X) {
  const body = (side) => inner(FIG[quObj(X) + '_' + quCol(X, side)] || FIG[quObj(X)]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M2 54 L98 40" stroke="#3a4560" stroke-width="1.4"/>' +
    '<path d="M52 92 L70 56 M64 94 L80 58" stroke="#c9a45c" stroke-width="1.2" stroke-dasharray="2 3" opacity=".6"/>' +
    '<ellipse cx="76" cy="47" rx="12" ry="2" fill="#000" opacity=".25"/><g transform="translate(76 30) scale(.32) translate(-50 -50)">' + body('f') + '</g>' +
    '<ellipse cx="32" cy="92" rx="24" ry="3" fill="#000" opacity=".25"/><g transform="translate(32 62) scale(.6) translate(-50 -50)">' + body('n') + '</g></svg>';
}
Object.keys(QU).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => quFig(X) }); });

const SQU = gTag('qu', {
  present: (X) => { const p = gCap(quIs(X, 'n')) + '. ' + gCap(quIs(X, 'f')) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: gCap(quIs(X, quSide(X))) + '?', model: 'Sì, ' + quIs(X, quSide(X)) + '.' }),
  // l'altra: «Quella tazza è rossa?» → «No, quella tazza non è rossa.»
  neg: (X) => { const o = quOpp(quSide(X));
    return { type: 'neg', show: X, ask: o, prompt: gCap(quIs(X, o, quTarget(X))) + '?', model: 'No, ' + quIs(X, o, quTarget(X), true) + '.', complete: gCap(quIs(X, quSide(X))) + '.' }; },
  alt: (X) => { const ord = Math.random() < 0.5 ? ['n', 'f'] : ['f', 'n'];
    return { type: 'alt', show: X, prompt: 'È ' + gCol(quTarget(X), quObj(X), 1) + ' ' + quDem(X, ord[0]) + ' o ' + quDem(X, ord[1]) + '?', model: gCap(quDem(X, quSide(X))) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: quQ(X), model: gCap(quDem(X, quSide(X))) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: quQ(X) + ' ' + gCap(quDem(X, quSide(X))) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: quQ(X), model: quQ(X) })
});

/* ---------- Capire le frasi: «questa (tazza) (non) è (rossa)», «quel telefono» ---------- */
const QU_DEM = { questo: 'n', questa: 'n', quest: 'n', quel: 'f', quello: 'f', quella: 'f', quell: 'f' };
function quStatements(s, X) {
  s = s.replace(/ quale [a-z]+ e [a-z]+ /g, ' # ');
  const out = [], w = s.trim().split(' '), o = quObj(X);
  for (let i = 0; i < w.length; i++) {
    const side = QU_DEM[w[i]];
    if (!side) continue;
    let j = i + 1, noun = null;
    const n = gNoun(w[j]);
    if (n) { noun = n.obj; j++; }
    // la forma giusta della parola davanti (con la cosa di cui si parla)
    const want = gNorm(dDet(side === 'n' ? 'q' : 'l', o, 1)).trim().replace(/ $/, '');
    const formOk = (noun === null || noun === o) && (w[i] === want || (side === 'n' && w[i] === (gFem(o) ? 'questa' : 'questo')));
    let neg = false, col = null, colOk = true;
    if (w[j] === 'non') { neg = true; j++; }
    if (w[j] === 'e' && G_COLOR_WORD[w[j + 1]]) { const c = G_COLOR_WORD[w[j + 1]]; col = c.col; colOk = !c.plural && c.g === (gFem(o) ? 'f' : 'm'); }
    out.push({ side: side, noun: noun, ok: formOk && colOk && (noun === null || noun === o), neg: neg, col: col });
  }
  return out;
}
function quEvaluate(step, text) {
  const s = gNorm(text), X = step.show, t = quSide(X), c = quTarget(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(quQ(X)).trim()), full: true };
  const st = quStatements(s, X), yes = has(s, 'si'), no = has(s, 'no');
  // vera: il lato giusto con il suo colore (o senza colore), oppure «non è» col colore sbagliato
  const truth = (x) => x.ok && (x.col === null ? !x.neg : (x.col === quCol(X, x.side)) !== x.neg);
  if (!st.every(truth)) return { ok: false, full: false };
  switch (step.type) {
    case 'echo': return { ok: st.length === 2 && st[0].side === 'n' && st[1].side === 'f' && st.every(x => x.col && !x.neg), full: true };
    case 'yes': return { ok: yes && !no && st.some(x => x.side === t && !x.neg), full: true };
    case 'neg': return { ok: no && !yes && st.some(x => x.side === step.ask && x.neg && x.col === c), full: st.some(x => x.side === t && !x.neg) };
    default: return { ok: st.length > 0 && st.every(x => x.side === t && !x.neg) && !yes && !no, full: true };
  }
}
function quEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || quQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'quale')) { const m = / quale [a-z]+ e ([a-z]+) /.exec(s), cw = m && G_COLOR_WORD[m[1]];
    return cw && (cw.col === quCol(X, 'n') || cw.col === quCol(X, 'f')) && cw.g === (gFem(quObj(X)) ? 'f' : 'm') ? { ok: true, kind: 'what', col: cw.col } : bad(); }
  const st = quStatements(s, X);
  if (st.length === 1 && st[0].ok && st[0].col) return { ok: true, kind: st[0].col === quCol(X, st[0].side) ? 'yes' : 'no', side: st[0].side, col: st[0].col };
  return bad();
}
function quAnswerAsk(X, r) {
  if (r.kind === 'what') { const side = quCol(X, 'n') === r.col ? 'n' : 'f'; return gCap(quDem(X, side)) + '.'; }
  if (r.kind === 'yes') return 'Sì, ' + quIs(X, r.side) + '.';
  return 'No, ' + quIs(X, r.side, r.col, true) + '. ' + gCap(quIs(X, r.side)) + '.';
}
gInstall('qu', isQu, SQU, quEvaluate, quEvalAsk, quAnswerAsk);
