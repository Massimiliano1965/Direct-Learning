'use strict';
/* =====================================================================
   I VERBI DI MOVIMENTO (proposta, prima serie): il signor Mario in 4 fotogrammi
   per verbo, come una striscia di cartone animato. Stesso stile dell'insegnante
   (teacher.js: tHead, tTorso, tArm, LOOKS), ma con gambe e braccia snodate.
   ACTIONS[verbo] = 4 pose; actionFrame(verbo, i) = un fotogramma (SVG 120×120);
   actionSheet(verbo) = i 4 fotogrammi affiancati (SVG 480×120).
   Si legge da sinistra a destra; la freccia d'oro in basso dice la direzione.
   ===================================================================== */
const ACT_GROUND = 104, ACT_S = 0.5;
const rad = d => d * Math.PI / 180;
// gamba o braccio da angoli: a = angolo del primo pezzo (0 = giù, + = avanti/destra), b = piega del secondo
function limb(p, a, b, l1, l2) {
  const k = [p[0] + l1 * Math.sin(rad(a)), p[1] + l1 * Math.cos(rad(a))];
  const e = [k[0] + l2 * Math.sin(rad(a + b)), k[1] + l2 * Math.cos(rad(a + b))];
  return [k, e];
}
/* ---------- I vestiti di oggi (Massi: «niente giacca e cravatta verde anni '60, tutti alla moda, ognuno diverso;
   anche l'occhio vuole la sua parte»). outfit: bomber, knit, blazer (con la minigonna), dress ---------- */
