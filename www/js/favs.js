'use strict';
/* =====================================================================
   LE MIE FRASI (idea di Massi): lo studente segna con la stellina ☆ la frase che vuole ricordare.
   - Nel menu «★ Le mie frasi»: la lista, con la figura e la frase.
   - «Esercitati»: una mini-sessione di domande serrate su quella frase: 8 domande; ogni errore ne aggiunge una (al massimo 15).
     Al 100% un grosso pollice in su entra con lo zoom.
   - «Ricordamelo»: il timer (come in TurnUpp: cordova-plugin-local-notification): tra un'ora, stasera, domani, ogni giorno.
     Toccando la notifica si apre la mini-sessione di quella frase.
   I dati stanno in DB.settings.favs (si salvano con il resto).
   ===================================================================== */

const FAV_MIN = 8, FAV_MAX = 15;
const favList = () => (DB.settings.favs = DB.settings.favs || []);
const favFind = (id) => favList().find(f => f.id === id);
const hasNotif = () => !!(window.cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local);

/* ---------- La stellina nella lezione ---------- */
// il passo «vero» (non la ripetizione) e solo quelli con una risposta da dire
function favBaseStep() {
  if (!L || L.test || L.lesson.fav) return null;
  const st = L.steps[L.i];
  return st && st.model && st.type !== 'reveal' && st.type !== 'ask' ? st : null;
}
function favSavedFor(st) { return !!st && favList().some(f => f.text === st.model); }
function favUpdateStar() {
  const b = $('btn-fav');
  if (!b) return;
  const st = favBaseStep();
  b.classList.toggle('hidden', !L || !!L.test || !!L.lesson.fav);
  b.disabled = !st;
  const on = favSavedFor(st);
  b.classList.toggle('on', on);
  b.textContent = on ? '★' : '☆';
}
function favToggle() {
  const st = favBaseStep();
  if (!st) return;
  const list = favList(), i = list.findIndex(f => f.text === st.model);
  if (i !== -1) { favCancelTimer(list[i]); list.splice(i, 1); }
  else {
    const clean = Object.assign({}, st);
    ['drill', 'review', 'reviewItems', 'phase', 'speed'].forEach(k => { delete clean[k]; });
    DB.settings.favSeq = (DB.settings.favSeq || 0) + 1;
    list.unshift({ id: DB.settings.favSeq, lesson: L.lesson.id, step: clean, items: (st.reviewItems || L.items || []).slice(0, 12), text: st.model, best: null, timer: null });
    const b = $('btn-fav'); restartAnim(b, 'pop');
  }
  saveDB();
  favUpdateStar();
}

/* ---------- La mini-sessione ---------- */
function favSteps(f) {
  const base = f.step, n = FAV_MAX;
  let pool;
  try { pool = buildDrill(base, n, f.items && f.items.length ? f.items : [base.show]); } catch (e) { pool = []; }
  pool = pool.map(s => Object.assign({}, s, { drill: false, phase: 'fav' }));
  // la domanda vera torna ogni tanto (alla 3ª, 6ª, 9ª…), così non è solo ripetere
  const out = [];
  for (let i = 0; out.length < n && (i < pool.length || out.length < n); i++) {
    if (out.length % 3 === 2) out.push(Object.assign({}, base, { phase: 'fav' }));
    if (out.length < n) out.push(pool[i % Math.max(pool.length, 1)] || Object.assign({}, base, { phase: 'fav' }));
  }
  return out;
}
function startFav(id) {
  const f = favFind(id);
  if (!f) return;
  const orig = LESSONS.find(l => l.id === f.lesson) || {};
  const all = favSteps(f);
  const lesson = { id: 'fav:' + id, title: '★ ' + tx('favs'), level: orig.level || 1, fav: f.id, known: [] };
  startLesson(lesson.id, { lesson: lesson, steps: all.slice(0, FAV_MIN), items: f.items && f.items.length ? f.items : [f.step.show] });
  if (L) L.favPool = all.slice(FAV_MIN);
}
// errore nella mini-sessione: «No.», la frase giusta, una domanda in più (fino a 15), avanti — niente ripetizioni lunghe
function favWrong() {
  const st = cur(), run = L.run, t = L.teacher;
  DB.teachers[t.key].errors++;
  L.busy = true; L.streak = 0;
  if (L.attempts === 0 && L.favPool && L.favPool.length && L.steps.length < FAV_MAX) L.steps.push(L.favPool.shift());
  L.attempts++;
  flashBad(); showMark(t.mark);
  saveDB();
  setStatus(tx('favWrong'), 'err');
  if (DB.settings.showText) { $('prompt-text').textContent = shown(st.model); synWrap(); }
  Mouth.speakParts([{ text: t.wrong, rate: t.rate }, { text: st.model, rate: t.modelRate }], t.pitch, () => {
    if (!alive(run)) return;
    $('screen-lesson').classList.remove('tunnel');
    hideMark();
    nextStep(run, 400);
  });
}
const FAV_THUMB = '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="56" fill="#c9a45c" opacity=".18"/>' +
  '<path d="M38 56 h12 l14 -26 q4 -8 10 -4 q4 3 2 10 l-5 16 h20 q8 0 7 9 l-5 26 q-2 7 -9 7 h-34 q-4 0 -6 -3z" fill="#f3d36b" stroke="#8e6a2a" stroke-width="3" stroke-linejoin="round"/>' +
  '<rect x="22" y="54" width="18" height="40" rx="4" fill="#c9a45c" stroke="#8e6a2a" stroke-width="3"/>' +
  '<path d="M70 66 h18 M68 78 h18" stroke="#c9a45c" stroke-width="3" stroke-linecap="round"/></svg>';
