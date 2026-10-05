'use strict';
// Test della logica pura: node tests/run.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course.js', 'data.js', 'logic.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate');
const evaluateAll = run('evaluateAll');
const buildSteps = run('buildSteps');
const answerSteps = run('answerSteps');
const LESSONS = run('LESSONS');
const ITEMS = run('ITEMS');
const TEACHERS = run('TEACHERS');
const trialFor = run('trialFor');
const FIG = run('FIG');
const uiLevel = run('uiLevel');

let fails = 0, count = 0;
function check(name, cond) {
  count++;
  if (!cond) { fails++; console.log('FALLITO: ' + name); }
}

// 1. Frasi di prova (risposte come le scrive il microfono, con o senza accenti)
const echo = (show) => ({ type: 'echo', check: 'claim', show });
const askQ = { type: 'echo', check: 'question', show: 'pen' };
const cases = [
  [echo('book'), 'È un libro.', true],
  [echo('book'), 'e un libro', true],
  [echo('book'), 'Questo è un libro', true],
  [echo('book'), 'un libro', false],
  [echo('book'), 'libro', false],
  [echo('book'), 'È una libro', false],
  [echo('chair'), 'È una sedia', true],
  [echo('chair'), 'È un sedia', false],
  [echo('chair'), 'È una sedie', true],
  [askQ, "Che cos'è?", true],
  [askQ, 'che cosa è', true],
  [askQ, 'che cose', true],
  [askQ, "che cos'è un libro", false],
  [askQ, 'cosa', false],
  [{ type: 'yes', show: 'book' }, 'Sì, è un libro.', true],
  [{ type: 'yes', show: 'book' }, 'si e un libro', true],
  [{ type: 'yes', show: 'book' }, 'Sì.', false],
  [{ type: 'yes', show: 'book' }, 'Sì, è un tavolo.', false],
  [{ type: 'yes', show: 'book' }, 'No, non è un libro.', false],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'No, non è un libro.', true],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'No, non è un libro. È un tavolo.', true],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'No, non è un libro, è una sedia.', false],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'No, non è una libro.', false],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'No.', false],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'Sì, è un libro.', false],
  [{ type: 'neg', show: 'pen', ask: 'chair', fresh: true }, 'No, non è una sedia.', true],
  [{ type: 'alt', show: 'pen' }, 'È una penna.', true],
  [{ type: 'alt', show: 'pen' }, 'È una pena', true],
  [{ type: 'alt', show: 'pen' }, 'È un libro.', false],
  [{ type: 'key', show: 'chair' }, 'È una sedia.', true],
  [{ type: 'key', show: 'chair' }, 'sedia', false],
  [{ type: 'key', show: 'chair' }, 'È un ombrello', false],
  [{ type: 'key', show: 'chair' }, 'Non è una sedia', false]
];
cases.forEach(([step, text, want]) => check(step.type + ' «' + text + '» → ' + want, evaluate(step, text).ok === want));
check('no senza correzione: full=false', evaluate({ type: 'neg', show: 'table', ask: 'book' }, 'No, non è un libro.').full === false);
check('no con correzione: full=true', evaluate({ type: 'neg', show: 'table', ask: 'book' }, 'No, non è un libro, è un tavolo.').full === true);

// 2. Più interpretazioni: basta che una sia giusta, al massimo 5
const st = { type: 'key', show: 'pen' };
check('alternative: la seconda giusta', evaluateAll(st, ['è una pena di', 'è una penna']).ok);
check('alternative: oltre la quinta ignorata', !evaluateAll(st, ['a', 'b', 'c', 'd', 'e', 'è una penna']).ok);
check('alternative: lista vuota', !evaluateAll(st, []).ok);

