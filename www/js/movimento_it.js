'use strict';
/* =====================================================================
   LEZIONI 101 e 102 (prova, Massi: «voglio vedere i filmati delle azioni»): i verbi di movimento
   con il cartone animato sul palco (azioni_fig.js). Stampo choiceLesson (scelta_it.js).
     Lezione 101 «Si muove»:  Che cosa fa Mario?  → Mario cammina / corre / salta / cade / sale le scale / scende le scale.
     Lezione 102 «Le mani»:   Che cosa fa Anna?   → Anna prende la tazza / lancia la palla / apre la porta /
                                                     chiude la porta / spinge la scatola / tira la scatola.
   Si capisce il verbo (va bene anche senza la cosa: «Cammina.»); errori: un altro verbo, «io cammino», «camminare».
   Sul palco la figura si muove (AZ_ANIM: la figura → [verbo del cartone, chi]); nei riquadri sotto, un fotogramma fermo.
   ===================================================================== */

// la cosa dopo il verbo (solo nella frase dell'insegnante) e il fotogramma fermo per i riquadri
const MOV_VERB = {
  cammina: ['camminare', '', 0], corre: ['correre', '', 0], salta: ['saltare', '', 2], cade: ['cadere', '', 2],
  sale: ['salire', 'le scale', 2], scende: ['scendere', 'le scale', 2],
  prende: ['prendere', 'la tazza', 3], lancia: ['lanciare', 'la palla', 2], apre: ['aprire', 'la porta', 2],
  chiude: ['chiudere', 'la porta', 2], spinge: ['spingere', 'la scatola', 1], tira: ['tirare', 'la scatola', 1]
};
const AZ_ANIM = {};
const movWho = (X) => X.split('_')[1];                        // m = Mario, f = Anna
const movLook = (X) => movWho(X) === 'f' ? 'anna' : 'mario';
function movFig(X, it) {
  const v = MOV_VERB[it.c];
  return typeof actionPose === 'function' ? actionPose(v[0], actResolve(ACTIONS[v[0]].frames[v[2]]), movLook(X))
    : '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
}
// le forme sbagliate del verbo: infinito, io, tu (si riconoscono come errore)
function movWrong(verbs) {
  const out = [];
  verbs.forEach(c => { const inf = MOV_VERB[c][0], r = inf.slice(0, -3);
    out.push(inf, r + 'o', r + 'i'); });
  return out.concat(['sono', 'faccio', 'fa']);
}
function movLesson(flag, verbs, items) {
  const CH = {};
  verbs.forEach(c => { CH[c] = { the: c }; });
  Object.keys(items).forEach(X => { AZ_ANIM[X] = [MOV_VERB[items[X].c][0], movLook(X)]; });
  return choiceLesson({
    flag: flag, CH: CH, items: items,
    say: (X, c, neg) => vName(movWho(X)) + (neg ? ' non ' : ' ') + c + (MOV_VERB[c][1] ? ' ' + MOV_VERB[c][1] : ''),
    proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
    the: (c) => c + (MOV_VERB[c][1] ? ' ' + MOV_VERB[c][1] : ''),
    q: (X) => 'Che cosa fa ' + vName(movWho(X)) + '?',
    fig: movFig,
    wrong: movWrong(verbs)
  });
}
const SMOV = movLesson('mov', ['cammina', 'corre', 'salta', 'cade', 'sale', 'scende'], {
  mov_m_cammina: { who: 'm', c: 'cammina' }, mov_f_corre: { who: 'f', c: 'corre' }, mov_m_salta: { who: 'm', c: 'salta' },
  mov_f_cade: { who: 'f', c: 'cade' }, mov_m_sale: { who: 'm', c: 'sale' }, mov_f_scende: { who: 'f', c: 'scende' } });
const SMANI = movLesson('mani', ['prende', 'lancia', 'apre', 'chiude', 'spinge', 'tira'], {
  mani_f_prende: { who: 'f', c: 'prende' }, mani_m_lancia: { who: 'm', c: 'lancia' }, mani_f_apre: { who: 'f', c: 'apre' },
  mani_m_chiude: { who: 'm', c: 'chiude' }, mani_f_spinge: { who: 'f', c: 'spinge' }, mani_m_tira: { who: 'm', c: 'tira' } });
