'use strict';
/* =====================================================================
   CAPITOLO 5: «Essere o avere» (lezione 31). Si carica dopo colors_it.js e pron_it.js.
   Max e Isa hanno in mano una cosa colorata (le cose e i colori della lezione 5).
   Della persona si dice cosa HA, della cosa si dice com'È:
     Max ha un telefono.  Il telefono è nero.        → ripete
     Max ha un telefono?                             → Sì, Max ha un telefono.
     Max ha una valigia?                             → No, Max non ha una valigia.
     Il telefono è bianco?                           → No, il telefono non è bianco.   (le regole dei colori)
     Che cosa ha Max?                                → Max ha un telefono.
     Di che colore è il telefono?                    → Il telefono è nero.
   Nella frase scritta «ha» ed «è» sono sottolineati in oro.
   Errori: «Max è un telefono», «il telefono ha nero», «Max ho un telefono», l'articolo o la cosa sbagliati.
   ===================================================================== */

const EA = {
  ea_m_phone_nero: 1, ea_f_suitcase_rosso: 1, ea_m_laptop_bianco: 1, ea_f_flask_nero: 1, ea_m_coat_rosso: 1, ea_f_cup_bianco: 1
};
const isEa = (X) => !!EA[X];
const eaWho = (X) => X.charAt(3);
const eaCombo = (X) => X.slice(5);                         // «phone_nero»
const eaObj = (X) => eaCombo(X).split('_')[0];
const eaCol = (X) => eaCombo(X).split('_')[1];
const eaName = (X) => vName(eaWho(X));
const eaHas = (X, obj) => eaName(X) + ' ha ' + np(obj || eaObj(X));               // «Max ha un telefono»
const eaQ = (X) => 'Che cosa ha ' + eaName(X) + '?';
const eaOtherObj = (X) => pick(Object.keys(EA).map(eaObj).filter(o => o !== eaObj(X)));
const eaOtherCol = (X) => pick(Object.keys(COLORS).filter(c => c !== eaCol(X)));

