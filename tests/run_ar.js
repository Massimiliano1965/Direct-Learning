'use strict';
// Test del pacchetto arabo: node tests/run_ar.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course_ar.js', 'data.js', 'logic.js', 'grammar_ar.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), isEcho = run('isEcho');
const buildSteps = run('buildSteps'), buildDrill = run('buildDrill'), S = run('S'), LESSONS = run('LESSONS');
const COURSE = run('COURSE'), FIG = run('FIG'), ITEMS = run('ITEMS');
run('var L;');
const withTeacher = (k, f) => { run('L = { teacher: { key: "' + k + '" } }'); try { return f(); } finally { run('L = undefined'); } };

let fails = 0, count = 0;
function check(name, cond) {
  count++;
  if (!cond) { fails++; console.log('FALLITO: ' + name); }
}

// 1. Frasi dell'insegnante
check('presentazione maschile', S.present('book').model === 'هذا كتاب.');
check('presentazione femminile', S.present('table').model === 'هذه طاولة.');
check('domanda sì', S.yes('book').prompt === 'هل هذا كتاب؟' && S.yes('book').model === 'نعم، هذا كتاب.');
check('domanda no', S.neg('table', 'book').prompt === 'هل هذا كتاب؟' && S.neg('table', 'book').model === 'لا، هذا ليس كتابًا.');
check('domanda no femminile', S.neg('book', 'table').model === 'لا، هذه ليست طاولةً.');
check('domanda chiave', S.key('pen').prompt === 'ما هذا؟' && S.key('pen').model === 'هذا قلم.');
check('rivelazione', S.reveal('pen').prompt === 'ما هذا؟ هذا قلم.');
check('domanda «o»', /^هل (هذا|هذه) (كتاب|قلم) أم (كتاب|قلم)؟$/.test(S.alt('pen', 'book').prompt));

// 2. Risposte (come le scrive il microfono: senza segni vocalici, con o senza punteggiatura)
const echoBook = { type: 'echo', check: 'claim', show: 'book' }, echoTable = { type: 'echo', check: 'claim', show: 'table' };
const yesBook = { type: 'yes', show: 'book' }, negTable = { type: 'neg', show: 'table', ask: 'book' };
const keyPen = { type: 'key', show: 'pen' }, altPen = { type: 'alt', show: 'pen' };
const askQ = { type: 'echo', check: 'question', show: 'pen' };
[
  [echoBook, 'هذا كتاب.', true], [echoBook, 'هذا كتاب', true], [echoBook, 'هاذا كتاب', true],
  [echoBook, 'هذه كتاب', false], [echoBook, 'هذا ليس كتاب', false], [echoBook, 'هذا قلم', false],
  [echoTable, 'هذه طاولة', true], [echoTable, 'هذه طاوله', true], [echoTable, 'هذا طاولة', false],
  [yesBook, 'نعم، هذا كتاب.', true], [yesBook, 'نعم هذا كتاب', true], [yesBook, 'هذا كتاب', false], [yesBook, 'نعم', false],
  [yesBook, 'لا هذا ليس كتابا', false], [yesBook, 'نعم هذا قلم', false],
  [negTable, 'لا، هذا ليس كتابًا.', true], [negTable, 'لا هذا ليس كتابا', true], [negTable, 'لا هذا ليس كتاب', true],
  [negTable, 'ليس كتابا', true], [negTable, 'لا هذا ليس كتابا هذه طاولة', true],
  [negTable, 'لا', false], [negTable, 'نعم هذا كتاب', false], [negTable, 'لا هذه ليست طاولة', false],
  [keyPen, 'هذا قلم.', true], [keyPen, 'هذا كتاب', false], [keyPen, 'ما هذا', false],
  [altPen, 'هذا قلم', true], [altPen, 'هل هذا كتاب ام قلم', false], [altPen, 'هذا كتاب', false],
  [askQ, 'ما هذا؟', true], [askQ, 'ما هذا', true], [askQ, 'هذا قلم', false]
].forEach(([st, t, ok]) => check('risposta «' + t + '» a ' + st.type + ' → ' + ok, evaluate(st, t).ok === ok));
check('no completo: full', evaluate(negTable, 'لا هذا ليس كتابا هذه طاولة').full === true);
check('no senza correzione: full=false', evaluate(negTable, 'لا هذا ليس كتابا').full === false);

