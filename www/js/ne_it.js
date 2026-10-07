'use strict';
/* =====================================================================
   CAPITOLO 7: «Né… né…» (lezione 44, livello 2). Si carica dopo gen_it.js (colori e articoli).
   Le cose colorate già conosciute; la domanda «o» con due colori sbagliati:
     Il telefono non è né rosso né bianco. È giallo.        → ripete
     Il telefono è rosso o bianco?                          → Il telefono non è né rosso né bianco. È giallo.
     Il telefono è giallo?                                  → Sì, il telefono è giallo.
     Il telefono è rosso?                                   → No, il telefono non è rosso.
     Il telefono è giallo o nero?                           → Il telefono è giallo.
   Il punto: «non è né… né…». Come nella lezione 22, -o azzurra e -a rosa (rosso, rossa). «né» sottolineato.
   Errori: «non è rosso né bianco», «è né rosso né bianco» (senza «non»), l'accordo («la valigia non è né bianco…»), il colore vero sbagliato.
   ===================================================================== */

const NE = { ne_phone_giallo: 1, ne_suitcase_rosso: 1, ne_cup_bianco: 1, ne_coat_nero: 1, ne_umbrella_giallo: 1, ne_agenda_bianco: 1 };
const NE_COLS = ['nero', 'bianco', 'rosso', 'giallo'];
const NE_WORD = {};
NE_COLS.forEach(c => { NE_WORD[G_COLORS[c].m] = { c: c, g: 'm' }; NE_WORD[G_COLORS[c].f] = { c: c, g: 'f' }; });
const isNe = (X) => !!NE[X];
const neObj = (X) => X.split('_')[1];
const neCol = (X) => X.split('_')[2];
const neC = (X, c) => gCol(c, neObj(X), 1);                                  // «rossa» per la valigia
const neThe = (X) => gCap(gThe(neObj(X), 1));                                // «La valigia»
const neTwo = (X) => shuffle(NE_COLS.filter(c => c !== neCol(X))).slice(0, 2);
const neNeither = (X, two) => neThe(X) + ' non è né ' + neC(X, two[0]) + ' né ' + neC(X, two[1]) + '. È ' + neC(X, neCol(X)) + '.';
const neSay = (X, c) => neThe(X) + ' è ' + neC(X, c || neCol(X));
const neQ2 = (X, two) => neThe(X) + ' è ' + neC(X, two[0]) + ' o ' + neC(X, two[1]) + '?';
Object.keys(NE).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => FIG[neObj(X) + '_' + neCol(X)] }); });

const SNE = gTag('ne', {
  present: (X) => { const p = neNeither(X, neTwo(X)); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: neSay(X) + '?', model: 'Sì, ' + neSay(X).charAt(0).toLowerCase() + neSay(X).slice(1) + '.' }),
  neg: (X) => { const o = neTwo(X)[0];
    return { type: 'neg', show: X, ask: o, prompt: neSay(X, o) + '?', model: 'No, ' + gThe(neObj(X), 1) + ' non è ' + neC(X, o) + '.', complete: neSay(X) + '.' }; },
  alt: (X) => { const o = neTwo(X)[0], ord = Math.random() < 0.5 ? [neCol(X), o] : [o, neCol(X)];
    return { type: 'alt', show: X, prompt: neQ2(X, ord), model: neSay(X) + '.' }; },
  key: (X) => { const two = neTwo(X); return { type: 'key', show: X, two: two, prompt: neQ2(X, two), model: neNeither(X, two) }; },
  reveal: (X) => { const two = neTwo(X); return { type: 'reveal', show: X, prompt: neQ2(X, two) + ' ' + neNeither(X, two), model: '' }; },
  askQ: (X) => { const two = neTwo(X), q = neQ2(X, two); return { type: 'echo', check: 'question', show: X, two: two, prompt: q, model: q }; }
});

