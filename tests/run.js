'use strict';
// Test della logica pura: node tests/run.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course.js', 'data.js', 'logic.js', 'colors_it.js', 'ui_lang.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate');
const evaluateAll = run('evaluateAll');
const buildSteps = run('buildSteps');
const answerSteps = run('answerSteps');
const LESSONS = run('LESSONS').filter(l => !l.colors);   // lezioni con gli oggetti (i colori hanno i loro test)
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
check('parola sconosciuta → «Che cos\'è?»', (r => !r.ok && r.model === "Che cos'è?")(evalAsk('chair', 'È un ombrello?')));
check('domanda corretta suggerita è accettata', evalAsk('chair', 'È un tavolo?').ok);
check('alternativa con articolo sbagliato → si corregge', (r => !r.ok && r.model === 'È un tavolo o una sedia?')(evalAsk('chair', 'È una tavolo o una sedia?')));
check('alternativa con la stessa parola due volte → no', !evalAsk('chair', 'È un tavolo o un tavolo?').ok);
check('alternativa con parola sconosciuta → no', !evalAsk('chair', 'È un tavolo o un ombrello?').ok);
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
          if (!(st.type === 'echo' && st.check === 'question') && x.model.indexOf(word) === -1) check('drill gira intorno a «' + word + '»: ' + x.model, false);
          // prima dello sfogo il nome dell'oggetto nuovo non si dice mai
          if (i < reveal && (x.prompt + x.model).indexOf(ITEMS[l.fresh].word) !== -1) check('drill non svela l\'oggetto nuovo', false);
        });
        if (n >= 2 && !(st.type === 'echo' && st.check === 'question') && d[1].prompt === d[0].prompt) check('drill: la seconda è diversa dalla prima', false);
        if (n >= 3 && !(st.type === 'echo' && st.check === 'question') && new Set(d.map(x => x.type)).size < 2) check('drill variato', false);
      }
    });
  }
});
count++;

// 3b2. Presentazione: primo giro «Questo è un libro.», secondo «È un libro.»
LESSONS.forEach(l => {
  const p = buildSteps(l).filter(s => s.phase === 'present').slice(0, l.known.length * 2);
  check(l.id + ': presentazione con questo/questa', p.slice(0, l.known.length).every(s => /^Quest[oa] è /.test(s.prompt) && s.prompt.startsWith(ITEMS[s.show].art === 'una' ? 'Questa' : 'Questo')) &&
    p.slice(l.known.length).every(s => /^È /.test(s.prompt)));
  check(l.id + ': domande senza «questo» nelle lezioni che non lo insegnano', l.questo || buildSteps(l).every(s => !/^È quest/.test(s.prompt)));
});
// 3b3. Presentazione di tutti gli oggetti prima della prima domanda: ognuno 2 o 3 volte
const presCount = (st) => { const first = st.findIndex(s => s.phase !== 'present'), c = {}; st.slice(0, first).forEach(s => { c[s.show] = (c[s.show] || 0) + 1; }); return c; };
LESSONS.forEach(l => {
  const st = buildSteps(l), c = presCount(st);
  check(l.id + ': ogni oggetto presentato 2 o 3 volte prima delle domande', l.known.every(k => c[k] === 2 || c[k] === 3) && Object.keys(c).length === l.known.length);
  check(l.id + ': primo giro in ordine con «Questo/Questa»', st.slice(0, l.known.length).map(s => s.show).join() === l.known.join() && st.slice(0, l.known.length).every(s => /^Quest/.test(s.prompt)));
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
  for (let n = 0; n < 2000; n++) { const c = presCount(buildSteps(l)); Object.keys(c).forEach(k => { all++; if (c[k] === 2) two++; }); }
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
Object.keys(TEACHERS).forEach(k => check('insegnante ' + k, TEACHERS[k].key === k && TEACHERS[k].praise.length > 0 && TEACHERS[k].repeats.length > 0 && MARKS[TEACHERS[k].mark]));
check('ripetizioni: massimo 5, mai tutte uguali', Object.keys(TEACHERS).every(k => TEACHERS[k].repeats.every(n => n >= 1 && n <= 5) && new Set(TEACHERS[k].repeats).size > 1));
check('dal più rigido al più indulgente', ['mass', 'giulia', 'luca', 'sara'].map(k => TEACHERS[k].repeats.reduce((a, b) => a + b, 0)).every((v, i, a) => !i || v <= a[i - 1]));
check('parole dell\'errore', ['mass', 'giulia', 'luca', 'sara'].map(k => TEACHERS[k].wrong).join('|') === 'Errato.|Non corretto.|Hai sbagliato.|Peccato.');

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