// 2b. Confronto sul suono
check('suono vicino: «هذا كطاب» va bene', evaluate(echoBook, 'هذا كطاب').ok);
check('suono vicino: «هذه تاولة» va bene', evaluate(echoTable, 'هذه تاولة').ok);
check('suono vicino: «هذا كلم» va bene', evaluate(keyPen, 'هذا كلم').ok);
check('parola sbagliata per suono: «هذا كرسي» no', !withTeacher('sara', () => evaluate(echoBook, 'هذا كرسي').ok));
check('sì e no non si confondono', !withTeacher('sara', () => evaluate(yesBook, 'لا هذا ليس كتابا').ok));
check('Mass più severo di Sara', !withTeacher('mass', () => evaluate(echoBook, 'هدا كتب').ok) && withTeacher('sara', () => evaluate(echoBook, 'هدا كتب').ok));

// 2c. Eco della domanda «o»
const altAr = { type: 'alt', show: 'book', options: ['book', 'pen'], prompt: 'هل هذا كتاب أم قلم؟', model: 'هذا كتاب.' };
check('eco: «…أم قلم» sentito come «هذا قلم»', isEcho(altAr, 'هذا قلم') && isEcho(altAr, 'ام قلم'));
check('eco: la risposta giusta non è eco', !isEcho(altAr, 'هذا كتاب'));
check('eco della domanda intera', isEcho({ prompt: 'هل هذا كتاب؟', model: 'نعم، هذا كتاب.' }, 'هل هذا كتاب'));

// 3. Domande dell'allievo (ha toccato la sedia)
[
  ['ما هذا؟', 'what', 'هذا كرسي.'],
  ['هل هذا كرسي؟', 'yes', 'نعم، هذا كرسي.'],
  ['هل هذا كتاب', 'no', 'لا، هذا ليس كتابًا. هذا كرسي.'],
  ['هل هذا كتاب أم كرسي؟', 'alt', 'هذا كرسي.'],
  ['هل هذا كتاب او قلم', 'alt', 'ليس كتابًا ولا قلمًا. هذا كرسي.']
].forEach(([t, kind, ans]) => {
  const r = evalAsk('chair', t);
  check('domanda «' + t + '» → ' + kind, r.ok && r.kind === kind && answerAsk('chair', r) === ans);
});
check('domanda con هذه sbagliato → si corregge', (r => !r.ok && r.model === 'هل هذا كتاب؟')(evalAsk('chair', 'هل هذه كتاب')));
check('risposta invece di domanda', !evalAsk('chair', 'نعم هذا كرسي').ok && !evalAsk('chair', 'لا هذا ليس كتابا').ok);

// 4. Lezione: stesso flusso dell'italiano
LESSONS.forEach(l => {
  for (let rep = 0; rep < 20; rep++) {
    const steps = buildSteps(l);
    const ph = steps.map(s => s.phase);
    check('ordine delle fasi', ph.indexOf('present') === 0 && ph.indexOf('reveal') < ph.indexOf('key') && ph.indexOf('key') < ph.indexOf('askfirst') && ph.indexOf('askfirst') < ph.indexOf('mix'));
    const reveal = ph.indexOf('reveal');
    check('قلم nascosto fino a «ما هذا؟»', steps.slice(0, reveal).every(s => s.prompt.indexOf('قلم') === -1 && s.model.indexOf('قلم') === -1));
    check('ogni risposta attesa è accettata', steps.every(s => s.type === 'reveal' || s.type === 'ask' || evaluate(s, s.model).ok));
    steps.filter(s => s.type !== 'reveal' && s.type !== 'ask').forEach(s => {
      buildDrill(s, 4, l.known.concat([l.fresh])).forEach(d => {
        if (!evaluate(d, d.model).ok) check('ripetizione accettata: ' + d.model, false);
      });
    });
  }
});

// 5. Dati e pronuncia
Object.keys(ITEMS).forEach(k => check('figura per ' + k, typeof FIG[k] === 'string'));
check('pronuncia', COURSE.show('هل هذا كتاب؟') === 'هل هذا كتاب؟\nHal hādhā kitāb?');
check('pronuncia del no', COURSE.show('لا، هذه ليست طاولةً.') === 'لا، هذه ليست طاولةً.\nLā, hādhihi laysat ṭāwilatan.');
check('pronuncia della chiave', COURSE.show('ما هذا؟ هذا قلم.') === 'ما هذا؟ هذا قلم.\nMā hādhā? Hādhā qalam.');

console.log(count - fails + ' / ' + count + ' test arabi passati');
process.exit(fails ? 1 : 0);
