'use strict';
/* =====================================================================
   CORSO: arabo (standard), per chi parla italiano, inglese o tedesco. Lezioni 1–4 (motore comune: world.js).
     هذا كتاب.                     Questo è un libro.      (maschile: هذا «hàdha»)
     هذه طاولة.                    Questo è un tavolo.     (femminile, finisce in ة: هذه «hàdhihi»)
     هل هذا كتاب؟                  → نعم، هذا كتاب.
     هل هذا قلم؟                   → لا، هذا ليس قلمًا.      (ليس / ليست, e la parola con «-an»)
     هل هذا كتاب أم قلم؟           → هذا كتاب.
     ما هذا؟                       → هذا كتاب.
   Il punto: هذا / هذه come «questo / questa» (lezione 2 del corso di italiano). Si scrive da destra a sinistra;
   sotto, la pronuncia per chi legge italiano («hàdha kitàb»), inglese («HAA-dhaa ki-TAAB») o tedesco («hádha kitáb»).
   ===================================================================== */

const COURSE = {
  lang: 'ar-SA',
  ttsAlt: 'ar',               // se la voce «ar-SA» non c'è, una voce araba qualsiasi
  students: ['it', 'en', 'de'],
  name: 'العربية',
  brand: 'CIAO العربية',
  voiceTags: ['ar-sa', 'ar_sa', 'ar-eg', 'ar-ae', 'ar'],
  yourTurn: '',
  nowYou: '',
  demoWrong: 'نعم، هذه كتاب.',
  speedSample: ['مرحبا!', 'نتكلم العربية.']
};

// f = femminile (هذه, ليست); acc = la parola dopo ليس / ليست (con «-an»)
const ITEMS = {
  book:   { word: 'كتاب',   f: false, acc: 'كتابًا',  art: '', alias: [] },
  table:  { word: 'طاولة',  f: true,  acc: 'طاولةً',  art: '', alias: ['طاوله'] },
  chair:  { word: 'كرسي',   f: false, acc: 'كرسيًا',  art: '', alias: [] },
  pen:    { word: 'قلم',    f: false, acc: 'قلمًا',   art: '', alias: [] },
  door:   { word: 'باب',    f: false, acc: 'بابًا',   art: '', alias: [] },
  window: { word: 'نافذة',  f: true,  acc: 'نافذةً',  art: '', alias: ['نافذه'] },
  bottle:   { word: 'زجاجة', f: true,  acc: 'زجاجةً', art: '', alias: [] },
  cup:      { word: 'كوب',   f: false, acc: 'كوبًا',  art: '', alias: [] },
  computer: { word: 'حاسوب', f: false, acc: 'حاسوبًا', art: '', alias: [] },
  phone:    { word: 'هاتف',  f: false, acc: 'هاتفًا', art: '', alias: [] },
  key:      { word: 'مفتاح', f: false, acc: 'مفتاحًا', art: '', alias: [] },
  notebook: { word: 'دفتر',  f: false, acc: 'دفترًا', art: '', alias: [] },
  bag:      { word: 'حقيبة', f: true,  acc: 'حقيبةً', art: '', alias: [] },
  umbrella: { word: 'مظلة',  f: true,  acc: 'مظلةً',  art: '', alias: [] }
};
const LESSONS = WORLD_LESSONS('a');
const TEACHERS = worldTeachers(['Omar', 'Layla', 'Salma', 'Karim'], 'لا.');

const arDem = (k) => ITEMS[k].f ? 'هذه' : 'هذا';
const arNot = (k) => ITEMS[k].f ? 'ليست' : 'ليس';
// per riconoscere: senza segni delle vocali, le alif tutte uguali, ة = ه, ى = ي; «كتابا» (con «-an») = «كتاب»
const arNorm = (w) => w.replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const AR_BASE = {};
Object.keys(ITEMS).forEach(k => { const b = arNorm(ITEMS[k].word); AR_BASE[b] = b; AR_BASE[b + 'ا'] = b; AR_BASE[arNorm(ITEMS[k].acc)] = b; });
const PH = {
  is:  (k) => arDem(k) + ' ' + ITEMS[k].word + '.',
  isQ: (k) => 'هل ' + arDem(k) + ' ' + ITEMS[k].word + '؟',
  yes: (k) => 'نعم، ' + arDem(k) + ' ' + ITEMS[k].word + '.',
  no:  (k) => 'لا، ' + arDem(k) + ' ' + arNot(k) + ' ' + ITEMS[k].acc + '.',
  alt: (a, b) => 'هل ' + arDem(a) + ' ' + ITEMS[a].word + ' أم ' + ITEMS[b].word + '؟',
  what: 'ما هذا؟',
  isCore: (k) => arDem(k) + ' ' + ITEMS[k].word,
  negCore: (k) => arDem(k) + ' ' + arNot(k) + ' ' + ITEMS[k].word,
  askCore: (k) => 'هل ' + arDem(k) + ' ' + ITEMS[k].word,
  // il «questo» sbagliato (هذه con una parola maschile) e ليس / ليست scambiati
  badCores: (k) => [(ITEMS[k].f ? 'هذا ' : 'هذه ') + ITEMS[k].word, arDem(k) + ' ' + (ITEMS[k].f ? 'ليس ' : 'ليست ') + ITEMS[k].word],
  yesW: ['نعم'], noW: ['لا'], orW: ['ام', 'او'],
  bareOk: true, notW: ['ليس', 'ليست'],   // parlata normale: la parola da sola vale la frase (world.js)
  tokens: (text) => arNorm(String(text || '')).replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).map(w => AR_BASE[w] || (w === 'هاذا' ? 'هذا' : w)),
  words: (text) => text.match(/[\p{L}ً-ْٰ]+|[.,?!،؟]/gu) || [],
  trKey: (w) => w === '،' ? ',' : w === '؟' ? '?' : w.replace(/[ٌ-ْٰ]/g, ''),     // il «-an» (ً) resta: «kitàban»
  joinTr: (parts) => parts.join(' ')
};

