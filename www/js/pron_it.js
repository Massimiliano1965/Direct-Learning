'use strict';
/* =====================================================================
   CAPITOLO 4: «Lo prendo — la prendo» e «Non la chiude!» (lezione 25). Si carica dopo verbs_it.js e perche_it.js.
   Max e Isa fanno qualcosa con una cosa (le scene delle lezioni 23 e 24); la cosa non si ripete: lo (maschile), la (femminile).
     Max legge il libro.                             → ripete
     Max legge il libro? Sì, lo legge.               → (l'insegnante fa vedere)
     Isa chiude la finestra?                         → Sì, la chiude.
     Isa legge il libro?                             → No, non lo legge.   (lo legge Max)
     Cosa fa Max con il libro?                       → Lo legge.
   Come nella lezione 22, la -o finale è azzurra e la -a finale rosa: libro → lo, finestra → la.
   Errori: «Sì, la legge.» (per il libro), «Sì, legge lo.», «Sì, lo leggo.», «Sì, legge il libro.» (qui si dice «lo»).
   ===================================================================== */

// le scene: chi, il verbo (forma per lui/lei), la cosa (con l'articolo il/la/l')
const LD = {
  ld_m_book:     { verb: 'legge',  obj: 'book' },
  ld_f_phone:    { verb: 'prende', obj: 'phone' },
  ld_m_notebook: { verb: 'prende', obj: 'notebook' },
  ld_m_orange:   { verb: 'mangia', obj: 'orange' },
  ld_f_soda:     { verb: 'beve',   obj: 'soda' },
  ld_f_window:   { verb: 'chiude', obj: 'window' }
};
// le forme dei verbi di questa lezione (p = persona: 0 infinito, 1 io, 2 tu, 3 lui/lei)
const LDFORM = {};
[['legge', 'leggere leggo leggi legge'], ['prende', 'prendere prendo prendi prende'], ['mangia', 'mangiare mangio mangi mangia'],
 ['beve', 'bere bevo bevi beve'], ['chiude', 'chiudere chiudo chiudi chiude']
].forEach(([v, f]) => f.split(' ').forEach((w, p) => { LDFORM[w] = { verb: v, p: p }; }));
const isLd = (X) => !!LD[X];
const ldWho = (X) => X.charAt(3);
const ldName = (X) => vName(ldWho(X));
const ldOtherName = (X) => vName(ldWho(X) === 'm' ? 'f' : 'm');
const ldPro = (X) => ITEMS[LD[X].obj].art === 'una' || /a$/.test(ITEMS[LD[X].obj].word) ? 'la' : 'lo';   // l'arancia → la
const ldThe = (X) => p3The(LD[X].obj);
const ldSay = (X) => ldName(X) + ' ' + LD[X].verb + ' ' + ldThe(X) + '.';                  // «Max legge il libro.»
const ldShort = (X) => ldPro(X).charAt(0).toUpperCase() + ldPro(X).slice(1) + ' ' + LD[X].verb + '.';   // «Lo legge.»
const ldQ = (X) => 'Cosa fa ' + ldName(X) + ' con ' + (p3Art(LD[X].obj) === 'la' ? 'la ' : p3Art(LD[X].obj) === 'l\'' ? 'l\'' : 'il ') + ITEMS[LD[X].obj].word + '?';

/* ---------- Figure: le scene della lezione 23 e, per «prende», la persona con la cosa in mano ---------- */
function ldHoldFig(X) {
  const k = p3Key(ldWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const o = LD[X].obj, f = o === 'phone' ? CFIG.phone(COL_SHADE.bianco) : FIG[o];
  const thing = '<g transform="translate(70 62) scale(.36) translate(-50 -50)">' + inner(f).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '') + '</g>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="44" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [76, 64], [84, 54]), { mouth: 'smile' }, -6) + thing + '</svg>';
}
const LD_SCENE = { book: 'read', orange: 'eat', soda: 'drink', window: 'close' };
Object.keys(LD).forEach(X => {
  Object.defineProperty(FIG, X, { get: () => LD[X].verb === 'prende' ? ldHoldFig(X) : verbFig('v_' + ldWho(X) + '_' + LD_SCENE[LD[X].obj]), enumerable: true });
});

