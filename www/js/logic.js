'use strict';
/* =====================================================================
   LOGICA PURA: valutazione delle risposte in italiano, sequenza della
   lezione, punteggio, date. Nessun accesso allo schermo: testabile da Node.
   ===================================================================== */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// "un libro", "una sedia", "un'aula"
function np(k) {
  const it = ITEMS[k];
  return it.art === "un'" ? "un'" + it.word : it.art + ' ' + it.word;
}

const WORD2KEY = {};
Object.keys(ITEMS).forEach(k => { WORD2KEY[ITEMS[k].word] = k; });

// Normalizza quello che ha capito il microfono: minuscole, senza accenti e punteggiatura,
// «cos'è / cosa è / cose» → "cosa e", alias → parola giusta.
function norm(text) {
  let s = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  s = s.replace(/['’`´]/g, ' ').replace(/[^a-z\s]/g, ' ');
  s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
  s = s.replace(/ cos e(?= )/g, ' cosa e').replace(/ cose(?= )/g, ' cosa e');
  Object.keys(ITEMS).forEach(k => {
    ITEMS[k].alias.forEach(a => {
      s = s.replace(new RegExp(' ' + a + '(?= )', 'g'), ' ' + ITEMS[k].word);
    });
  });
  return s;
}

function has(s, phrase) { return s.indexOf(' ' + phrase + ' ') !== -1; }

// Articolo + parola → chiave dell'oggetto. L'articolo deve essere quello giusto:
// "un sedia" non vale. Parole sconosciute contano come oggetto sbagliato.
function nounKey(art, word) {
  const k = WORD2KEY[word];
  if (!k) return '?' + word;
  const want = ITEMS[k].art === "un'" ? 'un' : ITEMS[k].art;
  return art === want ? k : null;
}
function collect(s, re) {
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    const k = nounKey(m[1], m[2]);
    if (k) out.push(k);
  }
  return out;
}
// Negazioni: "non è un tavolo"
function negations(s) { return collect(s, / non e (un|una|uno) ([a-z]+)(?= )/g); }
// Affermazioni: "è un libro", "questo è un libro" (tolte prima le negazioni)
function claims(s) {
  const t = s.replace(/ non e (?:un|una|uno) [a-z]+(?= )/g, ' # ');
  return collect(t, / e (un|una|uno) ([a-z]+)(?= )/g);
}

// Valuta una risposta. ok = accettata. full = l'allievo ha detto anche cos'è davvero.
function evaluate(step, text) {
  const s = norm(text);
  const c = claims(s);
  const n = negations(s);
  const X = step.show;
  const yes = has(s, 'si');
  const no = has(s, 'no');
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: has(s, 'che cosa e') && !c.length, full: true };
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length, full: true };
    case 'yes':
      return { ok: yes && !no && !n.length && c.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg':
      return {
        // «No, non è un libro.» oppure solo «Non è un libro.»
        ok: !yes && n.indexOf(step.ask) !== -1 && n.indexOf(X) === -1 && onlyX,
        full: c.indexOf(X) !== -1
      };
    case 'alt':
    case 'key':
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length, full: true };
  }
  return { ok: false, full: false };
}

// Il microfono ha sentito la voce dell'insegnante invece dell'allievo? (tutta la domanda,
// o la sua coda: «… o un libro»). Vale solo per le domande, non per le frasi da ripetere.
function isEcho(step, text) {
  if (!step || step.prompt === step.model) return false;
  const t = norm(text).trim(), p = norm(step.prompt).trim();
  if (!t) return false;
  return t === p || (t.split(' ').length >= 2 && p.endsWith(' ' + t));
}

