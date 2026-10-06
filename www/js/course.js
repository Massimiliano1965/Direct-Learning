'use strict';
/* =====================================================================
   CORSO: italiano per chi parla inglese, tedesco o giapponese.
   Qui stanno solo le parole, le lezioni e gli insegnanti; le regole della
   lezione sono in logic.js. Un altro corso = un altro file come questo.
   ===================================================================== */

const COURSE = {
  lang: 'it-IT',        // lingua che si impara: voce e microfono
  students: ['en', 'de', 'ja', 'it'],   // lingue dello studente offerte («Che lingua parli?»): menu e messaggi
  name: 'Italiano',
  voiceTags: ['it-it'],                 // come si riconoscono le voci italiane del telefono
  yourTurn: 'Tocca a te.',
  nowYou: 'Adesso tocca a te.',
  demoWrong: 'Sì, è un sedia.'          // l'errore della lezione di prova
};

// Oggetti: chiave = figura in data.js. art = articolo indeterminativo.
// alias = parole che il microfono a volte capisce al posto di quella giusta.
const ITEMS = {
  book:   { word: 'libro',    art: 'un',  alias: ['libri', 'litro'] },
  table:  { word: 'tavolo',   art: 'un',  alias: ['tavoli', 'tavola'] },
  chair:  { word: 'sedia',    art: 'una', alias: ['sedie', 'sede'] },
  pen:    { word: 'penna',    art: 'una', alias: ['penne', 'pena'] },
  pencil: { word: 'matita',   art: 'una', alias: ['matite'] },
  door:   { word: 'porta',    art: 'una', alias: ['porte'] },
  window: { word: 'finestra', art: 'una', alias: ['finestre'] },
  key:    { word: 'chiave',   art: 'una', alias: ['chiavi'] },
  box:    { word: 'scatola',  art: 'una', alias: ['scatole'] },
  clock:  { word: 'orologio', art: 'un',  alias: ['orologi'] },
  cup:    { word: 'tazza',    art: 'una', alias: ['tazze'] },
  bag:    { word: 'borsa',    art: 'una', alias: ['borse'] },
  bottle:   { word: 'bottiglia', art: 'una', alias: ['bottiglie'] },
  computer: { word: 'computer',  art: 'un',  alias: ['computers', 'compiuter'] },
  phone:    { word: 'telefono',  art: 'un',  alias: ['telefoni'] },
  notebook: { word: 'quaderno',  art: 'un',  alias: ['quaderni'] },
  lamp:     { word: 'lampada',   art: 'una', alias: ['lampade'] },
  // lezione 5 (2026: chi viaggia e lavora): telefono, portatile, cappotto; valigia, borraccia, tazza
  laptop:   { word: 'portatile', art: 'un',  alias: ['portatili', 'portabile'] },
  coat:     { word: 'cappotto',  art: 'un',  alias: ['cappotti', 'capotto'] },
  suitcase: { word: 'valigia',   art: 'una', alias: ['valige', 'valigie', 'valiggia'] },
  flask:    { word: 'borraccia', art: 'una', alias: ['borracce', 'boraccia'] }
};

