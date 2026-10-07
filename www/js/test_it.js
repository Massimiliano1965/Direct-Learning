'use strict';
/* =====================================================================
   TEST DI FINE LIVELLO 1: «La giornata di Max» (deciso con Massi).
   Si carica dopo tutte le lezioni del livello 1. Una storia di scene: in ognuna l'insegnante fa una domanda
   (la domanda chiave di una lezione, con le sue regole); due volte è l'allievo che fa la domanda;
   alla fine quattro figure da descrivere liberamente, che NON contano nel punteggio.
   Durante il test non si dice mai giusto o sbagliato: gli errori si vedono solo alla fine, con la frase giusta
   accanto, e le lezioni da ripassare (il ripasso si può fare o saltare; il test non blocca il livello 2).
   ===================================================================== */

// Le scene in ordine. step() = il passo della lezione (con le sue regole); lesson = la lezione da ripassare se è sbagliata.
const TEST1 = [
  { lesson: 'l20', step: () => SO.key('h8') },                       // Che ore sono? Sono le otto.
  { lesson: 'l21', step: () => SA2.key('a_breakfast') },             // A che ora è la colazione? La colazione è alle sette.
  { lesson: 'l33', step: () => SCE.key('ce_cup_2') },                // Che cosa c'è sul tavolo? Ci sono due tazze.
  { lesson: 'l23', step: () => SV.key('v_m_read') },                 // Cosa fa Max? Max legge un libro.
  { lesson: 'l31', step: () => SEA.keyHa('ea_m_phone_nero') },       // Che cosa ha Max? Max ha un telefono.
  { lesson: 'l5',  step: () => SC.key('suitcase_nero') },            // Di che colore è la valigia? La valigia è nera.
  { lesson: 'l17', step: () => SW.key('p3_f_umbrella') },            // Di chi è questo ombrello? È l'ombrello di Isa.
  { lesson: 'l23', ask: 'v_f_phone' },                               // l'allievo fa la domanda («Cosa fa Isa?»)
  { lesson: 'l21', step: () => SA2.key('a_taxi') },                  // A che ora è il taxi? Il taxi è alle cinque.
  { lesson: 'l29', step: () => SKM.key('km_roma_milano') },          // Quanti chilometri ci sono da Roma a Milano?
  { lesson: 'l9',  step: () => SG.dKey('g_colosseo') },              // Dov'è il Colosseo? Il Colosseo è a Roma.
  { lesson: 'l34', step: () => SCO.key('co_book_1') },               // Quanto costa il libro? Costa dodici euro.
  { lesson: 'l13', step: () => SN2.key('n_m_cina') },                // Di che nazionalità è lui? Lui è cinese.
  { lesson: 'l24', step: () => SPU.key('pp_m_key') },                // Perché Max prende la chiave? Per aprire la porta.
  { lesson: 'l25', step: () => SLD.key('ld_m_book') },               // Cosa fa Max con il libro? Lo legge.
  { lesson: 'l28', step: () => SSM.key('sm_20_8') },                 // Quanto fa venti più otto? Fa ventotto.
  { lesson: 'l32', ask: 'pl_pen_3' },                                // l'allievo fa la domanda («Che cosa sono?»)
  { lesson: 'l32', step: () => SPL.key('pl_book_2') },               // Che cosa sono? Sono due libri.
  { lesson: 'l35', step: () => SDT.key('dq_cup_bianco_2') },         // Di che colore sono queste tazze? Queste tazze sono bianche.
  { lesson: 'l21', step: () => SA2.key('a_dinner') }                 // A che ora è la cena? La cena è alle otto.
];
// Le quattro figure da descrivere (non contano): la frase d'esempio si mostra alla fine
const TEST1_FREE = [
  { fig: 'v_f_drink', example: () => SV.present('v_f_drink').model },
  { fig: 'ce_pen_3', example: () => SCE.present('ce_pen_3').model },
  { fig: 'f_nonno', example: () => SFM.present('f_nonno').model },
  { fig: 'pl_egg_3', example: () => SPL.present('pl_egg_3').model }
];
const TEST_FREE_Q = 'Che cosa vede?';
