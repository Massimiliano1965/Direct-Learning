'use strict';
// Test del pacchetto cinese: node tests/run_zh.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course_zh.js', 'data.js', 'logic.js', 'pinyin_zh.js', 'grammar_zh.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk');
const buildSteps = run('buildSteps'), buildDrill = run('buildDrill'), S = run('S'), LESSONS = run('LESSONS');
const COURSE = run('COURSE'), FIG = run('FIG'), ITEMS = run('ITEMS'), isEcho = run('isEcho');

let fails = 0, count = 0;
function check(name, cond) {
  count++;
  if (!cond) { fails++; console.log('FALLITO: ' + name); }
}

// 1. Frasi dell'insegnante
check('presentazione', S.present('book').model === '这是书。');
check('domanda sì', S.yes('book').prompt === '这是书吗？' && S.yes('book').model === '是，这是书。');
check('domanda no', S.neg('table', 'book').prompt === '这是书吗？' && S.neg('table', 'book').model === '不是，这不是书。');
check('domanda chiave', S.key('pen').prompt === '这是什么？' && S.key('pen').model === '这是笔。');
check('rivelazione', S.reveal('pen').prompt === '这是什么？这是笔。');
check('domanda «o»', /^这是(书|笔)还是(书|笔)？$/.test(S.alt('pen', 'book').prompt));

// 2. Risposte (come le scrive il microfono: con o senza punteggiatura, con alias)
const yesBook = { type: 'yes', show: 'book' };
const negTable = { type: 'neg', show: 'table', ask: 'book' };
const keyPen = { type: 'key', show: 'pen' };
const altPen = { type: 'alt', show: 'pen' };
const echoBook = { type: 'echo', check: 'claim', show: 'book' };
const askQ = { type: 'echo', check: 'question', show: 'pen' };
[
  [echoBook, '这是书。', true], [echoBook, '这是书', true], [echoBook, '这是一本书', true], [echoBook, '这是输', true],
  [echoBook, '这是树', true],   // i toni non si giudicano: il microfono sceglie i caratteri a caso tra quelli con lo stesso suono
   [echoBook, '这不是书', false], [echoBook, '这是桌子', false],
  [yesBook, '是，这是书。', true], [yesBook, '是这是书', true], [yesBook, '是的，这是书', true], [yesBook, '对，这是书', true],
  [yesBook, '这是书', false], [yesBook, '是', false], [yesBook, '不是，这不是书', false], [yesBook, '是，这是桌子', false],
  [negTable, '不是，这不是书。', true], [negTable, '不是这不是书', true], [negTable, '这不是书', true],
  [negTable, '不是，这不是书。这是桌子。', true], [negTable, '不是', false], [negTable, '是，这是书', false],
  [negTable, '不是，这不是桌子', false], [negTable, '不是，这不是书，这是椅子', false],
  [keyPen, '这是笔。', true], [keyPen, '这是比', true], [keyPen, '这是书', false], [keyPen, '这是什么', false],
  [altPen, '这是笔', true], [altPen, '这是书还是笔', false], [altPen, '这是书', false],
  [askQ, '这是什么？', true], [askQ, '这是什么', true], [askQ, '这是笔', false]
].forEach(([st, t, ok]) => check('risposta «' + t + '» a ' + st.type + ' → ' + ok, evaluate(st, t).ok === ok));
check('no completo: full', evaluate(negTable, '不是，这不是书。这是桌子。').full === true);
check('no senza correzione: full=false', evaluate(negTable, '不是，这不是书。').full === false);
// 2b. Confronto sul suono (lo screenshot di Massi: «日系说的» per «这是桌子»)
const echoTable = { type: 'echo', check: 'claim', show: 'table' };
const withTeacher = (k, f) => { run('L = ' + (k ? '{ teacher: { key: "' + k + '" } }' : 'undefined')); try { return f(); } finally { run('L = undefined'); } };
run('var L;');
check('Sara accetta «日系说的» per «这是桌子»', withTeacher('sara', () => evaluate(echoTable, '日系说的').ok));
check('Mass non accetta «日系说的»', !withTeacher('mass', () => evaluate(echoTable, '日系说的').ok));
check('suono vicino: «这事桌子» va bene', evaluate(echoTable, '这事桌子').ok);
check('suono vicino: «这是捉紫» va bene', evaluate(echoTable, '这是捉紫').ok);
check('parola sbagliata per suono: «这是书» no', !withTeacher('sara', () => evaluate(echoTable, '这是书').ok));
check('sì per suono: «是这是数» va bene', evaluate({ type: 'yes', show: 'book' }, '是这是数').ok);
check('sì/no non si confondono: «不是这不是书» a domanda sì', !withTeacher('sara', () => evaluate({ type: 'yes', show: 'book' }, '不是这不是书').ok));
check('no per suono: «不是这不是数» va bene', evaluate(negTable, '不是这不是数').ok);
check('pinyin di quello che si è sentito', COURSE.heard('日系说的') === '日系说的 (ri xi shuo de)');
check('eco della domanda', isEcho({ prompt: '这是书吗？', model: '是，这是书。' }, '这是书吗'));

