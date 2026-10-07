'use strict';
// Test della logica pura: node tests/run.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console: console };
vm.createContext(ctx);
['course.js', 'data.js', 'logic.js', 'colors_it.js', 'numbers_it.js', 'geo_fig.js', 'geo_it.js', 'poss_it.js', 'size_it.js', 'third_it.js', 'nat_it.js', 'essere_it.js', 'altro_it.js', 'prep_it.js', 'anche_it.js', 'ora_it.js', 'appt_it.js', 'gender_it.js', 'verbs_it.js', 'perche_it.js', 'pron_it.js', 'sum_it.js', 'km_it.js', 'fam_it.js', 'avere_it.js', 'gen_it.js', 'plur_it.js', 'cece_it.js', 'costa_it.js', 'det_it.js', 'irr_it.js', 'test_it.js', 'contr_it.js', 'stare_it.js', 'celha_it.js', 'imper_it.js', 'qual_it.js', 'ne_it.js', 'passato_it.js', 'lho_it.js', 'ci_it.js', 'saluti_it.js', 'lui_it.js', 'giorni_it.js', 'mesi_it.js', 'suoi_it.js', 'loro_it.js', 'noi_it.js', 'dare_it.js', 'qualc_it.js', 'bigl_it.js', 'lile_it.js', 'chiama_it.js', 'tempi_it.js', 'liha_it.js', 'contr2_it.js', 'colaz_it.js', 'quale_it.js', 'fiori_it.js', 'nehai_it.js', 'rifl_it.js', 'gia_it.js', 'volere_it.js', 'potere_it.js', 'ancora_it.js', 'telef_it.js', 'dove_it.js', 'mici_it.js', 'essere2_it.js', 'visto_it.js', 'forme_it.js', 'lingua_it.js', 'parlacon_it.js', 'fatto_it.js', 'civuole_it.js', 'piace_it.js', 'stagioni_it.js', 'tempofa_it.js', 'ripasso_it.js', 'ui_lang.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
});
const run = (code) => vm.runInContext(code, ctx);
const evaluate = run('evaluate');
const evaluateAll = run('evaluateAll');
const buildSteps = run('buildSteps');
const answerSteps = run('answerSteps');
const LESSONS = run('LESSONS').filter(l => !l.colors && !l.numbers && !l.geo && !l.poss && !l.size && !l.third && !l.nat && !l.ess && !l.altro && !l.prep && !l.anche && !l.ora && !l.appt && !l.verbs && !l.purp && !l.pron && !l.sum && !l.km && !l.fam && !l.ea && !l.pl && !l.ce && !l.co && !l.dt && !l.ct && !l.sta && !l.cl && !l.imp && !l.qd && !l.ne && !l.ps && !l.lh && !l.cv && !l.sa && !l.lm && !l.gd && !l.ms && !l.sp && !l.lo && !l.nv && !l.da && !l.qn && !l.bv && !l.lp && !l.cm && !l.tv && !l.lq && !l.cz && !l.qu && !l.fi && !l.nh && !l.rf && !l.gn && !l.vo && !l.po && !l.dv && !l.an && !l.tl && !l.dvp && !l.mc && !l.pe && !l.vi && !l.fu && !l.ge && !l.lg && !l.pc && !l.md && !l.cu && !l.pi && !l.sg && !l.tf && !l.ipf && !l.test);   // lezioni con gli oggetti (colori e numeri hanno i loro test)
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
        const d = buildDrill(st, n, st.reviewItems || items);
        if (d.length !== n) check('drill lunghezza ' + n, false);
        if (st.review) { if (!d.every(x => evaluate(x, x.model).ok)) check('ripasso: drill accettato', false); continue; }
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
      check('lezione 5: ripetizioni giuste', st.filter(s => s.col && s.model && s.type !== 'reveal').every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
      check('lezione 5: domande dell\'allievo', st.filter(s => s.type === 'ask').length === 7);
    }
    check('lezione 5 (giro ' + n + '): niente domanda impossibile', st.every(s => s.type !== 'neg' || s.ask !== s.show.split('_')[1]));
  }
}

