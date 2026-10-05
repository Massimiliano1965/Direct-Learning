'use strict';
// Test della logica pura: node tests/run.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['data.js', 'logic.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate');
const evaluateAll = run('evaluateAll');
const buildSteps = run('buildSteps');
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

// 1. Frasi di prova
const cases = [
  [{ type: 'present', show: 'book' }, 'This is a book.', true],
  [{ type: 'present', show: 'book' }, 'this is book', false],
  [{ type: 'present', show: 'book' }, 'book', false],
  [{ type: 'yes', show: 'book' }, 'Yes, it is.', true],
  [{ type: 'yes', show: 'book' }, "Yes, it's a book.", true],
  [{ type: 'yes', show: 'book' }, 'yes', false],
  [{ type: 'yes', show: 'book' }, "Yes, it's a pen.", false],
  [{ type: 'neg', show: 'book' }, "No, it isn't.", true],
  [{ type: 'neg', show: 'book' }, "No, it isn't. It's a book.", true],
  [{ type: 'neg', show: 'book' }, 'No it is not its a book', true],
  [{ type: 'neg', show: 'book' }, "No, it isn't. It's a pen.", false],
  [{ type: 'neg', show: 'book' }, 'no', false],
  [{ type: 'alt', show: 'pen' }, "It's a pin.", true],
  [{ type: 'key', show: 'chair' }, "It's a share", true],
  [{ type: 'key', show: 'pencil' }, 'pencil', false],
  [{ type: 'key', show: 'umbrella' }, "It's an umbrella", true],
  [{ type: 'key', show: 'key' }, 'It is a keys', true],
  [{ type: 'touch', show: 'key' }, 'It is a key', false],
  // Pulsanti (Lezione 3)
  [{ type: 'present', show: 'talk' }, 'This is the Talk button.', true],
  [{ type: 'present', show: 'talk' }, 'This is a talk.', false],
  [{ type: 'present', show: 'talk' }, 'talk button', false],
  [{ type: 'yes', show: 'exit' }, 'Yes, it is.', true],
  [{ type: 'neg', show: 'exit' }, "No, it isn't. It's the exit button.", true],
  [{ type: 'neg', show: 'exit' }, "No, it isn't. It's the repeat button.", false],
  [{ type: 'key', show: 'repeat' }, "It's the Repeat button.", true],
  [{ type: 'key', show: 'repeat' }, "It's the repeat.", false],
  [{ type: 'key', show: 'book' }, "It's the book button.", false],
  [{ type: 'key', show: 'book' }, "It's the book.", false]
];
cases.forEach(([step, text, want]) => check(step.type + ' «' + text + '» → ' + want, evaluate(step, text).ok === want));
check('neg senza correzione: full=false', evaluate({ type: 'neg', show: 'book' }, "No, it isn't.").full === false);
check('neg con correzione: full=true', evaluate({ type: 'neg', show: 'book' }, "No, it isn't. It's a book.").full === true);

// 2. Più interpretazioni: basta che una sia giusta, al massimo 5
const st = { type: 'key', show: 'pen' };
check('alternative: la seconda giusta', evaluateAll(st, ['it is a bin', "it's a pen"]).ok);
check('alternative: oltre la quinta ignorata', !evaluateAll(st, ['a', 'b', 'c', 'd', 'e', "it's a pen"]).ok);
check('alternative: lista vuota', !evaluateAll(st, []).ok);

// 3. Ogni risposta modello dell'insegnante è accettata
LESSONS.forEach(l => {
  const items = l.items || Object.keys(ITEMS).slice(0, 4);
  const steps = buildSteps(items, l.presentation);
  const expected = (l.presentation ? items.length : 0) + items.length * 6 + items.length;
  check(l.id + ': numero di passi ' + expected, steps.length === expected);
  steps.forEach((s, i) => {
    if (s.type === 'touch') return;
    check(l.id + ' passo ' + (i + 1) + ' modello «' + s.model + '»', evaluate(s, s.model).ok);
  });
  const touches = steps.filter(s => s.type === 'touch').map(s => s.show).sort();
  check(l.id + ': tocca ogni oggetto una volta', JSON.stringify(touches) === JSON.stringify(items.slice().sort()));
});
const m1 = buildSteps(['talk', 'repeat', 'exit'], true);
check('lezione pulsanti: presentazione', m1[0].prompt === 'This is the talk button.');
check('lezione pulsanti: tocca', m1[m1.length - 1].prompt.indexOf(' button.') !== -1);
check('lezione 3 = pulsanti', LESSONS[2].items.join() === 'talk,repeat,exit' && LESSONS[2].title === 'Lesson 3');
check('lezione da 3 oggetti = 24 passi', buildSteps(['book', 'pen', 'pencil'], true).length === 24);

// 4. Prova di 7 giorni
check('prova non iniziata', trialFor(null, '2026-10-05').day === 0);
check('giorno 1', trialFor('2026-10-05', '2026-10-05').day === 1 && trialFor('2026-10-05', '2026-10-05').today === 'miller');
check('giorno 2', trialFor('2026-10-05', '2026-10-06').today === 'davis');
check('giorno 3', trialFor('2026-10-05', '2026-10-07').today === 'alex');
check('giorno 4', trialFor('2026-10-05', '2026-10-08').today === 'miller');
check('giorno 7: nessuna rotazione', trialFor('2026-10-05', '2026-10-11').today === null);
check('a cavallo di mese', trialFor('2026-10-31', '2026-11-01').day === 2);
check('ora legale (25 ottobre)', trialFor('2026-10-24', '2026-10-26').day === 3);
check('orologio indietro: resta giorno 1', trialFor('2026-10-05', '2026-10-01').today === 'miller');

// 5. Lingua dei pulsanti
check('pulsanti: lezione non fatta → italiano', uiLevel(null, '2026-10-05') === 0);
check('pulsanti: giorno 0-2 → italiano', uiLevel('2026-10-05', '2026-10-07') === 0);
check('pulsanti: giorno 3 → inglese con aiuto', uiLevel('2026-10-05', '2026-10-08') === 1);
check('pulsanti: giorno 6 → inglese con aiuto', uiLevel('2026-10-05', '2026-10-11') === 1);
check('pulsanti: giorno 7 → solo inglese', uiLevel('2026-10-05', '2026-10-12') === 2);

// 6. Dati coerenti
Object.keys(ITEMS).forEach(k => check('figura per ' + k, typeof FIG[k] === 'string' && FIG[k].indexOf('<svg') === 0));
Object.keys(TEACHERS).forEach(k => check('insegnante ' + k, TEACHERS[k].key === k && TEACHERS[k].praise.length > 0));

console.log(count - fails + ' / ' + count + ' test passati');
process.exit(fails ? 1 : 0);
