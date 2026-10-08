// Splash per ogni corso (fumetto + bandierina). Uso: NODE_PATH=$(npm root -g) node res/build_splash.js res  → res/splash-<corso>.png e res/anteprima.png
// tools/set_course.js mette in config.xml lo splash del corso.
const { chromium } = require('playwright');
const emblem = '<path d="M58 44 H142 a28 28 0 0 1 28 28 V112 a28 28 0 0 1 -28 28 H96 L62 168 L68 140 H58 a28 28 0 0 1 -28 -28 V72 a28 28 0 0 1 28 -28 Z" fill="#eef1f6"/>' +
  '<g fill="#c9a45c"><rect x="62" y="80" width="14" height="32" rx="7"/><rect x="85" y="66" width="14" height="60" rx="7"/>' +
  '<rect x="108" y="74" width="14" height="44" rx="7"/><rect x="131" y="84" width="14" height="24" rx="7"/></g>';
// bandierine in un cerchio 100x100
const FLAG = {
  it: '<rect width="34" height="100" fill="#009246"/><rect x="33" width="34" height="100" fill="#fff"/><rect x="66" width="34" height="100" fill="#ce2b37"/>',
  en: '<rect width="100" height="100" fill="#012169"/><path d="M0 0 L100 100 M100 0 L0 100" stroke="#fff" stroke-width="20"/><path d="M0 0 L100 100 M100 0 L0 100" stroke="#c8102e" stroke-width="7"/><path d="M50 0 V100 M0 50 H100" stroke="#fff" stroke-width="30"/><path d="M50 0 V100 M0 50 H100" stroke="#c8102e" stroke-width="17"/>',
  ru: '<rect width="100" height="34" fill="#fff"/><rect y="33" width="100" height="34" fill="#0039a6"/><rect y="66" width="100" height="34" fill="#d52b1e"/>',
  zh: '<rect width="100" height="100" fill="#de2910"/>' + star(30, 36, 16) + star(56, 18, 5.5) + star(66, 30, 5.5) + star(66, 46, 5.5) + star(56, 58, 5.5),
  ar: '<rect width="100" height="100" fill="#0b7a3b"/><text x="50" y="64" text-anchor="middle" font-size="64" font-family="Noto Naskh Arabic, Noto Sans Arabic, DejaVu Sans, sans-serif" font-weight="700" fill="#fff">ع</text>'
};
function star(cx, cy, r) { let p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.4 : r; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); } return `<polygon points="${p.join(' ')}" fill="#ffde00"/>`; }
const S = 432;
const splash = c => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 432 432">` +
  `<svg x="86" y="70" width="250" height="250" viewBox="0 0 200 200">${emblem}</svg>` +
  `<clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath>` +
  `<g transform="translate(246 220) scale(0.8)"><circle cx="50" cy="50" r="56" fill="#0e131d"/><circle cx="50" cy="50" r="53" fill="#c9a45c"/><g clip-path="url(#c)">${FLAG[c]}</g></g></svg>`;
module.exports = { splash, S };
if (require.main === module) (async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: S, height: S } });
  for (const c of Object.keys(FLAG)) {
    await p.setContent(`<html><body style="margin:0;background:transparent">${splash(c)}</body></html>`);
    await p.screenshot({ path: process.argv[2] + '/splash-' + c + '.png', omitBackground: true });
  }
  // anteprima: come appare sul telefono (sfondo blu notte, ritaglio rotondo 2/3)
  const names = { it: 'CIAO', en: 'CIAO English', ru: 'CIAO Русский', ar: 'CIAO العربية', zh: 'CIAO 中文' };
  const fs = require('fs');
  const cells = Object.keys(FLAG).map(c => `<div style="width:220px;height:440px;background:#0e131d;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;border:3px solid #333">
   <div style="width:160px;height:160px;border-radius:50%;overflow:hidden;position:relative"><img src="data:image/png;base64,${fs.readFileSync(process.argv[2] + '/splash-' + c + '.png').toString('base64')}" style="position:absolute;left:-40px;top:-40px;width:240px;height:240px"></div>
   <div style="color:#eef1f6;font:600 18px sans-serif">${names[c]}</div></div>`).join('');
  await p.setViewportSize({ width: 1240, height: 500 });
  await p.setContent(`<html><body style="margin:0;padding:30px;background:#ddd;display:flex;gap:24px">${cells}</body></html>`);
  await p.screenshot({ path: process.argv[2] + '/anteprima.png' });
  await b.close();
})();
