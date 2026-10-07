'use strict';
/* =====================================================================
   CAPITOLO 4: «Perché? Per…» (lezione 24). Si carica dopo verbs_it.js (i verbi della lezione 23).
   Max e Isa prendono una cosa; nella nuvoletta si vede perché (la scena della lezione 23):
     Max prende il libro per leggere.                → ripete
     Isa prende la penna per scrivere?               → Sì, Isa prende la penna per scrivere.
     Max prende l'arancia per bere?                  → No, Max non prende l'arancia per bere.  (va bene anche «No, per mangiare.»)
     Isa prende il telefono per telefonare o per leggere?   → Per telefonare.
     Perché Max prende la chiave?                    → Per aprire la porta.   (va bene anche la frase intera)
   Il punto: alla domanda «Perché…?» si risponde «Per» + il verbo intero (leggere, bere, aprire…).
   Errori: «Per legge.», «Perché leggere.», «Per leggo.», lo scopo sbagliato, «Max prendo».
   ===================================================================== */

// le cose e il perché (act = il verbo della lezione 23; write = nuovo: scrivere)
const PURP = {
  pp_m_book:   { obj: 'book',   act: 'read' },
  pp_f_phone:  { obj: 'phone',  act: 'phone' },
  pp_m_orange: { obj: 'orange', act: 'eat' },
  pp_f_soda:   { obj: 'soda',   act: 'drink' },
  pp_m_key:    { obj: 'key',    act: 'open' },
  pp_f_pen:    { obj: 'pen',    act: 'write' }
};
const P_INF = { read: 'leggere', phone: 'telefonare', eat: 'mangiare', drink: 'bere', open: 'aprire la porta', write: 'scrivere' };
// le forme dei verbi (della lezione 23 più «scrivere»), solo per questa lezione
const PFORM = Object.assign({}, VFORM);
'scrivere scrivo scrivi scrive'.split(' ').forEach((w, p) => { PFORM[w] = { act: 'write', p: p }; });
const isPurp = (X) => !!PURP[X];
const puWho = (X) => X.charAt(3);
const puName = (X) => vName(puWho(X));
const puTakes = (X) => puName(X) + ' prende ' + p3The(PURP[X].obj);             // «Max prende il libro»
const puFor = (a) => 'per ' + P_INF[a];                                          // «per leggere»
const puSay = (X) => puTakes(X) + ' ' + puFor(PURP[X].act) + '.';
const puQ = (X) => 'Perché ' + puTakes(X) + '?';
const puShort = (X) => 'Per ' + P_INF[PURP[X].act] + '.';
const puOther = (X) => pick(Object.keys(P_INF).filter(a => a !== PURP[X].act));

/* ---------- Figure: la persona con la cosa in mano e, nella nuvoletta, quello che farà ---------- */
V_SCENE.write = (LK) => V_PERSON(LK, tArm(LK, [35, 47], [33, 68], [40, 64]) +
  '<rect x="34" y="55" width="26" height="17" rx="1.5" fill="#8a3a3a"/><rect x="35.5" y="56" width="23" height="14.5" fill="#f3eee2"/>' +
  '<path d="M38 60 h16 M38 63.5 h12 M38 67 h9" stroke="#8d93a3" stroke-width="1"/>' +
  tArm(LK, [65, 47], [68, 68], [55, 66]) + '<path d="M55 66 l-6 -3" stroke="#1f2433" stroke-width="2.4" stroke-linecap="round"/><path d="M49.4 63.2 l-1.6 -.8" stroke="#c9a45c" stroke-width="2.4" stroke-linecap="round"/>', { mouth: 'flat' });
function purpFig(X) {
  const P = PURP[X], k = p3Key(puWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  // la cosa nella mano destra, davanti (il telefono bianco: quello nero sul fondo blu notte non si vede)
  const thing = '<g transform="translate(68 66) scale(.3) translate(-50 -50)">' + inner(P.obj === 'phone' ? CFIG.phone(COL_SHADE.bianco) : FIG[P.obj]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '') + '</g>';
  const person = V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 64], [83, 58]), { mouth: 'smile' }, -16) + thing;
  // la nuvoletta: la scena della lezione 23, in piccolo
  const scene = inner('<svg>' + V_SCENE[P.act](LK) + '</svg>');
  const bubble = '<circle cx="44" cy="20" r="1.8" fill="#f3eee2"/><circle cx="50" cy="15" r="2.6" fill="#f3eee2"/>' +
    '<rect x="55" y="1" width="44" height="44" rx="12" fill="#f3eee2"/><rect x="57.5" y="3.5" width="39" height="39" rx="10" fill="#1d2638"/>' +
    '<g transform="translate(58 4) scale(.38)">' + scene + '</g>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="34" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' + person + bubble + '</svg>';
}
['m', 'f'].forEach(w => Object.keys(PURP).filter(X => puWho(X) === w).forEach(X => {
  Object.defineProperty(FIG, X, { get: () => purpFig(X), enumerable: true });
}));

