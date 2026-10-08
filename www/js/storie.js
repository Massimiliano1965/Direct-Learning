'use strict';
/* =====================================================================
   LE STORIE A PUNTATE (Massi: «Impara la lingua e scopri il mistero.»). Le trame sono in docs/storie.md.
   Tre storie da scegliere (giallo, commedia, romantica), per adulti che studiano sul serio: niente farse.
   Una puntata alla fine di ogni lezione: si sblocca quando la lezione è fatta.
   - Le scene: un disegno grande e una frase, detta dall'insegnante (solo parole già imparate; gli indizi si vedono).
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
function kjBubble(x, y, w, text, tailX) {   // il fumetto: esce dalla bocca (la punta verso tailX)
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="16" rx="7" fill="#fff" stroke="#2a3346" stroke-width=".8"/>' +
    '<path d="M' + (tailX - 3) + ' ' + (y + 15.6) + ' L' + tailX + ' ' + (y + 23) + ' L' + (tailX + 4) + ' ' + (y + 15.6) + 'z" fill="#fff"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + 11.4) + '" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#2a3346">' + text + '</text>';
}
const kjQ = (x, y, s) => '<text x="' + x + '" y="' + y + '" font-family="Georgia,serif" font-size="' + (s || 26) + '" font-weight="bold" fill="#c9a45c">?</text>';
function kjScene(inner) { return '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>'; }

/* ---------- I disegni del giallo «La chiave di Venezia» ---------- */
// l'ufficio di Rossi: legno scuro, di notte (night) o di mattina, la libreria con i rotoli di seta
function gOffice(night) {
  return '<rect width="200" height="96" fill="' + (night ? '#2b2a33' : '#d9cdb8') + '"/>' +
    '<rect y="96" width="200" height="24" fill="' + (night ? '#3a2c22' : '#8a6a48') + '"/><path d="M0 96 H200" stroke="#2a1d16" stroke-width="2"/>' +
    '<rect x="6" y="20" width="34" height="76" fill="' + (night ? '#3a2c22' : '#6b4a2e') + '"/>' +
    [30, 48, 66].map(y => '<path d="M6 ' + y + ' h34" stroke="#2a1d16" stroke-width="1.5"/>' +
      [0, 1, 2, 3].map(i => '<rect x="' + (9 + i * 8) + '" y="' + (y - 9) + '" width="6" height="9" rx="2" fill="' + ['#c8323b', '#2f5d8a', '#c9a45c', '#5b4a8b'][(i + y) % 4] + '" opacity="' + (night ? .5 : .9) + '"/>').join('')).join('');
}
// la sedia per terra (rovesciata)
const gChairDown = (x, y) => '<g transform="translate(' + x + ' ' + y + ') rotate(-80 22 22)">' + kjPut('chair', 0, 0, 44) + '</g>';
// il libro aperto con una pagina strappata
const gBookTorn = (x, y) => '<g transform="translate(' + x + ' ' + y + ')"><path d="M0 4 q20 -6 40 0 v34 q-20 -6 -40 0z" fill="#f3eee2"/>' +
  '<path d="M40 4 q20 -6 40 0 l-3 6 l4 5 l-4 6 l3 6 l-4 5 l4 6 v0 q-20 -6 -40 0z" fill="#ece4d2"/><path d="M40 4 v34" stroke="#c9b994"/>' +
  '<path d="M6 12 h28 M6 17 h28 M6 22 h24 M6 27 h28" stroke="#a9a089" stroke-width="1"/><path d="M46 12 h22 M46 17 h18" stroke="#a9a089" stroke-width="1"/></g>';
// la penna da vicino, con il nome inciso
const gPenName = (x, y) => '<g transform="translate(' + x + ' ' + y + ') rotate(-12)"><rect x="0" y="0" width="120" height="14" rx="7" fill="#1d2638"/>' +
  '<rect x="96" y="0" width="24" height="14" rx="7" fill="#c9a45c"/><path d="M0 7 l-14 0 l14 -5z" fill="#c9a45c"/><rect x="58" y="-4" width="5" height="22" rx="2" fill="#c9a45c"/>' +
  '<text x="20" y="10.4" font-family="Georgia,serif" font-size="7.6" font-style="italic" fill="#e6c77e">C. Rossi</text></g>';
