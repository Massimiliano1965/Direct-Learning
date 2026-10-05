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
  const praise = async () => { flashGood(); setCue('ok'); if (t.praiseEvery) await T(pick(t.praise)); else await sleep(300); };
  const cap = (text) => { $('demo-caption').textContent = text; };
  const heard = (text) => { $('heard').textContent = text ? 'Heard: “' + text + '”' : ''; };
  const step = (n, obj, prompt) => {
    $('l-count').textContent = n + ' / ' + DEMO_STEPS;
    setProgress(n - 1, DEMO_STEPS);
    heard('');
    showIndicated(obj);
    setPrompt(prompt);
    setCue(/\?$/.test(prompt) ? 'q' : 'r');
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
  cap('Arrows: repeat the sentence. Red dot: your turn to speak.');
  await studentTalks('È un libro.');
  await praise();

  // 2. Domanda con il sì
  step(2, 'book', 'È un libro?');
  cap('Big «?»: it\'s a question, so answer it. Always with a full sentence.');
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
  showMark(t.mark);
  setStatus('Try again', 'err');
  cap('…the teacher says the right answer. You repeat it, then you practise that word a little.');
  await T(t.wrong);
  if (DB.settings.showText) $('prompt-text').textContent = 'Sì, è una sedia.';
  setCue('r');
  await T('Sì, è una sedia.', t.modelRate);
  $('screen-lesson').classList.remove('tunnel');
  await studentTalks('Sì, è una sedia.');
  await T('È una sedia.', t.modelRate);
  await studentTalks('È una sedia.');
  showIndicated('book');
  setPrompt('È una sedia?');
  setCue('q');
  await T('È una sedia?', t.modelRate);
  await studentTalks('No, non è una sedia.');
  hideMark();
  await praise();

  // 5. Oggetto nuovo: solo no, poi «Che cos'è?»
  step(5, 'pen', 'È un libro?');
  cap('A new object. The teacher won\'t tell you its name. Keep saying no.');
  await T('È un libro?');
  await studentTalks('No, non è un libro.');
  setPrompt('È un tavolo?');
  setCue('q');
  await T('È un tavolo?');
  await studentTalks('No, non è un tavolo.');
  setPrompt('È una sedia?');
  await T('È una sedia?');
  await studentTalks('No, non è una sedia.');
  cap('…until you learn the question to ask.');
  setStatus('Listen', '');
  setPrompt("Che cos'è? È una penna.");
  setCue('');
  await sleep(1200);
  await T("Che cos'è? È una penna.");
  setCue('r');
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

  // 8. Le domande le fa l'allievo
  step(8, null, '');
  setCue('pick');
  cap('At the end you ask the questions: tap a picture and ask.');
  await T('Tocca a te.');
  setStatus('Your turn: tap a picture, then ask', 'wait');
  setPickable(true);
  sweepFinger(() => run === DEMO);
  await sleep(4000);
  setPickable(false);
  await tap(document.querySelector('.object-box[data-obj="chair"]'));
  showIndicated('chair');
  setCue('q');
  await studentTalks('È un tavolo?');
  setCue('ok');
  await T('No, non è un tavolo. È una sedia.', t.modelRate);
  setCue('pick');
  await sleep(400);
  await tap(document.querySelector('.object-box[data-obj="pen"]'));
  showIndicated('pen');
  setCue('q');
  await studentTalks("Che cos'è?");
  setCue('ok');
  await T('È una penna.', t.modelRate);

  setProgress(DEMO_STEPS, DEMO_STEPS);
  cap('Now it\'s your turn!');
  setStatus('', '');
  setCue('');
  await T('Adesso tocca a te.');
  await sleep(800);
}
