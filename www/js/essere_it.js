'use strict';
/* =====================================================================
   CAPITOLO 2: «Il verbo essere» (lezione 14)
   Si carica dopo nat_it.js (persone e nazionalità della lezione 13) e poss_it.js (bollino «tu»).
   Le figure: l'insegnante («io», figura «e_me»), lo studente («Lei», figura «e_you»)
   e quattro persone della lezione 13 («lui», «lei»).
     (insegnante) Io sono italiano.                  → si ascolta (mano sul petto)
     Lui è inglese.                                  → ripete
     Lei è americana?                                → Sì, lei è americana.
     Io sono francese?                               → No, Lei non è francese.   (punto di vista rovesciato)
     Di che nazionalità sono (io)?                   → È italiano.   (senza «Lei», Massi; con il «tu»: Sei italiano.)
     Di che nazionalità è Lei?                       → Io sono … (la sua: qualunque nazionalità va bene)
   Con il «tu» (regTu(), la scelta dell'allievo): «Tu sei italiano.», «Di che nazionalità sei tu?»; allora «Lei è» è l'errore.
   Errori: «io sono italiano» detto dell'insegnante, «lui sono», «tu sei» (si dà del Lei),
   la nazionalità o l'accordo sbagliati.
   ===================================================================== */

const ESS_PEOPLE = ['n_m_inghilterra', 'n_f_francia', 'n_m_cina', 'n_f_america'];
const isEss = (X) => X === 'e_me' || X === 'e_you';
// tutte le nazionalità che l'allievo può dire di sé (le parole che cambiano hanno m e f)
const NAT_ALL = Object.assign({}, NAT_WORD);
[['tedesco', 'tedesca', 'germania'], ['giapponese', 'giapponese', 'giappone'], ['spagnolo', 'spagnola', 'spagna'], ['svizzero', 'svizzera', 'svizzera'],
 ['austriaco', 'austriaca', 'austria'], ['olandese', 'olandese', 'olanda'], ['russo', 'russa', 'russia'], ['brasiliano', 'brasiliana', 'brasile'],
 ['indiano', 'indiana', 'india'], ['canadese', 'canadese', 'canada'], ['australiano', 'australiana', 'australia'], ['coreano', 'coreana', 'corea'],
 ['portoghese', 'portoghese', 'portogallo'], ['polacco', 'polacca', 'polonia'], ['irlandese', 'irlandese', 'irlanda'], ['scozzese', 'scozzese', 'scozia'],
 ['belga', 'belga', 'belgio'], ['greco', 'greca', 'grecia'], ['turco', 'turca', 'turchia'], ['messicano', 'messicana', 'messico'],
 ['argentino', 'argentina', 'argentina'], ['svedese', 'svedese', 'svezia'], ['danese', 'danese', 'danimarca'], ['norvegese', 'norvegese', 'norvegia'],
 ['ucraino', 'ucraina', 'ucraina'], ['rumeno', 'rumena', 'romania'], ['egiziano', 'egiziana', 'egitto'], ['marocchino', 'marocchina', 'marocco']
].forEach(([m, f, c]) => { NAT_ALL[m] = NAT_ALL[m] || { c: c, g: {} }; NAT_ALL[m].g.m = true; NAT_ALL[f] = NAT_ALL[f] || { c: c, g: {} }; NAT_ALL[f].g.f = true; });
NAT_ALL.americano.g.m = true;

