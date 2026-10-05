'use strict';
/* =====================================================================
   SCHERMO: menu, lezione, fine lezione, risultati, navigazione.
   ===================================================================== */

const $ = (id) => document.getElementById(id);
/* ---------- Navigazione e tasto indietro ---------- */

const IS_CORDOVA = !!window.cordova;
let currentScreen = 'home';
function showScreen(name, replace) {
  ['home', 'lesson', 'end', 'report'].forEach(n => $('screen-' + n).classList.toggle('hidden', n !== name));
  const wasHome = currentScreen === 'home';
  currentScreen = name;
  window.scrollTo(0, 0);
  if (!IS_CORDOVA && name !== 'home') {
    try {
      if (wasHome && !replace) history.pushState({ s: name }, '');
      else history.replaceState({ s: name }, '');
    } catch (e) {}
  }
}
function goHome() {
  stopLesson();
  if (!IS_CORDOVA && history.state && history.state.s) { history.back(); return; }
  renderHome();
  showScreen('home');
}
function onBack() {
  if (currentScreen === 'home') {
    if (navigator.app && navigator.app.exitApp) navigator.app.exitApp();
    return;
  }
  // Indietro durante la dimostrazione = saltarla
  if (demoActive) markDemoSeen();
  stopLesson();
  renderHome();
  showScreen('home');
}
window.addEventListener('popstate', () => { if (!IS_CORDOVA && currentScreen !== 'home') onBack(); });

// Un tocco ripetuto non deve avviare due lezioni
let lastLaunch = 0;
function once(fn) {
  return () => {
    const now = Date.now();
    if (now - lastLaunch < 1200) return;
    lastLaunch = now;
    fn();
  };
}

/* ---------- Menu ---------- */

function renderHome() {
  const ti = trialInfo();
  const sel = selectedTeacherKey();
  let html;
  if (TEST_MODE) {
    html = '<p><strong>Test mode</strong></p><p class="muted">Tap a teacher to choose. Your choice stays until you change it.</p>';
  } else if (ti.day === 0) {
    html = '<p><strong>' + TRIAL_DAYS + '-day trial</strong></p><p class="muted">Each teacher for ' + (TRIAL_DAYS / TRIAL_ROTATION.length) + ' days. Then the app tells you which one works best for you.</p>';
  } else if (ti.day <= TRIAL_DAYS) {
    html = '<p><strong>Trial: day ' + ti.day + ' of ' + TRIAL_DAYS + '</strong></p><p class="muted">Today\'s teacher: ' + TEACHERS[ti.today].name + '.</p>';
  } else {
    html = '<p><strong>Trial complete</strong></p><p class="muted">Open the results to see which teacher suits you best.</p>';
  }
  $('trial-card').innerHTML = html;

  const tl = $('teacher-list');
  tl.innerHTML = '';
  Object.keys(TEACHERS).forEach(k => {
    const t = TEACHERS[k];
    const b = document.createElement('button');
    b.className = 'choice' + (k === sel ? ' selected' : '');
    b.innerHTML = avatarHtml(t) +
                  '<span class="t-name">' + t.name + '</span>' +
                  (!TEST_MODE && ti.today === k ? '<span class="badge">today</span>' : '');
    b.onclick = () => {
      DB.settings.teacher = k;
      DB.settings.pickedDay = todayKey();
      saveDB();
      renderHome();
    };
    tl.appendChild(b);
  });

  const ll = $('lesson-list');
  ll.innerHTML = '';
  const db = document.createElement('button');
  db.className = 'lesson-btn demo';
  db.innerHTML = '<span>Demo lesson</span><span class="score">' + (DB.settings.demoSeen ? 'seen' : 'watch first') + '</span>';
  db.onclick = once(() => startDemo(null));
  ll.appendChild(db);
  LESSONS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'lesson-btn';
    const icons = lessonItems(l).map(w => FIG[w]).join('');
    const best = DB.lessons[l.id];
    const name = 'Lesson ' + (LESSONS.indexOf(l) + 1);
    b.innerHTML = '<span>' + name + '</span><span class="icons">' + icons + '</span>' +
                  '<span class="score' + (best >= 80 ? ' top' : '') + '">' + (best != null ? best + '%' : '') + '</span>';
    b.onclick = once(() => startLesson(l.id));
    ll.appendChild(b);
  });

  $('opt-text').checked = !!DB.settings.showText;
  applyUiWords();
}

