'use strict';
/* =====================================================================
   TEST DI FINE LIVELLO 1: «La giornata di Max» (deciso con Massi).
   Si carica dopo tutte le lezioni del livello 1. Circa 5 minuti. Regola di Massi per TUTTI i test: sempre 8 scene che contano
   e 2 figure da descrivere liberamente (anche agli ultimi livelli: si sceglie fra tutto, soprattutto il livello appena finito). Una storia di scene: in ognuna l'insegnante fa una domanda
   (la domanda chiave di una lezione, con le sue regole); una volta è l'allievo che fa la domanda;
   alla fine due figure da descrivere liberamente, che NON contano nel punteggio.
   Durante il test non si dice mai giusto o sbagliato: gli errori si vedono solo alla fine, con la frase giusta
   accanto, e le lezioni da ripassare (il ripasso si può fare o saltare; il test non blocca il livello 2).
   ===================================================================== */

// Le scene in ordine. step() = il passo della lezione (con le sue regole); lesson = la lezione da ripassare se è sbagliata.
const TEST1 = [
  { lesson: 'l20', step: () => SO.key('h8') },                       // Che ore sono? Sono le otto.
  { lesson: 'l23', step: () => SV.key('v_m_read') },                 // Cosa fa Max? Max legge un libro.
  { lesson: 'l17', step: () => SW.key('p3_f_umbrella') },            // Di chi è questo ombrello? È l'ombrello di Isa.
  { lesson: 'l23', ask: 'v_f_phone', q: () => SV.key('v_f_phone').prompt },   // l'allievo fa la domanda («Cosa fa Isa?»)
  { lesson: 'l24', step: () => SPU.key('pp_m_key') },                // Perché Max prende la chiave? Per aprire la porta.
  { lesson: 'l13', step: () => SN2.key('n_m_cina') },                // Di che nazionalità è questo signore? È cinese.
  { lesson: 'l14', step: () => SE.key('e_me') },                     // Di che nazionalità sono (io)? È italiano.
  { lesson: 'l8', step: () => SG.key('g_roma') }                    // Che cosa è Roma? È una città.
];
// Le due figure da descrivere (non contano): la frase d'esempio si mostra alla fine
const TEST1_FREE = [
  { fig: 'v_f_drink', example: () => SV.present('v_f_drink').model },      // Anna beve un'aranciata.
  { fig: 'n_f_germania', example: () => SN2.present('n_f_germania').model } // Questa signora è tedesca.
];
const TEST_FREE_Q = 'Che cosa vede?';

