'use strict';
/* =====================================================================
   PEZZI COMUNI per le lezioni dalla 32 in poi (capitolo 5: plurali, c'è / ci sono, quanto costa…).
   Si carica dopo colors_it.js. Ogni lezione dà le sue frasi (present, yes, neg, alt, key, reveal, askQ)
   e la sua valutazione; qui c'è la sequenza della lezione (uguale alle altre) e l'aggancio al motore.
   ===================================================================== */

// Plurali delle parole che si usano (o → i, a → e, e → i; -cia/-gia: arance, valigie)
const PLURAL = {
  book: 'libri', pen: 'penne', notebook: 'quaderni', cup: 'tazze', phone: 'telefoni', bag: 'borse', key: 'chiavi',
  laptop: 'portatili', coat: 'cappotti', suitcase: 'valigie', flask: 'borracce', umbrella: 'ombrelli', agenda: 'agende',
  orange: 'arance', backpack: 'zaini', mirror: 'specchi', label: 'etichette', bottle: 'bottiglie', table: 'tavoli', chair: 'sedie'
};
const PLURAL_KEY = {};
Object.keys(PLURAL).forEach(k => { PLURAL_KEY[PLURAL[k]] = k; });
PLURAL_KEY.valige = 'suitcase';
const gFem = (obj) => ITEMS[obj].art === 'una' || ITEMS[obj].art === 'un\'';
const gWord = (obj, n) => n > 1 ? PLURAL[obj] : ITEMS[obj].word;
// una parola (come la scrive norm) → { obj, plural } o null
function gNoun(w) {
  if (PLURAL_KEY[w]) return { obj: PLURAL_KEY[w], plural: true };
  if (WORD2KEY[w]) return { obj: WORD2KEY[w], plural: false };
  return null;
}
// articolo determinativo, singolare e plurale: il/lo/la/l', i/gli/le
function gDef(obj, n) {
  const w = gWord(obj, n), v = /^[aeiou]/.test(w), sc = /^(s[^aeiou]|z|gn|ps)/.test(w);
  if (n === 1) return v ? 'l\'' : gFem(obj) ? 'la' : sc ? 'lo' : 'il';
  return gFem(obj) ? 'le' : (v || sc) ? 'gli' : 'i';
}
const gJoin = (art, w) => art.slice(-1) === '\'' ? art + w : art + ' ' + w;
const gThe = (obj, n) => gJoin(gDef(obj, n), gWord(obj, n));                       // «gli ombrelli», «l'agenda»
const gNumW = (n) => ['', 'un', 'due', 'tre', 'quattro'][n];
// «un libro», «due libri»
const gCount = (obj, n) => n === 1 ? np(obj) : gNumW(n) + ' ' + PLURAL[obj];
const gCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// colore accordato: nero / nera / neri / nere (bianco → bianchi, bianche)
const COLORS_PL = { nero: { m: 'neri', f: 'nere' }, bianco: { m: 'bianchi', f: 'bianche' }, rosso: { m: 'rossi', f: 'rosse' } };
const gCol = (col, obj, n) => (n === 1 ? COLORS : COLORS_PL)[col][gFem(obj) ? 'f' : 'm'];
const G_COLOR_WORD = {};
Object.keys(COLORS).forEach(c => ['m', 'f'].forEach(g => {
  G_COLOR_WORD[COLORS[c][g]] = { col: c, g: g, plural: false };
  G_COLOR_WORD[COLORS_PL[c][g]] = { col: c, g: g, plural: true };
}));

/* ---------- Figure: una cosa, due o tre (un po' sovrapposte), vicine o lontane ---------- */
function gMany(fig, n, far) {
  const body = inner(fig).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const sc = far ? (n === 1 ? .42 : .34) : (n === 1 ? .9 : n === 2 ? .58 : .46);
  const xs = n === 1 ? [50] : n === 2 ? [32, 68] : [22, 50, 78];
  const cy = far ? 30 : 52;
  let out = xs.map(x => '<g transform="translate(' + (far ? 58 + (x - 50) * .55 : x) + ' ' + cy + ') scale(' + sc + ') translate(-50 -50)">' + body + '</g>').join('');
  if (far) out = '<path d="M2 62 L98 46" stroke="#3a4560" stroke-width="1.4"/><path d="M14 92 L40 66 M26 94 L48 68" stroke="#c9a45c" stroke-width="1.2" stroke-dasharray="2 3" opacity=".7"/>' + out;
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="' + (far ? 60 : 50) + '" cy="' + (far ? 50 : 92) + '" rx="' + (far ? 20 : 34) + '" ry="2.5" fill="#000" opacity=".25"/>' + out + '</svg>';
}

