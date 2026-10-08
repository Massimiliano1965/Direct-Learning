// Rigenera icone Android e splash nel blu notte e oro del tema.
// Uso: NODE_PATH=$(npm root -g) node res/build_icons.js   (serve Playwright con Chromium)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, 'android');
fs.mkdirSync(OUT, { recursive: true });

const grad = '<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#1d2638"/><stop offset="1" stop-color="#0e131d"/></linearGradient></defs>';
// Fumetto chiaro con le onde della voce in oro (stesso disegno del logo nel menu)
const emblem = '<path d="M58 44 H142 a28 28 0 0 1 28 28 V112 a28 28 0 0 1 -28 28 H96 L62 168 L68 140 H58 a28 28 0 0 1 -28 -28 V72 a28 28 0 0 1 28 -28 Z" fill="#eef1f6"/>' +
  '<g fill="#c9a45c"><rect x="62" y="80" width="14" height="32" rx="7"/><rect x="85" y="66" width="14" height="60" rx="7"/>' +
  '<rect x="108" y="74" width="14" height="44" rx="7"/><rect x="131" y="84" width="14" height="24" rx="7"/></g>';
const emb = (S, k) => { const w = S * k; return `<svg x="${(S - w) / 2}" y="${(S - w) / 2}" width="${w}" height="${w}" viewBox="0 0 200 200">${emblem}</svg>`; };
const legacy = S => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${grad}<rect width="${S}" height="${S}" rx="${S * 0.22}" fill="url(#g)"/>` +
  `<rect x="${S * 0.03}" y="${S * 0.03}" width="${S * 0.94}" height="${S * 0.94}" rx="${S * 0.2}" fill="none" stroke="#c9a45c" stroke-width="${Math.max(1, S * 0.025)}"/>${emb(S, 0.9)}</svg>`;
const fg = S => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${emb(S, 0.62)}</svg>`;
const bg = S => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${grad}<rect width="${S}" height="${S}" fill="url(#g)"/></svg>`;
const splash = S => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${emb(S, 0.7)}</svg>`;

const leg = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const ada = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

(async () => {
  const b = await chromium.launch();
  const shot = async (svg, S, file) => {
    const p = await b.newPage({ viewport: { width: S, height: S } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: S, height: S } });
    await p.close();
  };
  for (const [d, S] of Object.entries(leg)) await shot(legacy(S), S, `${OUT}/icon-${d}.png`);
  for (const [d, S] of Object.entries(ada)) { await shot(fg(S), S, `${OUT}/fg-${d}.png`); await shot(bg(S), S, `${OUT}/bg-${d}.png`); }
  await shot(legacy(512), 512, path.join(__dirname, 'icon-512.png'));
  // splash: ora in build_splash.js
  await b.close();
})();
