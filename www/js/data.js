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

// Oggetti in stile piatto e sobrio (adulti, business): niente contorni, colori smorzati
const FLAT = (inner, w) => '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="91" rx="' + (w || 30) + '" ry="3" fill="#000" opacity=".25"/>' + inner + '</svg>';
// Oggetti colorabili (lezione 5 e seguenti): [colore, ombra]
const COL_SHADE = { nero: ['#2b2e36', '#17181d'], bianco: ['#eceef2', '#c4cad4'], rosso: ['#b3262f', '#861b22'] };
const CFIG = {
  phone: ([c, d]) => FLAT(`<rect x="30" y="8" width="40" height="80" rx="7" fill="${c}" stroke="${d}" stroke-width="1.5"/><rect x="33.5" y="15" width="33" height="64" rx="2" fill="#2c3e66"/>
    <path d="M33.5 15 h20 l-20 26z" fill="#3a4f7e"/><rect x="44" y="10.5" width="12" height="2" rx="1" fill="${d}"/><circle cx="50" cy="83.5" r="2.2" fill="${d}"/>`, 22),
  laptop: ([c, d]) => FLAT(`<rect x="18" y="16" width="64" height="44" rx="3" fill="${c}" stroke="${d}" stroke-width="1.5"/><rect x="22" y="20" width="56" height="36" fill="#2c3e66"/>
    <path d="M22 20 h30 l-30 22z" fill="#3a4f7e"/><path d="M8 62 h84 l-6 12 h-72z" fill="${c}" stroke="${d}" stroke-width="1.5"/><rect x="42" y="64" width="16" height="3" rx="1.5" fill="${d}"/>`, 40),
  coat: ([c, d]) => FLAT(`<path d="M38 10 h24 l16 8 l8 30 l-8 3 l-4 -16 v51 h-48 v-51 l-4 16 l-8 -3 l8 -30z" fill="${c}" stroke="${d}" stroke-width="1.5"/>
    <path d="M38 10 l12 16 l12 -16" fill="none" stroke="${d}" stroke-width="2"/><path d="M50 26 v60" stroke="${d}" stroke-width="1.5"/>
    <circle cx="54" cy="40" r="1.8" fill="${d}"/><circle cx="54" cy="54" r="1.8" fill="${d}"/><circle cx="54" cy="68" r="1.8" fill="${d}"/>
    <path d="M30 60 h12 M58 60 h12" stroke="${d}" stroke-width="1.5"/>`, 30),
  suitcase: ([c, d]) => FLAT(`<path d="M44 6 h12 v16 h-3 v-13 h-6 v13 h-3z" fill="#8d93a3"/><rect x="26" y="22" width="48" height="62" rx="6" fill="${c}" stroke="${d}" stroke-width="1.5"/>
    <path d="M38 26 v54 M50 26 v54 M62 26 v54" stroke="${d}" stroke-width="2" opacity=".7"/>
    <circle cx="34" cy="88" r="3.5" fill="#2a3040"/><circle cx="66" cy="88" r="3.5" fill="#2a3040"/>`, 26),
  flask: ([c, d]) => FLAT(`<rect x="41" y="6" width="18" height="10" rx="3" fill="#8d93a3"/><rect x="43" y="15" width="14" height="5" fill="#b9bdc8"/>
    <path d="M38 20 h24 q6 0 6 8 v54 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 v-54 q0 -8 6 -8z" fill="${c}" stroke="${d}" stroke-width="1.5"/>
    <rect x="35" y="30" width="5" height="44" rx="2.5" fill="#fff" opacity=".18"/>`, 20),
  cup: ([c, d]) => FLAT(`<ellipse cx="48" cy="84" rx="34" ry="6" fill="${d}"/><path d="M22 40 h52 l-5 38 a6 6 0 0 1 -6 5 h-30 a6 6 0 0 1 -6 -5z" fill="${c}" stroke="${d}" stroke-width="1.2"/>
    <path d="M73 48 h6 a9 9 0 0 1 0 18 h-8" fill="none" stroke="${c}" stroke-width="5"/><ellipse cx="48" cy="40" rx="26" ry="5" fill="#5a3826"/>`, 34)
};

