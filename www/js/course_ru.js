'use strict';
/* =====================================================================
   CORSO: russo, per chi parla italiano, inglese o tedesco. Lezioni 1–4 (motore comune: world.js).
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
  table:  { word: 'стол',  art: '', alias: ['стола', 'столь', 'сталь', 'стал', 'стоп', 'столл', 'штоль', 'сто', '100', 'столе', 'stol', 'stoll', 'stop'] },
  chair:  { word: 'стул',  art: '', alias: ['стула'] },
  pen:    { word: 'ручка', art: '', alias: ['ручку', 'ручки'] },
  door:   { word: 'дверь', art: '', alias: ['двери'] },
  window: { word: 'окно',  art: '', alias: ['окна'] },
  bottle:   { word: 'бутылка',   art: '', alias: ['бутылку', 'бутылки'] },
  cup:      { word: 'чашка',     art: '', alias: ['чашку', 'чашки'] },
  computer: { word: 'компьютер', art: '', alias: ['компьютера', 'компютер'] },
  phone:    { word: 'телефон',   art: '', alias: ['телефона'] },
  key:      { word: 'ключ',      art: '', alias: ['ключа'] },
  notebook: { word: 'тетрадь',   art: '', alias: ['тетради'] },
  bag:      { word: 'сумка',     art: '', alias: ['сумку', 'сумки'] },
  umbrella: { word: 'зонт',      art: '', alias: ['зонтик', 'зонта'] }
};
const LESSONS = WORLD_LESSONS('r');
const TEACHERS = worldTeachers(['Ivan', 'Olga', 'Anna', 'Pavel'], 'Нет.');

// le forme che il microfono scrive al posto di «это»; le parole vere della lezione (mai «corrette»)
const RU_ETO = ['эта', 'этот', 'эту', 'эти', 'эт', 'eto', 'etot', 'eta'];
const RU_KNOWN = new Set(['да', 'нет', 'не', 'или', 'что', 'это']);
// a una lettera di distanza (una cambiata, aggiunta o tolta)
function ruNear(a, b) {
  if (Math.abs(a.length - b.length) > 1 || a === b) return false;
  let i = 0, j = 0, d = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++d > 1) return false;
    if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
  }
  return d + (a.length - i) + (b.length - j) <= 1;
}

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
  // la frase in suoni semplici, per il confronto a orecchio (world.js): cirillico e latino danno gli stessi suoni,
  // le vocali non accentate si confondono (о/а, е/и/э/ы), le consonanti finali sorde, niente segni molli/duri
  sound: (text) => {
    const RU2L = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'i', ё: 'o', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'a',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'i', ю: 'u', я: 'a' };
    let t = String(text || '').toLowerCase().replace(/[^\p{L}\s]/gu, ' ');
    t = t.replace(/[а-яё]/g, c => RU2L[c] !== undefined ? RU2L[c] : c)
      .replace(/o/g, 'a').replace(/[eyj]/g, 'i').replace(/kh/g, 'h').replace(/w/g, 'v').replace(/c(?=[iea])/g, 's').replace(/c/g, 'k').replace(/q/g, 'k').replace(/x/g, 'ks')
      .replace(/b(?=\s|$)/g, 'p').replace(/d(?=\s|$)/g, 't').replace(/g(?=\s|$)/g, 'k').replace(/v(?=\s|$)/g, 'f').replace(/z(?=\s|$)/g, 's')
      .replace(/([a-z])\1+/g, '$1');
    return t.replace(/\s+/g, '').split('');
  },
  bareOk: true, notW: ['не'],   // il microfono a volte perde il piccolo «это»: «стол» da solo vale «это стол» (world.js)
  // per riconoscere: minuscole, ё = е, senza punteggiatura, gli alias
  tokens: (text) => {
    const w = String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
    // (Massi: «стол detto 50 volte, non lo riconosce»): gli alias, «эта/этот» = «это»,
    // e una parola sconosciuta a una sola lettera da una parola della lezione vale quella parola
    // parlando di seguito il microfono a volte attacca le parole («этостол», «эстол»): si staccano
    const W = Object.keys(ITEMS).map(k => ITEMS[k].word);
    const split = [];
    w.forEach(x => {
      const m = W.find(it => x.length > it.length && x.endsWith(it) && ['это', 'эта', 'эт', 'э', 'этот'].indexOf(x.slice(0, -it.length)) !== -1);
      if (m) split.push('это', m); else split.push(x);
    });
    const out = split.map(x => {
      if (RU_ETO.indexOf(x) !== -1) return 'это';
      const k = Object.keys(ITEMS).find(k => ITEMS[k].word === x || ITEMS[k].alias.indexOf(x) !== -1);
      if (k) return ITEMS[k].word;
      if (x.length >= 3 && !RU_KNOWN.has(x)) { const n = Object.keys(ITEMS).filter(k => ruNear(x, ITEMS[k].word)); if (n.length === 1) return ITEMS[n[0]].word; }
      return x;
    });
    return out;
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
  'что':   { it: 'sctò',    en: 'shto',      de: 'schtó' },
  'бутылка':   { it: 'butìlka',    en: 'boo-TIL-kuh',    de: 'butílka' },
  'чашка':     { it: 'ciàshka',    en: 'CHAHSH-kuh',     de: 'tscháschka' },
  'компьютер': { it: 'kampiùtier', en: 'kum-PYOO-ter',   de: 'kampjútjer' },
  'телефон':   { it: 'tilifòn',    en: 'tee-lee-FON',    de: 'tilifón' },
  'ключ':      { it: 'kliùc\'',    en: 'klyooch',        de: 'kljútsch' },
  'тетрадь':   { it: 'titràt\'',   en: 'tee-TRAHT',      de: 'titrát' },
  'сумка':     { it: 'sùmka',      en: 'SOOM-kuh',       de: 'súmka' },
  'зонт':      { it: 'zònt',       en: 'zont',           de: 'sónt' }
};
