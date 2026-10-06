'use strict';
/* =====================================================================
   FIGURE: disegni SVG degli oggetti, mano, logo.
   Nessun accesso allo schermo: si carica anche da Node per i test.
   ===================================================================== */

/* ---------- Figure SVG ----------
   Le sfumature stanno una volta sola in SVG_DEFS (inserito nella pagina all'avvio):
   così le figure ripetute (griglia, palco, menu) non hanno id doppi. */

const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="gRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ef7a6f"/><stop offset="1" stop-color="#a8352f"/></linearGradient>
<linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7c95ff"/><stop offset=".55" stop-color="#3f57c9"/><stop offset="1" stop-color="#2a3a8f"/></linearGradient>
<linearGradient id="gYellow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset=".55" stop-color="#f5c431"/><stop offset="1" stop-color="#d9a313"/></linearGradient>
<linearGradient id="gSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5fa"/><stop offset=".5" stop-color="#b9bccb"/><stop offset="1" stop-color="#8a8ea3"/></linearGradient>
<linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf955a"/><stop offset="1" stop-color="#8a5629"/></linearGradient>
<linearGradient id="gWoodTop" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2b07a"/><stop offset="1" stop-color="#c58b50"/></linearGradient>
<linearGradient id="gDoor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a86b3c"/><stop offset=".5" stop-color="#c2834d"/><stop offset="1" stop-color="#93592e"/></linearGradient>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#4f9fe0"/></linearGradient>
<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a6"/><stop offset=".45" stop-color="#f2c744"/><stop offset="1" stop-color="#b9861a"/></linearGradient>
<linearGradient id="gCard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b37a"/><stop offset="1" stop-color="#b8803f"/></linearGradient>
<linearGradient id="gCardSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98447"/><stop offset="1" stop-color="#8d5f2b"/></linearGradient>
<radialGradient id="gFace" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e1ee"/></radialGradient>
<linearGradient id="gClockRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fa3f5"/><stop offset="1" stop-color="#4f52b8"/></linearGradient>
<linearGradient id="gMug" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8f6b"/><stop offset=".6" stop-color="#e5533c"/><stop offset="1" stop-color="#b8392a"/></linearGradient>
<linearGradient id="gBag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fc0b0"/><stop offset="1" stop-color="#1f7f86"/></linearGradient>
<linearGradient id="gBagFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd6c6"/><stop offset="1" stop-color="#2b9a98"/></linearGradient>
<linearGradient id="gSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0c2"/><stop offset="1" stop-color="#e9a979"/></linearGradient>
<linearGradient id="gLilla" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3b5f5"/><stop offset="1" stop-color="#6a6dd6"/></linearGradient>
<radialGradient id="gUnknown" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#3b3960"/><stop offset="1" stop-color="#232138"/></radialGradient>
<linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe5ea"/><stop offset=".62" stop-color="#c3ccd4"/><stop offset=".63" stop-color="#7d9bb3"/><stop offset="1" stop-color="#5d7f99"/></linearGradient>
    <linearGradient id="mSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ad80"/><stop offset="1" stop-color="#c88a5c"/></linearGradient>
    <linearGradient id="mHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b9be"/><stop offset=".5" stop-color="#8d8d93"/><stop offset="1" stop-color="#5e5e64"/></linearGradient>
    <linearGradient id="mLens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a44"/><stop offset="1" stop-color="#0b0b10"/></linearGradient>
    <clipPath id="mClip"><circle cx="50" cy="50" r="50"/></clipPath>
