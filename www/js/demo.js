'use strict';
/* =====================================================================
   LEZIONE DIMOSTRATIVA
   L'app gioca da sola: l'insegnante fa le domande, uno studente finto risponde,
   un cerchio bianco mostra quali tasti toccare. Lo studente guarda e basta.
   ===================================================================== */

let DEMO = 0;
let demoActive = false;
let demoNext = null;
const DEMO_STOP = { stop: true };
const DEMO_STEPS = 8;

function startDemo(next) {
  stopLesson();
  DEMO++;
  const run = DEMO;
  demoActive = true;
  demoNext = next;
  const t = TEACHERS[selectedTeacherKey()];
  $('l-title').textContent = 'Demo';
  $('l-teacher').innerHTML = avatarHtml(t, 'small') + '<span>' + t.name + '</span>';
  $('heard').textContent = '';
  applyUiWords();
  $('btn-exit').textContent = 'Skip the demo';
  $('demo-caption').classList.remove('hidden');
  $('demo-finger').classList.add('hidden');
  setProgress(0, DEMO_STEPS);
  buildGrid(['book', 'table', 'chair', 'pen']);
  showScreen('lesson', currentScreen !== 'home');
  Awake.keep();
  Mouth.gender = t.gender;
  setStageTeacher(t.key);
  setPose('show');
  demoScript(t, run).then(() => endDemo(run), () => {});
}

function stopDemo() {
  if (!demoActive) return;
  DEMO++;
  demoActive = false;
  Mouth.cancel();
  Awake.allow();
  $('demo-caption').classList.add('hidden');
  $('demo-finger').classList.add('hidden');
  applyUiWords();
  $('screen-lesson').classList.remove('tunnel');
  document.querySelectorAll('.demo-press').forEach(e => e.classList.remove('demo-press'));
}

function markDemoSeen() {
  DB.settings.demoSeen = true;
  saveDB();
}
function afterDemo(next) {
  markDemoSeen();
  if (next) startLesson(next);
  else goHome();
}
function endDemo(run) {
  if (run !== DEMO || !demoActive) return;
  const next = demoNext;
  stopDemo();
  afterDemo(next);
}
function skipDemo() {
  const next = demoNext;
  stopDemo();
  afterDemo(next);
}