// TEST DI FINE LIVELLO 2 (lezioni 26–50): stessa regola, 8 scene che contano e 2 figure libere (dopo la lezione 50)
const TEST2 = [
  { lesson: 'l45', step: () => SPS.key('ps_m_read') },               // Che cosa ha fatto Max? Max ha letto un libro.
  { lesson: 'l40', step: () => SST.key('st_f_male') },               // Come sta Isa? Isa sta male.
  { lesson: 'l41', step: () => SCL.key('cl_m_phone_1') },            // Max ha il telefono? Sì, ce l'ha.
  { lesson: 'l34', ask: 'co_book_1', q: () => SCO.key('co_book_1').prompt },   // l'allievo fa la domanda («Quanto costa il libro?»)
  { lesson: 'l44', step: () => SNE.key('ne_phone_giallo') },         // Il telefono è … o …? Non è né … né …. È giallo.
  { lesson: 'l28', step: () => SSM.key('sm_20_8') },                 // Quanto fa venti più otto? Fa ventotto.
  { lesson: 'l46', step: () => SLH.key('lh_f_window') },             // Che cosa ha fatto Isa con la finestra? L'ha chiusa.
  { lesson: 'l50', step: () => SGD.key('gd_mar') }                   // Che giorno è oggi? Oggi è martedì.
];
const TEST2_FREE = [
  { fig: 'sa_m_giorno', example: () => SSA.present('sa_m_giorno').model },   // Max dice: «Buongiorno!»
  { fig: 'pl_egg_3', example: () => SPL.present('pl_egg_3').model }          // Sono tre uova.
];
// TEST DI FINE LIVELLO 3 (lezioni 51–75): dopo la lezione 75
const TEST3 = [
  { lesson: 'l61', step: () => SLQ.key('lq_f_key') },                    // Che cosa ha fatto Isa con le chiavi? Le ha prese.
  { lesson: 'l63', step: () => SCZ.key('cz_m_cornetto') },               // Che cosa mangia Max a colazione? Max mangia un cornetto.
  { lesson: 'l64', step: () => SQU.key('qu_phone_bianco_rosso_f') },     // Quale telefono è rosso? Quel telefono.
  { lesson: 'l65', ask: 'fi_rosa_rosso', q: () => SFI.key('fi_rosa_rosso').prompt },   // l'allievo fa la domanda («Che fiore è?»)
  { lesson: 'l67', step: () => SNH.key('nh_m_book_3') },                 // Quanti libri ha Max? Ne ha tre.
  { lesson: 'l68', step: () => SRF.key('rf_m_alza') },                   // Che cosa fa Max? Max si alza.
  { lesson: 'l70', step: () => SVO.key('vo_f_drink') },                  // Che cosa vuole fare Isa? Isa vuole bere un'aranciata.
  { lesson: 'l75', step: () => SDVP.key('dvp_suitcase_sotto') }          // Dov'è la valigia? La valigia è sotto il tavolo.
];
const TEST3_FREE = [
  { fig: 'lp_f_key', example: () => SLP.present('lp_f_key').model },         // Anna prende le chiavi. Le prende.
  { fig: 'an_m_read_1', example: () => SAN.present('an_m_read_1').model }    // Max legge ancora.
];
// Livello 4 (le lezioni 79–100: si chiamano quando parte il test, i file sono caricati dopo)
const TEST4 = [
  { lesson: 'l79', step: () => SFU.key('fu_m_read') },                    // Che cosa farà Mario domani? Mario leggerà un libro.
  { lesson: 'l81', step: () => SLG.key('lg_m_giappone') },                // Che lingua parla questo signore? Parla giapponese.
  { lesson: 'l85', step: () => SPI.key('pi_f_scarpe') },                  // Che cosa piace ad Anna? Le piacciono le scarpe.
  { lesson: 'l87', step: () => STF.key('tf_piove') },                     // Che tempo fa? Piove.
  { lesson: 'l92', ask: 'via_m_treno_roma', q: () => SVIA.key('via_m_treno_roma').prompt },   // l'allievo fa la domanda («Come va Mario a Roma?»)
  { lesson: 'l94', step: () => SMON.key('mit_torre') },                   // Dov'è la Torre di Pisa? A Pisa.
  { lesson: 'l96', step: () => SVOR.key('vor_conto') },                   // Che cosa desidera? Vorrei il conto.
  { lesson: 'l97', step: () => SCAL.key('cal_m_swim_past_2') }            // Che cosa ha fatto Mario ieri? Ha nuotato.
];
const TEST4_FREE = [
  { fig: 'cibo_m_pizza', example: () => SCIBO.present('cibo_m_pizza').model },   // A Napoli Mario mangia la pizza.
  { fig: 'hot_f_camera', example: () => SHOT.present('hot_f_camera').model }     // In albergo Anna è in camera.
];
const TESTS = { 1: { scenes: TEST1, free: TEST1_FREE }, 2: { scenes: TEST2, free: TEST2_FREE }, 3: { scenes: TEST3, free: TEST3_FREE }, 4: { scenes: TEST4, free: TEST4_FREE } };

// I passi del test: le domande delle lezioni (con le loro regole), il turno dell'allievo, le descrizioni libere
function buildTestSteps(lesson) {
  const st = [], T = TESTS[lesson.test] || TESTS[1];
  T.scenes.forEach(s => {
    if (s.step) { const x = s.step(); x.test = true; x.tlesson = s.lesson; st.push(x); return; }
    // l'allievo fa la domanda sulla figura (già scelta): va bene una domanda giusta qualsiasi su quella figura
    st.push({ type: 'ask', test: true, askFig: s.ask, show: s.ask, tlesson: s.lesson, prompt: '', model: s.q() });
  });
  T.free.forEach(f => st.push({ type: 'free', test: true, free: true, show: f.fig, prompt: TEST_FREE_Q, model: '', example: f.example() }));
  return st;
}
// Le lezioni da ripassare dopo il test: quelle delle risposte sbagliate (senza doppioni, nell'ordine del corso)
function testReviewLessons(results) {
  const ids = results.filter(r => r.ok === false).map(r => r.tlesson);
  return LESSONS.filter(l => ids.indexOf(l.id) !== -1).map(l => l.id);
}
// Numero della lezione nel menu (i test non contano)
const lessonNumber = (l) => LESSONS.filter(x => !x.test).indexOf(l) + 1;

(function () {
  const bBuild = buildSteps, bWords = lessonWords;
  buildSteps = (lesson) => lesson.test ? buildTestSteps(lesson) : bBuild(lesson);
  lessonWords = (l) => l.test ? [] : bWords(l);
})();