<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fc4e8"/><stop offset=".45" stop-color="#bfe6f7"/><stop offset="1" stop-color="#5aa6d1"/></linearGradient>
<linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b5bd8"/><stop offset="1" stop-color="#1e2a7a"/></linearGradient>
<linearGradient id="gAlu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eaf0"/><stop offset="1" stop-color="#a9acbb"/></linearGradient>
<filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
</defs></svg>`;

const O = 'stroke="#2a2440" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
const SHADOW = '<ellipse cx="50" cy="92" rx="32" ry="4.5" fill="#000" opacity=".28" filter="url(#fSoft)"/>';
const SHINE = 'fill="#fff" opacity=".35"';
const svg = (inner) => '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + SHADOW + inner + '</svg>';

const FIG = {
  book: svg(`
    <rect x="28" y="12" width="50" height="74" rx="4" fill="#f5ecd8" ${O}/>
    <line x1="74" y1="18" x2="74" y2="80" stroke="#d8ccb0" stroke-width="1.5"/>
    <rect x="22" y="9" width="50" height="74" rx="4" fill="url(#gRed)" ${O}/>
    <rect x="22" y="9" width="10" height="74" rx="3" fill="#8b2c27" ${O}/>
    <line x1="22" y1="20" x2="32" y2="20" stroke="#f2c744" stroke-width="2.5"/>
    <line x1="22" y1="72" x2="32" y2="72" stroke="#f2c744" stroke-width="2.5"/>
    <rect x="39" y="24" width="26" height="15" rx="2.5" fill="#fbefcf" ${O}/>
    <line x1="43" y1="30" x2="61" y2="30" stroke="#a8352f" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="43" y1="34.5" x2="56" y2="34.5" stroke="#a8352f" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="35" y="13" width="3" height="66" rx="1.5" ${SHINE}/>`),

  pen: svg(`<g transform="rotate(-40 50 50)">
    <rect x="8" y="44" width="10" height="12" rx="3" fill="#1f2a6b" ${O}/>
    <rect x="16" y="43" width="56" height="14" rx="7" fill="url(#gBlue)" ${O}/>
    <rect x="22" y="37" width="24" height="5" rx="2.5" fill="url(#gSilver)" ${O}/>
    <polygon points="72,44.5 88,50 72,55.5" fill="url(#gSilver)" ${O}/>
    <circle cx="88.5" cy="50" r="1.8" fill="#2a2440"/>
    <rect x="20" y="45.5" width="48" height="3" rx="1.5" ${SHINE}/>
    <rect x="58" y="43" width="4" height="14" fill="#1f2a6b" opacity=".6"/></g>`),

  pencil: svg(`<g transform="rotate(-40 50 50)">
    <rect x="5" y="43" width="11" height="14" rx="4" fill="#f59ab0" ${O}/>
    <rect x="14" y="43" width="9" height="14" fill="url(#gSilver)" ${O}/>
    <line x1="17" y1="43" x2="17" y2="57" stroke="#8a8ea3" stroke-width="1.5"/>
    <line x1="20" y1="43" x2="20" y2="57" stroke="#8a8ea3" stroke-width="1.5"/>
    <rect x="23" y="43" width="50" height="14" fill="url(#gYellow)" ${O}/>
    <line x1="23" y1="47.7" x2="73" y2="47.7" stroke="#d9a313" stroke-width="1.3"/>
    <line x1="23" y1="52.3" x2="73" y2="52.3" stroke="#d9a313" stroke-width="1.3"/>
    <polygon points="73,43 90,50 73,57" fill="#f1d3a4" ${O}/>
    <polygon points="84.5,47.7 90,50 84.5,52.3" fill="#2a2440"/>
    <rect x="25" y="44.5" width="46" height="2.2" rx="1" ${SHINE}/></g>`),

  table: svg(`
    <rect x="25" y="42" width="6" height="34" rx="2" fill="#6b4120" ${O}/>
    <rect x="69" y="42" width="6" height="34" rx="2" fill="#6b4120" ${O}/>
    <polygon points="18,26 82,26 92,36 8,36" fill="url(#gWoodTop)" ${O}/>
    <rect x="8" y="36" width="84" height="9" rx="2" fill="url(#gWood)" ${O}/>
    <rect x="13" y="45" width="8" height="43" rx="2" fill="url(#gWood)" ${O}/>
    <rect x="79" y="45" width="8" height="43" rx="2" fill="url(#gWood)" ${O}/>
    <path d="M30 30 H70" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>`),

  chair: svg(`
    <rect x="31" y="66" width="5" height="18" rx="2" fill="#6b4120" ${O}/>
    <rect x="64" y="66" width="5" height="18" rx="2" fill="#6b4120" ${O}/>
    <rect x="28" y="8" width="44" height="36" rx="6" fill="url(#gWood)" ${O}/>
    <rect x="35" y="15" width="30" height="7" rx="3" fill="#e2b07a" opacity=".8"/>
    <rect x="35" y="27" width="30" height="7" rx="3" fill="#e2b07a" opacity=".8"/>
    <rect x="29" y="42" width="6" height="12" fill="#8a5629" ${O}/>
    <rect x="65" y="42" width="6" height="12" fill="#8a5629" ${O}/>
    <polygon points="26,52 74,52 80,60 20,60" fill="url(#gWoodTop)" ${O}/>
    <rect x="20" y="60" width="60" height="7" rx="2" fill="url(#gWood)" ${O}/>
    <rect x="22" y="67" width="7" height="23" rx="2" fill="url(#gWood)" ${O}/>
    <rect x="71" y="67" width="7" height="23" rx="2" fill="url(#gWood)" ${O}/>`),

  door: svg(`
    <rect x="21" y="5" width="58" height="87" rx="2" fill="#5b3a20" ${O}/>
    <rect x="26" y="9" width="48" height="83" fill="url(#gDoor)" ${O}/>
    <rect x="32" y="16" width="36" height="27" rx="2" fill="#93592e" opacity=".55" ${O}/>
    <rect x="32" y="50" width="36" height="34" rx="2" fill="#93592e" opacity=".55" ${O}/>
    <rect x="35" y="19" width="3" height="21" rx="1.5" ${SHINE}/>
    <rect x="35" y="53" width="3" height="28" rx="1.5" ${SHINE}/>
    <circle cx="67" cy="47" r="4.5" fill="url(#gGold)" ${O}/>
    <circle cx="65.8" cy="45.8" r="1.3" fill="#fff" opacity=".8"/>`),

  window: svg(`
    <rect x="12" y="8" width="76" height="76" rx="4" fill="#f1f1f7" ${O}/>
    <rect x="18" y="14" width="29" height="64" rx="2" fill="url(#gSky)" ${O}/>
    <rect x="53" y="14" width="29" height="64" rx="2" fill="url(#gSky)" ${O}/>
    <path d="M58 30 a6 6 0 0 1 11 -2 a5 5 0 0 1 8 4 a4 4 0 0 1 -1 8 h-17 a5 5 0 0 1 -1 -10z" fill="#fff" opacity=".9"/>
    <polygon points="22,40 38,18 44,18 22,48" ${SHINE}/>
    <polygon points="57,66 73,44 77,44 57,72" ${SHINE}/>
    <rect x="6" y="83" width="88" height="8" rx="3" fill="#dcdbe8" ${O}/>`),

  key: svg(`<g transform="rotate(-20 50 50)">
    <rect x="40" y="45" width="50" height="10" rx="3" fill="url(#gGold)" ${O}/>
    <path d="M66 55 v11 h6 v-6 h5 v8 h6 v-13" fill="url(#gGold)" ${O}/>
    <circle cx="27" cy="50" r="18" fill="url(#gGold)" ${O}/>
    <circle cx="27" cy="50" r="7" fill="#211f33" ${O}/>
    <path d="M15 43 a14 14 0 0 1 9 -8" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>
    <rect x="46" y="46.5" width="38" height="2.4" rx="1.2" ${SHINE}/></g>`),

  box: svg(`
    <polygon points="14,38 62,38 62,88 14,88" fill="url(#gCard)" ${O}/>
    <polygon points="62,38 86,24 86,74 62,88" fill="url(#gCardSide)" ${O}/>
    <polygon points="14,38 38,24 86,24 62,38" fill="#ecc28c" ${O}/>
    <polygon points="14,38 4,26 28,14 38,24" fill="#d9a568" ${O}/>
    <polygon points="62,38 86,24 96,34 72,48" fill="#c99351" ${O}/>
    <polygon points="31,38 42,38 42,58 31,58" fill="#f3e2c2" opacity=".85"/>
    <polygon points="31,38 55,24 66,24 42,38" fill="#f3e2c2" opacity=".85"/>
    <line x1="20" y1="76" x2="40" y2="76" stroke="#8d5f2b" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="81" x2="32" y2="81" stroke="#8d5f2b" stroke-width="2" stroke-linecap="round"/>`),

  clock: svg(`
    <circle cx="50" cy="48" r="40" fill="url(#gClockRim)" ${O}/>
    <circle cx="50" cy="48" r="32" fill="url(#gFace)" ${O}/>
    <g stroke="#2a2440" stroke-width="2.5" stroke-linecap="round">
      <line x1="50" y1="20" x2="50" y2="25"/><line x1="78" y1="48" x2="73" y2="48"/>
      <line x1="50" y1="76" x2="50" y2="71"/><line x1="22" y1="48" x2="27" y2="48"/></g>
    <g fill="#6a6dd6"><circle cx="64" cy="23.8" r="1.5"/><circle cx="74.2" cy="34" r="1.5"/><circle cx="74.2" cy="62" r="1.5"/>
      <circle cx="64" cy="72.2" r="1.5"/><circle cx="36" cy="72.2" r="1.5"/><circle cx="25.8" cy="62" r="1.5"/>
      <circle cx="25.8" cy="34" r="1.5"/><circle cx="36" cy="23.8" r="1.5"/></g>
    <line x1="50" y1="48" x2="50" y2="29" stroke="#2a2440" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="48" x2="65" y2="56" stroke="#2a2440" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="48" x2="38" y2="66" stroke="#e5533c" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="4" fill="#e5533c" ${O}/>
    <path d="M24 34 a30 30 0 0 1 16 -14" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`),

  cup: svg(`
    <ellipse cx="46" cy="86" rx="36" ry="6" fill="#e9e8f2" ${O}/>
    <path d="M68 42 h6 a12 12 0 0 1 0 24 h-6" fill="none" stroke="#2a2440" stroke-width="9" stroke-linecap="round"/>
    <path d="M68 42 h6 a12 12 0 0 1 0 24 h-6" fill="none" stroke="#e5533c" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M20 34 H72 V68 a14 14 0 0 1 -14 14 H34 a14 14 0 0 1 -14 -14 Z" fill="url(#gMug)" ${O}/>
    <ellipse cx="46" cy="34" rx="26" ry="5" fill="#6b3a22" ${O}/>
    <rect x="26" y="42" width="5" height="30" rx="2.5" ${SHINE}/>
    <g class="steam" fill="none" stroke="#d8d6e8" stroke-width="3" stroke-linecap="round" opacity=".85">
      <path d="M37 24 q5 -6 0 -12 q-5 -6 0 -10"/><path d="M55 24 q5 -6 0 -12 q-5 -6 0 -10"/></g>`),

  bottle: svg(`
    <rect x="42" y="6" width="16" height="9" rx="2.5" fill="#e5533c" ${O}/>
    <path d="M44 15 h12 v14 c0 4 14 9 14 22 v32 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6 v-32 c0 -13 14 -18 14 -22 z" fill="url(#gGlass)" ${O}/>
    <path d="M30 60 h40 v16 h-40 z" fill="#f4f1e6" ${O}/>
    <path d="M30 70 q10 -5 20 0 t20 0 v13 a6 6 0 0 1 -6 6 h-28 a6 6 0 0 1 -6 -6 z" fill="#4f9fe0" opacity=".55"/>
    <line x1="38" y1="66" x2="62" y2="66" stroke="#8c8fe8" stroke-width="3" stroke-linecap="round"/>
    <rect x="36" y="36" width="4" height="22" rx="2" ${SHINE}/>`),

  computer: svg(`
    <rect x="16" y="14" width="68" height="48" rx="5" fill="url(#gAlu)" ${O}/>
    <rect x="21" y="19" width="58" height="38" rx="2" fill="url(#gScreen)"/>
    <rect x="27" y="26" width="26" height="4" rx="2" fill="#a9abf2" opacity=".9"/>
    <rect x="27" y="34" width="40" height="3" rx="1.5" fill="#fff" opacity=".45"/>
    <rect x="27" y="40" width="34" height="3" rx="1.5" fill="#fff" opacity=".45"/>
    <rect x="27" y="46" width="22" height="3" rx="1.5" fill="#fff" opacity=".45"/>
    <polygon points="21,19 44,19 21,44" fill="#fff" opacity=".12"/>
    <path d="M8 64 h84 l-6 14 a4 4 0 0 1 -4 3 h-64 a4 4 0 0 1 -4 -3 z" fill="url(#gAlu)" ${O}/>
    <rect x="40" y="66" width="20" height="4" rx="2" fill="#a9acbb"/>
    <line x1="18" y1="74" x2="82" y2="74" stroke="#c9cbd6" stroke-width="2"/>`),

  bag: svg(`
    <path d="M36 32 V24 a14 14 0 0 1 28 0 V32" fill="none" stroke="#2a2440" stroke-width="9" stroke-linecap="round"/>
    <path d="M36 32 V24 a14 14 0 0 1 28 0 V32" fill="none" stroke="#2b9a98" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="12" y="30" width="76" height="58" rx="12" fill="url(#gBag)" ${O}/>
    <path d="M12 44 a12 12 0 0 1 12 -14 H76 a12 12 0 0 1 12 14 V58 H12 Z" fill="url(#gBagFlap)" ${O}/>
    <rect x="42" y="52" width="16" height="13" rx="3" fill="url(#gGold)" ${O}/>
    <rect x="47" y="56" width="6" height="5" rx="1.5" fill="#2a2440"/>
    <rect x="18" y="35" width="40" height="3" rx="1.5" ${SHINE}/>
    <line x1="22" y1="68" x2="22" y2="82" stroke="#1f7f86" stroke-width="2" stroke-dasharray="3 3"/>
    <line x1="78" y1="68" x2="78" y2="82" stroke="#1f7f86" stroke-width="2" stroke-dasharray="3 3"/>`)
};

const HAND = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="36" width="16" height="38" rx="4" fill="url(#gLilla)" ${O}/>
  <rect x="38" y="37" width="56" height="14" rx="7" fill="url(#gSkin)" ${O}/>
  <rect x="84" y="39.5" width="7" height="9" rx="3" fill="#fff" opacity=".55"/>
  <rect x="13" y="33" width="40" height="44" rx="13" fill="url(#gSkin)" ${O}/>
  <path d="M27 56 H49 M27 66 H47" ${O} fill="none"/>
  <path d="M20 40 a10 10 0 0 1 8 -4" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/></svg>`;

const UNKNOWN = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="url(#gUnknown)" stroke="#8c8fe8" stroke-width="3"/>
  <text x="50" y="67" font-size="48" font-family="Arial, sans-serif" font-weight="bold" fill="#8c8fe8" text-anchor="middle">?</text></svg>`;

// Ritratti degli insegnanti (gli altri hanno l'iniziale). Mass: cartoon dalla foto di Papa.
const AVATARS = {
  mass: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">   <g clip-path="url(#mClip)">   <rect width="100" height="100" fill="url(#mSky)"/>   <path d="M70 63 q10 -3 30 -2 v2 h-30z" fill="#9aa9b4"/>   <!-- giacca e camicia -->   <path d="M6 100 C10 86 22 80 36 77 L50 92 L64 77 C78 80 90 86 94 100 Z" fill="#1c1c22" stroke="#0d0d12" stroke-width="1.5"/>   <path d="M38 77 L50 97 L62 77 L56 74 L50 84 L44 74 Z" fill="#f4f4f6" stroke="#2a2440" stroke-width="1.2" stroke-linejoin="round"/>   <path d="M36 77 L45 90 L41 78 Z M64 77 L55 90 L59 78 Z" fill="#2b2b33"/>   <!-- collo -->   <path d="M42 66 h16 v10 l-8 8 l-8 -8 z" fill="#c4865a"/>   <!-- orecchie -->   <ellipse cx="28.5" cy="50" rx="4" ry="6.5" fill="#d29a6d" stroke="#2a2440" stroke-width="1.5"/>   <ellipse cx="71.5" cy="50" rx="4" ry="6.5" fill="#d29a6d" stroke="#2a2440" stroke-width="1.5"/>   <!-- viso -->   <path d="M29 43 C29 25 71 25 71 43 C72 62 64 76 50 77 C36 76 28 62 29 43 Z" fill="url(#mSkin)" stroke="#2a2440" stroke-width="1.8"/>   <!-- capelli sale e pepe, all'indietro con ciuffo -->   <path d="M28 46 C25 31 31 19 44 15 C50 11 60 12 65 17 C73 21 76 33 72 46 C71 40 70 35 67 31 C62 27 55 26 48 27 C40 27 35 29 32 33 C30 37 29 41 28 46 Z" fill="url(#mHair)" stroke="#2a2440" stroke-width="1.8" stroke-linejoin="round"/>   <path d="M34 26 q7 -7 16 -7 M45 17 q9 -3 16 2 M57 21 q7 1 10 7" stroke="#e8e8ec" stroke-width="1.7" fill="none" stroke-linecap="round"/>   <path d="M40 24 q6 -3 12 -2 M52 15 q-3 3 -2 7" stroke="#606067" stroke-width="1.3" fill="none" stroke-linecap="round"/>   <path d="M28.5 44 q1 -6 2.5 -9 M71.5 44 q-1 -6 -2.5 -9" stroke="#e8e8ec" stroke-width="1.4" fill="none" stroke-linecap="round"/>   <!-- occhiali da sole -->   <path d="M30 41 L70 41" stroke="#0b0b10" stroke-width="2.4" stroke-linecap="round"/>   <path d="M32 41 h15 a1.5 1.5 0 0 1 1.5 1.5 c0 6 -3 9 -8.5 9 c-6 0 -8.5 -4 -8.5 -9 a1.5 1.5 0 0 1 0.5 -1.5z" fill="url(#mLens)" stroke="#0b0b10" stroke-width="1.6"/>   <path d="M53 41 h15 a1.5 1.5 0 0 1 1 1.5 c0 5 -2.5 9 -8.5 9 c-5.5 0 -8.5 -3 -8.5 -9 a1.5 1.5 0 0 1 1 -1.5z" fill="url(#mLens)" stroke="#0b0b10" stroke-width="1.6"/>   <path d="M35 44 l4 -1.5 M56 44 l4 -1.5" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>   <path d="M30 42 L28 47 M70 42 L72 47" stroke="#0b0b10" stroke-width="1.8" stroke-linecap="round"/>   <!-- naso -->   <path d="M50 49 q-1 6 -4 9 q3 1.5 7 0" fill="none" stroke="#9b6440" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>   <!-- barba corta grigia (pizzetto e baffi) -->   <path d="M37 62 C39 71 44 76.5 50 77 C56 76.5 61 71 63 62 C61 70 57 73.5 50 73.5 C43 73.5 39 70 37 62 Z" fill="#b8b8be"/>   <path d="M41 60.5 C45 57.5 55 57.5 59 60.5 C55 59.5 45 59.5 41 60.5 Z" fill="#8f8f96" stroke="#6c6c73" stroke-width="1"/>   <!-- sorriso largo con denti -->   <path d="M38.5 60.5 Q50 62.5 61.5 60.5 Q60 71 50 71.5 Q40 71 38.5 60.5 Z" fill="#5a2a2a" stroke="#2a2440" stroke-width="1.6" stroke-linejoin="round"/>   <path d="M39.5 61 Q50 63 60.5 61 Q60 65.5 50 66 Q40 65.5 39.5 61 Z" fill="#fff"/>   <path d="M44.5 61.8 v3.6 M48.3 62.3 v3.7 M51.9 62.3 v3.7 M55.6 61.8 v3.6" stroke="#d4d4da" stroke-width="0.8"/>   <!-- pieghe del sorriso -->   <path d="M36 57 q-1.5 4 1 7.5 M64 57 q1.5 4 -1 7.5" fill="none" stroke="#9b6440" stroke-width="1.4" stroke-linecap="round"/>  </g>  <circle cx="50" cy="50" r="48.5" fill="none" stroke="#8c8fe8" stroke-width="3"/> </svg>`
};

