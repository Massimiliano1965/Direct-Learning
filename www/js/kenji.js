'use strict';
/* =====================================================================
   «IL SIGNOR KENJI» — la storia a puntate (Massi: «Impara la lingua e scopri il mistero.»).
   La trama intera è in docs/kenji.md. Una puntata alla fine di ogni lezione: si sblocca quando la lezione è fatta.
   - Le scene: un disegno grande e una frase, detta dall'insegnante (solo parole già imparate; le nuove con il disegno).
   - Poi 2–3 domande sulla storia: l'insegnante chiede, l'allievo risponde a voce (come nelle lezioni).
   - Alla fine «Continua…»: la puntata dopo arriva con la lezione dopo.
   I disegni: le figure delle lezioni (FIG) e le persone in piedi di azioni_fig.js (actStanding).
   ===================================================================== */

/* ---------- I disegni delle scene (viewBox 200 × 120, il pavimento a y = 104) ---------- */
const KJ_W = 200;
function kjPut(key, x, y, s) {   // una figura delle lezioni (FIG, 100 × 100) in x, y, grande s
  const f = FIG[key];
  return f ? f.replace('<svg ', '<svg x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" ') : '';
}
function kjRoom(wall) {
  return '<rect width="200" height="96" fill="' + (wall || '#e9dfcc') + '"/><rect y="96" width="200" height="24" fill="#b08a62"/>' +
    '<path d="M0 96 H200" stroke="#8a6a48" stroke-width="2"/><path d="M0 104 H200 M0 113 H200" stroke="#9c7a55" stroke-width=".6" opacity=".6"/>';
}
function kjPerson(look, x, sc, pose) { return typeof actStanding === 'function' ? actStanding(look, x, sc || 1, pose) : ''; }
// Kenji: le pose che servono
const KJ = {
  stand: (x, f) => kjPerson('kenji', x, 1, Object.assign({}, f || {})),
  sad: (x) => kjPerson('kenji', x, 1, { face: 'flat', arms: [[-4, 6], [-6, 8]], r: 4 }),
  wow: (x) => kjPerson('kenji', x, 1, { face: 'open', arms: [[-150, 0], [150, 0]] }),
  point: (x) => kjPerson('kenji', x, 1, { arms: [[-4, 6], [95, 10]] }),
  walk: (x) => kjPerson('kenji', x, 1, { legs: [[-22, 8], [22, 4]], arms: [[22, 20], [-22, 10]] })
};
function kjBubble(x, y, w, text, tailX) {   // il fumetto: esce dalla bocca (la punta verso tailX)
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="16" rx="7" fill="#fff" stroke="#2a3346" stroke-width=".8"/>' +
    '<path d="M' + (tailX - 3) + ' ' + (y + 15.6) + ' L' + tailX + ' ' + (y + 23) + ' L' + (tailX + 4) + ' ' + (y + 15.6) + 'z" fill="#fff"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 11.4) + '" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#2a3346">' + text + '</text>';
}
// la tazza vuota (niente caffè!): bianca, si vede il fondo
const kjKup = (x, y) => '<ellipse cx="' + x + '" cy="' + (y + 30) + '" rx="22" ry="4" fill="#c9ccd4"/>' +
  '<path d="M' + (x - 16) + ' ' + y + ' h32 l-3 26 q-13 6 -26 0z" fill="#f4f4f6"/><ellipse cx="' + x + '" cy="' + y + '" rx="16" ry="4" fill="#dfe3ea"/>' +
  '<path d="M' + (x + 15) + ' ' + (y + 6) + ' q10 0 9 8 q-1 7 -11 6" stroke="#f4f4f6" stroke-width="3" fill="none"/>';