/* ---------- Frasi (purp = true) ---------- */
const SPU = {
  present: (X) => { const p = puSay(X); return { type: 'echo', check: 'claim', purp: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', purp: true, show: X, prompt: puTakes(X) + ' ' + puFor(PURP[X].act) + '?', model: 'Sì, ' + puSay(X) }),
  neg: (X) => { const o = puOther(X);
    return { type: 'neg', purp: true, show: X, ask: o, prompt: puTakes(X) + ' ' + puFor(o) + '?', model: 'No, ' + puName(X) + ' non prende ' + p3The(PURP[X].obj) + ' ' + puFor(o) + '.', complete: puSay(X) }; },
  alt: (X) => { const a = PURP[X].act, o = puOther(X), ord = Math.random() < 0.5 ? [a, o] : [o, a];
    return { type: 'alt', purp: true, show: X, prompt: puTakes(X) + ' ' + puFor(ord[0]) + ' o ' + puFor(ord[1]) + '?', model: puShort(X) }; },
  key: (X) => ({ type: 'key', purp: true, show: X, prompt: puQ(X), model: puShort(X) }),
  reveal: (X) => ({ type: 'reveal', purp: true, show: X, prompt: puQ(X) + ' ' + puShort(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', purp: true, show: X, prompt: puQ(X), model: puQ(X) })
};

/* ---------- Capire le frasi ----------
   gli scopi: «per leggere», «per aprire (la porta)»; il verbo deve essere intero (per legge = sbagliato).
   la frase intera: «(Max) (non) prende il libro …» con la persona e la cosa giuste. */
function puPurposes(s) {
  const out = [], re = / per ([a-z]+)(?: (la|il|l|una|un) ([a-z]+))?(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const v = PFORM[m[1]];
    if (!v) { out.push({ act: '?', inf: false, objOk: false }); continue; }
    const k = m[3] && WORD2KEY[m[3]];
    const objOk = !k || (v.act === 'open' && k === 'door') || (ACTS[v.act] && ACTS[v.act].obj === k);
    out.push({ act: v.act, inf: v.p === 0, objOk: objOk });
  }
  return out;
}
function puTake(s, X) {
  const W = puWho(X), names = vNames();
  if (/ (prendo|prendi|prendere|prendiamo|prendono) /.test(s)) return { ok: false, neg: / non prend/.test(s) };
  const m = / (?:([a-z]+) )?(non )?prende (il|la|l|lo|un|una|uno) ([a-z]+)(?= )/.exec(s);
  if (!m) return { ok: !/ prende /.test(s), neg: / non /.test(s) };
  const who = names[m[1]] || (m[1] === 'lui' ? 'm' : m[1] === 'lei' ? 'f' : null);
  const k = WORD2KEY[m[4]], obj = PURP[X].obj;
  const artOk = k === obj && (m[3] === p3ArtN(obj) || m[3] === (ITEMS[obj].art === 'un\'' ? 'un' : ITEMS[obj].art));
  return { ok: (who === null || who === W) && artOk, neg: !!m[2] };
}
function purpEvaluate(step, text) {
  const s = norm(text), X = step.show, A = PURP[X].act;
  const other = vName(puWho(X) === 'm' ? 'f' : 'm').toLowerCase();
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'perche') && !has(s, other) && !puPurposes(s).length && puTake(s, X).ok, full: true };
  const ps = puPurposes(s), t = puTake(s, X), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (p) => p.inf && p.act === A && p.objOk, allTrue = ps.length && ps.every(truth);
  switch (step.type) {
    case 'echo': return { ok: !t.neg && allTrue && t.ok, full: true };
    case 'yes': return { ok: yes && !no && !t.neg && allTrue && t.ok, full: true };
    case 'neg': {
      const denied = t.neg && ps.length && ps.every(p => p.inf && p.act === step.ask && p.objOk);
      const fixed = no && !t.neg && allTrue;                            // «No, per mangiare.»
      return { ok: !yes && t.ok && (denied || fixed), full: fixed };
    }
    default: return { ok: !t.neg && allTrue && t.ok && !has(s, 'o per') && !has(s, 'perche'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Perché Max prende il libro?», «Max prende il libro per leggere?» ---------- */
function purpEvalAsk(X, text) {
  const s = norm(text), bad = (model) => ({ ok: false, model: model || puQ(X) });
  const other = vName(puWho(X) === 'm' ? 'f' : 'm').toLowerCase();
  if (has(s, 'si') || has(s, 'no') || has(s, 'non') || has(s, other)) return bad();
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  if (!puTake(s, X).ok) return bad();
  const ps = puPurposes(s);
  if (has(s, 'perche') && !ps.length) return { ok: true, kind: 'what' };
  if (ps.length === 1 && ps[0].inf && ps[0].objOk) return { ok: true, kind: ps[0].act === PURP[X].act ? 'yes' : 'no', ask: ps[0].act };
  if (ps.length === 1 && ps[0].act !== '?') return bad(puTakes(X) + ' ' + puFor(ps[0].act) + '?');   // «per legge?» → «per leggere?»
  return bad();
}
function purpAnswerAsk(X, r) {
  if (r.kind === 'thing') return 'È ' + np(PURP[X].obj) + '.';
  if (r.kind === 'yes') return 'Sì, ' + puSay(X);
  if (r.kind === 'no') return 'No, ' + puName(X) + ' non prende ' + p3The(PURP[X].obj) + ' ' + puFor(r.ask) + '. ' + puShort(X);
  return puShort(X);
}

function purpDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === puSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SPU[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildPurpSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SPU.present(x), 'present')));
  shuffle(K).forEach(x => add(SPU.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SPU.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SPU.yes(X) : SPU.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SPU.alt(x), 'alt'));
  add(SPU.reveal(K[0]), 'reveal').pause = 1200;
  add(SPU.reveal(K[K.length - 1]), 'reveal');
  add(SPU.askQ(K[0]), 'askq');
  add(SPU.askQ(K[K.length - 1]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SPU.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', purp: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SPU[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', purp: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.purp ? buildPurpSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.purp ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.purp ? purpEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isPurp(X) ? purpEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isPurp(X) ? purpAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.purp ? purpDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isPurp(X) ? SPU.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isPurp(X) ? SPU.present(X) : bPresent.apply(null, arguments); };
})();
