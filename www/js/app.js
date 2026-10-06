'use strict';
/* =====================================================================
   SCHERMO: menu, lezione, fine lezione, risultati, navigazione.
   ===================================================================== */

const $ = (id) => document.getElementById(id);
/* ---------- Navigazione e tasto indietro ---------- */

const IS_CORDOVA = !!window.cordova;
let currentScreen = 'home';
function showScreen(name, replace) {
  ['lang', 'home', 'lesson', 'end', 'report'].forEach(n => $('screen-' + n).classList.toggle('hidden', n !== name));
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
  if (currentScreen === 'lang' && DB.settings.uiLang) { showScreen('home'); return; }
  if (currentScreen === 'home' || currentScreen === 'lang') {
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
    html = '<p><strong>' + tx('testTitle') + '</strong></p><p class="muted">' + tx('testText') + '</p>';
  } else if (ti.day === 0) {
    html = '<p><strong>' + tx('trialTitle', { d: TRIAL_DAYS }) + '</strong></p><p class="muted">' + tx('trialText', { n: TRIAL_DAYS / TRIAL_ROTATION.length }) + '</p>';
  } else if (ti.day <= TRIAL_DAYS) {
    html = '<p><strong>' + tx('trialDay', { d: ti.day, n: TRIAL_DAYS }) + '</strong></p><p class="muted">' + tx('trialToday', { t: TEACHERS[ti.today].name }) + '</p>';
  } else {
    html = '<p><strong>' + tx('trialDone') + '</strong></p><p class="muted">' + tx('trialDoneText') + '</p>';
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
                  (!TEST_MODE && ti.today === k ? '<span class="badge">' + tx('today') + '</span>' : '');
    b.onclick = () => {
      DB.settings.teacher = k;
      DB.settings.pickedDay = todayKey();
      saveDB();
      renderHome();
    };
    tl.appendChild(b);
  });

  // La lingua dello studente: si cambia da qui
  $('lang-box').innerHTML = '';
  if ((COURSE.students || []).length > 1) {
    const lbtn = document.createElement('button');
    lbtn.className = 'lesson-btn';
    lbtn.innerHTML = '<span>' + tx('yourLang') + '</span><span class="score">' + UI_LANGS[UI_LANG].name + '</span>';
    lbtn.onclick = () => showLangChoice();
    $('lang-box').appendChild(lbtn);
  }

  const ll = $('lesson-list');
  ll.innerHTML = '';
  const db = document.createElement('button');
  db.className = 'lesson-btn demo';
  db.innerHTML = '<span>' + tx('demoLesson') + '</span><span class="score">' + tx(DB.settings.demoSeen ? 'seen' : 'watchFirst') + '</span>';
  db.onclick = once(() => startDemo(null));
  ll.appendChild(db);
  LESSONS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'lesson-btn';
    // nel menu solo le parole nuove della lezione
    const icons = (l.colors ? l.known.concat(l.reds || []) : l.known.concat(l.fresh ? [l.fresh] : [])).map(w => FIG[w]).join('');
    const best = DB.lessons[l.id];
    const name = tx('lesson', { n: LESSONS.indexOf(l) + 1 });
    b.innerHTML = '<span>' + name + '</span><span class="icons">' + icons + '</span>' +
                  '<span class="score' + (best >= 80 ? ' top' : '') + '">' + (best != null ? best + '%' : '') + '</span>';
    b.onclick = once(() => startLesson(l.id));
    ll.appendChild(b);
  });

  $('opt-text').checked = !!DB.settings.showText;
  applyStaticText();
  applyUiWords();
}

/* ---------- Prima schermata: «Che lingua parli?» ----------
   Le lingue offerte dal corso (COURSE.students); ogni pulsante ha la domanda nella sua lingua. */
