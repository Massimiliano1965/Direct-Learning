'use strict';
/* =====================================================================
   CAPITOLO 11: «Il contrario» (lezione 62, livello 3). Si carica dopo contr_it.js (lezione 39: stesse frasi e stesse regole).
   Tre coppie nuove: la tazza calda / fredda (il fumo, il ghiaccio), il libro nuovo / vecchio (le stelline, le pagine gialle),
   la sedia alta / bassa:
     La tazza è calda.            Com'è la tazza?  → La tazza è calda.
     La tazza è fredda?           → No, la tazza non è fredda.
   Come nella lezione 22, -o azzurra e -a rosa (caldo, calda; vecchio, vecchia).
   ===================================================================== */

Object.assign(CONTR, { caldo: ['caldo', 'calda'], freddo: ['freddo', 'fredda'], nuovo: ['nuovo', 'nuova'], vecchio: ['vecchio', 'vecchia'], alto: ['alto', 'alta'], basso: ['basso', 'bassa'] });
Object.assign(CONTR_OPP, { caldo: 'freddo', freddo: 'caldo', nuovo: 'vecchio', vecchio: 'nuovo', alto: 'basso', basso: 'alto' });
['caldo', 'freddo', 'nuovo', 'vecchio', 'alto', 'basso'].forEach(a => { CONTR_WORD[CONTR[a][0]] = { a: a, g: 'm' }; CONTR_WORD[CONTR[a][1]] = { a: a, g: 'f' }; });
['ct_cup_caldo', 'ct_cup_freddo', 'ct_book_nuovo', 'ct_book_vecchio', 'ct_chair_alto', 'ct_chair_basso'].forEach(X => { CT[X] = 1; });

/* ---------- Figure ---------- */
const ct2Body = (f) => inner(f).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
// calda: tre fili di fumo; fredda: due cubetti di ghiaccio e il fiocco di neve
FIG.ct_cup_caldo = FLAT(ct2Body(FIG.cup) + '<path d="M38 30 q-5 -7 0 -14 q5 -7 0 -14 M50 30 q-5 -7 0 -14 q5 -7 0 -14 M62 30 q-5 -7 0 -14 q5 -7 0 -14" fill="none" stroke="#e9edf2" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>', 30);
FIG.ct_cup_freddo = FLAT(ct2Body(FIG.cup) + '<rect x="40" y="30" width="9" height="9" rx="2" fill="#cfe8f7" stroke="#8fc4e6" stroke-width="1" transform="rotate(-12 44 34)"/>' +
  '<rect x="51" y="28" width="9" height="9" rx="2" fill="#cfe8f7" stroke="#8fc4e6" stroke-width="1" transform="rotate(10 55 32)"/>' +
  '<g transform="translate(80 18)" stroke="#9fd0ee" stroke-width="2" stroke-linecap="round"><path d="M0 -8 v16 M-7 -4 l14 8 M-7 4 l14 -8"/></g>', 30);
// nuovo: il libro con le stelline d'oro; vecchio: marrone sbiadito, l'angolo piegato, le pagine gialle
const CT2_STAR = (x, y, r) => '<path d="M' + x + ' ' + (y - r) + ' l' + r * .3 + ' ' + r * .7 + ' l' + r * .7 + ' ' + r * .3 + ' l-' + r * .7 + ' ' + r * .3 + ' l-' + r * .3 + ' ' + r * .7 + ' l-' + r * .3 + ' -' + r * .7 + ' l-' + r * .7 + ' -' + r * .3 + ' l' + r * .7 + ' -' + r * .3 + 'z" fill="#f3d36b"/>';
FIG.ct_book_nuovo = FLAT(ct2Body(FIG.book) + CT2_STAR(78, 18, 7) + CT2_STAR(22, 30, 5) + CT2_STAR(84, 44, 4), 30);
FIG.ct_book_vecchio = FLAT(recolor(ct2Body(FIG.book), { '#2c3e66': '#7a6a55', '#3a4f7e': '#8d7c63', '#f3eee2': '#e0cf9a', '#ece4d2': '#d6c48c' }) +
  '<path d="M64 12 l8 0 l0 8z" fill="#5c4f3d"/><path d="M36 40 l6 5 M58 60 l-5 6" stroke="#5c4f3d" stroke-width="1.2" opacity=".7"/>', 30);
// la sedia alta (gambe lunghe, come al bar) e la sedia bassa (piccola, da bambino)
const ct2Chair = (legs, sc) => '<g transform="translate(50 92) scale(' + sc + ') translate(-50 -92)">' +
  '<rect x="34" y="' + (52 - legs) + '" width="32" height="22" rx="3" fill="#8e6741"/><rect x="37" y="' + (56 - legs) + '" width="26" height="3.4" fill="#a37a52"/><rect x="37" y="' + (63 - legs) + '" width="26" height="3.4" fill="#a37a52"/>' +
  '<rect x="30" y="' + (74 - legs) + '" width="40" height="6" rx="2" fill="#a37a52"/>' +
  '<rect x="32" y="' + (80 - legs) + '" width="4" height="' + (12 + legs) + '" fill="#6e4f33"/><rect x="64" y="' + (80 - legs) + '" width="4" height="' + (12 + legs) + '" fill="#6e4f33"/></g>';
FIG.ct_chair_alto = FLAT(ct2Chair(28, 1), 26);
FIG.ct_chair_basso = FLAT(ct2Chair(0, .62), 18);

// i colori -o / -a anche per le parole nuove
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.ct ? bGw(lesson).concat(['tazza', 'sedia']) : bGw(lesson);
}