/* ---------- La sequenza della lezione (come nelle lezioni 23–33) ---------- */
// SX = le frasi della lezione; ognuna riceve X (la figura). altFn/negFn possono mancare.
function gBuildSteps(lesson, SX, flag) {
  const K = lesson.known.slice(), st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };
  presentRounds(K).forEach(round => round.forEach(x => add(SX.present(x), 'present')));
  if (SX.revealFirst) { add(SX.revealFirst(K[0]), 'reveal').pause = 1200; }
  shuffle(K).forEach(x => add(SX.yes(x), 'yes'));
  shuffle(K).forEach(x => add(SX.neg(x), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) { const X = pick(K.filter(x => x !== prev)); add(Math.random() < 0.5 ? SX.yes(X) : SX.neg(X), 'yesno'); prev = X; }
  if (SX.alt) shuffle(K).slice(0, 4).forEach(x => add(SX.alt(x), 'alt'));
  add(SX.reveal(K[0]), 'reveal').pause = 1200;
  add(SX.reveal(K[K.length - 1]), 'reveal');
  add(SX.askQ(K[0]), 'askq');
  add(SX.askQ(K[K.length - 1]), 'askq');
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(SX.key(x), 'key'));
  for (let i = 0; i < ASK_EARLY; i++) { const s = add({ type: 'ask', prompt: '', model: '' }, 'askfirst'); s[flag] = true; if (!i) s.intro = true; }
  prev = null;
  const kinds = SX.alt ? ['yes', 'neg', 'alt', 'key'] : ['yes', 'neg', 'key'];
  for (let b = 0; b < MIX_BLOCKS; b++) for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
    const X = pick(K.filter(x => x !== prev)), t = pick(kinds);
    const s = add(SX[t](X), 'mix'); s.speed = 1 + 0.06 * (b + 1); prev = X;
  }
  for (let i = 0; i < ASK_TURNS; i++) { const s = add({ type: 'ask', prompt: '', model: '' }, 'ask'); s[flag] = true; if (!i) s.intro = true; }
  return st;
}
function gDrill(SX, st, n) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') { while (out.length < n) out.push(Object.assign({}, first)); return out; }
  const kinds = ['present', 'yes', 'neg'];
  for (let i = st.type === 'echo' ? 1 : 0; out.length < n; i++) {
    const s = SX[kinds[i % 3]](st.show);
    if (kinds[i % 3] === 'present') s.prompt = s.model;
    s.drill = true; s.phase = st.phase; out.push(s);
  }
  return out;
}
// Aggancia una lezione al motore: flag = proprietà della lezione e dei passi; isX = le sue figure
function gInstall(flag, isX, SX, ev, evAsk, ansAsk, opts) {
  const bBuild = buildSteps, bWords = lessonWords, bEval = evaluate, bAsk = evalAsk, bAns = answerAsk, bDrill = buildDrill, bReveal = S.reveal, bPresent = S.present;
  const bEcho = isEcho, bTrim = trimEcho, digits = opts && opts.digits;
  buildSteps = (lesson) => lesson[flag] ? gBuildSteps(lesson, SX, flag) : bBuild(lesson);
  lessonWords = (l) => l[flag] ? l.known.slice() : bWords(l);
  evaluate = (step, text) => step && step[flag] ? ev(step, text) : bEval(step, text);
  evalAsk = (X, text) => isX(X) ? evAsk(X, text) : bAsk(X, text);
  answerAsk = (X, r) => isX(X) ? ansAsk(X, r) : bAns(X, r);
  buildDrill = (st, n, items) => st[flag] ? gDrill(SX, st, n) : bDrill(st, n, items);
  S.reveal = function (X) { return isX(X) ? SX.reveal(X) : bReveal.apply(null, arguments); };
  S.present = function (X) { return isX(X) ? SX.present(X) : bPresent.apply(null, arguments); };
  if (digits) {
    isEcho = (step, text) => bEcho(step, step && step[flag] ? numDigits(text) : text);
    trimEcho = (step, text) => bTrim(step, step && step[flag] ? numDigits(text) : text);
  }
}
// Le frasi hanno il flag della lezione: SX = gTag('pl', {...})
function gTag(flag, SX) {
  const out = {};
  Object.keys(SX).forEach(k => { out[k] = function () { const s = SX[k].apply(null, arguments); s[flag] = true; return s; }; });
  return out;
}

// Come norm() (logic.js), ma senza trasformare i plurali in singolari («libri» resta «libri»):
// nelle lezioni sui plurali il plurale è la risposta, non un errore del microfono.
function gNorm(text) {
  let s = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  s = s.replace(/['’`´]/g, ' ').replace(/[^a-z\s]/g, ' ');
  s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
  s = s.replace(/ cos e(?= )/g, ' cosa e').replace(/ cose(?= )/g, ' cosa e');
  s = s.replace(/ cosa e(?= )/g, (m, off) => s.slice(Math.max(0, off - 4), off) === ' che' ? m : ' che cosa e');
  s = s.replace(/ oppure(?= )/g, ' o');
  Object.keys(ITEMS).forEach(k => ITEMS[k].alias.forEach(a => {
    if (PLURAL_KEY[a]) return;
    s = s.replace(new RegExp(' ' + a + '(?= )', 'g'), ' ' + ITEMS[k].word);
  }));
  return s;
}
// genderWords (lezione 22): anche le parole al plurale, con la -i azzurra e la -e rosa.
// Solo le parole in -o / -a e i loro plurali (libro → libri, penna → penne): in «chiave → chiavi» la -i non dice il genere.
function gGenderWords(objs) {
  const w = [];
  objs.forEach(o => { if (/[oa]$/.test(ITEMS[o].word)) w.push(ITEMS[o].word, PLURAL[o]); });
  return w.filter((x, i) => x && w.indexOf(x) === i);
}