// la finestra (aperta: la pioggia, la tenda che vola; Milano e il Duomo dietro)
function gWindow(x, y, w, h, open, rain) {
  let s = '<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="' + (w + 6) + '" height="' + (h + 6) + '" fill="#4a3628"/>' +
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (rain ? '#7d8a9c' : '#9cc8e6') + '"/>' +
    // i tetti di Milano e il Duomo
    '<path d="M' + x + ' ' + (y + h * .78) + ' h' + w * .2 + ' v-' + h * .12 + ' h' + w * .14 + ' v' + h * .06 + ' h' + w * .1 + ' v-' + h * .2 + ' h' + w * .16 + ' v' + h * .1 + ' h' + w * .4 + ' V' + (y + h) + ' H' + x + 'z" fill="' + (rain ? '#4f5866' : '#7a8496') + '"/>' +
    '<path d="M' + (x + w * .5) + ' ' + (y + h * .62) + ' l2 -' + h * .2 + ' l2 ' + h * .2 + ' M' + (x + w * .44) + ' ' + (y + h * .64) + ' l1.5 -' + h * .12 + ' l1.5 ' + h * .12 + ' M' + (x + w * .58) + ' ' + (y + h * .64) + ' l1.5 -' + h * .12 + ' l1.5 ' + h * .12 + '" stroke="' + (rain ? '#c9ced8' : '#f3eee2') + '" stroke-width="1.6" fill="none"/>';
  if (rain) for (let i = 0; i < 14; i++) s += '<path d="M' + (x + 4 + (i * 13) % w) + ' ' + (y + 4 + (i * 7) % (h * .6)) + ' l-2 6" stroke="#dfe7f1" stroke-width=".8"/>';
  if (open) s += '<path d="M' + x + ' ' + y + ' l-' + w * .3 + ' 6 v' + (h - 6) + ' l' + w * .3 + ' 6z" fill="#cfd9e3" opacity=".55" stroke="#4a3628"/>' +
    '<path d="M' + (x + w) + ' ' + (y - 3) + ' q8 ' + h * .3 + ' 18 ' + h * .4 + ' q-6 ' + h * .3 + ' -14 ' + h * .6 + '" fill="#e9e2d2" opacity=".9"/>';
  else s += '<path d="M' + (x + w / 2) + ' ' + y + ' V' + (y + h) + '" stroke="#4a3628" stroke-width="2"/>';
  return s;
}
// la tazza con il segno del rossetto
const gLipstick = (x, y) => '<path d="M' + x + ' ' + y + ' q5 -4 10 0 q-5 4 -10 0z M' + (x + 9) + ' ' + (y - .4) + ' q5 -4 10 0 q-5 4 -10 0z" fill="#c8323b"/>';
// lo schermo del computer: «password» e la foto di Venezia
function gScreen(x, y) {
  return '<rect x="' + x + '" y="' + y + '" width="84" height="56" rx="3" fill="#1d2638"/><rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="76" height="44" fill="#9cc8e6"/>' +
    '<path d="M' + (x + 4) + ' ' + (y + 34) + ' h76 v14 h-76z" fill="#3f7fb5"/><path d="M' + (x + 14) + ' ' + (y + 36) + ' q20 6 46 0 l-3 4 q-20 4 -40 0z" fill="#1d1d24"/>' +
    '<path d="M' + (x + 56) + ' ' + (y + 34) + ' v-18 l8 -6 l8 6 v18z" fill="#e9dcc0"/>' +
    '<rect x="' + (x + 18) + '" y="' + (y + 14) + '" width="48" height="12" rx="2" fill="#f3eee2"/><text x="' + (x + 42) + '" y="' + (y + 23) + '" text-anchor="middle" font-size="8" fill="#2a3346">• • • •</text>' +
    '<rect x="' + (x + 36) + '" y="' + (y + 56) + '" width="12" height="8" fill="#1d2638"/><rect x="' + (x + 26) + '" y="' + (y + 63) + '" width="32" height="3" rx="1" fill="#1d2638"/>';
}
// il telefono che squilla: sullo schermo «VENEZIA»
function gPhoneCall(x, y) {
  return '<rect x="' + x + '" y="' + y + '" width="40" height="72" rx="6" fill="#1d1d24"/><rect x="' + (x + 3) + '" y="' + (y + 6) + '" width="34" height="58" rx="2" fill="#1f2b4d"/>' +
    '<text x="' + (x + 20) + '" y="' + (y + 26) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.6" font-weight="bold" fill="#f3eee2">VENEZIA</text>' +
    '<circle cx="' + (x + 11) + '" cy="' + (y + 52) + '" r="4.5" fill="#c8323b"/><circle cx="' + (x + 29) + '" cy="' + (y + 52) + '" r="4.5" fill="#3fae5a"/>' +
    '<path d="M' + (x - 5) + ' ' + (y + 20) + ' q-5 8 0 16 M' + (x - 10) + ' ' + (y + 16) + ' q-8 12 0 24 M' + (x + 45) + ' ' + (y + 20) + ' q5 8 0 16 M' + (x + 50) + ' ' + (y + 16) + ' q8 12 0 24" stroke="#c9a45c" stroke-width="2" fill="none"/>';
}
// la chiave con il cartellino «204»
const gKey204 = (x, y) => kjPut('key', x, y, 70) + '<path d="M' + (x + 16) + ' ' + (y + 40) + ' l-6 16" stroke="#8d93a3" stroke-width="1"/>' +
  '<rect x="' + (x - 6) + '" y="' + (y + 54) + '" width="30" height="16" rx="3" fill="#f3eee2" stroke="#c9a45c"/><text x="' + (x + 9) + '" y="' + (y + 66) + '" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="#2a3346">204</text>';
