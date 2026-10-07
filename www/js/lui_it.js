'use strict';
/* =====================================================================
   CAPITOLO 7: «Lui e lei: maschile e femminile» (lezione 49, livello 2). Si carica dopo verbs_it.js e fam_it.js (le persone).
   Tre lavori, per lui e per lei: il cuoco / la cuoca (il cappello bianco), il cameriere / la cameriera (il vassoio),
   il professore / la professoressa (la lavagna):
     Lui è un cuoco.  Lei è una cuoca.                → ripete
     Lei è una cuoca?                                 → Sì, lei è una cuoca.
     Lei è una cameriera?                             → No, lei non è una cameriera.
     Lui è un cameriere o un professore?              → Lui è un cameriere.
     Chi è lei?                                       → Lei è una professoressa.   (va bene anche «È una professoressa.»)
   Il punto: -o → -a (cuoco, cuoca), -e → -a (cameriere, cameriera), -e → -essa (professore, professoressa); un / una.
   Come nella lezione 22, -o azzurra e -a rosa. Il cameriere: giacca nera (va bene, si vede: Massi), papillon e grembiule bianco.
   Errori: «lei è un cuoco», «una cuoco», «la professora», «lui è una cuoca».
   ===================================================================== */

const LM_JOB = {
  cuoco:      { m: 'cuoco',      f: 'cuoca' },
  cameriere:  { m: 'cameriere',  f: 'cameriera' },
  professore: { m: 'professore', f: 'professoressa' }
};
const LM_WORD = {};
Object.keys(LM_JOB).forEach(j => { LM_WORD[LM_JOB[j].m] = { j: j, g: 'm' }; LM_WORD[LM_JOB[j].f] = { j: j, g: 'f' }; });
// le forme inventate: si riconoscono, ma sono sbagliate
['cameriero', 'professora', 'professoro', 'professorressa'].forEach(w => { LM_WORD[w] = { j: w.slice(0, 4) === 'came' ? 'cameriere' : 'professore', g: '?' }; });
const LM = { lm_m_cuoco: 1, lm_f_cuoco: 1, lm_m_cameriere: 1, lm_f_cameriere: 1, lm_m_professore: 1, lm_f_professore: 1 };
const isLm = (X) => !!LM[X];
const lmG = (X) => X.charAt(3);
const lmJob = (X) => X.slice(5);
const lmPron = (g) => g === 'f' ? 'lei' : 'lui';
const lmNoun = (g, j) => (g === 'f' ? 'una ' : 'un ') + LM_JOB[j][g];                    // «una cuoca»
const lmSay = (X, j) => gCap(lmPron(lmG(X))) + ' è ' + lmNoun(lmG(X), j || lmJob(X));   // «Lei è una cuoca»
const lmQ = (X) => 'Chi è ' + lmPron(lmG(X)) + '?';
const lmOther = (X) => pick(Object.keys(LM_JOB).filter(j => j !== lmJob(X)));

/* ---------- Figure: lui (il padre della lezione 30) o lei (la madre), con il segno del lavoro ---------- */
function lmFig(X) {
  if (typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const g = lmG(X), j = lmJob(X), LK = Object.assign({}, FAM_LOOK[g === 'f' ? 'f_madre' : 'f_padre']);
  let arms = tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), extra = '', back = '', dx = 0;
  if (j === 'cuoco') {        // giacca bianca e il cappello bianco da cuoco
    Object.assign(LK, { suit: '#eef0f3', suit2: '#cfd4dc', shirt: '#eef0f3', tie: '#c8262f' });
    arms = tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [77, 67], [71, 55], [0, -5.5]);
    extra = '<path d="M41 13 q-6 -4 -3 -10 q3 -5 8 -3 q4 -5 8 0 q5 -2 8 3 q3 6 -3 10z" fill="#f7f8fa" stroke="#cfd4dc" stroke-width=".8"/><rect x="41" y="11" width="18" height="4" rx="1" fill="#f7f8fa" stroke="#cfd4dc" stroke-width=".8"/>';
  } else if (j === 'cameriere') {   // vestito da cameriere (Massi): giacca nera, papillon, grembiule bianco lungo, il vassoio con la tazza
    Object.assign(LK, { suit: '#1f2430', suit2: '#171b25', shirt: '#f4f4f6', tie: '#f4f4f6' });
    arms = tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [78, 50], [80, 38]);
    extra = '<path d="M44.5 40 l5.5 2.6 l5.5 -2.6 v5.2 l-5.5 -2.6 l-5.5 2.6z" fill="#1f2430"/><circle cx="50" cy="42.6" r="1.2" fill="#2c3346"/>' +
      '<path d="M37 64 h26 l1.5 30 h-29z" fill="#f7f8fa" stroke="#cfd4dc" stroke-width=".8"/><path d="M36 64 h28" stroke="#cfd4dc" stroke-width="1.6"/>' +
      '<ellipse cx="81" cy="36" rx="13" ry="2.6" fill="#c9ccd4" stroke="#8d93a3" stroke-width=".8"/>' +
      '<path d="M76 27 h8 l-1 7 h-6z" fill="#f3eee2"/><path d="M84 29 q3 0 3 2 q0 2 -3 2" fill="none" stroke="#f3eee2" stroke-width="1.2"/><ellipse cx="80" cy="34.3" rx="6" ry="1.2" fill="#f3eee2"/>';
  } else {                    // la lavagna verde con «a b c» e la mano che la indica
    dx = 14;
    back = '<rect x="2" y="12" width="40" height="30" rx="2" fill="#3f6b4f" stroke="#8e6741" stroke-width="2.4"/>' +
      '<text x="8" y="31" font-size="11" font-family="Georgia, serif" fill="#f3eee2">a b c</text>';
    arms = tArm(LK, [35, 47], [26, 40], [18, 28]) + tArm(LK, ...DOWN_R);
  }
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + back + '<ellipse cx="' + (50 + dx) + '" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, arms + extra, { mouth: 'smile' }, dx) + '</svg>';
}
Object.keys(LM).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => lmFig(X) }); });

