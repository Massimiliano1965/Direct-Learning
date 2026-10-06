'use strict';
/* =====================================================================
   CORSO DI PROVA: cinese (mandarino) per chi parla inglese.
   Stesso motore dell'italiano: cambiano solo parole, frasi e regole (grammar_zh.js).
   Qui stanno solo le parole, le lezioni e gli insegnanti; le regole della
   lezione sono in logic.js. Un altro corso = un altro file come questo.
   ===================================================================== */

const COURSE = {
  lang: 'zh-CN',        // lingua che si impara: voce e microfono
  ui: 'en',             // lingua dell'allievo: menu e messaggi
  name: '中文',
  voiceTags: ['zh-cn', 'cmn-cn', 'zh_cn', 'cmn_cn'],   // voci cinesi del telefono (Google: cmn-cn-x-…)
  yourTurn: '轮到你了。',
  nowYou: '现在轮到你了。',
  demoWrong: '是，这是桌子。',          // l'errore della lezione di prova
  show: null                            // impostato in grammar_zh.js: caratteri + pinyin
};

// Oggetti: chiave = figura in data.js. py = pinyin.
// alias = caratteri che il microfono scrive al posto di quello giusto (stesso suono e stesso tono).
const ITEMS = {
  book:  { word: '书',   py: 'shū',   alias: ['叔', '输', '舒', '疏', '殊', '抒', '枢'] },
  table: { word: '桌子', py: 'zhuōzi', alias: ['卓子', '捉子', '桌'] },
  chair: { word: '椅子', py: 'yǐzi',   alias: ['以子', '已子', '乙子', '蚁子', '椅'] },
  pen:   { word: '笔',   py: 'bǐ',    alias: ['比', '彼', '鄙', '必'] }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'zh1', title: '第一课', known: ['book', 'table', 'chair'], fresh: 'pen' }
];

// Quattro insegnanti, dal più rigido al più indulgente. gender = voce maschile o femminile.
// wrong = parola secca quando l'allievo sbaglia (con la sua icona, mark in data.js);
// repeats = quante ripetizioni dopo ogni errore, una voce per errore e poi da capo
// (massimo 5, mai sempre uguali). style serve solo a noi: l'allievo non lo vede.
const TEACHERS = {
  mass: {
    key: 'mass', name: 'Mass', gender: 'm', style: 'Very strict', mark: 'wrong',
    rate: 1.1, pitch: 0.85, modelRate: 1.0, praiseEvery: 0, repeats: [3, 5, 4, 5, 4],
    praise: ['对。'],
    wrong: '错。',
    done: '这一课结束了。'
  },
  giulia: {
    key: 'giulia', name: 'Giulia', gender: 'f', style: 'Strict', mark: 'notcorrect',
    rate: 1.05, pitch: 1.15, modelRate: 0.95, praiseEvery: 5, repeats: [3, 4, 3, 5, 3],
    praise: ['对。', '正确。'],
    wrong: '不对。',
    done: '这一课结束了。'
  },
  luca: {
    key: 'luca', name: 'Luca', gender: 'm', style: 'Normal', mark: 'mistake',
    rate: 1.0, pitch: 0.92, modelRate: 0.9, praiseEvery: 3, repeats: [2, 3, 4, 2, 3],
    praise: ['很好。', '对。', '好。'],
    wrong: '你错了。',
    done: '这一课结束了。很好。'
  },
  sara: {
    key: 'sara', name: 'Sara', gender: 'f', style: 'Easygoing', mark: 'pity',
    rate: 0.95, pitch: 1.2, modelRate: 0.85, praiseEvery: 2, repeats: [1, 2, 1, 3, 2],
    praise: ['太好了！', '真棒！', '非常好！'],
    wrong: '可惜。',
    done: '结束了！做得很好！'
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
  talk:   { ui: 'Talk',   lang: '说' },
  repeat: { ui: 'Repeat', lang: '再听' },
  exit:   { ui: 'Exit',   lang: '退出' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;   // giorni dopo la lezione dei pulsanti prima del cambio
const UI_HINT_DAYS = 4;     // poi, per questi giorni, resta piccola la parola dell'allievo sotto
