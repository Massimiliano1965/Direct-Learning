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
function gPhoneCall(x, y, k) {
  if (k) return gScale(gPhoneCall(0, 0), x, y, k);
  return '<rect x="' + x + '" y="' + y + '" width="40" height="72" rx="6" fill="#1d1d24"/><rect x="' + (x + 3) + '" y="' + (y + 6) + '" width="34" height="58" rx="2" fill="#1f2b4d"/>' +
    '<text x="' + (x + 20) + '" y="' + (y + 26) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.6" font-weight="bold" fill="#f3eee2">VENEZIA</text>' +
    '<circle cx="' + (x + 11) + '" cy="' + (y + 52) + '" r="4.5" fill="#c8323b"/><circle cx="' + (x + 29) + '" cy="' + (y + 52) + '" r="4.5" fill="#3fae5a"/>' +
    '<path d="M' + (x - 5) + ' ' + (y + 20) + ' q-5 8 0 16 M' + (x - 10) + ' ' + (y + 16) + ' q-8 12 0 24 M' + (x + 45) + ' ' + (y + 20) + ' q5 8 0 16 M' + (x + 50) + ' ' + (y + 16) + ' q8 12 0 24" stroke="#c9a45c" stroke-width="2" fill="none"/>';
}
// la chiave con il cartellino «204»
const gKey204 = (x, y, k) => k ? gScale(gKey204(0, 0), x, y, k) : kjPut('key', x, y, 70) + '<path d="M' + (x + 16) + ' ' + (y + 40) + ' l-6 16" stroke="#8d93a3" stroke-width="1"/>' +
  '<rect x="' + (x - 6) + '" y="' + (y + 54) + '" width="30" height="16" rx="3" fill="#f3eee2" stroke="#c9a45c"/><text x="' + (x + 9) + '" y="' + (y + 66) + '" text-anchor="middle" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="#2a3346">204</text>';