function showLangChoice() {
  const box = $('lang-list');
  box.innerHTML = '';
  (COURSE.students || ['en']).forEach(code => {
    const L = UI_LANGS[code];
    const b = document.createElement('button');
    b.className = 'lang-choice' + (DB.settings.uiLang === code ? ' selected' : '');
    b.innerHTML = '<span class="lc-name">' + L.name + '</span><span class="lc-ask">' + L.ask + '</span>';
    b.onclick = () => {
      DB.settings.uiLang = code;
      saveDB();
      setUiLang(code);
      renderHome();
      showScreen('home', true);
    };
    box.appendChild(b);
  });
  showScreen('lang', currentScreen !== 'home');
}
// Scritte fisse della pagina (data-t = chiave della traduzione)
function applyStaticText() {
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = tx(el.dataset.t); });
}

function avatarHtml(t, size) {
  return '<span class="avatar photo' + (size ? ' ' + size : '') + '">' + teacherHead(t.look || t.key) + '</span>';
}

/* ---------- Lingua dei pulsanti della lezione ---------- */

function uiLevelNow() { return uiLevel(DB.settings.menuDay, todayKey()); }
function uiWord(k) { return uiLevelNow() ? UI_WORDS[k].lang : tx(k); }
function setUiButton(id, k) {
  const lv = uiLevelNow();
  const w = UI_WORDS[k];
  $(id).innerHTML = lv === 0 ? tx(k) : lv === 1 ? w.lang + '<small class="hint">' + tx(k) + '</small>' : w.lang;
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
// Timer della lezione: tutti registrati, così cambiando passo o schermata non resta niente appeso
let lessonTimers = [];
function later(fn, ms) {
  const id = setTimeout(() => { lessonTimers = lessonTimers.filter(x => x !== id); fn(); }, ms);
  lessonTimers.push(id);
  return id;
}
function clearLessonTimers() { lessonTimers.forEach(clearTimeout); lessonTimers = []; }
// Ferma tutto ciò che è in corso: timer, microfono, voce (prima di un passo nuovo o di uscire)
function quiet() { clearLessonTimers(); Ears.abort(); Mouth.cancel(); }
let RUN = 0;       // cambia a ogni lezione o pausa: blocca le risposte "vecchie"
let lastLessonId = null;

function lessonItems(l) { return lessonWords(l); }
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
    coach: true, coached: false,
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
  setStageTeacher(teacher.look || teacher.key);
  setPose('show');
  runStep();
}

function stopLesson() {
  stopDemo();
  RUN++;
  quiet();
  Awake.allow();
  if (L) {
    const ts = DB.teachers[L.teacher.key];
    ts.time += (Date.now() - L.start) / 1000;
    saveDB();
  }
  L = null;
  $('screen-lesson').classList.remove('tunnel');
  hideMark();
  hideYourTurn();
  $('stage-places').innerHTML = '';
  $('btn-talk').classList.remove('flash');
  setCue('');
  setPickable(false);
  hideFinger();
}

