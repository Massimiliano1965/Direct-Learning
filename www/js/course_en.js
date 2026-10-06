'use strict';
/* =====================================================================
   CORSO: inglese (britannico) per chi parla italiano.
   Stesso motore del corso di italiano: qui solo parole, lezioni e insegnanti;
   le frasi e le regole per capire le risposte sono in grammar_en.js.
   ===================================================================== */

const COURSE = {
  lang: 'en-GB',        // lingua che si impara: voce e microfono (accento britannico)
  students: ['it'],     // lingua dello studente: menu e messaggi in italiano
  name: 'English',
  brand: 'CIAO English',  // nome dell'app nel menu
  voiceTags: ['en-gb', 'en_gb'],        // voci britanniche del telefono
  yourTurn: 'Your turn.',
  nowYou: 'Now it\'s your turn.',
  demoWrong: 'Yes, it is an chair.',    // l'errore della lezione di prova («an» al posto di «a»)
  speedSample: ['Hello, I\'m {name}.', 'Let\'s speak English together.']   // la frase d'esempio quando si sceglie la velocità
};

// Oggetti: chiave = figura in data.js. art = «a» o «an» (il punto di grammatica, come un/una).
// alias = parole che il microfono a volte scrive al posto di quella giusta (anche per l'accento italiano).
const ITEMS = {
  book:     { word: 'book',     art: 'a',  alias: ['books', 'look', 'brook', 'buck'] },
  table:    { word: 'table',    art: 'a',  alias: ['tables', 'cable', 'tabla'] },
  chair:    { word: 'chair',    art: 'a',  alias: ['chairs', 'share', 'cheer', 'shair'] },
  pen:      { word: 'pen',      art: 'a',  alias: ['pens', 'pan', 'pin', 'ben'] },
  door:     { word: 'door',     art: 'a',  alias: ['doors', 'dora', 'dore'] },
  window:   { word: 'window',   art: 'a',  alias: ['windows', 'windo'] },
  bottle:   { word: 'bottle',   art: 'a',  alias: ['bottles', 'bottel'] },
  cup:      { word: 'cup',      art: 'a',  alias: ['cups', 'cap', 'cop'] },
  computer: { word: 'computer', art: 'a',  alias: ['computers'] },
  phone:    { word: 'phone',    art: 'a',  alias: ['phones', 'fone', 'telephone'] },
  key:      { word: 'key',      art: 'a',  alias: ['keys', 'kee'] },
  notebook: { word: 'notebook', art: 'a',  alias: ['notebooks'] },
  bag:      { word: 'bag',      art: 'a',  alias: ['bags', 'back', 'beg'] },
  umbrella: { word: 'umbrella', art: 'an', alias: ['umbrellas', 'ambrella', 'umbrela'] }
};

// Lezioni: stesso ordine del corso di italiano (libro di Papa).
// Lezione 4: l'ombrello al posto della lampada, per il primo «an».
const LESSONS = [
  { id: 'e1', title: 'Lesson 1', known: ['book', 'table', 'chair'], fresh: 'pen' },
  { id: 'e2', title: 'Lesson 2', known: ['chair', 'door'], fresh: 'window', dq: true },
  { id: 'e3', title: 'Lesson 3', known: ['bottle', 'cup'], review: ['book', 'table', 'chair', 'pen', 'door', 'window'],
    fresh: 'computer', questo: true, dq: true },
  { id: 'e4', title: 'Lesson 4', known: ['phone', 'key', 'notebook', 'bag'], review: ['book', 'pen', 'cup', 'chair'],
    fresh: 'umbrella', questo: true, dq: true }
];

// Quattro insegnanti, dal più rigido al più indulgente: uomo, donna, donna, uomo.
// look = quale figura disegnata usa (teacher.js).
const TEACHERS = {
  max: {
    key: 'max', look: 'mass', name: 'Max', gender: 'm', style: 'Very strict', mark: 'wrong',
    rate: 1.05, pitch: 0.85, modelRate: 0.95, praiseEvery: 0, repeats: [3, 5, 4, 5, 4],
    praise: ['Correct.'],
    wrong: 'Wrong.',
    done: 'The lesson is over.'
  },
  emma: {
    key: 'emma', look: 'giulia', name: 'Emma', gender: 'f', style: 'Strict', mark: 'notcorrect',
    rate: 1.0, pitch: 1.1, modelRate: 0.9, praiseEvery: 5, repeats: [3, 4, 3, 5, 3],
    praise: ['Correct.', 'Right.'],
    wrong: 'Not correct.',
    done: 'The lesson is over.'
  },
  kate: {
    key: 'kate', look: 'sara', name: 'Kate', gender: 'f', style: 'Normal', mark: 'mistake',
    rate: 0.95, pitch: 1.15, modelRate: 0.85, praiseEvery: 3, repeats: [2, 3, 4, 2, 3],
    praise: ['Good.', 'Right.', 'Exactly.'],
    wrong: 'That\'s a mistake.',
    done: 'The lesson is over. Good.'
  },
  tom: {
    key: 'tom', look: 'luca', name: 'Tom', gender: 'm', style: 'Easygoing', mark: 'pity',
    rate: 0.9, pitch: 0.95, modelRate: 0.8, praiseEvery: 2, repeats: [1, 2, 1, 3, 2],
    praise: ['Excellent!', 'Perfect!', 'Great!'],
    wrong: 'Too bad.',
    done: 'Finished! Well done!'
  }
};
const TRIAL_ROTATION = ['max', 'emma', 'kate', 'tom'];
// Prova: tutti gli insegnanti liberi, la scelta resta finché non la cambia.
const TEST_MODE = true;
const TRIAL_DAYS = 8;   // due giorni per insegnante, poi il consiglio
const MIN_ANSWERS_FOR_VERDICT = 20;

// Pulsanti della lezione: prima nella lingua dello studente, poi in inglese
const UI_WORDS = {
  talk:   { lang: 'Speak' },
  repeat: { lang: 'Listen again' },
  exit:   { lang: 'Exit' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;
const UI_HINT_DAYS = 4;