// L'insegnante di oggi (in prova: Pietro)
const eTeacher = () => TEACHERS[typeof selectedTeacherKey === 'function' ? selectedTeacherKey() : 'luca'] || TEACHERS.luca;
const eTG = () => eTeacher().gender === 'f' ? 'f' : 'm';
const eIt = () => nAdj('italia', eTG());                                   // «italiano» / «italiana»
// la nazionalità d'esempio per lo studente (dalla sua lingua), finché non dice la sua
const SELF_NAT = { en: 'inglese', de: 'tedesco', ja: 'giapponese', it: 'italiano' };
function eSelf() {
  if (typeof L !== 'undefined' && L && L.selfNat) return L.selfNat;
  const ui = (typeof DB !== 'undefined' && DB && DB.settings && DB.settings.uiLang) || 'en';
  return SELF_NAT[ui] || 'inglese';
}
const ePron = (X) => nG(X) === 'f' ? 'lei' : 'lui';
// l'insegnante visto dall'allievo: «Lei è» / «tu sei» (regTu() in logic.js: la scelta dell'allievo); youQ = la domanda all'allievo
// senza pronome (Massi): «È italiano.» / «Sei italiano.» — «Lei è italiano» sembra «lei», una donna; «tu sei» è una ripetizione
const eYou = (neg) => regTu() ? (neg ? 'non sei' : 'sei') : (neg ? 'non è' : 'è');
const eYouQ = () => regTu() ? 'Di che nazionalità sei?' : 'Di che nazionalità è Lei?';
const eCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Figure: l'insegnante con la bandiera italiana, lo studente = sagoma d'oro ---------- */
function eMeFig() {
  const t = eTeacher(), LK = (typeof LOOKS !== 'undefined' && LOOKS[t.look || t.key]) || null, flag = (typeof FLAG !== 'undefined' && FLAG.italia) || '';
  const body = LK && typeof tTorso === 'function' ? tTorso(LK) + tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R) + tHeadStill(LK, { mouth: 'smile' }) : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 100) scale(1.42) translate(-50 -68)">' + body + '</g>' +
    '<rect x="65" y="70" width="30" height="21" rx="2" fill="#1d2638"/><g transform="translate(67 72) scale(.26 .17)">' + flag + '</g>' +
    '<rect x="66" y="71" width="28" height="19" rx="1.5" fill="none" stroke="#c9a45c" stroke-width="1.6"/></svg>';
}
const E_YOU_FIG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="34" r="17" fill="#c9a45c"/>' +
  '<path d="M18 98 q0 -40 32 -40 q32 0 32 40z" fill="#c9a45c"/><circle cx="50" cy="34" r="17" fill="none" stroke="#e9d3a0" stroke-width="1.5"/></svg>';
Object.defineProperty(FIG, 'e_me', { get: eMeFig, enumerable: true });
FIG.e_you = E_YOU_FIG;

/* ---------- Frasi (ess = true) ---------- */
const SE = {
  // persone: «Lui è inglese.»
  present: (X) => { const p = eCap(ePron(X)) + ' è ' + nAdj(nC(X), nG(X)) + '.'; return { type: 'echo', check: 'claim', ess: true, show: X, prompt: p, model: p }; },
  yes: (X) => {
    if (X === 'e_me') return { type: 'yes', ess: true, show: X, prompt: 'Io sono ' + eIt() + '?', model: 'Sì, ' + eYou() + ' ' + eIt() + '.' };
    const a = nAdj(nC(X), nG(X)); return { type: 'yes', ess: true, show: X, prompt: eCap(ePron(X)) + ' è ' + a + '?', model: 'Sì, ' + ePron(X) + ' è ' + a + '.' };
  },
  neg: (X, other) => {
    if (X === 'e_me') { const a = nAdj(other, eTG()); return { type: 'neg', ess: true, show: X, ask: other, prompt: 'Io sono ' + a + '?', model: 'No, ' + eYou(true) + ' ' + a + '.', complete: eCap(eYou()) + ' ' + eIt() + '.' }; }
    const a = nAdj(other, nG(X));
    return { type: 'neg', ess: true, show: X, ask: other, prompt: eCap(ePron(X)) + ' è ' + a + '?', model: 'No, ' + ePron(X) + ' non è ' + a + '.', complete: eCap(ePron(X)) + ' è ' + nAdj(nC(X), nG(X)) + '.' };
  },
  alt: (X, other) => {
    const me = X === 'e_me', c = me ? 'italia' : nC(X), g = me ? eTG() : nG(X), o = Math.random() < 0.5 ? [c, other] : [other, c];
    return { type: 'alt', ess: true, show: X, prompt: (me ? 'Io sono ' : eCap(ePron(X)) + ' è ') + nAdj(o[0], g) + ' o ' + nAdj(o[1], g) + '?',
             model: (me ? eCap(eYou()) + ' ' : eCap(ePron(X)) + ' è ') + nAdj(c, g) + '.' };
  },
  key: (X) => {
    if (X === 'e_me') return { type: 'key', ess: true, show: X, prompt: 'Di che nazionalità sono (io)?', model: eCap(eYou()) + ' ' + eIt() + '.' };
    if (X === 'e_you') return { type: 'key', ess: true, self: true, show: X, prompt: eYouQ(), model: 'Io sono ' + eSelf() + '.' };
    return { type: 'key', ess: true, show: X, prompt: 'Di che nazionalità è ' + ePron(X) + '?', model: eCap(ePron(X)) + ' è ' + nAdj(nC(X), nG(X)) + '.' };
  },
  // l'insegnante si presenta (si ascolta): «Io sono italiano.» / chiede all'allievo e risponde per lui la prima volta
  meIntro: () => ({ type: 'reveal', ess: true, show: 'e_me', prompt: 'Io sono ' + eIt() + '.', model: '' }),
  youIntro: () => ({ type: 'reveal', ess: true, show: 'e_you', prompt: 'Io sono ' + eIt() + '. E ' + R.you() + '? ' + eYouQ(), model: '' })
};
const eOther = (X) => pick(Object.keys(NATS).filter(c => c !== (X === 'e_me' ? 'italia' : nC(X))));

