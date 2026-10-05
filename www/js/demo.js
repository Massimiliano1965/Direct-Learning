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
  $('l-title').textContent = 'Demo';
  $('l-teacher').textContent = t.name;
  $('heard').textContent = '';
  applyUiWords();
  $('btn-exit').textContent = 'Skip the demo';
  $('demo-caption').classList.remove('hidden');
  $('demo-finger').classList.add('hidden');
  setProgress(0, DEMO_STEPS);
  buildGrid(['book', 'table', 'chair', 'pen']);
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
  const praise = async () => { flashGood(); if (t.praiseEvery) await T(pick(t.praise)); else await sleep(300); };
  const cap = (text) => { $('demo-caption').textContent = text; };
  const heard = (text) => { $('heard').textContent = text ? 'Heard: “' + text + '”' : ''; };
  const step = (n, obj, prompt) => {
    $('l-count').textContent = n + ' / ' + DEMO_STEPS;
    setProgress(n - 1, DEMO_STEPS);
    heard('');
    showIndicated(obj);
    setPrompt(prompt);
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
    setStatus('Speak now', 'rec');
    await sleep(500);
    await P(text);
    heard(text.toLowerCase().replace(/[.!?]/g, ''));
    setStatus('Correct', 'ok');
    await sleep(300);
  };

  cap('Demo lesson: just watch and listen. You don\'t need to touch anything.');
  setStatus('', '');
  showIndicated(null);
  await sleep(3000);

  // 1. Presentazione
  step(1, 'book', 'È un libro.');
  cap('The teacher points at a picture and says what it is.');
  await T('È un libro.');
  cap('Red dot: your turn. Repeat the sentence.');
  await studentTalks('È un libro.');
  await praise();

  // 2. Domanda con il sì
  step(2, 'book', 'È un libro?');
  cap('Then a question. Always answer with a full sentence.');
  await T('È un libro?');
  await studentTalks('Sì, è un libro.');
  await praise();

  // 3. Domanda con il no
  step(3, 'table', 'È un libro?');
  cap('If the question is wrong, say no.');
  await T('È un libro?');
  await studentTalks('No, non è un libro.');
  await praise();

  // 4. Errore e correzione
  step(4, 'chair', 'È una sedia?');
  cap('If you make a mistake…');
  await T('È una sedia?');
  setStatus('Speak now', 'rec');
  await sleep(500);
  await P('Sì, è un sedia.');
  heard('sì, è un sedia');
  flashBad();
  setStatus('Try again', 'err');
  cap('…the screen turns red and the teacher says it right. You repeat it.');
  await T(t.wrong);
  if (DB.settings.showText) $('prompt-text').textContent = 'Sì, è una sedia.';
  await T('Sì, è una sedia.', t.modelRate);
  await T(t.cue);
  $('screen-lesson').classList.remove('tunnel');
  await studentTalks('Sì, è una sedia.');
  await praise();

  // 5. Oggetto nuovo: solo no, poi «Che cos'è?»
  step(5, 'pen', 'È un libro?');
  cap('A new object. The teacher won\'t tell you its name. Keep saying no.');
  await T('È un libro?');
  await studentTalks('No, non è un libro.');
  setPrompt('È un tavolo?');
  await T('È un tavolo?');
  await studentTalks('No, non è un tavolo.');
  cap('…until you learn the question to ask.');
  setStatus('Listen', '');
  setPrompt("Che cos'è? È una penna.");
  await sleep(1200);
  await T("Che cos'è? È una penna.");
  await studentTalks("Che cos'è?");
  await praise();

  // 6. Silenzio: tasto Talk
  step(6, 'chair', "Che cos'è?");
  cap('If the app doesn\'t hear you…');
  await T("Che cos'è?");
  setStatus('Speak now', 'rec');
  await sleep(2200);
  setStatus('Tap ' + uiWord('talk') + ' when you are ready', 'wait');
  cap('…tap ' + uiWord('talk') + ' and answer.');
  await sleep(600);
  await tap($('btn-talk'));
  await studentTalks('È una sedia.');
  await praise();

  // 7. Non ho capito: tasto Repeat
  step(7, 'pen', 'È un libro o una penna?');
  cap('Didn\'t catch the question?');
  await T('È un libro o una penna?');
  cap('Tap ' + uiWord('repeat') + ' to hear it again.');
  await tap($('btn-replay'));
  setStatus('Listen', '');
  await T('È un libro o una penna?');
  await studentTalks('È una penna.');
  await praise();

  setProgress(DEMO_STEPS, DEMO_STEPS);
  cap('Now it\'s your turn!');
  setStatus('', '');
  await T('Adesso tocca a te.');
  await sleep(800);
}