// il quaderno aperto pieno di numeri
function gNumbers(x, y) {
  const rows = ['12.03  —  48.000', '27.05  —  52.500', '04.09  —  61.000', '18.11  —  75.000'];
  return '<rect x="' + x + '" y="' + y + '" width="96" height="64" rx="2" fill="#f3eee2"/><path d="M' + (x + 48) + ' ' + y + ' v64" stroke="#c9b994"/>' +
    '<rect x="' + (x - 3) + '" y="' + (y - 2) + '" width="102" height="68" rx="3" fill="none" stroke="#8e2a2a" stroke-width="3"/>' +
    rows.map((r, i) => '<text x="' + (x + 6) + '" y="' + (y + 14 + i * 13) + '" font-family="Courier New,monospace" font-size="5.6" fill="#2a3346">' + r + '</text>').join('') +
    '<text x="' + (x + 54) + '" y="' + (y + 40) + '" font-family="Georgia,serif" font-size="14" font-weight="bold" fill="#c8323b">?</text>';
}
// l'ombrello bagnato (le gocce e la pozza) e la finestra con il sole
const gWetUmbrella = (x, y) => kjPut('umbrella', x, y, 56) + [0, 1, 2, 3].map(i => '<path d="M' + (x + 12 + i * 10) + ' ' + (y + 34 + (i % 2) * 6) + ' q-2 4 0 6 q2 -2 0 -6z" fill="#8cc4e3"/>').join('') +
  '<ellipse cx="' + (x + 28) + '" cy="' + (y + 58) + '" rx="22" ry="3" fill="#8cc4e3" opacity=".6"/>';