// Icone che accompagnano la parola dell'errore di ogni insegnante
const MARKS = {
  // «Errato.» — X rossa secca
  wrong: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="84" height="84" rx="18" fill="#e5484d" ${O}/>
    <path d="M32 32 L68 68 M68 32 L32 68" stroke="#fff" stroke-width="13" stroke-linecap="round"/></svg>`,
  // «Non corretto.» — divieto
  notcorrect: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" fill="#fff" ${O}/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#e5484d" stroke-width="11"/><path d="M26 26 L74 74" stroke="#e5484d" stroke-width="11"/></svg>`,
  // «Hai sbagliato.» — pollice verso
  mistake: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" fill="#f0b429" ${O}/>
    <g transform="rotate(180 50 50)"><path d="M30 46 h10 v30 h-10 z" fill="#fff" ${O}/>
    <path d="M40 48 l12 -20 a6 6 0 0 1 10 4 l-3 12 h13 a6 6 0 0 1 6 7 l-4 20 a7 7 0 0 1 -7 5 H40 z" fill="#fff" ${O}/></g></svg>`,
  // «Peccato.» — faccina dispiaciuta
  pity: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="42" fill="#ffd45c" ${O}/>
    <circle cx="36" cy="42" r="5" fill="#2a2440"/><circle cx="64" cy="42" r="5" fill="#2a2440"/>
    <path d="M34 70 q16 -12 32 0" fill="none" stroke="#2a2440" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 32 l10 -4 M72 32 l-10 -4" stroke="#2a2440" stroke-width="4" stroke-linecap="round"/></svg>`
};

