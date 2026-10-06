'use strict';
// Test del corso di inglese (stesso motore, regole in grammar_en.js): node tests/run_en.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course_en.js', 'data.js', 'logic.js', 'grammar_en.js', 'ui_lang.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate'), evaluateAll = run('evaluateAll'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk');
const buildSteps = run('buildSteps'), buildDrill = run('buildDrill'), isEcho = run('isEcho');
const S = run('S'), LESSONS = run('LESSONS'), ITEMS = run('ITEMS'), TEACHERS = run('TEACHERS'), FIG = run('FIG');

let fails = 0, count = 0;
function check(name, cond) { count++; if (!cond) { fails++; console.log('FALLITO: ' + name); } }
const ok = (st, text) => evaluate(st, text).ok;
const teacher = (k) => run('L = { teacher: TEACHERS["' + k + '"] }');

// 1. Corso: figure, articoli, insegnanti
check('ogni parola ha la sua figura', Object.keys(ITEMS).every(k => FIG[k]));
check('articoli a/an', Object.keys(ITEMS).every(k => ITEMS[k].art === (/^[aeiou]/.test(ITEMS[k].word) ? 'an' : 'a')));
check('umbrella nella lezione 4', LESSONS[3].fresh === 'umbrella');
check('insegnanti uomo, donna, donna, uomo', run('TRIAL_ROTATION').map(k => TEACHERS[k].gender).join('') === 'mffm');
check('nomi inglesi', run('TRIAL_ROTATION').map(k => TEACHERS[k].name).join() === 'Max,Emma,Kate,Tom');
check('dal più rigido al più indulgente', run('TRIAL_ROTATION').map(k => TEACHERS[k].repeats.reduce((a, b) => a + b, 0)).every((v, i, a) => !i || v <= a[i - 1]));
check('ogni insegnante ha una figura', run('TRIAL_ROTATION').every(k => TEACHERS[k].look));
check('voce britannica, studenti italiani', run('COURSE').lang === 'en-GB' && run('COURSE').students.join() === 'it');

// 2. Frasi dell'insegnante
check('presentazione', S.present('book').prompt === 'It\'s a book.' && S.present('umbrella', true).prompt === 'This is an umbrella.');
check('domanda col sì', S.yes('book').prompt === 'Is it a book?' && S.yes('book').model === 'Yes, it is a book.');
check('domanda col no', S.neg('book', 'table').prompt === 'Is it a table?' && S.neg('book', 'table').model === 'No, it isn\'t a table.');
check('domanda con this', S.yes('book', true).prompt === 'Is this a book?');
check('domanda chiave', S.key('pen').prompt === 'What is it?' && S.key('pen').model === 'It\'s a pen.');
check('an umbrella', S.key('umbrella').model === 'It\'s an umbrella.');
check('alternativa', /^Is it an? \w+ or an? \w+\?$/.test(S.alt('book', 'pen').prompt));

// 3. Risposte giuste (forme lunghe e corte, maiuscole, punteggiatura)
teacher('max');
const pres = S.present('book'), yes = S.yes('book'), neg = S.neg('book', 'table'), key = S.key('umbrella');
check('ripete «It\'s a book.»', ok(pres, 'It\'s a book.') && ok(pres, 'it is a book') && ok(pres, 'This is a book'));
check('sì: forma lunga e corta', ok(yes, 'Yes, it is a book.') && ok(yes, 'yes it\'s a book') && ok(yes, 'Yeah, it\'s a book'));
check('no: forma corta e lunga', ok(neg, 'No, it isn\'t a table.') && ok(neg, 'no it is not a table') && ok(neg, 'It isn\'t a table'));
check('no + cosa è', evaluate(neg, 'No, it isn\'t a table, it\'s a book.').full);
check('domanda chiave con an', ok(key, 'It\'s an umbrella.'));
check('ripete «What is it?»', ok(S.askQ('pen'), 'What is it?') && ok(S.askQ('pen'), 'what\'s this'));
check('alias del microfono', ok(S.key('chair'), 'it is a share') && ok(S.key('pen'), 'it\'s a pan'));

