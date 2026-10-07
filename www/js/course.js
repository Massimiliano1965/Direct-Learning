'use strict';
/* =====================================================================
   CORSO: italiano per chi parla inglese, tedesco o giapponese.
   Qui stanno solo le parole, le lezioni e gli insegnanti; le regole della
   lezione sono in logic.js. Un altro corso = un altro file come questo.
   ===================================================================== */

const COURSE = {
  lang: 'it-IT',        // lingua che si impara: voce e microfono
  students: ['en', 'de', 'ja', 'it'],   // lingue dello studente offerte («Che lingua parli?»): menu e messaggi
  name: 'Italiano',
  voiceTags: ['it-it'],                 // come si riconoscono le voci italiane del telefono
  // L'insegnante non usa parole che l'allievo non conosce (confondono): «tocca a te» lo dice il gesto,
  // l'entusiasmo lo mostra il corpo, l'errore è solo «No.»
  yourTurn: '',
  nowYou: '',
  demoWrong: 'Sì, è un sedia.',         // l'errore della lezione di prova
  speedSample: ['Ciao, sono {name}.', 'Parliamo italiano insieme.'],   // la frase d'esempio quando si sceglie la velocità
  // parole che vanno bene tutte e due: nella frase scritta si alternano (la prima è quella principale).
  // Terzo elemento (se c'è): la parola davanti alla quale NON si scambiano («A che ora è l'aereo?» resta così)
  // (la voce dell'insegnante, nelle domande, ogni tanto usa la seconda; il microfono le accetta tutte e due)
  synonyms: [['neanche', 'nemmeno'], ['che ora è', 'che ore sono', 'a'], ['che cos\'è', 'cos\'è'], ['o', 'oppure'], ['cosa fa', 'che cosa fa']]
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
  computer: { word: 'computer',  art: 'un',  alias: ['computers', 'compiuter'] },
  phone:    { word: 'telefono',  art: 'un',  alias: ['telefoni'] },
  notebook: { word: 'quaderno',  art: 'un',  alias: ['quaderni'] },
  lamp:     { word: 'lampada',   art: 'una', alias: ['lampade'] },
  // lezione 5 (2026: chi viaggia e lavora): telefono, portatile, cappotto; valigia, borraccia, tazza
  laptop:   { word: 'portatile', art: 'un',  alias: ['portatili', 'portabile'] },
  coat:     { word: 'cappotto',  art: 'un',  alias: ['cappotti', 'capotto'] },
  suitcase: { word: 'valigia',   art: 'una', alias: ['valige', 'valigie', 'valiggia'] },
  flask:    { word: 'borraccia', art: 'una', alias: ['borracce', 'boraccia'] },
  // lezione 16 (capitolo 3): «un, una, un', uno»
  umbrella: { word: 'ombrello',  art: 'un',  alias: ['ombrelli', 'ombrella'] },
  agenda:   { word: 'agenda',    art: "un'", alias: ['agende'] },
  orange:   { word: 'arancia',   art: "un'", alias: ['arance', 'arancio', 'aranci'] },
  backpack: { word: 'zaino',     art: 'uno', alias: ['zaini'] },
  mirror:   { word: 'specchio',  art: 'uno', alias: ['specchi'] },
  // lezione 22 («Il, la o l'?»): parole con l' che finiscono in -o o in -a
  plane:     { word: 'aereo',     art: 'un',  alias: ['aerei', 'areo'] },
  label:     { word: 'etichetta', art: "un'", alias: ['etichette', 'etichetto'] },
  ambulance: { word: 'ambulanza', art: "un'", alias: ['ambulanze'] },
  soda:      { word: 'aranciata', art: "un'", alias: ['aranciate', 'arancia ta'] }
};

// Colori (lezione 5): forma maschile e femminile. Il rosso è il colore nuovo, da scoprire.
const COLORS = {
  nero:   { m: 'nero',   f: 'nera' },
  bianco: { m: 'bianco', f: 'bianca' },
  rosso:  { m: 'rosso',  f: 'rossa' }
};