const FIG = {
  book: FLAT(`<path d="M30 14 h44 a3 3 0 0 1 3 3 v68 a3 3 0 0 1 -3 3 h-44z" fill="#ece4d2"/>
    <path d="M74 18 v66 M71 18 v66" stroke="#d4c9b0" stroke-width="1"/>
    <path d="M24 11 h46 a3 3 0 0 1 3 3 v69 a3 3 0 0 1 -3 3 h-46z" fill="#2c3e66"/><path d="M24 11 h8 v75 h-8z" fill="#223152"/>
    <rect x="40" y="26" width="24" height="2" fill="#c9a45c"/><rect x="44" y="31" width="16" height="1.4" fill="#c9a45c" opacity=".7"/>`),
  pen: FLAT(`<g transform="rotate(-35 50 50)"><rect x="12" y="46" width="62" height="9" rx="4.5" fill="#1f2433"/><rect x="12" y="46" width="62" height="3" rx="1.5" fill="#3a4258"/>
    <path d="M74 46.5 L88 50.5 L74 54.5z" fill="#b9bdc8"/><circle cx="88" cy="50.5" r="1.2" fill="#2a2a2a"/>
    <rect x="20" y="42" width="26" height="3" rx="1.5" fill="#c9a45c"/><rect x="18" y="46" width="3" height="9" fill="#c9a45c"/></g>`),
  pencil: FLAT(`<g transform="rotate(-35 50 50)"><rect x="8" y="45" width="10" height="11" rx="2" fill="#b56b6b"/><rect x="17" y="45" width="7" height="11" fill="#b9bdc8"/>
    <rect x="24" y="45" width="48" height="11" fill="#d4b06a"/><rect x="24" y="48.6" width="48" height="3.6" fill="#c19a52"/>
    <path d="M72 45 L88 50.5 L72 56z" fill="#e2c9a0"/><path d="M83 48.8 L88 50.5 L83 52.2z" fill="#2a2a2a"/></g>`),
  table: FLAT(`<path d="M14 34 h72 l6 8 h-84z" fill="#b58a5e"/><rect x="8" y="42" width="84" height="6" fill="#8e6741"/>
    <rect x="14" y="48" width="5" height="42" fill="#7a5735"/><rect x="81" y="48" width="5" height="42" fill="#7a5735"/>
    <rect x="26" y="48" width="4" height="34" fill="#664729"/><rect x="70" y="48" width="4" height="34" fill="#664729"/>`, 38),
  chair: FLAT(`<rect x="30" y="10" width="40" height="32" rx="3" fill="#8e6741"/><rect x="34" y="16" width="32" height="4" fill="#a37a52"/><rect x="34" y="26" width="32" height="4" fill="#a37a52"/>
    <rect x="31" y="42" width="5" height="16" fill="#7a5735"/><rect x="64" y="42" width="5" height="16" fill="#7a5735"/>
    <path d="M26 56 h48 l4 7 h-56z" fill="#b58a5e"/><rect x="22" y="63" width="56" height="5" fill="#8e6741"/>
    <rect x="25" y="68" width="5" height="22" fill="#7a5735"/><rect x="70" y="68" width="5" height="22" fill="#7a5735"/>`, 26),
  door: FLAT(`<rect x="22" y="6" width="56" height="85" fill="#4a3628"/><rect x="27" y="10" width="46" height="81" fill="#8e6741"/>
    <rect x="33" y="17" width="34" height="26" fill="#7a5735"/><rect x="33" y="50" width="34" height="34" fill="#7a5735"/>
    <circle cx="66" cy="47" r="3.2" fill="#c9a45c"/>`, 32),
  window: FLAT(`<rect x="12" y="8" width="76" height="76" rx="2" fill="#dfe4ea"/>
    <rect x="18" y="14" width="29" height="64" fill="#5d7f99"/><rect x="53" y="14" width="29" height="64" fill="#5d7f99"/>
    <path d="M18 14 h29 v20 l-29 22z M53 14 h29 v12 l-29 26z" fill="#7d9bb3"/>
    <rect x="6" y="83" width="88" height="6" fill="#c8ced6"/>`, 40),
  key: FLAT(`<g transform="rotate(-20 50 50)"><rect x="40" y="46" width="50" height="8" rx="2" fill="#c9a45c"/>
    <path d="M66 54 v10 h5 v-5 h5 v7 h5 v-12z" fill="#b8923f"/>
    <circle cx="27" cy="50" r="17" fill="#c9a45c"/><circle cx="27" cy="50" r="7" fill="#161d2b"/><path d="M14 44 a14 14 0 0 1 8 -8" stroke="#e0c287" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`),
  box: FLAT(`<path d="M14 38 h48 v50 h-48z" fill="#b58a5e"/><path d="M62 38 l24 -14 v50 l-24 14z" fill="#8e6741"/>
    <path d="M14 38 l24 -14 h48 l-24 14z" fill="#c9a073"/><path d="M31 38 l24 -14 h9 l-24 14z M31 38 h9 v18 h-9z" fill="#d8c29a"/>`, 36),
  clock: FLAT(`<circle cx="50" cy="48" r="38" fill="#3a4258"/><circle cx="50" cy="48" r="32" fill="#ece4d2"/>
    <path d="M50 20 v6 M50 70 v6 M22 48 h6 M72 48 h6" stroke="#3a4258" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 48 V31 M50 48 L63 56" stroke="#1f2433" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="48" r="3" fill="#a3263a"/>`),
  cup: FLAT(`<ellipse cx="48" cy="84" rx="34" ry="6" fill="#c8ced6"/>
    <path d="M22 40 h52 l-5 38 a6 6 0 0 1 -6 5 h-30 a6 6 0 0 1 -6 -5z" fill="#e9edf2"/>
    <path d="M73 48 h6 a9 9 0 0 1 0 18 h-8" fill="none" stroke="#e9edf2" stroke-width="5"/>
    <ellipse cx="48" cy="40" rx="26" ry="5" fill="#5a3826"/><path d="M25 52 h46" stroke="#c9a45c" stroke-width="2"/>`, 34),
  bottle: FLAT(`<rect x="42" y="6" width="16" height="9" rx="2" fill="#2c3e66"/><path d="M43 15 h14 v8 q12 6 12 18 v42 a6 6 0 0 1 -6 6 h-26 a6 6 0 0 1 -6 -6 v-42 q0 -12 12 -18z" fill="#8fb0c4"/>
    <path d="M37 40 q0 -8 6 -12 v56 h-6z" fill="#b5ccda"/><rect x="31" y="50" width="38" height="20" fill="#ece4d2"/><rect x="38" y="57" width="24" height="2.5" fill="#2c3e66"/>`, 22),
  computer: FLAT(`<rect x="18" y="16" width="64" height="44" rx="3" fill="#2a3040"/><rect x="22" y="20" width="56" height="36" fill="#2c3e66"/>
    <path d="M22 20 h30 l-30 22z" fill="#3a4f7e"/><path d="M8 62 h84 l-6 12 h-72z" fill="#b9bdc8"/><rect x="42" y="64" width="16" height="3" rx="1.5" fill="#8d93a3"/>`, 40),
  bag: FLAT(`<path d="M38 26 a6 6 0 0 1 6 -6 h12 a6 6 0 0 1 6 6 v6 h-5 v-6 a1.5 1.5 0 0 0 -1.5 -1.5 h-11 a1.5 1.5 0 0 0 -1.5 1.5 v6 h-5z" fill="#3a2a20"/>
    <rect x="14" y="32" width="72" height="54" rx="5" fill="#6b4430"/><rect x="14" y="32" width="72" height="20" rx="5" fill="#5a3826"/>
    <rect x="44" y="47" width="12" height="9" rx="1.5" fill="#c9a45c"/>`, 38),
  phone: FLAT(`<rect x="30" y="8" width="40" height="80" rx="7" fill="#1f2433"/><rect x="33.5" y="15" width="33" height="64" rx="2" fill="#2c3e66"/>
    <path d="M33.5 15 h20 l-20 26z" fill="#3a4f7e"/><rect x="44" y="10.5" width="12" height="2" rx="1" fill="#3a4258"/><circle cx="50" cy="83.5" r="2.2" fill="#3a4258"/>`, 22),
  notebook: FLAT(`<rect x="24" y="14" width="52" height="74" rx="3" fill="#ece4d2"/><rect x="22" y="12" width="52" height="74" rx="3" fill="#8a3a3a"/>
    <path d="M30 8 v10 M38 8 v10 M46 8 v10 M54 8 v10 M62 8 v10 M70 8 v10" stroke="#b9bdc8" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="32" y="30" width="32" height="14" rx="1.5" fill="#ece4d2"/><path d="M36 35 h24 M36 39 h16" stroke="#8a3a3a" stroke-width="1.6"/>`, 28),
  laptop: '', coat: '', suitcase: '', flask: '',
  umbrella: FLAT(`<path d="M50 14 a38 30 0 0 1 38 30 q-6.3 -5 -12.7 0 q-6.3 -5 -12.6 0 q-6.4 -5 -12.7 0 q-6.3 -5 -12.7 0 q-6.3 -5 -12.6 0 q-6.4 -5 -12.7 0 a38 30 0 0 1 38 -30z" fill="#2c3e66"/>
    <path d="M50 14 q-12 12 -12.7 30 q6.3 -5 12.7 0 q6.3 -5 12.7 0 q-.7 -18 -12.7 -30z" fill="#3a4f7e"/>
    <rect x="48.6" y="8" width="2.8" height="7" rx="1.4" fill="#c9a45c"/>
    <path d="M50 44 V80 q0 7 -7 7 q-6 0 -6 -6" fill="none" stroke="#5a3826" stroke-width="3.4" stroke-linecap="round"/>`, 30),
  // lezione 16: un ombrello, un'agenda, un'arancia, uno zaino, uno specchio
  agenda: FLAT(`<rect x="25" y="12" width="52" height="76" rx="4" fill="#ece4d2"/><rect x="22" y="10" width="52" height="76" rx="4" fill="#2e2f37"/>
    <rect x="22" y="10" width="10" height="76" rx="4" fill="#24252c"/><rect x="62" y="10" width="4" height="76" fill="#c9a45c"/>
    <rect x="38" y="26" width="20" height="10" rx="1.5" fill="#ece4d2"/><path d="M42 31 h12" stroke="#2e2f37" stroke-width="1.6"/><path d="M50 86 v8 l3 -3 l3 3 v-8" fill="#a3263a"/>`, 28),
  orange: FLAT(`<circle cx="50" cy="56" r="31" fill="#e8862a"/><circle cx="40" cy="46" r="9" fill="#f2a54a" opacity=".7"/>
    <circle cx="60" cy="66" r="1.2" fill="#c96f1e"/><circle cx="66" cy="54" r="1.2" fill="#c96f1e"/><circle cx="54" cy="74" r="1.2" fill="#c96f1e"/><circle cx="38" cy="66" r="1.2" fill="#c96f1e"/>
    <path d="M50 26 q1 -6 5 -9" stroke="#5a3826" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54 21 q12 -11 22 -3 q-11 9 -22 3z" fill="#5a9a46"/>`, 26),
  backpack: FLAT(`<path d="M40 22 v-6 a10 10 0 0 1 20 0 v6" fill="none" stroke="#24345a" stroke-width="4"/>
    <rect x="25" y="20" width="50" height="68" rx="13" fill="#3a4f7e"/><path d="M25 42 h50" stroke="#2c3e66" stroke-width="2"/>
    <rect x="32" y="54" width="36" height="26" rx="6" fill="#2c3e66"/><rect x="45" y="58" width="10" height="3" rx="1.5" fill="#c9a45c"/>
    <path d="M44 30 h12" stroke="#c9a45c" stroke-width="2.4" stroke-linecap="round"/>`, 28),
  mirror: FLAT(`<rect x="46" y="66" width="8" height="22" rx="3" fill="#b8924c"/><ellipse cx="50" cy="40" rx="25" ry="30" fill="#c9a45c"/>
    <ellipse cx="50" cy="40" rx="20" ry="25" fill="#9fbcd0"/><path d="M38 30 l10 -9 M37 42 l20 -18" stroke="#e8f1f7" stroke-width="3" stroke-linecap="round"/>`, 20),
  lamp: FLAT(`<ellipse cx="50" cy="86" rx="20" ry="4" fill="#2a3040"/><rect x="47" y="56" width="5" height="30" fill="#3a4258"/>
    <path d="M49 58 L36 34" stroke="#3a4258" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 34 l14 -22 l22 14 l-10 14z" fill="#c9a45c"/><path d="M40 40 l10 -14 l10 6 z" fill="#e0c287" opacity=".35"/>
    <path d="M46 44 l10 14 l6 -4z" fill="#f3dfa8" opacity=".35"/>`, 24)
};