function buildGrid(items) {
  const grid = $('objects-grid');
  grid.innerHTML = '';
  grid.classList.toggle('five', items.length === 5);   // 3 sopra e 2 sotto, centrate
  grid.classList.toggle('cols4', items.length >= 4 && items.length <= 8 && items.length !== 5);
  grid.classList.toggle('cols5', items.length > 8);
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

/* ---------- L'insegnante sul palco: i suoi gesti al posto delle icone ----------
   show = mostra, ask = domanda, you = tocca a te, wrong = braccia a X, ok = braccia aperte,
   great = esulta. A ogni cambio di posa fa un piccolo movimento. */
let stageTeacher = 'luca', stagePose = '';
function setPose(pose) {
  if (pose === stagePose) return;
  stagePose = pose;
  const h = $('stage-hand');
  h.innerHTML = teacherFig(stageTeacher, pose, true);
  h.dataset.pose = pose;
  restartAnim(h, 'move');
}
function setStageTeacher(key) { stageTeacher = key; stagePose = ''; }
// Chiamata dalla voce (voice.js): mentre l'insegnante parla, le labbra si muovono
function onTeacherTalk(on) { const st = $('stage'); if (st) st.classList.toggle('talking', !!on); }

let shownObj;
function showIndicated(obj, right) {
  if (obj !== shownObj) {
    $('stage-figure').innerHTML = obj && FIG[obj] ? FIG[obj] : UNKNOWN;
    restartAnim($('stage-figure'), 'pop');
    shownObj = obj;
    setPose('show');
  }
  document.querySelectorAll('.object-box').forEach(b => {
    b.classList.toggle('indicated', b.dataset.obj === obj && !right);
    b.classList.toggle('right', b.dataset.obj === obj && !!right);
  });
}

// Effetti: bagliore verde quando è giusto, rosso e "tunnel" quando è sbagliato
function flashGood(great) {
  const st = $('stage');
  st.classList.remove('bad');
  restartAnim(st, 'good');
  setPose(great ? 'great' : 'ok');
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
  // Il tasto Talk lampeggia quando deve parlare lo studente (microfono acceso o «tocca Talk»)
  $('btn-talk').classList.toggle('flash', mode === 'rec' || text.indexOf(uiWord('talk')) !== -1);
}
function setPrompt(text) { $('prompt-text').textContent = DB.settings.showText ? shown(text) : ''; }
function setProgress(done, total) { $('progress-fill').style.width = Math.round(done / total * 100) + '%'; }

// Disegna il passo corrente senza azzerare i tentativi
/* ---------- Luoghi colorati (lezione 9: «a Londra», «in Francia») ----------
   mode 'ask' = pulsano in oro (guarda qui); 'result' = il luogo vero verde, lo sbagliato rosso. */
function showPlaces(st, mode) {
  const el = $('stage-places');
  const ps = (L && L.lesson.placeHints && typeof stepPlaces === 'function') ? stepPlaces(st) : null;
  if (!ps || !ps.length || (mode === 'ask' && (st.type === 'key' || st.type === 'reveal'))) { el.innerHTML = ''; return; }
  el.innerHTML = ps.map(p => '<div class="place ' + (mode === 'ask' ? 'pulse' : (placeIsTrue(st, p) ? 'ok' : 'no')) + '">' + PLACE_FIG(p) + '</div>').join('');
}

function drawStep() {
  const st = cur();
  $('stage-places').innerHTML = '';
  hideMark();
  hideYourTurn();
  $('l-count').textContent = (L.i + 1) + ' / ' + L.steps.length;
  setProgress(L.i, L.steps.length);
  $('heard').textContent = '';
  showIndicated(st.show);
  setPrompt(st.prompt);
}

function runStep() {
  clearLessonTimers();
  Ears.abort();
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
  setStatus(tx('listen'), '');
  if (st.type === 'ask') { askTurn(st, run); return; }
  setCue(cueFor(st));
  // frase che dice dov'è (o l'insegnante che risponde da solo): il luogo è già verde; domanda: pulsa in oro
  showPlaces(st, (st.type === 'echo' && st.check === 'claim') || st.type === 'reveal' ? 'result' : 'ask');
  setPose(cueFor(st) === 'q' ? 'ask' : 'show');
  // Durante le ripetizioni l'insegnante parla col ritmo del modello
  const rate = st.drill ? L.teacher.modelRate : L.teacher.rate * (st.speed || 1);
  const speak = () => Mouth.speak(st.prompt, rate, L.teacher.pitch, () => {
    if (!alive(run)) return;
    L.busy = false;
    // L'insegnante si è risposto da solo («Che cos'è? È una penna.»): avanti
    if (st.type === 'reveal' && !st.drill) { L.busy = true; nextStep(run, 900); return; }
    if (coachable(st) && L.coach) { coachAnswer(st, run); return; }   // anche con Repeat
    // «Questo.» / «Questa.»: il dito resta sull'oggetto (se indicasse lo studente, «questa» sembrerebbe lui)
    if (cueFor(st) === 'r' && st.check !== 'dem') setPose('you');
    listenSoon(run);
  });
  // Un attimo di silenzio prima dello sfogo
  if (st.pause && !st.drill) later(() => { if (alive(run)) speak(); }, st.pause);
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
    setStatus(tx('pickAsk'), 'wait');
    sweepFinger(() => alive(run) && !L.pick && !L.paused);
  };
  if (st.intro) Mouth.speak(COURSE.yourTurn, t.rate, t.pitch, ready); else ready();
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
    setStatus(tx('correct'), 'ok');
    flashGood();
    setCue('ok');
    const answer = answerAsk(X, r);
    if (DB.settings.showText) $('prompt-text').textContent = shown(answer);
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
    setStatus(tx('movingOn'), 'err');
    Mouth.speak(S.reveal(X).prompt, t.modelRate, t.pitch, () => {
      if (!alive(run)) return;
      scr.classList.remove('tunnel');
      nextStep(run, 600);
    });
    return;
  }
  setStatus(tx('tryAgain'), 'err');
  if (DB.settings.showText) $('prompt-text').textContent = shown(r.model);
  Mouth.speakParts([{ text: t.wrong, rate: t.rate }, { text: r.model, rate: t.modelRate }], t.pitch, () => {
    if (!alive(run)) return;
    scr.classList.remove('tunnel');
    setCue('r');
    L.busy = false;
    listenSoon(run);
  });
}