function avatarHtml(t, size) {
  const cls = 'avatar' + (size ? ' ' + size : '') + (AVATARS[t.key] ? ' photo' : '');
  return '<span class="' + cls + '">' + (AVATARS[t.key] || t.name.charAt(0)) + '</span>';
}

/* ---------- Lingua dei pulsanti della lezione ---------- */

function uiLevelNow() { return uiLevel(DB.settings.menuDay, todayKey()); }
function uiWord(k) { return uiLevelNow() ? UI_WORDS[k].lang : UI_WORDS[k].ui; }
function setUiButton(id, k) {
  const lv = uiLevelNow();
  const w = UI_WORDS[k];
  $(id).innerHTML = lv === 0 ? w.ui : lv === 1 ? w.lang + '<small class="hint">' + w.ui + '</small>' : w.lang;
}
function applyUiWords() {
  setUiButton('btn-talk', 'talk');
  setUiButton('btn-replay', 'repeat');
  if (!demoActive) setUiButton('btn-exit', 'exit');
}
$('opt-text').onchange = (e) => { DB.settings.showText = e.target.checked; saveDB(); };
$('btn-report').onclick = () => { renderReport(); showScreen('report'); };

/* ---------- Lezione ---------- */

let L = null;      // stato della lezione in corso
let RUN = 0;       // cambia a ogni lezione o pausa: blocca le risposte "vecchie"
let lastLessonId = null;

function lessonItems(l) { return l.fresh ? l.known.concat([l.fresh]) : l.known.slice(); }
function alive(run) { return !!L && L.run === run && RUN === run; }
// Passo corrente: durante le ripetizioni dopo un errore, quello delle ripetizioni
function cur() { return L.drill ? L.drill[L.di] : L.steps[L.i]; }

function startLesson(id) {
  if (id === 'l1' && !DB.settings.demoSeen) { startDemo('l1'); return; }
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;
  stopLesson();
  const items = lessonItems(lesson);
  const teacher = TEACHERS[selectedTeacherKey()];
  RUN++;
  L = {
    run: RUN, lesson: lesson, items: items, teacher: teacher,
    steps: buildSteps(lesson), streak: 0,
    i: 0, attempts: 0, noSpeech: 0, first: 0, busy: false, paused: false,
    drill: null, di: 0, repFails: 0, errCount: 0,
    start: Date.now(), listenStart: 0
  };
  lastLessonId = id;

  if (!DB.start) DB.start = todayKey();
  const ts = DB.teachers[teacher.key];
  ts.sessions++;
  if (ts.days.indexOf(todayKey()) === -1) ts.days.push(todayKey());
  saveDB();

  $('l-title').textContent = lesson.title;
  $('l-teacher').innerHTML = avatarHtml(teacher, 'small') + '<span>' + teacher.name + '</span>';
  buildGrid(items);
  applyUiWords();
  showScreen('lesson', currentScreen !== 'home');
  Awake.keep();
  Mouth.gender = teacher.gender;
  runStep();
}

function stopLesson() {
  stopDemo();
  RUN++;
  Ears.abort();
  Mouth.cancel();
  Awake.allow();
  if (L) {
    const ts = DB.teachers[L.teacher.key];
    ts.time += (Date.now() - L.start) / 1000;
    saveDB();
  }
  L = null;
  $('screen-lesson').classList.remove('tunnel');
  hideMark();
  setCue('');
  setPickable(false);
  hideFinger();
}

function buildGrid(items) {
  const grid = $('objects-grid');
  grid.innerHTML = '';
  grid.classList.toggle('cols4', items.length === 4);
  items.forEach(obj => {
    const box = document.createElement('div');
    box.className = 'object-box';
    box.dataset.obj = obj;
    box.innerHTML = FIG[obj];
    box.onclick = () => onPick(obj);
    grid.appendChild(box);
  });
}