const HAND = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="36" width="16" height="38" rx="4" fill="url(#gLilla)" ${O}/>
  <rect x="38" y="37" width="56" height="14" rx="7" fill="url(#gSkin)" ${O}/>
  <rect x="84" y="39.5" width="7" height="9" rx="3" fill="#fff" opacity=".55"/>
  <rect x="13" y="33" width="40" height="44" rx="13" fill="url(#gSkin)" ${O}/>
  <path d="M27 56 H49 M27 66 H47" ${O} fill="none"/>
  <path d="M20 40 a10 10 0 0 1 8 -4" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/></svg>`;

const UNKNOWN = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="38" fill="#1d2638" stroke="#2a3448" stroke-width="2"/>
  <text x="50" y="66" font-size="46" font-family="Georgia, 'Times New Roman', serif" fill="#c9a45c" text-anchor="middle">?</text></svg>`;

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
  pick: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="none" stroke="#c9a45c" stroke-width="4"/>
    <path d="M40 34 v28 l-7 -6 a5 5 0 0 0 -7 7 l14 16 h22 l5 -18 v-12 a4 4 0 0 0 -8 0 v-2 a4 4 0 0 0 -8 0 v-1 a4 4 0 0 0 -8 0 v-12 a3.5 3.5 0 0 0 -3 0 z" fill="#c9a45c"/></svg>`,
  ok: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#34a847" stroke="#fff" stroke-width="4"/>
    <rect x="22" y="44" width="15" height="34" rx="3" fill="#fff"/>
    <path d="M41 46 L52 24 C54 19 61 20 61 26 L59 40 L74 40 C80 40 83 45 82 50 L78 71 C77 76 73 79 68 79 L41 79 Z" fill="#fff"/></svg>`,
  // «?» d'oro senza cerchio: sta tra l'insegnante e l'oggetto, così non copre niente
  q: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <text x="40" y="86" font-size="104" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="#c9a45c" text-anchor="middle">?</text></svg>`,
  r: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="#2e2b4a" stroke="#8c8fe8" stroke-width="4"/>
    <path d="M30 44 a21 21 0 0 1 38 -8" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M72 22 l-2 18 l-17 -5 z" fill="#fff"/>
    <path d="M70 56 a21 21 0 0 1 -38 8" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M28 78 l2 -18 l17 5 z" fill="#fff"/></svg>`
};

