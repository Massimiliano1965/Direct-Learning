'use strict';
/* =====================================================================
   REGOLE DELL'ARABO STANDARD per il motore della lezione.
   Si carica dopo logic.js e sostituisce solo le parti legate alla lingua.
     هذا كتاب.               Questo è un libro.     (هذه con le parole femminili: هذه طاولة.)
     هل هذا كتاب؟            È un libro?            → نعم، هذا كتاب. / لا، هذا ليس كتابًا.
     هل هذا كتاب أم قلم؟      È un libro o una penna? → هذا قلم.
     ما هذا؟                 Che cos'è?             → هذا قلم.
   Come «questo/questa» in italiano, هذا/هذه si accorda con la parola.
   ===================================================================== */

const AR_KEYS = Object.keys(ITEMS);
const arDem = (k) => ITEMS[k].g === 'f' ? 'هذه' : 'هذا';
const arNot = (k) => ITEMS[k].g === 'f' ? 'ليست' : 'ليس';
const arPres = (k) => arDem(k) + ' ' + ITEMS[k].word;

np = (k) => ITEMS[k].word;
altPrompt = (a, b) => 'هل ' + arDem(a) + ' ' + np(a) + ' أم ' + np(b) + '؟';
Q = 'ما هذا؟';

// Senza segni vocalici; alef, tā' marbūṭa e yā' scritti in un modo solo; «كتابًا» → «كتاب».
function arBase(text) {
  return String(text || '')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^ء-ي\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
const AR_WORD = {};   // forma normalizzata → oggetto
AR_KEYS.forEach(k => {
  [ITEMS[k].word, ITEMS[k].acc].concat(ITEMS[k].alias).forEach(w => { AR_WORD[arBase(w)] = k; });
  AR_WORD[arBase(ITEMS[k].word) + 'ا'] = k;   // «كتابا» anche senza tanwīn
});
norm = function (text) {
  const words = arBase(text).split(' ').filter(Boolean).map(w => {
    if (w === 'هاذا') return 'هذا';
    if (w === 'هاذه' || w === 'هاذي' || w === 'هذي') return 'هذه';
    if (w === 'ليسه') return 'ليست';
    if (w === 'او') return 'ام';
    if (AR_WORD[w]) return arBase(ITEMS[AR_WORD[w]].word);
    return w;
  });
  return ' ' + words.join(' ') + ' ';
};
const AR_W = AR_KEYS.map(k => arBase(ITEMS[k].word)).join('|');
const AR_KEY = {};
AR_KEYS.forEach(k => { AR_KEY[arBase(ITEMS[k].word)] = k; });
// Affermazioni «هذا كتاب»: con il dimostrativo sbagliato («هذه كتاب») non vale ('!')
function arClaims(s) {
  const out = [], re = new RegExp(' (هذا|هذه) (' + AR_W + ')(?= )', 'g');
  let m;
  while ((m = re.exec(s)) !== null) { const k = AR_KEY[m[2]]; out.push((m[1] === 'هذه') === (ITEMS[k].g === 'f') ? k : '!'); }
  return out;
}
function arNegs(s) {
  const out = [], re = new RegExp(' (?:ليس|ليست) (' + AR_W + ')(?= )', 'g');
  let m;
  while ((m = re.exec(s)) !== null) out.push(AR_KEY[m[1]]);
  return out;
}
const arYes = (s) => /^ (?:نعم|اجل|ايوه|ايوا|بلي)/.test(s);
const arNo = (s) => /^ لا /.test(s);
const arIsQ = (s) => / ما (?:هذا|هذه) /.test(s);

const arEvaluateExact = function (step, text) {
  const s = norm(text);
  const c = arClaims(s), n = arNegs(s);
  const X = step.show;
  const yes = arYes(s), no = arNo(s);
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: arIsQ(s) && !c.length && !n.length, full: true };
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length && !arIsQ(s), full: true };
    case 'yes':
      return { ok: yes && !no && !n.length && c.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg':
      // «لا، هذا ليس كتابًا.» oppure solo «هذا ليس كتابًا.» / «ليس كتابًا.»
      return { ok: !yes && n.indexOf(step.ask) !== -1 && n.indexOf(X) === -1 && onlyX, full: c.indexOf(X) !== -1 };
    case 'alt':
    case 'key':
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length && s.indexOf(' ام ') === -1 && !arIsQ(s), full: true };
  }
  return { ok: false, full: false };
};

