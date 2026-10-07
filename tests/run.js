'use strict';
// Test della logica pura: node tests/run.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course.js', 'data.js', 'logic.js', 'colors_it.js', 'numbers_it.js', 'geo_fig.js', 'geo_it.js', 'poss_it.js', 'size_it.js', 'third_it.js', 'nat_it.js', 'essere_it.js', 'altro_it.js', 'prep_it.js', 'anche_it.js', 'ora_it.js', 'appt_it.js', 'gender_it.js', 'verbs_it.js', 'perche_it.js', 'pron_it.js', 'ui_lang.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate');
const evaluateAll = run('evaluateAll');
const buildSteps = run('buildSteps');
const answerSteps = run('answerSteps');
const LESSONS = run('LESSONS').filter(l => !l.colors && !l.numbers && !l.geo && !l.poss && !l.size && !l.third && !l.nat && !l.ess && !l.altro && !l.prep && !l.anche && !l.ora && !l.appt && !l.verbs && !l.purp && !l.pron);   // lezioni con gli oggetti (colori e numeri hanno i loro test)
const NUM_LESSONS = run('LESSONS').filter(l => l.numbers);
const COLOR_LESSONS = run('LESSONS').filter(l => l.colors);
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
  [{ type: 'neg', show: 'table', ask: 'book' }, 'Non è un libro.', true],
  [{ type: 'neg', show: 'table', ask: 'book' }, 'Non è un tavolo.', false],
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

// 1a. Domande fatte dall'allievo (tocca la sedia e chiede)
const evalAsk = run('evalAsk');
const answerAsk = run('answerAsk');
const askCases = [
  ["Che cos'è?", 'what', 'È una sedia.'],
  ['che cosa è', 'what', 'È una sedia.'],
  ['È una sedia?', 'yes', 'Sì, è una sedia.'],
  ['È questo un tavolo?', 'no', 'No, non è un tavolo. È una sedia.'],
  ['è un libro', 'no', 'No, non è un libro. È una sedia.'],
  ['È un tavolo o una sedia?', 'alt', 'È una sedia.'],
  ['è una sedia o un tavolo', 'alt', 'È una sedia.'],
  ['È questa una sedia oppure un libro?', 'alt', 'È una sedia.'],
  ['È un tavolo o un libro?', 'alt', 'Non è né un tavolo né un libro. È una sedia.']
];
askCases.forEach(([t, kind, ans]) => {
  const r = evalAsk('chair', t);
  check('domanda «' + t + '» → ' + kind, r.ok && r.kind === kind && answerAsk('chair', r) === ans);
});
check('domanda con articolo sbagliato → si corregge', (r => !r.ok && r.model === 'È un tavolo?')(evalAsk('chair', 'È una tavolo?')));
check('risposta invece di domanda → «Che cos\'è?»', (r => !r.ok && r.model === "Che cos'è?")(evalAsk('chair', 'Sì, è una sedia.')));
check('parola sconosciuta → «Che cos\'è?»', (r => !r.ok && r.model === "Che cos'è?")(evalAsk('chair', 'È un aquilone?')));
check('domanda corretta suggerita è accettata', evalAsk('chair', 'È un tavolo?').ok);
check('alternativa con articolo sbagliato → si corregge', (r => !r.ok && r.model === 'È un tavolo o una sedia?')(evalAsk('chair', 'È una tavolo o una sedia?')));
check('alternativa con la stessa parola due volte → no', !evalAsk('chair', 'È un tavolo o un tavolo?').ok);
check('alternativa con parola sconosciuta → no', !evalAsk('chair', 'È un tavolo o un aquilone?').ok);
LESSONS.forEach(l => {
  const steps = buildSteps(l);
  const asks = steps.filter(s => s.type === 'ask');
  const early = steps.filter(s => s.phase === 'askfirst'), last = steps.filter(s => s.phase === 'ask');
  const lastKey = steps.map(s => s.phase).lastIndexOf('key'), firstMix = steps.findIndex(s => s.phase === 'mix');
  check(l.id + ': 3 domande dell\'allievo subito dopo la key question', early.length === 3 && early[0].intro &&
    steps.slice(lastKey + 1, lastKey + 4).every(s => s.phase === 'askfirst') && lastKey + 3 < firstMix);
  check(l.id + ': in fondo 4 domande dell\'allievo', last.length === 4 && steps.slice(-4).every(s => s.type === 'ask') && last[0].intro);
  check(l.id + ': 7 domande dell\'allievo in tutto', asks.length === 7);
});

// 1b. Eco della voce dell'insegnante
const isEcho = run('isEcho');
const altSt = { type: 'alt', show: 'table', prompt: 'È un tavolo o un libro?', model: 'È un tavolo.' };
check('eco: tutta la domanda', isEcho(altSt, 'è un tavolo o un libro'));
check('eco: la coda della domanda', isEcho(altSt, 'o un libro'));
check('eco: la risposta vera non è eco', !isEcho(altSt, 'È un tavolo.'));
check('eco: frase da ripetere mai eco', !isEcho({ type: 'echo', prompt: 'È un libro.', model: 'È un libro.' }, 'è un libro'));
check('eco: una parola sola non basta', !isEcho(altSt, 'libro'));
const altKey = { type: 'alt', show: 'key', options: ['key', 'cup'], prompt: 'È questa una chiave o una tazza?', model: 'È una chiave.' };
check('eco: «…o una tazza» sentito come «è una tazza»', isEcho(altKey, 'è una tazza'));
check('eco: la risposta giusta non è eco', !isEcho(altKey, 'è una chiave'));
check('eco: risposta giusta anche se è la seconda parola', !isEcho({ type: 'alt', show: 'cup', options: ['key', 'cup'], prompt: 'È una chiave o una tazza?', model: 'È una tazza.' }, 'è una tazza'));
check('lezione 4: «È una chiave.» alla domanda chiave o tazza', evaluate(altKey, 'È una chiave.').ok);
// Eco attaccata davanti alla risposta: si toglie la parte dell'insegnante
const cleanAlts = run('cleanAlts'), trimEcho = run('trimEcho');
const altPen2 = { type: 'alt', show: 'pen', options: ['book', 'pen'], prompt: 'È un libro o una penna?', model: 'È una penna.' };
check('eco davanti: domanda intera + risposta', evaluateAll(altPen2, ['è un libro o una penna è una penna']).ok);
check('eco davanti: coda + risposta', evaluateAll(altPen2, ['o una penna è una penna']).ok);
check('eco davanti: coda + risposta sbagliata resta sbagliata', !evaluateAll(altPen2, ['o una penna è un libro']).ok);
check('eco: le interpretazioni solo-eco si scartano', evaluateAll(altPen2, ['è un libro o una penna', 'è una penna']).ok);
check('eco: senza doppioni né vuoti', cleanAlts(altPen2, ['è una penna', 'È una penna.', '', '  ']).length === 1);
check('eco: frase da ripetere non si tocca', trimEcho({ type: 'echo', prompt: 'È un libro.', model: 'È un libro.' }, 'è un libro è un libro') === 'è un libro è un libro');
check('eco: no con la domanda davanti', evaluateAll({ type: 'neg', show: 'table', ask: 'book', prompt: 'È un libro?', model: 'No, non è un libro.' }, ['è un libro no non è un libro']).ok);

// 2. Più interpretazioni: basta che una sia giusta, al massimo 5
const st = { type: 'key', show: 'pen' };
check('alternative: la seconda giusta', evaluateAll(st, ['è una pena di', 'è una penna']).ok);
check('alternative: oltre la quinta ignorata', !evaluateAll(st, ['a', 'b', 'c', 'd', 'e', 'è una penna']).ok);
check('alternative: lista vuota', !evaluateAll(st, []).ok);

// 3. Sequenza della lezione (più volte, perché è in parte casuale)
LESSONS.forEach(l1 => {
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
  check('«Che cos\'è?» ripetuto 4 volte', steps.filter(s => s.phase === 'askq').length === (l1.review ? 2 : 4));
  check('il ritmo cresce', steps.filter(s => s.phase === 'mix').every((s, i, a) => !i || s.speed >= a[i - 1].speed));
  check('niente stesso oggetto due volte di fila nel mix', steps.filter(s => s.phase === 'mix').every((s, i, a) => !i || s.show !== a[i - 1].show));
  steps.forEach((s, i) => {
    if (s.type === 'reveal' || s.type === 'ask') return;
    if (!evaluate(s, s.model).ok) check('passo ' + (i + 1) + ' modello «' + s.model + '» (' + s.type + ')', false);
    if (s.type === 'neg' && s.show === s.ask) check('no: oggetto chiesto diverso da quello indicato', false);
  });
  check('risposte = passi meno rivelazioni', answerSteps(steps) === steps.length - 2);
}
});
check('lezione 2: sedia, porta, poi finestra nuova', LESSONS[1].known.join() === 'chair,door' && LESSONS[1].fresh === 'window');
count++;

