'use strict';
/* =====================================================================
   CAPITOLO 5: «Plurali irregolari» (lezione 38). Si carica dopo plur_it.js: stesse frasi e stesse regole della lezione 32.
     È un uomo.  Sono due uomini.         (uomo → uomini)
     È una mano.  Sono due mani.          (mano è femminile e fa «mani»)
     Sono tre uova.                       (uovo → uova)
     Sono due caffè.  Sono due computer.  (le parole con l'accento e le parole straniere non cambiano)
   Qui niente colori -o/-a: «la mano» finisce in -o ma è femminile; «è» e «sono» sottolineati.
   Errori: «due uomi», «due mano», «due uovi», «due caffei», «una uomo», «un mano».
   ===================================================================== */

Object.assign(ITEMS, {
  man:    { word: 'uomo',  art: 'un',  alias: ['uomini', 'uomi'] },
  hand:   { word: 'mano',  art: 'una', alias: ['mani'] },
  egg:    { word: 'uovo',  art: 'un',  alias: ['uova', 'ovo'] },
  coffee: { word: 'caffè', art: 'un',  alias: [] }
});
['man', 'hand', 'egg', 'coffee'].forEach(k => { WORD2KEY[ITEMS[k].word] = k; });
WORD2KEY.caffe = 'coffee';
Object.assign(PLURAL, { man: 'uomini', hand: 'mani', egg: 'uova', coffee: 'caffè', computer: 'computer' });
['man', 'hand', 'egg', 'coffee', 'computer'].forEach(k => { PLURAL_KEY[PLURAL[k]] = k; });

/* ---------- Figure nuove ---------- */
const IRR_MAN = { man: true, skin: '#eab892', skin2: '#d9a27c', hair: '#3a2a20', hair2: '#2a1d16', style: 'short', suit: '#3f6f8f', suit2: '#335c77', shirt: '#eef4f8', tie: '#3f6f8f' };
Object.defineProperty(FIG, 'man', { enumerable: true, get: () => typeof tTorso !== 'function' ? '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>' :
  '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="96" rx="22" ry="3" fill="#000" opacity=".25"/>' +
  '<g transform="translate(0 4)">' + tTorso(IRR_MAN) + tArm(IRR_MAN, ...DOWN_L) + tArm(IRR_MAN, ...DOWN_R) + tHeadStill(IRR_MAN, { mouth: 'smile' }) + '</g></svg>' });
FIG.hand = FLAT('<path d="M34 88 v-30 q-10 -8 -14 -18 q-2 -6 3 -7 q5 -1 9 8 l4 8 v-34 q0 -5 5 -5 q5 0 5 5 v26 v-30 q0 -5 5 -5 q5 0 5 5 v30 v-26 q0 -5 5 -5 q5 0 5 5 v28 v-20 q0 -5 5 -5 q5 0 5 5 v38 q0 16 -12 26 v6z" fill="#eab892"/>' +
  '<path d="M44 52 v-6 M54 50 v-6 M64 50 v-6" stroke="#d9a27c" stroke-width="1.6" stroke-linecap="round"/><path d="M34 88 h32" stroke="#3f6f8f" stroke-width="6"/>', 22);
FIG.egg = FLAT('<ellipse cx="50" cy="56" rx="24" ry="31" fill="#f3eee2"/><ellipse cx="42" cy="44" rx="7" ry="11" fill="#fff" opacity=".7"/><path d="M64 70 q-6 12 -18 14" stroke="#ddd3bd" stroke-width="3" fill="none" stroke-linecap="round"/>', 22);
FIG.coffee = FLAT('<ellipse cx="50" cy="82" rx="30" ry="6" fill="#c8ced6"/><path d="M30 56 h40 l-4 22 a5 5 0 0 1 -5 4 h-22 a5 5 0 0 1 -5 -4z" fill="#f3eee2"/>' +
  '<path d="M69 61 h4 a6 6 0 0 1 0 12 h-5" fill="none" stroke="#f3eee2" stroke-width="3.5"/><ellipse cx="50" cy="56" rx="20" ry="3.5" fill="#5a3826"/>' +
  '<path d="M43 46 q4 -6 0 -12 q-4 -6 0 -12 M55 46 q4 -6 0 -12 q-4 -6 0 -12" stroke="#b9bdc8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>', 30);

const IRR = ['pl_man_1', 'pl_man_2', 'pl_hand_2', 'pl_egg_3', 'pl_coffee_2', 'pl_computer_2'];
IRR.forEach(X => { PL[X] = 1; Object.defineProperty(FIG, X, { enumerable: true, get: () => gMany(FIG[plObj(X)], plN(X)) }); });
