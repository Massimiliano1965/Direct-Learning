'use strict';
/* =====================================================================
   CAPITOLO 2: «Paese e nazionalità» (lezione 13)
   Si carica dopo logic.js e geo_fig.js (bandiere). Sei persone, ognuna con la bandiera del suo paese:
   un signore o una signora (figure «n_m_italia», «n_f_francia»).
   Come nella lezione 11: «questo/questa» + l'aggettivo che si accorda (italiano/italiana),
   e alcuni che restano uguali (francese, inglese, cinese: come «grande»).
     Questo signore è italiano.                         → ripete
     Questa signora è americana?                        → Sì, questa signora è americana.
     Questo signore è francese?                         → No, questo signore non è francese.
     Questa signora è italiana o francese?              → Questa signora è italiana.
     Di che nazionalità è questo signore?               → Questo signore è cinese.
   Errori: «questa signore», «questa signora è italiano», la nazionalità sbagliata.
   ===================================================================== */

const NATS = {
  italia:      { m: 'italiano',  f: 'italiana' },
  francia:     { m: 'francese',  f: 'francese' },
  inghilterra: { m: 'inglese',   f: 'inglese' },
  america:     { m: 'americano', f: 'americana' },
  cina:        { m: 'cinese',    f: 'cinese' }
};
const NAT_WORD = {};
Object.keys(NATS).forEach(c => { ['m', 'f'].forEach(g => { const w = NATS[c][g]; NAT_WORD[w] = NAT_WORD[w] || { c: c, g: {} }; NAT_WORD[w].g[g] = true; }); });
const isNat = (X) => typeof X === 'string' && /^n_[mf]_/.test(X);
const nG = (X) => X.charAt(2);                  // 'm' signore, 'f' signora
const nC = (X) => X.slice(4);                   // paese
const nWho = (g) => g === 'f' ? 'questa signora' : 'questo signore';
const nAdj = (c, g) => NATS[c][g];
const nCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nSay = (X) => nCap(nWho(nG(X))) + ' è ' + nAdj(nC(X), nG(X)) + '.';
const nQ = (g) => 'Di che nazionalità è ' + nWho(g) + '?';
const QN2 = 'Di che nazionalità è?';

/* ---------- Figure: la persona (busto) con la bandiera nell'angolo ---------- */
const NAT_LOOKS = {
  n_m_italia:      { man: true, skin: '#e8b48c', skin2: '#d39c74', hair: '#3a2a20', hair2: '#2a1d16', style: 'short', suit: '#2a3550', suit2: '#212a40', shirt: '#eef2fa', tie: '#3f6fb5' },
  n_f_italia:      { man: false, skin: '#eab892', skin2: '#d9a27c', hair: '#3a2418', hair2: '#2a1810', style: 'long', suit: '#3d4f6b', suit2: '#324159', shirt: '#f4f1ec', pearls: true },
  n_f_francia:     { man: false, skin: '#f3d0b4', skin2: '#e2b898', hair: '#d9b46a', hair2: '#b8924c', style: 'bun', glasses: 'thin', suit: '#2f3b52', suit2: '#263043', shirt: '#f6f3ee' },
  n_m_inghilterra: { man: true, skin: '#f0c8a8', skin2: '#dcae8c', hair: '#b0703a', hair2: '#8a5428', style: 'short', suit: '#3b3f47', suit2: '#30333a', shirt: '#f2f2f2', tie: '#8a2c3a' },
  n_f_america:     { man: false, skin: '#c98e62', skin2: '#b27a50', hair: '#2a1d16', hair2: '#1c140f', style: 'long', suit: '#45506a', suit2: '#3a4459', shirt: '#f5efe6', scarf: '#c9a45c' },
  n_m_cina:        { man: true, skin: '#ecc59c', skin2: '#d8ad84', hair: '#16161a', hair2: '#0c0c10', style: 'short', suit: '#2b2f3a', suit2: '#22252e', shirt: '#f0f0f2', tie: '#c9a45c' }
};
function natFig(X) {
  const L = NAT_LOOKS[X], flag = (typeof FLAG !== 'undefined' && FLAG[nC(X)]) || '';
  const body = (typeof tTorso === 'function') ? tTorso(L) + tArm(L, ...DOWN_L) + tArm(L, ...DOWN_R) + tHeadStill(L, { mouth: 'smile' }) : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g transform="translate(50 100) scale(1.42) translate(-50 -68)">' + body + '</g>' +
    '<rect x="65" y="70" width="30" height="21" rx="2" fill="#1d2638"/>' +
    '<g transform="translate(67 72) scale(.26 .17)">' + flag + '</g>' +
    '<rect x="66" y="71" width="28" height="19" rx="1.5" fill="none" stroke="#c9a45c" stroke-width="1.6"/></svg>';
}
Object.keys(NAT_LOOKS).forEach(X => { Object.defineProperty(FIG, X, { get: () => natFig(X), enumerable: true }); });

