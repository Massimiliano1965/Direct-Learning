'use strict';
/* =====================================================================
   CAPITOLO 6: «Il contrario» (lezione 39, livello 2). Si carica dopo gen_it.js.
   La stessa cosa in due modi opposti: il libro aperto / chiuso, la bottiglia piena / vuota, la matita lunga / corta.
     Il libro è aperto.                              → ripete
     Il libro è aperto?                              → Sì, il libro è aperto.
     Il libro è chiuso?                              → No, il libro non è chiuso.   (la domanda «no» usa sempre il contrario)
     Il libro è aperto o chiuso?                     → Il libro è aperto.
     Com'è il libro?                                 → Il libro è aperto.   (va bene anche «È aperto.»)
   Come nella lezione 22, -o azzurra e -a rosa (libro aperto, bottiglia piena).
   Errori: il contrario sbagliato, l'accordo («la bottiglia è pieno»), l'articolo.
   ===================================================================== */

// le coppie: [maschile, femminile] di ogni aggettivo; il contrario è l'altro della coppia
const CONTR = { aperto: ['aperto', 'aperta'], chiuso: ['chiuso', 'chiusa'], pieno: ['pieno', 'piena'], vuoto: ['vuoto', 'vuota'], lungo: ['lungo', 'lunga'], corto: ['corto', 'corta'] };
const CONTR_OPP = { aperto: 'chiuso', chiuso: 'aperto', pieno: 'vuoto', vuoto: 'pieno', lungo: 'corto', corto: 'lungo' };
const CONTR_WORD = {};
Object.keys(CONTR).forEach(a => { CONTR_WORD[CONTR[a][0]] = { a: a, g: 'm' }; CONTR_WORD[CONTR[a][1]] = { a: a, g: 'f' }; });
const CT = { ct_book_aperto: 1, ct_book_chiuso: 1, ct_bottle_pieno: 1, ct_bottle_vuoto: 1, ct_pencil_lungo: 1, ct_pencil_corto: 1 };
const isCt = (X) => !!CT[X];
const ctObj = (X) => X.split('_')[1];
const ctAdj = (X) => X.split('_')[2];
const ctW = (a, obj) => CONTR[a][gFem(obj) ? 1 : 0];
const ctSay = (X, a) => gCap(gThe(ctObj(X), 1)) + ' è ' + ctW(a || ctAdj(X), ctObj(X));          // «Il libro è aperto»
const ctQ = (X) => 'Com\'è ' + gThe(ctObj(X), 1) + '?';

/* ---------- Figure ---------- */
FIG.ct_book_aperto = FLAT('<path d="M50 30 q-18 -8 -40 -4 v52 q22 -4 40 4z" fill="#f3eee2"/><path d="M50 30 q18 -8 40 -4 v52 q-22 -4 -40 4z" fill="#ece4d2"/>' +
  '<path d="M50 30 v52" stroke="#c9b994" stroke-width="1.4"/><path d="M18 40 h24 M18 48 h24 M18 56 h22 M58 40 h24 M58 48 h24 M58 56 h20" stroke="#a9a089" stroke-width="1.6"/>' +
  '<path d="M8 80 q22 -4 42 4 q20 -8 42 -4 v4 q-22 -4 -42 4 q-20 -8 -42 -4z" fill="#2c3e66"/>', 40);
FIG.ct_book_chiuso = FIG.book;
FIG.ct_bottle_pieno = FIG.bottle;
FIG.ct_bottle_vuoto = recolor(FIG.bottle, { '#8fb0c4': '#2a3448', '#b5ccda': '#3a465e' }).replace('<path d="M43 15', '<path stroke="#9fbcd0" stroke-width="1.6" d="M43 15');
FIG.ct_pencil_lungo = FIG.pencil;
FIG.ct_pencil_corto = FLAT('<g transform="rotate(-35 50 50)"><rect x="30" y="45" width="10" height="11" rx="2" fill="#b56b6b"/><rect x="39" y="45" width="7" height="11" fill="#b9bdc8"/>' +
  '<rect x="46" y="45" width="10" height="11" fill="#d4b06a"/><rect x="46" y="48.6" width="10" height="3.6" fill="#c19a52"/>' +
  '<path d="M56 45 L72 50.5 L56 56z" fill="#e2c9a0"/><path d="M67 48.8 L72 50.5 L67 52.2z" fill="#2a2a2a"/></g>', 18);