/* ---------- Capire le frasi: «non è né rosso né bianco», «è giallo», «non è rosso» ---------- */
function neParse(s, X) {
  const g = gFem(neObj(X)) ? 'f' : 'm', out = { ne: [], neOk: true, neNon: true, pos: [], neg: [], agree: true };
  const word = (w) => NE_WORD[w];
  s = s.replace(/ (non )?(?:e )?ne ([a-z]+) (?:e )?ne ([a-z]+)(?= )/g, (m, non, a, b) => {
    [a, b].forEach(w => { const c = word(w); if (!c) out.neOk = false; else { out.ne.push(c.c); if (c.g !== g) out.agree = false; } });
    if (!non) out.neNon = false;
    return ' # ';
  });
  const re = / (non )?(?:e )?([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const c = word(m[2]);
    if (!c) { if (m[1]) re.lastIndex -= m[2].length + 1; continue; }
    if (c.g !== g) out.agree = false;
    (m[1] ? out.neg : out.pos).push(c.c);
  }
  return out;
}
function neEvaluate(step, text) {
  const s = gNorm(text), X = step.show, p = neParse(s, X), yes = has(s, 'si'), no = has(s, 'no');
  const posOk = p.pos.every(c => c === neCol(X)), hasTrue = p.pos.indexOf(neCol(X)) !== -1;
  if (!p.agree) return { ok: false, full: false };
  if (step.type === 'echo' && step.check === 'question') {
    const want = step.two.slice().sort().join();
    return { ok: has(s, ' o '.trim()) && p.pos.slice().sort().join() === want, full: true };
  }
  const neRight = (two) => p.ne.length === 2 && p.neOk && p.neNon && p.ne.slice().sort().join() === two.slice().sort().join();
  switch (step.type) {
    case 'echo': case 'key': {
      const two = step.type === 'key' ? step.two : NE_COLS.filter(c => c !== neCol(X) && gNorm(step.model).indexOf(' ' + neC(X, c) + ' ') !== -1);
      return { ok: neRight(two) && posOk && !p.neg.length && !yes && !no, full: hasTrue };
    }
    case 'yes': return { ok: yes && !no && hasTrue && posOk && !p.neg.length && !p.ne.length, full: true };
    case 'neg': return { ok: no && !yes && p.neg.length === 1 && p.neg[0] === step.ask && posOk && !p.ne.length, full: hasTrue };
    default: return { ok: hasTrue && posOk && !p.neg.length && !p.ne.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo: «Il telefono è rosso o bianco?», «Il telefono è giallo?», «Di che colore è il telefono?»
function neEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || neQ2(X, neTwo(X)) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non') || has(s, 'ne')) return bad();
  if (has(s, 'di che colore')) return { ok: true, kind: 'what' };
  const p = neParse(s, X);
  if (!p.agree) {
    const cs = p.pos.length ? p.pos : [neCol(X)];
    return bad(cs.length === 2 ? neQ2(X, cs) : neSay(X, cs[0]) + '?');
  }
  if (p.pos.length === 2 && has(s, 'o')) return { ok: true, kind: p.pos.indexOf(neCol(X)) !== -1 ? 'alt' : 'ne', two: p.pos };
  if (p.pos.length === 1) return { ok: true, kind: p.pos[0] === neCol(X) ? 'yes' : 'no', ask: p.pos[0] };
  return bad();
}
function neAnswerAsk(X, r) {
  if (r.kind === 'ne') return neNeither(X, r.two);
  if (r.kind === 'yes') return 'Sì, ' + gThe(neObj(X), 1) + ' è ' + neC(X, neCol(X)) + '.';
  if (r.kind === 'no') return 'No, ' + gThe(neObj(X), 1) + ' non è ' + neC(X, r.ask) + '. ' + neSay(X) + '.';
  return neSay(X) + '.';
}
gInstall('ne', isNe, SNE, neEvaluate, neEvalAsk, neAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.ne ? NE_COLS.reduce((a, c) => a.concat([G_COLORS[c].m, G_COLORS[c].f]), []).filter(w => /[oa]$/.test(w)) : bGw(lesson);
}