/* ---------- Figura: la persona con la cosa colorata in mano ---------- */
function eaFig(X) {
  const k = p3Key(eaWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const thing = '<g transform="translate(72 60) scale(.42) translate(-50 -50)">' + inner(FIG[eaCombo(X)]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '') + '</g>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="44" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [76, 64], [84, 54]), { mouth: 'smile' }, -8) + thing + '</svg>';
}
Object.keys(EA).forEach(X => { Object.defineProperty(FIG, X, { get: () => eaFig(X), enumerable: true }); });

/* ---------- Frasi (ea = true). Con «è» (il colore) si usano le frasi della lezione 5 (SC), sulla figura della persona ---------- */
const eaCol2 = (st, X) => Object.assign(st, { ea: true, eaMode: 'e', show: X });
const SEA = {
  presentHa: (X) => { const p = eaHas(X) + '.'; return { type: 'echo', check: 'claim', ea: true, eaMode: 'ha', show: X, prompt: p, model: p }; },
  presentE: (X) => eaCol2(SC.present(eaCombo(X)), X),
  yesHa: (X) => ({ type: 'yes', ea: true, eaMode: 'ha', show: X, prompt: eaHas(X) + '?', model: 'Sì, ' + eaHas(X) + '.' }),
  yesE: (X) => eaCol2(SC.yes(eaCombo(X)), X),
  negHa: (X) => { const o = eaOtherObj(X);
    return { type: 'neg', ea: true, eaMode: 'ha', show: X, ask: o, prompt: eaHas(X, o) + '?', model: 'No, ' + eaName(X) + ' non ha ' + np(o) + '.', complete: eaHas(X) + '.' }; },
  negE: (X) => eaCol2(SC.neg(eaCombo(X), eaOtherCol(X)), X),
  altHa: (X) => { const o = eaOtherObj(X), ord = Math.random() < 0.5 ? [eaObj(X), o] : [o, eaObj(X)];
    return { type: 'alt', ea: true, eaMode: 'ha', show: X, prompt: eaName(X) + ' ha ' + np(ord[0]) + ' o ' + np(ord[1]) + '?', model: eaHas(X) + '.' }; },
  altE: (X) => eaCol2(SC.alt(eaCombo(X), eaOtherCol(X)), X),
  keyHa: (X) => ({ type: 'key', ea: true, eaMode: 'ha', show: X, prompt: eaQ(X), model: eaHas(X) + '.' }),
  keyE: (X) => eaCol2(SC.key(eaCombo(X)), X),
  revealHa: (X) => ({ type: 'reveal', ea: true, eaMode: 'ha', show: X, prompt: eaQ(X) + ' ' + eaHas(X) + '.', model: '' }),
  revealE: (X) => eaCol2(SC.reveal(eaCombo(X)), X),
  askQHa: (X) => ({ type: 'echo', check: 'question', ea: true, eaMode: 'ha', show: X, prompt: eaQ(X), model: eaQ(X) }),
  askQE: (X) => eaCol2({ type: 'echo', check: 'question', col: true, prompt: colQ(eaObj(X)), model: colQ(eaObj(X)) }, X)
};
const eaPick = (kind, X) => SEA[kind + (Math.random() < 0.5 ? 'Ha' : 'E')](X);

/* ---------- Capire le frasi con «ha» ---------- */
function eaStatements(s) {
  const names = vNames(), out = [], re = / (?:([a-z]+) )?(non )?(ha|ho|hai|hanno|e|sono) (un|una|uno|il|la|lo|l) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = WORD2KEY[m[5]];
    if (!k) continue;
    const subj = names[m[1]] || (m[1] === 'lui' ? 'm' : m[1] === 'lei' ? 'f' : null);
    const want = ITEMS[k].art === 'un\'' ? 'un' : ITEMS[k].art;
    out.push({ subj: subj, other: !!m[1] && !subj && m[1] !== 'si' && m[1] !== 'no', neg: !!m[2], verb: m[3], k: k, good: m[3] === 'ha' && m[4] === want });
  }
  return out;
}
function eaEvaluate(step, text) {
  const X = step.show;
  if (step.eaMode === 'e') return colEvaluate(Object.assign({}, step, { show: eaCombo(X) }), text);
  const s = norm(text), W = eaWho(X), obj = eaObj(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che cosa ha') && !has(s, norm(vName(W === 'm' ? 'f' : 'm')).trim()), full: true };
  const st = eaStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const subjOk = (x) => x.subj === null ? !x.other : x.subj === W;
  const truth = (x) => x.good && x.k === obj && subjOk(x), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => x.good && x.k === step.ask && subjOk(x)) && !neg.some(x => x.k === obj) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'che cosa ha'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Che cosa ha Max?», «Max ha un telefono?», «Di che colore è il telefono?» ---------- */
function eaEvalAsk(X, text) {
  const s = norm(text), bad = (model) => ({ ok: false, model: model || eaQ(X) });
  if (has(s, 'di che colore') || colStatements(s).length) { const r = colEvalAsk(eaCombo(X), text); r.col = true; return r; }
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa ha')) return has(s, norm(vName(eaWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = eaStatements(s).filter(x => x.subj === null || x.subj === eaWho(X));
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].k === eaObj(X) ? 'yes' : 'no', ask: st[0].k };
  if (st.length === 1) return bad(eaHas(X, st[0].k) + '?');   // «Max è un telefono?» → «Max ha un telefono?»
  return bad();
}
function eaAnswerAsk(X, r) {
  if (r.col) return colAnswerAsk(eaCombo(X), r);
  if (r.kind === 'thing') return 'È ' + np(eaObj(X)) + '. ' + colSay(eaCombo(X));
  if (r.kind === 'yes') return 'Sì, ' + eaHas(X) + '.';
  if (r.kind === 'no') return 'No, ' + eaName(X) + ' non ha ' + np(r.ask) + '. ' + eaHas(X) + '.';
  return eaHas(X) + '.';
}

function eaDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const m = st.eaMode === 'e' ? 'E' : 'Ha', kinds = ['present', 'yes', 'neg'];
  for (let i = st.type === 'echo' ? 1 : 0; out.length < n; i++) {
    const s = SEA[kinds[i % 3] + m](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildEaSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  // ogni figura: prima cosa ha la persona, poi com'è la cosa
  presentRounds(K).forEach(round => round.forEach(x => { add(SEA.presentHa(x), 'present'); add(SEA.presentE(x), 'present'); }));
  shuffle(K.map(x => ['yesHa', x]).concat(K.map(x => ['yesE', x]))).forEach(([k, x]) => add(SEA[k](x), 'yes'));
  shuffle(K).forEach(x => add(eaPick('neg', x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(eaPick(Math.random() < 0.5 ? 'yes' : 'neg', X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(eaPick('alt', x), 'alt'));
  add(SEA.revealHa(K[0]), 'reveal').pause = 1200;
  add(SEA.revealE(K[1]), 'reveal');
  add(SEA.askQHa(K[0]), 'askq');
  add(SEA.askQE(K[1]), 'askq');
  shuffle(K.map(x => ['keyHa', x]).concat(K.map(x => ['keyE', x]))).forEach(([k, x]) => add(SEA[k](x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', ea: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(eaPick(t, X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', ea: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.ea ? buildEaSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.ea ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.ea ? eaEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isEa(X) ? eaEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isEa(X) ? eaAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.ea ? eaDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isEa(X) ? SEA.revealHa(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isEa(X) ? SEA.presentHa(X) : bPresent.apply(null, arguments); };
})();