// 3. Domande dell'allievo (ha toccato la sedia)
[
  ['这是什么？', 'what', '这是椅子。'],
  ['这是椅子吗？', 'yes', '是，这是椅子。'],
  ['这是书吗', 'no', '不是，这不是书。这是椅子。'],
  ['这是书还是椅子？', 'alt', '这是椅子。'],
  ['这是书还是桌子', 'alt', '这不是书，也不是桌子。这是椅子。']
].forEach(([t, kind, ans]) => {
  const r = evalAsk('chair', t);
  check('domanda «' + t + '» → ' + kind, r.ok && r.kind === kind && answerAsk('chair', r) === ans);
});
check('risposta invece di domanda', !evalAsk('chair', '是，这是椅子').ok && !evalAsk('chair', '不是，这不是书').ok);
check('alternativa con la stessa parola', !evalAsk('chair', '这是书还是书').ok);

// 4. Lezione: stesso flusso dell'italiano
LESSONS.forEach(l => {
  for (let rep = 0; rep < 20; rep++) {
    const steps = buildSteps(l);
    const ph = steps.map(s => s.phase);
    check('ordine delle fasi', ph.indexOf('present') === 0 && ph.indexOf('reveal') < ph.indexOf('key') && ph.indexOf('key') < ph.indexOf('askfirst') && ph.indexOf('askfirst') < ph.indexOf('mix'));
    const reveal = ph.indexOf('reveal');
    check('笔 nascosto fino a «这是什么？»', steps.slice(0, reveal).every(s => s.prompt.indexOf('笔') === -1 && s.model.indexOf('笔') === -1));
    check('ogni risposta attesa è accettata', steps.every(s => s.type === 'reveal' || s.type === 'ask' || evaluate(s, s.model).ok));
    steps.filter(s => s.type !== 'reveal' && s.type !== 'ask').forEach(s => {
      buildDrill(s, 4, l.known.concat([l.fresh])).forEach(d => {
        if (!evaluate(d, d.model).ok) check('ripetizione accettata: ' + d.model, false);
      });
    });
  }
});

// 5. Dati
Object.keys(ITEMS).forEach(k => check('figura per ' + k, typeof FIG[k] === 'string'));
check('pinyin', COURSE.show('这是书吗？') === '这是书吗？\nZhè shì shū ma?');
check('pinyin con 不是', COURSE.show('不是，这不是桌子。') === '不是，这不是桌子。\nBú shì, zhè bú shì zhuōzi.');
check('pinyin della chiave', COURSE.show('这是什么？这是笔。') === '这是什么？这是笔。\nZhè shì shénme? Zhè shì bǐ.');

console.log(count - fails + ' / ' + count + ' test cinesi passati');
process.exit(fails ? 1 : 0);