// Segnali sul palco: «?» = è una domanda, rispondi; frecce che girano = ripeti la frase;
// pollice in su verde = giusto.
// In italiano la domanda si sente solo dall'intonazione: il segnale la rende chiara.
const CUES = {
  // «tocca una figura e fai tu la domanda»
  pick: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="url(#gLilla)" stroke="#fff" stroke-width="4"/>
    <circle cx="44" cy="34" r="12" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
    <path d="M40 34 v28 l-7 -6 a5 5 0 0 0 -7 7 l14 16 h22 l5 -18 v-12 a4 4 0 0 0 -8 0 v-2 a4 4 0 0 0 -8 0 v-1 a4 4 0 0 0 -8 0 v-12 a3.5 3.5 0 0 0 -3 -0 z" fill="#fff" stroke="#2a2440" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  ok: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#34a847" stroke="#fff" stroke-width="4"/>
    <rect x="22" y="44" width="15" height="34" rx="3" fill="#fff"/>
    <path d="M41 46 L52 24 C54 19 61 20 61 26 L59 40 L74 40 C80 40 83 45 82 50 L78 71 C77 76 73 79 68 79 L41 79 Z" fill="#fff"/></svg>`,
  q: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="url(#gLilla)" stroke="#fff" stroke-width="4"/>
    <text x="50" y="72" font-size="66" font-family="Arial, sans-serif" font-weight="900" fill="#fff" text-anchor="middle">?</text></svg>`,
  r: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#2e2b4a" stroke="#8c8fe8" stroke-width="4"/>
    <path d="M30 44 a21 21 0 0 1 38 -8" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M72 22 l-2 18 l-17 -5 z" fill="#fff"/>
    <path d="M70 56 a21 21 0 0 1 -38 8" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M28 78 l2 -18 l17 5 z" fill="#fff"/></svg>`
};

// Logo nel menu: fumetto con le onde della voce
const LOGO = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="46" fill="url(#gLilla)"/>
  <path d="M58 44 H142 a28 28 0 0 1 28 28 V112 a28 28 0 0 1 -28 28 H96 L62 168 L68 140 H58 a28 28 0 0 1 -28 -28 V72 a28 28 0 0 1 28 -28 Z" fill="#fff"/>
  <g fill="#6a6dd6"><rect x="62" y="80" width="14" height="32" rx="7"/><rect x="85" y="66" width="14" height="60" rx="7"/>
  <rect x="108" y="74" width="14" height="44" rx="7"/><rect x="131" y="84" width="14" height="24" rx="7"/></g></svg>`;