const SLM = gTag('lm', {
  present: (X) => { const p = lmSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: lmSay(X) + '?', model: 'Sì, ' + lmPron(lmG(X)) + ' è ' + lmNoun(lmG(X), lmJob(X)) + '.' }),
  neg: (X) => { const o = lmOther(X);
    return { type: 'neg', show: X, ask: o, prompt: lmSay(X, o) + '?', model: 'No, ' + lmPron(lmG(X)) + ' non è ' + lmNoun(lmG(X), o) + '.', complete: lmSay(X) + '.' }; },
  alt: (X) => { const o = lmOther(X), ord = Math.random() < 0.5 ? [lmJob(X), o] : [o, lmJob(X)];
    return { type: 'alt', show: X, prompt: lmSay(X, ord[0]) + ' o ' + lmNoun(lmG(X), ord[1]) + '?', model: lmSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: lmQ(X), model: lmSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: lmQ(X) + ' ' + lmSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: lmQ(X), model: lmQ(X) })
});

/* ---------- Capire le frasi: «(lui / lei) (non) è un cuoco / una cuoca» ---------- */
function lmStatements(s) {
  s = s.replace(/ chi e (lui|lei) /g, ' # ');
  const out = [], re = / (?:(lui|lei) )?(non )?(?:e )?(un|una|uno|il|la|lo|l) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const w = LM_WORD[m[4]];
    if (!w) continue;
    const artG = /^(una|la)$/.test(m[3]) ? 'f' : /^(un|uno|il|lo)$/.test(m[3]) ? 'm' : '?';
    out.push({ subj: m[1] ? (m[1] === 'lei' ? 'f' : 'm') : null, neg: !!m[2], j: w.j, g: w.g, good: w.g !== '?' && artG === w.g });
  }
  return out;
}
const lmOk = (x, X) => x.good && x.g === lmG(X) && (x.subj === null || x.subj === lmG(X));
function lmEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(lmQ(X)).trim()), full: true };
  const st = lmStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => lmOk(x, X) && x.j === lmJob(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && lmOk(neg[0], X) && neg[0].j === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'chi e'), full: true };
  }
}
function lmEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || lmQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'chi e')) return has(s, lmPron(lmG(X) === 'm' ? 'f' : 'm')) ? bad() : { ok: true, kind: 'what' };
  const st = lmStatements(s);
  if (st.length === 1 && lmOk(st[0], X)) return { ok: true, kind: st[0].j === lmJob(X) ? 'yes' : 'no', ask: st[0].j };
  if (st.length === 1) return bad(lmSay(X, st[0].j) + '?');
  return bad();
}
function lmAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + lmPron(lmG(X)) + ' è ' + lmNoun(lmG(X), lmJob(X)) + '.';
  if (r.kind === 'no') return 'No, ' + lmPron(lmG(X)) + ' non è ' + lmNoun(lmG(X), r.ask) + '. ' + lmSay(X) + '.';
  return lmSay(X) + '.';
}
gInstall('lm', isLm, SLM, lmEvaluate, lmEvalAsk, lmAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.lm ? ['cuoco', 'cuoca', 'cameriera', 'professoressa', 'una'] : bGw(lesson);
}