// 3b. Ripetizioni dopo un errore
const buildDrill = run('buildDrill');
const repeatsFor = run('repeatsFor');
check('ripetizioni a rotazione', [0, 1, 2, 3, 4, 5].map(e => repeatsFor(TEACHERS.mass, e)).join() === '3,5,4,5,4,3');
LESSONS.forEach(l => {
  const items = run('lessonWords')(l);
  for (let rep = 0; rep < 10; rep++) {
    const steps = buildSteps(l);
    const reveal = steps.findIndex(s => s.type === 'reveal');
    steps.forEach((st, i) => {
      if (st.type === 'reveal' || st.type === 'ask') return;
      for (let n = 1; n <= 5; n++) {
        const d = buildDrill(st, n, items);
        if (d.length !== n) check('drill lunghezza ' + n, false);
        if (d[0].prompt !== st.model) check('drill: la prima è la risposta giusta', false);
        const F = st.type === 'neg' ? st.ask : st.show;
        const word = ITEMS[F].word;
        d.forEach(x => {
          if (!evaluate(x, x.model).ok) check('drill modello accettato «' + x.model + '»', false);
          if (!(st.type === 'echo' && (st.check === 'question' || st.check === 'dem')) && x.model.indexOf(word) === -1) check('drill gira intorno a «' + word + '»: ' + x.model, false);
          // prima dello sfogo il nome dell'oggetto nuovo non si dice mai
          if (i < reveal && (x.prompt + x.model).indexOf(ITEMS[l.fresh].word) !== -1) check('drill non svela l\'oggetto nuovo', false);
        });
        if (n >= 2 && !(st.type === 'echo' && (st.check === 'question' || st.check === 'dem')) && d[1].prompt === d[0].prompt) check('drill: la seconda è diversa dalla prima', false);
        if (n >= 3 && !(st.type === 'echo' && (st.check === 'question' || st.check === 'dem')) && new Set(d.map(x => x.type)).size < 2) check('drill variato', false);
      }
    });
  }
});
count++;

// 3b2. Presentazione: nella lezione 1 solo «È un libro.»; «Questo è…» dalla lezione 2 (dq)
LESSONS.forEach(l => {
  const st = buildSteps(l), first = st.findIndex(s => s.phase !== 'present'), pres = st.slice(0, first);
  const claims = pres.filter(s => s.check === 'claim'), dems = pres.filter(s => s.check === 'dem');
  if (!l.dq) check(l.id + ': niente «Questo è…» nella presentazione', claims.every(s => /^È /.test(s.prompt)) && !dems.length);
  else {
    const n1 = l.questoIntro ? l.known.length + (l.review || []).length : l.known.length;
    check(l.id + ': primo giro con «Questo/Questa» d\'accordo', claims.slice(0, n1).every(s => s.prompt.startsWith((ITEMS[s.show].art === 'una' || ITEMS[s.show].art === "un'") ? 'Questa è ' : 'Questo è ')));
    check(l.id + ': poi «È un…»', claims.slice(n1).every(s => /^È /.test(s.prompt)));
  }
  check(l.id + ': domande senza «questo» nelle lezioni che non lo insegnano', l.questo || st.every(s => !/^È quest/.test(s.prompt)));
});
check('lezione 1: niente «Questo/Questa»', buildSteps(LESSONS[0]).every(s => !/Quest/.test(s.prompt + s.model)));
// lezione 2: prima l'insegnante indica e dice solo «Questo.» «Questa.», maschili e femminili mescolati, poi il nome
{
  const l2 = LESSONS[1];
  for (let n = 0; n < 50; n++) {
    const st = buildSteps(l2), dems = st.filter(s => s.check === 'dem');
    const P = l2.known.concat(l2.review);
    if (n === 0) {
      check('lezione 2: comincia con «Questo.» «Questa.» su tutti gli oggetti', st.slice(0, P.length).every(s => s.check === 'dem') && dems.length === P.length && P.every(k => dems.some(d => d.show === k)));
      check('lezione 2: «Questo.» per i maschili, «Questa.» per i femminili', dems.every(d => d.prompt === (ITEMS[d.show].art === 'una' ? 'Questa.' : 'Questo.')));
      check('lezione 2: c\'è anche il maschile (libro, tavolo)', dems.some(d => d.prompt === 'Questo.') && dems.some(d => d.prompt === 'Questa.'));
      check('lezione 2: poi il nome con lo stesso ordine', st.slice(P.length, 2 * P.length).map(s => s.show).join() === dems.map(d => d.show).join() && /^Quest/.test(st[P.length].prompt));
    }
    if (dems.some((d, i) => i && d.prompt === dems[i - 1].prompt)) { check('lezione 2: «Questo/Questa» alternati', false); break; }
  }
  const dq = { type: 'echo', check: 'dem', dem: 'questo', show: 'book', prompt: 'Questo.', model: 'Questo.' };
  check('«Questo.» ripetuto', evaluate(dq, 'Questo.').ok && evaluate(dq, 'questo').ok);
  check('«Questa.» al posto di «Questo.» è sbagliato', !evaluate(dq, 'Questa.').ok);
  check('ripetizioni di «Questo.» dopo un errore', run('buildDrill')(dq, 3, ['book']).every(d => d.prompt === 'Questo.'));
}
// 3b3. Presentazione di tutti gli oggetti prima della prima domanda: ognuno 2 o 3 volte
const presCount = (st) => { const first = st.findIndex(s => s.phase !== 'present'), c = {}; st.slice(0, first).filter(s => s.check === 'claim').forEach(s => { c[s.show] = (c[s.show] || 0) + 1; }); return c; };
LESSONS.forEach(l => {
  const st = buildSteps(l), c = presCount(st);
  check(l.id + ': ogni oggetto presentato 2 o 3 volte prima delle domande', l.known.every(k => c[k] === 2 || c[k] === 3));
  check(l.id + ': ripasso nominato al massimo una volta', (l.review || []).every(k => (c[k] || 0) <= 1));
});
// mai lo stesso oggetto due volte di fila nella presentazione
check('presentazione: mai due volte di fila lo stesso oggetto', LESSONS.concat(COLOR_LESSONS).every(l => {
  for (let n = 0; n < 300; n++) {
    const st = buildSteps(l), first = st.findIndex(s => s.phase !== 'present');
    if (st.slice(1, first).some((s, i) => s.show === st[i].show)) return false;
  }
  return true;
}));
// percentuali: 60% due volte con pochi oggetti (3 o meno), 70% con tanti
[[LESSONS[0], 0.6], [LESSONS.find(l => l.known.length >= 4), 0.7]].forEach(([l, p]) => {
  let two = 0, all = 0;
  for (let n = 0; n < 2000; n++) { const c = presCount(buildSteps(l)); l.known.forEach(k => { all++; if (c[k] === 2) two++; }); }
  check(l.id + ': due volte nel ' + Math.round(p * 100) + '% circa (' + Math.round(two / all * 100) + '%)', Math.abs(two / all - p) < 0.04);
});
check('«Sì, questo è un libro.» accettato', evaluate({ type: 'yes', show: 'book' }, 'Sì, questo è un libro.').ok);
check('«Questa è una sedia.» ripetuto', evaluate({ type: 'echo', check: 'claim', show: 'chair' }, 'Questa è una sedia.').ok);

// 3c. Lezione 3: «È questo un…?» con l'accordo giusto, parole vecchie per introdurre il computer
const l3 = LESSONS.find(l => l.id === 'l3');
for (let rep = 0; rep < 20; rep++) {
  const st3 = buildSteps(l3);
  const qs = st3.filter(s => s.type === 'yes' || s.type === 'neg');
  const withQ = qs.filter(s => /^È quest[oa] /.test(s.prompt));
  if (!withQ.length || withQ.length === qs.length) check('lezione 3: le due forme mescolate', false);
  if (!withQ.every(s => (ITEMS[s.ask || s.show].art === 'una') === s.prompt.startsWith('È questa '))) check('lezione 3: questo/questa d\'accordo', false);
  const fresh = st3.filter(s => s.phase === 'fresh').map(s => s.ask).sort().join();
  if (fresh !== l3.known.concat(l3.review).sort().join()) check('lezione 3: no al computer con tutte le parole conosciute', false);
}
check('lezione 3: «È questa una sedia?» come domanda dell\'allievo', evalAsk('chair', 'È questa una sedia?').ok);

// 4. Prova di 7 giorni
check('prova non iniziata', trialFor(null, '2026-10-05').day === 0);
check('giorno 1', trialFor('2026-10-05', '2026-10-05').day === 1 && trialFor('2026-10-05', '2026-10-05').today === 'mass');
check('giorno 2', trialFor('2026-10-05', '2026-10-06').today === 'giulia');
check('giorno 3', trialFor('2026-10-05', '2026-10-07').today === 'luca');
check('giorno 4', trialFor('2026-10-05', '2026-10-08').today === 'sara');
check('giorno 5', trialFor('2026-10-05', '2026-10-09').today === 'mass');
check('giorno 8', trialFor('2026-10-05', '2026-10-12').today === 'sara');
check('giorno 9: prova finita', trialFor('2026-10-05', '2026-10-13').today === null);
check('a cavallo di mese', trialFor('2026-10-31', '2026-11-01').day === 2);
check('ora legale (25 ottobre)', trialFor('2026-10-24', '2026-10-26').day === 3);
check('orologio indietro: resta giorno 1', trialFor('2026-10-05', '2026-10-01').today === 'mass');

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
const MARKS = run('MARKS');
Object.keys(TEACHERS).forEach(k => check('insegnante ' + k, TEACHERS[k].key === k && Array.isArray(TEACHERS[k].praise) && TEACHERS[k].repeats.length > 0 && MARKS[TEACHERS[k].mark]));
check('ripetizioni: massimo 5, mai tutte uguali', Object.keys(TEACHERS).every(k => TEACHERS[k].repeats.every(n => n >= 1 && n <= 5) && new Set(TEACHERS[k].repeats).size > 1));
check('dal più rigido al più indulgente', ['mass', 'giulia', 'luca', 'sara'].map(k => TEACHERS[k].repeats.reduce((a, b) => a + b, 0)).every((v, i, a) => !i || v <= a[i - 1]));
// l'insegnante non usa parole che l'allievo non conosce: errore = «No.», niente lodi a parole, niente «Tocca a te.»
check('parole dell\'errore', ['mass', 'giulia', 'luca', 'sara'].every(k => TEACHERS[k].wrong === 'No.' && TEACHERS[k].praise.length === 0 && !TEACHERS[k].done));