/* ---------- Prime domande con il sì: l'insegnante dà l'esempio ----------
   «È un libro?» → l'insegnante risponde lui «Sì, è un libro.» e indica l'allievo col dito:
   tocca a lui ripeterla. Dipende dal tempo di risposta: dopo una risposta con l'esempio,
   la domanda dopo l'allievo risponde da solo; se tace, sbaglia o ci mette troppo
   (più di COACH_SLOW), l'esempio torna. */
const COACH_SLOW = 5000;
function coachable(st) { return !!st && st.type === 'yes' && st.phase === 'yes' && !st.drill; }
function coachAnswer(st, run) {
  const t = L.teacher;
  L.busy = true;
  L.coached = true;
  later(() => {
    if (!alive(run)) return;
    if (DB.settings.showText) $('prompt-text').textContent = shown(st.model);
    Mouth.speak(st.model, t.modelRate, t.pitch, () => {
      if (!alive(run)) return;
      showYourTurn(t);
      listenSoon(run);
    });
  }, 350);
}
// L'insegnante punta il dito verso l'allievo: «tocca a te»
function showYourTurn() {
  setCue('');
  setPose('you');
}
function hideYourTurn() {}
// Dopo una risposta a una domanda col sì: serve ancora l'esempio alla prossima?
function coachAfter(st, ok) {
  if (!coachable(st)) return;
  if (L.coached) L.coach = !ok;
  else L.coach = !ok || (Date.now() - L.listenStart) > COACH_SLOW;
}

// Il microfono parte un attimo dopo la fine della voce dell'insegnante, così non sente
// la coda della domanda. La prima risposta che è solo l'eco della domanda si ignora.
function listenSoon(run) {
  L.busy = true;
  L.echoGuard = true;
  later(() => { if (!alive(run)) return; L.busy = false; listen(); }, 400);
}

function listen() {
  if (!L || L.busy || L.paused) return;
  const run = L.run;
  L.busy = true;
  L.listenStart = Date.now();
  setStatus(tx('speakNow'), 'rec');
  Ears.listen(
    (alts) => { if (!alive(run)) return; L.busy = false; handleAnswer(alts); },
    (code) => { if (!alive(run)) return; L.busy = false; handleListenError(code, run); }
  );
}

function handleListenError(code, run) {
  if (code === 'not-allowed') { setStatus(tx('micBlocked', { talk: uiWord('talk') }), 'err'); return; }
  if (code === 'unsupported') { setStatus(tx('noSR'), 'err'); return; }
  if (code === 'network') { setStatus(tx('needNet', { talk: uiWord('talk') }), 'err'); return; }
  L.noSpeech++;
  const st = cur();
  if (coachable(st) && !L.coached) { L.coach = true; coachAnswer(st, run); return; }
  if (L.noSpeech <= 2) {
    setStatus(tx('notHeard'), 'wait');
    later(() => { if (alive(run)) listen(); }, 700);
  } else {
    setStatus(tx('tapReady', { talk: uiWord('talk') }), 'wait');
  }
}

