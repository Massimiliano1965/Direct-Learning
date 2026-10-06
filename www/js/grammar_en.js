'use strict';
/* =====================================================================
   REGOLE DELL'INGLESE per il motore della lezione.
   Si carica dopo logic.js e sostituisce solo le parti legate alla lingua:
   frasi dell'insegnante, valutazione delle risposte, domande dell'allievo.
   Il flusso della lezione (buildSteps, ripetizioni, punteggi) resta quello.
     It's a book.                     È un libro.
     Is it a book?                    → Yes, it is a book.  /  No, it isn't a book.
     Is it a book or a pen?           → It's a pen.
     What is it?                      → It's a pen.
   Punto di grammatica: «a» / «an» (an umbrella), come un/una in italiano.
   Forme corte e lunghe valgono uguale: it's = it is, isn't = is not.
   ===================================================================== */

np = (k) => ITEMS[k].art + ' ' + ITEMS[k].word;
const enIt = (q) => q ? 'this' : 'it';
altPrompt = (a, b, q) => 'Is ' + enIt(q) + ' ' + np(a) + ' or ' + np(b) + '?';
Q = 'What is it?';

// Testo del microfono → forma unica: minuscole, forme corte sciolte, «this/that is» = «it is», alias.
norm = function (text) {
  let s = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  s = s.replace(/[’`´]/g, "'");
  s = ' ' + s.replace(/[^a-z'\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  s = s.replace(/ (it|what|that)'s /g, ' $1 is ').replace(/ isn't /g, ' is not ').replace(/ its /g, ' it is ')
       .replace(/ isnt /g, ' is not ').replace(/ whats /g, ' what is ').replace(/'/g, ' ');
  s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
  s = s.replace(/ (?:this|that) is /g, ' it is ').replace(/ is (?:this|that) /g, ' is it ')
       .replace(/ what is (?:this|that) /g, ' what is it ');
  s = s.replace(/ (?:yeah|yep|yup) /g, ' yes ').replace(/ nope /g, ' no ');
  Object.keys(ITEMS).forEach(k => {
    ITEMS[k].alias.forEach(a => { s = s.replace(new RegExp(' ' + a + '(?= )', 'g'), ' ' + ITEMS[k].word); });
  });
  return s;
};

// «it is not a table» → negazione; «it is a book» → affermazione (l'articolo deve essere giusto)
negations = function (s) { return collect(s, / it is not (a|an) ([a-z]+)(?= )/g); };
claims = function (s) {
  const t = s.replace(/ it is not (?:a|an) [a-z]+(?= )/g, ' # ');
  return collect(t, / it is (a|an) ([a-z]+)(?= )/g);
};

const enEvaluateExact = function (step, text) {
  const s = norm(text);
  const c = claims(s);
  const n = negations(s);
  const X = step.show;
  const yes = has(s, 'yes');
  const no = has(s, 'no');
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: has(s, 'what is it') && !c.length, full: true };
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length, full: true };
    case 'yes':
      return { ok: yes && !no && !n.length && c.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg':
      // «No, it isn't a table.» oppure solo «It isn't a table.»
      return { ok: !yes && n.indexOf(step.ask) !== -1 && n.indexOf(X) === -1 && onlyX, full: c.indexOf(X) !== -1 };
    case 'alt':
    case 'key':
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length && !has(s, 'or'), full: true };
  }
  return { ok: false, full: false };
};

// Domande dell'allievo sull'oggetto X che ha toccato
evalAsk = function (X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || Q });
  if (has(s, 'yes') || has(s, 'no') || negations(s).length || claims(s).length) return bad();   // ha risposto, non chiesto
  const alt = / is it (a|an) ([a-z]+) or (a|an) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const A = nounKey(alt[1], alt[2]), B = nounKey(alt[3], alt[4]);
    if (A && B && A.charAt(0) !== '?' && B.charAt(0) !== '?' && A !== B) return { ok: true, kind: 'alt', ask: A, ask2: B };
    if (WORD2KEY[alt[2]] && WORD2KEY[alt[4]] && WORD2KEY[alt[2]] !== WORD2KEY[alt[4]])
      return bad('Is it ' + np(WORD2KEY[alt[2]]) + ' or ' + np(WORD2KEY[alt[4]]) + '?');
    return bad();
  }
  const q = collect(s, / is it (a|an) ([a-z]+)(?= )/g);
  if (has(s, 'what is it') && !q.length) return { ok: true, kind: 'what' };
  if (q.length === 1 && q[0].charAt(0) !== '?') return { ok: true, kind: q[0] === X ? 'yes' : 'no', ask: q[0] };
  // parola conosciuta ma articolo sbagliato («Is it an chair?»): si corregge quella domanda
  const m = / is it (?:a|an) ([a-z]+)(?= )/.exec(s);
  if (m && WORD2KEY[m[1]]) return bad('Is it ' + np(WORD2KEY[m[1]]) + '?');
  return bad();
};
answerAsk = function (X, r) {
  if (r.kind === 'what') return 'It\'s ' + np(X) + '.';
  if (r.kind === 'yes') return 'Yes, it is ' + np(X) + '.';
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? 'It\'s ' + np(X) + '.' : 'It isn\'t ' + np(r.ask) + ' or ' + np(r.ask2) + '. It\'s ' + np(X) + '.';
  return 'No, it isn\'t ' + np(r.ask) + '. It\'s ' + np(X) + '.';
};

// Frasi dell'insegnante. q = «Is this…?» nelle lezioni che lo insegnano; dq = «This is a book.»
Object.assign(S, {
  present: (X, dq) => { const p = (dq ? 'This is ' : 'It\'s ') + np(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes:     (X, q) => ({ type: 'yes', show: X, questo: !!q, prompt: 'Is ' + enIt(q) + ' ' + np(X) + '?', model: 'Yes, it is ' + np(X) + '.' }),
  neg:  (X, Y, q) => ({ type: 'neg', show: X, ask: Y, questo: !!q, prompt: 'Is ' + enIt(q) + ' ' + np(Y) + '?', model: 'No, it isn\'t ' + np(Y) + '.' }),
  alt:  (X, Y, q) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', show: X, options: o, questo: !!q, prompt: altPrompt(o[0], o[1], q), model: 'It\'s ' + np(X) + '.' };
  },
  key:     (X) => ({ type: 'key', show: X, prompt: Q, model: 'It\'s ' + np(X) + '.' }),
  reveal:  (X) => ({ type: 'reveal', show: X, prompt: Q + ' It\'s ' + np(X) + '.', model: '' }),
  askQ:    (X) => ({ type: 'echo', check: 'question', show: X, prompt: Q, model: Q })
});

/* ---------- Confronto sul SUONO (accento italiano) ----------
   Il microfono scrive quello che sente: «dis is a book», «it is a booka», «'appy»…
   Si confrontano le frasi semplificate (th→t/d, niente «h», vocali lunghe = corte,
   vocale finale dopo consonante tolta) con tutte le frasi possibili del passo, giuste e sbagliate.
   Vince la più vicina; se è giusta e abbastanza vicina, va bene.
   Quanto basta dipende dall'insegnante: Max quasi perfetto, Tom molto meno. */
const EN_TOL = { max: 0.88, emma: 0.8, kate: 0.72, tom: 0.64 };
function enTol() {
  const t = (typeof L !== 'undefined' && L && L.teacher) ? L.teacher.key : null;
  return EN_TOL[t] || 0.72;
}
function enSound(text) {
  let s = norm(text);
  s = s.replace(/th/g, 'd').replace(/ h/g, ' ').replace(/ee|ea|ie/g, 'i').replace(/oo/g, 'u')
       .replace(/([bcdfgklmnprstvz])[aeiou](?= )/g, '$1').replace(/ck/g, 'k').replace(/ph/g, 'f');
  return s.replace(/\s/g, '').split('');
}
function enSim(a, b) {
  if (!a.length || !b.length) return 0;
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length);
}
function enCandidates(step) {
  const all = Object.keys(ITEMS), X = step.show, out = [];
  const add = (t, ok, full) => out.push({ snd: enSound(t), ok: ok, full: !!full });
  const pres = (k) => 'it is ' + np(k);
  const badArt = (k) => 'it is ' + (ITEMS[k].art === 'a' ? 'an ' : 'a ') + ITEMS[k].word;   // «an chair»
  const notIt = (k) => 'it is not ' + np(k);
  if (step.type === 'echo' && step.check === 'question') { add('what is it', true); all.forEach(k => add(pres(k), false)); return out; }
  if (step.type === 'echo') { all.forEach(k => { add(pres(k), k === X); add(badArt(k), false); add(notIt(k), false); }); return out; }
  if (step.type === 'yes') {
    all.forEach(k => { add('yes ' + pres(k), k === X); add('yes ' + badArt(k), false); add('no ' + notIt(k), false); add(pres(k), false); });
    return out;
  }
  if (step.type === 'neg') {
    all.forEach(k => { add('no ' + notIt(k), k === step.ask); add('yes ' + pres(k), false); add(pres(k), false); });
    if (!step.fresh) all.forEach(k => { if (k !== step.ask) add('no ' + notIt(step.ask) + ' ' + pres(k), k === X, true); });
    return out;
  }
  all.forEach(k => { add(pres(k), k === X); add(badArt(k), false); });
  return out;
}
function enBySound(step, text) {
  const heard = enSound(text);
  if (!heard.length) return null;
  let best = null, bestWrong = 0;
  enCandidates(step).forEach(c => {
    const s = enSim(heard, c.snd);
    if (c.ok) { if (!best || s > best.s) best = { s: s, full: c.full }; }
    else bestWrong = Math.max(bestWrong, s);
  });
  if (!best || best.s < enTol() || best.s <= bestWrong) return null;
  return { ok: true, full: best.full || step.type !== 'neg', bySound: true };
}
evaluate = function (step, text) {
  const r = enEvaluateExact(step, text);
  if (r.ok) return r;
  return enBySound(step, text) || r;
};