// Logo nel menu: fumetto con le onde della voce
const LOGO = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="40" fill="#1d2638" stroke="#c9a45c" stroke-width="6"/>
  <path d="M58 44 H142 a28 28 0 0 1 28 28 V112 a28 28 0 0 1 -28 28 H96 L62 168 L68 140 H58 a28 28 0 0 1 -28 -28 V72 a28 28 0 0 1 28 -28 Z" fill="#eef1f6"/>
  <g fill="#c9a45c"><rect x="62" y="80" width="14" height="32" rx="7"/><rect x="85" y="66" width="14" height="60" rx="7"/>
  <rect x="108" y="74" width="14" height="44" rx="7"/><rect x="131" y="84" width="14" height="24" rx="7"/></g></svg>`;


// Figure base degli oggetti nuovi e figure colorate «oggetto_colore» (es. phone_nero)
FIG.laptop = CFIG.laptop(['#b9bdc8', '#8d93a3']);
FIG.coat = CFIG.coat(['#3a4258', '#2a3040']);
FIG.suitcase = CFIG.suitcase(['#3a4258', '#2a3040']);
FIG.flask = CFIG.flask(['#8fb0c4', '#6f8fa8']);
Object.keys(CFIG).forEach(k => Object.keys(COL_SHADE).forEach(c => { FIG[k + '_' + c] = CFIG[k](COL_SHADE[c]); }));

// Cartellini dei numeri (lezioni 6, 7, 26, 27): cifra elegante d'oro su blu (più piccola con 2 e 3 cifre)
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(n => {
  const big = n >= 1000 ? 24 : n >= 100 ? 31 : n >= 10 ? 40 : 50;
  FIG['n' + n] = FLAT(`<rect x="18" y="10" width="64" height="78" rx="8" fill="#2c3e66"/><rect x="22" y="14" width="56" height="70" rx="5" fill="none" stroke="#c9a45c" stroke-width="1.5"/>
    <text x="50" y="${n >= 1000 ? 59 : n >= 100 ? 62 : n >= 10 ? 66 : 68}" font-size="${big}" font-family="Georgia, 'Times New Roman', serif" fill="#e0c287" text-anchor="middle">${n}</text>`, 30);
});