/* ---------- Frasi (nat = true: valutate con queste regole) ---------- */
const SN2 = {
  present: (X) => { const p = nSay(X); return { type: 'echo', check: 'claim', nat: true, show: X, prompt: p, model: p }; },
  yes: (X) => { const g = nG(X), a = nAdj(nC(X), g); return { type: 'yes', nat: true, show: X, prompt: nCap(nWho(g)) + ' è ' + a + '?', model: 'Sì, ' + nWho(g) + ' è ' + a + '.' }; },
  neg: (X, other) => {
    const g = nG(X), a = nAdj(other, g);
    return { type: 'neg', nat: true, show: X, ask: other, prompt: nCap(nWho(g)) + ' è ' + a + '?', model: 'No, ' + nWho(g) + ' non è ' + a + '.', complete: nSay(X) };
  },
  alt: (X, other) => {
    const g = nG(X), o = Math.random() < 0.5 ? [nC(X), other] : [other, nC(X)];
    return { type: 'alt', nat: true, show: X, options: o, prompt: nCap(nWho(g)) + ' è ' + nAdj(o[0], g) + ' o ' + nAdj(o[1], g) + '?', model: nSay(X) };
  },
  key: (X) => ({ type: 'key', nat: true, show: X, prompt: nQ(nG(X)), model: nSay(X) }),
  reveal: (X) => ({ type: 'reveal', nat: true, show: X, prompt: nQ(nG(X)) + ' ' + nSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', nat: true, show: X, prompt: QN2, model: QN2 })
};
// un'altra nazionalità, diversa da quella vera
const nOther = (X) => pick(Object.keys(NATS).filter(c => c !== nC(X)));

/* ---------- Capire le frasi ----------
   «questo signore è italiano» / «questa signora non è francese»: si controllano
   questo/questa, signore/signora e l'accordo (italiano/italiana). */
function natStatements(s) {
  const out = [], re = / (questo|questa|quest) (signore|signora|signor) (non )?e ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const g = m[2] === 'signora' ? 'f' : 'm', w = NAT_WORD[m[4]];
    const okDem = m[1] === (g === 'f' ? 'questa' : 'questo');
    out.push({ g: g, c: w ? w.c : null, neg: !!m[3], good: okDem && !!w && !!w.g[g] });
  }
  return out;
}
function natEvaluate(step, text) {
  const s = norm(text), X = step.show, g = nG(X), c = nC(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'di che nazionalita e') && !natStatements(s).length, full: true };
  const st = natStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.g === g && x.c === c, allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': {
      const said = neg.some(x => x.good && x.g === g && x.c === step.ask);
      const denyTrue = neg.some(x => x.g === g && x.c === c);
      return { ok: !yes && said && !denyTrue && allPos && neg.every(x => x.good), full: pos.some(truth) };
    }
    default:
      return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'oppure') && !has(s, 'di che nazionalita e'), full: true };
  }
}

/* ---------- Le domande dell'allievo ---------- */
function natEvalAsk(X, text) {
  const s = norm(text), g = nG(X);
  const bad = (model) => ({ ok: false, model: model || nQ(g) });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'di che nazionalita e')) return { ok: true, kind: 'what' };
  if (has(s, 'chi e') || has(s, 'che cosa e')) return { ok: true, kind: 'who' };
  const alt = / (questo|questa|quest) (signore|signora|signor) e ([a-z]+) (?:o|oppure) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const a = NAT_WORD[alt[3]], b = NAT_WORD[alt[4]], g2 = alt[2] === 'signora' ? 'f' : 'm';
    if (g2 === g && alt[1] === (g === 'f' ? 'questa' : 'questo') && a && b && a.g[g] && b.g[g] && a.c !== b.c) return { ok: true, kind: 'alt' };
    return bad();
  }
  const st = natStatements(s).filter(x => x.g === g);
  if (st.length === 1 && st[0].good) return { ok: true, kind: st[0].c === nC(X) ? 'yes' : 'no', ask: st[0].c };
  if (st.length === 1 && st[0].c) return bad(nCap(nWho(g)) + ' è ' + nAdj(st[0].c, g) + '?');   // questo/questa o accordo sbagliati
  return bad();
}
function natAnswerAsk(X, r) {
  const g = nG(X);
  if (r.kind === 'who') return (g === 'f' ? 'È una signora.' : 'È un signore.');
  if (r.kind === 'what' || r.kind === 'alt') return nSay(X);
  if (r.kind === 'yes') return 'Sì, ' + nWho(g) + ' è ' + nAdj(nC(X), g) + '.';
  return 'No, ' + nWho(g) + ' non è ' + nAdj(r.ask, g) + '. ' + nSay(X);
}

function natDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const X = st.show, kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === nSay(X) ? 1 : 0; out.length < n; i++) {
    const kind = kinds[i % 3], s = kind === 'neg' ? SN2.neg(X, nOther(X)) : SN2[kind](X);
    if (kind === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione (come la lezione 11) ---------- */
function buildNatSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SN2.present(x), 'present')));
  shuffle(K).forEach(x => add(SN2.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SN2.neg(x, nOther(x)), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const X = pick(K.filter(x => x !== prev));
    add(Math.random() < 0.5 ? SN2.yes(X) : SN2.neg(X, nOther(X)), 'yesno');
    prev = X;
  }
  shuffle(K).slice(0, 4).forEach(x => add(SN2.alt(x, nOther(x)), 'alt'));
  add(SN2.reveal(K[0]), 'reveal').pause = 1200;
  add(SN2.reveal(K[K.length - 1]), 'reveal');
  for (let i = 0; i < 2; i++) add(SN2.askQ(K[0]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SN2.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', nat: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(t === 'neg' || t === 'alt' ? SN2[t](X, nOther(X)) : SN2[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', nat: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.nat ? buildNatSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.nat ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.nat ? natEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isNat(X) ? natEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isNat(X) ? natAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.nat ? natDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isNat(X) ? SN2.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isNat(X) ? SN2.present(X) : bPresent.apply(null, arguments); };
})();