// Domande dell'allievo
evalAsk = function (X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || Q });
  if (arYes(s) || arNo(s) || arNegs(s).length) return bad();   // ha risposto, non chiesto
  const alt = new RegExp(' (هذا|هذه) (' + AR_W + ') ام (' + AR_W + ') ').exec(s);
  if (alt) {
    const A = AR_KEY[alt[2]], B = AR_KEY[alt[3]];
    if (A === B) return bad();
    if ((alt[1] === 'هذه') !== (ITEMS[A].g === 'f')) return bad(altPrompt(A, B));
    return { ok: true, kind: 'alt', ask: A, ask2: B };
  }
  const c = arClaims(s);
  if (arIsQ(s) && !c.length) return { ok: true, kind: 'what' };
  if (c.length === 1 && c[0] === '!') {
    const w = new RegExp(' (?:هذا|هذه) (' + AR_W + ') ').exec(s);
    return bad(w ? 'هل ' + arPres(AR_KEY[w[1]]) + '؟' : null);
  }
  if (c.length === 1) return { ok: true, kind: c[0] === X ? 'yes' : 'no', ask: c[0] };
  return bad();
};
answerAsk = function (X, r) {
  const notIt = (k) => arDem(k) + ' ' + arNot(k) + ' ' + ITEMS[k].acc;
  if (r.kind === 'what') return arPres(X) + '.';
  if (r.kind === 'yes') return 'نعم، ' + arPres(X) + '.';
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? arPres(X) + '.' : 'ليس ' + ITEMS[r.ask].acc + ' ولا ' + ITEMS[r.ask2].acc + '. ' + arPres(X) + '.';
  return 'لا، ' + notIt(r.ask) + '. ' + arPres(X) + '.';
};

