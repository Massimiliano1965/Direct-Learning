'use strict';
/* Insegnanti dei corsi di russo, arabo e cinese: stesso carattere degli insegnanti del corso di italiano
   (dal più rigido al più indulgente); i nomi li dà ogni corso (WORLD_NAMES). L'errore è solo «No.» nella lingua del corso,
   niente lodi a parole (l'insegnante non usa parole che l'allievo non conosce: regola di Massi). */
function worldTeachers(names, no) {
  return {
    max:  { key: 'max',  look: 'mass',   name: names[0], gender: 'm', style: 'Very strict', mark: 'wrong',
            rate: 1.0, pitch: 0.78, voice: 0, modelRate: 0.9, praiseEvery: 0, repeats: [3, 5, 4, 5, 4], praise: [], wrong: no, done: '' },
    emma: { key: 'emma', look: 'giulia', name: names[1], gender: 'f', style: 'Strict', mark: 'notcorrect',
            rate: 0.95, pitch: 1.02, voice: 0, modelRate: 0.85, praiseEvery: 0, repeats: [3, 4, 3, 5, 3], praise: [], wrong: no, done: '' },
    kate: { key: 'kate', look: 'sara',   name: names[2], gender: 'f', style: 'Normal', mark: 'mistake',
            rate: 0.9, pitch: 1.3, voice: 1, modelRate: 0.8, praiseEvery: 0, repeats: [2, 3, 4, 2, 3], praise: [], wrong: no, done: '' },
    tom:  { key: 'tom',  look: 'luca',   name: names[3], gender: 'm', style: 'Easygoing', mark: 'pity',
            rate: 0.85, pitch: 1.05, voice: 1, modelRate: 0.75, praiseEvery: 0, repeats: [1, 2, 1, 3, 2], praise: [], wrong: no, done: '' }
  };
}
const TRIAL_ROTATION = ['max', 'emma', 'kate', 'tom'];
const TEST_MODE = true;
const TRIAL_DAYS = 8;
const MIN_ANSWERS_FOR_VERDICT = 20;
const UI_WORDS = { talk: { lang: '' }, repeat: { lang: '' }, exit: { lang: '' } };
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;
const UI_HINT_DAYS = 4;
// Le lezioni 1 e 2, uguali per le tre lingue: libro, tavolo, sedia → penna; sedia, porta → finestra
const WORLD_LESSONS = (p) => [
  { id: p + '1', title: 'Lezione 1', known: ['book', 'table', 'chair'], fresh: 'pen' },
  { id: p + '2', title: 'Lezione 2', known: ['chair', 'door'], fresh: 'window' }
];