const SCT = gTag('ct', {
  present: (X) => { const p = ctSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: ctSay(X) + '?', model: 'Sì, ' + gThe(ctObj(X), 1) + ' è ' + ctW(ctAdj(X), ctObj(X)) + '.' }),
  neg: (X) => { const o = CONTR_OPP[ctAdj(X)];
    return { type: 'neg', show: X, ask: o, prompt: ctSay(X, o) + '?', model: 'No, ' + gThe(ctObj(X), 1) + ' non è ' + ctW(o, ctObj(X)) + '.', complete: ctSay(X) + '.' }; },
  alt: (X) => { const a = ctAdj(X), o = CONTR_OPP[a], ord = Math.random() < 0.5 ? [a, o] : [o, a];
    return { type: 'alt', show: X, prompt: ctSay(X, ord[0]) + ' o ' + ctW(ord[1], ctObj(X)) + '?', model: ctSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: ctQ(X), model: ctSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: ctQ(X) + ' ' + ctSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: ctQ(X), model: ctQ(X) })
});

/* ---------- Capire le frasi: «(il libro) (non) è aperto» ---------- */
function ctStatements(s) {
  s = s.replace(/ come e /g, ' # ').replace(/ com e /g, ' # ');
  const out = [], re = / (?:(il|la|lo|l) ([a-z]+) )?(non )?e ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const w = CONTR_WORD[m[4]];
    if (!w) continue;
    const nn = m[2] ? gNoun(m[2]) : null;
    out.push({ a: w.a, g: w.g, neg: !!m[3], said: !!m[2], obj: nn ? nn.obj : (m[2] ? '?' : null), art: m[1] || null });
  }
  return out;
}
function ctGood(x, X) {
  const o = ctObj(X);
  return x.g === (gFem(o) ? 'f' : 'm') && (!x.said || (x.obj === o && x.art === gDef(o, 1).replace('\'', '')));
}
function ctEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: (has(s, 'com e') || has(s, 'come e')) && has(s, gNorm(gThe(ctObj(X), 1)).trim()) && !ctStatements(s).length, full: true };
  const st = ctStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => ctGood(x, X) && x.a === ctAdj(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(x => truth(x) && x.said) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => ctGood(x, X) && x.a === step.ask) && !neg.some(x => x.a === ctAdj(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'com e') && !has(s, 'come e'), full: true };
  }
}
function ctEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || ctQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'com e') || has(s, 'come e')) return { ok: true, kind: 'what' };
  const st = ctStatements(s);
  if (st.length === 1 && ctGood(st[0], X)) return { ok: true, kind: st[0].a === ctAdj(X) ? 'yes' : 'no', ask: st[0].a };
  if (st.length === 1) return bad(ctSay(X, st[0].a) + '?');
  return bad();
}
function ctAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + gThe(ctObj(X), 1) + ' è ' + ctW(ctAdj(X), ctObj(X)) + '.';
  if (r.kind === 'no') return 'No, ' + gThe(ctObj(X), 1) + ' non è ' + ctW(r.ask, ctObj(X)) + '. ' + ctSay(X) + '.';
  return ctSay(X) + '.';
}
gInstall('ct', isCt, SCT, ctEvaluate, ctEvalAsk, ctAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.ct ? ['libro', 'bottiglia', 'matita'].concat(...Object.keys(CONTR).map(a => CONTR[a])) : bGw(lesson);
}