/* ---------- Capire le frasi ----------
   «(lui) è inglese», «Lei non è francese», «io sono tedesca»: soggetto, verbo e nazionalità. */
function essStatements(s) {
  const out = [], re = / (?:(io|lui|lei|tu) )?(non )?(sono|e|sei|siamo|sono) ([a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const w = NAT_ALL[m[4]];
    if (!w) continue;   // «è il…», «è una…»: non è una frase sulla nazionalità
    out.push({ pron: m[1] || null, neg: !!m[2], verb: m[3], c: w.c, g: w.g });
  }
  return out;
}
// Chi è il soggetto giusto per la figura: persone = lui/lei + «è»; insegnante = Lei + «è» (con il «tu»: tu + «sei»); studente = io + «sono»
function essSubjOk(X, x) {
  if (X === 'e_you') return (x.pron === null || x.pron === 'io') && x.verb === 'sono';
  if (X === 'e_me') return regTu() ? (x.pron === null || x.pron === 'tu') && x.verb === 'sei' : (x.pron === null || x.pron === 'lei') && x.verb === 'e';
  return (x.pron === null || x.pron === ePron(X)) && x.verb === 'e';
}
function essTruth(X, x, c) {
  if (!essSubjOk(X, x)) return false;
  if (X === 'e_you') return true;   // la sua nazionalità: qualunque, purché detta bene
  const g = X === 'e_me' ? eTG() : nG(X);
  return x.c === c && !!x.g[g];
}
function essEvaluate(step, text) {
  const s = norm(text), X = step.show, c = X === 'e_me' ? 'italia' : X === 'e_you' ? null : nC(X);
  const st = essStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => essTruth(X, x, c), allPos = pos.every(truth);
  let r;
  switch (step.type) {
    case 'echo': r = { ok: pos.some(truth) && allPos && !neg.length, full: true }; break;
    case 'yes': r = { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true }; break;
    case 'neg': {
      const g = X === 'e_me' ? eTG() : nG(X);
      const said = neg.some(x => essSubjOk(X, x) && x.c === step.ask && !!x.g[g]);
      const denyTrue = neg.some(x => x.c === c);
      r = { ok: !yes && said && !denyTrue && allPos && neg.every(x => essSubjOk(X, x)), full: pos.some(truth) }; break;
    }
    default:
      r = { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'di che nazionalita'), full: true };
  }
  // lo studente ha detto la sua nazionalità: l'insegnante la ricorda per il resto della lezione
  if (r.ok && step.self && typeof L !== 'undefined' && L) { const x = pos.find(truth); const w = s.match(new RegExp(' (' + Object.keys(NAT_ALL).join('|') + ')(?= )')); if (x && w) L.selfNat = w[1]; }
  return r;
}

/* ---------- Le domande dell'allievo ----------
   «Di che nazionalità è lui?» «Lui è inglese?» «Lei è italiano?» (all'insegnante) «Di che nazionalità sono io?» */