function handleAnswer(alts) {
  const st = cur();
  hideYourTurn();
  if (L.echoGuard) {
    L.echoGuard = false;
    if (alts.length && alts.every(a => isEcho(st, a))) {
      // era la voce dell'insegnante: si riascolta senza contare niente
      const run = L.run;
      setStatus(tx('speakNow'), 'rec');
      later(() => { if (alive(run)) listen(); }, 200);
      return;
    }
  }
  if (st.type === 'ask') {
    $('heard').textContent = alts[0] ? tx('heard') + ': “' + (COURSE.heard ? COURSE.heard(alts[0]) : alts[0]) + '”' : '';
    handleAsk(alts);
    return;
  }
  const res = evaluateAll(st, alts);
  $('heard').textContent = alts[0] ? tx('heard') + ': “' + (COURSE.heard ? COURSE.heard(alts[0]) : alts[0]) + '”' : '';
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
    showPlaces(st, 'result');
    if (L.di >= L.drill.length) { setStatus(tx('correct'), 'ok'); hideMark(); nextStep(run, 300); return; }
    const d = cur();
    $('heard').textContent = '';
    showIndicated(d.show);
    setPrompt(d.prompt);
    later(() => { if (alive(run)) { askStep(); setStatus(repLabel(), 'wait'); } }, 500);
    return;
  }
  coachAfter(st, true);
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
  setStatus(tx('correct'), 'ok');
  flashGood();
  setCue('ok');
  showPlaces(st, 'result');
  const t = L.teacher;
  L.streak++;
  const parts = [];
  // Il ritmo conta più delle lodi: l'insegnante loda solo ogni tanto (o mai)
  if (t.praiseEvery && L.streak % t.praiseEvery === 0) { parts.push({ text: pick(t.praise), rate: t.rate }); setPose('great'); }
  // «No, non è un tavolo.» su un oggetto noto: l'insegnante completa con quello che è.
  // Sull'oggetto nuovo no: il nome non si dice finché non arriva «Che cos'è?»
  if (st.type === 'neg' && !res.full && !st.fresh) parts.push({ text: st.complete || S.present(st.show).model, rate: t.modelRate });
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
  L.coached = false;
  later(() => { if (alive(run)) runStep(); }, delay);
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
      // Uscita forzata: niente deve restare acceso (microfono, voce, timer), poi la frase
      // giusta detta una volta, con calma, e si passa al passo successivo.
      saveDB();
      quiet();
      L.drill = null;
      L.di = 0;
      setStatus(tx('movingOn'), 'err');
      if (DB.settings.showText) $('prompt-text').textContent = shown(st.model);
      later(() => {
        if (!alive(run)) return;
        Mouth.speak(st.model, t.modelRate, t.pitch, () => {
          scr.classList.remove('tunnel');
          if (!alive(run)) return;
          hideMark();
          nextStep(run, 600);
        });
      }, 250);
      return;
    }
  } else {
    coachAfter(st, false);
    L.attempts++;
    ts.items++;          // il passo conta come fatto, ma non giusto al primo colpo
    L.drill = buildDrill(st, repeatsFor(t, L.errCount++), L.items);
    L.di = 0;
    L.repFails = 0;
  }
  saveDB();
  setStatus(repLabel(), 'err');
  const d = cur();
  showPlaces(d, 'result');   // mentre l'insegnante dice la frase giusta: verde il luogo vero, rosso lo sbagliato
  if (DB.settings.showText) $('prompt-text').textContent = shown(d.model);
  Mouth.speakParts([
    { text: t.wrong, rate: t.rate },
    { text: d.model, rate: t.modelRate }
  ], t.pitch, () => {
    if (!alive(run)) return;
    scr.classList.remove('tunnel');
    L.busy = false;
    setPose(cur().check === 'dem' ? 'show' : 'you');
    listenSoon(run);
  });
}
function repLabel() { return tx('practice', { i: L.di + 1, n: L.drill.length }); }

// Errore: niente icone, l'insegnante incrocia le braccia a X
function showMark() {
  setCue('');
  setPose('wrong');
}
// Segnale della frase: «?» per le domande, frecce per le frasi da ripetere
function cueFor(st) {
  if (!st || st.type === 'reveal') return '';
  if (st.type === 'ask') return 'pick';
  if (st.type === 'echo' || st.prompt === st.model) return 'r';
  return /[?？]\s*$/.test(st.prompt) ? 'q' : 'r';
}
function setCue(kind) {
  const c = $('stage-cue');
  if (kind === 'ok' || kind === 'r') kind = '';   // pollice e frecce: li fa l'insegnante coi gesti
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
    '<p>' + tx('rightFirst') + '</p><p class="muted">' + tx('teacherIs', { t: t.name }) + '</p>';
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
  if (cur().type === 'ask' && !L.pick) { setStatus(tx('tapPicFirst'), 'wait'); return; }
  L.noSpeech = 0;
  listen();
};
$('btn-exit').onclick = () => { if (demoActive) skipDemo(); else goHome(); };
$('btn-again').onclick = once(() => { if (lastLessonId) startLesson(lastLessonId); });
$('btn-end-home').onclick = () => goHome();

