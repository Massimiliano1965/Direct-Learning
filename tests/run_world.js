'use strict';
// Test dei corsi di russo, arabo e cinese (lezioni 1 e 2, motore world.js): node tests/run_world.js
const fs = require('fs'), path = require('path'), vm = require('vm');
let fails = 0, count = 0;
function check(name, cond) { count++; if (!cond) { fails++; console.log('FALLITO: ' + name); } }

['ru', 'ar', 'zh'].forEach(code => {
  const ctx = { console: console };
  vm.createContext(ctx);
  ['teachers_world.js', 'course_' + code + '.js', 'data.js', 'logic.js', 'world.js', 'ui_lang.js'].forEach(f => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx, { filename: f });
  });
  const run = (c) => vm.runInContext(c, ctx);
  const evaluate = run('evaluate'), evalAsk = run('evalAsk'), answerAsk = run('answerAsk'), buildSteps = run('buildSteps'), buildDrill = run('buildDrill');
  const S = run('S'), PH = run('PH'), LESSONS = run('LESSONS'), FIG = run('FIG'), COURSE = run('COURSE'), ITEMS = run('ITEMS');
  const ok = (st, t) => evaluate(st, t).ok;
  const C = code + ': ';
  check(C + 'quattro lezioni, figure', LESSONS.length === 4 && Object.keys(ITEMS).every(k => FIG[k]));
  check(C + 'studenti italiani, inglesi, tedeschi', COURSE.students.join() === 'it,en,de');
  // tutte le frasi delle lezioni: le risposte modello sono giuste, anche nelle ripetizioni
  LESSONS.forEach(l => {
    for (let r = 0; r < 5; r++) {
      const st = buildSteps(l), models = st.filter(s => s.model && s.type !== 'reveal');
      check(C + l.id + ' risposte modello giuste', models.every(s => ok(s, s.model)));
      check(C + l.id + ' ripetizioni giuste', models.every(s => buildDrill(s, 5, run('lessonWords')(LESSONS.find(x => x.id === l.id))).every(d => ok(d, d.model))));
    }
  });
  // risposte sbagliate
  check(C + 'sbagliato: la cosa sbagliata', !ok(S.key('book'), PH.is('pen')) && !ok(S.yes('book'), PH.yes('pen')));
  check(C + 'sbagliato: sì e no scambiati', !ok(S.yes('book'), PH.no('book')) && !ok(S.neg('book', 'pen'), PH.yes('pen')));
  check(C + 'sbagliato: due cose nella risposta «o»', !ok(S.alt('book', 'pen'), PH.alt('book', 'pen')));
  check(C + 'il no con la frase giusta dopo', ok(S.neg('book', 'pen'), PH.no('pen') + ' ' + PH.is('book')));
  // domande dell'allievo
  check(C + 'allievo: che cos\'è', evalAsk('book', PH.what).kind === 'what' && answerAsk('book', { kind: 'what' }) === PH.is('book'));
  check(C + 'allievo: sì / no', evalAsk('book', PH.isQ('book')).kind === 'yes' && evalAsk('book', PH.isQ('pen')).kind === 'no');
  check(C + 'allievo: o', evalAsk('book', PH.alt('book', 'pen')).kind === 'alt');
  // la pronuncia: per ogni lingua dello studente, niente lettere che non si leggono (cirillico, arabo, caratteri cinesi)
  const all = [];
  LESSONS.forEach(l => buildSteps(l).forEach(s => { if (s.prompt) all.push(s.prompt); if (s.model) all.push(s.model); }));
  ['it', 'en', 'de'].forEach(ui => {
    const bad = all.map(t => COURSE.translit(t, ui)).filter(t => /[Ѐ-ӿ؀-ۿ一-鿿]/.test(t));
    check(C + 'pronuncia per ' + ui + ' completa' + (bad.length ? ': ' + bad[0] : ''), !bad.length);
  });
  console.log(code, '→ it:', COURSE.translit(PH.no('pen'), 'it'), '| en:', COURSE.translit(PH.no('pen'), 'en'), '| de:', COURSE.translit(PH.no('pen'), 'de'));
});
// il corso arabo: il «questo» deve andare con la parola
{
  const ctx = { console: console }; vm.createContext(ctx);
  ['teachers_world.js', 'course_ar.js', 'data.js', 'logic.js', 'world.js', 'ui_lang.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', f), 'utf8'), ctx));
  const r = (c) => vm.runInContext(c, ctx), S = r('S'), ev = r('evaluate');
  check('ar: هذه con una parola maschile è sbagliato', !ev(S.key('book'), 'هذه كتاب').ok && ev(S.key('book'), 'هذا كتاب').ok && ev(S.key('table'), 'هذه طاولة').ok && !ev(S.key('table'), 'هذا طاولة').ok);
  check('ar: ليس senza «-an» va bene lo stesso (il microfono)', ev(S.neg('book', 'pen'), 'لا هذا ليس قلم').ok);
}
console.log((count - fails) + ' / ' + count + ' test russo, arabo, cinese passati');
process.exit(fails ? 1 : 0);
