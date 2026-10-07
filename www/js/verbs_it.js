'use strict';
/* =====================================================================
   CAPITOLO 4: «Verbi al presente: Cosa fa…?» (lezione 23). Si carica dopo third_it.js (i due colleghi)
   e appt_it.js. I due colleghi dell'insegnante (un uomo e una donna, come nella lezione 12) fanno qualcosa,
   con le cose già note: libro, porta, finestra, arancia, aranciata, telefono.
     Max legge un libro.  Giulia telefona.           → ripete
     Max apre la porta?                              → Sì, Max apre la porta.
     Giulia beve un'aranciata?                       → No, Giulia non beve un'aranciata.
     Max legge un libro o mangia un'arancia?         → Max legge un libro.
     Cosa fa Giulia?                                 → Giulia chiude la finestra.   (va bene anche «Chiude la finestra.»)
   Il punto: il verbo con «lui / lei»: legge, apre, beve, chiude (-e); mangia, telefona (-a).
   Errori: «Max leggo», «Giulia leggere», il verbo sbagliato, la persona sbagliata, «un porta».
   ===================================================================== */

// le azioni: chi la fa (m = il collega, f = la collega), il verbo e la cosa (obj = chiave in ITEMS, the = articolo)
const ACTS = {
  read:  { verb: 'legge',    obj: 'book',   the: 'un' },
  open:  { verb: 'apre',     obj: 'door',   the: 'la' },
  eat:   { verb: 'mangia',   obj: 'orange', the: 'un\'' },
  drink: { verb: 'beve',     obj: 'soda',   the: 'un\'' },
  close: { verb: 'chiude',   obj: 'window', the: 'la' },
  phone: { verb: 'telefona', obj: null }
};
// tutte le forme che l'allievo può dire (p = persona: 0 = infinito, 1 io, 2 tu, 3 lui/lei/Lei)
const VFORM = {};
[['read', 'leggere leggo leggi legge'], ['open', 'aprire apro apri apre'], ['eat', 'mangiare mangio mangi mangia'],
 ['drink', 'bere bevo bevi beve'], ['close', 'chiudere chiudo chiudi chiude'], ['phone', 'telefonare telefono telefoni telefona']
].forEach(([a, f]) => f.split(' ').forEach((w, p) => { VFORM[w] = { act: a, p: p }; }));
const isVerb = (X) => typeof X === 'string' && /^v_[mf]_/.test(X);
const vWho = (X) => X.charAt(2);
const vAct = (X) => X.slice(4);
const vName = (w) => p3Name(w);
const vPron = (w) => w === 'f' ? 'lei' : 'lui';
const vObj = (a) => { const A = ACTS[a]; return A.obj ? (A.the === 'un\'' ? 'un\'' : A.the + ' ') + ITEMS[A.obj].word : ''; };
const vDoes = (a) => ACTS[a].verb + (ACTS[a].obj ? ' ' + vObj(a) : '');            // «legge un libro», «telefona»
const vSay = (X) => vName(vWho(X)) + ' ' + vDoes(vAct(X)) + '.';                    // «Max legge un libro.»
const vQ = (X) => 'Cosa fa ' + vName(vWho(X)) + '?';
const vOther = (X) => pick(Object.keys(ACTS).filter(a => a !== vAct(X)));

