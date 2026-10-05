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
const S = {
  present: (X) => ({ type: 'echo', check: 'claim', show: X, prompt: 'È ' + np(X) + '.', model: 'È ' + np(X) + '.' }),
  yes:     (X) => ({ type: 'yes', show: X, prompt: 'È ' + np(X) + '?', model: 'Sì, è ' + np(X) + '.' }),
  neg:  (X, Y) => ({ type: 'neg', show: X, ask: Y, prompt: 'È ' + np(Y) + '?', model: 'No, non è ' + np(Y) + '.' }),
  alt:  (X, Y) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', show: X, options: o, prompt: 'È ' + np(o[0]) + ' o ' + np(o[1]) + '?', model: 'È ' + np(X) + '.' };
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
    const s = kind === 'present' ? S.present(F) : kind === 'yes' ? S.yes(F) : S.neg(pick(others), F);
    if (kind === 'present') s.prompt = s.model;   // l'insegnante la dice, l'allievo la ripete
    s.drill = true;
    s.phase = st.phase;
    out.push(s);
  }
  return out;
}

// Un passo a caso tra sì, no, «o» e domanda chiave, senza ripetere lo stesso oggetto di fila
function mixStep(items, types, prevShow) {
  const pool = items.filter(x => x !== prevShow);
  const X = pick(pool.length ? pool : items);
  const Y = pick(items.filter(x => x !== X));
  const t = pick(types);
  if (t === 'yes') return S.yes(X);
  if (t === 'neg') return S.neg(X, Y);
  if (t === 'alt') return S.alt(X, Y);
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
function buildSteps(lesson) {
  const K = lesson.known.slice();
  const F = lesson.fresh;
  const all = F ? K.concat([F]) : K;
  const st = [];
  const add = (s, phase) => { s.phase = phase; st.push(s); return s; };

  K.forEach(x => add(S.present(x), 'present'));
  shuffle(K).forEach(x => add(S.present(x), 'present'));
  for (let r = 0; r < 2; r++) shuffle(K).forEach(x => add(S.yes(x), 'yes'));
  const pairs = [];
  K.forEach(x => K.forEach(y => { if (x !== y) pairs.push([x, y]); }));
  shuffle(pairs).forEach(p => add(S.neg(p[0], p[1]), 'neg'));
  let prev = null;
  for (let i = 0; i < 6; i++) prev = add(mixStep(K, ['yes', 'neg'], prev), 'yesno').show;

  if (F) {
    for (let r = 0; r < 2; r++) shuffle(K).forEach(y => { add(S.neg(F, y), 'fresh').fresh = true; });
    add(S.reveal(F), 'reveal').pause = 1500;
    add(S.reveal(K[0]), 'reveal');
    for (let i = 0; i < 4; i++) add(S.askQ(F), 'askq');
    for (let i = 0; i < 2; i++) add(S.present(F), 'present');
  }
  for (let r = 0; r < 2; r++) shuffle(all).forEach(x => add(S.key(x), 'key'));

  prev = null;
  for (let b = 0; b < MIX_BLOCKS; b++) {
    for (let i = 0; i < MIX_BLOCK_SIZE; i++) {
      const s = add(mixStep(all, ['yes', 'neg', 'alt', 'key'], prev), 'mix');
      s.speed = 1 + 0.06 * (b + 1);   // il ritmo cresce a ogni blocco
      prev = s.show;
    }
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