const LOOK26 = {
  // Mario: giubbotto blu aperto, maglietta bianca, jeans, scarpe da ginnastica
  mario: { man: true, outfit: 'bomber', skin: '#e2ae86', skin2: '#cc9670', hair: '#2a1d16', hair2: '#1c140f', style: 'short',
    suit: '#26334d', suit2: '#1d283d', shirt: '#1d283d', tee: '#f2f2f4', pants: '#3f5f8a', pants2: '#33507a', shoe: '#f4f4f6', sole: '#b9c0cc' },
  // Carlo Rossi: giacca grigia all'italiana, camicia bianca aperta (niente cravatta), fazzoletto azzurro, pantaloni blu, mocassini
  carlo: { man: true, outfit: 'tailor', modern: true, under: 'shirt', skin: '#eab892', skin2: '#d9a27c', hair: '#3a2a20', hair2: '#2a1d16', style: 'short',
    suit: '#8c929b', suit2: '#767c86', shirt: '#f7f8fb', btn: '#5d636d', pocket: '#9cc3e6', pants: '#2a3550', pants2: '#222c44', shoe: '#7a4a2a' },
  // Anna: giacca corta rosa, top nero, minigonna nera, tacchi alti
  anna: { man: false, outfit: 'blazer', skin: '#f0c4a2', skin2: '#dcab86', hair: '#3a2418', hair2: '#2a1810', style: 'long',
    suit: '#d46a8c', suit2: '#b8577a', shirt: '#b8577a', tee: '#1d1d24', skirt: '#1d1d24', skirtLen: 18, shoe: '#1d1d24', heels: true, earrings: '#e6c77e' },
  // Lucia Rossi: vestito viola stretto in vita con la cintura d'oro, sopra il ginocchio, tacchi
  lucia: { man: false, outfit: 'dress', skin: '#eab892', skin2: '#d9a27c', hair: '#5a3a28', hair2: '#45291c', style: 'bob',
    suit: '#6b4fa0', suit2: '#5a4189', shirt: '#5a4189', skirt: '#6b4fa0', skirtLen: 26, belt: '#e6c77e', shoe: '#2a1d2a', heels: true, earrings: '#e6c77e' }
};
function actLeg(L, a, b, back) {
  const hip = [50, 92];
  const [k, f] = limb(hip, a, -b, 29, 29);
  const d = `M${hip[0]} ${hip[1]} L${k[0]} ${k[1]} L${f[0]} ${f[1]}`;
  if (L.heels) {   // gambe nude, scarpa col tacco
    const sk = back ? L.skin2 : L.skin;
    return `<path d="${d}" fill="none" stroke="#1a1824" stroke-width="8.6" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>
      <path d="${d}" fill="none" stroke="${sk}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${f[0] - 4} ${f[1] - 1} q6 -2 12 3 l.5 1.5 h-7 z" fill="${L.shoe}"/><path d="M${f[0] - 3.4} ${f[1] - 1} l-.6 5" stroke="${L.shoe}" stroke-width="2" stroke-linecap="round"/>`;
  }
  const col = L.pants ? (back ? L.pants2 : L.pants) : (back ? L.suit2 : L.suit);
  const shoe = L.sole   // scarpa da ginnastica: bianca con la suola grigia
    ? `<path d="M${f[0] - 5} ${f[1] + 1} q0 -7 6 -6 l7 2.5 q3.5 1.2 2.5 3.5z" fill="${L.shoe}"/><path d="M${f[0] - 5} ${f[1] + 1} h15.5" stroke="${L.sole}" stroke-width="2" stroke-linecap="round"/>`
    : `<path d="M${f[0] - 4} ${f[1] + 1} q0 -6 6 -5 l6 2 q3 1 2 4z" fill="${L.shoe}"/>`;
  return `<path d="${d}" fill="none" stroke="#1a1824" stroke-width="12.5" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>
    <path d="${d}" fill="none" stroke="${col}" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round"/>` + shoe;
}
// il busto (al posto di tTorso, che è giacca e cravatta)
function actTorso(L) {
  if (L.outfit === 'tailor') return tTorsoModern(L);
  if (L.outfit === 'bomber') return `<path d="M34 46 q0 -5 7 -6 L50 38 L59 40 q7 1 7 6 L65 86 q-15 4 -30 0z" fill="${L.suit}"/>
    <path d="M44 40 q6 4 12 0 L57 86 q-7 1.5 -14 0z" fill="${L.tee}"/>
    <path d="M44.5 40.5 q5.5 3.5 11 0" stroke="#d9d9de" stroke-width="1.2" fill="none"/>
    <path d="M44 40 L43 86 M56 40 L57 86" stroke="${L.suit2}" stroke-width="1.6"/>
    <path d="M35 84 q15 4.5 30 0 l.3 4 q-15.3 4.5 -30.6 0z" fill="${L.suit2}"/>
    <path d="M41 39.5 q9 -3 18 0 l-1 2.5 q-8 -2.5 -16 0z" fill="${L.suit2}"/>
    <path d="M37 89 h26 v4 h-26z" fill="${L.pants2}"/>`;
  if (L.outfit === 'knit') return `<path d="M34 46 q0 -5 7 -6 L50 38 L59 40 q7 1 7 6 L64.5 88 q-14.5 3 -29 0z" fill="${L.suit}"/>
    <path d="M44 40 L50 55 L56 40z" fill="${L.tee}"/>
    <path d="M44 39.5 l3.5 5 l2.5 -4.5 l2.5 4.5 l3.5 -5" fill="${L.tee}" stroke="#9fb9d6" stroke-width=".8"/>
    <path d="M43.6 40 L50 56 L56.4 40" stroke="${L.suit2}" stroke-width="1.8" fill="none"/>
    <path d="M35.5 85 q14.5 3 29 0" stroke="${L.suit2}" stroke-width="3"/>
    <path d="M38 89.5 h24 v3.5 h-24z" fill="${L.pants2}"/>`;
  // donna: vita stretta
  const shape = `M36 46 q0 -5 7 -6 L50 39 L57 40 q7 1 7 6 L61.5 68 q-.5 7 2.5 18 H37 q3 -11 2.5 -18z`;
  if (L.outfit === 'blazer') return `<path d="${shape}" fill="${L.suit}"/>
    <path d="M44.5 40 q5.5 3 11 0 L55 66 L50 70 L45 66z" fill="${L.tee}"/>
    <path d="M44 40 L41.5 50 L45.5 52 L50 70 M56 40 L58.5 50 L54.5 52 L50 70" stroke="${L.suit2}" stroke-width="1.6" fill="${L.suit2}" fill-opacity=".5"/>
    <circle cx="51.5" cy="73" r="1" fill="${L.suit2}"/>`;
  return `<path d="${shape}" fill="${L.suit}"/>
    <path d="M45 40 L50 49 L55 40z" fill="${L.skin}"/>
    <path d="M45 40 L50 49 L55 40" stroke="${L.suit2}" stroke-width="1.2" fill="none"/>
    <path d="M39.6 67 h21.8 l.2 4 h-22.2z" fill="${L.belt}"/><rect x="48.5" y="66.6" width="3.4" height="4.8" rx=".6" fill="none" stroke="#a8843f" stroke-width=".8"/>`;
}
// la gonna: copre le anche e l'inizio delle gambe (si disegna sopra le gambe)
function actSkirt(L) {
  if (!L.skirt) return '';
  const y2 = 84 + L.skirtLen, e = L.skirtLen * .14, w = 32 + 2 * e;
  return `<path d="M37.2 84 H62.8 L${66 + e} ${y2} q-${w / 2} 3 -${w} 0z" fill="${L.skirt}"/>
    <path d="M${34 - e + .5} ${y2 - .3} q${w / 2 - .5} 3 ${w - 1} 0" stroke="#000" stroke-opacity=".2" stroke-width="1" fill="none"/>`;
}
function actArm(L, side, a, b, finger) {
  const s = side < 0 ? [36, 47] : [64, 47];
  const [e, h] = limb(s, a, b, 23, 20);
  return tArm(L, s, e, h, finger);
}
function actHand(side, a, b) { return limb(side < 0 ? [36, 47] : [64, 47], a, b, 23, 20)[1]; }

