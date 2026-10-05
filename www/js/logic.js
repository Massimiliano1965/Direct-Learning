'use strict';
/* =====================================================================
   LOGICA PURA: valutazione delle risposte, sequenza, punteggio, date.
   Nessun accesso allo schermo: testabile da Node (tests/run.js).
   ===================================================================== */

function isButton(w) { return !!(ITEMS[w] && ITEMS[w].button); }
// "a book", "an umbrella" — i pulsanti invece: "the talk button"
function art(w) { return isButton(w) ? 'the ' + w + ' button' : (/^[aeiou]/.test(w) ? 'an ' : 'a ') + w; }
// "the book", "the talk button" (per "Touch …")
function the(w) { return 'the ' + w + (isButton(w) ? ' button' : ''); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// Normalizza quello che ha capito il microfono: minuscole, senza punteggiatura,
// contrazioni sciolte (it's → it is, isn't → is not), alias → parola giusta.
function norm(text) {
  let s = ' ' + String(text || '').toLowerCase().replace(/[’`´]/g, "'") + ' ';
  s = s.replace(/\bisn't\b/g, 'is not')
       .replace(/\bit's\b/g, 'it is')
       .replace(/\bthat's\b/g, 'that is')
       .replace(/\bwhat's\b/g, 'what is');
  s = s.replace(/[^a-z\s]/g, ' ');
  s = ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
  s = s.replace(/ its(?= )/g, ' it is')
       .replace(/ isnt(?= )/g, ' is not')
       .replace(/ thats(?= )/g, ' that is')
       .replace(/ it s(?= )/g, ' it is');
  Object.keys(ITEMS).forEach(w => {
    ITEMS[w].alias.forEach(a => {
      s = s.replace(new RegExp(' ' + a + '(?= )', 'g'), ' ' + w);
    });
  });
  return s;
}

function has(s, phrase) { return s.indexOf(' ' + phrase + ' ') !== -1; }

// Oggetti "affermati" nella frase: "it is a book", "this is a pen", "that is an ...",
// e per i pulsanti "it is the talk button". L'articolo deve essere quello giusto:
// "it is the book" o "it is a talk" non valgono.
function claims(s) {
  const re = / (?:it|this|that) is (?:(?:a|an) ([a-z]+)|the ([a-z]+) button)(?= )/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[1] && !isButton(m[1])) out.push(m[1]);
    else if (m[2] && isButton(m[2])) out.push(m[2]);
  }
  return out;
}

// Valuta una risposta. ok = accettata. full = risposta completa (es. con la correzione).
function evaluate(step, text) {
  const s = norm(text);
  const c = claims(s);
  const X = step.show;
  const yes = has(s, 'yes');
  const no = has(s, 'no');
  const not = has(s, 'not');
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'present':
      return { ok: c.indexOf(X) !== -1 && onlyX && !not, full: true };
    case 'yes':
      return {
        ok: yes && !no && !not && onlyX && (has(s, 'it is') || has(s, 'this is') || has(s, 'that is')),
        full: c.indexOf(X) !== -1
      };
    case 'neg':
      return {
        ok: no && not && !yes && onlyX && has(s, 'is not'),
        full: c.indexOf(X) !== -1
      };
    case 'alt':
    case 'key':
      return { ok: c.indexOf(X) !== -1 && onlyX && !not, full: true };
  }
  return { ok: false, full: false };
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

// Sequenza della lezione:
// presentazione → (domanda-risposta ×2, negativa ×2, alternativa, domanda chiave) × giri → tocca
function buildSteps(items, withPresentation) {
  const st = [];
  const n = items.length;
  if (withPresentation) {
    items.forEach(x => st.push({
      type: 'present', show: x,
      prompt: 'This is ' + art(x) + '.',
      model: 'This is ' + art(x) + '.'
    }));
  }
  for (let r = 0; r < n; r++) {
    const A = items[r], B = items[(r + 1) % n], C = items[(r + 2) % n];
    st.push({ type: 'yes', show: A, prompt: 'Is this ' + art(A) + '?', model: "Yes, it's " + art(A) + '.' });
    st.push({ type: 'yes', show: B, prompt: 'Is this ' + art(B) + '?', model: "Yes, it's " + art(B) + '.' });
    st.push({ type: 'neg', show: A, ask: B, prompt: 'Is this ' + art(B) + '?', model: "No, it isn't. It's " + art(A) + '.' });
    st.push({ type: 'neg', show: B, ask: C, prompt: 'Is this ' + art(C) + '?', model: "No, it isn't. It's " + art(B) + '.' });
    const opts = (r % 2 === 0) ? [B, C] : [C, B];
    st.push({ type: 'alt', show: B, options: opts, prompt: 'Is this ' + art(opts[0]) + ' or ' + art(opts[1]) + '?', model: "It's " + art(B) + '.' });
    st.push({ type: 'key', show: C, prompt: 'What is this?', model: "It's " + art(C) + '.' });
  }
  shuffle(items).forEach(x => st.push({
    type: 'touch', show: x,
    prompt: 'Touch ' + the(x) + '.',
    model: 'This is ' + the(x) + '.'
  }));
  return st;
}

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
// prima dell'inizio, si resta al giorno 1 (prima l'indice usciva negativo).
function trialFor(start, today) {
  if (!start) return { day: 0, today: TRIAL_ROTATION[0] };
  const day = Math.max(1, dayDiff(start, today) + 1);
  return { day: day, today: day <= 6 ? TRIAL_ROTATION[(day - 1) % TRIAL_ROTATION.length] : null };
}

/* ---------- Lingua dei pulsanti ----------
   0 = italiano, 1 = inglese con la parola italiana piccola sotto, 2 = solo inglese.
   Si parte dal giorno in cui l'allievo ha finito la lezione dei pulsanti. */
function uiLevel(learnedDay, today) {
  if (!learnedDay) return 0;
  const d = dayDiff(learnedDay, today);
  if (d < UI_SWITCH_DAYS) return 0;
  if (d < UI_SWITCH_DAYS + UI_HINT_DAYS) return 1;
  return 2;
}