// Frasi dell'insegnante (q = «questo» c'è sempre: هذا/هذه)
Object.assign(S, {
  present: (X) => { const p = arPres(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes:     (X, q) => ({ type: 'yes', show: X, questo: !!q, prompt: 'هل ' + arPres(X) + '؟', model: 'نعم، ' + arPres(X) + '.' }),
  neg:  (X, Y, q) => ({ type: 'neg', show: X, ask: Y, questo: !!q, prompt: 'هل ' + arPres(Y) + '؟', model: 'لا، ' + arDem(Y) + ' ' + arNot(Y) + ' ' + ITEMS[Y].acc + '.' }),
  alt:  (X, Y, q) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', show: X, options: o, questo: !!q, prompt: altPrompt(o[0], o[1]), model: arPres(X) + '.' };
  },
  key:     (X) => ({ type: 'key', show: X, prompt: Q, model: arPres(X) + '.' }),
  reveal:  (X) => ({ type: 'reveal', show: X, prompt: Q + ' ' + arPres(X) + '.', model: '' }),
  askQ:    (X) => ({ type: 'echo', check: 'question', show: X, prompt: Q, model: Q })
});

/* ---------- Confronto sul SUONO ----------
   Il microfono può scrivere lettere vicine (ت/ط, ك/ق, س/ص…) o parole un po' storpiate:
   si confrontano le frasi lettera per lettera, con le lettere che si confondono «quasi uguali».
   Vince la frase possibile che somiglia di più; la severità dipende dall'insegnante. */
const AR_TOL = { mass: 0.85, giulia: 0.76, luca: 0.66, sara: 0.55 };
function arTol() {
  const t = (typeof L !== 'undefined' && L && L.teacher) ? L.teacher.key : null;
  return AR_TOL[t] || 0.66;
}
const AR_CLASS = { 'ت': 'T', 'ط': 'T', 'د': 'D', 'ض': 'D', 'ذ': 'Z', 'ز': 'Z', 'ظ': 'Z', 'س': 'S', 'ص': 'S', 'ث': 'S',
  'ك': 'K', 'ق': 'K', 'ه': 'H', 'ح': 'H', 'ا': 'A', 'ع': 'A', 'ء': 'A', 'ي': 'Y', 'و': 'W', 'غ': 'G', 'خ': 'X' };
function arSound(s) { return s.replace(/\s/g, '').split('').map(ch => AR_CLASS[ch] || ch); }
function arSim(a, b) {
  if (!a.length || !b.length) return 0;
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
}
function arCandidates(step) {
  const all = AR_KEYS, X = step.show, out = [];
  const add = (t, ok, full) => out.push({ snd: arSound(norm(t).trim()), ok: ok, full: !!full });
  const notIt = (k) => arDem(k) + ' ' + arNot(k) + ' ' + ITEMS[k].word;
  const wrongDem = (k) => (ITEMS[k].g === 'f' ? 'هذا' : 'هذه') + ' ' + ITEMS[k].word;   // «questo» al posto di «questa»
  if (step.type === 'echo' && step.check === 'question') { add('ما هذا', true); all.forEach(k => add(arPres(k), false)); return out; }
  if (step.type === 'echo') { all.forEach(k => { add(arPres(k), k === X); add(wrongDem(k), false); add(notIt(k), false); }); return out; }
  if (step.type === 'yes') {
    all.forEach(k => { add('نعم ' + arPres(k), k === X); add('نعم ' + wrongDem(k), false); add('لا ' + notIt(k), false); add(arPres(k), false); });
    return out;
  }
  if (step.type === 'neg') {
    all.forEach(k => { add('لا ' + notIt(k), k === step.ask); add('نعم ' + arPres(k), false); add(arPres(k), false); });
    if (!step.fresh) all.forEach(k => { if (k !== step.ask) add('لا ' + notIt(step.ask) + ' ' + arPres(k), k === X, true); });
    return out;
  }
  all.forEach(k => { add(arPres(k), k === X); add(wrongDem(k), false); });
  return out;
}
function arBySound(step, text) {
  const heard = arSound(norm(text).trim());
  if (!heard.length) return null;
  let best = null, bestWrong = 0;
  arCandidates(step).forEach(c => {
    const s = arSim(heard, c.snd);
    if (c.ok) { if (!best || s > best.s) best = { s: s, full: c.full }; }
    else bestWrong = Math.max(bestWrong, s);
  });
  if (!best || best.s < arTol() || best.s <= bestWrong) return null;
  return { ok: true, full: best.full || step.type !== 'neg', bySound: true };
}
evaluate = function (step, text) {
  const r = arEvaluateExact(step, text);
  if (r.ok) return r;
  return arBySound(step, text) || r;
};

// Eco della domanda «o»: «…أم قلم» il microfono la scrive «هذا قلم»
const arIsEchoBase = isEcho;
isEcho = function (step, text) {
  if (arIsEchoBase(step, text)) return true;
  if (step && step.type === 'alt' && step.options && step.options[1] !== step.show) {
    const s = norm(text), c = arClaims(s);
    const words = s.trim().split(' ').filter(Boolean);
    if (words.length <= 3 && !arNegs(s).length && (c[0] === step.options[1] || (words.length <= 2 && AR_KEY[words[words.length - 1]] === step.options[1]))) return true;
  }
  return false;
};

/* ---------- Pronuncia in lettere latine (solo per lo schermo) ---------- */
const AR_TR = { 'هذا': 'hādhā', 'هذه': 'hādhihi', 'هل': 'hal', 'نعم': 'naʿam', 'لا': 'lā', 'ليس': 'laysa', 'ليست': 'laysat',
  'ام': 'am', 'ما': 'mā', 'ولا': 'wa-lā', 'دورك': 'dawruka', 'الان': 'al-āna' };
AR_KEYS.forEach(k => { AR_TR[arBase(ITEMS[k].word)] = ITEMS[k].tr; AR_TR[arBase(ITEMS[k].acc)] = ITEMS[k].tracc; });
function arTranslit(text) {
  let cap = true;
  return String(text).split(/(\s+|[،؟.!,?])/).map(tok => {
    if (!tok || /^\s+$/.test(tok)) return tok ? ' ' : '';
    if (tok === '،') return ',';
    if (tok === '؟') { cap = true; return '?'; }
    if (/^[.!?]$/.test(tok)) { cap = true; return tok; }
    let t = AR_TR[arBase(tok)] || tok;
    if (cap) { t = t.charAt(0).toUpperCase() + t.slice(1); cap = false; }
    return t;
  }).join('').replace(/\s+([,?.!])/g, '$1').replace(/\s+/g, ' ').trim();
}
COURSE.show = (text) => text + '\n' + arTranslit(text);
COURSE.heard = (text) => { const t = arTranslit(text); return t && t !== text ? text + ' (' + t + ')' : text; };
