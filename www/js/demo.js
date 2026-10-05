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
const DEMO_STEPS = 7;

function startDemo(next) {
  stopLesson();
  DEMO++;
  const run = DEMO;
  demoActive = true;
  demoNext = next;
  const t = TEACHERS[selectedTeacherKey()];
  $('l-title').textContent = 'Demonstration';
  $('l-teacher').textContent = t.name;
  $('heard').textContent = '';
  applyUiWords();
  $('btn-exit').textContent = 'Salta la dimostrazione';
  $('demo-caption').classList.remove('hidden');
  $('demo-finger').classList.add('hidden');
  setProgress(0, DEMO_STEPS);
  buildGrid(['book', 'pen', 'pencil']);
  showScreen('lesson', currentScreen !== 'home');
  Awake.keep();
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
  const say = (text, rate, pitch) => new Promise((res, rej) => {
    if (run !== DEMO) { rej(DEMO_STOP); return; }
    Mouth.speak(text, rate, pitch, () => { if (run === DEMO) res(); else rej(DEMO_STOP); });
  });
  const studentPitch = t.pitch > 1.05 ? 0.85 : 1.35;
  const T = (text, rate) => say(text, rate || t.rate, t.pitch);
  const P = (text) => say(text, 1.0, studentPitch);
  const praise = async () => { flashGood(); await T(t.praise[Math.floor(Math.random() * t.praise.length)]); };
  const cap = (text) => { $('demo-caption').textContent = text; };
  const heard = (text) => { $('heard').textContent = text ? 'Sentito: «' + text + '»' : ''; };
  const step = (n, obj, prompt) => {
    $('l-count').textContent = n + ' / ' + DEMO_STEPS;
    setProgress(n - 1, DEMO_STEPS);
    heard('');
    showIndicated(obj);
    setPrompt(prompt);
    setStatus('Ascolta', '');
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
    setStatus('Parla ora', 'rec');
    await sleep(500);
    await P(text);
    heard(text.toLowerCase().replace(/[.,!?]/g, ''));
    setStatus('Giusto', 'ok');
    await sleep(300);
  };

  cap('Lezione di prova: guarda e ascolta. Non devi toccare niente.');
  setStatus('', '');
  showIndicated(null);
  await sleep(3000);

  // 1. Presentazione
  step(1, 'book', 'This is a book.');
  cap("L'insegnante indica una figura e dice cos'è.");
  await T('This is a book.');
  cap('Pallino rosso: parla tu. Ripeti la frase.');
  await studentTalks('This is a book.');
  await praise();

  // 2. Domanda-risposta
  step(2, 'book', 'Is this a book?');
  cap('Poi fa una domanda. Rispondi con una frase intera.');
  await T('Is this a book?');
  await studentTalks('Yes, it is.');
  await praise();

  // 3. Negativa
  step(3, 'book', 'Is this a pen?');
  cap('Se la domanda è sbagliata, rispondi di no e correggi.');
  await T('Is this a pen?');
  await studentTalks("No, it isn't. It's a book.");
  await praise();

  // 4. Errore e correzione
  step(4, 'pen', 'What is this?');
  cap('Se sbagli…');
  await T('What is this?');
  setStatus('Parla ora', 'rec');
  await sleep(500);
  await P("It's a book.");
  heard("it's a book");
  flashBad();
  setStatus('Riprova', 'err');
  cap("…lo schermo diventa rosso e l'insegnante ti dice la risposta giusta. Tu la ripeti.");
  await T(t.wrong);
  if (DB.settings.showText) $('prompt-text').textContent = "It's a pen.";
  await T("It's a pen.", t.modelRate);
  await T(t.cue);
  $('screen-lesson').classList.remove('tunnel');
  await studentTalks("It's a pen.");
  await praise();

  // 5. Silenzio: tasto Parla
  step(5, 'pencil', 'What is this?');
  cap('Se non ti sente…');
  await T('What is this?');
  setStatus('Parla ora', 'rec');
  await sleep(2200);
  setStatus('Tocca ' + uiWord('talk') + ' quando sei pronto', 'wait');
  cap('…tocca ' + uiWord('talk') + ' e rispondi.');
  await sleep(600);
  await tap($('btn-talk'));
  await studentTalks("It's a pencil.");
  await praise();

  // 6. Non ho capito: tasto Riascolta
  step(6, 'pen', 'Is this a pen or a pencil?');
  cap('Non hai capito la domanda?');
  await T('Is this a pen or a pencil?');
  cap('Tocca ' + uiWord('repeat') + ' e la senti di nuovo.');
  await tap($('btn-replay'));
  setStatus('Ascolta', '');
  await T('Is this a pen or a pencil?');
  await studentTalks("It's a pen.");
  await praise();

  // 7. Tocca la figura
  step(7, null, 'Touch the pencil.');
  cap('Alla fine della lezione: ascolta e tocca la figura giusta.');
  await T('Touch the pencil.');
  setStatus('Tocca la figura giusta', 'wait');
  await sleep(400);
  await tap(document.querySelector('.object-box[data-obj="pencil"]'));
  showIndicated('pencil', true);
  await praise();

  setProgress(DEMO_STEPS, DEMO_STEPS);
  cap('Adesso tocca a te!');
  setStatus('', '');
  await T("Now it's your turn.");
  await sleep(800);
}
