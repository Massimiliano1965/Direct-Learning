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
// (si calcolano poche volte: costruire le lezioni pesa sui telefoni economici; si rifanno solo quando cambiano le lezioni fatte)
let remindCache = null;
function remindSentences(n) {
  const done = LESSONS.filter(l => !l.test && DB.lessons[l.id] != null), key = done.length;
  if (remindCache && remindCache.key === key) return remindCache.out;
  const out = [];
  shuffle(done.slice()).slice(0, 4).forEach(l => {
    try { const st = buildSteps(l).find(s => s.type === 'key' && s.model); if (st && out.indexOf(shown(st.model)) === -1) out.push(shown(st.model)); } catch (e) {}
  });
  if (!out.length) {
    try { const st = buildSteps(remindNext()).find(s => s.model); if (st) out.push(shown(st.model)); } catch (e) {}
  }
  remindCache = { key: key, out: out.length ? out : [''] };
  return remindCache.out;
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
function remindStudied() {
  DB.settings.lastStudy = todayKey(); saveDB(); remindRefresh();
  if (window.CiaoRemind) { window.CiaoRemind.studied(); unlockSync(); }   // il promemoria allo sblocco: oggi niente più
}

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
  setTimeout(remindRefresh, 6000);   // dopo l'avvio: prima l'app deve essere pronta e fluida
}, false);
document.addEventListener('resume', () => { setTimeout(remindRefresh, 3000); }, false);
remindShow();

/* =====================================================================
   IL PROMEMORIA ALLO SBLOCCO (passo 2, Massi; ripreso dal blocco di StudyGame): quando si sblocca il telefono
   appare l'insegnante con una frase già imparata: «Studio adesso» (parte la lezione), «Più tardi», «Basta per oggi».
   Solo Android (plugin plugins-local/ciaoremind), spento all'inizio. Un solo permesso: «Mostra sopra le altre app».
   Mai fuori dalle 8–21, mai più di una volta ogni 3 ore, mai se oggi ha già studiato.
   DB.settings.unlock = true / false. La parte nativa riceve i testi già tradotti e la faccia dell'insegnante (PNG).
   ===================================================================== */
const unlockP = () => window.CiaoRemind || null;
// la faccia dell'insegnante (SVG di teacher.js) → PNG in base64, per la finestra nativa
function unlockFace(cb) {
  try {
    const svg = teacherHead(TEACHERS[selectedTeacherKey()].look || selectedTeacherKey()), img = new Image();
    img.onload = () => { try { const c = document.createElement('canvas'); c.width = c.height = 192; const g = c.getContext('2d');
      g.beginPath(); g.arc(96, 96, 96, 0, Math.PI * 2); g.clip(); g.drawImage(img, 0, 0, 192, 192);
      cb(c.toDataURL('image/png').split(',')[1]); } catch (e) { cb(''); } };
    img.onerror = () => cb('');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="192" height="192" '));
  } catch (e) { cb(''); }
}
// passa alla parte nativa i testi di oggi (lingua dell'allievo), la frase, la lezione che tocca
let unlockSyncT = null;
function unlockSync(done) {
  const P = unlockP();
  if (!P) { done && done(null); return; }
  clearTimeout(unlockSyncT);
  unlockSyncT = setTimeout(() => unlockFace(face => {
    const t = TEACHERS[selectedTeacherKey()], l = remindNext(), num = typeof lessonNumber === 'function' ? lessonNumber(l) : LESSONS.indexOf(l) + 1;
    P.setConfig({ enabled: !!DB.settings.unlock, from: 8, to: 21, gapMin: 180, channel: tx('unlockLabel'),
      title: (t ? t.name + ': ' : '') + tx('unlockTitle'), text: remindSentences(1)[0], lesson: '▶ ' + tx('lesson', { n: num }),
      btnStudy: tx('unlockStudy'), btnLater: tx('unlockLater'), btnToday: tx('unlockToday'), notifText: tx('unlockOn'), face: face },
      (st) => done && done(st), () => done && done(null));
  }), 50);
}
function unlockShow(msg) {
  const box = $('opt-unlock');
  if (!box) return;
  $('opt-unlock-check').checked = !!DB.settings.unlock;
  $('unlock-note').textContent = msg || (DB.settings.unlock ? tx('unlockOnShort') : '');
  $('unlock-test').classList.toggle('hidden', !DB.settings.unlock || !unlockP());
}
function unlockSet(on) {
  const P = unlockP();
  if (on && !P) { DB.settings.unlock = false; saveDB(); unlockShow(tx('unlockNeedsAndroid')); return; }
  DB.settings.unlock = !!on;
  saveDB();
  if (!on) { unlockSync(); unlockShow(); return; }
  P.status((st) => {
    if (!st.overlay) { unlockGuide(); return; }    // manca il permesso: la guida passo passo
    unlockSync(() => unlockShow());
  });
}
// la guida al permesso «Mostra sopra le altre app» (come in StudyGame, con il trucco delle impostazioni con restrizioni)
function unlockGuide() {
  $('guide-body').innerHTML = '<ol class="guide-steps">' + [1, 2, 3].map(i => '<li>' + tx('unlockG' + i) + '</li>').join('') + '</ol>' +
    '<p class="muted guide-more">' + tx('unlockGMore') + '</p>';
  applyStaticText();
  showScreen('guide');
}
(function () {
  if (typeof document === 'undefined' || !document.getElementById || !document.getElementById('opt-unlock')) return;
  $('opt-unlock-check').onchange = (e) => unlockSet(e.target.checked);
  $('unlock-test').onclick = () => { const P = unlockP(); if (P) unlockSync(() => P.test()); };
  $('guide-open').onclick = () => { const P = unlockP(); if (P) P.openOverlaySettings(); };
  $('guide-info').onclick = () => { const P = unlockP(); if (P) P.openAppInfo(); };
  $('guide-back').onclick = () => { DB.settings.unlock = false; saveDB(); renderHome(); showScreen('home'); };
  unlockShow();
})();
// «Studio adesso» dalla finestra: l'app si apre e parte la lezione che tocca
function unlockTake() {
  const P = unlockP();
  if (!P) return;
  P.takeStudy((yes) => {
    if (!yes) return;
    const l = remindNext();
    if (typeof stopLesson === 'function') stopLesson();
    renderHome(); showScreen('home');
    setTimeout(() => startLesson(l.id), 300);
  });
}
// tornando dalle Impostazioni: se il permesso adesso c'è, il promemoria allo sblocco si accende
function unlockResume() {
  const P = unlockP();
  if (!P) return;
  unlockTake();
  if (DB.settings.unlock) P.status((st) => {
    if (st.overlay) { unlockSync(() => { unlockShow(); if (currentScreen === 'guide') { renderHome(); showScreen('home'); unlockShow(tx('unlockReady')); } }); }
  });
}
document.addEventListener('deviceready', () => { unlockTake(); setTimeout(unlockResume, 7000); }, false);
document.addEventListener('resume', () => { setTimeout(unlockResume, 300); }, false);