// la strada: il palazzo della Rossi Seta, il marciapiede, il taxi bianco «STAZIONE»
function gStreet() {
  return '<rect width="200" height="120" fill="#cfc4b0"/><rect y="0" width="200" height="70" fill="#d9cdb8"/>' +
    [10, 50, 150].map(x => '<rect x="' + x + '" y="8" width="26" height="34" fill="#7d8a9c"/><rect x="' + (x + 2) + '" y="10" width="22" height="30" fill="#9cc8e6"/>').join('') +
    '<rect x="88" y="44" width="40" height="52" fill="#4a3628"/><text x="108" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" font-weight="bold" fill="#2a3346">ROSSI SETA</text>' +
    '<rect y="96" width="200" height="24" fill="#8d93a3"/><path d="M0 96 H200" stroke="#6b7180" stroke-width="2"/>';
}
const gTaxi = (x) => '<g transform="translate(' + x + ' 76)"><path d="M0 22 v-10 q2 -6 10 -6 l8 -8 h22 l8 8 q10 0 12 6 v10z" fill="#f4f4f6" stroke="#8d93a3"/>' +
  '<rect x="20" y="-8" width="16" height="6" rx="1" fill="#2a3346"/><text x="28" y="-3.6" text-anchor="middle" font-size="4" fill="#f3d36b">TAXI</text>' +
  '<path d="M20 2 h8 v8 h-14z M32 2 h8 l6 8 h-14z" fill="#9cc8e6"/><circle cx="14" cy="22" r="5" fill="#2a2a30"/><circle cx="48" cy="22" r="5" fill="#2a2a30"/></g>';
const gSign = (x, y, t) => '<rect x="' + x + '" y="' + y + '" width="' + (t.length * 6 + 10) + '" height="13" rx="2" fill="#2f5d8a" stroke="#f3eee2"/><text x="' + (x + 5) + '" y="' + (y + 9.6) + '" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#f3eee2">' + t + '</text>';
// la donna dal cappotto rosso (di spalle: non si vede il viso)
const gRedCoat = (x, sc) => kjPerson('rossa', x, sc || 1, { face: 'flat' });

/* ---------- Le storie ----------
   episodes: { lesson, title, scenes: [[disegno, frase]], questions: [{ show, q, model, ok, no, mark }] } */
