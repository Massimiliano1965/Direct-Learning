'use strict';
/* =====================================================================
   L'INSEGNANTE DISEGNATO: al posto delle icone, i suoi gesti.
   Stile adulto e sobrio (pubblico: adulti, business, viaggiatori).
   4 personaggi (uomini in giacca e cravatta, donne in tailleur) × 6 pose:
     show  = mostra l'oggetto («È un libro.»)
     ask   = fa la domanda (mano aperta, sopracciglia alzate)
     you   = punta il dito verso l'allievo: tocca a te
     wrong = braccia incrociate a X (come in Giappone)
     ok    = apre le braccia
     great = esulta, braccia in alto
   ===================================================================== */
const LOOKS = {
  mass:   { man: true, skin: '#c98e62', skin2: '#b27a50', hair: '#a9a9b0', hair2: '#7d7d86', style: 'back',
            suit: '#4a4a57', suit2: '#3a3a45', shirt: '#f4f4f6', tie: '#a3263a', shoe: '#1b1b22' },
  giulia: { man: false, skin: '#eab892', skin2: '#d9a27c', hair: '#2b2028', hair2: '#1c151a', style: 'bun', glasses: 'thin',
            suit: '#7a2a3f', suit2: '#64213a', shirt: '#f8f1f3', pearls: true, legs: '#d9a27c', shoe: '#1b1b22' },
  luca:   { man: true, skin: '#eab892', skin2: '#d9a27c', hair: '#4a3326', hair2: '#38261c', style: 'short',
            suit: '#2f4a8a', suit2: '#263d73', shirt: '#e8eefc', tie: '#7d80d8', shoe: '#2a1d16' },
  sara:   { man: false, skin: '#f1c7a5', skin2: '#e0b08c', hair: '#a8522a', hair2: '#8a4020', style: 'long',
            suit: '#a8805a', suit2: '#8f6b48', shirt: '#fbe3d8', scarf: '#c8433a', legs: '#e0b08c', shoe: '#5a2a20' }
};
// braccio: spalla → gomito → mano (manica della giacca, polsino, mano piccola)
function tArm(L, s, e, h, finger) {
  const d = `M${s[0]} ${s[1]} L${e[0]} ${e[1]} L${h[0]} ${h[1]}`;
  const dx = h[0] - e[0], dy = h[1] - e[1], n = Math.hypot(dx, dy) || 1;
  const c = [h[0] - dx / n * 3.2, h[1] - dy / n * 3.2];
  let out = `<path d="${d}" fill="none" stroke="#1a1824" stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    <path d="${d}" fill="none" stroke="${L.suit}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${e[0]} ${e[1]} L${c[0]} ${c[1]}" fill="none" stroke="${L.suit2}" stroke-width="3" stroke-linecap="round" opacity=".35"/>
    <circle cx="${c[0]}" cy="${c[1]}" r="3.6" fill="${L.shirt}"/>
    <circle cx="${h[0]}" cy="${h[1]}" r="3.7" fill="${L.skin}"/>`;
  if (finger) out += `<path d="M${h[0]} ${h[1]} l${finger[0]} ${finger[1]}" stroke="${L.skin}" stroke-width="2.6" stroke-linecap="round"/>`;
  return out;
}
function tLegs(L) {
  if (L.man) return `<path d="M38 90 L37 148 h11 L50 104 L52 148 h11 L62 90z" fill="${L.suit2}"/>
    <path d="M50 104 L50 96" stroke="${L.suit}" stroke-width="1"/>
    <path d="M35 148 h13 v3 q-7 2 -15 0z M52 148 h13 q2 3 -2 3 h-11z" fill="${L.shoe}"/>`;
  return `<path d="M41 122 L42 147 h5 L49 122z M51 122 L53 147 h5 L59 122z" fill="${L.legs}"/>
    <path d="M37 90 L39 124 h22 L63 90z" fill="${L.suit2}"/>
    <path d="M40 147 h8 l1 3 h-11z M52 147 h8 l2 3 h-11z" fill="${L.shoe}"/>`;
}
function tTorso(L) {
  let t = `<path d="M34 46 q0 -5 7 -6 L50 38 L59 40 q7 1 7 6 L64 92 H36z" fill="${L.suit}"/>
    <path d="M44 40 L50 60 L56 40z" fill="${L.shirt}"/>`;
  if (L.man) t += `<path d="M48.6 42 h2.8 l.8 2 l-1.2 15 l-1 2 l-1 -2 l-1.2 -15z" fill="${L.tie}"/>`;
  if (L.pearls) t += `<path d="M45.5 41.5 q4.5 6 9 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="1.2 1"/>`;
  if (L.scarf) t += `<path d="M45 40 q5 5 10 0 l-2 6 l-2 8 l-2 -1 l-1 -7z" fill="${L.scarf}"/>`;
  // revers e bottoni
  t += `<path d="M44 40 L41 47 L45 50 L42 54 L50 66 L46 52 L49 49z M56 40 L59 47 L55 50 L58 54 L50 66 L54 52 L51 49z" fill="${L.suit2}"/>
    <circle cx="50" cy="72" r="1" fill="${L.suit2}"/><circle cx="50" cy="80" r="1" fill="${L.suit2}"/>
    <path d="M36 92 H64" stroke="${L.suit2}" stroke-width="1.2"/>`;
  return t;
}
function tHead(L, f) {
  let back = '', front = '';
  if (L.style === 'long') back = `<path d="M38 22 q-2 -14 12 -15 q14 1 12 15 q1 14 3 22 q-6 4 -15 3 q-9 1 -15 -3 q2 -8 3 -22z" fill="${L.hair}"/>`;
  if (L.style === 'bun') back = `<ellipse cx="50" cy="8" rx="6" ry="5" fill="${L.hair2}"/>`;
  const head = `<path d="M46.5 31 h7 v9 l-3.5 2 l-3.5 -2z" fill="${L.skin2}"/>
    <ellipse cx="40.6" cy="24" rx="1.6" ry="2.6" fill="${L.skin2}"/><ellipse cx="59.4" cy="24" rx="1.6" ry="2.6" fill="${L.skin2}"/>
    <ellipse cx="50" cy="23" rx="9.2" ry="11.2" fill="${L.skin}"/>`;
  if (L.style === 'back') front = `<path d="M40.5 22 q-1 -12 9.5 -12.5 q10.5 .5 9.5 12.5 q-1 -5 -3 -7 q-6.5 -3 -13 0 q-2 2 -3 7z" fill="${L.hair}"/>
    <path d="M44 13 q6 -2.5 12 0" stroke="#d8d8de" stroke-width=".9" fill="none"/>`;
  if (L.style === 'short') front = `<path d="M40.6 21 q-1.5 -11.5 9.4 -12 q11 .5 9.4 12 q-1 -4 -2.5 -5.5 q-4 1.5 -9 -.5 q-3 1 -5 0 q-1.5 1.5 -2.3 6z" fill="${L.hair}"/>`;
  if (L.style === 'bun') front = `<path d="M40.8 22 q-1 -12 9.2 -12 q10.2 0 9.2 12 q-3 -7 -9.2 -7.5 q-6.2 .5 -9.2 7.5z" fill="${L.hair}"/>`;
  if (L.style === 'long') front = `<path d="M40.6 23 q-1 -13 9.4 -13 q10.4 0 9.4 13 q-2 -7 -6 -8.5 q-6 3 -12.8 8.5z" fill="${L.hair}"/>`;
  // lineamenti piccoli, da adulto
  const b = f.brow || 0;   // -1 aggrottate, 1 alzate
  const by = 20.5 - b * 1.2;
  let feat = `<path d="M43.6 ${by + (b < 0 ? -0.8 : 0)} L47.4 ${by + (b < 0 ? 0.8 : 0)} M52.6 ${by + (b < 0 ? 0.8 : 0)} L56.4 ${by + (b < 0 ? -0.8 : 0)}" stroke="${L.hair2}" stroke-width="1" stroke-linecap="round"/>`;
  if (L.glasses === 'sun') feat += `<path d="M42.6 22.4 h6 q-.2 3.6 -3 3.6 q-2.8 0 -3 -3.6z M51.4 22.4 h6 q-.2 3.6 -3 3.6 q-2.8 0 -3 -3.6z M48.6 23 h2.8" fill="#121218" stroke="#121218" stroke-width=".8"/>`;
  else {
    feat += f.happy ? `<path d="M44 24 q1.5 -1.4 3 0 M53 24 q1.5 -1.4 3 0" stroke="#2a2026" stroke-width="1" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="45.5" cy="23.6" rx="1" ry="1.2" fill="#2a2026"/><ellipse cx="54.5" cy="23.6" rx="1" ry="1.2" fill="#2a2026"/>`;
    if (L.glasses === 'thin') feat += `<rect x="42.4" y="21.6" width="6.2" height="4.2" rx="1.6" fill="none" stroke="#3a2a33" stroke-width=".8"/><rect x="51.4" y="21.6" width="6.2" height="4.2" rx="1.6" fill="none" stroke="#3a2a33" stroke-width=".8"/><path d="M48.6 23.2 h2.8" stroke="#3a2a33" stroke-width=".8"/>`;
  }
  feat += `<path d="M50 25 q-.8 2.6 -.2 3.6 h1" stroke="${L.skin2}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
  const lip = L.man ? '#7a4a3a' : '#a8424f';
  const m = { talk: `<ellipse cx="50" cy="31" rx="1.8" ry="1.2" fill="#6a2a2a"/>`,
              smile: `<path d="M46.8 30.4 q3.2 2.4 6.4 0" stroke="${lip}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`,
              flat: `<path d="M47.4 31 h5.2" stroke="${lip}" stroke-width="1.1" stroke-linecap="round"/>`,
              open: `<path d="M46.6 30 q3.4 4 6.8 0z" fill="#6a2a2a"/>`,
              o: `<ellipse cx="50" cy="31" rx="1.2" ry="1.3" fill="#6a2a2a"/>` };
  // bocca normale + bocca che parla (si vede e si muove solo mentre l'insegnante parla: #stage.talking)
  return back + head + front + feat + '<g class="tmouth">' + m[f.mouth] + '</g>' +
    '<ellipse class="tlips" cx="50" cy="31.2" rx="2.9" ry="2.2" fill="#5a2424"/>';
}
const DOWN_L = [[35, 47], [32, 70], [34, 90]], DOWN_R = [[65, 47], [68, 70], [66, 90]];
const POSES = {
  show:  { f: { mouth: 'talk' }, arms: L => tArm(L, ...DOWN_L) + tArm(L, [65, 47], [80, 60], [95, 55]) },
  ask:   { f: { mouth: 'o', brow: 1 }, tilt: 6, arms: L => tArm(L, ...DOWN_L) + tArm(L, [65, 47], [74, 72], [86, 66]) },
  you:   { f: { mouth: 'smile' }, arms: L => tArm(L, ...DOWN_L) + tArm(L, [65, 47], [78, 64], [88, 74], [5, 5]) },
  wrong: { f: { mouth: 'flat', brow: -1 }, arms: L => tArm(L, [35, 47], [33, 64], [67, 38]) + tArm(L, [65, 47], [67, 64], [33, 38]) },
  ok:    { f: { mouth: 'smile', happy: true }, arms: L => tArm(L, [35, 47], [22, 64], [11, 57]) + tArm(L, [65, 47], [78, 64], [89, 57]) },
  great: { f: { mouth: 'open', happy: true, brow: 1 }, arms: L => tArm(L, [35, 46], [26, 28], [22, 9]) + tArm(L, [65, 46], [74, 28], [78, 9]) }
};
// half = dalla vita in su (più grande nel riquadro)
function teacherFig(key, pose, half) {
  const L = LOOKS[key] || LOOKS.luca, P = POSES[pose];
  const head = `<g transform="rotate(${P.tilt || 0} 50 34)">${tHead(L, P.f)}</g>`;
  if (half) return `<svg viewBox="0 0 100 96" xmlns="http://www.w3.org/2000/svg">${tTorso(L)}${head}${P.arms(L)}</svg>`;
  return `<svg viewBox="0 0 100 156" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="151" rx="22" ry="3" fill="#000" opacity=".25"/>${tLegs(L)}${tTorso(L)}${head}${P.arms(L)}</svg>`;
}

// Ritratto (solo la testa) per il menu e l'intestazione
function teacherHead(key) {
  const L = LOOKS[key] || LOOKS.luca;
  return `<svg viewBox="33 4 34 34" xmlns="http://www.w3.org/2000/svg"><rect x="33" y="4" width="34" height="34" fill="#1d2638"/>${tTorso(L)}${tHead(L, { mouth: 'smile' })}</svg>`;
}