// Lezione dei colori: «Il o la? Nero o nera?»
{
  const SC = run('SC'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l5 = COLOR_LESSONS[0];
  check('lezione 5 c\'è', l5 && l5.id === 'l5');
  check('lezione 5: tre oggetti con «il» e tre con «la»', l5.known.concat(l5.reds).map(x => ITEMS[x.split('_')[0]].art).sort().join() === 'un,un,un,una,una,una');
  check('lezione 5: ogni oggetto colorato ha la figura', l5.known.concat(l5.reds).every(x => FIG[x]));
  const ph = 'phone_nero', su = 'suitcase_nero', cup = 'cup_rosso';
  check('frasi: il telefono è nero', SC.present(ph).prompt === 'Il telefono è nero.' && SC.present(su).prompt === 'La valigia è nera.');
  check('frasi: domanda col sì', SC.yes(su).prompt === 'La valigia è nera?' && SC.yes(su).model === 'Sì, la valigia è nera.');
  check('frasi: domanda col no', SC.neg(su, 'bianco').prompt === 'La valigia è bianca?' && SC.neg(su, 'bianco').model === 'No, la valigia non è bianca.');
  check('frasi: domanda chiave', SC.key(cup).prompt === 'Di che colore è la tazza?' && SC.key(cup).model === 'La tazza è rossa.');
  check('frasi: sfogo', SC.reveal('coat_rosso').prompt === 'Di che colore è il cappotto? Il cappotto è rosso.');
  check('giusto: ripete', ok(SC.present(su), 'La valigia è nera.'));
  check('giusto: sì', ok(SC.yes(su), 'Sì, la valigia è nera.'));
  check('giusto: no', ok(SC.neg(su, 'bianco'), 'No, la valigia non è bianca.') && ok(SC.neg(su, 'bianco'), 'La valigia non è bianca.'));
  check('giusto: no + com\'è', evaluate(SC.neg(su, 'bianco'), 'No, la valigia non è bianca. La valigia è nera.').full);
  check('giusto: domanda chiave', ok(SC.key(cup), 'La tazza è rossa.'));
  check('giusto: ripete «Di che colore è?»', ok(SC.askQ(cup), 'Di che colore è?'));
  check('sbagliato: articolo «il tazza»', !ok(SC.key(cup), 'Il tazza è rossa.'));
  check('sbagliato: accordo «la valigia è nero»', !ok(SC.present(su), 'La valigia è nero.'));
  check('sbagliato: accordo «il telefono è nera»', !ok(SC.yes(ph), 'Sì, il telefono è nera.'));
  check('sbagliato: colore sbagliato', !ok(SC.key(ph), 'Il telefono è bianco.'));
  check('sbagliato: manca il sì', !ok(SC.yes(ph), 'Il telefono è nero.'));
  check('sbagliato: nega il colore giusto', !ok(SC.neg(ph, 'bianco'), 'No, il telefono non è nero.'));
  check('sbagliato: oggetto sbagliato', !ok(SC.key(ph), 'La valigia è nera.'));
  check('sbagliato: solo il colore', !ok(SC.key(ph), 'Nero.'));
  const A = (X, t) => evalAsk(X, t);
  check('allievo: Di che colore è il telefono?', A(ph, 'Di che colore è il telefono?').kind === 'what');
  check('allievo: Il telefono è bianco? (no)', A(ph, 'Il telefono è bianco?').kind === 'no');
  check('allievo: La valigia è nera o bianca?', A(su, 'La valigia è nera o bianca?').kind === 'alt');
  check('allievo: Che cos\'è?', A(ph, 'Che cos\'è?').kind === 'thing');
  check('allievo: accordo sbagliato corretto', A(su, 'La valigia è bianco?').model === 'La valigia è bianca?');
  check('allievo: ha risposto invece di chiedere', !A(ph, 'Sì, il telefono è nero').ok);
  check('insegnante risponde', answerAsk(ph, { kind: 'no', ask: 'bianco' }) === 'No, il telefono non è bianco. Il telefono è nero.' &&
    answerAsk(su, { kind: 'alt', ask: 'bianco', ask2: 'rosso' }) === 'La valigia non è né bianca né rossa. La valigia è nera.' &&
    answerAsk(ph, { kind: 'thing' }) === 'È un telefono.');
  const keyStep = SC.key(ph), altStep = SC.alt(ph, 'bianco');
  check('domanda chiave: la risposta comincia come la coda della domanda', evaluateAll(keyStep, ['Il telefono è nero.']).ok);
  check('domanda chiave: domanda + risposta attaccate', evaluateAll(keyStep, ['di che colore è il telefono il telefono è nero']).ok);
  check('alternativa: la domanda ripetuta non è una risposta', !evaluateAll(altStep, [altStep.prompt]).ok);
  check('domanda chiave: la domanda ripetuta non è una risposta', !evaluateAll(keyStep, [keyStep.prompt]).ok);
  check('lezione a oggetti: non cambia', evaluate({ type: 'key', show: 'book' }, 'È un libro.').ok && !evaluate({ type: 'key', show: 'book' }, 'Il libro è nero.').ok);
  for (let n = 0; n < 20; n++) {
    const st = buildSteps(l5);
    const first = st.findIndex(s => s.phase !== 'present');
    if (n === 0) {
      check('lezione 5: ogni oggetto presentato 2 o 3 volte', first >= l5.known.length * 2 && first <= l5.known.length * 3 && l5.known.every(k => [2, 3].indexOf(st.slice(0, first).filter(s => s.show === k).length) !== -1));
      check('lezione 5: «rosso» non si dice prima dello sfogo', st.slice(0, st.findIndex(s => s.type === 'reveal')).every(s => !/ross/.test(s.prompt + s.model)));
      check('lezione 5: tutte le risposte modello sono giuste', st.filter(s => s.model && s.type !== 'reveal').every(s => evaluate(s, s.model).ok));
      check('lezione 5: ripetizioni giuste', st.filter(s => s.col && s.model && s.type !== 'reveal').every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
      check('lezione 5: domande dell\'allievo', st.filter(s => s.type === 'ask').length === 7);
    }
    check('lezione 5 (giro ' + n + '): niente domanda impossibile', st.every(s => s.type !== 'neg' || s.ask !== s.show.split('_')[1]));
  }
}

// Lezioni dei numeri: «Che numero è?»
{
  const S = run('S'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), isEcho = run('isEcho');
  const ok = (st, t) => evaluate(st, t).ok;
  check('lezioni 6, 7 e 26 ci sono', NUM_LESSONS.map(l => l.id).join() === 'l6,l7,l26');
  check('cartellini 1–20', [...Array(20)].every((x, i) => FIG['n' + (i + 1)]));
  check('lezione 26: undici… sedici', S.present('n11').prompt === 'È il numero undici.' && S.reveal('n16').prompt === 'Che numero è? È il numero sedici.');
  check('lezione 26: cifre del microfono e forme corte', ok(S.key('n14'), 'è il numero 14') && ok(S.key('n11'), 'È l\'undici.') && ok(S.key('n13'), 'È il tredici.') &&
    !ok(S.key('n13'), 'È il numero tre.') && !ok(S.key('n16'), 'è il 6') && ok(S.yes('n15'), 'sì è il 15'));
  check('frasi', S.present('n3').prompt === 'È il numero tre.' && S.yes('n3').model === 'Sì, è il numero tre.' &&
    S.neg('n3', 'n2').prompt === 'È il numero due?' && S.neg('n3', 'n2').model === 'No, non è il numero due.' &&
    S.key('n3').prompt === 'Che numero è?' && S.reveal('n6').prompt === 'Che numero è? È il numero sei.');
  const k3 = S.key('n3'), y3 = S.yes('n3'), n32 = S.neg('n3', 'n2');
  check('giusto: forma lunga e corta', ok(k3, 'È il numero tre.') && ok(k3, 'È il tre.'));
  check('giusto: cifre del microfono', ok(k3, 'è il numero 3') && ok(y3, 'sì è il 3') && ok(S.key('n10'), 'è il numero 10'));
  check('giusto: l\'otto', ok(S.key('n8'), 'È l\'otto.'));
  check('giusto: sì e no', ok(y3, 'Sì, è il numero tre.') && ok(n32, 'No, non è il numero due.') && evaluate(n32, 'No, non è il due, è il tre.').full);
  check('giusto: ripete «Che numero è?»', ok(S.askQ('n6'), 'Che numero è?'));
  check('sbagliato: numero sbagliato', !ok(k3, 'È il numero quattro.') && !ok(k3, 'è il 4'));
  check('sbagliato: manca il sì', !ok(y3, 'È il numero tre.'));
  check('sbagliato: solo il numero', !ok(k3, 'tre'));
  check('sbagliato: domanda ripetuta', !ok(S.alt('n3', 'n5'), S.alt('n3', 'n5').prompt));
  check('eco con le cifre', isEcho(y3, 'è il numero 3') && evaluateAll(y3, ['è il numero 3']).ok === false);
  check('domanda attaccata davanti', evaluateAll(k3, ['che numero è è il numero 3']).ok);
  check('allievo: Che numero è?', evalAsk('n3', 'Che numero è?').kind === 'what');
  check('allievo: È il numero due? (no)', evalAsk('n3', 'È il numero 2?').kind === 'no');
  check('allievo: È il tre o il quattro?', evalAsk('n3', 'È il tre o il quattro?').kind === 'alt');
  check('insegnante risponde', answerAsk('n3', { kind: 'no', ask: 'n2' }) === 'No, non è il numero due. È il numero tre.');
  NUM_LESSONS.forEach(l => {
    for (let n = 0; n < 20; n++) {
      const st = buildSteps(l);
      if (n === 0) {
        check(l.id + ': il numero nuovo non si dice prima dello sfogo', st.slice(0, st.findIndex(s => s.type === 'reveal')).every(s => (s.prompt + ' ' + s.model).indexOf(' ' + run('NUMS')[l.fresh] + '.') === -1));
        check(l.id + ': tutte le risposte modello giuste', st.filter(s => s.model && s.type !== 'reveal').every(s => evaluate(s, s.model).ok));
        check(l.id + ': ripetizioni giuste', st.filter(s => s.model && s.type !== 'reveal').every(s => buildDrill(s, 5, l.known.concat(l.review || [], [l.fresh])).every(d => evaluate(d, d.model).ok)));
        check(l.id + ': lunghezza ragionevole', st.length < 110);
      }
      if (st.some(s => s.type === 'neg' && s.ask === s.show)) { check(l.id + ': niente domanda impossibile', false); break; }
    }
  });
}

// Capitolo 2: città e paesi (lezione 8), «in o a?» (lezione 9)
{
  const SG = run('SG'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const GEO_L = run('LESSONS').filter(l => l.geo);
  check('lezioni 8 e 9 ci sono', GEO_L.map(l => l.id).join() === 'l8,l9');
  check('figure di città, paesi e monumenti', GEO_L.every(l => l.known.concat(l.fresh ? [l.fresh] : []).every(k => FIG[k] && FIG[k].indexOf('<svg') === 0)));
  check('frasi lezione 8', SG.present('g_roma').prompt === 'Roma è una città.' && SG.present('g_italia').prompt === 'L\'Italia è un paese.' &&
    SG.neg('g_londra').model === 'No, Londra non è un paese.' && SG.key('g_newyork').prompt === 'Che cosa è New York?');
  check('frasi lezione 9', SG.dPresent('g_colosseo', 'roma').prompt === 'Il Colosseo è a Roma.' && SG.dPresent('g_eiffel', 'francia').prompt === 'La Torre Eiffel è in Francia.' &&
    SG.dKey('g_muraglia').model === 'La Grande Muraglia è in Cina.' && SG.dReveal('g_muraglia').prompt === 'Dov\'è la Grande Muraglia? La Grande Muraglia è in Cina.');
  check('8 giusto', ok(SG.present('g_roma'), 'Roma è una città.') && ok(SG.yes('g_america'), 'Sì, l\'America è un paese.') && ok(SG.neg('g_londra'), 'No, Londra non è un paese.') && ok(SG.key('g_newyork'), 'Nuova York è una città'));
  check('8 sbagliato: «un città»', !ok(SG.present('g_roma'), 'Roma è un città.'));
  check('8 sbagliato: manca l\'articolo del paese', !ok(SG.present('g_italia'), 'Italia è un paese.'));
  check('8 sbagliato: categoria sbagliata', !ok(SG.key('g_parigi'), 'Parigi è un paese.'));
  check('9 giusto: «a» città, «in» paese', ok(SG.dKey('g_colosseo'), 'Il Colosseo è a Roma.') && ok(SG.dKey('g_colosseo'), 'Il Colosseo è in Italia.') && ok(SG.dKey('g_eiffel'), 'La Tour Eiffel è a Parigi.'));
  check('9 sbagliato: «in Roma»', !ok(SG.dKey('g_colosseo'), 'Il Colosseo è in Roma.'));
  check('9 sbagliato: «a Italia»', !ok(SG.dKey('g_colosseo'), 'Il Colosseo è a Italia.'));
  check('9 sbagliato: posto sbagliato', !ok(SG.dKey('g_bigben'), 'Il Big Ben è a Parigi.'));
  check('9 sbagliato: domanda ripetuta', !ok(SG.dAlt('g_bigben', 'roma'), SG.dAlt('g_bigben', 'roma').prompt));
  check('9 ripete «Dov\'è?»', ok(SG.dAskQ('g_muraglia'), 'Dov\'è?'));
  check('allievo 9: «Che cos\'è?»', evalAsk('g_colosseo', 'Che cos\'è?').kind === 'thing' && answerAsk('g_colosseo', { kind: 'thing' }) === 'È il Colosseo.');
  check('allievo 9', evalAsk('g_colosseo', 'Dov\'è il Colosseo?').kind === 'what' && evalAsk('g_colosseo', 'Il Colosseo è a Parigi?').kind === 'no' &&
    evalAsk('g_colosseo', 'Il Colosseo è in Roma?').model === 'Il Colosseo è a Roma?' && answerAsk('g_colosseo', { kind: 'no', ask: 'parigi' }) === 'No, il Colosseo non è a Parigi. Il Colosseo è a Roma.');
  check('allievo 8', evalAsk('g_roma', 'Che cosa è Roma?').kind === 'what' && evalAsk('g_roma', 'Roma è un paese?').kind === 'no' && answerAsk('g_roma', { kind: 'no' }) === 'No, Roma non è un paese. Roma è una città.');
  const stepPlaces = run('stepPlaces'), placeIsTrue = run('placeIsTrue');
  check('luoghi: domanda «o» mostra i due luoghi', stepPlaces(SG.dAlt('g_bigben', 'parigi')).slice().sort().join() === 'londra,parigi');
  check('luoghi: vero verde, falso rosso', placeIsTrue(SG.dKey('g_bigben'), 'londra') && placeIsTrue(SG.dKey('g_bigben'), 'inghilterra') && !placeIsTrue(SG.dKey('g_bigben'), 'parigi'));
  check('luoghi: solo nella lezione 9 (aiuto)', GEO_L.find(l => l.id === 'l9').placeHints && !GEO_L.find(l => l.id === 'l8').placeHints);
  check('luoghi: ogni città ha il suo puntino', ['roma', 'parigi', 'londra', 'newyork'].every(c => run('CITY_DOTS')[c]));
  GEO_L.forEach(l => {
    for (let n = 0; n < 20; n++) {
      const st = buildSteps(l);
      const models = st.filter(s => s.model && s.type !== 'reveal');
      if (n === 0) {
        check(l.id + ': tutte le risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
        check(l.id + ': ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
        check(l.id + ': lunghezza ragionevole', st.length < 100);
      }
      if (l.fresh && st.slice(0, st.findIndex(s => s.type === 'reveal')).some(s => s.show === l.fresh && /Cina/.test(s.prompt + s.model))) { check(l.id + ': il paese della Muraglia non si dice prima', false); break; }
      const first = st.findIndex(s => s.phase !== 'present');
      if (st.slice(1, first).some((s, i) => s.show === st[i].show)) { check(l.id + ': presentazione mai due di fila', false); break; }
    }
  });
}

// Lezione 10: «Il mio, la Sua» (il punto di vista si inverte)
{
  const SP = run('SP'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l10 = run('LESSONS').find(l => l.id === 'l10');
  check('lezione 10 c\'è', !!l10 && l10.poss);
  check('figure con il bollino', l10.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SP.yes('o_t_phone').prompt === 'È il mio telefono?' && SP.yes('o_t_phone').model === 'Sì, è il Suo telefono.' &&
    SP.yes('o_s_suitcase').model === 'Sì, è la mia valigia.' && SP.neg('o_t_phone').model === 'No, non è il mio telefono.' && SP.key('o_s_suitcase').prompt === 'Di chi è questa valigia?');
  check('giusto: punto di vista rovesciato', ok(SP.yes('o_t_phone'), 'Sì, è il Suo telefono.') && ok(SP.key('o_s_suitcase'), 'È la mia valigia.') && ok(SP.neg('o_t_phone'), 'No, non è il mio telefono.'));
  check('sbagliato: ripete il punto di vista dell\'insegnante', !ok(SP.yes('o_t_phone'), 'Sì, è il mio telefono.'));
  check('sbagliato: accordo «la mio valigia»', !ok(SP.yes('o_s_suitcase'), 'Sì, è la mio valigia.') && !ok(SP.key('o_t_laptop'), 'È il Sua portatile.'));
  check('sbagliato: «tua» invece di «Sua»', !ok(SP.key('o_t_laptop'), 'È il tuo portatile.'));
  check('ripete «Di chi è?»', ok(SP.askQ('o_t_phone'), 'Di chi è?'));
  check('allievo', evalAsk('o_t_phone', 'Di chi è questo telefono?').kind === 'what' && answerAsk('o_t_phone', { kind: 'what' }) === 'È il mio telefono.' &&
    evalAsk('o_t_phone', 'È il Suo telefono?').kind === 'yes' && evalAsk('o_s_bag', 'È la mio borsa?').model === 'È la mia borsa?');
  const st = buildSteps(l10), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 10: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 10: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('gesti: le sue cose → mano sul petto, quelle dello studente → lo indica', run('possPose')(SP.yes('o_t_phone')) === 'me' && run('possPose')(SP.yes('o_s_bag')) === 'you');
}

// Lezione 11: «Questo o questa? Piccolo o piccola?»
{
  const SZ = run('SZ'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l11 = run('LESSONS').find(l => l.id === 'l11');
  check('lezione 11 c\'è', !!l11 && l11.size);
  check('figure grandi e piccole', l11.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SZ.present('z_big_book').prompt === 'Questo libro è grande.' && SZ.yes('z_small_suitcase').prompt === 'Questa valigia è piccola?' &&
    SZ.neg('z_big_book').model === 'No, questo libro non è piccolo.' && SZ.key('z_big_suitcase').prompt === 'Com\'è questa valigia?' &&
    SZ.neg('z_big_cup').prompt === 'Questa tazza è piccola?' && SZ.neg('z_small_cup').prompt === 'Questa tazza è grande?');
  check('giusto', ok(SZ.yes('z_small_suitcase'), 'Sì, questa valigia è piccola.') && ok(SZ.key('z_big_book'), 'Questo libro è grande.') &&
    ok(SZ.neg('z_big_book'), 'No, questo libro non è piccolo.') && ok(SZ.alt('z_small_cup'), 'Questa tazza è piccola.'));
  check('sbagliato: «questa libro», «questo valigia»', !ok(SZ.key('z_big_book'), 'Questa libro è grande.') && !ok(SZ.key('z_big_suitcase'), 'Questo valigia è grande.'));
  check('sbagliato: «piccolo» con la valigia', !ok(SZ.yes('z_small_suitcase'), 'Sì, questa valigia è piccolo.'));
  check('sbagliato: grande e piccolo scambiati', !ok(SZ.key('z_small_book'), 'Questo libro è grande.'));
  check('ripete «Com\'è?»', ok(SZ.askQ('z_big_book'), 'Com\'è?'));
  check('allievo', evalAsk('z_big_book', 'Com\'è questo libro?').kind === 'what' && answerAsk('z_big_book', { kind: 'what' }) === 'Questo libro è grande.' &&
    evalAsk('z_small_cup', 'Questa tazza è grande?').kind === 'no' && answerAsk('z_small_cup', { kind: 'no', ask: 'big' }) === 'No, questa tazza non è grande. Questa tazza è piccola.' &&
    evalAsk('z_small_suitcase', 'Questa valigia è piccolo?').model === 'Questa valigia è piccola?');
  const st = buildSteps(l11), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 11: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 11: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 12: «Il suo, la sua» (le cose di Max e di Isa quando insegna Pietro)
{
  const SW = run('SW'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l12 = run('LESSONS').find(l => l.id === 'l12');
  check('lezione 12 c\'è', !!l12 && l12.third);
  check('figure con la faccia di chi lo possiede', l12.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SW.present('p3_f_phone').prompt === 'È il telefono di Isa.' && SW.yes('p3_m_bag').prompt === 'È la borsa di Max?' &&
    SW.yes('p3_m_bag').model === 'Sì, è la sua borsa.' && SW.yes('p3_f_phone').model === 'Sì, è il suo telefono.' &&
    SW.neg('p3_f_phone').prompt === 'È il telefono di Max?' && SW.neg('p3_f_phone').model === 'No, non è il suo telefono.' &&
    SW.key('p3_f_suitcase').prompt === 'Di chi è questa valigia?' && SW.key('p3_f_suitcase').model === 'È la valigia di Isa.');
  check('giusto', ok(SW.yes('p3_m_bag'), 'Sì, è la sua borsa.') && ok(SW.yes('p3_m_bag'), 'Sì, è la borsa di Max.') &&
    ok(SW.neg('p3_f_phone'), 'No, non è il suo telefono.') && ok(SW.key('p3_m_laptop'), 'È il portatile di Max.') && ok(SW.alt('p3_f_flask'), 'È la borraccia di Isa.'));
  check('sbagliato: «il sua», «la suo»', !ok(SW.yes('p3_f_phone'), 'Sì, è il sua telefono.') && !ok(SW.yes('p3_m_bag'), 'Sì, è la suo borsa.'));
  check('sbagliato: persona sbagliata', !ok(SW.key('p3_f_phone'), 'È il telefono di Max.') && !ok(SW.yes('p3_f_phone'), 'Sì, è il telefono di Max.'));
  check('sbagliato: «il mio», «il Suo» al posto di «il suo»... di lui', !ok(SW.yes('p3_m_laptop'), 'Sì, è il mio portatile.'));
  check('alla domanda chiave serve il nome', !ok(SW.key('p3_f_phone'), 'È il suo telefono.'));
  check('allievo', evalAsk('p3_f_phone', 'Di chi è questo telefono?').kind === 'what' && answerAsk('p3_f_phone', { kind: 'what' }) === 'È il telefono di Isa.' &&
    evalAsk('p3_f_phone', 'È il telefono di Max?').kind === 'no' && answerAsk('p3_f_phone', { kind: 'no', ask: 'm' }) === 'No, non è il suo telefono. È il telefono di Isa.' &&
    evalAsk('p3_m_bag', 'È il borsa di Max?').model === 'È la borsa di Max?');
  const st = buildSteps(l12), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 12: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 12: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 13: «Paese e nazionalità»
{
  const SN2 = run('SN2'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l13 = run('LESSONS').find(l => l.id === 'l13');
  check('lezione 13 c\'è', !!l13 && l13.nat);
  check('figure con la bandiera', l13.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SN2.present('n_m_italia').prompt === 'Questo signore è italiano.' && SN2.yes('n_f_america').prompt === 'Questa signora è americana?' &&
    SN2.neg('n_m_italia', 'francia').model === 'No, questo signore non è francese.' && SN2.key('n_m_cina').prompt === 'Di che nazionalità è questo signore?' &&
    SN2.present('n_f_francia').prompt === 'Questa signora è francese.');
  check('giusto', ok(SN2.yes('n_f_italia'), 'Sì, questa signora è italiana.') && ok(SN2.key('n_m_inghilterra'), 'Questo signore è inglese.') &&
    ok(SN2.neg('n_f_america', 'cina'), 'No, questa signora non è cinese.') && ok(SN2.alt('n_f_francia', 'italia'), 'Questa signora è francese.'));
  check('sbagliato: «questa signore», «questo signora»', !ok(SN2.key('n_m_cina'), 'Questa signore è cinese.') && !ok(SN2.key('n_f_america'), 'Questo signora è americana.'));
  check('sbagliato: «questa signora è italiano»', !ok(SN2.yes('n_f_italia'), 'Sì, questa signora è italiano.'));
  check('sbagliato: nazionalità sbagliata', !ok(SN2.key('n_m_italia'), 'Questo signore è francese.'));
  check('ripete «Di che nazionalità è?»', ok(SN2.askQ('n_m_italia'), 'Di che nazionalità è?'));
  check('allievo', evalAsk('n_m_cina', 'Di che nazionalità è questo signore?').kind === 'what' && answerAsk('n_m_cina', { kind: 'what' }) === 'Questo signore è cinese.' &&
    evalAsk('n_f_italia', 'Questa signora è francese?').kind === 'no' && answerAsk('n_f_italia', { kind: 'no', ask: 'francia' }) === 'No, questa signora non è francese. Questa signora è italiana.' &&
    evalAsk('n_f_america', 'Questa signora è americano?').model === 'Questa signora è americana?' &&
    evalAsk('n_m_italia', 'Questo signore è italiano o inglese?').kind === 'alt');
  const st = buildSteps(l13), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 13: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 13: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 14: «Il verbo essere» (insegna Pietro: «Io sono italiano.»)
{
  const SE = run('SE'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l14 = run('LESSONS').find(l => l.id === 'l14');
  check('lezione 14 c\'è', !!l14 && l14.ess);
  check('figure', l14.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SE.present('n_m_inghilterra').prompt === 'Lui è inglese.' && SE.yes('n_f_america').model === 'Sì, lei è americana.' &&
    SE.yes('e_me').prompt === 'Io sono italiano?' && SE.yes('e_me').model === 'Sì, Lei è italiano.' &&
    SE.neg('e_me', 'francia').model === 'No, Lei non è francese.' && SE.key('e_me').prompt === 'Di che nazionalità sono io?' &&
    SE.key('e_you').prompt === 'Di che nazionalità è Lei?');
  check('giusto', ok(SE.present('n_m_inghilterra'), 'Lui è inglese.') && ok(SE.yes('n_f_america'), 'Sì, è americana.') &&
    ok(SE.yes('e_me'), 'Sì, Lei è italiano.') && ok(SE.neg('e_me', 'cina'), 'No, Lei non è cinese.') && ok(SE.key('n_m_cina'), 'Lui è cinese.') &&
    ok(SE.key('e_me'), 'Lei è italiano.'));
  check('la sua nazionalità: qualunque, detta bene', ok(SE.key('e_you'), 'Io sono tedesca.') && ok(SE.key('e_you'), 'Sono giapponese.') && ok(SE.key('e_you'), 'Io sono americano.'));
  check('sbagliato: «io sono» detto dell\'insegnante', !ok(SE.yes('e_me'), 'Sì, io sono italiano.') && !ok(SE.key('e_me'), 'Io sono italiano.'));
  check('sbagliato: «lui sono», «tu sei», «Lei è» detto di sé', !ok(SE.key('n_m_cina'), 'Lui sono cinese.') && !ok(SE.key('e_me'), 'Tu sei italiano.') && !ok(SE.key('e_you'), 'Lei è tedesco.'));
  check('sbagliato: lui/lei scambiati, accordo, nazionalità', !ok(SE.key('n_m_cina'), 'Lei è cinese.') && !ok(SE.key('n_f_america'), 'Lei è americano.') && !ok(SE.key('n_m_inghilterra'), 'Lui è francese.'));
  check('allievo', evalAsk('e_me', 'Di che nazionalità è Lei?').kind === 'what' && answerAsk('e_me', { kind: 'what' }) === 'Io sono italiano.' &&
    evalAsk('e_me', 'Lei è francese?').kind === 'no' && answerAsk('e_me', { kind: 'no', ask: 'francia' }) === 'No, io non sono francese. Io sono italiano.' &&
    answerAsk('e_me', { kind: 'yes' }) === 'Sì, io sono italiano.');
  const st = buildSteps(l14), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 14: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 14: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('gesti: io → mano sul petto, Lei → indica l\'allievo', run('possPose')(SE.yes('e_me')) === 'me' && run('possPose')(SE.key('e_you')) === 'you' && run('possPose')(SE.yes('n_m_cina')) === null);
}

// Lezione 15: «Un altro, un'altra»
{
  const SA = run('SA'), buildDrill = run('buildDrill');
  const ok = (st, t) => evaluate(st, t).ok;
  const l15 = run('LESSONS').find(l => l.id === 'l15');
  check('lezione 15 c\'è', !!l15 && l15.altro);
  check('frasi', SA.present('phone_bianco', 'phone_nero').prompt === 'È un altro telefono.' && SA.present('phone_nero').prompt === 'È un telefono.' &&
    SA.yes('suitcase_rosso', 'suitcase_nero').model === 'Sì, è un\'altra valigia.' && SA.key('cup_rosso', 'cup_bianco').model === 'È un\'altra tazza.');
  check('giusto (anche «un altra» del microfono)', ok(SA.yes('suitcase_rosso', 'suitcase_nero'), 'Sì, è un altra valigia.') && ok(SA.key('phone_nero', 'phone_bianco'), 'È un altro telefono.') &&
    ok(SA.key('cup_rosso'), 'È una tazza.'));
  const n = SA.neg('phone_bianco', 'phone_nero');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «un altra telefono», «un altro valigia»', !ok(SA.key('phone_nero', 'phone_bianco'), 'È un altra telefono.') && !ok(SA.key('suitcase_nero', 'suitcase_rosso'), 'È un altro valigia.'));
  check('sbagliato: dimenticare «altro» quando c\'è il primo', !ok(SA.key('phone_nero', 'phone_bianco'), 'È un telefono.'));
  check('sbagliato: «altro» senza il primo', !ok(SA.key('phone_nero'), 'È un altro telefono.'));
  const st = buildSteps(l15), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 15: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 15: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('lezione 15: il primo è sempre l\'altro della coppia', st.filter(s => s.prev).every(s => s.prev.split('_')[0] === s.show.split('_')[0] && s.prev !== s.show));
}

// Lezione 16: «Un, una, un', uno»
{
  const S_ = run('S'), ok = (st, t) => evaluate(st, t).ok;
  check('frasi: un\'agenda, uno zaino, un ombrello', S_.present('agenda').prompt === 'È un\'agenda.' && S_.present('backpack').prompt === 'È uno zaino.' &&
    S_.present('umbrella').prompt === 'È un ombrello.' && S_.present('agenda', true).prompt === 'Questa è un\'agenda.' && S_.present('backpack', true).prompt === 'Questo è uno zaino.');
  check('giusto: «uno specchio», «un\'agenda» (anche «un agenda» del microfono)', ok(S_.yes('mirror'), 'Sì, è uno specchio.') && ok(S_.yes('agenda'), 'Sì, è un\'agenda.') && ok(S_.yes('agenda'), 'Sì, è un agenda.'));
  check('sbagliato: «un zaino», «una agenda», «uno ombrello»', !ok(S_.yes('backpack'), 'Sì, è un zaino.') && !ok(S_.yes('agenda'), 'Sì, è una agenda.') && !ok(S_.yes('umbrella'), 'Sì, è uno ombrello.'));
}

// Lezione 17: «Il, la, l', lo» (insegna Pietro: le cose di Max e di Isa)
{
  const SW = run('SW'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l17 = run('LESSONS').find(l => l.id === 'l17');
  check('lezione 17 c\'è', !!l17 && l17.third && l17.def);
  check('figure', l17.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi: lo, l\', il, la', SW.present('p3_m_backpack').prompt === 'È lo zaino di Max.' && SW.present('p3_m_agenda').prompt === 'È l\'agenda di Max.' &&
    SW.present('p3_f_umbrella').prompt === 'È l\'ombrello di Isa.' && SW.present('p3_f_book').prompt === 'È il libro di Isa.' && SW.present('p3_m_key').prompt === 'È la chiave di Max.' &&
    SW.yes('p3_f_mirror', true).model === 'Sì, è lo specchio di Isa.' && SW.neg('p3_m_backpack', true).model === 'No, non è lo zaino di Isa.');
  check('giusto (anche «l agenda» del microfono)', ok(SW.key('p3_m_agenda'), 'È l\'agenda di Max.') && ok(SW.key('p3_m_agenda'), 'È l agenda di Max.') &&
    ok(SW.yes('p3_m_backpack', true), 'Sì, è lo zaino di Max.') && ok(SW.yes('p3_m_backpack', true), 'Sì, è il suo zaino.'));
  check('sbagliato: «il zaino», «la agenda», «lo ombrello», «lo suo zaino»', !ok(SW.key('p3_m_backpack'), 'È il zaino di Max.') && !ok(SW.key('p3_m_agenda'), 'È la agenda di Max.') &&
    !ok(SW.key('p3_f_umbrella'), 'È lo ombrello di Isa.') && !ok(SW.yes('p3_m_backpack', true), 'Sì, è lo suo zaino.'));
  check('lezione 12 non cambia', SW.yes('p3_m_bag').model === 'Sì, è la sua borsa.' && SW.present('p3_f_phone').prompt === 'È il telefono di Isa.');
  const st = buildSteps(l17), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 17: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 17: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('lezione 17: risposte con il nome', st.filter(s => s.type === 'yes').every(s => / di (Max|Isa)\.$/.test(s.model)));
}

// Lezione 18: «Preposizioni articolate» (su, in)
{
  const SQ = run('SQ'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l18 = run('LESSONS').find(l => l.id === 'l18');
  check('lezione 18 c\'è', !!l18 && l18.prep);
  check('figure', l18.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi: sul, sulla, sull\', nel, nello, nella', SQ.present('q_book').prompt === 'Il libro è sul tavolo.' && SQ.present('q_phone').prompt === 'Il telefono è sulla sedia.' &&
    SQ.present('q_orange').prompt === 'L\'arancia è sull\'agenda.' && SQ.present('q_key').prompt === 'La chiave è nel cappotto.' &&
    SQ.present('q_pen').prompt === 'La penna è nello zaino.' && SQ.present('q_bottle').prompt === 'La bottiglia è nella borsa.' && SQ.key('q_book').prompt === 'Dov\'è il libro?');
  check('giusto (anche «È sul tavolo.», «sull agenda»)', ok(SQ.key('q_book'), 'Il libro è sul tavolo.') && ok(SQ.key('q_book'), 'È sul tavolo.') &&
    ok(SQ.yes('q_orange'), 'Sì, l\'arancia è sull\'agenda.') && ok(SQ.yes('q_orange'), 'Sì, è sull agenda.') && ok(SQ.key('q_pen'), 'La penna è nello zaino.'));
  check('sbagliato: «su il tavolo», «sullo tavolo», «nel borsa», «in la borsa»', !ok(SQ.key('q_book'), 'È su il tavolo.') && !ok(SQ.key('q_book'), 'È sullo tavolo.') &&
    !ok(SQ.key('q_bottle'), 'È nel borsa.') && !ok(SQ.key('q_bottle'), 'È in la borsa.'));
  check('sbagliato: il posto o la preposizione', !ok(SQ.key('q_book'), 'Il libro è sulla sedia.') && !ok(SQ.key('q_pen'), 'La penna è sullo zaino.') && !ok(SQ.key('q_book'), 'La libro è sul tavolo.'));
  check('ripete «Dov\'è?»', ok(SQ.askQ('q_book'), 'Dov\'è?'));
  check('allievo', evalAsk('q_book', 'Dov\'è il libro?').kind === 'what' && answerAsk('q_book', { kind: 'what' }) === 'Il libro è sul tavolo.' &&
    evalAsk('q_book', 'Il libro è sulla sedia?').kind === 'no' && evalAsk('q_book', 'Il libro è sul tavolo?').kind === 'yes' &&
    evalAsk('q_bottle', 'La bottiglia è nel borsa?').model === 'La bottiglia è nella borsa?');
  const st = buildSteps(l18), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 18: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 18: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 19: «Anche — neanche»
{
  const SH = run('SH'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l19 = run('LESSONS').find(l => l.id === 'l19');
  check('lezione 19 c\'è', !!l19 && l19.anche);
  check('frasi', SH.presentAnche('phone_nero', 'suitcase_nero').prompt === 'Il telefono è nero. Anche la valigia è nera.' &&
    SH.presentNeanche('phone_nero', 'suitcase_nero', 'rosso').prompt === 'Il telefono non è rosso. Neanche la valigia è rossa.' &&
    SH.yes('phone_nero', 'suitcase_nero').model === 'Sì, anche la valigia è nera.' && SH.neg('phone_nero', 'cup_bianco').model === 'No, la tazza non è nera.' &&
    SH.keyAnche('laptop_bianco', 'cup_bianco').prompt === 'Il portatile è bianco. E la tazza?' && SH.keyNeanche('coat_rosso', 'flask_rosso', 'nero').model === 'Neanche la borraccia è nera.');
  const kn = SH.keyNeanche('phone_nero', 'suitcase_nero', 'bianco');
  check('giusto: neanche, nemmeno, neppure', ok(kn, 'Neanche la valigia è bianca.') && ok(kn, 'Nemmeno la valigia è bianca.') && ok(kn, 'Neppure la valigia è bianca.'));
  check('giusto: anche', ok(SH.keyAnche('phone_nero', 'suitcase_nero'), 'Anche la valigia è nera.') && ok(SH.yes('phone_nero', 'suitcase_nero'), 'Sì, anche la valigia è nera.') &&
    ok(SH.neg('phone_nero', 'cup_bianco'), 'No, la tazza non è nera.') && ok(SH.keyDiff('phone_nero', 'cup_bianco'), 'La tazza è bianca.'));
  check('sbagliato: «anche… non è» al posto di «neanche»', !ok(kn, 'Anche la valigia non è bianca.') && !ok(kn, 'Neanche la valigia non è bianca.'));
  check('sbagliato: «anche» con un colore diverso, accordo', !ok(SH.keyDiff('phone_nero', 'cup_bianco'), 'Anche la tazza è nera.') && !ok(SH.keyAnche('phone_nero', 'suitcase_nero'), 'Anche la valigia è nero.'));
  check('sbagliato: senza «anche»', !ok(SH.keyAnche('phone_nero', 'suitcase_nero'), 'La valigia è nera.'));
  const st = buildSteps(l19), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 19: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 19: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('ripetizioni: la voce alterna «neanche» e «nemmeno»', (d => d.some(x => /^Neanche /.test(x.model)) && d.some(x => /^Nemmeno /.test(x.model)))(buildDrill(kn, 5, [])));
  check('lezione 19: il primo oggetto sempre sotto', st.filter(s => s.type !== 'ask').every(s => s.prev && s.prev !== s.show));
}

// Lezione 20: «Che ora è?»
{
  const SO = run('SO'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l20 = run('LESSONS').find(l => l.id === 'l20');
  check('lezione 20 c\'è', !!l20 && l20.ora);
  check('figure', l20.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SO.present('h1').prompt === 'È l\'una.' && SO.present('h3').prompt === 'Sono le tre.' && SO.yes('h10').model === 'Sì, sono le dieci.' &&
    /^Che (ora è|ore sono)\?$/.test(SO.key('h5').prompt));
  check('giusto (anche cifre e «Che ore sono?»)', ok(SO.key('h3'), 'Sono le tre.') && ok(SO.key('h3'), 'Sono le 3.') && ok(SO.key('h1'), 'È l\'una.') &&
    ok(SO.yes('h8'), 'Sì, sono le otto.') && ok(SO.askQ('h1'), 'Che ore sono?') && ok(SO.askQ('h1'), 'Che ora è?'));
  const n = SO.neg('h3');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «è le tre», «sono l\'una», «la una», ora sbagliata', !ok(SO.key('h3'), 'È le tre.') && !ok(SO.key('h1'), 'Sono l\'una.') &&
    !ok(SO.key('h1'), 'È la una.') && !ok(SO.key('h3'), 'Sono le due.'));
  check('allievo', evalAsk('h3', 'Che ora è?').kind === 'what' && answerAsk('h3', { kind: 'what' }) === 'Sono le tre.' && evalAsk('h3', 'Sono le cinque?').kind === 'no' &&
    answerAsk('h3', { kind: 'no', ask: 5 }) === 'No, non sono le cinque. Sono le tre.' && evalAsk('h3', 'È le tre?').model === 'Sono le tre?');
  const st = buildSteps(l20), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 20: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 20: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
  check('mezzogiorno e mezzanotte', SO.present('h12d').prompt === 'È mezzogiorno.' && SO.present('h12n').prompt === 'È mezzanotte.' &&
    ok(SO.key('h12d'), 'È mezzogiorno.') && !ok(SO.key('h12d'), 'Sono mezzogiorno.') && !ok(SO.key('h12d'), 'È mezzanotte.') && !ok(SO.key('h12n'), 'È il mezzanotte.'));
  check('«Che ore sono?» anche dall\'insegnante', [...Array(30)].some(() => SO.key('h3').prompt === 'Che ore sono?') && SO.askQ('h3', 'Che ore sono?').model === 'Che ore sono?');
  check('la lezione mette in evidenza «è» e «sono»', l20.hilite.join() === 'è,sono');
  check('lezione 20: domanda «o» con l\'una detta bene', [1, 2, 3, 4, 5, 6, 7, 8].map(() => SO.alt('h1').prompt).every(p => /^È l'una o (sono le [a-z]+|mezzogiorno|mezzanotte)\?$|^Sono le [a-z]+ o è l'una\?$|^È (mezzogiorno|mezzanotte) o l'una\?$/.test(p)));
}

// Lezione 21: «A che ora?»
{
  const SA2 = run('SA2'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l21 = run('LESSONS').find(l => l.id === 'l21');
  check('lezione 21 c\'è', !!l21 && l21.appt);
  check('figure', l21.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SA2.present('a_plane').prompt === 'L\'aereo è alle tre.' && SA2.present('a_lunch').prompt === 'Il pranzo è all\'una.' &&
    SA2.key('a_dinner').prompt === 'A che ora è la cena?' && SA2.yes('a_meeting').model === 'Sì, la riunione è alle nove.');
  check('giusto (anche breve e con le cifre)', ok(SA2.key('a_dinner'), 'La cena è alle otto.') && ok(SA2.key('a_dinner'), 'Alle otto.') && ok(SA2.key('a_dinner'), 'Alle 8.') &&
    ok(SA2.key('a_lunch'), 'Il pranzo è all\'una.') && ok(SA2.key('a_plane'), 'L\'aereo è alle tre.'));
  const n = SA2.neg('a_taxi');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «alla tre», «alle una», «a le tre», ora sbagliata', !ok(SA2.key('a_plane'), 'L\'aereo è alla tre.') && !ok(SA2.key('a_lunch'), 'Il pranzo è alle una.') &&
    !ok(SA2.key('a_plane'), 'È a le tre.') && !ok(SA2.key('a_plane'), 'L\'aereo è alle cinque.') && !ok(SA2.key('a_dinner'), 'Il cena è alle otto.'));
  check('ripete «A che ora è?»', ok(SA2.askQ('a_plane'), 'A che ora è?'));
  check('allievo', evalAsk('a_dinner', 'A che ora è la cena?').kind === 'what' && answerAsk('a_dinner', { kind: 'what' }) === 'La cena è alle otto.' &&
    evalAsk('a_dinner', 'La cena è alle sette?').kind === 'no' && evalAsk('a_lunch', 'Il pranzo è alle una?').model === 'Il pranzo è all\'una?');
  const st = buildSteps(l21), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 21: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 21: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 22: «Il, la o l'?» (lezione dei colori con parole che vogliono l')
{
  const SC = run('SC'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l22 = run('LESSONS').find(l => l.id === 'l22');
  check('lezione 22 c\'è', !!l22 && l22.colors && l22.gender);
  check('figure', l22.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi con l\'', SC.present('umbrella_nero').prompt === 'L\'ombrello è nero.' && SC.present('agenda_nero').prompt === 'L\'agenda è nera.' &&
    SC.present('label_rosso').prompt === 'L\'etichetta è rossa.' && SC.present('ambulance_bianco').prompt === 'L\'ambulanza è bianca.' &&
    SC.key('plane_bianco').prompt === 'Di che colore è l\'aereo?' && SC.present('clock_bianco').prompt === 'L\'orologio è bianco.');
  check('giusto (anche «l agenda» del microfono)', ok(SC.key('agenda_nero'), 'L\'agenda è nera.') && ok(SC.key('agenda_nero'), 'L agenda è nera.') && ok(SC.yes('plane_bianco'), 'Sì, l\'aereo è bianco.'));
  check('sbagliato: «lo ombrello», «la agenda», «il aereo»', !ok(SC.key('umbrella_nero'), 'Lo ombrello è nero.') && !ok(SC.key('agenda_nero'), 'La agenda è nera.') && !ok(SC.key('plane_bianco'), 'Il aereo è bianco.'));
  check('sbagliato: accordo «l\'agenda è nero», «l\'aereo è bianca»', !ok(SC.key('agenda_nero'), 'L\'agenda è nero.') && !ok(SC.key('plane_bianco'), 'L\'aereo è bianca.'));
  check('parole con -o / -a in evidenza', (w => ['ombrello', 'orologio', 'aereo', 'agenda', 'etichetta', 'ambulanza', 'nero', 'nera'].every(x => w.indexOf(x) !== -1))(run('genderWords')(l22)));
  check('lezioni 5 e 19 non cambiano', SC.present('phone_nero').prompt === 'Il telefono è nero.' && SC.present('suitcase_nero').prompt === 'La valigia è nera.');
  const st = buildSteps(l22), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 22: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 22: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 23: «Cosa fa…?» (verbi al presente, con i due colleghi della lezione 12)
{
  const SV = run('SV'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l23 = run('LESSONS').find(l => l.id === 'l23');
  check('lezione 23 c\'è', !!l23 && l23.verbs);
  check('figure', l23.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('frasi', SV.present('v_m_read').prompt === M + ' legge un libro.' && SV.present('v_f_drink').prompt === F + ' beve un\'aranciata.' &&
    SV.present('v_f_phone').prompt === F + ' telefona.' && SV.key('v_f_close').prompt === 'Cosa fa ' + F + '?' && SV.yes('v_m_open').model === 'Sì, ' + M + ' apre la porta.');
  check('giusto (anche breve, con lui/lei, «il libro»)', ok(SV.key('v_m_read'), M + ' legge un libro.') && ok(SV.key('v_m_read'), 'Legge un libro.') && ok(SV.key('v_m_read'), 'Lui legge il libro.') &&
    ok(SV.key('v_f_phone'), 'Lei telefona.') && ok(SV.key('v_m_eat'), M + ' mangia un arancia') && ok(SV.key('v_f_close'), 'Chiude la finestra.'));
  const n = SV.neg('v_m_open');
  check('giusto: il no', ok(n, n.model) && ok(n, 'No, non ' + run('vDoes')(n.ask) + '.'));
  check('sbagliato: forma del verbo, verbo, persona, articolo', !ok(SV.key('v_m_read'), M + ' leggo un libro.') && !ok(SV.key('v_m_read'), M + ' leggere un libro.') &&
    !ok(SV.key('v_m_read'), M + ' apre la porta.') && !ok(SV.key('v_m_read'), F + ' legge un libro.') && !ok(SV.key('v_m_read'), 'Lei legge un libro.') &&
    !ok(SV.key('v_m_open'), M + ' apre la finestra.') && !ok(SV.key('v_m_open'), M + ' apre il porta.'));
  check('ripete «Cosa fa…?» (anche «Che cosa fa…?»)', ok(SV.askQ('v_m_read'), 'Cosa fa ' + M + '?') && ok(SV.askQ('v_m_read'), 'Che cosa fa ' + M + '?') && !ok(SV.askQ('v_m_read'), 'Cosa fa ' + F + '?'));
  check('allievo', evalAsk('v_f_drink', 'Cosa fa ' + F + '?').kind === 'what' && answerAsk('v_f_drink', { kind: 'what' }) === F + ' beve un\'aranciata.' &&
    evalAsk('v_f_drink', F + ' telefona?').kind === 'no' && answerAsk('v_f_drink', { kind: 'no', ask: 'phone' }) === 'No, ' + F + ' non telefona. ' + F + ' beve un\'aranciata.' &&
    evalAsk('v_m_read', M + ' legge un libro?').kind === 'yes' && evalAsk('v_m_read', M + ' leggo un libro?').model === M + ' legge un libro?');
  check('«il telefono» non è il verbo', run('verbStatements')(run('norm')('è il telefono')).length === 0);
  const st = buildSteps(l23), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 23: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 23: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 24: «Perché? Per…»
{
  const SP = run('SPU'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l24 = run('LESSONS').find(l => l.id === 'l24');
  check('lezione 24 c\'è', !!l24 && l24.purp);
  check('figure', l24.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('frasi', SP.present('pp_m_book').prompt === M + ' prende il libro per leggere.' && SP.present('pp_m_key').prompt === M + ' prende la chiave per aprire la porta.' &&
    SP.present('pp_m_orange').prompt === M + ' prende l\'arancia per mangiare.' && SP.key('pp_f_pen').prompt === 'Perché ' + F + ' prende la penna?' && SP.key('pp_f_pen').model === 'Per scrivere.');
  check('giusto (breve e intera)', ok(SP.key('pp_f_soda'), 'Per bere.') && ok(SP.key('pp_f_soda'), F + ' prende l\'aranciata per bere.') && ok(SP.key('pp_m_key'), 'Per aprire la porta.') &&
    ok(SP.key('pp_m_key'), 'Per aprire.') && ok(SP.yes('pp_m_book'), 'Sì, per leggere.'));
  const n = SP.neg('pp_m_book');
  check('giusto: il no (anche «No, per leggere.»)', ok(n, n.model) && ok(n, 'No, per leggere.') && !ok(n, 'No, per ' + run('P_INF')[n.ask] + '.'));
  check('sbagliato: «per legge», «perché leggere», scopo, persona, «prendo»', !ok(SP.key('pp_m_book'), 'Per legge.') && !ok(SP.key('pp_m_book'), 'Perché leggere.') &&
    !ok(SP.key('pp_m_book'), 'Per leggo.') && !ok(SP.key('pp_m_book'), 'Per mangiare.') && !ok(SP.key('pp_m_book'), F + ' prende il libro per leggere.') &&
    !ok(SP.key('pp_m_book'), M + ' prendo il libro per leggere.') && !ok(SP.key('pp_m_key'), 'Per aprire la finestra.'));
  check('ripete «Perché…?»', ok(SP.askQ('pp_m_book'), 'Perché ' + M + ' prende il libro?') && !ok(SP.askQ('pp_m_book'), 'Per leggere.'));
  check('allievo', evalAsk('pp_f_phone', 'Perché ' + F + ' prende il telefono?').kind === 'what' && answerAsk('pp_f_phone', { kind: 'what' }) === 'Per telefonare.' &&
    evalAsk('pp_f_phone', F + ' prende il telefono per bere?').kind === 'no' && answerAsk('pp_f_phone', { kind: 'no', ask: 'drink' }) === 'No, ' + F + ' non prende il telefono per bere. Per telefonare.' &&
    evalAsk('pp_m_book', M + ' prende il libro per legge?').model === M + ' prende il libro per leggere?');
  check('lezione 23 non cambia', run('SV').present('v_m_read').prompt === M + ' legge un libro.' && run('Object.keys(ACTS)').indexOf('write') === -1);
  const st = buildSteps(l24), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 24: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 24: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 25: «Lo prendo — la prendo», «Non la chiude!»
{
  const SL = run('SLD'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l25 = run('LESSONS').find(l => l.id === 'l25');
  check('lezione 25 c\'è', !!l25 && l25.pron);
  check('figure', l25.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('frasi', SL.present('ld_m_book').prompt === M + ' legge il libro.' && SL.yes('ld_f_window').model === 'Sì, la chiude.' && SL.yes('ld_m_orange').model === 'Sì, la mangia.' &&
    SL.key('ld_m_notebook').prompt === 'Cosa fa ' + M + ' con il quaderno?' && SL.key('ld_m_notebook').model === 'Lo prende.' && SL.key('ld_m_orange').prompt === 'Cosa fa ' + M + ' con l\'arancia?' &&
    SL.neg('ld_m_book').prompt === F + ' legge il libro?' && SL.neg('ld_m_book').model === 'No, non lo legge.');
  check('giusto', ok(SL.yes('ld_m_book'), 'Sì, lo legge.') && ok(SL.yes('ld_m_book'), 'Sì, ' + M + ' lo legge.') && ok(SL.key('ld_f_soda'), 'La beve.') &&
    ok(SL.neg('ld_f_phone'), 'No, non lo prende.') && ok(SL.neg('ld_f_phone'), 'No, ' + M + ' non lo prende.') && ok(SL.present('ld_m_orange'), M + ' mangia l\'arancia.'));
  check('sbagliato: pronome, posto, forma, cosa ripetuta', !ok(SL.yes('ld_m_book'), 'Sì, la legge.') && !ok(SL.yes('ld_m_book'), 'Sì, legge lo.') &&
    !ok(SL.yes('ld_m_book'), 'Sì, lo leggo.') && !ok(SL.yes('ld_m_book'), 'Sì, legge il libro.') && !ok(SL.key('ld_f_window'), 'Lo chiude.') && !ok(SL.key('ld_f_window'), 'La apre.') &&
    !ok(SL.neg('ld_f_phone'), 'No, non la prende.') && !ok(SL.neg('ld_f_phone'), 'Sì, lo prende.'));
  check('ripete «Cosa fa … con …?»', ok(SL.askQ('ld_m_book'), 'Cosa fa ' + M + ' con il libro?') && !ok(SL.askQ('ld_m_book'), 'Lo legge.'));
  check('allievo', evalAsk('ld_f_window', 'Cosa fa ' + F + ' con la finestra?').kind === 'what' && answerAsk('ld_f_window', { kind: 'what' }) === 'La chiude.' &&
    evalAsk('ld_m_book', M + ' legge il libro?').kind === 'yes' && answerAsk('ld_m_book', { kind: 'yes' }) === 'Sì, lo legge.' &&
    evalAsk('ld_m_book', F + ' legge il libro?').kind === 'no' && answerAsk('ld_m_book', { kind: 'no', ask: 'f' }) === 'No, ' + F + ' non lo legge. ' + M + ' lo legge.' &&
    evalAsk('ld_m_book', M + ' leggo il libro?').model === M + ' legge il libro?');
  check('-o / -a in colore anche in «lo» e «la»', (w => ['libro', 'finestra', 'lo', 'la'].every(x => w.indexOf(x) !== -1))(run('genderWords')(l25)));
  const st = buildSteps(l25), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 25: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 25: ripetizioni giuste', models.every(s => buildDrill(s, 5, []).every(d => evaluate(d, d.model).ok)));
}

// Parole che vanno bene tutte e due (COURSE.synonyms): il microfono le accetta tutte e due
{
  const norm = run('norm'), S_ = run('S'), evalAsk = run('evalAsk');
  check('«Cos\'è?» = «Che cos\'è?», «oppure» = «o»', norm('Cos\'è?') === norm('Che cos\'è?') && norm('Cosa è?') === norm('Che cosa è?') && norm('un libro oppure un tavolo') === norm('un libro o un tavolo'));
  check('l\'allievo può chiedere «Cos\'è?» e «… oppure …?»', evalAsk('chair', 'Cos\'è?').ok && evalAsk('chair', 'È un tavolo oppure una sedia?').ok);
  check('ripetere «Cos\'è?» va bene', evaluate(S_.askQ('pen'), 'Cos\'è?').ok);
  check('elenco delle coppie', run('COURSE').synonyms.length >= 4 && run('COURSE').synonyms.every(p => p.length === 2 || p.length === 3));
}

// Lingua dello studente: ogni scritta c'è in tutte le lingue, con gli stessi segnaposto {…}
{
  const T = run('UI_TEXT'), langs = Object.keys(T), keys = Object.keys(T.en);
  const ph = (x) => (x.match(/\{\w+\}/g) || []).sort().join();
  langs.forEach(l => {
    check('lingua ' + l + ': tutte le scritte', keys.every(k => typeof T[l][k] === 'string' && T[l][k].length) && Object.keys(T[l]).length === keys.length);
    check('lingua ' + l + ': stessi segnaposto', keys.every(k => ph(T[l][k]) === ph(T.en[k])));
  });
  check('il corso offre lingue che esistono', run('COURSE').students.every(l => T[l] && run('UI_LANGS')[l]));
  run('setUiLang("de")');
  check('tx con segnaposto', run('tx("practice", { i: 2, n: 5 })') === 'Übung 2 / 5');
  run('setUiLang("xx")');
  check('lingua sconosciuta → inglese', run('tx("talk")') === 'Talk');
}

console.log(count - fails + ' / ' + count + ' test passati');
process.exit(fails ? 1 : 0);