function favFinish() {
  const total = answerSteps(L.steps), pct = Math.round(L.first / total * 100), f = favFind(L.lesson.fav), t = L.teacher, id = L.lesson.fav;
  if (f) { f.best = Math.max(f.best || 0, pct); f.last = pct; f.done = (f.done || 0) + 1; }
  saveDB();
  stopLesson();
  document.body.classList.remove('test-end');
  const h2 = document.querySelector('#screen-end h2');
  h2.dataset.t = pct === 100 ? 'favPerfect' : 'favDone'; delete h2.dataset.n; h2.textContent = tx(h2.dataset.t);
  Mouth.speak(pct === 100 ? pick(t.praise || [t.done]) : t.done, t.rate, t.pitch, null);
  const C = 427;
  $('end-body').innerHTML = (pct === 100
    ? '<div class="fav-thumb">' + FAV_THUMB + '</div>'
    : '<div class="ring"><svg viewBox="0 0 160 160"><circle class="track" cx="80" cy="80" r="68"/><circle class="val" cx="80" cy="80" r="68" stroke-dasharray="' + C +
      '" stroke-dashoffset="' + Math.round(C * (1 - pct / 100)) + '"/></svg><div class="num">' + pct + '%</div></div>') +
    '<p class="fav-phrase">«' + (f ? shown(f.text) : '') + '»</p><p class="muted">' + tx('favScore', { p: pct }) + '</p>';
  lastLessonId = 'fav:' + id;
  const ag = $('btn-again'); ag.dataset.t = 'favAgain'; ag.textContent = tx('favAgain');
  showScreen('end', true);
}

/* ---------- Il timer (le notifiche del telefono, come TurnUpp) ---------- */
const FAV_WHEN = ['in1h', 'tonight', 'tomorrow', 'daily'];
function favWhenDate(kind) {
  const d = new Date();
  if (kind === 'in1h') return new Date(d.getTime() + 3600e3);
  if (kind === 'tonight') { d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); return d; }
  d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d;
}
function favCancelTimer(f) {
  if (f.timer && hasNotif()) cordova.plugins.notification.local.cancel(f.id);
  f.timer = null;
}
function favSetTimer(f, kind, done) {
  favCancelTimer(f);
  if (!kind) { saveDB(); done && done(); return; }
  f.timer = kind;
  saveDB();
  if (!hasNotif()) { done && done(tx('favNeedsApp')); return; }
  const N = cordova.plugins.notification.local;
  N.requestPermission((granted) => {
    if (!granted) { done && done(tx('favNoPerm')); return; }
    N.schedule({
      id: f.id, title: 'CIAO ★ ' + tx('favs'), text: shown(f.text), data: { fav: f.id },
      trigger: kind === 'daily' ? { every: { hour: 9, minute: 0 } } : { at: favWhenDate(kind) },
      allowWhileIdle: true, foreground: true
    });
    done && done();
  });
}
document.addEventListener('deviceready', () => {
  if (!hasNotif()) return;
  // toccando la notifica: la mini-sessione di quella frase
  cordova.plugins.notification.local.on('click', (n) => { const id = n && n.data && (n.data.fav || (typeof n.data === 'string' && JSON.parse(n.data).fav)); if (id && favFind(id)) startFav(id); });
}, false);

/* ---------- La schermata «Le mie frasi» ---------- */
function renderFavs() {
  const list = favList(), box = $('favs-body');
  if (!list.length) { box.innerHTML = '<p class="muted">' + tx('favEmpty') + '</p>'; return; }
  box.innerHTML = list.map(f => '<div class="fav-card" data-id="' + f.id + '">' +
    '<div class="fav-fig">' + (FIG[f.step.show] || '') + '</div>' +
    '<div class="fav-main"><div class="fav-text">' + shown(f.text) + '</div>' +
    '<div class="fav-meta">' + (f.best != null ? '<span class="score' + (f.best === 100 ? ' top' : '') + '">' + f.best + '%</span>' : '') +
      (f.timer ? '<span class="fav-timer-on">⏰ ' + tx('fav_' + f.timer) + '</span>' : '') + '</div>' +
    '<div class="fav-row"><button class="fav-go">▶ ' + tx('favPractice') + '</button><button class="fav-clock secondary">⏰</button><button class="fav-del secondary">✕</button></div>' +
    '<div class="fav-when hidden">' + FAV_WHEN.map(k => '<button class="secondary" data-k="' + k + '">' + tx('fav_' + k) + '</button>').join('') +
      '<button class="secondary" data-k="">' + tx('favNoTimer') + '</button><div class="fav-msg muted"></div></div></div></div>').join('');
  box.querySelectorAll('.fav-card').forEach(card => {
    const f = favFind(+card.dataset.id);
    card.querySelector('.fav-go').onclick = once(() => startFav(f.id));
    card.querySelector('.fav-clock').onclick = () => card.querySelector('.fav-when').classList.toggle('hidden');
    card.querySelector('.fav-del').onclick = () => { favCancelTimer(f); favList().splice(favList().indexOf(f), 1); saveDB(); renderFavs(); };
    card.querySelectorAll('.fav-when button').forEach(b => {
      b.onclick = () => favSetTimer(f, b.dataset.k, (msg) => { renderFavs(); if (msg) { const c = $('favs-body').querySelector('.fav-card[data-id="' + f.id + '"] .fav-when'); c.classList.remove('hidden'); c.querySelector('.fav-msg').textContent = msg; } });
    });
  });
}
function showFavs() { renderFavs(); applyStaticText(); showScreen('favs'); }
$('btn-fav').onclick = favToggle;
$('btn-favs-home').onclick = () => { renderHome(); showScreen('home'); };