const STORIES = [
  { id: 'giallo', genre: 'giallo', icon: '🔎', title: 'La chiave di Venezia', who: 'Kenji Watanabe, Tokyo → Milano',
    plot: { it: 'La firma è domani alle nove. Ma Carlo Rossi è sparito.', en: 'The contract is signed tomorrow at nine. But Carlo Rossi has vanished.',
      de: 'Morgen um neun wird unterschrieben. Aber Carlo Rossi ist verschwunden.', ja: '契約は明日9時。だがカルロ・ロッシは消えた。' },
    episodes: [
    { lesson: 'l1', title: 'L\'ufficio vuoto', scenes: [
        [() => gOffice(true) + kjPut('table', 70, 46, 64) + gChairDown(130, 70), 'È un tavolo. È una sedia.'],
        [() => gOffice(true) + kjPut('table', 50, 40, 90) + kjPut('book', 66, 42, 34) + kjPut('pen', 104, 52, 24), 'È un libro. È una penna.'],
        [() => '<rect width="200" height="120" fill="#2b2a33"/>' + gBookTorn(60, 36) + kjQ(150, 66), 'È un libro…'],
        [() => '<rect width="200" height="120" fill="#2b2a33"/>' + gPenName(42, 60), 'È una penna. «C. Rossi».'],
        [() => gOffice(true) + gChairDown(80, 70) + kjQ(140, 56, 40), 'Continua…']
      ], questions: [
        { show: 0, q: 'È un tavolo o una sedia?', mark: [152, 66], model: 'È una sedia.', ok: ['sedia'], no: ['tavolo'] },
        { show: 1, q: 'È un libro?', mark: [83, 40], model: 'Sì, è un libro.', ok: ['libro'], no: ['non', 'no'] },
        { show: 1, q: 'Che cos\'è?', mark: [116, 50], model: 'È una penna.', ok: ['penna'], no: ['libro'] }
      ] },
    { lesson: 'l2', title: 'La finestra aperta', scenes: [
        [() => gOffice(false) + '<rect x="146" y="28" width="34" height="68" fill="#4a3628"/><rect x="148" y="30" width="30" height="66" fill="#f3e9cf"/>' +
          '<path d="M148 30 L136 34 L136 98 L148 96z" fill="#8e6741"/><path d="M137 62 l4 3 l-3 3" stroke="#2a1d16" stroke-width="1.4" fill="none"/>' + kjPerson('kenji', 163, 1), 'È una porta. È Kenji.'],
        [() => gOffice(false) + gWindow(78, 14, 70, 64, true, true) + gChairDown(40, 70), 'È una finestra.'],
        [() => '<rect width="200" height="120" fill="#7d8a9c"/><rect y="70" width="200" height="50" fill="#d9cdb8"/><path d="M0 70 h200" stroke="#4a3628" stroke-width="4"/>' +
          '<path d="M70 74 l18 6 l-14 3 l20 5" stroke="#5a4030" stroke-width="2" fill="none"/>' + kjQ(140, 104, 30), 'È una finestra…'],
        [() => '<rect width="200" height="120" fill="#7d8a9c"/>' + gWindow(10, 8, 180, 104, false, true), 'È Milano.'],
        [() => gOffice(false) + gWindow(78, 14, 70, 64, true, true) + kjPerson('kenji', 40, 1, { face: 'flat' }) + kjQ(160, 60, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'È una porta o una finestra?', model: 'È una finestra.', ok: ['finestra'], no: ['porta'] },
        { show: 0, q: 'È una porta?', mark: [142, 28], model: 'Sì, è una porta.', ok: ['porta'], no: ['non', 'no'] }
      ] },
    { lesson: 'l3', title: 'Due tazze', scenes: [
        [() => gOffice(false) + kjPut('table', 50, 40, 90) + kjPut('cup', 70, 54, 22) + kjPut('cup', 104, 54, 22), 'È una tazza. È una tazza.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('cup', 50, 14, 90) + gLipstick(70, 42) + kjQ(150, 60), 'È una tazza…'],
        [() => gOffice(false) + kjPut('table', 50, 40, 90) + kjPut('bottle', 84, 30, 40), 'È una bottiglia.'],
        [() => '<rect width="200" height="120" fill="#2b2a33"/>' + gScreen(58, 20), 'È un computer.'],
        [() => gOffice(false) + kjPut('table', 70, 40, 90) + kjPut('cup', 90, 54, 22) + kjPut('cup', 124, 54, 22) + kjPerson('kenji', 40, 1, { arms: [[-4, 6], [40, 110]], face: 'flat' }) + kjQ(150, 34, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'È una tazza?', mark: [81, 52], model: 'Sì, è una tazza.', ok: ['tazza'], no: ['non', 'no'] },
        { show: 3, q: 'Che cos\'è?', model: 'È un computer.', ok: ['computer'], no: ['tazza'] },
        { show: 2, q: 'È una bottiglia o una tazza?', model: 'È una bottiglia.', ok: ['bottiglia'], no: ['tazza'] }
      ] },
    { lesson: 'l4', title: 'La chiave 204', scenes: [
        [() => gOffice(false) + kjPut('table', 50, 44, 90) + gPhoneCall(80, 6), 'È un telefono.'],
        [() => gOffice(false) + kjPut('bag', 60, 34, 70) + kjPerson('kenji', 150, 1, { arms: [[-4, 6], [-60, 30]] }), 'È una borsa.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gKey204(64, 20), 'È una chiave.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gNumbers(52, 26), 'È un quaderno.'],
        [() => gOffice(false) + gWindow(110, 14, 60, 56, false, false) + '<circle cx="160" cy="24" r="6" fill="#f3d36b"/>' + gWetUmbrella(30, 46), 'È un ombrello…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gKey204(30, 20) + gNumbers(100, 30) + kjQ(170, 30, 26), 'Continua…']
      ], questions: [
        { show: 2, q: 'Che cos\'è?', model: 'È una chiave.', ok: ['chiave'], no: ['telefono'] },
        { show: 0, q: 'È un telefono o un quaderno?', model: 'È un telefono.', ok: ['telefono'], no: ['quaderno'] },
        { show: 4, q: 'È un ombrello?', mark: [58, 44], model: 'Sì, è un ombrello.', ok: ['ombrello'], no: ['non', 'no'] }
      ] },
    { lesson: 'l5', title: 'Il cappotto rosso', scenes: [
        [() => gStreet() + gRedCoat(60) + kjPut('suitcase_nero', 70, 72, 30), 'Il cappotto è rosso. La valigia è nera.'],
        [() => gStreet() + gRedCoat(60) + kjPut('suitcase_nero', 70, 72, 30) + kjPut('laptop_bianco', 32, 64, 26), 'Il portatile è bianco.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gWindow(20, 12, 90, 70, false, false) + kjPerson('kenji', 150, 1, { arms: [[-4, 6], [150, 40]], face: 'o' }) + kjPut('phone_nero', 160, 22, 24), 'Il telefono è nero…'],
        [() => gStreet() + gTaxi(124) + gRedCoat(62) + gSign(132, 54, 'STAZIONE'), 'Chi è?'],
        [() => gStreet() + gTaxi(30) + gSign(40, 54, 'STAZIONE') + kjQ(150, 70, 36), 'Continua…']
      ], questions: [
        { show: 0, q: 'Il cappotto è rosso o bianco?', model: 'Il cappotto è rosso.', ok: ['rosso'], no: ['bianco'] },
        { show: 0, q: 'La valigia è nera?', mark: [85, 70], model: 'Sì, la valigia è nera.', ok: ['nera'], no: ['non', 'bianca'] },
        { show: 1, q: 'Di che colore è il portatile?', mark: [45, 62], model: 'Il portatile è bianco.', ok: ['bianco'], no: ['nero', 'rosso'] }
      ] }
  ] },
  { id: 'commedia', genre: 'commedia', icon: '☕', title: 'Il signor Weber a Napoli', who: 'Hans Weber, München → Napoli', soon: true,
    plot: { it: 'Sei mesi per aprire un ufficio a Napoli. Ha un piano perfetto. Napoli no.', en: 'Six months to open an office in Naples. He has a perfect plan. Naples does not.',
      de: 'Sechs Monate, um in Neapel ein Büro zu eröffnen. Er hat einen perfekten Plan. Neapel nicht.', ja: 'ナポリに6か月で事務所を開く。完璧な計画。でもナポリは違う。' }, episodes: [] },
  { id: 'romantica', genre: 'romantica', icon: '✉', title: 'Lettere da Firenze', who: 'Sarah Miller, New York → Firenze', soon: true,
    plot: { it: 'In un muro del Quattrocento, lettere d\'amore del 1956. Poi più niente.', en: 'Inside a 15th-century wall, love letters from 1956. Then nothing.',
      de: 'In einer Mauer aus dem 15. Jahrhundert: Liebesbriefe von 1956. Dann nichts mehr.', ja: '15世紀の壁の中に1956年の恋文。そして途絶えた。' }, episodes: [] }
];
// la storia scelta (DB.settings.story) e le sue puntate
function kjStory() { return STORIES.find(s => s.id === (DB.settings.story || 'giallo') && s.episodes.length) || STORIES[0]; }
const kjEps = () => kjStory().episodes;

/* ---------- Le regole ---------- */
// la storia è in italiano: solo nel corso di italiano (le app di inglese, russo… non la vedono)
const KJ_ON = typeof COURSE !== 'undefined' && /^it/i.test(COURSE.lang || '');
const kjOpen = (i) => !!kjEps()[i] && DB.lessons[kjEps()[i].lesson] != null;   // la lezione è fatta
const kjIndexOf = (lessonId) => KJ_ON ? kjEps().findIndex(e => e.lesson === lessonId) : -1;
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
  if (!kjEps()[i]) return;
  quiet();
  KS = { i: i, part: 'scene', k: 0, run: Date.now(), right: 0 };
  $('kj-title').textContent = kjStory().title;
  $('kj-ep').textContent = tx('storyEp', { n: i + 1 }) + ' · ' + kjEps()[i].title;
  showScreen('story');
  Awake.keep();
  // «Nella puntata precedente…»: l'ultima scena della puntata prima
  if (i > 0) {
    const prev = kjEps()[i - 1].scenes, last = prev[prev.length - 2];
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
  const E = kjEps()[KS.i], sc = E.scenes[KS.k], run = KS.run;
  kjDraw(kjScene(sc[0]()), sc[1]);
  kjButtons('next');
  // la voce dice la frase; poi si va avanti da soli (o con «Avanti»)
  kjSay(sc[1], () => { if (KS && KS.run === run) KS.autoT = setTimeout(() => { if (KS && KS.run === run) kjNext(); }, 1600); });
}
function kjNext() {
  if (!KS) return;
  clearTimeout(KS.autoT);
  const E = kjEps()[KS.i];
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
  const E = kjEps()[KS.i], Q = E.questions[KS.k], run = KS.run;
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
  const E = kjEps()[KS.i], Q = E.questions[KS.k], run = KS.run;
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
  const E = kjEps()[KS.i], last = E.scenes[E.scenes.length - 1];
  KS.part = 'end';
  const next = LESSONS.find((l, j) => j > LESSONS.indexOf(LESSONS.find(x => x.id === E.lesson)) && !l.test);
  kjDraw(kjScene(last[0]()), last[1], 'end');
  $('kj-status').textContent = next ? tx('storyNextIn', { n: lessonNumber(next) }) : '';
  $('kj-heard').textContent = '';
  kjButtons('end');
  kjSay(last[1]);
  const seen = DB.settings.storySeen = DB.settings.storySeen || {}, sid = kjStory().id;
  seen[sid] = seen[sid] || {}; seen[sid][E.lesson] = 1;
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

/* ---------- Le storie e le puntate (dal menu): si sceglie la storia, poi la puntata ---------- */
function showStoryList() {
  const cur = kjStory();
  $('kj-choose').innerHTML = STORIES.map(S => '<button class="kj-card' + (S.id === cur.id ? ' on' : '') + (S.soon ? ' soon' : '') + '" data-id="' + S.id + '"' + (S.soon ? ' disabled' : '') + '>' +
    '<span class="kj-genre">' + S.icon + ' ' + tx('genre_' + S.genre) + (S.soon ? ' · ' + tx('storySoon') : '') + '</span>' +
    '<span class="kj-ctitle">' + S.title + '</span><span class="kj-who">' + S.who + '</span>' +
    '<span class="kj-plot">' + (S.plot[UI_LANG] || S.plot.en) + '</span></button>').join('');
  $('kj-choose').querySelectorAll('.kj-card:not(.soon)').forEach(b => { b.onclick = () => { DB.settings.story = b.dataset.id; saveDB(); showStoryList(); }; });
  const box = $('kj-list');
  box.innerHTML = cur.episodes.map((E, i) => {
    const open = kjOpen(i), l = LESSONS.find(x => x.id === E.lesson), seen = ((DB.settings.storySeen || {})[cur.id] || {})[E.lesson];
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
    if (KS.part === 'scene') { clearTimeout(KS.autoT); kjSay(kjEps()[KS.i].scenes[KS.k][1]); }
    else if (KS.part === 'q') { Ears.abort(); kjAsk(); }
  };
  $('kj-exit').onclick = () => { stopEpisode(); renderHome(); showScreen('home'); };
  $('btn-story-home').onclick = () => { renderHome(); showScreen('home'); };
})();
