'use strict';
/* =====================================================================
   CORSO: italiano per chi parla inglese.
   Qui stanno solo le parole, le lezioni e gli insegnanti; le regole della
   lezione sono in logic.js. Un altro corso = un altro file come questo.
   ===================================================================== */

const COURSE = {
  lang: 'it-IT',        // lingua che si impara: voce e microfono
  ui: 'en'              // lingua dell'allievo: menu e messaggi
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
  computer: { word: 'computer',  art: 'un',  alias: ['computers', 'compiuter'] }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'l1', title: 'Lezione 1', known: ['book', 'table', 'chair'], fresh: 'pen' },
  { id: 'l2', title: 'Lezione 2', known: ['chair', 'door'], fresh: 'window' },
  // dal capitolo 1 del libro: «Una bottiglia e una tazza», «È questo un computer?» (era il magnetofono)
  { id: 'l3', title: 'Lezione 3', known: ['bottle', 'cup'], review: ['book', 'table', 'chair', 'pen', 'door', 'window'],
    fresh: 'computer', questo: true }
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
  talk:   { ui: 'Talk',   lang: 'Parla' },
  repeat: { ui: 'Repeat', lang: 'Riascolta' },
  exit:   { ui: 'Exit',   lang: 'Esci' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;   // giorni dopo la lezione dei pulsanti prima del cambio
const UI_HINT_DAYS = 4;     // poi, per questi giorni, resta piccola la parola dell'allievo sotto