// Colori (lezione 5): forma maschile e femminile. Il rosso è il colore nuovo, da scoprire.
const COLORS = {
  nero:   { m: 'nero',   f: 'nera' },
  bianco: { m: 'bianco', f: 'bianca' },
  rosso:  { m: 'rosso',  f: 'rossa' }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'l1', title: 'Lezione 1', known: ['book', 'table', 'chair'], fresh: 'pen' },
  // dalla lezione 2: «questo/questa». Libro e tavolo (lezione 1) in ripasso, per avere anche il maschile
  { id: 'l2', title: 'Lezione 2', known: ['chair', 'door'], review: ['book', 'table'], fresh: 'window', dq: true, questoIntro: true },
  // dal capitolo 1 del libro: «Una bottiglia e una tazza», «È questo un computer?» (era il magnetofono)
  { id: 'l3', title: 'Lezione 3', known: ['bottle', 'cup'], review: ['book', 'table', 'chair', 'pen', 'door', 'window'],
    fresh: 'computer', questo: true, dq: true },
  // oggetti nuovi (con «il» e «la» nella lezione 5 arrivano i colori)
  { id: 'l4', title: 'Lezione 4', known: ['phone', 'key', 'notebook', 'bag'], review: ['book', 'pen', 'cup', 'chair'],
    fresh: 'lamp', questo: true, dq: true },
  // «Il o la? Nero o nera?»: ogni oggetto ha il suo colore. known = presentati subito (nero e bianco);
  // fresh = oggetti rossi, il colore nuovo da scoprire con «Di che colore è…?»
  { id: 'l5', title: 'Lezione 5', colors: true,
    known: ['phone_nero', 'laptop_bianco', 'suitcase_nero', 'flask_bianco'], reds: ['coat_rosso', 'cup_rosso'] },
  // «Che numero è?» (capitolo 1, esercizio 4): da uno a cinque, poi il sei da scoprire
  { id: 'l6', title: 'Lezione 6', numbers: true, known: ['n1', 'n2', 'n3', 'n4', 'n5'], fresh: 'n6' },
  // sette, otto, nove (ripasso 1–6), poi il dieci da scoprire
  { id: 'l7', title: 'Lezione 7', numbers: true, known: ['n7', 'n8', 'n9'], review: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'], fresh: 'n10' },
  // capitolo 2, esercizio 5 B: «Che cosa è Roma?» — città (il loro monumento) e paesi (mappa con la bandiera)
  { id: 'l8', title: 'Lezione 8', geo: 'cat', known: ['g_roma', 'g_italia', 'g_parigi', 'g_francia', 'g_newyork', 'g_america', 'g_londra', 'g_cina'] },
  // capitolo 2, esercizio 5 A: «In o a?» — il Colosseo è a Roma, in Italia; la Grande Muraglia da scoprire con «Dov'è…?»
  { id: 'l9', title: 'Lezione 9', geo: 'dove', placeHints: true, known: ['g_colosseo', 'g_eiffel', 'g_bigben', 'g_liberta'], fresh: 'g_muraglia' },
  // capitolo 2, esercizio 6: «Il mio, la Sua» — gli stessi oggetti dell'insegnante e dello studente
  { id: 'l10', title: 'Lezione 10', poss: true, known: ['o_t_phone', 'o_s_phone', 'o_t_suitcase', 'o_s_suitcase', 'o_t_laptop', 'o_s_bag'] }
];

// Quattro insegnanti, dal più rigido al più indulgente. gender = voce maschile o femminile.
// wrong = parola secca quando l'allievo sbaglia (con la sua icona, mark in data.js);
// repeats = quante ripetizioni dopo ogni errore, una voce per errore e poi da capo
// (massimo 5, mai sempre uguali). style serve solo a noi: l'allievo non lo vede.
const TEACHERS = {
  mass: {
    key: 'mass', name: 'Mass', gender: 'm', style: 'Very strict', mark: 'wrong',
    rate: 1.1, pitch: 0.85, modelRate: 1.0, praiseEvery: 0, repeats: [3, 5, 4, 5, 4],
    praise: ['Corretto.'],
    wrong: 'Errato.',
    done: 'La lezione è finita.'
  },
  giulia: {
    key: 'giulia', name: 'Giulia', gender: 'f', style: 'Strict', mark: 'notcorrect',
    rate: 1.05, pitch: 1.15, modelRate: 0.95, praiseEvery: 5, repeats: [3, 4, 3, 5, 3],
    praise: ['Corretto.', 'Giusto.'],
    wrong: 'Non corretto.',
    done: 'La lezione è finita.'
  },
  luca: {
    key: 'luca', name: 'Luca', gender: 'm', style: 'Normal', mark: 'mistake',
    rate: 1.0, pitch: 0.92, modelRate: 0.9, praiseEvery: 3, repeats: [2, 3, 4, 2, 3],
    praise: ['Bene.', 'Giusto.', 'Esatto.'],
    wrong: 'Hai sbagliato.',
    done: 'La lezione è finita. Bene.'
  },
  sara: {
    key: 'sara', name: 'Sara', gender: 'f', style: 'Easygoing', mark: 'pity',
    rate: 0.95, pitch: 1.2, modelRate: 0.85, praiseEvery: 2, repeats: [1, 2, 1, 3, 2],
    praise: ['Ottimo!', 'Perfetto!', 'Benissimo!'],
    wrong: 'Peccato.',
    done: 'Finito! Ottimo lavoro!'
  }
};
const TRIAL_ROTATION = ['mass', 'giulia', 'luca', 'sara'];
// Prova per Papa: tutti gli insegnanti liberi, la scelta resta finché non la cambia.
// Per la prova di 8 giorni con rotazione: false.
const TEST_MODE = true;
const TRIAL_DAYS = 8;   // due giorni per insegnante, poi il consiglio
const MIN_ANSWERS_FOR_VERDICT = 20;

// Pulsanti della lezione: prima nella lingua dell'allievo, poi nella lingua del corso
// (quando ci sarà la lezione dei pulsanti: MENU_LESSON).
const UI_WORDS = {
  talk:   { lang: 'Parla' },
  repeat: { lang: 'Riascolta' },
  exit:   { lang: 'Esci' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;   // giorni dopo la lezione dei pulsanti prima del cambio
const UI_HINT_DAYS = 4;     // poi, per questi giorni, resta piccola la parola dell'allievo sotto