// 3. Sequenza della lezione (più volte, perché è in parte casuale)
const l1 = LESSONS[0];
for (let rep = 0; rep < 30; rep++) {
  const steps = buildSteps(l1);
  const phases = steps.map(s => s.phase);
  const firstIdx = (p) => phases.indexOf(p);
  check('ordine delle fasi', firstIdx('present') === 0 && firstIdx('present') < firstIdx('yes') && firstIdx('yes') < firstIdx('neg') &&
    firstIdx('neg') < firstIdx('fresh') && firstIdx('fresh') < firstIdx('reveal') && firstIdx('reveal') < firstIdx('askq') &&
    firstIdx('askq') < firstIdx('key') && firstIdx('key') < firstIdx('mix'));
  // la parola nuova non si sente né si legge prima della rivelazione
  const reveal = firstIdx('reveal');
  const freshWord = ITEMS[l1.fresh].word;
  check('«penna» nascosta fino a «Che cos\'è?»', steps.slice(0, reveal).every(s => s.prompt.indexOf(freshWord) === -1 && s.model.indexOf(freshWord) === -1));
  check('domande sull\'oggetto nuovo solo con il no', steps.filter(s => s.phase === 'fresh').every(s => s.type === 'neg' && s.show === l1.fresh && s.fresh));
  check('prima rivelazione con pausa', steps[reveal].pause > 0 && steps[reveal].show === l1.fresh);
  check('«Che cos\'è?» ripetuto 4 volte', steps.filter(s => s.phase === 'askq').length === 4);
  check('il ritmo cresce', steps.filter(s => s.phase === 'mix').every((s, i, a) => !i || s.speed >= a[i - 1].speed));
  check('niente stesso oggetto due volte di fila nel mix', steps.filter(s => s.phase === 'mix').every((s, i, a) => !i || s.show !== a[i - 1].show));
  steps.forEach((s, i) => {
    if (s.type === 'reveal') return;
    if (!evaluate(s, s.model).ok) check('passo ' + (i + 1) + ' modello «' + s.model + '» (' + s.type + ')', false);
    if (s.type === 'neg' && s.show === s.ask) check('no: oggetto chiesto diverso da quello indicato', false);
  });
  check('risposte = passi meno rivelazioni', answerSteps(steps) === steps.length - 2);
}
count++;

// 4. Prova di 7 giorni
check('prova non iniziata', trialFor(null, '2026-10-05').day === 0);
check('giorno 1', trialFor('2026-10-05', '2026-10-05').day === 1 && trialFor('2026-10-05', '2026-10-05').today === 'marco');
check('giorno 2', trialFor('2026-10-05', '2026-10-06').today === 'giulia');
check('giorno 3', trialFor('2026-10-05', '2026-10-07').today === 'luca');
check('giorno 4', trialFor('2026-10-05', '2026-10-08').today === 'marco');
check('giorno 7: nessuna rotazione', trialFor('2026-10-05', '2026-10-11').today === null);
check('a cavallo di mese', trialFor('2026-10-31', '2026-11-01').day === 2);
check('ora legale (25 ottobre)', trialFor('2026-10-24', '2026-10-26').day === 3);
check('orologio indietro: resta giorno 1', trialFor('2026-10-05', '2026-10-01').today === 'marco');

// 5. Lingua dei pulsanti
check('pulsanti: lezione non fatta → lingua dell\'allievo', uiLevel(null, '2026-10-05') === 0);
check('pulsanti: giorno 0-2', uiLevel('2026-10-05', '2026-10-07') === 0);
check('pulsanti: giorno 3 → con aiuto', uiLevel('2026-10-05', '2026-10-08') === 1);
check('pulsanti: giorno 7 → solo lingua del corso', uiLevel('2026-10-05', '2026-10-12') === 2);

// 6. Dati coerenti
Object.keys(ITEMS).forEach(k => {
  check('figura per ' + k, typeof FIG[k] === 'string' && FIG[k].indexOf('<svg') === 0);
  check('articolo per ' + k, ['un', 'una', 'uno', "un'"].indexOf(ITEMS[k].art) !== -1);
});
Object.keys(TEACHERS).forEach(k => check('insegnante ' + k, TEACHERS[k].key === k && TEACHERS[k].praise.length > 0));

console.log(count - fails + ' / ' + count + ' test passati');
process.exit(fails ? 1 : 0);