/* ---------- Figure: il collega o la collega che fa la cosa ---------- */
const V_PERSON = (LK, arms, face, dx) => '<g transform="translate(' + (dx || 0) + ' 6)">' + tTorso(LK) + tHeadStill(LK, face || { mouth: 'smile' }) + arms + '</g>';
// freccia verde curva (da a, curva su c, fino a b): dice se la porta si apre o la finestra si chiude
function vArrow(a, c, b) {
  const dx = b[0] - c[0], dy = b[1] - c[1], n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, L = 6, W = 4.5;
  const tip = [b[0] + ux * 3, b[1] + uy * 3], l = [b[0] - uy * W, b[1] + ux * W], r = [b[0] + uy * W, b[1] - ux * W];
  const d = 'M' + a.join(' ') + ' Q' + c.join(' ') + ' ' + b.join(' ');
  return '<path d="' + d + '" fill="none" stroke="#141a27" stroke-width="5.5" stroke-linecap="round" opacity=".5"/>' +
    '<path d="' + d + '" fill="none" stroke="#3fb35f" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M' + tip.join(' ') + ' L' + l.join(' ') + ' L' + r.join(' ') + 'z" fill="#3fb35f" stroke="#141a27" stroke-width=".8" stroke-opacity=".5"/>';
}
// il panorama dietro la porta e la finestra: cielo, sole, colline (sea = il mare)
const vView = (x, y, w, h, sea) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#8cc4e3"/>' +
  '<circle cx="' + (x + w - 6) + '" cy="' + (y + 8) + '" r="3.6" fill="#f3d36b"/>' +
  (sea ? '<path d="M' + x + ' ' + (y + h * .62) + ' h' + w + ' V' + (y + h) + ' H' + x + 'z" fill="#3f7fb5"/><path d="M' + (x + 3) + ' ' + (y + h * .75) + ' h6 M' + (x + 15) + ' ' + (y + h * .85) + ' h7" stroke="#cfe6f5" stroke-width="1"/>'
       : '<path d="M' + x + ' ' + (y + h * .6) + ' q' + w * .3 + ' -9 ' + w * .55 + ' -3 q' + w * .25 + ' -6 ' + w * .45 + ' 1 V' + (y + h) + ' H' + x + 'z" fill="#6fae6a"/>' +
         '<path d="M' + x + ' ' + (y + h * .8) + ' q' + w * .5 + ' -8 ' + w + ' 1 V' + (y + h) + ' H' + x + 'z" fill="#4f8f4f"/>');
