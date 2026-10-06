'use strict';
/* =====================================================================
   CORSO DI PROVA: arabo standard (fuṣḥā) per chi parla inglese.
   Stesso motore dell'italiano: cambiano solo parole, frasi e regole (grammar_ar.js).
   Qui stanno solo le parole, le lezioni e gli insegnanti; le regole della
   lezione sono in logic.js. Un altro corso = un altro file come questo.
   ===================================================================== */

const COURSE = {
  lang: 'ar-SA',        // lingua che si impara: voce e microfono
  ui: 'en',             // lingua dell'allievo: menu e messaggi
  name: 'العربية',
  rtl: true,
  ttsAlt: 'ar',         // se la voce «ar-SA» non c'è, si prova la voce araba generica
  voiceTags: ['ar-xa', 'ar-sa', 'ar-eg', 'ar_', 'ara-'],   // voci arabe del telefono (Google: ar-xa-x-…)
  yourTurn: 'دورك.',
  nowYou: 'الآن دورك.',
  demoWrong: 'نعم، هذه كرسي.',          // l'errore della lezione di prova: «questa» invece di «questo»
  show: null                            // impostato in grammar_ar.js: arabo + pronuncia
};

// Oggetti: chiave = figura in data.js. g = genere (هذا / هذه), acc = forma dopo «ليس» (laysa kitāban),
// tr = pronuncia in lettere latine. alias = come il microfono a volte scrive la parola.
const ITEMS = {
  book:  { word: 'كتاب',  acc: 'كتابًا',  g: 'm', tr: 'kitāb',  tracc: 'kitāban',   alias: [] },
  table: { word: 'طاولة', acc: 'طاولةً', g: 'f', tr: 'ṭāwila', tracc: 'ṭāwilatan', alias: ['طاوله', 'تاولة', 'طاولا'] },
  chair: { word: 'كرسي',  acc: 'كرسيًا',  g: 'm', tr: 'kursī',  tracc: 'kursiyyan', alias: ['كرسى', 'كورسي'] },
  pen:   { word: 'قلم',   acc: 'قلمًا',   g: 'm', tr: 'qalam', tracc: 'qalaman', alias: ['كلم', 'قلام'] }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'ar1', title: 'الدرس الأول', known: ['book', 'table', 'chair'], fresh: 'pen' }
];

// Quattro insegnanti, dal più rigido al più indulgente. gender = voce maschile o femminile.
// wrong = parola secca quando l'allievo sbaglia (con la sua icona, mark in data.js);
// repeats = quante ripetizioni dopo ogni errore, una voce per errore e poi da capo
// (massimo 5, mai sempre uguali). style serve solo a noi: l'allievo non lo vede.
const TEACHERS = {
  mass: {
    key: 'mass', name: 'Mass', gender: 'm', style: 'Very strict', mark: 'wrong',
    rate: 1.1, pitch: 0.85, modelRate: 1.0, praiseEvery: 0, repeats: [3, 5, 4, 5, 4],
    praise: ['صحيح.'],
    wrong: 'خطأ.',
    done: 'انتهى الدرس.'
  },
  giulia: {
    key: 'giulia', name: 'Giulia', gender: 'f', style: 'Strict', mark: 'notcorrect',
    rate: 1.05, pitch: 1.15, modelRate: 0.95, praiseEvery: 5, repeats: [3, 4, 3, 5, 3],
    praise: ['صحيح.', 'صح.'],
    wrong: 'غير صحيح.',
    done: 'انتهى الدرس.'
  },
  luca: {
    key: 'luca', name: 'Luca', gender: 'm', style: 'Normal', mark: 'mistake',
    rate: 1.0, pitch: 0.92, modelRate: 0.9, praiseEvery: 3, repeats: [2, 3, 4, 2, 3],
    praise: ['جيد.', 'صحيح.', 'ممتاز.'],
    wrong: 'أخطأت.',
    done: 'انتهى الدرس. جيد.'
  },
  sara: {
    key: 'sara', name: 'Sara', gender: 'f', style: 'Easygoing', mark: 'pity',
    rate: 0.95, pitch: 1.2, modelRate: 0.85, praiseEvery: 2, repeats: [1, 2, 1, 3, 2],
    praise: ['ممتاز!', 'رائع!', 'أحسنت!'],
    wrong: 'للأسف.',
    done: 'انتهينا! عمل ممتاز!'
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
  talk:   { ui: 'Talk',   lang: 'تكلّم' },
  repeat: { ui: 'Repeat', lang: 'أعد' },
  exit:   { ui: 'Exit',   lang: 'خروج' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;   // giorni dopo la lezione dei pulsanti prima del cambio
const UI_HINT_DAYS = 4;     // poi, per questi giorni, resta piccola la parola dell'allievo sotto
