'use strict';
/* =====================================================================
   IL PROMEMORIA PER STUDIARE (Massi): l'allievo sceglie l'ora nelle opzioni del menu (spento all'inizio).
   Ogni giorno a quell'ora una notifica: l'insegnante e una frase già imparata, e la lezione che tocca.
   Toccando la notifica parte subito la lezione (la prima non ancora fatta). Tasto «Tra un'ora» per rimandare.
   - Se quel giorno ha già fatto una lezione, la notifica di oggi non arriva.
   - Le notifiche si preparano per 7 giorni (ognuna con una frase diversa) e si rifanno ad ogni avvio e a fine lezione.
   - Solo il permesso delle notifiche (lo stesso di «Le mie frasi»): niente permessi speciali.
   DB.settings.remind = l'ora (8, 13, 18, 21) o null; DB.settings.lastStudy = il giorno dell'ultima lezione fatta.
   ===================================================================== */

const REMIND_HOURS = [8, 13, 18, 21];
const REMIND_ID = 7001, REMIND_LATER_ID = 7100, REMIND_DAYS = 7;
const remindN = () => { const c = window.cordova; return (c && c.plugins && c.plugins.notification && c.plugins.notification.local) || null; };

// la lezione che tocca: la prima non ancora fatta
function remindNext() { return LESSONS.find(l => !l.test && DB.lessons[l.id] == null) || LESSONS.find(l => !l.test); }
// frasi già imparate (le domande chiave delle lezioni fatte); all'inizio la prima frase della lezione che tocca
function remindSentences(n) {
  const done = LESSONS.filter(l => !l.test && DB.lessons[l.id] != null), out = [];
  shuffle(done.slice()).slice(0, n * 2).forEach(l => {
    try { const st = buildSteps(l).find(s => s.type === 'key' && s.model); if (st && out.indexOf(shown(st.model)) === -1) out.push(shown(st.model)); } catch (e) {}
  });
  if (!out.length) {
    try { const st = buildSteps(remindNext()).find(s => s.model); if (st) out.push(shown(st.model)); } catch (e) {}
  }
  return out.length ? out : [''];
}
function remindText(sentence) {
  const l = remindNext(), num = typeof lessonNumber === 'function' ? lessonNumber(l) : LESSONS.indexOf(l) + 1;
  return (sentence ? sentence + '\n' : '') + '▶ ' + tx('lesson', { n: num });
}
function remindTitle() { const t = TEACHERS[selectedTeacherKey()]; return (t ? t.name + ': ' : '') + tx('remindTitle'); }

// rifà le notifiche dei prossimi giorni (si chiama all'avvio, a fine lezione e quando si cambia l'ora)
function remindRefresh() {
  const N = remindN();
  if (!N) return;
  const ids = []; for (let d = 0; d < REMIND_DAYS; d++) ids.push(REMIND_ID + d);
  N.cancel(ids, () => {
    const h = DB.settings.remind;
    if (h == null) return;
    const now = new Date(), today = todayKey(), says = remindSentences(REMIND_DAYS), list = [];
    for (let d = 0; d < REMIND_DAYS; d++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, 0, 0, 0);
      if (at <= now) continue;
      if (d === 0 && DB.settings.lastStudy === today) continue;   // oggi ha già studiato
      list.push({ id: REMIND_ID + d, title: remindTitle(), text: remindText(says[d % says.length]), data: { study: 1 },
        trigger: { at: at }, actions: [{ id: 'remind_later', title: tx('fav_in1h') }], allowWhileIdle: true, foreground: true });
    }
    if (list.length) N.schedule(list);
  });
}
// a fine lezione: oggi ha studiato (la notifica di oggi non serve più)
function remindStudied() { DB.settings.lastStudy = todayKey(); saveDB(); remindRefresh(); }

/* ---------- Le opzioni: Spento / 8:00 / 13:00 / 18:00 / 21:00 ---------- */
function remindShow(msg) {
  const box = $('opt-remind');
  if (!box) return;
  box.innerHTML = '<button data-h="">' + tx('remindOff') + '</button>' + REMIND_HOURS.map(h => '<button data-h="' + h + '">' + h + ':00</button>').join('');
  box.querySelectorAll('button').forEach(b => {
    b.classList.toggle('on', String(DB.settings.remind == null ? '' : DB.settings.remind) === b.dataset.h);
    b.onclick = () => remindSet(b.dataset.h === '' ? null : +b.dataset.h);
  });
  $('remind-note').textContent = msg || '';
}
function remindSet(h) {
  DB.settings.remind = h;
  saveDB();
  const N = remindN();
  if (h == null) { remindShow(); remindRefresh(); return; }
  if (!N) { remindShow(tx('favNeedsApp')); return; }
  N.requestPermission((granted) => {
    if (!granted) { DB.settings.remind = null; saveDB(); remindShow(tx('favNoPerm')); return; }
    remindShow(tx('remindOn', { h: h + ':00' }));
    remindRefresh();
  });
}

document.addEventListener('deviceready', () => {
  const N = remindN();
  if (!N) return;
  // toccando la notifica: parte la lezione che tocca
  N.on('click', (n) => {
    const d = n && n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : {};
    if (!d.study) return;
    const l = remindNext();
    if (typeof stopLesson === 'function') stopLesson();
    renderHome(); showScreen('home');
    setTimeout(() => startLesson(l.id), 300);
  });
  // «Tra un'ora»: la stessa notifica fra un'ora
  N.on('remind_later', (n) => {
    N.schedule({ id: REMIND_LATER_ID, title: n.title, text: n.text, data: { study: 1 }, trigger: { at: new Date(Date.now() + 3600e3) },
      actions: [{ id: 'remind_later', title: tx('fav_in1h') }], allowWhileIdle: true, foreground: true });
  });
  if (typeof N.fireQueuedEvents === 'function') N.fireQueuedEvents();
  remindRefresh();
}, false);
document.addEventListener('resume', () => { remindRefresh(); }, false);
remindShow();