// Lezioni. known = parole presentate subito; fresh = oggetto nuovo che non si nomina
// finché l'allievo non è "stufo" di dire di no (poi arriva «Che cos'è?»).
const LESSONS = [
  { id: 'l1', title: 'Lezione 1', known: ['book', 'table', 'chair'], fresh: 'pen' },
  // dalla lezione 2: «questo/questa». Libro e tavolo (lezione 1) in ripasso, per avere anche il maschile
  { id: 'l2', title: 'Lezione 2', known: ['chair', 'door'], review: ['book', 'table'], fresh: 'window', dq: true, questoIntro: true },
  // dal capitolo 1 del libro: «Una bottiglia e una tazza», «È questo un computer?» (era il magnetofono)
  { id: 'l3', title: 'Lezione 3', known: ['bottle', 'cup'], review: ['book', 'table', 'chair', 'pen', 'door', 'window'],
    fresh: 'computer', questo: true, dq: true },
  // oggetti nuovi (con «il» e «la» nella lezione 5 arrivano i colori)
  { id: 'l4', title: 'Lezione 4', known: ['phone', 'key', 'notebook', 'bag'], review: ['book', 'pen', 'cup', 'chair'],
    fresh: 'lamp', questo: true, dq: true },
  // «Il o la? Nero o nera?»: ogni oggetto ha il suo colore. known = presentati subito (nero e bianco);
  // fresh = oggetti rossi, il colore nuovo da scoprire con «Di che colore è…?»
  { id: 'l5', title: 'Lezione 5', colors: true,
    known: ['phone_nero', 'laptop_bianco', 'suitcase_nero', 'flask_bianco'], reds: ['coat_rosso', 'cup_rosso'] },
  // «Che numero è?» (capitolo 1, esercizio 4): da uno a cinque, poi il sei da scoprire
  { id: 'l6', title: 'Lezione 6', numbers: true, known: ['n1', 'n2', 'n3', 'n4', 'n5'], fresh: 'n6' },
  // sette, otto, nove (ripasso 1–6), poi il dieci da scoprire
  { id: 'l7', title: 'Lezione 7', numbers: true, known: ['n7', 'n8', 'n9'], review: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'], fresh: 'n10' },
  // capitolo 2, esercizio 5 B: «Che cosa è Roma?» — città (il loro monumento) e paesi (mappa con la bandiera)
  { id: 'l8', title: 'Lezione 8', geo: 'cat', known: ['g_roma', 'g_italia', 'g_parigi', 'g_francia', 'g_newyork', 'g_america', 'g_londra', 'g_cina'] },
  // capitolo 2, esercizio 5 A: «In o a?» — il Colosseo è a Roma, in Italia; la Grande Muraglia da scoprire con «Dov'è…?»
  { id: 'l9', title: 'Lezione 9', geo: 'dove', placeHints: true, known: ['g_colosseo', 'g_eiffel', 'g_bigben', 'g_liberta'], fresh: 'g_muraglia' },
  // capitolo 2, esercizio 6: «Il mio, la Sua» — gli stessi oggetti dell'insegnante e dello studente
  { id: 'l10', title: 'Lezione 10', poss: true, known: ['o_t_phone', 'o_s_phone', 'o_t_suitcase', 'o_s_suitcase', 'o_t_laptop', 'o_s_bag'] },
  // capitolo 2: «Questo o questa? Piccolo o piccola?» — lo stesso oggetto grande e piccolo (size_it.js)
  { id: 'l11', title: 'Lezione 11', size: true, known: ['z_big_book', 'z_small_book', 'z_big_suitcase', 'z_small_suitcase', 'z_big_cup', 'z_small_cup'] },
  // capitolo 2: «Il suo, la sua» — le cose di due colleghi dell'insegnante, un uomo e una donna (third_it.js)
  { id: 'l12', title: 'Lezione 12', third: true, known: ['p3_f_phone', 'p3_m_laptop', 'p3_f_suitcase', 'p3_m_bag', 'p3_m_coat', 'p3_f_flask'] },
  // capitolo 2: «Paese e nazionalità» — un signore o una signora con la bandiera del suo paese (nat_it.js)
  { id: 'l13', title: 'Lezione 13', nat: true, known: ['n_m_italia', 'n_f_italia', 'n_f_francia', 'n_m_inghilterra', 'n_f_america', 'n_m_cina'] },
  // capitolo 2: «Il verbo essere» — io sono / Lei è / lui è / lei è, con le persone della lezione 13 (essere_it.js)
  { id: 'l14', title: 'Lezione 14', ess: true, known: ['e_me', 'e_you', 'n_m_inghilterra', 'n_f_francia', 'n_m_cina', 'n_f_america'] },
  // capitolo 2: «Un altro, un'altra» — lo stesso oggetto in due colori; il primo resta piccolo sotto il palco (altro_it.js)
  { id: 'l15', title: 'Lezione 15', altro: true, known: ['phone_nero', 'phone_bianco', 'suitcase_nero', 'suitcase_rosso', 'cup_bianco', 'cup_rosso'] },
  // capitolo 3: «Un, una, un', uno» — un ombrello, un'agenda, uno zaino, uno specchio; l'arancia da scoprire
  { id: 'l16', title: 'Lezione 16', known: ['umbrella', 'agenda', 'backpack', 'mirror'], review: ['key', 'book'],
    fresh: 'orange', questo: true, dq: true },
  // capitolo 3: «Il, la, l', lo» — le cose dei due colleghi, come nella lezione 12: «lo zaino di Max», «l'agenda di Giulia»
  { id: 'l17', title: 'Lezione 17', third: true, def: true,
    known: ['p3_m_backpack', 'p3_f_mirror', 'p3_m_agenda', 'p3_f_umbrella', 'p3_m_key', 'p3_f_book'] },
  // capitolo 3: «Preposizioni articolate» — su e in: sul tavolo, sulla sedia, sull'agenda, nel cappotto, nello zaino, nella borsa (prep_it.js)
  { id: 'l18', title: 'Lezione 18', prep: true, known: ['q_book', 'q_phone', 'q_orange', 'q_key', 'q_pen', 'q_bottle'] },
  // capitolo 3: «Anche — neanche» (neanche è il più usato; nemmeno e neppure vanno bene) con gli oggetti colorati (anche_it.js)
  { id: 'l19', title: 'Lezione 19', anche: true, known: ['phone_nero', 'suitcase_nero', 'laptop_bianco', 'cup_bianco', 'coat_rosso', 'flask_rosso'] },
  // capitolo 4: «Che ora è?» — orologi con le ore intere: «È l'una.» / «Sono le tre.» (ora_it.js)
  // «è» (l'una, mezzogiorno, mezzanotte) e «sono» (le due, le tre…) in evidenza nella frase scritta
  { id: 'l20', title: 'Lezione 20', ora: true, hilite: ['è', 'sono'], known: ['h1', 'h2', 'h3', 'h5', 'h8', 'h10', 'h12d', 'h12n'] },
  // capitolo 4: «A che ora?» — gli impegni (l'aereo, la riunione, la cena…) con il loro orologio: «alle tre», «all'una» (appt_it.js)
  { id: 'l21', title: 'Lezione 21', appt: true, known: ['a_plane', 'a_meeting', 'a_dinner', 'a_lunch', 'a_taxi', 'a_breakfast'] },
  // capitolo 4: «Il, la o l'?» — con l' non si sente se è maschile o femminile: lo dice la -o / la -a (in colore) del nome e del colore
  { id: 'l22', title: 'Lezione 22', colors: true, gender: true,
    known: ['umbrella_nero', 'clock_bianco', 'plane_bianco', 'agenda_nero', 'label_rosso', 'ambulance_bianco', 'soda_rosso'] },
  // capitolo 4: «Verbi al presente: Cosa fa…?» — i due colleghi della lezione 12 fanno qualcosa: «Max legge un libro.» (verbs_it.js)
  // il verbo (legge, apre, mangia…) sottolineato in oro nella frase scritta
  { id: 'l23', title: 'Lezione 23', verbs: true, hilite: ['legge', 'apre', 'mangia', 'beve', 'chiude', 'telefona'],
    known: ['v_m_read', 'v_m_open', 'v_m_eat', 'v_f_drink', 'v_f_close', 'v_f_phone'] }
];

// Quattro insegnanti, dal più rigido al più indulgente. gender = voce maschile o femminile.
// wrong = solo «No.» quando l'allievo sbaglia (con la sua icona, mark in data.js); praise vuoto: quando è giusto
// l'insegnante esulta col corpo, senza parole nuove; praiseEvery = ogni quante risposte giuste esulta;
// praiseChance = invece di un ritmo fisso, approva ogni tanto a caso (Max: sobrio, pollice in su, praisePose 'nod');
// repeats = quante ripetizioni dopo ogni errore, una voce per errore e poi da capo
// (massimo 5, mai sempre uguali). style serve solo a noi: l'allievo non lo vede.
const TEACHERS = {
  mass: {
    key: 'mass', name: 'Max', gender: 'm', style: 'Very strict', mark: 'wrong',
    rate: 1.1, pitch: 0.85, modelRate: 1.0, praiseEvery: 0, praiseChance: 0.25, praisePose: 'nod', repeats: [3, 5, 4, 5, 4],
    praise: [],
    wrong: 'No.',
    done: ''
  },
  giulia: {
    key: 'giulia', name: 'Giulia', gender: 'f', style: 'Strict', mark: 'notcorrect',
    rate: 1.05, pitch: 1.15, modelRate: 0.95, praiseEvery: 5, repeats: [3, 4, 3, 5, 3],
    praise: [],
    wrong: 'No.',
    done: ''
  },
  luca: {
    key: 'luca', name: 'Pietro', gender: 'm', style: 'Normal', mark: 'mistake',
    rate: 1.0, pitch: 0.92, modelRate: 0.9, praiseEvery: 3, repeats: [2, 3, 4, 2, 3],
    praise: [],
    wrong: 'No.',
    done: ''
  },
  sara: {
    key: 'sara', name: 'Sara', gender: 'f', style: 'Easygoing', mark: 'pity',
    rate: 0.95, pitch: 1.2, modelRate: 0.85, praiseEvery: 2, repeats: [1, 2, 1, 3, 2],
    praise: [],
    wrong: 'No.',
    done: ''
  }
};
const TRIAL_ROTATION = ['mass', 'giulia', 'luca', 'sara'];
// Prova per Papa: tutti gli insegnanti liberi, la scelta resta finché non la cambia.
// Per la prova di 8 giorni con rotazione: false.
const TEST_MODE = true;
// Pulsanti di prova sotto la lezione («Avanti» e «Rispondo: sì/no»), solo per le prove di Massi.
// A progetto finito: false (spariscono).
const TEST_BUTTONS = true;
const TRIAL_DAYS = 8;   // due giorni per insegnante, poi il consiglio
const MIN_ANSWERS_FOR_VERDICT = 20;

// Pulsanti della lezione: prima nella lingua dell'allievo, poi nella lingua del corso
// (quando ci sarà la lezione dei pulsanti: MENU_LESSON).
const UI_WORDS = {
  talk:   { lang: 'Parla' },
  repeat: { lang: 'Riascolta' },
  exit:   { lang: 'Esci' }
};
const MENU_LESSON = null;
const UI_SWITCH_DAYS = 3;   // giorni dopo la lezione dei pulsanti prima del cambio
const UI_HINT_DAYS = 4;     // poi, per questi giorni, resta piccola la parola dell'allievo sotto