// Domanda fatta dall'allievo sull'oggetto X che ha toccato.
// «Che cos'è?» → kind 'what'; «È un tavolo?» / «È questo un tavolo?» → 'yes' se è il tavolo,
// altrimenti 'no' (ask = la parola chiesta). Se non va bene, model = la domanda giusta da ripetere.
function evalAsk(X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || Q });
  if (has(s, 'si') || has(s, 'no') || negations(s).length) return bad();   // ha risposto, non chiesto
  // domanda alternativa: «È un tavolo o una sedia?» (anche «oppure», anche «È questo un…»)
  const alt = / e (?:quest[oa] )?(un|una|uno) ([a-z]+) (?:o|oppure) (un|una|uno) ([a-z]+)(?= )/.exec(s);
  if (alt) {
    const A = nounKey(alt[1], alt[2]), B = nounKey(alt[3], alt[4]);
    if (A && B && A.charAt(0) !== '?' && B.charAt(0) !== '?' && A !== B) return { ok: true, kind: 'alt', ask: A, ask2: B };
    // articolo sbagliato su parole conosciute: si corregge la domanda
    if (WORD2KEY[alt[2]] && WORD2KEY[alt[4]] && WORD2KEY[alt[2]] !== WORD2KEY[alt[4]])
      return bad('È ' + np(WORD2KEY[alt[2]]) + ' o ' + np(WORD2KEY[alt[4]]) + '?');
    return bad();
  }
  const c = claims(s.replace(/ e quest[oa] (un|una|uno) /g, ' e $1 '));
  if (has(s, 'che cosa e') && !c.length) return { ok: true, kind: 'what' };
  if (c.length === 1 && c[0].charAt(0) !== '?') return { ok: true, kind: c[0] === X ? 'yes' : 'no', ask: c[0] };
  // parola conosciuta ma articolo sbagliato («È un sedia?»): si corregge quella domanda
  const m = / e (?:quest[oa] )?(?:un|una|uno) ([a-z]+)(?= )/.exec(s);
  if (m && WORD2KEY[m[1]]) return bad('È ' + np(WORD2KEY[m[1]]) + '?');
  return bad();
}
// Risposta corretta dell'insegnante alla domanda dell'allievo
function answerAsk(X, r) {
  if (r.kind === 'what') return 'È ' + np(X) + '.';
  if (r.kind === 'yes') return 'Sì, è ' + np(X) + '.';
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? 'È ' + np(X) + '.' : 'Non è né ' + np(r.ask) + ' né ' + np(r.ask2) + '. È ' + np(X) + '.';
  return 'No, non è ' + np(r.ask) + '. È ' + np(X) + '.';
}

// La migliore tra le interpretazioni del microfono (al massimo 5)
function evaluateAll(step, alts) {
  const list = (alts || []).slice(0, 5);
  for (let i = 0; i < list.length; i++) {
    const r = evaluate(step, list[i]);
    if (r.ok) return r;
  }
  return { ok: false, full: false };
}

/* ---------- Passi ---------- */

const Q = "Che cos'è?";
// Domanda con «questo»: «È questo un libro?» «È questa una sedia?» (accordo con la parola chiesta).
// q = true solo nelle lezioni che la insegnano; le risposte restano «Sì, è un libro.»
function dem(k) { return ITEMS[k].art === 'un' || ITEMS[k].art === 'uno' ? 'questo' : 'questa'; }
function qnp(k, q) { return q ? dem(k) + ' ' + np(k) : np(k); }
const S = {
  // dq = «Questo è un libro.» / «Questa è una sedia.» (prepara questo/questa/questi/queste)
  present: (X, dq) => {
    const p = dq ? dem(X).charAt(0).toUpperCase() + dem(X).slice(1) + ' è ' + np(X) + '.' : 'È ' + np(X) + '.';
    return { type: 'echo', check: 'claim', show: X, prompt: p, model: p };
  },
  yes:     (X, q) => ({ type: 'yes', show: X, questo: !!q, prompt: 'È ' + qnp(X, q) + '?', model: 'Sì, è ' + np(X) + '.' }),
  neg:  (X, Y, q) => ({ type: 'neg', show: X, ask: Y, questo: !!q, prompt: 'È ' + qnp(Y, q) + '?', model: 'No, non è ' + np(Y) + '.' }),
  alt:  (X, Y, q) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', show: X, options: o, questo: !!q, prompt: 'È ' + qnp(o[0], q) + ' o ' + np(o[1]) + '?', model: 'È ' + np(X) + '.' };
  },
  key:     (X) => ({ type: 'key', show: X, prompt: Q, model: 'È ' + np(X) + '.' }),
  // L'insegnante si risponde da solo: nessuna risposta attesa
  reveal:  (X) => ({ type: 'reveal', show: X, prompt: Q + ' È ' + np(X) + '.', model: '' }),
  askQ:    (X) => ({ type: 'echo', check: 'question', show: X, prompt: Q, model: Q })
};