function essEvalAsk(X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || (X === 'e_me' ? eYouQ() : X === 'e_you' ? 'Di che nazionalità sono io?' : 'Di che nazionalità è ' + ePron(X) + '?') });
  if (has(s, 'si') || has(s, 'no') || / non e /.test(s)) return bad();
  if (has(s, 'di che nazionalita')) return { ok: true, kind: 'what' };
  if (X === 'e_you') return bad();
  const st = essStatements(s);
  const tu = X === 'e_me' && regTu(), g = X === 'e_me' ? eTG() : nG(X), pron = X === 'e_me' ? (tu ? 'tu' : 'lei') : ePron(X);
  const q = st.filter(x => x.verb === (tu ? 'sei' : 'e') && (x.pron === null || x.pron === pron));
  if (q.length === 1 && q[0].g[g]) return { ok: true, kind: q[0].c === (X === 'e_me' ? 'italia' : nC(X)) ? 'yes' : 'no', ask: q[0].c };
  if (q.length === 1) return bad(eCap(pron) + (tu ? ' sei ' : ' è ') + nAdj(NATS[q[0].c] ? q[0].c : 'italia', g) + '?');
  return bad();
}
function essAnswerAsk(X, r) {
  if (X === 'e_you') return eCap(eYou()) + ' ' + eSelf() + '.';
  if (X === 'e_me') {
    if (r.kind === 'yes') return 'Sì, io sono ' + eIt() + '.';
    if (r.kind === 'no') return 'No, io non sono ' + nAdj(NATS[r.ask] ? r.ask : 'italia', eTG()) + '. Io sono ' + eIt() + '.';
    return 'Io sono ' + eIt() + '.';
  }
  const say = eCap(ePron(X)) + ' è ' + nAdj(nC(X), nG(X)) + '.';
  if (r.kind === 'yes') return 'Sì, ' + ePron(X) + ' è ' + nAdj(nC(X), nG(X)) + '.';
  if (r.kind === 'no') return 'No, ' + ePron(X) + ' non è ' + nAdj(NATS[r.ask] ? r.ask : 'italia', nG(X)) + '. ' + say;
  return say;
}

function essDrill(st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  const X = st.show;
  if (X === 'e_you') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = X === 'e_me' ? ['yes', 'neg', 'key'] : ['present', 'yes', 'neg'];
  for (let i = 0; out.length < n; i++) {
    const kind = kinds[i % 3], s = kind === 'neg' ? SE.neg(X, eOther(X)) : SE[kind](X);
    if (kind === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}

/* ---------- Sequenza della lezione ---------- */
function buildEssSteps(lesson) {
  const P = ESS_PEOPLE.slice(), K = P.concat(['e_me']), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  // 1. lui / lei con le persone già note (2-3 giri)
  presentRounds(P).forEach(round => round.forEach(x => add(SE.present(x), 'present')));
  shuffle(P).forEach(x => add(SE.yes(x), 'yes'));
  // 2. l'insegnante parla di sé: «Io sono italiano.» → «Sì, Lei è italiano.»
  add(SE.meIntro(), 'reveal').pause = 900;
  add(SE.yes('e_me'), 'yes');
  shuffle(K).forEach(x => add(SE.neg(x, eOther(x)), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const X = pick(K.filter(x => x !== prev));
    add(Math.random() < 0.5 ? SE.yes(X) : SE.neg(X, eOther(X)), 'yesno');
    prev = X;
  }
  shuffle(K).slice(0, 4).forEach(x => add(SE.alt(x, eOther(x)), 'alt'));
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SE.key(x), 'key'));
  // 3. e Lei? «Io sono…» (la sua nazionalità)
  add(SE.youIntro(), 'reveal').pause = 900;
  add(SE.key('e_you'), 'key');
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', ess: true, prompt: '', model: '' }, 'askfirst'); if (!i) s.intro = true; }
  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(['yes', 'neg', 'alt', 'key']);
    const s = add(t === 'neg' || t === 'alt' ? SE[t](X, eOther(X)) : SE[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  add(SE.key('e_you'), 'mix');
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', ess: true, prompt: '', model: '' }, 'ask'); if (!i) s.intro = true; }
  return st;
}
// Gesto: «io» → mano sul petto; «Lei» (lo studente) → lo indica
function essPose(st) { return st.show === 'e_me' ? 'me' : st.show === 'e_you' ? 'you' : null; }

(function () {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const lessonX = (X) => isEss(X) || (typeof L !== 'undefined' && L && L.lesson && L.lesson.ess && isNat(X));
  buildSteps = (lesson) => lesson.ess ? buildEssSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.ess ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step.ess ? essEvaluate(step, text) : bEval(step, text);
  evalAsk = (X, text) => lessonX(X) ? essEvalAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => lessonX(X) ? essAnswerAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st.ess ? essDrill(st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isEss(X) ? SE.key(X) && { type: 'reveal', ess: true, show: X, prompt: SE.key(X).prompt + ' ' + SE.key(X).model, model: '' } : bReveal.apply(null, arguments); };
  S.present = function (X) { return isEss(X) ? { type: 'echo', check: 'claim', ess: true, show: X, prompt: SE.key(X).model, model: SE.key(X).model } : bPresent.apply(null, arguments); };
  if (typeof possPose === 'function') { const bPose = possPose; possPose = (st) => st && st.ess ? essPose(st) : bPose(st); }
})();