// 4. Risposte sbagliate
check('articolo sbagliato: an chair', !ok(S.key('chair'), 'It\'s an chair.'));
check('articolo sbagliato: a umbrella', !ok(key, 'It is a umbrella.'));
check('oggetto sbagliato', !ok(yes, 'Yes, it is a table.'));
check('manca il sì', !ok(yes, 'It is a book.'));
check('no a una domanda col sì', !ok(yes, 'No, it isn\'t a book.'));
check('sì a una domanda col no', !ok(neg, 'Yes, it is a table.'));
check('nega la cosa giusta', !ok(neg, 'No, it isn\'t a book.'));
check('parola sconosciuta', !ok(S.key('pen'), 'It is a pencil.'));
check('alternativa ripetuta', !ok(S.alt('book', 'pen'), 'is it a book or a pen'));
check('l\'errore della demo è un errore', !ok(S.yes('chair'), run('COURSE').demoWrong));

// 5. Accento italiano: confronto sul suono, severità secondo l'insegnante
teacher('tom');
check('Tom accetta «dis is a book»', ok(pres, 'dis is a book'));
check('Tom accetta «it is a booka»', ok(S.key('book'), 'it is a booka'));
teacher('max');
check('Max non accetta «dis is a book»', !ok(pres, 'dis is a book'));
teacher('tom');
check('anche Tom: oggetto sbagliato resta sbagliato', !ok(S.key('book'), 'it is a table'));
check('anche Tom: an chair resta sbagliato', !ok(S.key('chair'), 'it is an chair'));

// 6. Le domande dell'allievo
const A = (X, t) => evalAsk(X, t);
check('What is it?', A('pen', 'What is it?').ok && A('pen', 'What is it?').kind === 'what');
check('Is it a book? (sì)', A('book', 'Is it a book?').kind === 'yes');
check('Is this a table? (no)', A('book', 'Is this a table?').kind === 'no' && A('book', 'Is this a table?').ask === 'table');
check('Is it a table or a chair?', A('book', 'Is it a table or a chair?').kind === 'alt');
check('ha risposto invece di chiedere', !A('book', 'Yes, it is a book').ok && !A('book', 'It is a book').ok);
check('domanda con articolo sbagliato corretta', A('chair', 'Is it an chair?').model === 'Is it a chair?');
check('risposta dell\'insegnante (no)', answerAsk('book', { kind: 'no', ask: 'table' }) === 'No, it isn\'t a table. It\'s a book.');
check('risposta dell\'insegnante (cos\'è)', answerAsk('umbrella', { kind: 'what' }) === 'It\'s an umbrella.');
check('risposta dell\'insegnante (né l\'uno né l\'altro)', answerAsk('book', { kind: 'alt', ask: 'table', ask2: 'pen' }) === 'It isn\'t a table or a pen. It\'s a book.');

// 7. Eco della domanda e microfono che attacca la domanda davanti
const alt = { type: 'alt', show: 'pen', options: ['book', 'pen'], prompt: 'Is it a book or a pen?', model: 'It\'s a pen.' };
check('eco: la domanda intera', isEcho(alt, 'is it a book or a pen'));
check('domanda attaccata davanti', evaluateAll(alt, ['is it a book or a pen it is a pen']).ok);

// 8. Lezioni: stessa sequenza del corso di italiano
LESSONS.forEach(l => {
  const st = buildSteps(l), first = st.findIndex(s => s.phase !== 'present');
  check(l.id + ': 3 giri di presentazione', first === l.known.length * 3);
  check(l.id + ': l\'oggetto nuovo non si nomina prima di «What is it?»',
    st.slice(0, st.findIndex(s => s.type === 'reveal')).every(s => s.prompt.indexOf(ITEMS[l.fresh].word) === -1));
  check(l.id + ': tutte le frasi in inglese', st.every(s => !/[èàù]| è |Sì|Che cos/.test(s.prompt + s.model)));
  check(l.id + ': ogni risposta modello è giusta', st.filter(s => s.model && s.type !== 'reveal').every(s => evaluate(s, s.model).ok));
});
check('ripetizioni dopo un errore: tutte giuste', ['yes', 'neg', 'key'].every(tp => {
  const st = tp === 'yes' ? S.yes('book') : tp === 'neg' ? S.neg('book', 'table') : S.key('book');
  return buildDrill(st, 5, ['book', 'table', 'chair']).every(d => evaluate(d, d.model).ok);
}));

console.log(count - fails + ' / ' + count + ' test inglesi passati');
process.exit(fails ? 1 : 0);