// Ripetizioni dopo un errore: quante, secondo l'insegnante e il numero dell'errore
function repeatsFor(t, nErr) { return t.repeats[nErr % t.repeats.length]; }

// Le ripetizioni girano intorno alla parola sbagliata, variando la frase:
//   «È una sedia.» → «È una sedia? Sì, è una sedia.» → (indica un altro oggetto)
//   «È una sedia? No, non è una sedia.» → …
// La prima è sempre la risposta giusta che l'insegnante ha appena detto.
function buildDrill(st, n, items) {
  const first = Object.assign({}, st, { prompt: st.model, drill: true });
  const out = [first];
  if (st.type === 'echo' && st.check === 'question') {
    while (out.length < n) out.push(Object.assign({}, first));
    return out;
  }
  const F = st.type === 'neg' ? st.ask : st.show;   // la parola su cui si è sbagliato
  const others = items.filter(x => x !== F);
  const kinds = ['present', 'yes', 'neg'];
  // dopo una frase da ripetere si passa subito a una domanda, per non dire due volte la stessa cosa
  const k0 = st.model === 'È ' + np(F) + '.' ? 1 : 0;
  for (let k = k0; out.length < n; k++) {
    const kind = others.length ? kinds[k % 3] : kinds[k % 2];
    const s = kind === 'present' ? S.present(F) : kind === 'yes' ? S.yes(F, st.questo) : S.neg(pick(others), F, st.questo);
    if (kind === 'present') s.prompt = s.model;   // l'insegnante la dice, l'allievo la ripete
    s.drill = true;
    s.phase = st.phase;
    out.push(s);
  }
  return out;
}

// Un passo a caso tra sì, no, «o» e domanda chiave, senza ripetere lo stesso oggetto di fila
function mixStep(items, types, prevShow, q) {
  const pool = items.filter(x => x !== prevShow);
  const X = pick(pool.length ? pool : items);
  const Y = pick(items.filter(x => x !== X));
  const t = pick(types);
  if (t === 'yes') return S.yes(X, q);
  if (t === 'neg') return S.neg(X, Y, q);
  if (t === 'alt') return S.alt(X, Y, q);
  return S.key(X);
}