function restartAnim(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

let shownObj;
function showIndicated(obj, right) {
  if (obj !== shownObj) {
    if (obj && FIG[obj]) {
      $('stage-hand').innerHTML = HAND;
      $('stage-hand').style.visibility = 'visible';
      $('stage-figure').innerHTML = FIG[obj];
    } else {
      $('stage-hand').style.visibility = 'hidden';
      $('stage-figure').innerHTML = UNKNOWN;
    }
    restartAnim($('stage-figure'), 'pop');
    shownObj = obj;
  }
  document.querySelectorAll('.object-box').forEach(b => {
    b.classList.toggle('indicated', b.dataset.obj === obj && !right);
    b.classList.toggle('right', b.dataset.obj === obj && !!right);
  });
}

// Effetti: bagliore verde quando è giusto, rosso e "tunnel" quando è sbagliato
function flashGood() {
  const st = $('stage');
  st.classList.remove('bad');
  restartAnim(st, 'good');
}
function flashBad() {
  const st = $('stage');
  st.classList.remove('good');
  restartAnim(st, 'bad');
  restartAnim($('screen-lesson'), 'tunnel');
}

function setStatus(text, mode) {
  $('status-text').textContent = text;
  $('mic-dot').className = mode || '';
}
function setPrompt(text) { $('prompt-text').textContent = DB.settings.showText ? text : ''; }
function setProgress(done, total) { $('progress-fill').style.width = Math.round(done / total * 100) + '%'; }

// Disegna il passo corrente senza azzerare i tentativi
function drawStep() {
  const st = cur();
  hideMark();
  $('l-count').textContent = (L.i + 1) + ' / ' + L.steps.length;
  setProgress(L.i, L.steps.length);
  $('heard').textContent = '';
  showIndicated(st.show);
  setPrompt(st.prompt);
}

function runStep() {
  if (L.i >= L.steps.length) { finishLesson(); return; }
  L.attempts = 0;
  L.noSpeech = 0;
  drawStep();
  askStep();
}

function askStep() {
  const st = cur();
  const run = L.run;
  L.busy = true;
  setStatus('Listen', '');
  if (st.type === 'ask') { askTurn(st, run); return; }
  setCue(cueFor(st));
  // Durante le ripetizioni l'insegnante parla col ritmo del modello
  const rate = st.drill ? L.teacher.modelRate : L.teacher.rate * (st.speed || 1);
  const speak = () => Mouth.speak(st.prompt, rate, L.teacher.pitch, () => {
    if (!alive(run)) return;
    L.busy = false;
    // L'insegnante si è risposto da solo («Che cos'è? È una penna.»): avanti
    if (st.type === 'reveal' && !st.drill) { L.busy = true; nextStep(run, 900); return; }
    listenSoon(run);
  });
  // Un attimo di silenzio prima dello sfogo
  if (st.pause && !st.drill) setTimeout(() => { if (alive(run)) speak(); }, st.pause);
  else speak();
}

/* ---------- Le domande le fa l'allievo ----------
   Tocca un oggetto e chiede «È un tavolo?» o «Che cos'è?»; l'insegnante risponde
   sempre con la frase giusta e intera. */
function setPickable(on) {
  document.querySelectorAll('.object-box').forEach(b => b.classList.toggle('pickable', !!on));
}
function askTurn(st, run) {
  L.pick = null;
  showIndicated(null);
  setCue('pick');
  setPickable(true);
  const t = L.teacher;
  const ready = () => {
    if (!alive(run)) return;
    L.busy = false;
    setStatus('Your turn: tap a picture, then ask', 'wait');
    sweepFinger(() => alive(run) && !L.pick && !L.paused);
  };
  if (st.intro) Mouth.speak('Tocca a te.', t.rate, t.pitch, ready); else ready();
}
// Il dito passa sopra ogni figura, la indica e poi sparisce (si ferma se l'allievo tocca prima)
let sweepId = 0;
function sweepFinger(stillWaiting) {
  const id = ++sweepId;
  const f = $('pick-finger');
  f.innerHTML = HAND;
  const boxes = Array.from(document.querySelectorAll('.object-box'));
  const stop = () => id !== sweepId || !stillWaiting();
  const place = (el) => {
    const r = el.getBoundingClientRect();
    f.style.left = (r.left + r.width / 2) + 'px';
    f.style.top = (r.top + r.height * 0.35) + 'px';
  };
  let k = 0;
  const next = () => {
    if (stop() || k >= boxes.length) { hideFinger(); return; }
    const el = boxes[k++];
    if (f.classList.contains('hidden')) {
      place(el);                 // primo punto: compare già sopra la prima figura
      f.classList.remove('hidden');
    } else place(el);
    setTimeout(() => {
      if (stop()) { hideFinger(); return; }
      restartAnim(f, 'tap');
      setTimeout(next, 380);
    }, 470);
  };
  next();
}
function hideFinger() { sweepId++; $('pick-finger').classList.add('hidden'); }

function onPick(obj) {
  if (!L || L.paused || L.busy || L.pick) return;
  const st = cur();
  if (!st || st.type !== 'ask') return;
  L.pick = obj;
  hideFinger();
  setPickable(false);
  showIndicated(obj);
  setCue('q');
  listenSoon(L.run);
}
function handleAsk(alts) {
  const X = L.pick;
  const t = L.teacher;
  const run = L.run;
  const ts = DB.teachers[t.key];
  let r = null;
  for (const a of alts.slice(0, 5)) { const x = evalAsk(X, a); if (x.ok) { r = x; break; } if (!r) r = x; }
  L.busy = true;
  const scr = $('screen-lesson');
  if (r.ok) {
    ts.items++;
    if (!L.attempts) { ts.first++; L.first++; ts.lat += (Date.now() - L.listenStart) / 1000; ts.latN++; }
    saveDB();
    setStatus('Correct', 'ok');
    flashGood();
    setCue('ok');
    const answer = answerAsk(X, r);
    if (DB.settings.showText) $('prompt-text').textContent = answer;
    Mouth.speak(answer, t.modelRate, t.pitch, () => { if (alive(run)) nextStep(run, 500); });
    return;
  }
  // domanda sbagliata: parola d'errore e la domanda giusta, l'allievo la ripete
  if (!L.attempts) ts.items++;
  L.attempts++;
  ts.errors++;
  L.streak = 0;
  saveDB();
  flashBad();
  showMark(t.mark);
  if (L.attempts >= 3) {
    // dopo 3 tentativi l'insegnante fa la domanda e risponde da solo
    setStatus('Moving on', 'err');
    Mouth.speak(Q + ' È ' + np(X) + '.', t.modelRate, t.pitch, () => {
      if (!alive(run)) return;
      scr.classList.remove('tunnel');
      nextStep(run, 600);
    });
    return;
  }
  setStatus('Try again', 'err');
  if (DB.settings.showText) $('prompt-text').textContent = r.model;
  Mouth.speakParts([{ text: t.wrong, rate: t.rate }, { text: r.model, rate: t.modelRate }], t.pitch, () => {
    if (!alive(run)) return;
    scr.classList.remove('tunnel');
    setCue('r');
    L.busy = false;
    listenSoon(run);
  });
}

// Il microfono parte un attimo dopo la fine della voce dell'insegnante, così non sente
// la coda della domanda. La prima risposta che è solo l'eco della domanda si ignora.
function listenSoon(run) {
  L.busy = true;
  L.echoGuard = true;
  setTimeout(() => { if (!alive(run)) return; L.busy = false; listen(); }, 400);
}

function listen() {
  if (!L || L.busy || L.paused) return;
  const run = L.run;
  L.busy = true;
  L.listenStart = Date.now();
  setStatus('Speak now', 'rec');
  Ears.listen(
    (alts) => { if (!alive(run)) return; L.busy = false; handleAnswer(alts); },
    (code) => { if (!alive(run)) return; L.busy = false; handleListenError(code, run); }
  );
}

function handleListenError(code, run) {
  if (code === 'not-allowed') { setStatus('Microphone blocked: allow it, then tap ' + uiWord('talk'), 'err'); return; }
  if (code === 'unsupported') { setStatus('This phone has no speech recognition. You can only listen', 'err'); return; }
  if (code === 'network') { setStatus('Speech recognition needs internet. Tap ' + uiWord('talk'), 'err'); return; }
  L.noSpeech++;
  if (L.noSpeech <= 2) {
    setStatus('I didn\'t hear you', 'wait');
    setTimeout(() => { if (alive(run)) listen(); }, 700);
  } else {
    setStatus('Tap ' + uiWord('talk') + ' when you are ready', 'wait');
  }
}

function handleAnswer(alts) {
  const st = cur();
  if (L.echoGuard) {
    L.echoGuard = false;
    if (alts.length && alts.every(a => isEcho(st, a))) {
      // era la voce dell'insegnante: si riascolta senza contare niente
      const run = L.run;
      setStatus('Speak now', 'rec');
      setTimeout(() => { if (alive(run)) listen(); }, 200);
      return;
    }
  }
  if (st.type === 'ask') {
    $('heard').textContent = alts[0] ? 'Heard: “' + alts[0] + '”' : '';
    handleAsk(alts);
    return;
  }
  const res = evaluateAll(st, alts);
  $('heard').textContent = alts[0] ? 'Heard: “' + alts[0] + '”' : '';
  if (res.ok) onCorrect(res); else onWrong();
}

function onCorrect(res) {
  const st = cur();
  const run = L.run;
  if (L.drill) {
    // Ripetizione giusta: alla prossima, o fine delle ripetizioni
    L.di++;
    L.repFails = 0;
    L.busy = true;
    flashGood();
    setCue('ok');
    if (L.di >= L.drill.length) { setStatus('Correct', 'ok'); hideMark(); nextStep(run, 300); return; }
    const d = cur();
    $('heard').textContent = '';
    showIndicated(d.show);
    setPrompt(d.prompt);
    setTimeout(() => { if (alive(run)) { askStep(); setStatus(repLabel(), 'wait'); } }, 500);
    return;
  }
  const ts = DB.teachers[L.teacher.key];
  ts.items++;
  if (L.attempts === 0) {
    ts.first++;
    L.first++;
    ts.lat += (Date.now() - L.listenStart) / 1000;
    ts.latN++;
  }
  saveDB();
  L.busy = true;
  L.answered = true;
  setStatus('Correct', 'ok');
  flashGood();
  setCue('ok');
  const t = L.teacher;
  L.streak++;
  const parts = [];
  // Il ritmo conta più delle lodi: l'insegnante loda solo ogni tanto (o mai)
  if (t.praiseEvery && L.streak % t.praiseEvery === 0) parts.push({ text: pick(t.praise), rate: t.rate });
  // «No, non è un tavolo.» su un oggetto noto: l'insegnante completa con quello che è.
  // Sull'oggetto nuovo no: il nome non si dice finché non arriva «Che cos'è?»
  if (st.type === 'neg' && !res.full && !st.fresh) parts.push({ text: 'È ' + np(st.show) + '.', rate: t.modelRate });
  // pausa breve, giusto il tempo di vedere il «!» verde
  const delay = st.phase === 'mix' ? 400 : 500;
  Mouth.speakParts(parts, t.pitch, () => {
    if (!alive(run)) return;
    nextStep(run, delay);
  });
}

// Passo concluso (giusto o risposta data dall'insegnante): avanti
function nextStep(run, delay) {
  L.i++;
  L.answered = false;
  L.attempts = 0;
  L.noSpeech = 0;
  L.drill = null;
  L.di = 0;
  L.repFails = 0;
  L.pick = null;
  setTimeout(() => { if (alive(run)) runStep(); }, delay);
}

// Errore: parola secca dell'insegnante con la sua icona, poi la risposta giusta.
// Poi le ripetizioni intorno a quella parola: quante, lo decide l'insegnante (al massimo 5).
function onWrong() {
  const st = cur();
  const run = L.run;
  const t = L.teacher;
  const ts = DB.teachers[t.key];
  ts.errors++;
  L.busy = true;
  L.streak = 0;
  const scr = $('screen-lesson');
  flashBad();
  showMark(t.mark);

  if (L.drill) {
    // Sbaglia anche la ripetizione: dopo 3 volte di fila si va avanti
    L.repFails++;
    if (L.repFails >= 3) {
      saveDB();
      setStatus('Moving on', 'err');
      Mouth.speak(st.model, t.modelRate, t.pitch, () => {
        if (!alive(run)) return;
        scr.classList.remove('tunnel');
        nextStep(run, 600);
      });
      return;
    }
  } else {
    L.attempts++;
    ts.items++;          // il passo conta come fatto, ma non giusto al primo colpo
    L.drill = buildDrill(st, repeatsFor(t, L.errCount++), L.items);
    L.di = 0;
    L.repFails = 0;
  }
  saveDB();
  setStatus(repLabel(), 'err');
  const d = cur();
  if (DB.settings.showText) $('prompt-text').textContent = d.model;
  Mouth.speakParts([
    { text: t.wrong, rate: t.rate },
    { text: d.model, rate: t.modelRate }
  ], t.pitch, () => {
    if (!alive(run)) return;
    scr.classList.remove('tunnel');
    L.busy = false;
    listenSoon(run);
  });
}
function repLabel() { return 'Practice ' + (L.di + 1) + ' / ' + L.drill.length; }

function showMark(mark) {
  setCue('');   // stesso angolo: l'icona dell'errore prende il posto del segnale
  const m = $('stage-mark');
  m.innerHTML = MARKS[mark] || '';
  m.classList.remove('hidden');
  restartAnim(m, 'show');
}
// Segnale della frase: «?» per le domande, frecce per le frasi da ripetere
function cueFor(st) {
  if (!st || st.type === 'reveal') return '';
  if (st.type === 'ask') return 'pick';
  if (st.type === 'echo' || st.prompt === st.model) return 'r';
  return /\?\s*$/.test(st.prompt) ? 'q' : 'r';
}
function setCue(kind) {
  const c = $('stage-cue');
  if (!kind) { c.classList.add('hidden'); c.dataset.kind = ''; return; }
  if (c.dataset.kind !== kind || c.classList.contains('hidden')) {
    c.innerHTML = CUES[kind];
    c.dataset.kind = kind;
    c.classList.remove('hidden');
    restartAnim(c, 'show');
  }
}
function hideMark() { $('stage-mark').classList.add('hidden'); }

function finishLesson() {
  const total = answerSteps(L.steps);
  const pct = Math.round(L.first / total * 100);
  const id = L.lesson.id;
  const t = L.teacher;
  if (DB.lessons[id] == null || pct > DB.lessons[id]) DB.lessons[id] = pct;
  // Lezione dei pulsanti finita: da qui partono i giorni per passare all'inglese
  if (id === MENU_LESSON && !DB.settings.menuDay) DB.settings.menuDay = todayKey();
  saveDB();
  stopLesson();
  Mouth.speak(t.done, t.rate, t.pitch, null);
  const C = 427;   // circonferenza del cerchio (raggio 68)
  $('end-body').innerHTML =
    '<div class="ring"><svg viewBox="0 0 160 160"><circle class="track" cx="80" cy="80" r="68"/>' +
    '<circle class="val" cx="80" cy="80" r="68" stroke-dasharray="' + C + '" stroke-dashoffset="' + Math.round(C * (1 - pct / 100)) + '"/></svg>' +
    '<div class="num">' + pct + '%</div></div>' +
    '<p>right first time</p><p class="muted">Teacher: ' + t.name + '</p>';
  showScreen('end', true);
}

$('btn-replay').onclick = () => {
  if (!L || L.paused) return;
  if (Ears.isListening()) { Ears.abort(); L.busy = false; }
  if (L.busy) return;
  askStep();
};
$('btn-talk').onclick = () => {
  if (!L || L.busy || L.paused) return;
  if (cur().type === 'ask' && !L.pick) { setStatus('Tap a picture first', 'wait'); return; }
  L.noSpeech = 0;
  listen();
};
$('btn-exit').onclick = () => { if (demoActive) skipDemo(); else goHome(); };
$('btn-again').onclick = once(() => { if (lastLessonId) startLesson(lastLessonId); });
$('btn-end-home').onclick = () => goHome();

/* ---------- App in background e ritorno ---------- */

let demoToResume;   // undefined = nessuna demo da riprendere
function onPause() {
  Ears.abort();
  Mouth.cancel();
  Awake.allow();
  if (demoActive) {
    demoToResume = demoNext;
    stopDemo();
    return;
  }
  if (L && !L.paused) {
    RUN++;             // tutte le callback in sospeso diventano vecchie
    L.run = RUN;
    L.paused = true;
    L.busy = false;
    $('screen-lesson').classList.remove('tunnel');
    setStatus('Paused', '');
  }
}
function onResume() {
  if (demoToResume !== undefined) {
    const next = demoToResume;
    demoToResume = undefined;
    if (currentScreen === 'lesson') startDemo(next);
    return;
  }
  if (L && L.paused) {
    L.paused = false;
    Awake.keep();
    // Passo già concluso prima della pausa (giusto o risposta data): si va al successivo
    if (L.answered) { L.i++; L.answered = false; L.attempts = 0; L.noSpeech = 0; }
    if (L.i >= L.steps.length) { finishLesson(); return; }
    drawStep();
    askStep();
    return;
  }
  // Rimasta aperta oltre la mezzanotte: aggiorna l'insegnante del giorno
  if (currentScreen === 'home') renderHome();
}
document.addEventListener('visibilitychange', () => {
  if (IS_CORDOVA) return;   // sul telefono bastano pause/resume
  if (document.hidden) onPause(); else onResume();
});

/* ---------- Risultati ---------- */

function renderReport() {
  const ti = trialInfo();
  let html = '';
  if (ti.day > 0 && ti.day <= TRIAL_DAYS) html += '<div class="card t-card"><p>Trial day ' + ti.day + ' of ' + TRIAL_DAYS + '.</p></div>';

  const keys = Object.keys(TEACHERS);
  keys.forEach(k => {
    const s = DB.teachers[k];
    const firstPct = s.items ? Math.round(s.first / s.items * 100) : 0;
    const lat = s.latN ? (s.lat / s.latN).toFixed(1) + ' s' : 'no data yet';
    html += '<div class="card t-card"><h3>' + TEACHERS[k].name + '</h3>' +
      '<p>Right first time: <strong>' + firstPct + '%</strong></p>' +
      '<div class="bar"><div style="width:' + firstPct + '%"></div></div>' +
      '<p class="muted">Average answer time: ' + lat + '</p>' +
      '<p class="muted">Answers: ' + s.items + ', mistakes: ' + s.errors + ', lessons: ' + s.sessions + ', days: ' + s.days.length + '</p></div>';
  });

  const missing = keys.filter(k => DB.teachers[k].items < MIN_ANSWERS_FOR_VERDICT);
  if (missing.length) {
    html += '<div class="card t-card verdict"><p><strong>No advice yet</strong></p><p class="muted">At least ' +
      MIN_ANSWERS_FOR_VERDICT + ' answers with each teacher are needed. Still missing: ' + missing.map(k => TEACHERS[k].name).join(', ') + '.</p></div>';
  } else {
    let best = keys[0];
    keys.forEach(k => { if (teacherScore(DB.teachers[k]) > teacherScore(DB.teachers[best])) best = k; });
    html += '<div class="card t-card verdict"><p><strong>Best for you: ' + TEACHERS[best].name + '</strong></p>' +
      '<p class="muted">With this teacher you got more answers right first time, and answered faster.</p></div>';
  }
  $('report-body').innerHTML = html;
}
$('btn-report-home').onclick = () => goHome();
$('btn-reset').onclick = () => {
  if (!confirm('Delete all trial and lesson data?')) return;
  DB = emptyDB();
  saveDB();
  renderReport();
};

/* ---------- Avvio ---------- */

document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
$('logo').innerHTML = LOGO;
renderHome();
ttsWarmUp();
document.addEventListener('deviceready', () => {
  document.addEventListener('backbutton', (e) => { if (e && e.preventDefault) e.preventDefault(); onBack(); }, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('resume', onResume, false);
  ttsWarmUp();
}, false);
