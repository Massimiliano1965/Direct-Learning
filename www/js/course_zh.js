'use strict';
/* =====================================================================
   CORSO: cinese (mandarino), per chi parla italiano, inglese o tedesco. Lezioni 1 e 2 (motore comune: world.js).
     这是书。                    È un libro.          (senza articolo; «这是» = «questo è»)
     这是书吗？                   → 是，这是书。          (吗 alla fine = domanda sì / no)
     这是桌子吗？                 → 不，这不是桌子。
     这是书还是笔？               → 这是书。              (还是 = «o», nella domanda)
     这是什么？                   → 这是书。
   Sotto i caratteri la pronuncia con i toni (i segni sopra le vocali, come nel pinyin), scritta per chi legge
   italiano («gè scì sciū»), inglese («jè shì shōo») o tedesco («dschö schi schu»).
   ===================================================================== */

const COURSE = {
  lang: 'zh-CN',
  students: ['it', 'en', 'de'],
  name: '中文',
  brand: 'CIAO 中文',
  voiceTags: ['zh-cn', 'zh_cn', 'cmn-hans-cn', 'zh'],
  yourTurn: '',
  nowYou: '',
  demoWrong: '是，这是桌子。',
  speedSample: ['你好！', '我们说中文。']
};

const ITEMS = {
  book:   { word: '书',   art: '', alias: [] },
  table:  { word: '桌子', art: '', alias: [] },
  chair:  { word: '椅子', art: '', alias: [] },
  pen:    { word: '笔',   art: '', alias: [] },
  door:   { word: '门',   art: '', alias: [] },
  window: { word: '窗户', art: '', alias: ['窗'] }
};
const LESSONS = WORLD_LESSONS('z');
const TEACHERS = worldTeachers(['Wei', 'Li', 'Mei', 'Jun'], '不对。');

// il cinese si scrive senza spazi: si divide con le parole che si conoscono (le più lunghe prima)
const ZH_LEX = ['桌子', '椅子', '窗户', '什么', '还是', '不是', '这', '是', '书', '笔', '门', '吗', '不', '对', '窗'];
function zhSplit(text) {
  const t = String(text || ''), out = [];
  let i = 0;
  while (i < t.length) {
    const w = ZH_LEX.find(x => t.startsWith(x, i));
    if (w) { out.push(w === '不是' ? '不' : w); if (w === '不是') out.push('是'); i += w.length; continue; }
    const c = t[i];
    if (/[。．.]/.test(c)) out.push('.'); else if (/[？?]/.test(c)) out.push('?'); else if (/[，,、]/.test(c)) out.push(',');
    else if (/\p{L}/u.test(c)) out.push(c);
    i++;
  }
  return out;
}
const PH = {
  is:  (k) => '这是' + ITEMS[k].word + '。',
  isQ: (k) => '这是' + ITEMS[k].word + '吗？',
  yes: (k) => '是，这是' + ITEMS[k].word + '。',
  no:  (k) => '不，这不是' + ITEMS[k].word + '。',
  alt: (a, b) => '这是' + ITEMS[a].word + '还是' + ITEMS[b].word + '？',
  what: '这是什么？',
  isCore: (k) => '这是' + ITEMS[k].word,
  negCore: (k) => '这不是' + ITEMS[k].word,
  askCore: (k) => '这是' + ITEMS[k].word + '吗',
  yesW: ['是', '对'], noW: ['不'], orW: ['还是'],
  tokens: (text) => zhSplit(text).filter(w => /\p{L}/u.test(w)).map(w => w === '窗' ? '窗户' : w),
  words: (text) => zhSplit(text),
  trKey: (w) => w,
  joinTr: (parts) => parts.join(' ')
};

// La pronuncia con i toni: italiano (zh = «g» dolce, sh = «sc»), inglese, tedesco
const TR = {
  '这':   { it: 'gè',        en: 'jè',          de: 'dschö' },
  '是':   { it: 'scì',       en: 'shì',         de: 'schi' },
  '书':   { it: 'sciū',      en: 'shōo',        de: 'schū' },
  '桌子': { it: 'giuōze',    en: 'jwō-dzuh',    de: 'dschuō-dse' },
  '椅子': { it: 'ǐze',       en: 'ěe-dzuh',     de: 'ǐ-dse' },
  '笔':   { it: 'bǐ',        en: 'běe',         de: 'bǐ' },
  '门':   { it: 'mén',       en: 'mún',         de: 'mén' },
  '窗户': { it: 'ciuānghu',  en: 'chwāng-hoo',  de: 'tschuāng-hu' },
  '吗':   { it: 'ma',        en: 'mah',         de: 'ma' },
  '不':   { it: 'bù',        en: 'bòo',         de: 'bù' },
  '对':   { it: 'duì',       en: 'dwày',        de: 'duèi' },
  '还是': { it: 'hǎiscì',    en: 'hǎi-shì',     de: 'chǎi-schi' },
  '什么': { it: 'scénme',    en: 'shén-muh',    de: 'schén-me' },
  '.': { it: '.', en: '.', de: '.' }, '?': { it: '?', en: '?', de: '?' }, ',': { it: ',', en: ',', de: ',' }
};