/* ---------- App in background e ritorno ---------- */

let demoToResume;   // undefined = nessuna demo da riprendere
function onPause() {
  quiet();
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
    setStatus(tx('paused'), '');
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
    L.coached = false;
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
  if (ti.day > 0 && ti.day <= TRIAL_DAYS) html += '<div class="card t-card"><p>' + tx('repTrialDay', { d: ti.day, n: TRIAL_DAYS }) + '</p></div>';

  const keys = Object.keys(TEACHERS);
  keys.forEach(k => {
    const s = DB.teachers[k];
    const firstPct = s.items ? Math.round(s.first / s.items * 100) : 0;
    const lat = s.latN ? (s.lat / s.latN).toFixed(1) + ' s' : tx('repNoData');
    html += '<div class="card t-card"><h3>' + TEACHERS[k].name + '</h3>' +
      '<p>' + tx('repFirst') + ': <strong>' + firstPct + '%</strong></p>' +
      '<div class="bar"><div style="width:' + firstPct + '%"></div></div>' +
      '<p class="muted">' + tx('repAvg', { s: lat }) + '</p>' +
      '<p class="muted">' + tx('repLine', { a: s.items, e: s.errors, l: s.sessions, d: s.days.length }) + '</p></div>';
  });

  const missing = keys.filter(k => DB.teachers[k].items < MIN_ANSWERS_FOR_VERDICT);
  if (missing.length) {
    html += '<div class="card t-card verdict"><p><strong>' + tx('repNoAdvice') + '</strong></p><p class="muted">' +
      tx('repNeed', { n: MIN_ANSWERS_FOR_VERDICT, names: missing.map(k => TEACHERS[k].name).join(', ') }) + '</p></div>';
  } else {
    let best = keys[0];
    keys.forEach(k => { if (teacherScore(DB.teachers[k]) > teacherScore(DB.teachers[best])) best = k; });
    html += '<div class="card t-card verdict"><p><strong>' + tx('repBest', { t: TEACHERS[best].name }) + '</strong></p>' +
      '<p class="muted">' + tx('repWhy') + '</p></div>';
  }
  $('report-body').innerHTML = html;
}
$('btn-report-home').onclick = () => goHome();
$('btn-reset').onclick = () => {
  if (!confirm(tx('confirmReset'))) return;
  DB = emptyDB();
  saveDB();
  renderReport();
};

/* ---------- Avvio ---------- */

document.body.insertAdjacentHTML('afterbegin', SVG_DEFS);
$('logo').innerHTML = LOGO;
$('logo2').innerHTML = LOGO;
if (COURSE.brand) document.querySelectorAll('.brand-name').forEach(h => { h.textContent = COURSE.brand; });
// Una sola lingua dello studente (es. CIAO English: italiano): niente domanda
if (!DB.settings.uiLang && (COURSE.students || []).length === 1) { DB.settings.uiLang = COURSE.students[0]; saveDB(); }
if (DB.settings.uiLang && (COURSE.students || []).indexOf(DB.settings.uiLang) !== -1) setUiLang(DB.settings.uiLang);
renderHome();
if (!DB.settings.uiLang || (COURSE.students || []).indexOf(DB.settings.uiLang) === -1) showLangChoice();
ttsWarmUp();
document.addEventListener('deviceready', () => {
  document.addEventListener('backbutton', (e) => { if (e && e.preventDefault) e.preventDefault(); onBack(); }, false);
  document.addEventListener('pause', onPause, false);
  document.addEventListener('resume', onResume, false);
  ttsWarmUp();
}, false);
