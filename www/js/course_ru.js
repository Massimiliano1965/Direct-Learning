'use strict';
/* =====================================================================
   CORSO: russo, per chi parla italiano, inglese o tedesco. Lezioni 1 e 2 (motore comune: world.js).
     Это книга.                 È un libro.          (in russo niente articolo: «это» = «questo è / è»)
     Это книга?                 → Да, это книга.
     Это стол?                  → Нет, это не стол.
     Это книга или ручка?       → Это книга.
     Что это?                   → Это книга.
   Sotto ogni frase, piccola, la pronuncia scritta per chi legge italiano («Èta knìga»), inglese («EH-tuh KNEE-guh»)
   o tedesco («Éta kníga»); l'accento sulla sillaba forte.
   ===================================================================== */

const COURSE = {
  lang: 'ru-RU',
  students: ['it', 'en', 'de'],
  name: 'Русский',
  brand: 'CIAO Русский',
  voiceTags: ['ru-ru', 'ru_ru'],
  yourTurn: '',
  nowYou: '',
  demoWrong: 'Да, это стул.',
  speedSample: ['Здравствуйте!', 'Говорим по-русски.']
};

// Le parole (word = come si scrive; alias = come a volte la scrive il microfono)
const ITEMS = {
  book:   { word: 'книга', art: '', alias: ['книгу', 'книги'] },
  table:  { word: 'стол',  art: '', alias: ['стола'] },
  chair:  { word: 'стул',  art: '', alias: ['стула'] },
  pen:    { word: 'ручка', art: '', alias: ['ручку', 'ручки'] },
  door:   { word: 'дверь', art: '', alias: ['двери'] },
  window: { word: 'окно',  art: '', alias: ['окна'] }
};
const LESSONS = WORLD_LESSONS('r');
const TEACHERS = worldTeachers(['Ivan', 'Olga', 'Anna', 'Pavel'], 'Нет.');

// Le frasi della lezione
const PH = {
  is:  (k) => 'Это ' + ITEMS[k].word + '.',
  isQ: (k) => 'Это ' + ITEMS[k].word + '?',
  yes: (k) => 'Да, это ' + ITEMS[k].word + '.',
  no:  (k) => 'Нет, это не ' + ITEMS[k].word + '.',
  alt: (a, b) => 'Это ' + ITEMS[a].word + ' или ' + ITEMS[b].word + '?',
  what: 'Что это?',
  isCore: (k) => 'это ' + ITEMS[k].word,
  negCore: (k) => 'это не ' + ITEMS[k].word,
  askCore: (k) => 'это ' + ITEMS[k].word,           // in russo la domanda è la stessa frase, con la voce che sale
  yesW: ['да'], noW: ['нет'], orW: ['или'],
  // per riconoscere: minuscole, ё = е, senza punteggiatura, gli alias
  tokens: (text) => {
    const w = String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
    return w.map(x => { const k = Object.keys(ITEMS).find(k => ITEMS[k].alias.indexOf(x) !== -1); return k ? ITEMS[k].word : x; });
  },
  words: (text) => text.match(/\p{L}+|[.,?!]/gu) || [],
  trKey: (w) => w.toLowerCase().replace(/ё/g, 'е'),
  joinTr: (parts) => parts.join(' ')
};

// La pronuncia: italiano (accento grave sulla sillaba forte), inglese (sillaba forte in maiuscolo), tedesco (accento acuto)
const TR = {
  'это':   { it: 'èta',     en: 'EH-tuh',    de: 'éta' },
  'книга': { it: 'knìga',   en: 'KNEE-guh',  de: 'kníga' },
  'стол':  { it: 'stòl',    en: 'stol',      de: 'stól' },
  'стул':  { it: 'stùl',    en: 'stool',     de: 'stúl' },
  'ручка': { it: 'rùc\'ka', en: 'ROOCH-kuh', de: 'rútschka' },
  'дверь': { it: 'dvièr',   en: 'dvyer',     de: 'dwjér' },
  'окно':  { it: 'aknò',    en: 'uk-NO',     de: 'aknó' },
  'да':    { it: 'dà',      en: 'dah',       de: 'dá' },
  'нет':   { it: 'nièt',    en: 'nyet',      de: 'njét' },
  'не':    { it: 'ni',      en: 'nee',       de: 'ni' },
  'или':   { it: 'ìli',     en: 'EE-lee',    de: 'íli' },
  'что':   { it: 'sctò',    en: 'shto',      de: 'schtó' }
};