const V_SCENE = {
  // legge: il libro aperto tra le mani, davanti al petto
  read: (LK) => V_PERSON(LK, tArm(LK, [35, 47], [33, 68], [40, 62]) + tArm(LK, [65, 47], [67, 68], [60, 62]) +
    '<path d="M50 56 q-7 -4 -16 -2 v13 q9 -2 16 2z" fill="#f3eee2"/><path d="M50 56 q7 -4 16 -2 v13 q-9 -2 -16 2z" fill="#ece4d2"/>' +
    '<path d="M50 56 v13" stroke="#c9b994" stroke-width="1"/><path d="M38 59 h8 M38 62 h8 M54 59 h8 M54 62 h8" stroke="#a9a089" stroke-width="1"/>' +
    '<path d="M34 67 q8 -2 16 2 q8 -4 16 -2 v2.5 q-8 -2 -16 2 q-8 -4 -16 -2z" fill="#2c3e66"/>', { mouth: 'flat' }),
  // apre la porta: porta scorrevole (come gli shoji giapponesi); scorre verso Max e si vede il panorama (freccia ←)
  open: (LK) => '<rect x="60" y="6" width="36" height="86" fill="#4a3628"/>' + vView(63, 9, 30, 83) +
    '<rect x="63" y="9" width="17" height="83" fill="#8e6741"/><rect x="65.5" y="12" width="12" height="77" fill="#f3eee2"/>' +
    '<path d="M71.5 12 v77 M65.5 28 h12 M65.5 44 h12 M65.5 60 h12 M65.5 76 h12" stroke="#b58a5e" stroke-width="1.2"/>' +
    '<rect x="78" y="46" width="1.6" height="8" rx=".8" fill="#4a3628"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [80, 58], [94, 45]), null, -16) +
    vArrow([93, 32], [84, 26], [70, 31]),
  // mangia un'arancia: l'arancia alla bocca
  eat: (LK) => V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [72, 62], [60, 38]) +
    '<circle cx="58" cy="32" r="6.5" fill="#e8862a"/><circle cx="56" cy="30" r="2" fill="#f2a54a" opacity=".7"/><path d="M58 25.5 q4 -4 8 -1 q-4 3 -8 1z" fill="#5a9a46"/>', { mouth: 'open' }),
  // beve un'aranciata: la lattina rossa (lunga) davanti al petto, la cannuccia in bocca
  drink: (LK) => V_PERSON(LK, tArm(LK, ...DOWN_L) +
    '<path d="M56 41 L51.2 31.6" stroke="#f3eee2" stroke-width="1.6" stroke-linecap="round"/><path d="M56 41 L53.6 36.3" stroke="#e8862a" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M54 41 h8 l1.2 2.2 v18 l-1.2 2.2 h-8 l-1.2 -2.2 v-18z" fill="#c8262f"/><path d="M54 41 h8 l1.2 2.2 h-10.4z M52.8 61.2 h10.4 l-1.2 2.2 h-8z" fill="#c9ccd4"/>' +
    '<path d="M52.8 48 h10.4 v8 h-10.4z" fill="#f3eee2"/><circle cx="58" cy="52" r="2.6" fill="#e8862a"/><path d="M55 45 v15" stroke="#e26a6f" stroke-width="1.3" opacity=".6"/>' +
    tArm(LK, [65, 47], [72, 64], [63, 55]), { mouth: 'o' }),
  // chiude la finestra: finestra scorrevole; Giulia spinge il vetro verso destra e copre il panorama (freccia →)
  close: (LK) => '<rect x="60" y="10" width="36" height="52" rx="1.5" fill="#dfe4ea"/>' + vView(63, 13, 30, 46, true) +
    '<rect x="63" y="13" width="18" height="46" fill="#c8ced6"/><rect x="65" y="15" width="14" height="42" fill="#9fbcd0"/><path d="M65 15 h8 l-8 12z M79 33 v10 l-10 14 h-4z" fill="#eef4f8" opacity=".6"/>' +
    '<rect x="79" y="31" width="1.6" height="8" rx=".8" fill="#8d93a3"/><rect x="58" y="62" width="40" height="4" fill="#c8ced6"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [76, 56], [88, 44]), null, -16) +
    vArrow([66, 22], [76, 16], [89, 22]),
  // telefona: il telefono all'orecchio, parla
  phone: (LK) => V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 58], [62, 30]) +
    '<g transform="rotate(14 62 24)"><rect x="58" y="13" width="9" height="20" rx="2" fill="#2c3e66" stroke="#b9bdc8" stroke-width="1.2"/><rect x="59.6" y="16" width="5.8" height="13" fill="#3a4f7e"/></g>' +
    '<path d="M70 14 q4 3 0 7 M73 11 q7 6 0 13" fill="none" stroke="#c9a45c" stroke-width="1.6" stroke-linecap="round"/>', { mouth: 'talk' })
};
function verbFig(X) {
  const k = p3Key(vWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  const body = LK && typeof tTorso === 'function' ? V_SCENE[vAct(X)](LK) : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="34" ry="3" fill="#000" opacity=".25"/>' + body + '</svg>';
}
['m', 'f'].forEach(w => Object.keys(ACTS).forEach(a => {
  Object.defineProperty(FIG, 'v_' + w + '_' + a, { get: () => verbFig('v_' + w + '_' + a), enumerable: true });
}));

/* ---------- Frasi (verbs = true) ---------- */
const SV = {
  present: (X) => { const p = vSay(X); return { type: 'echo', check: 'claim', verbs: true, show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', verbs: true, show: X, prompt: vName(vWho(X)) + ' ' + vDoes(vAct(X)) + '?', model: 'Sì, ' + vName(vWho(X)) + ' ' + vDoes(vAct(X)) + '.' }),
  neg: (X) => { const o = vOther(X), n = vName(vWho(X));
    return { type: 'neg', verbs: true, show: X, ask: o, prompt: n + ' ' + vDoes(o) + '?', model: 'No, ' + n + ' non ' + vDoes(o) + '.', complete: vSay(X) }; },
  alt: (X) => { const a = vAct(X), o = vOther(X), ord = Math.random() < 0.5 ? [a, o] : [o, a];
    return { type: 'alt', verbs: true, show: X, prompt: vName(vWho(X)) + ' ' + vDoes(ord[0]) + ' o ' + vDoes(ord[1]) + '?', model: vSay(X) }; },
  key: (X) => ({ type: 'key', verbs: true, show: X, prompt: vQ(X), model: vSay(X) }),
  reveal: (X) => ({ type: 'reveal', verbs: true, show: X, prompt: vQ(X) + ' ' + vSay(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', verbs: true, show: X, prompt: vQ(X), model: vQ(X) })
};

/* ---------- Capire le frasi ----------
   «(Max / lui) (non) legge (un libro)»: chi, il verbo e la sua forma, la cosa (se c'è, con l'articolo giusto). */
function vNames() {
  const P = p3People(), out = {};
  ['m', 'f'].forEach(w => { out[norm(TEACHERS[P[w]].name).trim()] = w; });
  return out;
}
function verbStatements(s) {
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const v = VFORM[w[i]];
    if (!v) continue;
    // «il telefono», «un telefono»: è la cosa, non il verbo
    if (v.act === 'phone' && v.p === 1 && /^(il|un|del|al|nel|sul)$/.test(w[i - 1] || '')) continue;
    let j = i - 1, neg = false, subj = null;
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]];
    else if (w[j] === 'lui') subj = 'm';
    else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    // la cosa: «un libro», «la porta», «un arancia» (l'apostrofo il microfono lo toglie)
    let obj = null, objOk = true;
    const art = w[i + 1], word = w[i + 2];
    if (/^(un|una|uno|il|la|lo|l)$/.test(art || '') && WORD2KEY[word]) {
      obj = WORD2KEY[word];
      const A = ITEMS[obj].art;
      const good = /^[aeiou]/.test(word) ? ['un', 'l'] : A === 'una' ? ['una', 'la'] : A === 'uno' ? ['uno', 'lo'] : ['un', 'il'];
      objOk = good.indexOf(art) !== -1;
    }
    out.push({ subj: subj, neg: neg, act: v.act, p: v.p, obj: obj, objOk: objOk });
  }
  return out;
}
// la frase dice l'azione a, fatta dalla persona W? (soggetto: nessuno, il nome, lui/lei; verbo alla 3ª persona; la cosa giusta o nessuna)
const vGood = (x, a, W) => x.p === 3 && x.act === a && (x.subj === null || x.subj === W) && x.objOk && (x.obj === null || x.obj === ACTS[a].obj);
function verbEvaluate(step, text) {
  const s = norm(text), X = step.show, W = vWho(X), a = vAct(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'cosa fa') && !has(s, vName(vWho(X) === 'm' ? 'f' : 'm').toLowerCase()) && !verbStatements(s).length, full: true };
  const st = verbStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => vGood(x, a, W), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => vGood(x, step.ask, W)) && !neg.some(x => x.act === a) && neg.every(x => x.p === 3 && x.objOk) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'cosa fa'), full: true };
  }
}