// La pronuncia: italiano (accento grave), inglese (sillaba forte in maiuscolo, «aa» = a lunga), tedesco (accento acuto)
const TR = {
  'هذا':   { it: 'hàdha',     en: 'HAA-dhaa',     de: 'hádha' },
  'هذه':   { it: 'hàdhihi',   en: 'HAA-dhi-hee',  de: 'hádhihi' },
  'كتاب':  { it: 'kitàb',     en: 'ki-TAAB',      de: 'kitáb' },
  'كتابًا': { it: 'kitàban',   en: 'ki-TAA-ban',   de: 'kitában' },
  'طاولة': { it: 'tàwila',    en: 'TAA-wi-la',    de: 'táwila' },
  'طاولةً': { it: 'tàwilatan', en: 'TAA-wi-la-tan', de: 'táwilatan' },
  'كرسي':  { it: 'kùrsi',     en: 'KOOR-see',     de: 'kúrsi' },
  'كرسيًا': { it: 'kursìyyan', en: 'koor-SIY-yan', de: 'kursíjjan' },
  'قلم':   { it: 'qàlam',     en: 'QA-lam',       de: 'qálam' },
  'قلمًا':  { it: 'qàlaman',   en: 'QA-la-man',    de: 'qálaman' },
  'باب':   { it: 'bàb',       en: 'baab',         de: 'báb' },
  'بابًا':  { it: 'bàban',     en: 'BAA-ban',      de: 'bában' },
  'نافذة': { it: 'nàfidha',   en: 'NAA-fi-dha',   de: 'náfidha' },
  'نافذةً': { it: 'nàfidhatan', en: 'NAA-fi-dha-tan', de: 'náfidhatan' },
  'ليس':   { it: 'làisa',     en: 'LAY-sa',       de: 'láisa' },
  'ليست':  { it: 'làisat',    en: 'LAY-sat',      de: 'láisat' },
  'نعم':   { it: 'nà\'am',    en: 'NA-\'am',      de: 'ná\'am' },
  'لا':    { it: 'là',        en: 'laa',          de: 'lá' },
  'هل':    { it: 'hal',       en: 'hal',          de: 'hal' },
  'أم':    { it: 'am',        en: 'am',           de: 'am' },
  'ما':    { it: 'mà',        en: 'maa',          de: 'má' },
  'زجاجة': { it: 'zugiàgia',   en: 'zoo-JAA-ja',      de: 'zudschádscha' },
  'زجاجةً': { it: 'zugiàgiatan', en: 'zoo-JAA-ja-tan', de: 'zudschádschatan' },
  'كوب':   { it: 'kùb',        en: 'koob',            de: 'kúb' },
  'كوبًا':  { it: 'kùban',      en: 'KOO-ban',         de: 'kúban' },
  'حاسوب': { it: 'hasùb',      en: 'haa-SOOB',        de: 'hasúb' },
  'حاسوبًا': { it: 'hasùban',   en: 'haa-SOO-ban',     de: 'hasúban' },
  'هاتف':  { it: 'hàtif',      en: 'HAA-tif',         de: 'hátif' },
  'هاتفًا': { it: 'hàtifan',    en: 'HAA-ti-fan',      de: 'hátifan' },
  'مفتاح': { it: 'miftàh',     en: 'mif-TAAH',        de: 'miftách' },
  'مفتاحًا': { it: 'miftàhan',  en: 'mif-TAA-han',     de: 'miftáchan' },
  'دفتر':  { it: 'dàftar',     en: 'DAF-tar',         de: 'dáftar' },
  'دفترًا': { it: 'dàftaran',   en: 'DAF-ta-ran',      de: 'dáftaran' },
  'حقيبة': { it: 'haqìba',     en: 'ha-QEE-ba',       de: 'haqíba' },
  'حقيبةً': { it: 'haqìbatan',  en: 'ha-QEE-ba-tan',   de: 'haqíbatan' },
  'مظلة':  { it: 'midhàlla',   en: 'mi-DHAL-la',      de: 'midhálla' },
  'مظلةً':  { it: 'midhàllatan', en: 'mi-DHAL-la-tan', de: 'midhállatan' },
  ',': { it: ',', en: ',', de: ',' }, '?': { it: '?', en: '?', de: '?' }
};