// Sequenza della lezione (come in classe):
// 1. presentazione delle parole note        «È un libro.» → ripete
// 2. domande con il sì                       «È un libro?» → «Sì, è un libro.»
// 3. domande con il no                       «È un tavolo?» → «No, non è un tavolo.»
// 4. sì e no mescolati
// 5. oggetto nuovo: solo no, due giri, senza mai nominarlo
// 6. pausa e sfogo: «Che cos'è? È una penna.» «Che cos'è? È un libro.»
// 7. l'allievo ripete «Che cos'è?», poi «È una penna.»
// 8. domanda chiave su tutto
// 9. si ricomincia: tutto mescolato, sempre più veloce
const MIX_BLOCKS = 3;
const MIX_BLOCK_SIZE = 8;
const ASK_EARLY = 3;   // domande dell'allievo subito dopo la key question
const ASK_TURNS = 4;   // e in fondo, come verifica
// Parole della lezione: known = presentate ora; review = già imparate, usate nelle domande
// per introdurre le nuove; fresh = oggetto da scoprire con «Che cos'è?».
function lessonWords(l) { return l.known.concat(l.review || []).concat(l.fresh ? [l.fresh] : []); }
function buildSteps(lesson) {
  const K = lesson.known.slice();
  const R = (lesson.review || []).slice();
  const KQ = K.concat(R);                  // tutte le parole che l'allievo conosce
  const F = lesson.fresh;
  const all = F ? KQ.concat([F]) : KQ;
  // domande con «questo»: solo nelle lezioni che lo insegnano, mescolate con la forma più naturale
  const q = () => !!lesson.questo && Math.random() < 0.5;
  const st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };

  K.forEach(x => add(S.present(x, true), 'present'));      // «Questo è un libro.»
  shuffle(K).forEach(x => add(S.present(x), 'present'));     // «È un libro.»
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(S.yes(x, q()), 'yes'));
  if (!R.length) {
    const pairs = [];
    K.forEach(x => K.forEach(y => { if (x !== y) pairs.push([x, y]); }));
    shuffle(pairs).forEach(p => add(S.neg(p[0], p[1], q()), 'neg'));
  } else {
    // parola nuova indicata, domanda con le parole vecchie (e viceversa)
    K.forEach(x => shuffle(KQ.filter(y => y !== x)).slice(0, 3).forEach(y => add(S.neg(x, y, q()), 'neg')));
  }
  let prev = null;
  for (let i = 0; i < 6; i++) prev = add(mixStep(KQ, ['yes', 'neg'], prev, q()), 'yesno').show;

  if (F) {
    // l'oggetto nuovo: no a TUTTE le parole conosciute (due giri se sono poche)
    const rounds = KQ.length > 3 ? 1 : 2;
    for (let r = 0; r < rounds; r++) shuffle(KQ).forEach(y => { add(S.neg(F, y, q()), 'fresh').fresh = true; });
    add(S.reveal(F), 'reveal').pause = 1500;
    add(S.reveal(K[0]), 'reveal');
    for (let i = 0; i < (R.length ? 2 : 4); i++) add(S.askQ(F), 'askq');
    add(S.present(F, true), 'present');
    add(S.present(F), 'present');
  }
  const keyItems = F ? K.concat([F]) : K;
  for (let r = 0; r < 2; r++) shuffle(keyItems).forEach(x => add(S.key(x), 'key'));
  // 9. imparata la key question, l'allievo comincia a fare le domande
  for (let i = 0; i < ASK_EARLY; i++) {
    const s = add({ type: 'ask', prompt: '', model: '' }, 'askfirst');
    if (!i) s.intro = true;
  }

  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) {
    for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
      const s = add(mixStep(all, ['yes', 'neg', 'alt', 'key'], prev, q()), 'mix');
      s.speed = 1 + 0.06 * (b + 1);   // il ritmo cresce a ogni blocco
      prev = s.show;
    }
  }
  // 10. le domande le fa l'allievo: tocca un oggetto e chiede, l'insegnante risponde
  for (let i = 0; i < ASK_TURNS; i++) {
    const s = add({ type: 'ask', prompt: '', model: '' }, 'ask');
    if (!i) s.intro = true;
  }
  return st;
}
// Passi a cui l'allievo risponde (le "rivelazioni" le dice solo l'insegnante)
function answerSteps(steps) { return steps.filter(s => s.type !== 'reveal').length; }

// Punteggio insegnante: risposte giuste al primo colpo, meno penalità per lentezza.
function teacherScore(t) {
  if (!t.items) return 0;
  const firstRate = t.first / t.items;
  const avgLat = t.latN ? t.lat / t.latN : 10;
  return firstRate * 100 - Math.min(avgLat, 10) * 3;
}

/* ---------- Date della prova di 7 giorni ---------- */

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function dayKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function dayDiff(a, b) {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
}
// Giorno della prova e insegnante di turno. Se l'orologio del telefono torna indietro
// prima dell'inizio, si resta al giorno 1.
function trialFor(start, today) {
  if (!start) return { day: 0, today: TRIAL_ROTATION[0] };
  const day = Math.max(1, dayDiff(start, today) + 1);
  return { day: day, today: day <= TRIAL_DAYS ? TRIAL_ROTATION[(day - 1) % TRIAL_ROTATION.length] : null };
}

/* ---------- Lingua dei pulsanti ----------
   0 = lingua dell'allievo, 1 = lingua del corso con quella dell'allievo piccola sotto,
   2 = solo lingua del corso. Si parte dal giorno in cui è finita la lezione dei pulsanti. */
function uiLevel(learnedDay, today) {
  if (!learnedDay) return 0;
  const d = dayDiff(learnedDay, today);
  if (d < UI_SWITCH_DAYS) return 0;
  if (d < UI_SWITCH_DAYS + UI_HINT_DAYS) return 1;
  return 2;
}