// Lezioni dei numeri: «Che numero è?»
{
  const S = run('S'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), isEcho = run('isEcho');
  const ok = (st, t) => evaluate(st, t).ok;
  check('lezioni dei numeri ci sono (1–10 e poi solo 26 e 27)', NUM_LESSONS.map(l => l.id).join() === 'l6,l7,l26,l27');
  check('cartellini 1–20 e decine', [...Array(20)].every((x, i) => FIG['n' + (i + 1)]) && [30, 40, 50, 60, 70, 80, 90, 100].every(n => FIG['n' + n]));
  check('lezione 26: undici… venti', S.present('n11').prompt === 'È il numero undici.' && S.reveal('n20').prompt === 'Che numero è? È il numero venti.' && S.present('n17').prompt === 'È il numero diciassette.');
  check('lezione 26: cifre del microfono e forme corte', ok(S.key('n14'), 'è il numero 14') && ok(S.key('n11'), 'È l\'undici.') && ok(S.key('n13'), 'È il tredici.') &&
    !ok(S.key('n13'), 'È il numero tre.') && !ok(S.key('n16'), 'è il 6') && ok(S.yes('n15'), 'sì è il 15') && ok(S.key('n17'), 'È il diciasette.') && !ok(S.key('n18'), 'È l\'otto.'));
  check('lezione 27: le decine', S.present('n30').prompt === 'È il numero trenta.' && S.reveal('n100').prompt === 'Che numero è? È il numero cento.' &&
    ok(S.key('n40'), 'è il numero 40') && ok(S.key('n13'), 'è il 13') && !ok(S.key('n30'), 'È il tredici.') && !ok(S.key('n14'), 'è il 40') && ok(S.key('n60'), 'È il sessanta.') &&
    run('numDigits')('il 100') === 'il  cento ' && ok(S.key('n80'), 'È l\'ottanta.') && ok(S.key('n90'), 'è il 90') && ok(S.key('n100'), 'è il numero 100'));
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
        check(l.id + ': ripetizioni giuste', st.filter(s => s.model && s.type !== 'reveal').every(s => buildDrill(s, 5, s.reviewItems || l.known.concat(l.review || [], [l.fresh])).every(d => evaluate(d, d.model).ok)));
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
        check(l.id + ': ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 10: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 11: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 12: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 13: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 14: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 15: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 17: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 18: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 19: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 20: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 21: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 22: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 23: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 24: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
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
  check('lezione 25: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 28: «Quanto fa…?» con le centinaia
{
  const SM = run('SSM'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l28 = run('LESSONS').find(l => l.id === 'l28');
  check('lezione 28 c\'è', !!l28 && l28.sum);
  check('figure', l28.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('numeri in parole', ['ventuno', 'ventitré', 'trentotto', 'cento', 'duecentocinquanta', 'mille'].join() === [21, 23, 38, 100, 250, 1000].map(n => run('numWord(' + n + ')')).join());
  check('frasi', SM.present('sm_20_8').prompt === 'Venti più otto fa ventotto.' && SM.present('sm_20_1').prompt === 'Venti più uno fa ventuno.' &&
    SM.present('sm_20_3').prompt === 'Venti più tre fa ventitré.' && SM.key('sm_30_8').model === 'Fa trentotto.' && SM.present('sm_100_100').prompt === 'Cento più cento fa duecento.' &&
    SM.key('sm_500_500').prompt === 'Quanto fa cinquecento più cinquecento?' && SM.key('sm_500_500').model === 'Fa mille.');
  check('la radice e l\'unità (vent(i)otto)', JSON.stringify(run('numParts')('ventotto')) === '[["vent","r"],["i","cut"],["otto","u"]]' &&
    JSON.stringify(run('numParts')('ventidue')) === '[["venti","r"],["due","u"]]' && run('numParts')('venti') === null && run('numParts')('tredici') === null &&
    JSON.stringify(run('numParts')('duecentoventi')) === '[["duecento","r"],["venti","u"]]');
  check('giusto (breve, intera, cifre e «+»)', ok(SM.key('sm_20_8'), 'Fa ventotto.') && ok(SM.key('sm_20_8'), 'Venti più otto fa ventotto.') && ok(SM.key('sm_20_8'), '20 + 8 fa 28') &&
    ok(SM.key('sm_20_3'), 'Fa ventitre.') && ok(SM.key('sm_100_100'), 'Fa 200.') && ok(SM.key('sm_300_200'), 'Duecento più trecento fa cinquecento.') && ok(SM.askQ('sm_20_8'), 'Quanto fa 20 + 8?'));
  const n = SM.neg('sm_40_5');
  check('giusto: il no', ok(n, n.model) && ok(n, 'No, non fa ' + run('numWord')(n.ask) + ', fa quarantacinque.'));
  check('sbagliato: «ventiotto», «ventiuno», risultato, «è», «fanno»', !ok(SM.key('sm_20_8'), 'Fa ventiotto.') && !ok(SM.key('sm_20_1'), 'Fa ventiuno.') &&
    !ok(SM.key('sm_20_8'), 'Fa ventisette.') && !ok(SM.key('sm_100_100'), 'È duecento.') && !ok(SM.key('sm_100_100'), 'Fanno duecento.') &&
    !ok(SM.key('sm_100_100'), 'Cento più duecento fa duecento.') && !ok(SM.yes('sm_100_100'), 'Fa duecento.'));
  check('allievo', evalAsk('sm_300_200', 'Quanto fa trecento più duecento?').kind === 'what' && answerAsk('sm_300_200', { kind: 'what' }) === 'Fa cinquecento.' &&
    evalAsk('sm_300_200', 'Trecento più duecento fa seicento?').kind === 'no' && answerAsk('sm_300_200', { kind: 'no', ask: 600 }) === 'No, non fa seicento. Fa cinquecento.' &&
    evalAsk('sm_300_200', 'Trecento più duecento è cinquecento?').model === 'Trecento più duecento fa cinquecento?');
  const st = buildSteps(l28), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 28: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 28: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  check('lezione 28: lunghezza', st.length < 115);
}

// Lezione 29: «Quanti chilometri ci sono…?»
{
  const SK = run('SKM'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l32 = run('LESSONS').find(l => l.id === 'l29');
  check('lezione 29 c\'è', !!l32 && l32.km);
  check('figure', l32.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SK.present('km_roma_milano').prompt === 'Da Roma a Milano ci sono cinquecentosettanta chilometri.' &&
    SK.key('km_milano_torino').prompt === 'Quanti chilometri ci sono da Milano a Torino?' && SK.key('km_milano_torino').model === 'Ci sono centoquaranta chilometri.' &&
    SK.yes('km_firenze_bologna').model === 'Sì, ci sono cento chilometri.');
  check('giusto (breve, cifre, «km», due parole)', ok(SK.key('km_roma_milano'), 'Ci sono cinquecentosettanta chilometri.') && ok(SK.key('km_roma_milano'), 'Cinquecentosettanta chilometri.') &&
    ok(SK.key('km_roma_milano'), 'ci sono 570 km') && ok(SK.key('km_roma_milano'), 'Ci sono cinquecento settanta chilometri.') &&
    ok(SK.key('km_roma_napoli'), 'Da Napoli a Roma ci sono duecentoventi chilometri.'));
  const n = SK.neg('km_roma_venezia');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: numero, «c\'è», città', !ok(SK.key('km_roma_milano'), 'Ci sono cinquecento chilometri.') && !ok(SK.key('km_roma_milano'), 'C\'è cinquecentosettanta chilometri.') &&
    !ok(SK.key('km_roma_milano'), 'Da Roma a Napoli ci sono cinquecentosettanta chilometri.') && !ok(SK.yes('km_roma_milano'), 'Ci sono cinquecentosettanta chilometri.'));
  check('allievo', evalAsk('km_roma_firenze', 'Quanti chilometri ci sono da Roma a Firenze?').kind === 'what' && answerAsk('km_roma_firenze', { kind: 'what' }) === 'Ci sono duecentosettanta chilometri.' &&
    evalAsk('km_roma_firenze', 'Da Roma a Firenze ci sono 300 chilometri?').kind === 'no' && answerAsk('km_roma_firenze', { kind: 'no', ask: 300 }) === 'No, non ci sono trecento chilometri. Ci sono duecentosettanta chilometri.' &&
    !evalAsk('km_roma_firenze', 'Quanti chilometri ci sono da Roma a Milano?').ok);
  const st = buildSteps(l32), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 29: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 29: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 30: «La famiglia»
{
  const SF = run('SFM'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l33 = run('LESSONS').find(l => l.id === 'l30');
  check('lezione 30 c\'è', !!l33 && l33.fam);
  check('figure', l33.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SF.present('f_padre').prompt === 'È il padre.' && SF.key('f_nonna').prompt === 'Chi è?' && SF.key('f_nonna').model === 'È la nonna.' && SF.yes('f_figlia').model === 'Sì, è la figlia.');
  check('giusto', ok(SF.key('f_figlio'), 'È il figlio.') && ok(SF.yes('f_madre'), 'Sì, è la madre.') && ok(SF.askQ('f_padre'), 'Chi è?'));
  const n = SF.neg('f_nonno');
  check('giusto: il no', ok(n, n.model) && evaluate(n, n.model.slice(0, -1) + ', è il nonno.').full);
  check('sbagliato: articolo, persona', !ok(SF.key('f_padre'), 'È la padre.') && !ok(SF.key('f_figlia'), 'È il figlia.') && !ok(SF.key('f_padre'), 'È un padre.') &&
    !ok(SF.key('f_padre'), 'È il nonno.') && !ok(SF.yes('f_padre'), 'È il padre.'));
  check('allievo', evalAsk('f_madre', 'Chi è?').kind === 'what' && answerAsk('f_madre', { kind: 'what' }) === 'È la madre.' &&
    evalAsk('f_madre', 'È la nonna?').kind === 'no' && answerAsk('f_madre', { kind: 'no', ask: 'f_nonna' }) === 'No, non è la nonna. È la madre.' &&
    evalAsk('f_madre', 'È il madre?').model === 'È la madre?' && evalAsk('f_madre', 'È la madre o la figlia?').kind === 'alt');
  const st = buildSteps(l33), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 30: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 30: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 31: «Essere o avere»
{
  const SE2 = run('SEA'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l31 = run('LESSONS').find(l => l.id === 'l31');
  check('lezione 31 c\'è', !!l31 && l31.ea);
  check('figure', l31.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('frasi', SE2.presentHa('ea_m_phone_nero').prompt === M + ' ha un telefono.' && SE2.presentE('ea_m_phone_nero').prompt === 'Il telefono è nero.' &&
    SE2.keyHa('ea_f_suitcase_rosso').prompt === 'Che cosa ha ' + F + '?' && SE2.keyHa('ea_f_suitcase_rosso').model === F + ' ha una valigia.' &&
    SE2.keyE('ea_f_suitcase_rosso').prompt === 'Di che colore è la valigia?' && SE2.keyE('ea_f_suitcase_rosso').model === 'La valigia è rossa.');
  check('giusto', ok(SE2.keyHa('ea_m_laptop_bianco'), M + ' ha un portatile.') && ok(SE2.keyHa('ea_m_laptop_bianco'), 'Ha un portatile.') && ok(SE2.yesHa('ea_m_laptop_bianco'), 'Sì, ha un portatile.') &&
    ok(SE2.keyE('ea_m_laptop_bianco'), 'Il portatile è bianco.') && ok(SE2.yesE('ea_f_cup_bianco'), 'Sì, la tazza è bianca.'));
  const n = SE2.negHa('ea_m_phone_nero'), nE = SE2.negE('ea_m_phone_nero');
  check('giusto: il no (ha ed è)', ok(n, n.model) && ok(nE, nE.model));
  check('sbagliato: «è» al posto di «ha» e viceversa, «ho», persona', !ok(SE2.keyHa('ea_m_phone_nero'), M + ' è un telefono.') && !ok(SE2.keyE('ea_m_phone_nero'), 'Il telefono ha nero.') &&
    !ok(SE2.keyHa('ea_m_phone_nero'), M + ' ho un telefono.') && !ok(SE2.keyHa('ea_m_phone_nero'), F + ' ha un telefono.') && !ok(SE2.keyHa('ea_m_phone_nero'), M + ' ha una telefono.') &&
    !ok(SE2.keyE('ea_m_phone_nero'), 'Il telefono è nera.'));
  check('allievo', evalAsk('ea_m_coat_rosso', 'Che cosa ha ' + M + '?').kind === 'what' && answerAsk('ea_m_coat_rosso', { kind: 'what' }) === M + ' ha un cappotto.' &&
    evalAsk('ea_m_coat_rosso', M + ' ha una tazza?').kind === 'no' && answerAsk('ea_m_coat_rosso', { kind: 'no', ask: 'cup' }) === 'No, ' + M + ' non ha una tazza. ' + M + ' ha un cappotto.' &&
    evalAsk('ea_m_coat_rosso', M + ' è un cappotto?').model === M + ' ha un cappotto?' &&
    (r => r.ok && answerAsk('ea_m_coat_rosso', r) === 'Il cappotto è rosso.')(evalAsk('ea_m_coat_rosso', 'Di che colore è il cappotto?')));
  const st = buildSteps(l31), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 31: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 31: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  check('lezione 31: lunghezza', st.length < 115);
}

// Lezione 32: «Plurale: o → i, a → e»
{
  const SP2 = run('SPL'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l32');
  check('lezione 32 c\'è', !!l && l.pl);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SP2.present('pl_book_1').prompt === 'È un libro.' && SP2.present('pl_book_2').prompt === 'Sono due libri.' && SP2.present('pl_pen_3').prompt === 'Sono tre penne.' &&
    SP2.key('pl_cup_2').prompt === 'Che cosa sono?' && SP2.key('pl_pen_1').prompt === 'Che cos\'è?' && SP2.yes('pl_notebook_3').model === 'Sì, sono tre quaderni.');
  check('giusto', ok(SP2.key('pl_book_2'), 'Sono due libri.') && ok(SP2.key('pl_cup_2'), 'Sono due tazze.') && ok(SP2.key('pl_book_1'), 'È un libro.') && ok(SP2.yes('pl_pen_3'), 'Sì, sono tre penne.'));
  const n = SP2.neg('pl_cup_2');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «due libro», «è due», «una libri», numero', !ok(SP2.key('pl_book_2'), 'Sono due libro.') && !ok(SP2.key('pl_book_2'), 'È due libri.') &&
    !ok(SP2.key('pl_pen_3'), 'Sono tre penna.') && !ok(SP2.key('pl_pen_3'), 'Sono due penne.') && !ok(SP2.key('pl_book_1'), 'Sono un libro.') && !ok(SP2.key('pl_pen_1'), 'È un penna.'));
  check('allievo', evalAsk('pl_cup_2', 'Che cosa sono?').kind === 'what' && answerAsk('pl_cup_2', { kind: 'what' }) === 'Sono due tazze.' &&
    evalAsk('pl_cup_2', 'Sono due penne?').kind === 'no' && evalAsk('pl_cup_2', 'Sono due tazza?').model === 'Sono due tazze?' && !evalAsk('pl_cup_2', 'Che cos\'è?').ok);
  check('-o/-i azzurre, -a/-e rosa', (w => ['libro', 'libri', 'penna', 'penne', 'tazze'].every(x => w.indexOf(x) !== -1))(run('genderWords')(l)));
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 32: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 32: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  check('lezione 32: domande dell\'allievo', st.filter(s => s.type === 'ask').length === 7 && st.filter(s => s.type === 'ask').every(s => s.pl));
}

// Lezione 33: «C'è / ci sono»
{
  const SX = run('SCE'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l33');
  check('lezione 33 c\'è', !!l && l.ce);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('ce_phone_1').prompt === 'Sul tavolo c\'è un telefono.' && SX.present('ce_cup_2').prompt === 'Sul tavolo ci sono due tazze.' &&
    SX.key('ce_orange_1').model === 'C\'è un\'arancia.' && SX.key('ce_pen_3').prompt === 'Che cosa c\'è sul tavolo?' && SX.yes('ce_book_2').model === 'Sì, ci sono due libri.');
  check('giusto', ok(SX.key('ce_cup_2'), 'Ci sono due tazze.') && ok(SX.key('ce_cup_2'), 'Sul tavolo ci sono due tazze.') && ok(SX.key('ce_key_1'), 'C\'è una chiave.') &&
    ok(SX.key('ce_key_1'), 'ce una chiave') && ok(SX.askQ('ce_key_1'), 'Che cosa c\'è sul tavolo?'));
  const n = SX.neg('ce_pen_3');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «c\'è due», «ci sono un», «è un», «due tazza»', !ok(SX.key('ce_cup_2'), 'C\'è due tazze.') && !ok(SX.key('ce_phone_1'), 'Ci sono un telefono.') &&
    !ok(SX.key('ce_phone_1'), 'È un telefono.') && !ok(SX.key('ce_cup_2'), 'Ci sono due tazza.') && !ok(SX.key('ce_cup_2'), 'Ci sono tre tazze.'));
  check('allievo', evalAsk('ce_cup_2', 'Che cosa c\'è sul tavolo?').kind === 'what' && answerAsk('ce_cup_2', { kind: 'what' }) === 'Ci sono due tazze.' &&
    evalAsk('ce_cup_2', 'Sul tavolo c\'è un telefono?').kind === 'no' && answerAsk('ce_cup_2', { kind: 'no', ask: 'phone', n: 1 }) === 'No, non c\'è un telefono. Ci sono due tazze.' &&
    evalAsk('ce_cup_2', 'Sul tavolo c\'è due tazze?').model === 'Sul tavolo ci sono due tazze?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 33: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 33: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 34: «Quanto costa? Quanto costano?»
{
  const SX = run('SCO'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l34');
  check('lezione 34 c\'è', !!l && l.co);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('co_book_1').prompt === 'Il libro costa dodici euro.' && SX.present('co_pen_2').prompt === 'Le penne costano tre euro.' &&
    SX.present('co_notebook_3').prompt === 'I quaderni costano sei euro.' && SX.key('co_cup_2').prompt === 'Quanto costano le tazze?' && SX.key('co_phone_1').model === 'Costa trecento euro.');
  check('giusto (anche «12 €»)', ok(SX.key('co_book_1'), 'Costa dodici euro.') && ok(SX.key('co_book_1'), 'Il libro costa dodici euro.') && ok(SX.key('co_book_1'), 'costa 12 €') &&
    ok(SX.key('co_pen_2'), 'Le penne costano tre euro.') && ok(SX.askQ('co_pen_2'), 'Quanto costano le penne?'));
  const n = SX.neg('co_suitcase_1');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: costa/costano, «è», prezzo, articolo', !ok(SX.key('co_book_1'), 'Costano dodici euro.') && !ok(SX.key('co_pen_2'), 'Costa tre euro.') &&
    !ok(SX.key('co_book_1'), 'È dodici euro.') && !ok(SX.key('co_book_1'), 'Costa venti euro.') && !ok(SX.key('co_pen_2'), 'I penne costano tre euro.') && !ok(SX.key('co_pen_2'), 'Le penna costano tre euro.'));
  check('allievo', evalAsk('co_cup_2', 'Quanto costano le tazze?').kind === 'what' && answerAsk('co_cup_2', { kind: 'what' }) === 'Costano otto euro.' &&
    evalAsk('co_cup_2', 'Le tazze costano dieci euro?').kind === 'no' && answerAsk('co_cup_2', { kind: 'no', ask: 10 }) === 'No, non costano dieci euro. Costano otto euro.' &&
    !evalAsk('co_cup_2', 'Quanto costa le tazze?').ok && evalAsk('co_cup_2', 'Le tazze costa otto euro?').model === 'Le tazze costano otto euro?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 34: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 34: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezioni 35, 36, 37: questo / gli, le / quel, quei, quegli (con i colori al plurale)
{
  const SX = run('SDT'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const L3 = ['l35', 'l36', 'l37'].map(id => run('LESSONS').find(l => l.id === id));
  check('lezioni 35, 36, 37 ci sono', L3.every(l => l && l.dt));
  check('figure', L3.every(l => l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1)));
  check('frasi 35', SX.present('dq_phone_giallo_1').prompt === 'Questo telefono è giallo.' && SX.present('dq_cup_bianco_2').prompt === 'Queste tazze sono bianche.' &&
    SX.present('dq_phone_giallo_2').prompt === 'Questi telefoni sono gialli.' && SX.key('dq_suitcase_rosso_2').prompt === 'Di che colore sono queste valigie?');
  check('frasi 36', SX.present('dd_umbrella_giallo_2').prompt === 'Gli ombrelli sono gialli.' && SX.present('dd_backpack_rosso_2').prompt === 'Gli zaini sono rossi.' &&
    SX.present('dd_agenda_bianco_2').prompt === 'Le agende sono bianche.' && SX.present('dd_laptop_bianco_2').prompt === 'I portatili sono bianchi.' && SX.present('dd_key_giallo_2').prompt === 'Le chiavi sono gialle.' && ok(SX.key('dd_key_giallo_2'), 'Le chiavi sono gialle.') && !ok(SX.key('dd_key_giallo_2'), 'Le chiavi sono gialli.') && run('Object.keys(COLORS)').join() === 'nero,bianco,rosso');
  check('frasi 37', SX.present('dl_umbrella_giallo_1').prompt === 'Quell\'ombrello è giallo.' && SX.present('dl_phone_bianco_2').prompt === 'Quei telefoni sono bianchi.' &&
    SX.present('dl_backpack_rosso_2').prompt === 'Quegli zaini sono rossi.' && SX.present('dl_suitcase_rosso_1').prompt === 'Quella valigia è rossa.' &&
    SX.present('dl_cup_bianco_2').prompt === 'Quelle tazze sono bianche.' && SX.present('dl_coat_rosso_1').prompt === 'Quel cappotto è rosso.');
  check('giusto', ok(SX.key('dq_cup_bianco_2'), 'Queste tazze sono bianche.') && ok(SX.key('dd_umbrella_giallo_2'), 'Gli ombrelli sono gialli.') &&
    ok(SX.key('dl_umbrella_giallo_1'), 'Quell\'ombrello è giallo.') && ok(SX.yes('dl_backpack_rosso_2'), 'Sì, quegli zaini sono rossi.'));
  const n = SX.neg('dd_label_rosso_2');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: parola davanti, plurale, verbo, accordo', !ok(SX.key('dq_cup_bianco_2'), 'Questo tazze sono bianche.') && !ok(SX.key('dq_cup_bianco_2'), 'Queste tazza sono bianche.') &&
    !ok(SX.key('dq_cup_bianco_2'), 'Queste tazze sono bianchi.') && !ok(SX.key('dq_cup_bianco_2'), 'Queste tazze è bianche.') && !ok(SX.key('dd_umbrella_giallo_2'), 'I ombrelli sono gialli.') &&
    !ok(SX.key('dd_backpack_rosso_2'), 'I zaini sono rossi.') && !ok(SX.key('dl_backpack_rosso_2'), 'Quei zaini sono rossi.') && !ok(SX.key('dl_phone_bianco_2'), 'Quegli telefoni sono bianchi.') &&
    !ok(SX.key('dd_laptop_bianco_2'), 'I portatile sono bianchi.') && !ok(SX.key('dq_phone_giallo_1'), 'Questo telefono è gialla.'));
  check('allievo', evalAsk('dq_cup_bianco_2', 'Di che colore sono queste tazze?').kind === 'what' && answerAsk('dq_cup_bianco_2', { kind: 'what' }) === 'Queste tazze sono bianche.' &&
    evalAsk('dq_cup_bianco_2', 'Queste tazze sono rosse?').kind === 'no' && answerAsk('dq_cup_bianco_2', { kind: 'no', ask: 'rosso' }) === 'No, queste tazze non sono rosse. Queste tazze sono bianche.' &&
    evalAsk('dq_cup_bianco_2', 'Questi tazze sono rosse?').model === 'Queste tazze sono rosse?');
  check('-i azzurre e -e rosa anche nei colori e in questi/quelle', (w => ['tazze', 'bianche', 'gialli', 'queste', 'quegli'].every(x => w.indexOf(x) !== -1))(run('genderWords')(L3[0])));
  L3.forEach(l => {
    const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
    check(l.id + ': risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
    check(l.id + ': ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  });
}

// Lezione 38: «Plurali irregolari»
{
  const SP2 = run('SPL'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l38');
  check('lezione 38 c\'è', !!l && l.pl);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SP2.present('pl_man_1').prompt === 'È un uomo.' && SP2.present('pl_man_2').prompt === 'Sono due uomini.' && SP2.present('pl_hand_2').prompt === 'Sono due mani.' &&
    SP2.present('pl_egg_3').prompt === 'Sono tre uova.' && SP2.present('pl_coffee_2').prompt === 'Sono due caffè.' && SP2.present('pl_computer_2').prompt === 'Sono due computer.');
  check('giusto (anche «caffe» senza accento)', ok(SP2.key('pl_man_2'), 'Sono due uomini.') && ok(SP2.key('pl_egg_3'), 'Sono tre uova.') && ok(SP2.key('pl_coffee_2'), 'Sono due caffe.') &&
    ok(SP2.key('pl_computer_2'), 'Sono due computer.') && ok(SP2.key('pl_hand_2'), 'Sono due mani.'));
  check('sbagliato', !ok(SP2.key('pl_man_2'), 'Sono due uomo.') && !ok(SP2.key('pl_hand_2'), 'Sono due mano.') && !ok(SP2.key('pl_egg_3'), 'Sono tre uovi.') &&
    !ok(SP2.key('pl_man_1'), 'È una uomo.') && !ok(SP2.key('pl_hand_2'), 'Sono due manı.'));
  check('lezione 32 non cambia', SP2.present('pl_book_2').prompt === 'Sono due libri.' && ok(SP2.key('pl_book_2'), 'Sono due libri.') && !ok(SP2.key('pl_book_2'), 'Sono due libro.'));
  check('allievo', evalAsk('pl_egg_3', 'Che cosa sono?').kind === 'what' && evalAsk('pl_egg_3', 'Sono tre uovi?').ok === false);
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 38: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 38: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 39: «Il contrario»
{
  const SX = run('SCT'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l39');
  check('lezione 39 c\'è, livello 2', !!l && l.ct && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('ct_book_aperto').prompt === 'Il libro è aperto.' && SX.present('ct_bottle_vuoto').prompt === 'La bottiglia è vuota.' &&
    SX.key('ct_pencil_corto').prompt === 'Com\'è la matita?' && SX.neg('ct_book_aperto').prompt === 'Il libro è chiuso?' && SX.neg('ct_book_aperto').model === 'No, il libro non è chiuso.');
  check('giusto', ok(SX.key('ct_book_chiuso'), 'Il libro è chiuso.') && ok(SX.key('ct_book_chiuso'), 'È chiuso.') && ok(SX.key('ct_bottle_pieno'), 'La bottiglia è piena.') &&
    ok(SX.neg('ct_pencil_lungo'), 'No, la matita non è corta.') && ok(SX.askQ('ct_pencil_lungo'), 'Com\'è la matita?'));
  check('sbagliato', !ok(SX.key('ct_book_chiuso'), 'Il libro è aperto.') && !ok(SX.key('ct_bottle_pieno'), 'La bottiglia è pieno.') && !ok(SX.key('ct_bottle_pieno'), 'Il bottiglia è piena.'));
  check('allievo', evalAsk('ct_bottle_vuoto', 'Com\'è la bottiglia?').kind === 'what' && evalAsk('ct_bottle_vuoto', 'La bottiglia è piena?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 39: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 39: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 40: «Essere o stare»
{
  const SX = run('SST'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l40');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 40 c\'è', !!l && l.sta && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('st_m_bene').prompt === M + ' sta bene.' && SX.present('st_f_stanco').prompt === F + ' è stanca.' && SX.present('st_m_stanco').prompt === M + ' è stanco.' &&
    SX.key('st_f_male').prompt === 'Come sta ' + F + '?');
  check('giusto', ok(SX.key('st_f_male'), F + ' sta male.') && ok(SX.key('st_f_male'), 'Sta male.') && ok(SX.key('st_f_stanco'), 'È stanca.') && ok(SX.yes('st_m_bene'), 'Sì, ' + M + ' sta bene.'));
  const n = SX.neg('st_m_bene');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: «è bene», «sta stanca», «è stanco» per Isa, persona', !ok(SX.key('st_m_bene'), M + ' è bene.') && !ok(SX.key('st_f_stanco'), F + ' sta stanca.') &&
    !ok(SX.key('st_f_stanco'), F + ' è stanco.') && !ok(SX.key('st_m_bene'), F + ' sta bene.') && !ok(SX.key('st_m_bene'), M + ' sta male.'));
  check('allievo', evalAsk('st_m_male', 'Come sta ' + M + '?').kind === 'what' && evalAsk('st_m_male', M + ' sta bene?').kind === 'no' && evalAsk('st_m_male', M + ' è bene?').model === M + ' sta bene?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 40: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 40: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 41: «Ce l'ho — ce l'ha»
{
  const SX = run('SCL'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l41');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 41 c\'è', !!l && l.cl && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('cl_m_phone_1').prompt === M + ' ha il telefono. Ce l\'ha.' && SX.present('cl_f_suitcase_0').prompt === F + ' non ha la valigia. Non ce l\'ha.' &&
    SX.key('cl_m_umbrella_0').prompt === M + ' ha l\'ombrello?' && SX.key('cl_m_umbrella_0').model === 'No, non ce l\'ha.' && SX.key('cl_f_key_1').model === 'Sì, ce l\'ha.');
  check('giusto', ok(SX.key('cl_m_phone_1'), 'Sì, ce l\'ha.') && ok(SX.key('cl_m_phone_1'), 'Sì, ' + M + ' ce l\'ha.') && ok(SX.key('cl_f_bag_0'), 'No, non ce l\'ha.') &&
    ok(SX.present('cl_m_book_1'), M + ' ha il libro. Ce l\'ha.') && ok(SX.askQ('cl_m_book_1'), M + ' ha il libro?'));
  check('sbagliato', !ok(SX.key('cl_m_phone_1'), 'Sì, ce l\'ho.') && !ok(SX.key('cl_m_phone_1'), 'Sì, ce la ha.') && !ok(SX.key('cl_m_phone_1'), 'Sì, ha.') &&
    !ok(SX.key('cl_m_phone_1'), 'No, non ce l\'ha.') && !ok(SX.key('cl_f_bag_0'), 'Sì, ce l\'ha.') && !ok(SX.key('cl_f_bag_0'), 'No, non l\'ha.'));
  check('allievo', evalAsk('cl_m_phone_1', M + ' ha il telefono?').kind === 'yes' && answerAsk('cl_m_phone_1', { kind: 'yes' }) === 'Sì, ce l\'ha.' &&
    evalAsk('cl_m_phone_1', M + ' ha la borsa?').kind === 'no' && evalAsk('cl_m_phone_1', M + ' ha la telefono?').model === M + ' ha il telefono?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 41: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 41: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 42: «Imperativo» (con il Lei)
{
  const SX = run('SIM'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l42');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 42 c\'è', !!l && l.imp && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('im_f_open').prompt === F + ' dice: «Apra la porta!»' && SX.key('im_m_close').prompt === 'Che cosa dice ' + M + '?' && SX.key('im_m_close').model === 'Chiuda la finestra!' &&
    SX.key('im_f_eat').model === 'Mangi l\'arancia!' && SX.key('im_m_phone').model === 'Telefoni!' && SX.neg('im_f_open').prompt === F + ' dice «Chiuda la porta»?'.replace('la porta', 'la finestra'));
  check('giusto', ok(SX.key('im_f_open'), 'Apra la porta!') && ok(SX.key('im_f_open'), F + ' dice: apra la porta.') && ok(SX.key('im_m_drink'), 'Beva l\'aranciata!') &&
    ok(SX.key('im_m_phone'), 'Telefoni!') && ok(SX.yes('im_f_read'), 'Sì, ' + F + ' dice: legga il libro.'));
  const n = SX.neg('im_f_read');
  check('giusto: il no', ok(n, n.model));
  check('sbagliato: presente, tu, infinito, cosa', !ok(SX.key('im_f_open'), 'Apre la porta!') && !ok(SX.key('im_f_open'), 'Apri la porta!') && !ok(SX.key('im_f_open'), 'Aprire la porta.') &&
    !ok(SX.key('im_f_open'), 'Apra la finestra!') && !ok(SX.key('im_f_eat'), 'Mangia l\'arancia!') && !ok(SX.key('im_f_open'), 'Chiuda la finestra!'));
  check('allievo', evalAsk('im_f_open', 'Che cosa dice ' + F + '?').kind === 'what' && evalAsk('im_f_open', F + ' dice: legga il libro?').kind === 'no' &&
    evalAsk('im_f_open', F + ' dice: apri la porta?').model === F + ' dice «Apra la porta»?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 42: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 42: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 43: «Qual è la domanda?»
{
  const SX = run('SQD'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l43');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 43 c\'è', !!l && l.qd && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0));
  check('frasi', SX.key('qd_ora').prompt === 'Sono le otto. Qual è la domanda?' && SX.key('qd_ora').model === 'Che ore sono?' &&
    SX.key('qd_fa').prompt === M + ' legge un libro. Qual è la domanda?' && SX.key('qd_sta').model === 'Come sta ' + F + '?');
  check('giusto', ok(SX.key('qd_ora'), 'Che ore sono?') && ok(SX.key('qd_ora'), 'Che ora è?') && ok(SX.key('qd_fa'), 'Cosa fa ' + M + '?') &&
    ok(SX.key('qd_chi'), 'La domanda è: chi è?') && ok(SX.yes('qd_costa'), 'Sì, la domanda è: quanto costa il libro?'));
  const n = SX.neg('qd_chi');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: la risposta, un\'altra domanda, due domande', !ok(SX.key('qd_ora'), 'Sono le otto.') && !ok(SX.key('qd_ora'), 'Chi è?') &&
    !ok(SX.key('qd_sta'), 'Come sta ' + M + '?') && !ok(SX.key('qd_ora'), 'Che ore sono o chi è?') && !ok(SX.yes('qd_ora'), 'No, la domanda non è: che ore sono?'));
  check('allievo', evalAsk('qd_ora', 'Che ore sono?').kind === 'q' && answerAsk('qd_ora', { kind: 'q' }) === 'Sono le otto.' &&
    evalAsk('qd_ora', 'Qual è la domanda?').kind === 'what' && !evalAsk('qd_ora', 'Chi è?').ok);
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 43: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 43: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 44: «Né… né…»
{
  const SX = run('SNE'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l44');
  check('lezione 44 c\'è', !!l && l.ne && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0));
  const k = Object.assign(SX.key('ne_suitcase_rosso'), { two: ['bianco', 'giallo'], prompt: 'La valigia è bianca o gialla?' });
  check('frasi', SX.yes('ne_suitcase_rosso').prompt === 'La valigia è rossa?' && SX.alt('ne_phone_giallo').model === 'Il telefono è giallo.' && /^L'agenda non è né (\S+) né (\S+)\. È bianca\.$/.test(SX.key('ne_agenda_bianco').model));
  check('giusto', ok(k, 'La valigia non è né bianca né gialla. È rossa.') && ok(k, 'Non è né bianca né gialla, è rossa.') && ok(k, 'Non è né gialla né bianca.') &&
    ok(SX.yes('ne_coat_nero'), 'Sì, il cappotto è nero.') && ok(SX.alt('ne_cup_bianco'), 'La tazza è bianca.'));
  const n = SX.neg('ne_cup_bianco');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: senza «non», un solo né, accordo, colore vero sbagliato, colori sbagliati', !ok(k, 'La valigia è né bianca né gialla.') && !ok(k, 'La valigia non è bianca né gialla.') &&
    !ok(k, 'La valigia non è né bianco né giallo.') && !ok(k, 'Non è né bianca né gialla. È nera.') && !ok(k, 'Non è né bianca né nera.') && !ok(k, 'La valigia è rossa o gialla.'));
  check('allievo', evalAsk('ne_phone_giallo', 'Il telefono è rosso o bianco?').kind === 'ne' && evalAsk('ne_phone_giallo', 'Il telefono è giallo o nero?').kind === 'alt' &&
    evalAsk('ne_phone_giallo', 'Il telefono è rosso?').kind === 'no' && evalAsk('ne_phone_giallo', 'Di che colore è il telefono?').kind === 'what' &&
    answerAsk('ne_phone_giallo', { kind: 'ne', two: ['rosso', 'bianco'] }) === 'Il telefono non è né rosso né bianco. È giallo.' &&
    evalAsk('ne_suitcase_rosso', 'La valigia è bianco o nero?').model === 'La valigia è bianca o nera?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 44: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 44: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 45: «Passato prossimo»
{
  const SX = run('SPS'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l45');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 45 c\'è', !!l && l.ps && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('ps_m_read').prompt === M + ' ha letto un libro.' && SX.key('ps_f_open').prompt === 'Che cosa ha fatto ' + F + '?' &&
    SX.key('ps_f_drink').model === F + ' ha bevuto un\'aranciata.' && SX.key('ps_f_phone').model === F + ' ha telefonato.');
  check('giusto', ok(SX.key('ps_m_read'), M + ' ha letto un libro.') && ok(SX.key('ps_m_read'), 'Ha letto un libro.') && ok(SX.key('ps_m_close'), 'Lui ha chiuso la finestra.') &&
    ok(SX.yes('ps_f_open'), 'Sì, ' + F + ' ha aperto la porta.'));
  const n = SX.neg('ps_m_eat');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: presente, senza ha, forme inventate, cosa, persona', !ok(SX.key('ps_m_read'), M + ' legge un libro.') && !ok(SX.key('ps_m_read'), M + ' letto un libro.') &&
    !ok(SX.key('ps_m_read'), M + ' ha leggiuto un libro.') && !ok(SX.key('ps_f_open'), F + ' ha aprito la porta.') && !ok(SX.key('ps_f_open'), F + ' ha aperto la finestra.') &&
    !ok(SX.key('ps_m_read'), F + ' ha letto un libro.') && !ok(SX.key('ps_m_read'), M + ' ha mangiato un\'arancia.'));
  check('allievo', evalAsk('ps_m_read', 'Che cosa ha fatto ' + M + '?').kind === 'what' && evalAsk('ps_m_read', M + ' ha telefonato?').kind === 'no' &&
    evalAsk('ps_m_read', M + ' legge un libro?').model === M + ' ha letto un libro?' && answerAsk('ps_m_read', { kind: 'no', ask: 'phone' }) === 'No, ' + M + ' non ha telefonato. ' + M + ' ha letto un libro.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 45: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 45: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 46: «L'ho letto — l'ho letta»
{
  const SX = run('SLH'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l46');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 46 c\'è', !!l && l.lh && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('lh_m_book').prompt === M + ' ha letto il libro. L\'ha letto.' && SX.key('lh_f_window').prompt === 'Che cosa ha fatto ' + F + ' con la finestra?' &&
    SX.key('lh_f_window').model === 'L\'ha chiusa.' && SX.yes('lh_m_orange').model === 'Sì, l\'ha mangiata.' && SX.neg('lh_m_book').model === 'No, non l\'ha letto.');
  check('giusto', ok(SX.key('lh_m_book'), 'L\'ha letto.') && ok(SX.key('lh_m_book'), M + ' l\'ha letto.') && ok(SX.key('lh_f_window'), 'La ha chiusa.') &&
    ok(SX.yes('lh_f_soda'), 'Sì, l\'ha bevuta.') && ok(SX.key('lh_f_phone'), 'Lo ha preso.'));
  const n = SX.neg('lh_m_book');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: accordo, la cosa ripetuta, forme inventate, persona, verbo', !ok(SX.key('lh_m_book'), 'L\'ha letta.') && !ok(SX.key('lh_f_window'), 'L\'ha chiuso.') &&
    !ok(SX.key('lh_m_book'), 'Ha letto il libro.') && !ok(SX.key('lh_m_book'), 'L\'ha leggiuto.') && !ok(SX.key('lh_m_book'), F + ' l\'ha letto.') &&
    !ok(SX.key('lh_m_book'), 'L\'ha preso.') && !ok(SX.yes('lh_m_book'), 'Sì, l\'ha letta.'));
  check('allievo', evalAsk('lh_m_book', 'Che cosa ha fatto ' + M + ' con il libro?').kind === 'what' && evalAsk('lh_m_book', M + ' ha letto il libro?').kind === 'yes' &&
    evalAsk('lh_m_book', F + ' ha letto il libro?').kind === 'no' && answerAsk('lh_f_window', { kind: 'yes' }) === 'Sì, l\'ha chiusa.' && !evalAsk('lh_m_book', M + ' ha letta il libro?').ok);
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 46: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 46: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 47: «Ci vado, ci sono»
{
  const SX = run('SCV'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l47');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 47 c\'è', !!l && l.cv && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('cv_m_roma_va').prompt === M + ' va a Roma. Ci va.' && SX.present('cv_f_parigi_e').prompt === F + ' è a Parigi. C\'è.' &&
    SX.key('cv_f_parigi_e').prompt === F + ' è a Parigi?' && SX.key('cv_f_parigi_e').model === 'Sì, c\'è.' && SX.neg('cv_m_roma_va').model === 'No, non ci va.');
  check('giusto', ok(SX.key('cv_m_roma_va'), 'Sì, ci va.') && ok(SX.key('cv_m_roma_va'), 'Sì, ' + M + ' ci va.') && ok(SX.key('cv_f_parigi_e'), 'Sì, c\'è.'));
  const n = SX.neg('cv_f_parigi_e');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: senza ci, ci è, ci vado, verbo scambiato, persona, sì/no', !ok(SX.key('cv_m_roma_va'), 'Sì, va.') && !ok(SX.key('cv_f_parigi_e'), 'Sì, ci è.') &&
    !ok(SX.key('cv_m_roma_va'), 'Sì, ci vado.') && !ok(SX.key('cv_m_roma_va'), 'Sì, c\'è.') && !ok(SX.key('cv_f_parigi_e'), 'Sì, ci va.') &&
    !ok(SX.key('cv_m_roma_va'), 'Sì, ' + F + ' ci va.') && !ok(SX.key('cv_m_roma_va'), 'No, non ci va.') && !ok(n, 'Sì, c\'è.'));
  check('allievo', evalAsk('cv_m_roma_va', M + ' va a Roma?').kind === 'yes' && evalAsk('cv_m_roma_va', M + ' va a Londra?').kind === 'no' &&
    evalAsk('cv_m_roma_va', 'Dove va ' + M + '?').kind === 'what' && evalAsk('cv_m_newyork_e', M + ' è a New York?').kind === 'yes' &&
    evalAsk('cv_m_roma_va', M + ' va in Roma?').model === M + ' va a Roma?' && answerAsk('cv_m_roma_va', { kind: 'no', verbGo: true }) === 'No, non ci va. ' + M + ' va a Roma.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 47: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 47: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 48: «Saluti»
{
  const SX = run('SSA'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l48');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 48 c\'è', !!l && l.sa && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('sa_m_giorno').prompt === M + ' dice: «Buongiorno!»' && SX.key('sa_f_sera').prompt === 'Che cosa dice ' + F + '?' && SX.key('sa_f_arriv').model === 'Arrivederci!');
  check('giusto', ok(SX.key('sa_m_giorno'), 'Buongiorno!') && ok(SX.key('sa_m_giorno'), 'Buon giorno.') && ok(SX.key('sa_f_sera'), F + ' dice buonasera.') &&
    ok(SX.yes('sa_m_grazie'), 'Sì, ' + M + ' dice: grazie.'));
  const n = SX.neg('sa_m_notte');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: il saluto sbagliato, la persona', !ok(SX.key('sa_m_giorno'), 'Buonasera!') && !ok(SX.key('sa_f_arriv'), 'Grazie!') && !ok(SX.key('sa_m_giorno'), F + ' dice buongiorno.') &&
    !ok(SX.key('sa_m_giorno'), 'Buongiorno o buonasera.'));
  check('allievo', evalAsk('sa_m_giorno', 'Che cosa dice ' + M + '?').kind === 'what' && evalAsk('sa_m_giorno', M + ' dice buonasera?').kind === 'no' &&
    answerAsk('sa_m_giorno', { kind: 'what' }) === 'Buongiorno!');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 48: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 48: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 49: «Lui e lei»
{
  const SX = run('SLM'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l49');
  check('lezione 49 c\'è', !!l && l.lm && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('lm_f_professore').prompt === 'Lei è una professoressa.' && SX.key('lm_m_cuoco').prompt === 'Chi è lui?' && SX.key('lm_f_cameriere').model === 'Lei è una cameriera.');
  check('giusto', ok(SX.key('lm_f_cuoco'), 'Lei è una cuoca.') && ok(SX.key('lm_f_cuoco'), 'È una cuoca.') && ok(SX.yes('lm_m_professore'), 'Sì, lui è un professore.'));
  const n = SX.neg('lm_f_cuoco');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: genere, articolo, forme inventate, persona', !ok(SX.key('lm_f_cuoco'), 'Lei è un cuoco.') && !ok(SX.key('lm_f_cuoco'), 'Lei è una cuoco.') &&
    !ok(SX.key('lm_f_cuoco'), 'Lei è un cuoca.') && !ok(SX.key('lm_f_professore'), 'Lei è una professora.') && !ok(SX.key('lm_f_cuoco'), 'Lui è una cuoca.') &&
    !ok(SX.key('lm_m_cameriere'), 'Lui è un cameriero.') && !ok(SX.key('lm_m_cuoco'), 'Lui è un professore.'));
  check('allievo', evalAsk('lm_f_cuoco', 'Chi è lei?').kind === 'what' && evalAsk('lm_f_cuoco', 'Lei è una cameriera?').kind === 'no' &&
    evalAsk('lm_f_cuoco', 'Lei è un cuoco?').model === 'Lei è una cuoca?' && answerAsk('lm_f_cuoco', { kind: 'no', ask: 'professore' }) === 'No, lei non è una professoressa. Lei è una cuoca.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 49: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 49: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 50: «I giorni»
{
  const SX = run('SGD'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l50');
  check('lezione 50 c\'è', !!l && l.gd && l.level === 2 && l.known.length === 7);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('gd_mar').prompt === 'Oggi è martedì.' && SX.key('gd_dom').prompt === 'Che giorno è oggi?' && SX.key('gd_dom').model === 'Oggi è domenica.');
  check('giusto', ok(SX.key('gd_mer'), 'Oggi è mercoledì.') && ok(SX.key('gd_mer'), 'È mercoledì.') && ok(SX.key('gd_mer'), 'Mercoledì.') && ok(SX.yes('gd_sab'), 'Sì, oggi è sabato.'));
  const n = SX.neg('gd_gio');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: il giorno vicino, due giorni', !ok(SX.key('gd_mer'), 'Oggi è martedì.') && !ok(SX.key('gd_mer'), 'Oggi è martedì o mercoledì.') && !ok(SX.yes('gd_sab'), 'No, oggi non è sabato.'));
  check('allievo', evalAsk('gd_mar', 'Che giorno è oggi?').kind === 'what' && evalAsk('gd_mar', 'Oggi è lunedì?').kind === 'no' &&
    answerAsk('gd_mar', { kind: 'no', ask: 0 }) === 'No, oggi non è lunedì. Oggi è martedì.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 50: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 50: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 51: «I mesi»
{
  const SX = run('SMS'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l51');
  check('lezione 51 c\'è', !!l && l.ms && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('ms_lug').prompt === 'È luglio.' && SX.key('ms_dic').prompt === 'Che mese è?' && SX.key('ms_dic').model === 'È dicembre.');
  check('giusto', ok(SX.key('ms_apr'), 'È aprile.') && ok(SX.key('ms_apr'), 'Aprile.') && ok(SX.yes('ms_gen'), 'Sì, è gennaio.'));
  const n = SX.neg('ms_ott');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: il mese vicino, due mesi', !ok(SX.key('ms_lug'), 'È giugno.') && !ok(SX.key('ms_lug'), 'È luglio o agosto.') && !ok(SX.yes('ms_gen'), 'No, non è gennaio.'));
  check('allievo', evalAsk('ms_lug', 'Che mese è?').kind === 'what' && evalAsk('ms_lug', 'È agosto?').kind === 'no' && answerAsk('ms_lug', { kind: 'no', ask: 7 }) === 'No, non è agosto. È luglio.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 51: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 51: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 52: «I suoi, le sue»
{
  const SX = run('SSP'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l52');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 52 c\'è', !!l && l.sp && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('sp_m_umbrella').prompt === 'Sono gli ombrelli di ' + M + '. Sono i suoi ombrelli.' && SX.key('sp_f_key').prompt === 'Di chi sono queste chiavi?' &&
    SX.key('sp_f_key').model === 'Sono le chiavi di ' + F + '.' && SX.yes('sp_f_book').model === 'Sì, sono i suoi libri.');
  check('giusto', ok(SX.key('sp_m_book'), 'Sono i libri di ' + M + '.') && ok(SX.yes('sp_m_key'), 'Sì, sono le sue chiavi.') && ok(SX.yes('sp_m_key'), 'Sì, sono le chiavi di ' + M + '.'));
  const n = SX.neg('sp_f_cup');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: suoi/sue, gli suoi, singolare, persona', !ok(SX.yes('sp_f_book'), 'Sì, sono le sue libri.') && !ok(SX.yes('sp_m_key'), 'Sì, sono i suoi chiavi.') &&
    !ok(SX.yes('sp_m_umbrella'), 'Sì, sono gli suoi ombrelli.') && !ok(SX.yes('sp_m_book'), 'Sì, è il suo libro.') && !ok(SX.key('sp_m_book'), 'Sono i libri di ' + F + '.') &&
    !ok(SX.key('sp_m_umbrella'), 'Sono i ombrelli di ' + M + '.'));
  check('allievo', evalAsk('sp_m_book', 'Di chi sono questi libri?').kind === 'what' && evalAsk('sp_m_book', 'Sono i libri di ' + F + '?').kind === 'no' &&
    answerAsk('sp_m_book', { kind: 'no' }) === 'No, non sono i suoi libri. Sono i libri di ' + M + '.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 52: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 52: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 53: «loro»
{
  const SX = run('SLO'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l53');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name, W = M + ' e ' + F;
  check('lezione 53 c\'è', !!l && l.lo && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('lo_read').prompt === W + ' leggono un libro.' && SX.key('lo_eat').prompt === 'Che cosa fanno ' + W + '?' && SX.key('lo_phone').model === W + ' telefonano.');
  check('giusto', ok(SX.key('lo_read'), W + ' leggono un libro.') && ok(SX.key('lo_read'), 'Leggono un libro.') && ok(SX.key('lo_write'), 'Loro scrivono.') &&
    ok(SX.yes('lo_drink'), 'Sì, bevono un\'aranciata.'));
  const n = SX.neg('lo_eat');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: singolare, forme inventate, verbo, cosa', !ok(SX.key('lo_read'), W + ' legge un libro.') && !ok(SX.key('lo_eat'), 'Mangiono un\'arancia.') &&
    !ok(SX.key('lo_read'), 'Leggano un libro.') && !ok(SX.key('lo_read'), 'Scrivono.') && !ok(SX.key('lo_read'), 'Leggono la porta.'));
  check('allievo', evalAsk('lo_read', 'Che cosa fanno ' + W + '?').kind === 'what' && evalAsk('lo_read', W + ' telefonano?').kind === 'no' &&
    evalAsk('lo_read', W + ' legge un libro?').model === W + ' leggono un libro?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 53: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 53: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 54: «noi e voi»
{
  const SX = run('SNV'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l54');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name;
  check('lezione 54 c\'è', !!l && l.nv && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('nv_read').prompt === 'Io e ' + M + ' leggiamo un libro.' && SX.key('nv_eat').prompt === 'Che cosa facciamo io e ' + M + '?' &&
    SX.key('nv_eat').model === 'Voi mangiate un\'arancia.' && SX.yes('nv_phone').model === 'Sì, voi telefonate.');
  check('giusto', ok(SX.key('nv_read'), 'Voi leggete un libro.') && ok(SX.key('nv_read'), 'Leggete un libro.') && ok(SX.key('nv_drink'), 'Bevete un\'aranciata.') &&
    ok(SX.present('nv_write'), 'Io e ' + M + ' scriviamo.'));
  const n = SX.neg('nv_eat');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: noi nella risposta, loro, lui, forme inventate, verbo', !ok(SX.key('nv_read'), 'Noi leggiamo un libro.') && !ok(SX.key('nv_read'), 'Leggiamo un libro.') &&
    !ok(SX.key('nv_read'), 'Leggono un libro.') && !ok(SX.key('nv_read'), 'Legge un libro.') && !ok(SX.key('nv_read'), 'Leggiate un libro.') && !ok(SX.key('nv_read'), 'Voi scrivete.'));
  check('allievo', evalAsk('nv_read', 'Che cosa fate?').kind === 'what' && evalAsk('nv_read', 'Voi telefonate?').kind === 'no' &&
    answerAsk('nv_read', { kind: 'no', ask: 'phone' }) === 'No, noi non telefoniamo. Noi leggiamo un libro.' && evalAsk('nv_read', 'Voi leggono un libro?').model === 'Voi leggete un libro?');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 54: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 54: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 55: «gli, le»
{
  const SX = run('SDA'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l55');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 55 c\'è', !!l && l.da && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('da_m_book').prompt === M + ' dà il libro a ' + F + '. Le dà il libro.' && SX.key('da_f_pen').prompt === 'Che cosa dà ' + F + ' a ' + M + '?' &&
    SX.key('da_f_pen').model === 'Gli dà la penna.' && SX.yes('da_f_umbrella').model === 'Sì, gli dà l\'ombrello.');
  check('giusto', ok(SX.key('da_m_book'), 'Le dà il libro.') && ok(SX.key('da_f_cup'), 'Gli dà la tazza.') && ok(SX.yes('da_m_key'), 'Sì, le dà la chiave.'));
  const n = SX.neg('da_m_phone');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: gli/le scambiati, la cosa, la frase intera, lo/la', !ok(SX.key('da_m_book'), 'Gli dà il libro.') && !ok(SX.key('da_f_cup'), 'Le dà la tazza.') &&
    !ok(SX.key('da_m_book'), 'Le dà la penna.') && !ok(SX.key('da_m_book'), M + ' dà il libro a ' + F + '.') && !ok(SX.key('da_m_book'), 'Lo dà il libro.') && !ok(SX.key('da_m_book'), 'Le dà la libro.'));
  check('allievo', evalAsk('da_m_book', 'Che cosa dà ' + M + ' a ' + F + '?').kind === 'what' && evalAsk('da_m_book', M + ' dà la penna a ' + F + '?').kind === 'no' &&
    answerAsk('da_m_book', { kind: 'no', ask: 'pen' }) === 'No, non le dà la penna. Le dà il libro.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 55: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 55: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 56: «qualcuno / nessuno, qualche cosa / niente»
{
  const SX = run('SQN'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l56');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 56 c\'è', !!l && l.qn && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('qn_p_m').prompt === 'Nella stanza c\'è qualcuno. C\'è ' + M + '.' && SX.present('qn_t_0').prompt === 'Sul tavolo non c\'è niente.' &&
    SX.key('qn_p_0').prompt === 'Chi c\'è nella stanza?' && SX.key('qn_p_0').model === 'Non c\'è nessuno.' && SX.yes('qn_t_book').model === 'Sì, c\'è qualche cosa.');
  check('giusto', ok(SX.key('qn_p_f'), 'C\'è ' + F + '.') && ok(SX.key('qn_t_0'), 'Non c\'è niente.') && ok(SX.key('qn_t_cup'), 'C\'è una tazza.') &&
    ok(SX.yes('qn_t_book'), 'Sì, c\'è qualcosa.') && ok(SX.yes('qn_p_0'), 'No, non c\'è nessuno.') && ok(SX.yes('qn_p_m'), 'Sì, c\'è ' + M + '.'));
  const n = SX.neg('qn_p_m');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: senza non, non c\'è qualcuno, nessuno/niente scambiati, la persona, la cosa', !ok(SX.key('qn_p_0'), 'C\'è nessuno.') &&
    !ok(SX.yes('qn_p_0'), 'No, non c\'è qualcuno.') && !ok(SX.key('qn_t_0'), 'Non c\'è nessuno.') && !ok(SX.key('qn_p_0'), 'Non c\'è niente.') &&
    !ok(SX.key('qn_p_m'), 'C\'è ' + F + '.') && !ok(SX.key('qn_t_book'), 'C\'è una tazza.') && !ok(SX.key('qn_t_book'), 'C\'è una libro.') && !ok(SX.key('qn_p_m'), 'Non c\'è nessuno.'));
  check('allievo', evalAsk('qn_p_m', 'Chi c\'è nella stanza?').kind === 'what' && evalAsk('qn_p_0', 'C\'è qualcuno nella stanza?').kind === 'no' &&
    evalAsk('qn_t_book', 'C\'è un libro sul tavolo?').kind === 'yes' && answerAsk('qn_p_0', { kind: 'no' }) === 'No, non c\'è nessuno.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 56: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 56: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 57: «Biglietto da visita»
{
  const SX = run('SBV'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l57');
  check('lezione 57 c\'è', !!l && l.bv && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.key('bv_1_nome').prompt === 'Come si chiama?' && SX.key('bv_1_nome').model === 'Si chiama Marco Rossi.' && SX.key('bv_2_citta').model === 'Abita a Parigi.' &&
    SX.key('bv_2_lavoro').prompt === 'Che lavoro fa?' && SX.key('bv_2_lavoro').model === 'È una professoressa.');
  check('giusto', ok(SX.key('bv_1_nome'), 'Si chiama Marco.') && ok(SX.key('bv_1_citta'), 'Abita a Roma.') && ok(SX.key('bv_1_lavoro'), 'Fa il cuoco.') &&
    ok(SX.key('bv_2_lavoro'), 'Fa la professoressa.') && ok(SX.yes('bv_2_nome'), 'Sì, si chiama Anna Bianchi.'));
  const n = SX.neg('bv_1_citta');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: altro biglietto, in Roma, accordo, riga sbagliata', !ok(SX.key('bv_1_nome'), 'Si chiama Anna Bianchi.') && !ok(SX.key('bv_1_citta'), 'Abita in Roma.') &&
    !ok(SX.key('bv_2_lavoro'), 'È un professoressa.') && !ok(SX.key('bv_2_lavoro'), 'È un professore.') && !ok(SX.key('bv_1_citta'), 'Si chiama Marco Rossi.') && !ok(SX.key('bv_1_nome'), 'Sì.'));
  check('allievo', evalAsk('bv_1_nome', 'Come si chiama?').kind === 'what' && evalAsk('bv_1_citta', 'Abita a Londra?').kind === 'no' &&
    answerAsk('bv_1_citta', { kind: 'no', v: 'londra' }) === 'No, non abita a Londra. Abita a Roma.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 57: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 57: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 58: «li, le»
{
  const SX = run('SLP'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l58');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 58 c\'è', !!l && l.lp && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('lp_f_umbrella').prompt === F + ' prende gli ombrelli. Li prende.' && SX.key('lp_f_key').prompt === 'Che cosa fa ' + F + ' con le chiavi?' &&
    SX.key('lp_f_key').model === 'Le prende.' && SX.yes('lp_m_orange').model === 'Sì, le mangia.' && SX.neg('lp_m_book').model === 'No, non li prende.');
  check('giusto', ok(SX.key('lp_m_book'), 'Li prende.') && ok(SX.key('lp_m_book'), M + ' li prende.') && ok(SX.yes('lp_f_pen'), 'Sì, le prende.'));
  const n = SX.neg('lp_m_cup');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: lo/la, li/le scambiati, la cosa ripetuta, persona, verbo', !ok(SX.key('lp_m_book'), 'Lo prende.') && !ok(SX.key('lp_f_key'), 'La prende.') &&
    !ok(SX.key('lp_m_book'), 'Le prende.') && !ok(SX.key('lp_f_key'), 'Li prende.') && !ok(SX.key('lp_m_book'), 'Prende i libri.') && !ok(SX.key('lp_m_book'), F + ' li prende.') &&
    !ok(SX.key('lp_m_orange'), 'Le prende.'));
  check('allievo', evalAsk('lp_m_book', 'Che cosa fa ' + M + ' con i libri?').kind === 'what' && evalAsk('lp_m_book', F + ' prende i libri?').kind === 'no' &&
    evalAsk('lp_m_book', M + ' prende i libri?').kind === 'yes' && answerAsk('lp_f_key', { kind: 'yes' }) === 'Sì, le prende.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 58: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 58: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 59: «chiamarsi»
{
  const SX = run('SCM'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l59');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name, T = run('eTeacher()').name;
  check('lezione 59 c\'è', !!l && l.cm && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0));
  check('frasi', SX.present('cm_me').prompt === 'Io mi chiamo ' + T + '.' && SX.key('cm_me').prompt === 'Come mi chiamo io?' && SX.key('cm_me').model === 'Lei si chiama ' + T + '.' &&
    SX.key('cm_f').prompt === 'Come si chiama lei?' && SX.key('cm_c1').model === 'Lui si chiama Marco Rossi.');
  check('giusto', ok(SX.key('cm_m'), 'Si chiama ' + M + '.') && ok(SX.key('cm_c2'), 'Si chiama Anna.') && ok(SX.key('cm_me'), 'Lei si chiama ' + T + '.') &&
    ok(SX.yes('cm_f'), 'Sì, si chiama ' + F + '.') && ok(SX.present('cm_me'), 'Io mi chiamo ' + T + '.'));
  const n = SX.neg('cm_m');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: mi/si, chiamo/chiama, nome, cognome, prospettiva', !ok(SX.key('cm_me'), 'Io mi chiamo ' + T + '.') && !ok(SX.key('cm_m'), 'Si chiamo ' + M + '.') &&
    !ok(SX.key('cm_m'), 'Mi chiamo ' + M + '.') && !ok(SX.key('cm_m'), 'Si chiama ' + F + '.') && !ok(SX.key('cm_c1'), 'Si chiama Marco Bianchi.') && !ok(SX.key('cm_m'), 'Chiama ' + M + '.'));
  check('allievo', evalAsk('cm_me', 'Come si chiama Lei?').kind === 'what' && answerAsk('cm_me', { kind: 'what' }) === 'Mi chiamo ' + T + '.' &&
    evalAsk('cm_m', 'Lui si chiama Marco?').kind === 'no' && evalAsk('cm_m', 'Come si chiama lui?').kind === 'what');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 59: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 59: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 60: «presente e passato»
{
  const SX = run('STV'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l60');
  check('lezione 60 c\'è', !!l && l.tv && l.level === 2);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('tv_past_read').prompt === 'Io ho letto un libro.' && SX.key('tv_now_eat').prompt === 'Che cosa faccio io?' &&
    SX.key('tv_now_eat').model === 'Lei mangia un\'arancia.' && SX.key('tv_past_phone').prompt === 'Che cosa ho fatto io?' && SX.key('tv_past_phone').model === 'Lei ha telefonato.');
  check('giusto', ok(SX.key('tv_now_read'), 'Lei legge un libro.') && ok(SX.key('tv_now_read'), 'Legge un libro.') && ok(SX.key('tv_past_read'), 'Ha letto un libro.') &&
    ok(SX.yes('tv_past_eat'), 'Sì, Lei ha mangiato un\'arancia.') && ok(SX.present('tv_now_phone'), 'Io telefono.'));
  const n = SX.neg('tv_past_read');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: io nella risposta, il tempo, il verbo', !ok(SX.key('tv_now_read'), 'Io leggo un libro.') && !ok(SX.key('tv_now_read'), 'Leggo un libro.') &&
    !ok(SX.key('tv_now_read'), 'Lei ha letto un libro.') && !ok(SX.key('tv_past_read'), 'Lei legge un libro.') && !ok(SX.key('tv_past_read'), 'Ho letto un libro.') &&
    !ok(SX.key('tv_now_read'), 'Lei mangia un\'arancia.'));
  check('allievo', evalAsk('tv_now_read', 'Che cosa fa Lei?').kind === 'what' && evalAsk('tv_past_read', 'Che cosa ha fatto Lei?').kind === 'what' &&
    evalAsk('tv_now_read', 'Lei ha letto un libro?').kind === 'no' && answerAsk('tv_now_read', { kind: 'what' }) === 'Io leggo un libro.' &&
    answerAsk('tv_past_read', { kind: 'no', ask: 'eat', past: true }) === 'No, io non ho mangiato un\'arancia. Io ho letto un libro.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 60: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 60: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Test del livello 2: 8 che contano e 2 libere, dopo la lezione 60
{
  const t2 = run('LESSONS').find(l => l.id === 't2'), st = buildSteps(t2);
  check('test 2 c\'è, dopo la lezione 60', !!t2 && t2.test === 2 && t2.level === 2 && run('LESSONS').indexOf(t2) === run('LESSONS').findIndex(l => l.id === 'l60') + 1);
  check('test 2: 8 che contano + 2 libere', st.filter(s => s.type !== 'free').length === 8 && st.filter(s => s.type === 'free').length === 2 && st.every(s => s.test));
  check('test 2: le risposte giuste sono giuste', st.filter(s => s.type !== 'free' && s.type !== 'ask').every(s => evaluate(s, s.model).ok));
  check('test 2: la domanda dell\'allievo', (s => run('evalAsk')(s.askFig, s.model).ok)(st.find(s => s.type === 'ask')));
  check('test 2: figure', st.every(s => FIG[s.show] && FIG[s.show].indexOf('<svg') === 0));
  check('test 2: lezioni da ripassare (livello 2)', st.filter(s => s.tlesson).every(s => run('LESSONS').find(l => l.id === s.tlesson).level === 2));
  check('test 2: numeri delle lezioni dopo il test', run('lessonNumber')(run('LESSONS').find(l => l.id === 'l60')) === 60);
}

// Lezione 61: «li ha presi, le ha prese» (livello 3)
{
  const SX = run('SLQ'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l61');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 61 c\'è, livello 3, dopo il test 2', !!l && l.lq && l.level === 3 && run('LESSONS').indexOf(l) === run('LESSONS').findIndex(x => x.id === 't2') + 1);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('lq_m_book').prompt === M + ' ha preso i libri. Li ha presi.' && SX.key('lq_f_key').model === 'Le ha prese.' &&
    SX.key('lq_m_orange').model === 'Le ha mangiate.' && SX.key('lq_f_umbrella').prompt === 'Che cosa ha fatto ' + F + ' con gli ombrelli?');
  check('giusto', ok(SX.key('lq_m_book'), 'Li ha presi.') && ok(SX.key('lq_m_book'), M + ' li ha presi.') && ok(SX.yes('lq_f_pen'), 'Sì, le ha prese.'));
  const n = SX.neg('lq_m_cup');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: accordo, pronome, cosa ripetuta, persona', !ok(SX.key('lq_m_book'), 'Li ha preso.') && !ok(SX.key('lq_f_key'), 'Le ha presi.') &&
    !ok(SX.key('lq_m_book'), 'L\'ha presi.') && !ok(SX.key('lq_m_book'), 'Ha preso i libri.') && !ok(SX.key('lq_m_book'), F + ' li ha presi.') && !ok(SX.key('lq_m_book'), 'Li ha prenduti.'));
  check('allievo', evalAsk('lq_m_book', 'Che cosa ha fatto ' + M + ' con i libri?').kind === 'what' && evalAsk('lq_m_book', F + ' ha preso i libri?').kind === 'no' &&
    answerAsk('lq_f_key', { kind: 'yes' }) === 'Sì, le ha prese.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 61: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 61: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 62: «Il contrario» (calda / fredda, nuovo / vecchio, alta / bassa)
{
  const SX = run('SCT'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l62');
  check('lezione 62 c\'è', !!l && l.ct && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.key('ct_cup_caldo').model === 'La tazza è calda.' && SX.key('ct_book_vecchio').model === 'Il libro è vecchio.' && SX.neg('ct_chair_alto').model === 'No, la sedia non è bassa.' &&
    SX.key('ct_phone_vecchio').model === 'Il telefono è vecchio.' && l.known.length === 8);
  check('giusto e sbagliato', ok(SX.key('ct_chair_basso'), 'È bassa.') && !ok(SX.key('ct_chair_basso'), 'La sedia è basso.') && !ok(SX.key('ct_cup_freddo'), 'La tazza è calda.'));
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 62: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 62: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 63: «La colazione»
{
  const SX = run('SCZ'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l63');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 63 c\'è', !!l && l.cz && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('cz_m_cornetto').prompt === 'A colazione ' + M + ' mangia un cornetto.' && SX.key('cz_f_latte').prompt === 'Che cosa beve ' + F + ' a colazione?' &&
    SX.key('cz_f_latte').model === F + ' beve il latte.');
  check('giusto', ok(SX.key('cz_m_cornetto'), 'Mangia un cornetto.') && ok(SX.key('cz_m_cornetto'), 'Un cornetto.') && ok(SX.key('cz_f_pane'), F + ' mangia il pane.') &&
    ok(SX.key('cz_m_caffe'), M + ' beve un caffè.') && ok(SX.yes('cz_f_succo'), 'Sì, beve un succo d\'arancia.'));
  const n = SX.neg('cz_m_mela');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: verbo, cibo, persona', !ok(SX.key('cz_m_cornetto'), 'Beve un cornetto.') && !ok(SX.key('cz_f_latte'), 'Mangia il latte.') &&
    !ok(SX.key('cz_m_cornetto'), 'Mangia una mela.') && !ok(SX.key('cz_m_cornetto'), F + ' mangia un cornetto.'));
  check('allievo', evalAsk('cz_m_cornetto', 'Che cosa mangia ' + M + ' a colazione?').kind === 'what' && evalAsk('cz_m_cornetto', M + ' mangia una mela?').kind === 'no' &&
    answerAsk('cz_m_cornetto', { kind: 'no', ask: 'mela' }) === 'No, ' + M + ' non mangia una mela. ' + M + ' mangia un cornetto.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 63: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 63: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 64: «Quale? Questo / quello»
{
  const SX = run('SQU'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l64');
  check('lezione 64 c\'è', !!l && l.qu && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.key('qu_cup_rosso_bianco_n').prompt === 'Quale tazza è rossa?' && SX.key('qu_cup_rosso_bianco_n').model === 'Questa tazza.' &&
    SX.key('qu_phone_bianco_rosso_f').model === 'Quel telefono.' && SX.key('qu_umbrella_nero_giallo_f').model === 'Quell\'ombrello.');
  check('giusto', ok(SX.key('qu_cup_rosso_bianco_n'), 'Questa.') && ok(SX.key('qu_cup_rosso_bianco_n'), 'Questa tazza è rossa.') && ok(SX.key('qu_coat_bianco_rosso_f'), 'Quel cappotto.') &&
    ok(SX.yes('qu_phone_bianco_rosso_f'), 'Sì, quel telefono è rosso.'));
  const n = SX.neg('qu_suitcase_bianco_rosso_n');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: lato, forma, colore', !ok(SX.key('qu_cup_rosso_bianco_n'), 'Quella tazza.') && !ok(SX.key('qu_phone_bianco_rosso_f'), 'Quello telefono.') &&
    !ok(SX.key('qu_cup_rosso_bianco_n'), 'Questo tazza.') && !ok(SX.key('qu_cup_rosso_bianco_n'), 'Questa tazza è rosso.') && !ok(SX.key('qu_cup_rosso_bianco_n'), 'Questa tazza è bianca.'));
  check('allievo', evalAsk('qu_cup_rosso_bianco_n', 'Quale tazza è bianca?').kind === 'what' && answerAsk('qu_cup_rosso_bianco_n', { kind: 'what', col: 'bianco' }) === 'Quella tazza.' &&
    evalAsk('qu_cup_rosso_bianco_n', 'Questa tazza è bianca?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 64: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 64: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 65: «I fiori»
{
  const SX = run('SFI'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l65');
  check('lezione 65 c\'è', !!l && l.fi && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.key('fi_rosa_rosso').prompt === 'Che fiore è?' && SX.key('fi_rosa_rosso').model === 'È una rosa rossa.' && SX.key('fi_tulipano_giallo').model === 'È un tulipano giallo.');
  check('giusto', ok(SX.key('fi_rosa_bianco'), 'È una rosa.') && ok(SX.key('fi_girasole_giallo'), 'Un girasole giallo.') && ok(SX.yes('fi_margherita_bianco'), 'Sì, è una margherita bianca.'));
  const n = SX.neg('fi_tulipano_rosso');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: articolo, accordo, fiore, colore', !ok(SX.key('fi_rosa_rosso'), 'È un rosa.') && !ok(SX.key('fi_tulipano_rosso'), 'È una tulipano.') &&
    !ok(SX.key('fi_rosa_rosso'), 'È una rosa rosso.') && !ok(SX.key('fi_rosa_rosso'), 'È un tulipano.') && !ok(SX.key('fi_rosa_rosso'), 'È una rosa bianca.'));
  check('allievo', evalAsk('fi_rosa_rosso', 'Che fiore è?').kind === 'what' && evalAsk('fi_rosa_rosso', 'È un tulipano?').kind === 'no' &&
    evalAsk('fi_rosa_rosso', 'Di che colore è?').kind === 'col' && answerAsk('fi_rosa_rosso', { kind: 'col' }) === 'È rossa.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 65: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 65: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 66: «Il pranzo e la cena»
{
  const SX = run('SCZ'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l66');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 66 c\'è', !!l && l.cz && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf('undefined') === -1));
  check('frasi', SX.present('cz_m_pasta_pranzo').prompt === 'A pranzo ' + M + ' mangia la pasta.' && SX.key('cz_f_pesce_cena').prompt === 'Che cosa mangia ' + F + ' a cena?' &&
    SX.key('cz_f_vino_cena').model === F + ' beve un bicchiere di vino.');
  check('giusto e sbagliato', ok(SX.key('cz_f_vino_cena'), 'Beve il vino.') && ok(SX.key('cz_m_pizza_cena'), 'La pizza.') && !ok(SX.key('cz_m_pizza_cena'), 'Beve la pizza.') &&
    !ok(SX.key('cz_m_carne_cena'), 'Mangia il pesce.'));
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 66: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 66: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 67: «Ne»
{
  const SX = run('SNH'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l67');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 67 c\'è', !!l && l.nh && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.key('nh_m_book_3').prompt === 'Quanti libri ha ' + M + '?' && SX.key('nh_m_book_3').model === 'Ne ha tre.' && SX.key('nh_f_key_2').prompt === 'Quante chiavi ha ' + F + '?' &&
    SX.key('nh_m_orange_1').model === 'Ne ha una.' && SX.key('nh_f_umbrella_1').model === 'Ne ha uno.');
  check('giusto', ok(SX.key('nh_f_bottle_3'), 'Ne ha tre.') && ok(SX.key('nh_f_bottle_3'), F + ' ne ha tre.') && ok(SX.yes('nh_m_cup_2'), 'Sì, ne ha due.'));
  const n = SX.neg('nh_m_book_3');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: senza ne, ne + la cosa, uno/una, numero', !ok(SX.key('nh_m_book_3'), 'Ha tre.') && !ok(SX.key('nh_m_book_3'), 'Ne ha tre libri.') &&
    !ok(SX.key('nh_m_orange_1'), 'Ne ha uno.') && !ok(SX.key('nh_f_umbrella_1'), 'Ne ha una.') && !ok(SX.key('nh_m_book_3'), 'Ne ha due.'));
  check('allievo', evalAsk('nh_m_book_3', 'Quanti libri ha ' + M + '?').kind === 'what' && evalAsk('nh_m_book_3', M + ' ha due libri?').kind === 'no' &&
    answerAsk('nh_m_book_3', { kind: 'no', n: 2 }) === 'No, non ne ha due. Ne ha tre.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 67: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 67: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 68: «Verbi riflessivi»
{
  const SX = run('SRF'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l68');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 68 c\'è', !!l && l.rf && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('rf_m_alza').prompt === M + ' si alza.' && SX.key('rf_f_siede').prompt === 'Che cosa fa ' + F + '?' && SX.key('rf_m_lava').model === M + ' si lava le mani.' &&
    SX.neg('rf_m_alza').model === 'No, ' + M + ' non si siede.');
  check('giusto', ok(SX.key('rf_m_alza'), 'Si alza.') && ok(SX.key('rf_f_pettina'), F + ' si pettina.') && ok(SX.yes('rf_f_siede'), 'Sì, si siede.') && ok(SX.yes('rf_f_siede'), 'Sì, ' + F + ' si siede.'));
  const n = SX.neg('rf_f_alza');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: senza si, persona del verbo, mi, verbo, cosa', !ok(SX.key('rf_m_alza'), M + ' alza.') && !ok(SX.key('rf_m_alza'), 'Si alzo.') && !ok(SX.key('rf_m_alza'), 'Mi alzo.') &&
    !ok(SX.key('rf_m_alza'), 'Si siede.') && !ok(SX.key('rf_m_lava'), 'Si lava.') && !ok(SX.yes('rf_f_siede'), 'Si siede.'));
  check('allievo', evalAsk('rf_m_alza', 'Che cosa fa ' + M + '?').kind === 'what' && evalAsk('rf_m_alza', M + ' si siede?').kind === 'no' && evalAsk('rf_m_alza', M + ' alza?').model === M + ' si alza?' &&
    answerAsk('rf_m_alza', { kind: 'no', ask: 'siede' }) === 'No, ' + M + ' non si siede. ' + M + ' si alza.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 68: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 68: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 69: «Già — non ancora»
{
  const SX = run('SGN'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l69');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 69 c\'è', !!l && l.gn && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('gn_m_eat_1').prompt === M + ' ha già mangiato.' && SX.present('gn_f_read_0').prompt === F + ' non ha ancora letto.' &&
    SX.key('gn_f_read_0').model === 'No, non ha ancora letto.' && SX.key('gn_f_drink_1').model === 'Sì, ha già bevuto.');
  check('giusto', ok(SX.key('gn_m_eat_1'), 'Sì, ha già mangiato.') && ok(SX.key('gn_m_eat_1'), 'Ha già mangiato.') && ok(SX.key('gn_f_eat_0'), 'No, ' + F + ' non ha ancora mangiato.') &&
    (n => ok(n, n.model) && ok(n, n.model + ' ' + n.complete))(SX.neg('gn_m_read_1')));
  check('sbagliato: non ha già, ha ancora, senza già, sì/no', !ok(SX.key('gn_f_read_0'), 'No, non ha già letto.') && !ok(SX.key('gn_m_eat_1'), 'Sì, ha ancora mangiato.') &&
    !ok(SX.key('gn_m_eat_1'), 'Sì, ha mangiato.') && !ok(SX.key('gn_m_eat_1'), 'No, non ha ancora mangiato.') && !ok(SX.key('gn_f_read_0'), 'Sì, non ha ancora letto.'));
  check('allievo', evalAsk('gn_m_eat_1', M + ' ha già mangiato?').kind === 'yes' && evalAsk('gn_f_read_0', F + ' ha già letto?').kind === 'no' &&
    answerAsk('gn_f_read_0', { kind: 'no', ask: 'read' }) === 'No, non ha ancora letto.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 69: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 69: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 70: «Volere»
{
  const SX = run('SVO'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l70');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 70 c\'è', !!l && l.vo && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('vo_m_eat').prompt === M + ' vuole mangiare un\'arancia.' && SX.key('vo_f_drink').prompt === 'Che cosa vuole fare ' + F + '?' && SX.key('vo_f_phone').model === F + ' vuole telefonare.');
  check('giusto', ok(SX.key('vo_m_read'), 'Vuole leggere un libro.') && ok(SX.key('vo_m_open'), M + ' vuole aprire la porta.') && ok(SX.yes('vo_f_close'), 'Sì, vuole chiudere la finestra.'));
  const n = SX.neg('vo_m_eat');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: vuole + verbo coniugato, voglio, verbo, cosa', !ok(SX.key('vo_m_eat'), 'Vuole mangia un\'arancia.') && !ok(SX.key('vo_m_eat'), 'Voglio mangiare un\'arancia.') &&
    !ok(SX.key('vo_m_eat'), 'Vuole bere un\'aranciata.') && !ok(SX.key('vo_m_open'), 'Vuole aprire la finestra.'));
  check('allievo', evalAsk('vo_m_eat', 'Che cosa vuole fare ' + M + '?').kind === 'what' && evalAsk('vo_m_eat', M + ' vuole telefonare?').kind === 'no' &&
    answerAsk('vo_m_eat', { kind: 'no', ask: 'phone' }) === 'No, ' + M + ' non vuole telefonare. ' + M + ' vuole mangiare un\'arancia.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 70: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 70: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 71: «Potere»
{
  const SX = run('SPO'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l71');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 71 c\'è', !!l && l.po && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('po_m_key_1').prompt === M + ' ha la chiave. Può aprire la porta.' && SX.key('po_f_key_0').prompt === F + ' può aprire la porta?' &&
    SX.key('po_f_key_0').model === 'No, non può aprire la porta.' && SX.key('po_m_phone_1').model === 'Sì, può telefonare.');
  check('giusto', ok(SX.key('po_m_book_1'), 'Sì, può leggere il libro.') && ok(SX.key('po_m_book_1'), 'Può leggere.') && ok(SX.key('po_f_phone_0'), 'No, ' + F + ' non può telefonare.'));
  check('sbagliato: può + verbo coniugato, posso, sì/no scambiati', !ok(SX.key('po_m_key_1'), 'Sì, può apre la porta.') && !ok(SX.key('po_m_key_1'), 'Sì, posso aprire la porta.') &&
    !ok(SX.key('po_f_key_0'), 'Sì, può aprire la porta.') && !ok(SX.key('po_m_key_1'), 'No, non può aprire la porta.'));
  check('allievo', evalAsk('po_m_key_1', M + ' può aprire la porta?').kind === 'yes' && evalAsk('po_f_key_0', F + ' può aprire la porta?').kind === 'no' &&
    answerAsk('po_f_key_0', { kind: 'no', ask: 'open' }) === 'No, non può aprire la porta.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 71: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 71: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 72: «Dovere»
{
  const SX = run('SDV'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l72');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 72 c\'è', !!l && l.dv && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('dv_f_open').prompt === F + ' deve aprire la porta.' && SX.key('dv_m_close').prompt === 'Che cosa deve fare ' + M + '?' && SX.key('dv_m_close').model === M + ' deve chiudere la finestra.');
  check('giusto e sbagliato', ok(SX.key('dv_f_phone'), 'Deve telefonare.') && !ok(SX.key('dv_f_phone'), 'Vuole telefonare.') && !ok(SX.key('dv_f_phone'), 'Deve telefona.') &&
    !ok(SX.key('dv_f_phone'), 'Devo telefonare.') && evalAsk('dv_f_open', 'Che cosa deve fare ' + F + '?').kind === 'what');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 72: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 72: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 73: «Ancora — non più»
{
  const SX = run('SAN'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l73');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 73 c\'è', !!l && l.an && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('an_m_read_1').prompt === M + ' legge ancora.' && SX.present('an_f_eat_0').prompt === F + ' non mangia più.' &&
    SX.key('an_f_eat_0').prompt === F + ' mangia ancora?' && SX.key('an_f_eat_0').model === 'No, non mangia più.' && SX.key('an_f_drink_1').model === 'Sì, beve ancora.');
  check('giusto', ok(SX.key('an_m_read_1'), 'Sì, legge ancora.') && ok(SX.key('an_m_read_1'), M + ' legge ancora.') && ok(SX.key('an_f_read_0'), 'No, ' + F + ' non legge più.') &&
    (n => ok(n, n.model) && ok(n, n.model + ' ' + n.complete))(SX.neg('an_m_eat_1')));
  check('sbagliato: non … ancora, … più senza non, sì/no', !ok(SX.key('an_f_eat_0'), 'No, non mangia ancora.') && !ok(SX.key('an_f_eat_0'), 'No, mangia più.') &&
    !ok(SX.key('an_m_read_1'), 'No, non legge più.') && !ok(SX.key('an_m_read_1'), 'Sì, legge.'));
  check('allievo', evalAsk('an_m_read_1', M + ' legge ancora?').kind === 'yes' && evalAsk('an_f_eat_0', F + ' mangia ancora?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 73: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 73: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 74: «Al telefono»
{
  const SX = run('STL'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l74');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 74 c\'è', !!l && l.tl && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('tl_m').prompt === 'Pronto, sono ' + M + '.' && SX.key('tl_nonno').prompt === 'Chi parla?' && SX.key('tl_nonno').model === 'Parla il nonno.' && SX.key('tl_anna').model === 'Parla Anna.');
  check('giusto', ok(SX.key('tl_f'), 'Parla ' + F + '.') && ok(SX.key('tl_f'), 'È ' + F + '.') && ok(SX.yes('tl_nonna'), 'Sì, parla la nonna.') && ok(SX.present('tl_marco'), 'Pronto, sono Marco.'));
  const n = SX.neg('tl_m');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: persona, senza il, sono come risposta', !ok(SX.key('tl_m'), 'Parla ' + F + '.') && !ok(SX.key('tl_nonno'), 'Parla nonno.') && !ok(SX.key('tl_m'), 'Sono ' + M + '.') &&
    !ok(SX.key('tl_nonno'), 'Parla la nonna.'));
  check('allievo', evalAsk('tl_m', 'Chi parla?').kind === 'what' && answerAsk('tl_m', { kind: 'what' }) === 'Pronto, sono ' + M + '.' && evalAsk('tl_m', 'Parla il nonno?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 74: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 74: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 75: «Preposizioni di luogo»
{
  const SX = run('SDVP'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l75');
  check('lezione 75 c\'è', !!l && l.dvp && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('dvp_suitcase_davanti').prompt === 'La valigia è davanti al tavolo.' && SX.key('dvp_book_sul').prompt === 'Dov\'è il libro?' && SX.key('dvp_book_accanto').model === 'Il libro è accanto al tavolo.');
  check('giusto', ok(SX.key('dvp_suitcase_sotto'), 'È sotto il tavolo.') && ok(SX.key('dvp_book_sul'), 'Il libro è sopra il tavolo.') && ok(SX.key('dvp_suitcase_dietro'), 'Dietro al tavolo.'));
  const n = SX.neg('dvp_book_sotto');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: davanti il, accanto il, su il, il posto, la cosa', !ok(SX.key('dvp_suitcase_davanti'), 'La valigia è davanti il tavolo.') && !ok(SX.key('dvp_book_accanto'), 'È accanto il tavolo.') &&
    !ok(SX.key('dvp_book_sul'), 'È su il tavolo.') && !ok(SX.key('dvp_suitcase_sotto'), 'È sul tavolo.') && !ok(SX.key('dvp_suitcase_sotto'), 'Il libro è sotto il tavolo.'));
  check('allievo', evalAsk('dvp_suitcase_sotto', 'Dov\'è la valigia?').kind === 'what' && evalAsk('dvp_suitcase_sotto', 'La valigia è dietro il tavolo?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 75: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 75: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 76: «Mi, Le, ci»
{
  const SX = run('SMC'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l76');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 76 c\'è', !!l && l.mc && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('mc_m_me_book').prompt === M + ' mi dà il libro.' && SX.key('mc_m_me_book').prompt === 'Che cosa mi dà ' + M + '?' && SX.key('mc_m_me_book').model === 'Le dà il libro.' &&
    SX.key('mc_f_us_cup').model === 'Ci dà la tazza.');
  check('giusto', ok(SX.key('mc_f_me_key'), 'Le dà la chiave.') && ok(SX.yes('mc_m_us_phone'), 'Sì, ci dà il telefono.') && ok(SX.present('mc_m_me_pen'), M + ' mi dà la penna.'));
  const n = SX.neg('mc_m_me_book');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: mi nella risposta, gli, le/ci scambiati, la cosa', !ok(SX.key('mc_m_me_book'), 'Mi dà il libro.') && !ok(SX.key('mc_m_me_book'), 'Gli dà il libro.') &&
    !ok(SX.key('mc_f_us_cup'), 'Le dà la tazza.') && !ok(SX.key('mc_m_me_book'), 'Ci dà il libro.') && !ok(SX.key('mc_m_me_book'), 'Le dà la penna.'));
  check('allievo', evalAsk('mc_m_me_book', 'Che cosa Le dà ' + M + '?').kind === 'what' && answerAsk('mc_m_me_book', { kind: 'what' }) === 'Mi dà il libro.');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 76: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 76: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 77: «Il passato con essere»
{
  const SX = run('SPE'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l77');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 77 c\'è', !!l && l.pe && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('pe_f_parigi').prompt === F + ' è andata a Parigi.' && SX.key('pe_m_roma').prompt === 'Dove è andato ' + M + '?' && SX.key('pe_m_newyork').model === M + ' è andato a New York.');
  check('giusto', ok(SX.key('pe_m_roma'), 'È andato a Roma.') && ok(SX.key('pe_m_roma'), 'A Roma.') && ok(SX.key('pe_f_londra'), F + ' è andata a Londra.') && ok(SX.yes('pe_f_roma'), 'Sì, è andata a Roma.'));
  const n = SX.neg('pe_m_londra');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: avere, accordo, in, città', !ok(SX.key('pe_m_roma'), M + ' ha andato a Roma.') && !ok(SX.key('pe_f_parigi'), F + ' è andato a Parigi.') &&
    !ok(SX.key('pe_m_roma'), 'È andato in Roma.') && !ok(SX.key('pe_m_roma'), 'È andato a Londra.') && !ok(SX.key('pe_m_roma'), 'A Londra.'));
  check('allievo', evalAsk('pe_m_roma', 'Dove è andato ' + M + '?').kind === 'what' && evalAsk('pe_m_roma', M + ' è andato a Londra?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 77: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 77: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 78: «L'ho visto»
{
  const SX = run('SVI'), evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const l = run('LESSONS').find(l => l.id === 'l78');
  const P = run('p3People()'), M = run('TEACHERS')[P.m].name, F = run('TEACHERS')[P.f].name;
  check('lezione 78 c\'è', !!l && l.vi && l.level === 3);
  check('figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
  check('frasi', SX.present('vi_m_colosseo').prompt === M + ' ha visto il Colosseo. L\'ha visto.' && SX.yes('vi_f_eiffel').model === 'Sì, l\'ha vista.' &&
    SX.key('vi_f_liberta').model === F + ' ha visto la Statua della Libertà.');
  check('giusto', ok(SX.yes('vi_m_bigben'), 'Sì, l\'ha visto.') && ok(SX.key('vi_m_colosseo'), 'Ha visto il Colosseo.') && ok(SX.key('vi_f_eiffel'), F + ' ha visto la Torre Eiffel.'));
  const n = SX.neg('vi_m_colosseo');
  check('giusto: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('sbagliato: accordo, senza l\', monumento', !ok(SX.yes('vi_f_eiffel'), 'Sì, l\'ha visto.') && !ok(SX.yes('vi_m_colosseo'), 'Sì, l\'ha vista.') &&
    !ok(SX.key('vi_m_colosseo'), 'Ha visto la Torre Eiffel.') && !ok(SX.key('vi_m_colosseo'), 'Ha visto la Colosseo.'));
  check('allievo', evalAsk('vi_m_colosseo', 'Che cosa ha visto ' + M + '?').kind === 'what' && evalAsk('vi_m_colosseo', M + ' ha visto il Big Ben?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('lezione 78: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('lezione 78: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezioni 79 e 80 (livello 4): il futuro e il gerundio (forme_it.js)
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const M = run("vName('m')"), F = run("vName('f')");
  [['l79', 'fu', 'SFU', 'leggerà', 'Che cosa farà ' + M + ' domani?', 'legge'], ['l80', 'ge', 'SGE', 'sta leggendo', 'Che cosa sta facendo ' + M + '?', 'leggendo'],
   ['l88', 'ipf', 'SIMPF', 'leggeva', 'Che cosa faceva ' + M + ' prima?', 'leggiva']].forEach(([id, f, sx, form, q, bad]) => {
    const SX = run(sx), l = run('LESSONS').find(l => l.id === id);
    check('lezione ' + id + ' c\'è, livello 4', !!l && l[f] && l.level === 4);
    check(id + ': figure', l.known.every(k => FIG[k] && FIG[k].indexOf('<svg') === 0 && FIG[k].indexOf(' id=') === -1));
    check(id + ': frasi', SX.key(f + '_m_read').model === M + ' ' + form + ' un libro.' && SX.key(f + '_m_read').prompt === q);
    check(id + ': giusto', ok(SX.key(f + '_m_read'), M + ' ' + form + ' un libro.') && ok(SX.key(f + '_m_read'), 'Lui ' + form + ' un libro.'));
    const n = SX.neg(f + '_m_read');
    check(id + ': il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete) && !ok(n, 'No.'));
    check(id + ': sbagliato: un altro tempo, un\'altra persona, un\'altra cosa', !ok(SX.key(f + '_m_read'), M + ' ' + bad + ' un libro.') &&
      !ok(SX.key(f + '_m_read'), M + ' ha letto un libro.') && !ok(SX.key(f + '_m_read'), F + ' ' + form + ' un libro.') && !ok(SX.key(f + '_m_read'), M + ' ' + form + ' la porta.'));
    check(id + ': allievo', evalAsk(f + '_m_read', q).kind === 'what' && evalAsk(f + '_m_read', M + ' ' + form.replace('leggerà', 'telefonerà').replace('sta leggendo', 'sta telefonando').replace('leggeva', 'telefonava') + '?').kind === 'no' &&
      !evalAsk(f + '_m_read', M + ' telefona?').ok);
    const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
    check(id + ': risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
    check(id + ': ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  });
}

// Lezione 81: «Che lingua parla?» e lezione 82: «Parla con…» (fumetto dalla bocca, niente telefono)
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok;
  const SL = run('SLG'), SP = run('SPC'), M = run("vName('m')"), F = run("vName('f')");
  check('lezione 81 c\'è, livello 4', run('LESSONS').find(l => l.id === 'l81').level === 4);
  check('81: frasi', SL.present('lg_f_america').prompt === 'Questa signora è americana. Parla inglese.' && SL.key('lg_f_germania').prompt === 'Che lingua parla questa signora?' &&
    SL.key('lg_f_germania').model === 'Questa signora parla tedesco.');
  check('81: giusto', ok(SL.key('lg_f_america'), 'Questa signora parla inglese.') && ok(SL.key('lg_f_america'), 'Parla inglese.') && ok(SL.key('lg_m_giappone'), 'Lui parla giapponese.'));
  check('81: sbagliato', !ok(SL.key('lg_f_america'), 'Questa signora parla americano.') && !ok(SL.key('lg_f_germania'), 'Questa signora parla tedesca.') &&
    !ok(SL.key('lg_f_america'), 'Questa signore parla inglese.') && !ok(SL.key('lg_m_italia'), 'Questo signore parla francese.'));
  check('81: allievo', evalAsk('lg_m_cina', 'Che lingua parla questo signore?').kind === 'what' && evalAsk('lg_m_cina', 'Questo signore parla giapponese?').kind === 'no');
  check('lezione 82 c\'è, livello 4', run('LESSONS').find(l => l.id === 'l82').level === 4);
  check('82: frasi', SP.present('pc_f_m').prompt === F + ' parla con ' + M + '.' && SP.key('pc_m_nonna').prompt === 'Con chi parla ' + M + '?' && SP.key('pc_m_nonna').model === M + ' parla con la nonna.');
  check('82: giusto', ok(SP.key('pc_m_nonna'), M + ' parla con la nonna.') && ok(SP.key('pc_m_nonna'), 'Lui parla con la nonna.') && ok(SP.key('pc_nonno_marco'), 'Il nonno parla con Marco.'));
  check('82: sbagliato', !ok(SP.key('pc_m_nonna'), M + ' parla con nonna.') && !ok(SP.key('pc_m_nonna'), M + ' parla con Anna.') && !ok(SP.key('pc_f_m'), M + ' parla con ' + F + '.'));
  check('82: allievo', evalAsk('pc_nonno_marco', 'Con chi parla il nonno?').kind === 'what' && evalAsk('pc_nonno_marco', 'Il nonno parla con Anna?').kind === 'no');
  check('74, 82: niente telefono, nel fumetto parole conosciute', fs.readFileSync('www/js/telef_it.js', 'utf8').indexOf('V_SCENE.phone') === -1 && run("tlTalk('tl_nonno')").indexOf('sono il nonno.') !== -1 &&
    run("pcWords('pc_m_nonna')") === 'Buongiorno!' && fs.readFileSync('www/js/parlacon_it.js', 'utf8').indexOf('bla') === -1);
  check('81: il saluto nella lingua', run('LG_HELLO').giapponese[0] === 'こんにちは' && run('LG_HELLO').inglese[0] === 'Hello!');
  check('13: anche il tedesco e il giapponese', run('LESSONS').find(l => l.id === 'l13').known.indexOf('n_f_germania') !== -1 && FIG.n_m_giappone.indexOf('<svg') === 0);
  ['l81', 'l82', 'l13'].forEach(id => {
    const st = buildSteps(run('LESSONS').find(l => l.id === id)), models = st.filter(s => s.model && s.type !== 'reveal');
    check(id + ': risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
    check(id + ': ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
  });
}

// Lezione 88: la presentazione dice anche «Ora …» (non si controlla)
check('88: prima e ora', run("SIMPF.present('ipf_m_read').prompt") === 'Prima ' + run("vName('m')") + ' leggeva un libro. Ora telefona.' &&
  evaluate(run("SIMPF.present('ipf_m_read')"), 'Prima ' + run("vName('m')") + ' leggeva un libro. Ora telefona.').ok);

// Lezione 83: «Di che cosa è fatto?»
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok, SX = run('SMD');
  const l = run('LESSONS').find(l => l.id === 'l83');
  check('lezione 83 c\'è, livello 4', !!l && l.md && l.level === 4);
  check('83: frasi', SX.key('md_table_legno').prompt === 'Di che cosa è fatto il tavolo?' && SX.key('md_chair_plastica').prompt === 'Di che cosa è fatta la sedia?' &&
    SX.key('md_bottle_vetro').model === 'La bottiglia è di vetro.');
  check('83: giusto', ok(SX.key('md_chair_plastica'), 'La sedia è di plastica.') && ok(SX.key('md_chair_plastica'), 'È fatta di plastica.') && ok(SX.key('md_table_legno'), 'Il tavolo è fatto di legno.'));
  check('83: sbagliato', !ok(SX.key('md_chair_plastica'), 'La sedia è fatto di plastica.') && !ok(SX.key('md_chair_plastica'), 'Il sedia è di plastica.') && !ok(SX.key('md_key_metallo'), 'La chiave è di legno.'));
  const n = SX.neg('md_bag_pelle');
  check('83: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('83: allievo', evalAsk('md_table_legno', 'Di che cosa è fatto il tavolo?').kind === 'what' && evalAsk('md_table_legno', 'Il tavolo è di vetro?').kind === 'no' && !evalAsk('md_table_legno', 'Di che cosa è fatta il tavolo?').ok);
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('83: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('83: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 84: «Ci vuole — ci vogliono»
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok, SX = run('SCU');
  const l = run('LESSONS').find(l => l.id === 'l84');
  check('lezione 84 c\'è, livello 4', !!l && l.cu && l.level === 4);
  check('84: frasi', SX.present('cu_porta').prompt === 'Per aprire la porta ci vuole una chiave.' && SX.key('cu_leggere').prompt === 'Che cosa ci vuole per leggere?' &&
    SX.key('cu_leggere').model === 'Ci vogliono un libro e una lampada.');
  check('84: giusto', ok(SX.key('cu_leggere'), 'Per leggere ci vogliono una lampada e un libro.') && ok(SX.key('cu_porta'), 'Ci vuole la chiave.') && ok(SX.key('cu_colazione'), 'Ci vogliono un caffè e un uovo.'));
  check('84: sbagliato: vuole / vogliono, la cosa', !ok(SX.key('cu_leggere'), 'Ci vuole un libro e una lampada.') && !ok(SX.key('cu_porta'), 'Ci vogliono una chiave.') &&
    !ok(SX.key('cu_leggere'), 'Ci vogliono un libro.') && !ok(SX.key('cu_ora'), 'Ci vuole un telefono.'));
  const n = SX.neg('cu_newyork');
  check('84: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('84: allievo', evalAsk('cu_porta', 'Che cosa ci vuole per aprire la porta?').kind === 'what' && evalAsk('cu_porta', 'Per aprire la porta ci vuole un telefono?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('84: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('84: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 85: «Piace — piacciono»
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok, SX = run('SPI'), M = run("vName('m')"), F = run("vName('f')");
  const l = run('LESSONS').find(l => l.id === 'l85');
  check('lezione 85 c\'è, livello 4', !!l && l.pi && l.level === 4);
  check('85: frasi', SX.present('pi_m_caffe').prompt === 'A ' + M + ' piace il caffè.' && SX.key('pi_f_fiori').prompt === 'Che cosa piace a ' + F + '?' &&
    SX.key('pi_f_fiori').model === 'A ' + F + ' piacciono i fiori.');
  check('85: giusto', ok(SX.key('pi_f_fiori'), 'Le piacciono i fiori.') && ok(SX.key('pi_m_libri'), 'A lui piacciono i libri.') && ok(SX.key('pi_m_caffe'), 'Gli piace il caffè.'));
  check('85: sbagliato: piace / piacciono, a, gli / le', !ok(SX.key('pi_f_fiori'), 'A ' + F + ' piace i fiori.') && !ok(SX.key('pi_m_caffe'), 'A ' + M + ' piacciono il caffè.') &&
    !ok(SX.key('pi_m_caffe'), M + ' piace il caffè.') && !ok(SX.key('pi_f_fiori'), 'Gli piacciono i fiori.') && !ok(SX.key('pi_m_caffe'), 'A ' + M + ' piace il vino.'));
  const n = SX.neg('pi_f_vino');
  check('85: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('85: allievo', evalAsk('pi_m_caffe', 'Che cosa piace a ' + M + '?').kind === 'what' && evalAsk('pi_m_caffe', 'A ' + M + ' piacciono le mele?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('85: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('85: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 86: «Le quattro stagioni»
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok, SX = run('SSG');
  const l = run('LESSONS').find(l => l.id === 'l86');
  check('lezione 86 c\'è, livello 4', !!l && l.sg && l.level === 4);
  check('86: frasi', SX.present('sg_apr').prompt === 'È aprile. È primavera.' && SX.key('sg_gen').model === 'È inverno.' && SX.key('sg_ott').prompt === 'Che stagione è?');
  check('86: giusto', ok(SX.key('sg_apr'), 'È primavera.') && ok(SX.key('sg_apr'), 'È la primavera.') && ok(SX.key('sg_lug'), 'È l\'estate.') && ok(SX.key('sg_nov'), 'È novembre. È autunno.'));
  check('86: sbagliato', !ok(SX.key('sg_apr'), 'È aprile.') && !ok(SX.key('sg_apr'), 'È inverno.') && !ok(SX.key('sg_apr'), 'È primavera. È maggio.'));
  const n = SX.neg('sg_feb');
  check('86: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('86: allievo', evalAsk('sg_apr', 'Che stagione è?').kind === 'what' && evalAsk('sg_apr', 'È estate?').kind === 'no');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('86: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('86: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Lezione 87: «Il tempo che fa»
{
  const evalAsk = run('evalAsk'), buildDrill = run('buildDrill'), ok = (st, t) => evaluate(st, t).ok, SX = run('STF');
  const l = run('LESSONS').find(l => l.id === 'l87');
  check('lezione 87 c\'è, livello 4', !!l && l.tf && l.level === 4);
  check('87: frasi', SX.present('tf_sole').prompt === 'C\'è il sole.' && SX.key('tf_piove').prompt === 'Che tempo fa?' && SX.key('tf_caldo').model === 'Fa caldo.');
  check('87: giusto', ok(SX.key('tf_sole'), 'C\'è il sole.') && ok(SX.key('tf_piove'), 'Piove.') && ok(SX.key('tf_nuvoloso'), 'È nuvoloso.') && ok(SX.key('tf_freddo'), 'Fa freddo.'));
  check('87: sbagliato', !ok(SX.key('tf_sole'), 'Fa sole.') && !ok(SX.key('tf_piove'), 'È piove.') && !ok(SX.key('tf_nevica'), 'Piove.') && !ok(SX.key('tf_caldo'), 'Fa freddo.'));
  const n = SX.neg('tf_vento');
  check('87: il no', ok(n, n.model) && ok(n, n.model + ' ' + n.complete));
  check('87: allievo', evalAsk('tf_sole', 'Che tempo fa?').kind === 'what' && evalAsk('tf_sole', 'Piove?').kind === 'no' && evalAsk('tf_sole', 'C\'è il sole?').kind === 'yes');
  const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
  check('87: risposte modello giuste', models.every(s => evaluate(s, s.model).ok));
  check('87: ripetizioni giuste', models.every(s => buildDrill(s, 5, s.reviewItems || []).every(d => evaluate(d, d.model).ok)));
}

// Test del livello 3: 8 che contano e 2 libere, dopo la lezione 78
{
  const t3 = run('LESSONS').find(l => l.id === 't3'), st = buildSteps(t3);
  check('test 3 c\'è, dopo la lezione 78', !!t3 && t3.test === 3 && t3.level === 3 && run('LESSONS').indexOf(t3) === run('LESSONS').findIndex(l => l.id === 'l78') + 1);
  check('test 3: 8 che contano + 2 libere', st.filter(s => s.type !== 'free').length === 8 && st.filter(s => s.type === 'free').length === 2 && st.every(s => s.test));
  check('test 3: le risposte giuste sono giuste', st.filter(s => s.type !== 'free' && s.type !== 'ask').every(s => evaluate(s, s.model).ok));
  check('test 3: la domanda dell\'allievo', (s => run('evalAsk')(s.askFig, s.model).ok)(st.find(s => s.type === 'ask')));
  check('test 3: figure', st.every(s => FIG[s.show] && FIG[s.show].indexOf('<svg') === 0));
  check('test 3: lezioni da ripassare (livello 3)', st.filter(s => s.tlesson).every(s => run('LESSONS').find(l => l.id === s.tlesson).level === 3));
}

// Dal livello 2 le lezioni sono più veloci (Massi): una sola presentazione, 4 sì/no mescolati, sempre 7 domande dell'allievo
{
  const L = run('LESSONS'), l38 = L.find(l => l.id === 'l38'), l39 = L.find(l => l.id === 'l39');
  const a = buildSteps(l38), b = buildSteps(l39), cnt = (st, ph) => st.filter(s => s.phase === ph).length;
  check('livello 2 veloce: una presentazione per figura', cnt(b, 'present') === l39.known.length && cnt(a, 'present') > l38.known.length);
  check('livello 2 veloce: niente giri di sì e di no', !cnt(b, 'yes') && !cnt(b, 'neg') && cnt(b, 'yesno') === 4);
  check('livello 2 veloce: 7 domande dell\'allievo', b.filter(s => s.type === 'ask').length === 7);
  check('livello 2 veloce: più corta, voce normale', b.length < a.length * 0.6 && b.filter(s => s.phase === 'present').every(s => !s.speed));
  const rv = b.filter(s => s.review), ids = rv.map(s => s.review);
  check('livello 2: 7 domande chiave di ripasso, di lezioni passate diverse', rv.length === 7 && new Set(ids).size === 7 &&
    ids.every(id => L.findIndex(l => l.id === id) < L.indexOf(l39)) && rv.every(s => s.type === 'key'));
  const ra = a.filter(s => s.review);
  check('livello 1: ripasso nell\'introduzione e negli esercizi', ra.length === 9 && ra.filter(s => s.phase === 'review').length === 3 && ra.filter(s => s.phase === 'mix').length === 6);
  check('ripasso: mai prima della presentazione, mai subito prima delle domande dell\'allievo', a[0].phase === 'present' && !a.some((s, i) => s.review && a[i + 1] && a[i + 1].type === 'ask'));
  let rok = true;
  for (let k = 0; k < 10; k++) L.filter(l => l.level === 2).forEach(l => buildSteps(l).filter(s => s.review).forEach(s => {
    rok = rok && evaluate(s, s.model).ok && buildDrill(s, 5, s.reviewItems).every(d => evaluate(d, d.model).ok);
  }));
  check('ripasso: risposte e ripetizioni giuste', rok);
}

// Test del livello 1: 8 domande che contano e 2 descrizioni libere (regole delle lezioni)
{
  const t1 = run('LESSONS').find(l => l.id === 't1');
  const st = buildSteps(t1);
  check('test 1 c\'è, dopo la lezione 38', !!t1 && t1.test && run('LESSONS').indexOf(t1) === run('LESSONS').findIndex(l => l.id === 'l38') + 1);
  check('test 1: 8 che contano + 2 libere', st.filter(s => s.type !== 'free').length === 8 && st.filter(s => s.type === 'free').length === 2 && st.every(s => s.test));
  check('test 1: le risposte giuste sono giuste', st.filter(s => s.type !== 'free' && s.type !== 'ask').every(s => evaluate(s, s.model).ok));
  check('test 1: la domanda dell\'allievo', (s => run('evalAsk')(s.askFig, s.model).ok)(st.find(s => s.type === 'ask')));
  check('test 1: figure', st.every(s => FIG[s.show] && FIG[s.show].indexOf('<svg') === 0));
  check('test 1: lezioni da ripassare', run('testReviewLessons')([{ ok: false, tlesson: 'l28' }, { ok: true, tlesson: 'l20' }, { ok: false, tlesson: 'l17' }, { ok: null, tlesson: 'l5' }]).join() === 'l17,l28');
  check('numero delle lezioni: il test non conta', run('lessonNumber')(run('LESSONS').find(l => l.id === 'l39')) === 39);
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