async function demoScript(t, run) {
  const chk = () => { if (run !== DEMO) throw DEMO_STOP; };
  const sleep = async (ms) => { await new Promise(r => setTimeout(r, ms)); chk(); };
  const say = (text, rate, pitch, gender) => new Promise((res, rej) => {
    if (run !== DEMO) { rej(DEMO_STOP); return; }
    Mouth.speak(text, rate, pitch, () => { if (run === DEMO) res(); else rej(DEMO_STOP); }, gender);
  });
  const studentPitch = t.pitch > 1.05 ? 0.85 : 1.35;
  const T = (text, rate) => say(text, rate || t.rate, t.pitch);
  // lo studente finto ha l'altra voce: se l'insegnante è un uomo, una donna e viceversa
  const P = (text) => say(text, 1.0, studentPitch, t.gender === 'm' ? 'f' : 'm');
  const praise = async () => { flashGood(!!t.praiseEvery); setCue('ok'); if (t.praiseEvery) await T(pick(t.praise)); else await sleep(300); };
  const cap = (text) => { $('demo-caption').textContent = text; };
  const heard = (text) => { $('heard').textContent = text ? 'Heard: “' + text + '”' : ''; };
  const step = (n, obj, prompt) => {
    hideYourTurn();
    $('l-count').textContent = n + ' / ' + DEMO_STEPS;
    setProgress(n - 1, DEMO_STEPS);
    heard('');
    showIndicated(obj);
    setPrompt(prompt);
    setCue(/[?？]$/.test(prompt) ? 'q' : 'r');
    setPose(/[?？]$/.test(prompt) ? 'ask' : 'show');
    setStatus('Listen', '');
  };
  const finger = $('demo-finger');
  const tap = async (el) => {
    el.scrollIntoView({ block: 'center' });
    await sleep(300);
    const r = el.getBoundingClientRect();
    finger.classList.remove('hidden');
    finger.style.left = (r.left + r.width / 2) + 'px';
    finger.style.top = (r.top + r.height / 2) + 'px';
    await sleep(850);
    finger.classList.remove('tap');
    void finger.offsetWidth;
    finger.classList.add('tap');
    el.classList.add('demo-press');
    await sleep(380);
    el.classList.remove('demo-press');
    await sleep(250);
    finger.classList.add('hidden');
  };
  const studentTalks = async (text) => {
    if (stagePose === 'show') setPose('you');
    setStatus('Speak now', 'rec');
    await sleep(500);
    await P(text);
    heard(text.toLowerCase().replace(/[.!?。！？]/g, ''));
    setStatus('Correct', 'ok');
    await sleep(300);
  };

  cap('Demo lesson: just watch and listen. You don\'t need to touch anything.');
  setStatus('', '');
  showIndicated(null);
  await sleep(3000);

  // Le frasi vengono dal pacchetto della lingua (stesso flusso in ogni lingua)
  const pres = (x) => S.present(x).model;
  const yesQ = S.yes('book'), noBook = S.neg('table', 'book'), chairQ = S.yes('chair');
  const noChairOnBook = S.neg('book', 'chair');
  const altQ = altPrompt('book', 'pen');

  // 1. Presentazione: tutti gli oggetti, tre giri, prima di qualsiasi domanda
  cap('The teacher points at each picture and says what it is. You repeat.');
  for (let r = 0; r < 3; r++) {
    for (const x of ['book', 'table', 'chair']) {
      step(1, x, pres(x));
      await T(pres(x));
      if (r === 0 && x === 'book') cap('Arrows: repeat the sentence. Red dot: your turn to speak.');
      await studentTalks(pres(x));
    }
    if (r === 0) cap('Three times, all the objects.');
  }
  await praise();

  // 2. Domanda con il sì: l'insegnante chiede, risponde lui e poi indica l'allievo
  step(2, 'book', yesQ.prompt);
  cap('Big «?»: it\'s a question.');
  await T(yesQ.prompt);
  cap('The teacher gives the answer, then points at you: repeat it.');
  await sleep(350);
  if (DB.settings.showText) $('prompt-text').textContent = shown(yesQ.model);
  await T(yesQ.model, t.modelRate);
  showYourTurn(t);
  await studentTalks(yesQ.model);
  hideYourTurn();
  await praise();

  // 3. Domanda con il no
  step(3, 'table', noBook.prompt);
  cap('If the question is wrong, say no.');
  await T(noBook.prompt);
  await studentTalks(noBook.model);
  await praise();

  // 4. Errore e correzione
  step(4, 'chair', chairQ.prompt);
  cap('If you make a mistake…');
  await T(chairQ.prompt);
  setStatus('Speak now', 'rec');
  await sleep(500);
  await P(COURSE.demoWrong);
  heard(COURSE.demoWrong.toLowerCase().replace(/[.!?。！？]/g, ''));
  flashBad();
  showMark(t.mark);
  setStatus('Try again', 'err');
  cap('…the teacher says the right answer. You repeat it, then you practise that word a little.');
  await T(t.wrong);
  if (DB.settings.showText) $('prompt-text').textContent = shown(chairQ.model);
  setCue('r');
  await T(chairQ.model, t.modelRate);
  $('screen-lesson').classList.remove('tunnel');
  await studentTalks(chairQ.model);
  await T(pres('chair'), t.modelRate);
  await studentTalks(pres('chair'));
  showIndicated('book');
  setPrompt(noChairOnBook.prompt);
  setCue('q');
  await T(noChairOnBook.prompt, t.modelRate);
  await studentTalks(noChairOnBook.model);
  hideMark();
  await praise();

  // 5. Oggetto nuovo: solo no, poi «Che cos'è?»
  const penNo = ['book', 'table', 'chair'].map(y => S.neg('pen', y));
  step(5, 'pen', penNo[0].prompt);
  cap('A new object. The teacher won\'t tell you its name. Keep saying no.');
  await T(penNo[0].prompt);
  await studentTalks(penNo[0].model);
  setPrompt(penNo[1].prompt);
  setCue('q');
  await T(penNo[1].prompt);
  await studentTalks(penNo[1].model);
  setPrompt(penNo[2].prompt);
  await T(penNo[2].prompt);
  await studentTalks(penNo[2].model);
  cap('…until you learn the question to ask.');
  setStatus('Listen', '');
  setPrompt(S.reveal('pen').prompt);
  setCue('');
  await sleep(1200);
  await T(S.reveal('pen').prompt);
  setCue('r');
  await studentTalks(Q);
  await praise();

  // 6. Silenzio: tasto Talk
  step(6, 'chair', Q);
  cap('If the app doesn\'t hear you…');
  await T(Q);
  setStatus('Speak now', 'rec');
  await sleep(2200);
  setStatus('Tap ' + uiWord('talk') + ' when you are ready', 'wait');
  cap('…tap ' + uiWord('talk') + ' and answer.');
  await sleep(600);
  await tap($('btn-talk'));
  await studentTalks(S.key('chair').model);
  await praise();

  // 7. Non ho capito: tasto Repeat
  step(7, 'pen', altQ);
  cap('Didn\'t catch the question?');
  await T(altQ);
  cap('Tap ' + uiWord('repeat') + ' to hear it again.');
  await tap($('btn-replay'));
  setStatus('Listen', '');
  await T(altQ);
  await studentTalks(S.key('pen').model);
  await praise();

  // 8. Le domande le fa l'allievo
  step(8, null, '');
  setCue('pick');
  cap('Once you know the question, you ask too: tap a picture and ask.');
  await T(COURSE.yourTurn);
  setStatus('Your turn: tap a picture, then ask', 'wait');
  setPickable(true);
  sweepFinger(() => run === DEMO);
  await sleep(4000);
  setPickable(false);
  await tap(document.querySelector('.object-box[data-obj="chair"]'));
  showIndicated('chair');
  setCue('q');
  await studentTalks(S.yes('table').prompt);
  setCue('ok');
  await T(answerAsk('chair', { ok: true, kind: 'no', ask: 'table' }), t.modelRate);
  setCue('pick');
  await sleep(400);
  await tap(document.querySelector('.object-box[data-obj="pen"]'));
  showIndicated('pen');
  setCue('q');
  await studentTalks(Q);
  setCue('ok');
  await T(answerAsk('pen', { ok: true, kind: 'what' }), t.modelRate);

  setProgress(DEMO_STEPS, DEMO_STEPS);
  cap('Now it\'s your turn!');
  setStatus('', '');
  setCue('');
  await T(COURSE.nowYou);
  await sleep(800);
}