// il quaderno aperto pieno di numeri
function gNumbers(x, y, k) {
  if (k) return gScale(gNumbers(0, 0), x, y, k);
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


const gScale = (svg, x, y, k) => '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' + svg + '</g>';
// la scrivania con il cassetto (aperto: si vede la foto dentro)
function gDesk(x, open) {
  return '<rect x="' + x + '" y="52" width="100" height="8" rx="2" fill="#8e6741"/><rect x="' + (x + 4) + '" y="60" width="92" height="40" fill="#6b4a2e"/>' +
    (open ? '<rect x="' + (x + 30) + '" y="64" width="40" height="18" fill="#3a2c22"/><rect x="' + (x + 26) + '" y="80" width="48" height="14" fill="#8e6741"/>' +
      '<rect x="' + (x + 38) + '" y="66" width="22" height="14" fill="#f3eee2" transform="rotate(-6 ' + (x + 49) + ' 73)"/>'
      : '<rect x="' + (x + 30) + '" y="66" width="40" height="16" rx="1" fill="#7a5735"/><circle cx="' + (x + 50) + '" cy="74" r="2" fill="#c9a45c"/>');
}
// il lucchetto a numeri del cassetto
const gLock = (x, y, d) => '<rect x="' + x + '" y="' + y + '" width="54" height="26" rx="4" fill="#8d93a3"/>' +
  d.map((c, i) => '<rect x="' + (x + 5 + i * 16) + '" y="' + (y + 5) + '" width="12" height="16" rx="2" fill="#f3eee2"/><text x="' + (x + 11 + i * 16) + '" y="' + (y + 17) + '" text-anchor="middle" font-family="Arial" font-size="11" font-weight="bold" fill="#2a3346">' + c + '</text>').join('');
// la foto dei dieci della Rossi Seta (scratched: l'otto è graffiato via)
function gPhoto(x, y, scratched, k) {
  if (k) return gScale(gPhoto(0, 0, scratched), x, y, k);
  let s = '<rect x="' + x + '" y="' + y + '" width="108" height="78" fill="#f3eee2"/><rect x="' + (x + 5) + '" y="' + (y + 5) + '" width="98" height="58" fill="#c9b994"/>';
  for (let i = 0; i < 10; i++) {
    const cx = x + 14 + (i % 5) * 20, cy = y + 18 + Math.floor(i / 5) * 24;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#e2ae86"/><path d="M' + (cx - 8) + ' ' + (cy + 16) + ' q8 -12 16 0z" fill="' + ['#2f4a7a', '#5b4a8b', '#4a4f5a', '#2f7d7a', '#7a6248'][i % 5] + '"/>' +
      '<text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" font-family="Arial" font-size="5" font-weight="bold" fill="#2a3346">' + (i + 1) + '</text>';
    if (scratched && i === 7) s += '<path d="M' + (cx - 8) + ' ' + (cy - 6) + ' l16 14 M' + (cx + 8) + ' ' + (cy - 6) + ' l-16 14 M' + (cx - 9) + ' ' + (cy + 1) + ' h18" stroke="#2a2433" stroke-width="2.2"/>';
  }
  return s + '<text x="' + (x + 54) + '" y="' + (y + 73) + '" text-anchor="middle" font-family="Georgia,serif" font-size="6" font-style="italic" fill="#2a3346">Rossi Seta</text>';
}
// una cartolina: la figura della lezione e il nome della città (k = più grande)
function gCard(key, x, y, label, k) {
  k = k || 1;
  const w = 50 * k, h = 62 * k;
  return '<g transform="rotate(' + (((x * 7) % 9) - 4) + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#f3eee2" stroke="#c9b994"/>' +
    kjPut(key, x + 3 * k, y + 3 * k, 44 * k) + '<text x="' + (x + w / 2) + '" y="' + (y + h - 5 * k) + '" text-anchor="middle" font-family="Georgia,serif" font-size="' + (6.4 * k) + '" font-weight="bold" fill="#2a3346">' + label + '</text></g>';
}
// la cartolina di Venezia: il ponte di Rialto sul Canal Grande
function gVenice(x, y, k) {
  k = k || 1;
  return gScale('<rect width="80" height="70" fill="#f3eee2" stroke="#c9b994"/><rect x="4" y="4" width="72" height="52" fill="#9cc8e6"/><rect x="4" y="38" width="72" height="18" fill="#3f7fb5"/>' +
    '<path d="M10 38 q30 -22 60 0 v4 h-60z" fill="#e9dcc0"/><path d="M28 30 h24 v-8 h-24z" fill="#e9dcc0"/><path d="M30 22 l10 -6 l10 6z" fill="#c9b994"/>' +
    '<path d="M18 48 q10 4 22 0" stroke="#1d1d24" stroke-width="2" fill="none"/>' +
    '<text x="40" y="65" text-anchor="middle" font-family="Georgia,serif" font-size="7" font-weight="bold" fill="#2a3346">VENEZIA</text>', x, y, k);
}
// la valigia aperta (dentro: una chiave piccola che luccica)
const gSuitOpen = (x, y, c) => '<rect x="' + x + '" y="' + y + '" width="70" height="40" rx="4" fill="' + (c || '#2a2a30') + '"/><path d="M' + x + ' ' + y + ' l8 -22 h54 l8 22z" fill="' + (c || '#3a3a44') + '" opacity=".85"/>' +
  '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="58" height="28" rx="2" fill="#e9e2d2"/><circle cx="' + (x + 40) + '" cy="' + (y + 20) + '" r="3" fill="#c9a45c"/><path d="M' + (x + 42) + ' ' + (y + 20) + ' h8 v3" stroke="#c9a45c" stroke-width="1.6" fill="none"/>';
// la cassaforte dietro il quadro: una serratura piccola
const gSafe = (x, y) => '<rect x="' + x + '" y="' + y + '" width="70" height="80" rx="4" fill="#5d6577"/><rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="58" height="68" rx="3" fill="#8d93a3"/>' +
  '<circle cx="' + (x + 35) + '" cy="' + (y + 32) + '" r="10" fill="#5d6577"/><rect x="' + (x + 33) + '" y="' + (y + 48) + '" width="4" height="10" rx="1" fill="#1d1d24"/>';
// il cartellino della valigia o dell'ombrello, con un testo
const gLabel = (x, y, t, k) => gScale('<path d="M0 0 h' + (t.length * 5.4 + 16) + ' v18 h-' + (t.length * 5.4 + 16) + 'z" fill="#f3eee2" stroke="#c9a45c"/><circle cx="7" cy="9" r="2.4" fill="#8d93a3"/>' +
  '<text x="14" y="13" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#2a3346">' + t + '</text>', x, y, k || 1);
// l'agenda aperta, con le righe scritte
const gAgendaOpen = (x, y, rows) => '<rect x="' + x + '" y="' + y + '" width="120" height="78" rx="3" fill="#2e2f37"/><rect x="' + (x + 4) + '" y="' + (y + 4) + '" width="112" height="70" fill="#f3eee2"/>' +
  '<path d="M' + (x + 60) + ' ' + (y + 4) + ' v70" stroke="#c9b994"/>' + rows.map((r, i) => '<text x="' + (x + 66) + '" y="' + (y + 22 + i * 16) + '" font-family="Georgia,serif" font-size="8.4" font-style="italic" fill="#2a3346">' + r + '</text>').join('') +
  [0, 1, 2, 3].map(i => '<path d="M' + (x + 10) + ' ' + (y + 16 + i * 14) + ' h44" stroke="#c9b994"/>').join('');
// il cappotto appeso all'attaccapanni
const gHanger = (x, y) => '<path d="M' + (x + 20) + ' ' + y + ' v76" stroke="#6b4a2e" stroke-width="3"/><path d="M' + (x + 8) + ' ' + (y + 76) + ' h24" stroke="#6b4a2e" stroke-width="3"/>' +
  '<path d="M' + (x + 8) + ' ' + (y + 10) + ' q12 -6 24 0 l4 48 h-32z" fill="#4a4f5a"/><path d="M' + (x + 20) + ' ' + (y + 6) + ' v52" stroke="#3a3d47" stroke-width="1"/>';
// il biglietto del treno Milano — Venezia
const gTicket = (x, y, k) => gScale('<rect width="64" height="30" rx="3" fill="#f3eee2" stroke="#c8323b" stroke-width="1.4"/><rect width="64" height="8" rx="3" fill="#c8323b"/>' +
  '<text x="32" y="6.4" text-anchor="middle" font-family="Arial" font-size="5.4" font-weight="bold" fill="#fff">TRENITALIA</text>' +
  '<text x="32" y="17" text-anchor="middle" font-family="Arial" font-size="6.4" font-weight="bold" fill="#2a3346">MILANO → VENEZIA</text>' +
  '<text x="32" y="26" text-anchor="middle" font-family="Arial" font-size="5.6" fill="#2a3346">07:35</text>', x, y, k || 1);
// la stazione: il tabellone delle partenze
function gStation() {
  return '<rect width="200" height="120" fill="#cfc4b0"/><path d="M0 0 L100 -10 L200 0 V40 H0z" fill="#8d93a3"/>' +
    '<rect x="40" y="12" width="120" height="34" rx="2" fill="#1d1d24"/><text x="46" y="24" font-family="Courier New,monospace" font-size="7" fill="#f3d36b">07:35  VENEZIA S.L.  2</text>' +
    '<text x="46" y="36" font-family="Courier New,monospace" font-size="7" fill="#f3d36b">07:50  ROMA       5</text>' +
    '<rect y="96" width="200" height="24" fill="#8d93a3"/><path d="M0 104 H200 M0 112 H200" stroke="#5d6577" stroke-width="2"/>';
}

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
      ] },
    /* ---------- Livello 1, seconda parte: le puntate 6–25 (Milano: il codice, le cartoline, la polizia, la valigia rossa, il taxi delle tre) ---------- */
    { lesson: 'l6', title: 'Il cassetto', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gNumbers(52, 26), 'È un quaderno.'],
        [() => gOffice(false) + gDesk(40, false) + gLock(118, 64, ['1', '5', '3']), 'Uno… cinque… tre.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('n4', 20, 22, 56) + kjPut('n2', 72, 22, 56) + kjPut('n6', 124, 22, 56), 'È il numero quattro. È il numero due. È il numero sei.'],
        [() => gOffice(false) + gDesk(40, true) + kjPerson('kenji', 150, 1, { arms: [[-4, 6], [-70, 30]], face: 'o' }), 'Il cassetto…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gPhoto(46, 18, false) + kjQ(160, 60, 30), 'Continua…']
      ], questions: [
        { show: 2, q: 'Che numero è?', mark: [152, 22], model: 'È il numero sei.', ok: ['sei'], no: ['due', 'quattro'] },
        { show: 2, q: 'È il numero due?', mark: [100, 22], model: 'Sì, è il numero due.', ok: ['due'], no: ['non', 'no'] }
      ] },
    { lesson: 'l7', title: 'La foto', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gPhoto(46, 18, false), 'Uno, due, tre… dieci.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gPhoto(46, 18, true), 'È il numero otto…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('n7', 30, 22, 60) + kjPut('n8', 110, 22, 60) + '<path d="M118 30 l44 44 M162 30 l-44 44" stroke="#c8323b" stroke-width="4"/>', 'Il sette, sì. L\'otto… no.'],
        [() => gOffice(false) + '<rect x="146" y="28" width="34" height="68" fill="#4a3628"/><rect x="148" y="30" width="30" height="66" fill="#f3e9cf"/>' + kjPerson('anna', 163, .96, { face: 'o' }) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [95, 10]] }), 'Chi è?'],
        [() => gOffice(false) + kjPerson('anna', 140, .96, { face: 'flat' }) + gPhoto(30, 26, true, .55) + kjQ(176, 40, 26), 'Continua…']
      ], questions: [
        { show: 2, q: 'È il sette o l\'otto?', mark: [60, 20], model: 'È il sette.', ok: ['sette'], no: ['otto'] },
        { show: 1, q: 'Che numero è?', model: 'È il numero otto.', ok: ['otto'], no: ['sette', 'nove'] }
      ] },
    { lesson: 'l8', title: 'Le cartoline', scenes: [
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gCard('g_roma', 14, 18, 'ROMA') + gCard('g_parigi', 76, 14, 'PARIGI') + gCard('g_londra', 138, 20, 'LONDRA'), 'Roma è una città. Parigi è una città.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gCard('g_italia', 30, 18, 'ITALIA', 1.2) + gCard('g_francia', 112, 18, 'FRANCIA', 1.2), 'L\'Italia è un paese. La Francia è un paese.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gCard('g_newyork', 40, 16, 'NEW YORK', 1.2) + gCard('g_cina', 116, 22, 'CINA', 1.1), 'New York è una città. La Cina è un paese.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gVenice(56, 12) + kjQ(156, 64, 30), 'E questa?'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [150, 40]], face: 'o' }) + gVenice(120, 30, .55), 'Continua…']
      ], questions: [
        { show: 0, q: 'Parigi è una città o un paese?', mark: [100, 14], model: 'Parigi è una città.', ok: ['citta'], no: ['paese'] },
        { show: 1, q: 'L\'Italia è un paese?', mark: [56, 18], model: 'Sì, l\'Italia è un paese.', ok: ['paese'], no: ['non', 'citta'] }
      ] },
    { lesson: 'l9', title: 'Il ponte', scenes: [
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gCard('g_colosseo', 20, 18, 'ROMA', 1.2) + gCard('g_eiffel', 108, 18, 'PARIGI', 1.2), 'Il Colosseo è a Roma. La Torre Eiffel è a Parigi.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gCard('g_bigben', 20, 18, 'LONDRA', 1.2) + gCard('g_liberta', 108, 18, 'NEW YORK', 1.2), 'Il Big Ben è a Londra. La Statua della Libertà è a New York.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gVenice(40, 8, 1.25) + '<circle cx="100" cy="62" r="20" fill="none" stroke="#c8323b" stroke-width="3"/>', 'Il ponte è a Venezia.'],
        [() => '<rect width="200" height="120" fill="#c9b994"/>' + gVenice(20, 20, .9) + gKey204(130, 22), 'Venezia… e la chiave 204.'],
        [() => gOffice(false) + kjPerson('kenji', 100, 1, { face: 'flat' }) + kjQ(136, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'Dov\'è il Colosseo?', mark: [48, 16], model: 'Il Colosseo è a Roma.', ok: ['roma'], no: ['parigi'] },
        { show: 1, q: 'Dov\'è il Big Ben?', mark: [48, 16], model: 'Il Big Ben è a Londra.', ok: ['londra'], no: ['new', 'york'] },
        { show: 2, q: 'Il ponte è a Venezia?', model: 'Sì, il ponte è a Venezia.', ok: ['venezia'], no: ['non', 'no'] }
      ] },
    { lesson: 'l10', title: 'La mia borsa', scenes: [
        [() => gOffice(false) + kjPerson('anna', 60, .96, { arms: [[-4, 6], [60, 30]] }) + kjPut('bag', 84, 66, 30) + kjBubble(70, 18, 70, 'La mia borsa.', 76), 'È la mia borsa.'],
        [() => gOffice(false) + kjPut('suitcase_nero', 130, 52, 46) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [95, 10]] }) + kjBubble(70, 14, 70, 'È la Sua valigia?', 66), 'È la Sua valigia?'],
        [() => gOffice(false) + kjPerson('anna', 100, .96, { face: 'flat', arms: [[-40, 20], [40, 20]] }) + kjBubble(108, 18, 34, 'No!', 112), 'No!'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('suitcase_nero', 50, 14, 92) + kjQ(150, 56, 30), 'La valigia è nera…'],
        [() => gOffice(false) + kjPut('suitcase_nero', 130, 52, 46) + kjQ(150, 40, 30) + kjPerson('kenji', 60, 1, { face: 'o' }), 'Continua…']
      ], questions: [
        { show: 0, q: 'È una borsa o una valigia?', mark: [99, 64], model: 'È una borsa.', ok: ['borsa'], no: ['valigia'] },
        { show: 3, q: 'La valigia è nera?', model: 'Sì, la valigia è nera.', ok: ['nera'], no: ['non', 'bianca', 'rossa'] }
      ] },
    { lesson: 'l11', title: 'La chiave piccola', scenes: [
        [() => gOffice(false) + gSuitOpen(60, 54) + kjPerson('kenji', 160, 1, { arms: [[-4, 6], [-60, 30]] }), 'La valigia nera…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('key', 80, 50, 34) + '<circle cx="97" cy="67" r="26" fill="none" stroke="#c9a45c" stroke-width="2" stroke-dasharray="4 3"/>', 'Una chiave. È piccola.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gKey204(20, 16) + kjPut('key', 140, 56, 30), 'Questa chiave è grande. Questa chiave è piccola.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gSafe(60, 18) + kjPut('key', 140, 62, 28) + kjQ(150, 50, 26), 'Grande… piccola…'],
        [() => gOffice(false) + kjPerson('kenji', 90, 1, { arms: [[-4, 6], [120, 60]], face: 'o' }) + kjPut('key', 106, 30, 18) + kjQ(140, 46, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'La chiave è grande o piccola?', model: 'La chiave è piccola.', ok: ['piccola'], no: ['grande'] },
        { show: 2, q: 'Questa chiave è grande?', mark: [44, 18], model: 'Sì, questa chiave è grande.', ok: ['grande'], no: ['non', 'piccola'] }
      ] },
    { lesson: 'l12', title: 'Il suo telefono', scenes: [
        [() => gOffice(false) + kjPerson('anna', 70, .96) + kjPut('table', 110, 52, 56) + gPhoneCall(126, 22, .55), 'È il suo telefono.'],
        [() => '<rect width="200" height="120" fill="#2b2a33"/>' + gPhoneCall(80, 20), 'VENEZIA.'],
        [() => gOffice(false) + kjPerson('anna', 110, .96, { face: 'o', arms: [[-4, 6], [150, 110]] }) + kjPut('phone_nero', 108, 30, 16) + kjPerson('kenji', 40, 1, { face: 'o' }), 'Anna? …'],
        [() => gOffice(false) + kjPerson('anna', 110, .96, { face: 'flat', arms: [[-4, 6], [10, 10]] }) + kjBubble(118, 20, 46, 'Sbagliato.', 118) + kjPerson('kenji', 40, 1), '«Sbagliato.»'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { face: 'flat' }) + kjQ(100, 40, 30) + gPhoneCall(130, 40, .4), 'Continua…']
      ], questions: [
        { show: 0, q: 'È il suo telefono?', mark: [137, 20], model: 'Sì, è il suo telefono.', ok: ['telefono'], no: ['non', 'no'] },
        { show: 1, q: 'È un telefono o un computer?', model: 'È un telefono.', ok: ['telefono'], no: ['computer'] }
      ] },
    { lesson: 'l13', title: 'Il commissario', scenes: [
        [() => gStreet() + '<rect x="20" y="78" width="60" height="20" rx="4" fill="#f4f4f6"/><rect x="22" y="84" width="56" height="5" fill="#2f5d8a"/><text x="50" y="96" text-anchor="middle" font-size="5.6" font-weight="bold" fill="#2f5d8a">POLIZIA</text>' + kjPerson('commissario', 130, 1), 'È un signore. È italiano.'],
        [() => gOffice(false) + kjPerson('commissario', 60, 1, { arms: [[-4, 6], [95, 10]] }) + kjPerson('kenji', 140, 1), 'È un signore. È giapponese.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('n_m_italia', 26, 14, 70) + kjPut('n_m_giappone', 104, 14, 70), 'Italiano. Giapponese.'],
        [() => gOffice(false) + kjPerson('commissario', 60, 1, { face: 'flat', arms: [[-40, 20], [40, 20]] }) + kjPerson('kenji', 140, 1, { face: 'o' }), '…'],
        [() => gOffice(false) + kjPerson('commissario', 100, 1, { face: 'flat' }) + kjQ(140, 40, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'Kenji è giapponese o cinese?', model: 'Kenji è giapponese.', ok: ['giapponese'], no: ['cinese'] },
        { show: 0, q: 'Il signore è italiano?', model: 'Sì, il signore è italiano.', ok: ['italiano'], no: ['non', 'no'] }
      ] },
    { lesson: 'l13b', title: 'Il portiere', scenes: [
        [() => gStreet() + kjPerson('signore', 70, .96, { r: 5 }), 'È un signore. È anziano.'],
        [() => gStreet() + kjPerson('signore', 50, .96, { r: 5, arms: [[-4, 6], [95, 10]] }) + kjPerson('commissario', 140, 1), 'Il signore è anziano. Il commissario non è giovane.'],
        [() => gStreet() + gRedCoat(110, .9) + '<circle cx="110" cy="56" r="40" fill="none" stroke="#c9a45c" stroke-width="2" stroke-dasharray="4 3"/>', 'È una ragazza. È giovane.'],
        [() => gStreet() + kjPerson('signore', 60, .96, { r: 5, face: 'o' }) + kjBubble(70, 14, 64, 'Il cappotto è rosso!', 66), '«Il cappotto è rosso!»'],
        [() => gStreet() + kjPerson('kenji', 100, 1, { face: 'flat' }) + kjQ(136, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'Il signore è giovane o anziano?', model: 'Il signore è anziano.', ok: ['anziano'], no: ['giovane'] },
        { show: 2, q: 'La ragazza è giovane?', model: 'Sì, la ragazza è giovane.', ok: ['giovane'], no: ['non', 'anziana'] }
      ] },
    { lesson: 'l13c', title: 'Di dov\'è?', scenes: [
        [() => gStreet() + kjPerson('signore', 50, .96, { r: 5 }) + kjBubble(60, 14, 64, 'Di dov\'è? Boh.', 56) + kjPerson('kenji', 150, 1), 'Di dov\'è la ragazza?'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('suitcase_nero', 40, 14, 90) + gLabel(118, 40, 'PARIGI'), 'PARIGI.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gCard('g_eiffel', 70, 18, 'PARIGI', 1.2), 'La ragazza è di Parigi?'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { face: 'o' }) + kjPerson('commissario', 140, 1), 'Kenji è di Osaka. Il commissario è di Milano.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gLabel(70, 46, 'PARIGI') + kjQ(146, 64, 30), 'Continua…']
      ], questions: [
        { show: 2, q: 'Di dov\'è la ragazza?', model: 'La ragazza è di Parigi.', ok: ['parigi'], no: ['roma', 'milano'] },
        { show: 3, q: 'Di dov\'è Kenji?', model: 'Kenji è di Osaka.', ok: ['osaka'], no: ['milano', 'parigi'] }
      ] },
    { lesson: 'l14', title: 'Io sono Kenji', scenes: [
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [40, 110]] }) + kjBubble(70, 12, 74, 'Io sono Kenji.', 66) + kjPerson('commissario', 150, 1), '«Io sono Kenji.»'],
        [() => gOffice(false) + kjPerson('commissario', 140, 1, { arms: [[-4, 6], [-95, 10]] }) + kjBubble(70, 12, 70, 'Lei è giapponese?', 134) + kjPerson('kenji', 60, 1), '«Lei è giapponese?»'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1) + kjBubble(30, 12, 80, 'Sì, sono giapponese.', 60) + kjPerson('commissario', 150, 1), '«Sì, sono giapponese.»'],
        [() => gOffice(false) + kjPerson('anna', 100, .96, { face: 'flat' }) + kjBubble(60, 14, 80, 'Io sono Anna. Io…', 100), 'Lei è Anna. È nervosa.'],
        [() => gOffice(false) + kjPerson('anna', 100, .96, { face: 'flat' }) + kjQ(136, 40, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'Kenji è giapponese?', model: 'Sì, Kenji è giapponese.', ok: ['giapponese'], no: ['non', 'no'] },
        { show: 3, q: 'Chi è? Anna o Kenji?', model: 'È Anna.', ok: ['anna'], no: ['kenji'] }
      ] },
    { lesson: 'l15', title: 'Un\'altra valigia', scenes: [
        [() => gOffice(false) + kjPut('suitcase_nero', 40, 52, 46), 'È una valigia. La valigia è nera.'],
        [() => gOffice(false) + kjPut('suitcase_nero', 30, 52, 46) + kjPut('suitcase_rosso', 110, 48, 50) + kjPerson('commissario', 176, 1, { arms: [[-4, 6], [-95, 10]] }), 'È un\'altra valigia. È rossa.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('suitcase_rosso', 50, 14, 90) + kjQ(150, 56, 30), 'Un\'altra valigia… rossa.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('coat_rosso', 30, 20, 70) + kjPut('suitcase_rosso', 106, 24, 70), 'Il cappotto è rosso. La valigia è rossa.'],
        [() => gOffice(false) + kjPut('suitcase_rosso', 110, 48, 50) + kjPerson('kenji', 60, 1, { face: 'o' }) + kjQ(150, 40, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'La valigia è nera o rossa?', mark: [135, 46], model: 'La valigia è rossa.', ok: ['rossa'], no: ['nera'] },
        { show: 0, q: 'È una valigia?', model: 'Sì, è una valigia.', ok: ['valigia'], no: ['non', 'no'] }
      ] },
    { lesson: 'l16', title: 'Nella valigia rossa', scenes: [
        [() => gOffice(false) + gSuitOpen(60, 54, '#c8323b') + kjPerson('commissario', 160, 1, { arms: [[-4, 6], [-60, 30]] }), 'La valigia rossa…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('agenda', 20, 22, 60) + kjPut('backpack', 76, 22, 60) + kjPut('mirror', 132, 22, 60), 'Un\'agenda. Uno zaino. Uno specchio.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('orange', 60, 18, 80), 'E un\'arancia.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gAgendaOpen(40, 20, ['VENEZIA', '204', '— C.R.']), 'L\'agenda…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gAgendaOpen(40, 20, ['VENEZIA', '204', '— C.R.']) + kjQ(164, 70, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'Che cos\'è?', mark: [50, 20], model: 'È un\'agenda.', ok: ['agenda'], no: ['zaino'] },
        { show: 1, q: 'È uno zaino o uno specchio?', mark: [106, 20], model: 'È uno zaino.', ok: ['zaino'], no: ['specchio'] },
        { show: 2, q: 'È un\'arancia?', model: 'Sì, è un\'arancia.', ok: ['arancia'], no: ['non', 'no'] }
      ] },
    { lesson: 'l17', title: 'Di chi è?', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gAgendaOpen(40, 20, ['VENEZIA', '204', '— C.R.']), 'L\'agenda è di Carlo Rossi.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('mirror', 40, 18, 70) + kjPerson('anna', 150, .96, { face: 'o' }), 'Lo specchio è di Anna?'],
        [() => gOffice(false) + kjPerson('anna', 100, .96, { face: 'flat', arms: [[-40, 20], [40, 20]] }) + kjBubble(106, 16, 34, 'No!', 108), '«No!»'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('backpack', 40, 18, 70) + gLabel(120, 44, 'PARIGI'), 'Lo zaino è di Parigi.'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { face: 'flat' }) + kjPerson('anna', 150, .96, { face: 'flat' }) + kjQ(96, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'L\'agenda è di Carlo Rossi?', model: 'Sì, l\'agenda è di Carlo Rossi.', ok: ['rossi'], no: ['non', 'no'] },
        { show: 1, q: 'Che cos\'è? Lo specchio o lo zaino?', model: 'È lo specchio.', ok: ['specchio'], no: ['zaino'] }
      ] },
    { lesson: 'l18', title: 'Nel cappotto', scenes: [
        [() => gOffice(false) + gHanger(150, 20) + kjPerson('kenji', 60, 1), 'È un cappotto. È il cappotto di Carlo Rossi.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gScale(gHanger(0, 0), 30, 4, 1.3) + gTicket(110, 50), 'Nel cappotto…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gTicket(50, 30, 1.6), 'MILANO — VENEZIA.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('table', 50, 40, 90) + gTicket(62, 50, .6) + kjPut('key', 98, 40, 34), 'Sul tavolo: la chiave.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gTicket(50, 30, 1.6) + kjQ(170, 40, 30), 'Continua…']
      ], questions: [
        { show: 3, q: 'Dov\'è la chiave?', model: 'La chiave è sul tavolo.', ok: ['sul', 'tavolo'], no: ['nel'] },
        { show: 1, q: 'È nel cappotto?', model: 'Sì, è nel cappotto.', ok: ['cappotto'], no: ['non', 'no'] }
      ] },
    { lesson: 'l19', title: 'Anche la valigia', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('coat_rosso', 30, 20, 70) + kjPut('suitcase_rosso', 106, 24, 70), 'Il cappotto è rosso. Anche la valigia è rossa.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('cup', 40, 30, 60) + gLipstick(60, 44) + kjPut('mirror', 116, 24, 60), 'Il rossetto è rosso. Anche…'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('suitcase_nero', 30, 24, 70) + kjPut('laptop_bianco', 110, 30, 60), 'La valigia nera non è di Anna. Neanche il portatile.'],
        [() => gOffice(false) + kjPerson('commissario', 60, 1, { face: 'flat' }) + kjBubble(70, 14, 76, 'Anche Anna? Neanche…', 66) + kjPerson('kenji', 150, 1), '«Anche Anna?»'],
        [() => gOffice(false) + kjPerson('kenji', 100, 1, { face: 'flat' }) + kjQ(136, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'Anche la valigia è rossa?', model: 'Sì, anche la valigia è rossa.', ok: ['anche', 'rossa'], no: ['non', 'neanche'] },
        { show: 2, q: 'Il portatile è bianco o nero?', mark: [140, 28], model: 'Il portatile è bianco.', ok: ['bianco'], no: ['nero'] }
      ] },
    { lesson: 'l20', title: 'Le otto', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('h8', 60, 14, 80), 'Sono le otto.'],
        [() => gOffice(false) + kjPut('h8', 150, 10, 34) + kjPerson('kenji', 60, 1, { face: 'flat' }) + kjPut('table', 90, 52, 56) + gNumbers(96, 46, .5), 'Sono le otto. E Rossi?'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('h10', 60, 14, 80), 'Sono le dieci.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('h12d', 20, 20, 70) + kjPut('h1', 110, 20, 70), 'È mezzogiorno. È l\'una.'],
        [() => gOffice(false) + kjPut('h3', 150, 10, 34) + kjPerson('kenji', 60, 1, { face: 'o' }) + kjQ(100, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'Che ora è?', model: 'Sono le otto.', ok: ['otto'], no: ['dieci'] },
        { show: 2, q: 'Sono le otto o le dieci?', model: 'Sono le dieci.', ok: ['dieci'], no: ['otto'] }
      ] },
    { lesson: 'l21', title: 'Il taxi delle tre', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gAgendaOpen(40, 20, ['9 — riunione', '1 — pranzo', '3 — taxi']), 'L\'agenda di Rossi.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('a_meeting', 30, 20, 70) + kjPut('a_lunch', 106, 20, 70), 'La riunione è alle nove. Il pranzo è all\'una.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('a_taxi', 60, 14, 80), 'Il taxi è alle tre.'],
        [() => gStreet() + gTaxi(70) + gSign(90, 54, 'STAZIONE') + kjPut('h3', 160, 6, 30), 'Alle tre: il taxi. La stazione.'],
        [() => gStreet() + gTaxi(120) + kjPerson('kenji', 60, 1, { legs: [[-22, 8], [22, 4]], arms: [[22, 20], [-22, 10]] }) + kjQ(170, 50, 26), 'Continua…']
      ], questions: [
        { show: 2, q: 'A che ora è il taxi?', model: 'Il taxi è alle tre.', ok: ['tre'], no: ['nove', 'una'] },
        { show: 1, q: 'La riunione è alle nove?', mark: [65, 18], model: 'Sì, la riunione è alle nove.', ok: ['nove'], no: ['non', 'no'] }
      ] },
    { lesson: 'l22', title: 'L\'etichetta rossa', scenes: [
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('umbrella_nero', 50, 18, 84), 'L\'ombrello è nero.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + kjPut('umbrella_nero', 30, 18, 84) + kjPut('label_rosso', 112, 34, 60), 'L\'etichetta è rossa.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gLabel(12, 40, 'HOTEL — VENEZIA — 204', 1.3), 'HOTEL… VENEZIA… 204.'],
        [() => '<rect width="200" height="120" fill="#d9cdb8"/>' + gKey204(30, 20) + gLabel(110, 50, 'HOTEL 204'), 'HOTEL 204: è la chiave!'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { face: 'open', arms: [[-150, 0], [150, 0]] }) + gVenice(110, 30, .55), 'Continua…']
      ], questions: [
        { show: 0, q: 'L\'ombrello è nero o bianco?', model: 'L\'ombrello è nero.', ok: ['nero'], no: ['bianco'] },
        { show: 1, q: 'L\'etichetta è rossa?', mark: [142, 32], model: 'Sì, l\'etichetta è rossa.', ok: ['rossa'], no: ['non', 'nera'] }
      ] },
    { lesson: 'l23', title: 'Anna telefona', scenes: [
        [() => gOffice(false) + kjPerson('kenji', 70, 1, { arms: [[30, 110], [-30, 110]] }) + gNumbers(56, 50, .4), 'Kenji legge il quaderno.'],
        [() => gStreet() + kjPerson('anna', 80, .96, { face: 'flat', arms: [[-4, 6], [150, 110]] }) + kjPut('phone_nero', 78, 30, 16), 'Anna telefona.'],
        [() => gOffice(false) + kjPerson('commercialista', 70, 1, { arms: [[-4, 6], [80, 30]] }) + kjPut('table', 96, 52, 56) + kjPut('laptop', 104, 36, 40), 'È Mario. Mario chiude il computer.'],
        [() => gOffice(false) + kjPerson('commercialista', 70, 1, { face: 'flat' }) + kjPerson('kenji', 150, 1, { face: 'o' }) + kjQ(110, 40, 26), 'Perché?'],
        [() => gOffice(false) + kjPerson('commercialista', 100, 1, { face: 'smile' }) + kjQ(140, 40, 30), 'Continua…']
      ], questions: [
        { show: 1, q: 'Che cosa fa Anna?', model: 'Anna telefona.', ok: ['telefona'], no: ['legge', 'chiude'] },
        { show: 2, q: 'Mario chiude il computer?', model: 'Sì, Mario chiude il computer.', ok: ['chiude'], no: ['non', 'apre'] }
      ] },
    { lesson: 'l24', title: 'Perché?', scenes: [
        [() => gOffice(false) + kjPerson('kenji', 70, 1, { arms: [[-4, 6], [150, 110]] }) + kjPut('phone_nero', 68, 28, 16), 'Kenji prende il telefono per telefonare.'],
        [() => gOffice(false) + kjPerson('kenji', 70, 1, { arms: [[-4, 6], [80, 30]] }) + gKey204(96, 50, .4), 'Kenji prende la chiave per aprire… che cosa?'],
        [() => gOffice(false) + kjPerson('commercialista', 70, 1, { arms: [[-4, 6], [80, 30]] }) + kjPut('agenda_nero', 96, 50, 30), 'Mario prende l\'agenda. Perché?'],
        [() => gOffice(false) + kjPerson('commercialista', 70, 1, { arms: [[-4, 6], [80, 30]] }) + kjPut('agenda_nero', 96, 50, 30) + '<path d="M150 50 h20 m-6 -5 l6 5 l-6 5" stroke="#c8323b" stroke-width="3" fill="none"/>', 'Perché? …'],
        [() => gOffice(false) + kjPerson('kenji', 100, 1, { face: 'flat' }) + kjQ(136, 40, 30), 'Continua…']
      ], questions: [
        { show: 0, q: 'Perché Kenji prende il telefono?', model: 'Per telefonare.', ok: ['telefonare'], no: ['leggere'] },
        { show: 2, q: 'Che cosa prende Mario?', model: 'Mario prende l\'agenda.', ok: ['agenda'], no: ['telefono'] }
      ] },
    { lesson: 'l25', title: 'La prende', scenes: [
        [() => gOffice(false) + gKey204(110, 20, .8) + kjPerson('kenji', 60, 1, { face: 'flat' }), 'Kenji prende la chiave? …'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [80, 30]] }) + gKey204(76, 52, .4), 'Sì, la prende.'],
        [() => gOffice(false) + kjPerson('kenji', 60, 1, { arms: [[-4, 6], [80, 30]] }) + kjPut('suitcase_nero', 76, 70, 28), 'Prende la valigia? Sì, la prende.'],
        [() => gStation() + kjPerson('kenji', 50, 1, { legs: [[-22, 8], [22, 4]], arms: [[22, 20], [-22, 10]] }) + kjPut('suitcase_nero', 60, 76, 22), 'La stazione. Il treno per Venezia.'],
        [() => gStation() + '<text x="100" y="112" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-style="italic" fill="#e6c77e">Fine del primo livello</text>', 'Continua… a Venezia.']
      ], questions: [
        { show: 1, q: 'Kenji prende la chiave?', model: 'Sì, la prende.', ok: ['la', 'prende'], no: ['non', 'lo'] },
        { show: 2, q: 'Kenji prende la valigia?', model: 'Sì, la prende.', ok: ['la', 'prende'], no: ['non', 'lo'] }
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