/* ---------- Le domande dell'allievo: «Cosa fa Max?», «Max legge un libro?» ---------- */
function verbEvalAsk(X, text) {
  const s = norm(text), W = vWho(X), bad = (model) => ({ ok: false, model: model || vQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const other = vName(W === 'm' ? 'f' : 'm').toLowerCase();
  if (has(s, 'cosa fa')) return has(s, other) ? bad() : { ok: true, kind: 'what' };
  if (has(s, 'che cosa e')) return { ok: true, kind: 'thing' };
  const st = verbStatements(s).filter(x => x.subj === null || x.subj === W);
  if (st.length === 1 && st[0].p === 3 && st[0].objOk && (st[0].obj === null || st[0].obj === ACTS[st[0].act].obj)) return { ok: true, kind: st[0].act === vAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(vName(W) + ' ' + vDoes(st[0].act) + '?');   // forma o cosa sbagliata: si corregge quella domanda
  return bad();
}
function verbAnswerAsk(X, r) {
  const n = vName(vWho(X));
  if (r.kind === 'thing') return vSay(X);
  if (r.kind === 'yes') return 'Sì, ' + n + ' ' + vDoes(vAct(X)) + '.';
  if (r.kind === 'no') return 'No, ' + n + ' non ' + vDoes(r.ask) + '. ' + vSay(X);
  return vSay(X);
}

function verbDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.model === vSay(st.show) ? 1 : 0; out.length < n; i++) {
    const s = SV[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

function buildVerbSteps(lesson) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SV.present(x), 'present')));
  shuffle(K).forEach(x => add(SV.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SV.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SV.yes(X) : SV.neg(X), 'yesno'); prev = X; }
  shuffle(K).slice(0, 4).forEach(x => add(SV.alt(x), 'alt'));
  add(SV.reveal(K[0]), 'reveal').pause = 1200;
  add(SV.reveal(K[K.length - 1]), 'reveal');
  add(SV.askQ(K[0]), 'askq');
  add(SV.askQ(K[K.length - 1]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SV.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', verbs: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(SV[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', verbs: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  buildSteps = (lesson) => lesson.verbs ? buildVerbSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.verbs ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.verbs ? verbEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => isVerb(X) ? verbEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isVerb(X) ? verbAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.verbs ? verbDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isVerb(X) ? SV.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isVerb(X) ? SV.present(X) : bPresent.apply(null, arguments); };
})();