const kjQ = (x, y, s) => '<text x="' + x + '" y="' + y + '" font-family="Georgia,serif" font-size="' + (s || 26) + '" font-weight="bold" fill="#c9a45c">?</text>';
// la porta della stanza (aperta: con la luce del corridoio e l'ombra di chi entra)
function kjDoor(x, open, shadow) {
  let s = '<rect x="' + (x - 2) + '" y="30" width="34" height="68" fill="#6b4a2e"/>';
  if (!open) return s + '<rect x="' + x + '" y="32" width="30" height="66" fill="#9a6a3c"/><circle cx="' + (x + 25) + '" cy="66" r="1.8" fill="#e6c77e"/>';
  s += '<rect x="' + x + '" y="32" width="30" height="66" fill="#fff4d6"/><path d="M' + x + ' 32 L' + (x - 12) + ' 36 L' + (x - 12) + ' 100 L' + x + ' 98z" fill="#9a6a3c"/>';
  if (shadow) s += '<g fill="#2a2433"><circle cx="' + (x + 15) + '" cy="48" r="5.5"/><path d="M' + (x + 8) + ' 56 q7 -4 14 0 l2 26 h-4 l-1 16 h-4 l-1 -16 h-2 l-1 16 h-4 l-1 -16 h-2z"/>' +
    '<rect x="' + (x + 21) + '" y="78" width="9" height="14" rx="1.5"/></g>';
  return s;
}
// la finestra aperta su Napoli: il cielo, il mare, il Vesuvio, e sotto l'insegna del bar
function kjNapoli(x, y, w, h) {
  return '<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="' + (w + 6) + '" height="' + (h + 6) + '" fill="#f3eee2"/>' +
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#8cc4e3"/>' +
    '<path d="M' + x + ' ' + (y + h * .62) + ' L' + (x + w * .28) + ' ' + (y + h * .3) + ' L' + (x + w * .36) + ' ' + (y + h * .36) + ' L' + (x + w * .44) + ' ' + (y + h * .28) + ' L' + (x + w * .72) + ' ' + (y + h * .62) + 'z" fill="#7a7f8c"/>' +
    '<path d="M' + (x + w * .36) + ' ' + (y + h * .3) + ' q2 -6 6 -9 q-1 5 2 9z" fill="#e2e6ec" opacity=".8"/>' +
    '<rect x="' + x + '" y="' + (y + h * .62) + '" width="' + w + '" height="' + (h * .38) + '" fill="#3f7fb5"/>' +
    '<path d="M' + (x + 5) + ' ' + (y + h * .75) + ' h8 M' + (x + w * .5) + ' ' + (y + h * .85) + ' h9" stroke="#cfe6f5" stroke-width="1"/>' +
    '<circle cx="' + (x + w - 9) + '" cy="' + (y + 9) + '" r="4.5" fill="#f3d36b"/>' +
    '<path d="M' + (x + w / 2) + ' ' + y + ' V' + (y + h) + '" stroke="#f3eee2" stroke-width="2"/>';
}
const kjBar = (x, y) => '<rect x="' + x + '" y="' + y + '" width="58" height="15" rx="2" fill="#2f5d4a" stroke="#f3d36b" stroke-width="1"/>' +
  '<text x="' + (x + 29) + '" y="' + (y + 11) + '" text-anchor="middle" font-family="Georgia,serif" font-size="9.5" font-weight="bold" fill="#f3d36b">BAR ANNA</text>';