/* ---------- gli oggetti ---------- */
const AP = {
  stone: x => `<path d="M${x - 6} ${ACT_GROUND} q1 -6 6 -6 q6 0 6 6z" fill="#8b93a7"/>`,
  box: (x, y) => `<g transform="translate(${x} ${y === undefined ? ACT_GROUND : y})"><rect x="-13" y="-24" width="26" height="24" rx="2" fill="#c98a4b"/>
    <path d="M-13 -16 h26 M0 -24 v8" stroke="#a96f35" stroke-width="2"/><rect x="-13" y="-24" width="26" height="24" rx="2" fill="none" stroke="#8a5a2a" stroke-width="1.2"/></g>`,
  ball: (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#e8862a"/><path d="M${x - 4.5} ${y} q4.5 -3 9 0" stroke="#fff" stroke-width="1" fill="none"/>`,
  table: x => `<rect x="${x - 16}" y="${ACT_GROUND - 34}" width="32" height="4" rx="1" fill="#a0703f"/>
    <path d="M${x - 13} ${ACT_GROUND - 30} V${ACT_GROUND} M${x + 13} ${ACT_GROUND - 30} V${ACT_GROUND}" stroke="#7c5430" stroke-width="3"/>`,
  cup: (x, y) => `<path d="M${x - 4} ${y - 7} h8 l-1 7 h-6z" fill="#f4f4f6"/><path d="M${x + 4} ${y - 5.5} q3 0 2.5 2.5 q-.5 2 -2.8 1.6" stroke="#f4f4f6" stroke-width="1.3" fill="none"/>`,
  // la porta: open 0 = chiusa, 1 = aperta (si vede di taglio)
  door: (x, open) => {
    const w = 22 * (1 - open * 0.75), top = ACT_GROUND - 66, R = x + 23;
    return `<rect x="${x - 2}" y="${top - 3}" width="27" height="69" fill="#2a3448"/>
      <rect x="${x}" y="${top}" width="23" height="66" fill="#121826"/>
      <path d="M${R} ${top} L${R - w} ${top + open * 5} L${R - w} ${ACT_GROUND - open * 5} L${R} ${ACT_GROUND}z" fill="#9a6a3c"/>
      <path d="M${R - 3} ${top + 6} L${R - w + 3} ${top + 6 + open * 4} L${R - w + 3} ${top + 28 + open * 2} L${R - 3} ${top + 28}z" fill="#87592f"/>
      <circle cx="${R - w + 4}" cy="${ACT_GROUND - 36 + open * 2}" r="1.8" fill="#e6c77e"/>`;
  },
  // le scale: 4 gradini che salgono verso destra (o scendono se down)
  stairs: down => {
    let d = '';
    for (let i = 0; i < 4; i++) { const x = 28 + i * 18, h = (down ? 3 - i : i) * 6 + 6; d += `<rect x="${x}" y="${ACT_GROUND - h}" width="18" height="${h}" fill="#3a4a66"/><path d="M${x} ${ACT_GROUND - h} h18" stroke="#6f86ad" stroke-width="1.5"/>`; }
    return d;
  }
};
// segni del movimento: linee della velocità, arco della traiettoria
const speed = (x, y) => `<path d="M${x} ${y} h-12 M${x + 2} ${y + 8} h-16 M${x} ${y + 16} h-10" stroke="#8fb4ff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
const arc = d => `<path d="${d}" fill="none" stroke="#e6c77e" stroke-width="1.6" stroke-dasharray="3 3" opacity=".8"/>`;
const dust = x => `<path d="M${x - 8} ${ACT_GROUND - 1} q-3 -4 -7 -2 M${x + 8} ${ACT_GROUND - 1} q3 -4 7 -2" stroke="#8b93a7" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

/* ---------- le pose: x = dove sono i piedi, y = quanto è in alto, r = inclinazione (+ = in avanti),
   legs = [anca, piega del ginocchio] gamba dietro e gamba davanti (0 = giù, + = avanti),
   arms = [spalla, piega del gomito] braccio dietro e braccio davanti (+ = avanti / in su),
   reach = [x, y] dove va la mano davanti (la piega la calcola reachArm), reach2 = anche l'altra ---------- */
const W1 = { legs: [[-22, 8], [22, 4]], arms: [[22, 20], [-22, 10]] };       // passo lungo
const W2 = { legs: [[-4, 18], [4, 2]], arms: [[6, 8], [-6, 8]] };            // piedi vicini
const STAND = { legs: [[-3, 0], [3, 0]], arms: [[-4, 6], [4, 6]] };
const UP_L = [[-170, 0], [170, 0]];
const ACTIONS = {
  camminare: { arrow: 1, frames: [
    { x: 24, ...W1 }, { x: 44, ...W2 }, { x: 64, legs: [[22, 4], [-22, 8]], arms: [[-22, 10], [22, 20]] }, { x: 84, ...W2 } ] },
  correre: { arrow: 1, frames: [
    { x: 32, r: 12, legs: [[-40, 70], [40, 50]], arms: [[45, 90], [-45, 70]], face: 'open', fx: speed },
    { x: 52, y: 6, r: 12, legs: [[-20, 100], [20, 80]], arms: [[-20, 80], [20, 90]], face: 'open', fx: speed },
    { x: 72, r: 12, legs: [[40, 50], [-40, 70]], arms: [[-45, 70], [45, 90]], face: 'open', fx: speed },
    { x: 90, y: 6, r: 12, legs: [[20, 80], [-20, 100]], arms: [[20, 90], [-20, 80]], face: 'open', fx: speed } ] },
  saltare: { arrow: 0, frames: [
    { x: 60, y: -9, r: 14, legs: [[70, 120], [70, 120]], arms: [[-50, 20], [-50, 20]] },
    { x: 60, y: 8, legs: [[-4, 0], [4, 0]], arms: UP_L, face: 'open', fx: () => arc('M60 106 V94') },
    { x: 60, y: 22, legs: [[60, 110], [70, 120]], arms: [[-150, 0], [150, 0]], face: 'open', happy: 1, fx: () => arc('M60 104 V84') },
    { x: 60, y: -5, legs: [[40, 70], [40, 70]], arms: [[60, 20], [60, 20]], happy: 1, fx: () => dust(60) } ] },
  cadere: { arrow: 1, frames: [
    { x: 30, ...W1, stone: 60 },
    { x: 54, r: 22, legs: [[-40, 30], [20, 10]], arms: [[80, 20], [70, 20]], face: 'o', stone: 60 },
    { x: 66, r: 55, y: -8, legs: [[-50, 20], [-30, 10]], arms: [[120, 0], [110, 10]], face: 'o', stone: 52 },
    { x: 46, r: 90, y: -22, legs: [[-4, 0], [4, 0]], arms: [[150, 0], [140, 10]], face: 'flat', stone: 20, fx: () => dust(62) } ] },
  salire: { arrow: 1, scene: () => AP.stairs(false), frames: [
    { x: 16, ...W2 },
    { x: 37, y: 6, legs: [[-30, 10], [40, 80]], arms: [[20, 10], [-20, 10]] },
    { x: 55, y: 12, legs: [[-30, 10], [40, 80]], arms: [[-20, 10], [20, 10]] },
    { x: 91, y: 24, ...W2, happy: 1 } ] },
  scendere: { arrow: 1, scene: () => AP.stairs(true), frames: [
    { x: 37, y: 24, ...W2 },
    { x: 55, y: 18, legs: [[-10, 30], [30, 0]], arms: [[20, 10], [-20, 10]] },
    { x: 73, y: 12, legs: [[-10, 30], [30, 0]], arms: [[-20, 10], [20, 10]] },
    { x: 106, ...W2, happy: 1 } ] },
  prendere: { arrow: 0, scene: () => AP.table(94), frames: [
    { x: 40, ...W2, cup: 94 },
    { x: 62, ...W2, reach: [86, ACT_GROUND - 52], cup: 94 },
    { x: 70, r: 8, ...W2, reach: [92, ACT_GROUND - 38], hold: 'cup' },
    { x: 62, ...W2, reach: [76, ACT_GROUND - 58], happy: 1, hold: 'cup' } ] },
  lanciare: { arrow: 1, frames: [
    { x: 34, ...W2, arms: [[10, 10], [-30, 60]], hold: 'ball' },
    { x: 34, r: -8, legs: [[-24, 8], [22, 4]], arms: [[40, 30], [-150, -30]], hold: 'ball' },
    { x: 40, r: 10, legs: [[-24, 8], [24, 4]], arms: [[-30, 20], [110, 10]], face: 'open', ball: [80, 44], fx: () => arc('M62 52 Q72 40 80 44') },
    { x: 40, r: 8, legs: [[-24, 8], [24, 4]], arms: [[-20, 20], [40, 30]], happy: 1, ball: [108, 98], fx: () => arc('M62 52 Q88 22 107 94') } ] },
  aprire: { arrow: 0, frames: [
    { x: 36, ...W2, door: 0 },
    { x: 60, ...W2, reach: 'door', door: 0 },
    { x: 58, ...W2, reach: 'door', door: .5 },
    { x: 56, ...STAND, happy: 1, door: 1 } ] },
  chiudere: { arrow: 0, frames: [
    { x: 56, ...STAND, door: 1 },
    { x: 58, ...W2, reach: 'door', door: .9 },
    { x: 60, ...W2, reach: 'door', door: .45 },
    { x: 60, ...W2, reach: 'door', door: 0 } ] },
  spingere: { arrow: 1, frames: [
    { x: 28, r: 20, legs: [[-34, 10], [20, 40]], reach: [46, ACT_GROUND - 18], reach2: [46, ACT_GROUND - 14], box: 60 },
    { x: 40, r: 24, legs: [[-40, 10], [24, 40]], reach: [58, ACT_GROUND - 18], reach2: [58, ACT_GROUND - 14], box: 72, fx: () => speed(56, 86) },
    { x: 58, r: 24, legs: [[-40, 10], [24, 40]], reach: [76, ACT_GROUND - 18], reach2: [76, ACT_GROUND - 14], box: 90, fx: () => speed(74, 86) },
    { x: 70, ...STAND, happy: 1, box: 100 } ] },
  tirare: { arrow: -1, frames: [
    { x: 30, r: -16, legs: [[-30, 10], [30, 10]], reach: [50, ACT_GROUND - 46], reach2: [48, ACT_GROUND - 44], box: 100, rope: 1 },
    { x: 26, r: -20, legs: [[-30, 10], [34, 10]], reach: [44, ACT_GROUND - 46], reach2: [42, ACT_GROUND - 44], box: 84, rope: 1, fx: () => speed(110, 86) },
    { x: 22, r: -20, legs: [[-30, 10], [34, 10]], reach: [40, ACT_GROUND - 46], reach2: [38, ACT_GROUND - 44], box: 68, rope: 1, fx: () => speed(94, 86) },
    { x: 20, ...STAND, happy: 1, box: 52 } ] }
};
// dov'è la maniglia della porta (i cardini sono a destra, la maniglia a sinistra)
function doorKnob(x, open) { return [x + 23 - 22 * (1 - open * 0.75) + 4, ACT_GROUND - 36 + open * 2]; }

// dal disegno del personaggio al fotogramma e ritorno (spostamento, scala, inclinazione intorno alle anche)
function frameT(p) { return { tx: p.x - 50 * ACT_S, ty: ACT_GROUND - (p.y || 0) - 150 * ACT_S, r: rad(p.r || 0) }; }
function toFrame(p, q) {
  const T = frameT(p), dx = q[0] - 50, dy = q[1] - 92, c = Math.cos(T.r), s = Math.sin(T.r);
  return [T.tx + ACT_S * (50 + dx * c - dy * s), T.ty + ACT_S * (92 + dx * s + dy * c)];
}
function toFig(p, q) {
  const T = frameT(p), X = (q[0] - T.tx) / ACT_S - 50, Y = (q[1] - T.ty) / ACT_S - 92, c = Math.cos(-T.r), s = Math.sin(-T.r);
  return [50 + X * c - Y * s, 92 + X * s + Y * c];
}
// la mano va al punto t (coordinate del fotogramma): gomito in basso, come un braccio vero
function reachArm(p, side, t) {
  const S = side < 0 ? [36, 47] : [64, 47], T = toFig(p, t);
  const dx = T[0] - S[0], dy = T[1] - S[1], d = Math.min(Math.hypot(dx, dy), 42.5);
  const th = Math.atan2(dx, dy) * 180 / Math.PI;
  const al = Math.acos(Math.max(-1, Math.min(1, (23 * 23 + d * d - 20 * 20) / (2 * 23 * d)))) * 180 / Math.PI;
  const a = th - al, e = limb(S, a, 0, 23, 0)[0];
  return [a, Math.atan2(T[0] - e[0], T[1] - e[1]) * 180 / Math.PI - a];
}

// una posa con tutti i numeri: la mano che «va verso» diventa angoli di spalla e gomito
function actResolve(p) {
  const q = Object.assign({ y: 0, r: 0 }, p);
  q.legs = (p.legs || W2.legs).map(l => l.slice());
  q.arms = (p.arms || W2.arms).map(a => a.slice());
  const reach = p.reach === 'door' ? doorKnob(80, p.door) : p.reach;
  if (reach) q.arms[1] = reachArm(q, 1, reach);
  if (p.reach2) q.arms[0] = reachArm(q, -1, p.reach2);
  delete q.reach; delete q.reach2;
  return q;
}
// a metà strada tra due pose (t da 0 a 1): i numeri scorrono, il resto (faccia, cosa ha in mano) cambia a metà
function actLerp(a, b, t) {
  const n = (u, v) => u === undefined ? v : v === undefined ? u : u + (v - u) * t;
  const arr = (u, v) => u && v ? u.map((x, i) => Array.isArray(x) ? arr(x, v[i]) : n(x, v[i])) : (t < .5 ? u : v);
  const q = Object.assign({}, t < .5 ? a : b);
  ['x', 'y', 'r', 'door', 'box', 'stone', 'cup'].forEach(k => { q[k] = n(a[k], b[k]); });
  ['legs', 'arms'].forEach(k => { q[k] = arr(a[k], b[k]); });
  if (a.ball && b.ball) q.ball = arr(a.ball, b.ball);
  return q;
}
function actFigure(L, q) {
  const f = { mouth: q.face || 'smile', happy: !!q.happy }, legs = q.legs, arms = q.arms;
  let body = actArm(L, -1, arms[0][0], arms[0][1]) + actLeg(L, legs[0][0], legs[0][1], true) + actTorso(L) + tHeadStill(L, f) +
    (L.earrings ? `<circle cx="40.4" cy="27.2" r="1.1" fill="${L.earrings}"/><circle cx="59.6" cy="27.2" r="1.1" fill="${L.earrings}"/>` : '') +
    actLeg(L, legs[1][0], legs[1][1]) + actSkirt(L) + actArm(L, 1, arms[1][0], arms[1][1]);
  if (q.hold) {
    const h = actHand(1, arms[1][0], arms[1][1]);
    body += `<g transform="translate(${h[0]} ${h[1]}) rotate(${-q.r}) scale(${1 / ACT_S})">${q.hold === 'cup' ? AP.cup(1, 3) : AP.ball(0, -3)}</g>`;
  }
  return body;
}
// un fotogramma (SVG 120×120) da una posa già risolta; label = il numerino in alto (solo nelle strisce)
function actionPose(verb, q, look, label) {
  const A = ACTIONS[verb], L = LOOK26[look || 'mario'] || LOOKS[look], T = frameT(q);
  let s = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="10" fill="#1b2333"/>
    <path d="M6 ${ACT_GROUND} H114" stroke="#3a4a66" stroke-width="2" stroke-linecap="round"/>`;
  if (A.scene) s += A.scene();
  if (q.door !== undefined) s += AP.door(80, q.door);
  if (q.stone !== undefined) s += AP.stone(q.stone);
  if (q.cup !== undefined && !q.hold) s += AP.cup(q.cup, ACT_GROUND - 34);
  if (q.box !== undefined) s += AP.box(q.box);
  if (q.ball) s += AP.ball(q.ball[0], q.ball[1]);
  if (q.fx) s += q.fx(q.x - 12, ACT_GROUND - 50 - q.y);
  s += `<g transform="translate(${T.tx} ${T.ty}) scale(${ACT_S}) rotate(${q.r} 50 92)">${actFigure(L, q)}</g>`;
  if (q.rope) {   // la corda: dalla mano davanti alla scatola
    const h = toFrame(q, actHand(1, q.arms[1][0], q.arms[1][1])), bx = q.box - 13;
    s += `<path d="M${h[0]} ${h[1]} Q${(h[0] + bx) / 2} ${ACT_GROUND - 22} ${bx} ${ACT_GROUND - 12}" stroke="#d8c08a" stroke-width="1.6" fill="none"/>`;
  }
  if (A.arrow) s += A.arrow > 0 ? `<path d="M46 114 H74 m-5 -4 l5 4 l-5 4" stroke="#c9a45c" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M74 114 H46 m5 -4 l-5 4 l5 4" stroke="#c9a45c" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (label) s += `<text x="9" y="16" font-family="sans-serif" font-size="9" font-weight="700" fill="#8f9bb3">${label}</text>`;
  return s + '</svg>';
}
function actionFrame(verb, i, look) { return actionPose(verb, actResolve(ACTIONS[verb].frames[i]), look, i + 1); }
function actionSheet(verb, look) {
  return `<svg viewBox="0 0 492 120" xmlns="http://www.w3.org/2000/svg">` +
    [0, 1, 2, 3].map(i => `<g transform="translate(${i * 124} 0)">${actionFrame(verb, i, look).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>`).join('') + `</svg>`;
}

/* ---------- Il cartone animato (Massi): le 4 pose scorrono una nell'altra, poi ricomincia ----------
   ACT_STEP = da una posa all'altra, ACT_HOLD = ferma sull'ultima prima di ricominciare (millisecondi) */
const ACT_STEP = 520, ACT_HOLD = 800;
const actEase = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function actionLoopMs(verb) { return (ACTIONS[verb].frames.length - 1) * ACT_STEP + ACT_HOLD; }
// la posa al tempo ms (sempre la stessa per lo stesso ms: serve anche alle prove)
function actionAt(verb, ms, look) {
  const F = ACTIONS[verb].frames, cache = ACTIONS[verb]._res || (ACTIONS[verb]._res = F.map(actResolve));
  const t = ms % actionLoopMs(verb), k = Math.floor(t / ACT_STEP);
  if (k >= F.length - 1) return actionPose(verb, cache[F.length - 1], look);
  return actionPose(verb, actLerp(cache[k], cache[k + 1], actEase(t / ACT_STEP - k)), look);
}
// fa partire il cartone dentro el; restituisce la funzione per fermarlo
function playAction(el, verb, look) {
  let on = true, t0 = 0, last = -1;
  const tick = now => {
    if (!on) return;
    if (!t0) t0 = now;
    const f = Math.floor((now - t0) / 33);        // circa 30 immagini al secondo: leggero per il telefono
    if (f !== last) { last = f; el.innerHTML = actionAt(verb, now - t0, look); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => { on = false; };
}
if (typeof module !== 'undefined') module.exports = { ACTIONS, actionFrame, actionSheet, actionAt, playAction };
