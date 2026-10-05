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
  bag:    { word: 'borsa',    art: 'una', alias: ['borse'] }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'l1', title: 'Lezione 1', known: ['book', 'table', 'chair'], fresh: 'pen' }
];

const TEACHERS = {
  marco: {
    key: 'marco', name: 'Marco', style: 'Strict and fast',
    rate: 1.1, pitch: 0.85, modelRate: 1.0, maxTries: 2, praiseEvery: 0,
    praise: ['Bene.', 'Giusto.'],
    wrong: 'No.', cue: 'Ancora.', giveUp: 'Ascolta.',
    done: 'La lezione è finita.'
  },
  giulia: {
    key: 'giulia', name: 'Giulia', style: 'Calm and precise',
    rate: 0.9, pitch: 1.1, modelRate: 0.75, maxTries: 3, praiseEvery: 3,
    praise: ['Giusto.', 'Esatto.', 'Bene.'],
    wrong: 'Non proprio. Ascolta.', cue: 'Ora tu.', giveUp: 'La risposta è:',
    done: 'La lezione è finita. Molto bene.'
  },
  luca: {
    key: 'luca', name: 'Luca', style: 'Cheerful and encouraging',
    rate: 1.0, pitch: 1.15, modelRate: 0.9, maxTries: 3, praiseEvery: 2,
    praise: ['Ottimo!', 'Perfetto!', 'Benissimo!', 'Sì!'],
    wrong: 'Quasi! Ascolta.', cue: 'Tocca a te!', giveUp: 'Nessun problema. Ascolta:',
    done: 'Finito! Ottimo lavoro!'
  }
};
const TRIAL_ROTATION = ['marco', 'giulia', 'luca'];
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