function kjScene(inner) { return '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }

/* ---------- Le puntate ----------
   scenes: [disegno, frase detta e scritta]; questions: { q, show (la scena), model, ok: [parole che servono], no: [parole sbagliate] } */
const KENJI = [
  { lesson: 'l1', title: 'La stanza vuota', scenes: [
      [() => kjRoom() + kjDoor(150, false) + kjPut('table', 40, 52, 56) + kjPut('chair', 98, 56, 46), 'È un tavolo. È una sedia.'],
      [() => kjRoom() + kjPut('table', 30, 40, 80) + kjPut('book', 46, 40, 32) + kjPut('pen', 82, 48, 24), 'È un libro. È una penna.'],
      [() => kjRoom('#e2d6c0') + kjPut('book', 66, 14, 70) + '<text x="101" y="52" text-anchor="middle" font-size="8" fill="#f3eee2">日本語</text>' + kjQ(140, 50), 'È un libro?'],
      [() => kjRoom() + kjPut('table', 20, 52, 56) + kjPut('chair', 74, 56, 46) + kjDoor(150, true, true), 'Chi è?'],
      [() => kjRoom('#d8ccb6') + kjDoor(150, true, true) + kjQ(60, 70, 40), 'Continua…']
    ], questions: [
      { show: 0, q: 'È un tavolo o una sedia?', model: 'È un tavolo.', ok: ['tavolo'], no: ['sedia', 'non'] },
      { show: 1, q: 'È un libro?', model: 'Sì, è un libro.', ok: ['libro'], no: ['non', 'no'] },
      { show: 1, q: 'Che cos\'è?', mark: [97, 26], model: 'È una penna.', ok: ['penna'], no: ['libro'] }
    ] },
  { lesson: 'l2', title: 'La finestra', scenes: [
      [() => kjRoom() + kjPut('table', 20, 52, 56) + kjDoor(150, true, false) + KJ.walk(160), 'È una porta. È Kenji!'],
      [() => kjRoom() + '<rect x="70" y="18" width="60" height="56" fill="#9a6a3c"/><rect x="74" y="22" width="52" height="48" fill="#cfe1ec"/><path d="M100 22 V70" stroke="#9a6a3c" stroke-width="3"/>' + KJ.stand(40), 'È una finestra.'],
      [() => kjRoom() + kjNapoli(66, 16, 70, 60) + KJ.wow(36), 'È Napoli!'],
      [() => '<rect width="200" height="120" fill="#8cc4e3"/>' + kjNapoli(10, 6, 180, 70) + '<rect y="80" width="200" height="40" fill="#e9dfcc"/>' + kjBar(71, 88) + kjQ(150, 112, 22), 'BAR ANNA?'],
      [() => kjRoom() + kjNapoli(66, 16, 70, 60) + KJ.stand(150, { happy: 1 }), 'Continua…']
    ], questions: [
      { show: 1, q: 'È una porta o una finestra?', model: 'È una finestra.', ok: ['finestra'], no: ['porta'] },
      { show: 0, q: 'È una porta?', model: 'Sì, è una porta.', ok: ['porta'], no: ['non', 'no'] }
    ] },
  { lesson: 'l3', title: 'Niente caffè', scenes: [
      [() => kjRoom() + kjPut('table', 50, 40, 80) + kjPut('computer', 56, 36, 38) + kjPut('cup', 96, 50, 22), 'È un computer. È una tazza.'],
      [() => kjRoom('#e2d6c0') + KJ.sad(46) + kjKup(118, 60) + kjQ(150, 56), 'È una tazza…'],
      [() => kjRoom() + kjPut('bottle', 110, 50, 40) + KJ.sad(70), 'È una bottiglia.'],
      [() => kjRoom() + kjNapoli(110, 16, 60, 54) + '<path d="M140 74 q-6 -8 0 -16 q6 -8 0 -16 M150 76 q-6 -8 0 -16" stroke="#8a6a48" stroke-width="2" fill="none" opacity=".7"/>' + KJ.wow(60), '…!'],
      [() => kjRoom() + kjNapoli(66, 16, 70, 60) + kjQ(96, 60, 34), 'Continua…']
    ], questions: [
      { show: 0, q: 'È una tazza?', model: 'Sì, è una tazza.', ok: ['tazza'], no: ['non', 'no'] },
      { show: 0, q: 'Che cos\'è?', mark: [78, 13], model: 'È un computer.', ok: ['computer'], no: ['tazza'] },
      { show: 2, q: 'È una bottiglia o una tazza?', model: 'È una bottiglia.', ok: ['bottiglia'], no: ['tazza'] }
    ] },
  { lesson: 'l4', title: 'Il quaderno rosso', scenes: [
      [() => kjRoom() + kjPut('table', 40, 40, 80) + kjPut('phone', 65, 42, 30) + '<path d="M60 46 q-5 6 0 12 M56 42 q-8 10 0 20 M98 46 q5 6 0 12 M102 42 q8 10 0 20" stroke="#c9a45c" stroke-width="2" fill="none"/>', 'È un telefono!'],
      [() => kjRoom('#e2d6c0') + kjPut('key', 60, 22, 80), 'È una chiave.'],
      [() => kjRoom('#e2d6c0') + kjPut('notebook', 60, 22, 80), 'È un quaderno.'],
      [() => kjRoom() + kjPut('umbrella', 30, 44, 56) + kjPut('bag', 110, 50, 50), 'È un ombrello. È una borsa.'],
      [() => kjRoom() + kjDoor(150, true, false) + KJ.walk(166) + kjQ(80, 70, 34), 'Continua…']
    ], questions: [
      { show: 2, q: 'Che cos\'è?', model: 'È un quaderno.', ok: ['quaderno'], no: ['libro'] },
      { show: 1, q: 'È una chiave o un telefono?', model: 'È una chiave.', ok: ['chiave'], no: ['telefono'] },
      { show: 3, q: 'È un ombrello?', model: 'Sì, è un ombrello.', ok: ['ombrello'], no: ['non', 'no'] }
    ] },
  { lesson: 'l5', title: 'Rosa', scenes: [
      [() => '<rect width="200" height="120" fill="#e9dfcc"/><rect y="96" width="200" height="24" fill="#c9c2b3"/>' + kjBar(71, 6) +
        '<rect x="20" y="28" width="40" height="68" fill="#2f2f36"/><rect x="24" y="32" width="32" height="64" fill="#3a3a44"/>' +
        kjPut('table', 92, 52, 56) + kjPut('cup_rosso', 100, 50, 22) + kjPut('cup', 124, 52, 20), 'La porta è nera. La tazza è rossa. La tazza è bianca.'],
      [() => '<rect width="200" height="120" fill="#e9dfcc"/><rect y="96" width="200" height="24" fill="#c9c2b3"/>' + KJ.stand(60) + kjPerson('bambina', 130, .66, { arms: [[-4, 6], [-95, 10]] }) +
        '<circle cx="112" cy="70" r="5" fill="#f4a6c4"/><circle cx="112" cy="70" r="2" fill="#e27aa3"/><path d="M112 75 v10" stroke="#5a9a46" stroke-width="1.6"/>' + kjBubble(118, 34, 34, 'Rosa!', 128), 'Rosa!'],
      [() => '<rect width="200" height="120" fill="#e9dfcc"/><rect y="96" width="200" height="24" fill="#c9c2b3"/>' + KJ.point(60) + kjPerson('bambina', 130, .66) +
        '<circle cx="96" cy="62" r="5" fill="#f4a6c4"/><circle cx="96" cy="62" r="2" fill="#e27aa3"/>' + kjBubble(30, 18, 54, 'Sì, è rosa.', 58), 'Sì, è rosa.'],
      [() => '<rect width="200" height="120" fill="#e9dfcc"/><rect y="96" width="200" height="24" fill="#c9c2b3"/>' + KJ.stand(60, { face: 'o' }) + kjPerson('bambina', 130, .66, { face: 'open', happy: 1 }) +
        '<rect x="112" y="78" width="36" height="12" rx="2" fill="#fff" stroke="#c9a45c"/><text x="130" y="87" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-weight="bold" fill="#c94a7a">ROSA</text>' +
        '<text x="160" y="44" font-family="Georgia,serif" font-size="12" fill="#c94a7a">ah ah!</text>', 'Rosa? … È Rosa!'],
      [() => '<rect width="200" height="120" fill="#e9dfcc"/><rect y="96" width="200" height="24" fill="#c9c2b3"/>' + kjBar(71, 6) + KJ.stand(100, { face: 'o' }) + kjQ(130, 60, 34), 'Continua…']
    ], questions: [
      { show: 0, q: 'La porta è bianca?', model: 'No, la porta non è bianca.', ok: ['non', 'bianca'], no: ['rossa'] },
      { show: 0, q: 'La tazza è rossa o bianca?', mark: [111, 50], model: 'La tazza è rossa.', ok: ['rossa'], no: ['bianca'] },
      { show: 0, q: 'Di che colore è la porta?', model: 'La porta è nera.', ok: ['nera'], no: ['rossa', 'bianca'] }
    ] }
];

/* ---------- Le regole ---------- */
// la storia è in italiano: solo nel corso di italiano (le app di inglese, russo… non la vedono)
const KJ_ON = typeof COURSE !== 'undefined' && /^it/i.test(COURSE.lang || '');
const kjOpen = (i) => DB.lessons[KENJI[i].lesson] != null;   // la lezione è fatta
const kjIndexOf = (lessonId) => KJ_ON ? KENJI.findIndex(e => e.lesson === lessonId) : -1;
function kjCheck(Q, text) {
  const s = gNorm(text);
  const has = (w) => s.indexOf(' ' + gNorm(w).trim() + ' ') !== -1;
  return Q.ok.every(has) && !(Q.no || []).some(has);
}

/* ---------- La schermata della puntata ---------- */
let KS = null;   // { i, part: 'scene' | 'q' | 'end', k, run }
function kjTeacher() { const t = TEACHERS[selectedTeacherKey()]; Mouth.gender = t.gender; Mouth.voiceIdx = t.voice || 0; return t; }
function kjSay(text, cb) { const t = kjTeacher(); Mouth.speak(text.replace('…', '.'), t.rate, t.pitch, cb); }
function kjDraw(svg, text, cls) {
  $('kj-stage').innerHTML = svg;
  restartAnim($('kj-stage'), 'pop');
  $('kj-text').textContent = text;
  $('kj-text').className = cls || '';
  restartAnim($('kj-text'), 'in');
}
function startEpisode(i) {
  if (!KENJI[i]) return;
  quiet();
  KS = { i: i, part: 'scene', k: 0, run: Date.now(), right: 0 };
  $('kj-title').textContent = 'Il signor Kenji';
  $('kj-ep').textContent = tx('storyEp', { n: i + 1 }) + ' · ' + KENJI[i].title;
  showScreen('story');
  Awake.keep();
  // «Nella puntata precedente…»: l'ultima scena della puntata prima
  if (i > 0) {
    const prev = KENJI[i - 1].scenes, last = prev[prev.length - 2];
    kjDraw(kjScene(last[0]()), 'Nella puntata precedente… ' + last[1], 'prev');
    kjButtons('next');
    const run = KS.run;
    kjSay('Nella puntata precedente…', () => { if (KS && KS.run === run) setTimeout(() => { if (KS && KS.run === run && KS.k === 0 && KS.part === 'scene') kjScene0(); }, 1200); });
    return;
  }
  kjScene0();
}
function kjScene0() { KS.k = 0; kjShowScene(); }
function kjShowScene() {
  const E = KENJI[KS.i], sc = E.scenes[KS.k], run = KS.run;
  kjDraw(kjScene(sc[0]()), sc[1]);
  kjButtons('next');
  // la voce dice la frase; poi si va avanti da soli (o con «Avanti»)
  kjSay(sc[1], () => { if (KS && KS.run === run) KS.autoT = setTimeout(() => { if (KS && KS.run === run) kjNext(); }, 1600); });
}
function kjNext() {
  if (!KS) return;
  clearTimeout(KS.autoT);
  const E = KENJI[KS.i];
  if (KS.part === 'scene') {
    if (KS.k === 0 && $('kj-text').className === 'prev') { kjScene0(); return; }
    KS.k++;
    if (KS.k < E.scenes.length - 1) { kjShowScene(); return; }
    // la scena «Continua…» la teniamo per la fine: prima le domande
    KS.part = 'q'; KS.k = 0; kjAsk(); return;
  }
  if (KS.part === 'q') { KS.k++; if (KS.k < E.questions.length) { kjAsk(); return; } kjEnd(); return; }
}
function kjAsk() {
  const E = KENJI[KS.i], Q = E.questions[KS.k], run = KS.run;
  // mark = la freccia d'oro sulla cosa della domanda (quando nella scena ce ne sono due)
  kjDraw(kjScene(E.scenes[Q.show][0]() + (Q.mark ? '<path d="M' + (Q.mark[0] - 6) + ' ' + (Q.mark[1] - 10) + ' h12 l-6 9z" fill="#c9a45c" stroke="#1a1408" stroke-width=".6"/>' : '')), Q.q, 'q');
  $('kj-heard').textContent = '';
  kjButtons('talk');
  kjSay(Q.q, () => { if (KS && KS.run === run) kjListen(); });
}
function kjListen() {
  const run = KS.run;
  $('kj-status').textContent = tx('speakNow');
  $('kj-mic').classList.add('rec');
  Ears.listen(
    (alts) => { if (!KS || KS.run !== run) return; $('kj-mic').classList.remove('rec'); kjAnswer(alts || []); },
    (code) => { if (!KS || KS.run !== run) return; $('kj-mic').classList.remove('rec');
      $('kj-status').textContent = code === 'unsupported' ? tx('noSR') : tx('tapReady', { talk: uiWord('talk') }); }
  );
}
function kjAnswer(alts) {
  const E = KENJI[KS.i], Q = E.questions[KS.k], run = KS.run;
  const ok = alts.slice(0, 5).some(a => kjCheck(Q, a));
  $('kj-heard').textContent = alts[0] ? '«' + alts[0] + '»' : '';
  const st = $('kj-stage');
  if (ok) {
    KS.right++;
    st.classList.remove('bad'); restartAnim(st, 'good');
    $('kj-status').textContent = '✓';
    kjSay(Q.model, () => { if (KS && KS.run === run) setTimeout(kjNext, 500); });
  } else {
    st.classList.remove('good'); restartAnim(st, 'bad');
    $('kj-status').textContent = '';
    const t = kjTeacher();
    $('kj-heard').textContent = '→ ' + Q.model;
    Mouth.speak(t.wrong + ' ' + Q.model, t.rate, t.pitch, () => { if (KS && KS.run === run) setTimeout(kjNext, 900); });
  }
}
function kjEnd() {
  const E = KENJI[KS.i], last = E.scenes[E.scenes.length - 1];
  KS.part = 'end';
  const next = LESSONS.find((l, j) => j > LESSONS.indexOf(LESSONS.find(x => x.id === E.lesson)) && !l.test);
  kjDraw(kjScene(last[0]()), last[1], 'end');
  $('kj-status').textContent = next ? tx('storyNextIn', { n: lessonNumber(next) }) : '';
  $('kj-heard').textContent = '';
  kjButtons('end');
  kjSay(last[1]);
  DB.settings.kenji = DB.settings.kenji || {};
  DB.settings.kenji[E.lesson] = Math.max(DB.settings.kenji[E.lesson] || 0, 1);
  saveDB();
  $('kj-go').onclick = once(() => { stopEpisode(); if (next) startLesson(next.id); });
  $('kj-go').classList.toggle('hidden', !next);
}
function kjButtons(mode) {
  $('kj-next').classList.toggle('hidden', mode !== 'next');
  $('kj-mic').classList.toggle('hidden', mode !== 'talk');
  $('kj-go').classList.toggle('hidden', mode !== 'end');
  if (mode !== 'talk') $('kj-status').textContent = '';
}
function stopEpisode() {
  if (KS) clearTimeout(KS.autoT);
  KS = null;
  Ears.abort(); Mouth.cancel();
  Awake.allow();
}

/* ---------- La lista delle puntate (dal menu) ---------- */
function showStoryList() {
  const box = $('kj-list');
  box.innerHTML = KENJI.map((E, i) => {
    const open = kjOpen(i), l = LESSONS.find(x => x.id === E.lesson), seen = (DB.settings.kenji || {})[E.lesson];
    return '<button class="lesson-btn kj-item' + (open ? '' : ' locked') + '" data-i="' + i + '"' + (open ? '' : ' disabled') + '>' +
      '<span class="kj-num">' + (i + 1) + '</span><span class="kj-name">' + (open ? E.title : '🔒 ' + tx('storyLocked', { n: lessonNumber(l) })) + '</span>' +
      '<span class="score">' + (seen ? '✓' : (open ? '▶' : '')) + '</span></button>';
  }).join('');
  box.querySelectorAll('.kj-item:not(.locked)').forEach(b => { b.onclick = () => startEpisode(+b.dataset.i); });
  applyStaticText();
  showScreen('storylist');
}

(function () {
  if (typeof document === 'undefined' || !document.getElementById || !document.getElementById('screen-story')) return;
  $('kj-next').onclick = () => kjNext();
  $('kj-mic').onclick = () => { if (KS && KS.part === 'q') { if (Ears.isListening()) { Ears.abort(); $('kj-mic').classList.remove('rec'); } else kjListen(); } };
  $('kj-replay').onclick = () => {
    if (!KS) return;
    if (KS.part === 'scene') { clearTimeout(KS.autoT); kjSay(KENJI[KS.i].scenes[KS.k][1]); }
    else if (KS.part === 'q') { Ears.abort(); kjAsk(); }
  };
  $('kj-exit').onclick = () => { stopEpisode(); renderHome(); showScreen('home'); };
  $('btn-story-home').onclick = () => { renderHome(); showScreen('home'); };
})();