/* ---------- Frasi (pron = true) ---------- */
const SLD = {
  present: (X) => { const p = ldSay(X); return { type: 'echo', check: 'claim', pron: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', pron: true, show: X, prompt: ldSay(X).slice(0, -1) + '?', model: 'Sì, ' + ldPro(X) + ' ' + LD[X].verb + '.' }),
  // l'altra persona: «Isa legge il libro?» → «No, non lo legge.»
  neg: (X) => ({ type: 'neg', pron: true, show: X, ask: ldWho(X) === 'm' ? 'f' : 'm', prompt: ldOtherName(X) + ' ' + LD[X].verb + ' ' + ldThe(X) + '?',
    model: 'No, non ' + ldPro(X) + ' ' + LD[X].verb + '.', complete: ldName(X) + ' ' + ldPro(X) + ' ' + LD[X].verb + '.' }),
  key: (X) => ({ type: 'key', pron: true, show: X, prompt: ldQ(X), model: ldShort(X) }),
  // l'insegnante fa vedere: domanda e risposta con «lo» / «la»
  reveal: (X) => ({ type: 'reveal', pron: true, show: X, prompt: ldSay(X).slice(0, -1) + '? Sì, ' + ldPro(X) + ' ' + LD[X].verb + '.', model: '' }),
  revealKey: (X) => ({ type: 'reveal', pron: true, show: X, prompt: ldQ(X) + ' ' + ldShort(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', pron: true, show: X, prompt: ldQ(X), model: ldQ(X) })
};

/* ---------- Capire le frasi ----------
   «(Max) (non) lo legge», e anche la frase intera «Max legge il libro» (solo dove si ripete). */
function ldStatements(s) {
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const v = LDFORM[w[i]];
    if (!v) continue;
    let j = i - 1, pro = null, neg = false, subj = null;
    if (/^(lo|la|li|le|l)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]]; else if (w[j] === 'lui') subj = 'm'; else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    // la cosa dopo il verbo: «legge il libro» (o il pronome dopo: «legge lo» = sbagliato)
    let obj = null, after = null;
    if (/^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '') && WORD2KEY[w[i + 2]]) obj = { art: w[i + 1], k: WORD2KEY[w[i + 2]] };
    else if (/^(lo|la|li|le)$/.test(w[i + 1] || '')) after = w[i + 1];
    out.push({ verb: v.verb, p: v.p, pro: pro, neg: neg, subj: subj, obj: obj, after: after });
  }
  return out;
}
// la frase è giusta per la scena X? pron = serve «lo/la» (non la cosa ripetuta); W = di chi si parla
function ldGood(x, X, W, pron) {
  const L = LD[X];
  if (x.p !== 3 || x.verb !== L.verb || x.after || (x.subj !== null && x.subj !== W)) return false;
  if (pron) return !x.obj && x.pro === ldPro(X);
  return !x.pro && !!x.obj && x.obj.k === L.obj && (x.obj.art === p3ArtN(L.obj) || x.obj.art === (ITEMS[L.obj].art === 'un\'' ? 'un' : ITEMS[L.obj].art));
}
function ldEvaluate(step, text) {
  const s = norm(text), X = step.show, W = ldWho(X);
  if (step.type === 'echo' && step.check === 'question')
    return { ok: has(s, 'cosa fa') && has(s, 'con') && has(s, norm(ITEMS[LD[X].obj].word).trim()) && !has(s, norm(ldOtherName(X)).trim()) && !ldStatements(s).length, full: true };
  const st = ldStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length > 0 && pos.every(x => ldGood(x, X, W, false)) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.length > 0 && pos.every(x => ldGood(x, X, W, true)), full: true };
    case 'neg': return { ok: !yes && neg.length > 0 && neg.every(x => ldGood(x, X, step.ask, true)) && pos.every(x => ldGood(x, X, W, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => ldGood(x, X, W, true)) && !neg.length && !has(s, 'cosa fa'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Cosa fa Max con il libro?», «Max legge il libro?», «Isa legge il libro?» ---------- */
function ldEvalAsk(X, text) {
  const s = norm(text), bad = (model) => ({ ok: false, model: model || ldQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa fa')) return has(s, norm(ldOtherName(X)).trim()) ? bad() : { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = ldStatements(s);
  if (st.length === 1) {
    const x = st[0], W = ldWho(X);
    if (ldGood(x, X, W, false)) return { ok: true, kind: 'yes' };
    if (ldGood(x, X, x.subj, false) && x.subj && x.subj !== W) return { ok: true, kind: 'no', ask: x.subj };
    if (x.verb === LD[X].verb) return bad(ldSay(X).slice(0, -1) + '?');   // forma o articolo sbagliati: si corregge quella domanda
  }
  return bad();
}
function ldAnswerAsk(X, r) {
  if (r.kind === 'thing') return 'È ' + np(LD[X].obj) + '.';
  if (r.kind === 'yes') return 'Sì, ' + ldPro(X) + ' ' + LD[X].verb + '.';
  if (r.kind === 'no') return 'No, ' + ldOtherName(X) + ' non ' + ldPro(X) + ' ' + LD[X].verb + '. ' + ldName(X) + ' ' + ldPro(X) + ' ' + LD[X].verb + '.';
  return ldShort(X);
}

function ldDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['yes', 'neg', 'key'];
  for (let i = 0; out.length < n; i++) { const s = SLD[kinds[i % 3]](st.show); s.drill = true; s.phase = st.phase; out.push(s); }
  return out;
}

function buildLdSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SLD.present(x), 'present')));
  // l'insegnante fa vedere «lo» e «la»
  const mLo = K.find(x => ldPro(x) === 'lo'), mLa = K.find(x => ldPro(x) === 'la');
  add(SLD.reveal(mLo), 'reveal').pause = 1200;
  add(SLD.reveal(mLa), 'reveal').pause = 1200;
  shuffle(K).forEach(x => add(SLD.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SLD.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SLD.yes(X) : SLD.neg(X), 'yesno'); prev = X; }
  add(SLD.revealKey(mLo), 'reveal').pause = 1200;
  add(SLD.revealKey(mLa), 'reveal');
  add(SLD.askQ(mLo), 'askq');
  add(SLD.askQ(mLa), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SLD.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', pron: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'key']);
    const s = add(SLD[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', pron: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.pron ? buildLdSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.pron ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.pron ? ldEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isLd(X) ? ldEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isLd(X) ? ldAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.pron ? ldDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isLd(X) ? SLD.revealKey(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isLd(X) ? SLD.present(X) : bPresent.apply(null, arguments); };
  // come nella lezione 22: la -o azzurra e la -a rosa, nelle cose e in «lo» / «la»
  if (typeof genderWords === 'function') {
    const bGw = genderWords;
    genderWords = (lesson) => lesson.pron ? lesson.known.map(X => ITEMS[LD[X].obj].word).filter(w => /[oa]$/.test(w)).concat(['lo', 'la']) : bGw(lesson);
  }
})();
