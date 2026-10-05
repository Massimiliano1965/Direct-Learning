'use strict';
/* =====================================================================
   SCHERMO: menu, lezione, fine lezione, risultati, navigazione.
   ===================================================================== */

const $ = (id) => document.getElementById(id);
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5 L10 17 L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const STAR = (on) => '<svg viewBox="0 0 24 24" class="' + (on ? 'on' : '') + '"><path d="M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 13.9 L17.9 20.5 L12 17.2 L6.1 20.5 L7.4 13.9 L2.5 9.4 L9.1 8.6 Z" fill="' +
  (on ? '#f2c744' : '#2e2b4a') + '" stroke="' + (on ? '#b9861a' : '#36335a') + '" stroke-width="1.5" stroke-linejoin="round"/></svg>';

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
  if (ti.day === 0) {
    html = '<p><strong>Prova di 7 giorni</strong></p><p class="muted">Ogni giorno un insegnante diverso. Il settimo giorno l\'app ti dice quale funziona meglio per te.</p>';
  } else if (ti.day <= 6) {
    html = '<p><strong>Prova: giorno ' + ti.day + ' di 7</strong></p><p class="muted">Oggi tocca a ' + TEACHERS[ti.today].name + '.</p>';
  } else {
    html = '<p><strong>Prova finita</strong></p><p class="muted">Guarda i risultati per sapere quale insegnante è il migliore per te.</p>';
  }
  $('trial-card').innerHTML = html;

  const tl = $('teacher-list');
  tl.innerHTML = '';
  Object.keys(TEACHERS).forEach(k => {
    const t = TEACHERS[k];
    const b = document.createElement('button');
    b.className = 'choice' + (k === sel ? ' selected' : '');
    b.innerHTML = '<span class="avatar">' + t.name.charAt(0) + '</span>' +
                  '<span><span class="t-name">' + t.name + '</span><span class="t-style">' + t.style + '</span></span>' +
                  (ti.today === k ? '<span class="badge">oggi</span>' : '');
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
  db.innerHTML = '<span>Lezione dimostrativa</span><span class="score">' + (DB.settings.demoSeen ? 'vista' : 'da vedere') + '</span>';
  db.onclick = once(() => startDemo(null));
  ll.appendChild(db);
  LESSONS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'lesson-btn';
    const icons = (l.items || ['book', 'key', 'cup', 'chair']).map(w => FIG[w]).join('');
    const best = DB.lessons[l.id];
    const name = l.id === 'rev' ? 'Ripasso' : 'Lezione ' + (LESSONS.indexOf(l) + 1);
    b.innerHTML = '<span>' + name + '</span><span class="icons">' + icons + '</span>' +
                  '<span class="score' + (best >= 80 ? ' top' : '') + '">' + (best != null ? best + '%' : '') + '</span>';
    b.onclick = once(() => startLesson(l.id));
    ll.appendChild(b);
  });

  $('opt-text').checked = !!DB.settings.showText;
  applyUiWords();
}

/* ---------- Lingua dei pulsanti della lezione ---------- */

function uiLevelNow() { return uiLevel(DB.settings.menuDay, todayKey()); }
function uiWord(k) { return uiLevelNow() ? UI_WORDS[k].en : UI_WORDS[k].it; }
function setUiButton(id, k) {
  const lv = uiLevelNow();
  const w = UI_WORDS[k];
  $(id).innerHTML = lv === 0 ? w.it : lv === 1 ? w.en + '<small class="hint">' + w.it + '</small>' : w.en;
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

function alive(run) { return !!L && L.run === run && RUN === run; }
function cur() { return L.steps[L.i]; }

function startLesson(id) {
  if (id === 'l1' && !DB.settings.demoSeen) { startDemo('l1'); return; }
  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;
  stopLesson();
  const items = lesson.items ? lesson.items.slice() : shuffle(Object.keys(ITEMS).filter(w => !isButton(w))).slice(0, 4);
  const teacher = TEACHERS[selectedTeacherKey()];
  RUN++;
  L = {
    run: RUN, lesson: lesson, items: items, teacher: teacher,
    steps: buildSteps(items, lesson.presentation),
    i: 0, attempts: 0, noSpeech: 0, first: 0, busy: false, paused: false,
    start: Date.now(), listenStart: 0
  };
  lastLessonId = id;

  if (!DB.start) DB.start = todayKey();
  const ts = DB.teachers[teacher.key];
  ts.sessions++;
  if (ts.days.indexOf(todayKey()) === -1) ts.days.push(todayKey());
  saveDB();

  $('l-title').textContent = lesson.title;
  $('l-teacher').textContent = teacher.name;
  buildGrid(items);
  applyUiWords();
  showScreen('lesson', currentScreen !== 'home');
  Awake.keep();
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
  $('stage-badge').classList.add('hidden');
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
    box.onclick = () => onTouch(obj);
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

// Effetti: bagliore verde e spunta quando è giusto, rosso e "tunnel" quando è sbagliato
function flashGood() {
  const st = $('stage');
  st.classList.remove('bad');
  restartAnim(st, 'good');
  const b = $('stage-badge');
  b.classList.remove('hidden');
  restartAnim(b, 'show');
  clearTimeout(flashGood.t);
  flashGood.t = setTimeout(() => b.classList.add('hidden'), 1100);
}
function flashBad() {
  const st = $('stage');
  st.classList.remove('good');
  restartAnim(st, 'bad');
  $('stage-badge').classList.add('hidden');
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
  $('l-count').textContent = (L.i + 1) + ' / ' + L.steps.length;
  setProgress(L.i, L.steps.length);
  $('heard').textContent = '';
  showIndicated(st.type === 'touch' ? null : st.show);
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
  setStatus('Ascolta', '');
  Mouth.speak(st.prompt, L.teacher.rate, L.teacher.pitch, () => {
    if (!alive(run)) return;
    L.busy = false;
    if (st.type === 'touch') {
      L.listenStart = Date.now();
      setStatus('Tocca la figura giusta', 'wait');
    } else {
      listen();
    }
  });
}

function listen() {
  if (!L || L.busy || L.paused) return;
  const run = L.run;
  L.busy = true;
  L.listenStart = Date.now();
  setStatus('Parla ora', 'rec');
  Ears.listen(
    (alts) => { if (!alive(run)) return; L.busy = false; handleAnswer(alts); },
    (code) => { if (!alive(run)) return; L.busy = false; handleListenError(code, run); }
  );
}

function handleListenError(code, run) {
  if (code === 'not-allowed') { setStatus('Microfono bloccato: dai il permesso e tocca ' + uiWord('talk'), 'err'); return; }
  if (code === 'unsupported') { setStatus('Il telefono non ha il riconoscimento vocale. Puoi solo ascoltare', 'err'); return; }
  if (code === 'network') { setStatus('Serve internet per capire la voce. Tocca ' + uiWord('talk'), 'err'); return; }
  L.noSpeech++;
  if (L.noSpeech <= 2) {
    setStatus('Non ti ho sentito', 'wait');
    setTimeout(() => { if (alive(run)) listen(); }, 700);
  } else {
    setStatus('Tocca ' + uiWord('talk') + ' quando sei pronto', 'wait');
  }
}

function handleAnswer(alts) {
  const res = evaluateAll(cur(), alts);
  $('heard').textContent = alts[0] ? 'Sentito: «' + alts[0] + '»' : '';
  if (res.ok) onCorrect(res); else onWrong();
}

function onTouch(obj) {
  if (!L || L.busy || L.paused) return;
  const st = cur();
  if (!st || st.type !== 'touch') return;
  L.busy = true;
  if (obj === st.show) {
    showIndicated(obj, true);
    onCorrect({ ok: true, full: true });
  } else {
    onWrong();
  }
}

function onCorrect(res) {
  const st = cur();
  const run = L.run;
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
  setStatus('Giusto', 'ok');
  flashGood();
  const t = L.teacher;
  const parts = [{ text: t.praise[Math.floor(Math.random() * t.praise.length)], rate: t.rate }];
  // Risposta negativa senza correzione: l'insegnante la completa
  if (st.type === 'neg' && !res.full) parts.push({ text: "It's " + art(st.show) + '.', rate: t.modelRate });
  Mouth.speakParts(parts, t.pitch, () => {
    if (!alive(run)) return;
    nextStep(run, 400);
  });
}

// Passo concluso (giusto o risposta data dall'insegnante): avanti
function nextStep(run, delay) {
  L.i++;
  L.answered = false;
  L.attempts = 0;
  L.noSpeech = 0;
  setTimeout(() => { if (alive(run)) runStep(); }, delay);
}

function onWrong() {
  const st = cur();
  const run = L.run;
  const t = L.teacher;
  const ts = DB.teachers[t.key];
  L.attempts++;
  ts.errors++;
  L.busy = true;
  const scr = $('screen-lesson');
  flashBad();

  if (L.attempts >= t.maxTries) {
    // Troppi errori: l'insegnante dà la risposta e si va avanti
    ts.items++;
    ts.skipped++;
    saveDB();
    L.answered = true;
    if (st.type === 'touch') showIndicated(st.show);
    if (DB.settings.showText) $('prompt-text').textContent = st.model;
    setStatus('Si va avanti', 'err');
    Mouth.speakParts([{ text: t.giveUp, rate: t.rate }, { text: st.model, rate: t.modelRate }], t.pitch, () => {
      if (!alive(run)) return;
      scr.classList.remove('tunnel');
      nextStep(run, 600);
    });
    return;
  }

  saveDB();
  setStatus('Riprova', 'err');
  if (st.type === 'touch') {
    Mouth.speakParts([{ text: t.wrong, rate: t.rate }, { text: st.prompt, rate: t.modelRate }], t.pitch, () => {
      if (!alive(run)) return;
      scr.classList.remove('tunnel');
      L.busy = false;
      setStatus('Tocca la figura giusta', 'wait');
    });
    return;
  }
  // Correzione: l'insegnante dice la risposta giusta, lo studente la ripete
  if (DB.settings.showText) $('prompt-text').textContent = st.model;
  Mouth.speakParts([
    { text: t.wrong, rate: t.rate },
    { text: st.model, rate: t.modelRate },
    { text: t.cue, rate: t.rate }
  ], t.pitch, () => {
    if (!alive(run)) return;
    scr.classList.remove('tunnel');
    L.busy = false;
    listen();
  });
}

function finishLesson() {
  const total = L.steps.length;
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
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  $('end-body').innerHTML =
    '<div class="ring"><svg viewBox="0 0 160 160"><circle class="track" cx="80" cy="80" r="68"/>' +
    '<circle class="val" cx="80" cy="80" r="68" stroke-dasharray="' + C + '" stroke-dashoffset="' + Math.round(C * (1 - pct / 100)) + '"/></svg>' +
    '<div class="num">' + pct + '%</div></div>' +
    '<div class="stars">' + STAR(stars >= 1) + STAR(stars >= 2) + STAR(stars >= 3) + '</div>' +
    '<p>giuste al primo colpo</p><p class="muted">Insegnante: ' + t.name + '</p>';
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
  if (cur().type === 'touch') { setStatus('Qui devi toccare la figura', 'wait'); return; }
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
    setStatus('In pausa', '');
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
  if (ti.day > 0 && ti.day < 7) html += '<div class="card t-card"><p>Giorno ' + ti.day + ' di 7 della prova.</p></div>';

  const keys = Object.keys(TEACHERS);
  keys.forEach(k => {
    const s = DB.teachers[k];
    const firstPct = s.items ? Math.round(s.first / s.items * 100) : 0;
    const lat = s.latN ? (s.lat / s.latN).toFixed(1).replace('.', ',') + ' s' : 'nessun dato';
    html += '<div class="card t-card"><h3>' + TEACHERS[k].name + '</h3>' +
      '<p>Giuste al primo colpo: <strong>' + firstPct + '%</strong></p>' +
      '<div class="bar"><div style="width:' + firstPct + '%"></div></div>' +
      '<p class="muted">Tempo medio di risposta: ' + lat + '</p>' +
      '<p class="muted">Risposte: ' + s.items + ', errori: ' + s.errors + ', lezioni: ' + s.sessions + ', giorni: ' + s.days.length + '</p></div>';
  });

  const missing = keys.filter(k => DB.teachers[k].items < MIN_ANSWERS_FOR_VERDICT);
  if (missing.length) {
    html += '<div class="card t-card verdict"><p><strong>Ancora nessun consiglio</strong></p><p class="muted">Servono almeno ' +
      MIN_ANSWERS_FOR_VERDICT + ' risposte con ogni insegnante. Mancano: ' + missing.map(k => TEACHERS[k].name).join(', ') + '.</p></div>';
  } else {
    let best = keys[0];
    keys.forEach(k => { if (teacherScore(DB.teachers[k]) > teacherScore(DB.teachers[best])) best = k; });
    html += '<div class="card t-card verdict"><p><strong>Il più adatto a te: ' + TEACHERS[best].name + '</strong></p>' +
      '<p class="muted">Con questo insegnante hai dato più risposte giuste al primo colpo e hai risposto più in fretta.</p></div>';
  }
  $('report-body').innerHTML = html;
}
$('btn-report-home').onclick = () => goHome();
$('btn-reset').onclick = () => {
  if (!confirm('Cancellare tutti i dati della prova e delle lezioni?')) return;
  DB = emptyDB();
  saveDB();
  renderReport();
};

/* ---------- Avvio ---------- */

document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
$('logo').innerHTML = LOGO;
$('stage-badge').innerHTML = CHECK;
renderHome();
ttsWarmUp();
document.addEventListener('deviceready', () => {
  document.addEventListener('backbutton', (e) => { if (e && e.preventDefault) e.preventDefault(); onBack(); }, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('resume', onResume, false);
  ttsWarmUp();
}, false);
