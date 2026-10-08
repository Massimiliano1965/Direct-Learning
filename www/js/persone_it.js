'use strict';
/* =====================================================================
   LEZIONI 13b e 13c (Massi: «giovane e anziano ci vuole, quando introduciamo le persone»): le persone,
   dopo le nazionalità (lezione 13). Stampo choiceLesson (scelta_it.js); figure in piedi da azioni_fig.js (actStanding).
     Lezione 13b «Com'è?»:      Il bambino è giovane. La signora anziana… → Com'è la signora? La signora è anziana.
     Lezione 13c «Di dov'è?»:   Il ragazzo è di New York. Il bambino è di Londra. → Di dov'è il signore anziano? È di Roma.
   Le stesse sei persone: il bambino, la bambina, il ragazzo, la ragazza, il signore anziano, la signora anziana.
   Più avanti (Massi): coinvolgerle nelle altre lezioni con la terza persona (il bambino, la mamma, il papà, i nonni).
   ===================================================================== */

// the = come si dice nella lezione «Com'è?», who = come si dice in «Di dov'è?» (con «anziano» per i signori)
const PERS = {
  bambino: { the: 'il bambino', who: 'il bambino', g: 'm', age: 'giovane', city: 'londra', sc: .68 },
  bambina: { the: 'la bambina', who: 'la bambina', g: 'f', age: 'giovane', city: 'parigi', sc: .66 },
  ragazzo: { the: 'il ragazzo', who: 'il ragazzo', g: 'm', age: 'giovane', city: 'newyork', sc: .94 },
  ragazza: { the: 'la ragazza', who: 'la ragazza', g: 'f', age: 'giovane', city: 'osaka', sc: .92 },
  signore: { the: 'il signore', who: 'il signore anziano', g: 'm', age: 'anziano', city: 'roma', sc: .96, pose: { r: 5 } },
  signora: { the: 'la signora', who: 'la signora anziana', g: 'f', age: 'anziana', city: 'milano', sc: .92, pose: { r: 4 } }
};
const persKey = (X) => X.split('_')[1];
const persCap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// la persona in piedi (nel riquadro 120×120, i piedi a terra); sign = il cartello verde della città
function persFig(X, sign) {
  const P = PERS[persKey(X)];
  if (typeof actStanding !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  // il riquadro stretto intorno alla persona (e al cartello): le figure si vedono grandi
  let s = '<svg viewBox="' + (sign ? '4 14 104 96' : '18 20 84 90') + '" xmlns="http://www.w3.org/2000/svg"><ellipse cx="' + (sign ? 34 : 60) + '" cy="105" rx="22" ry="3" fill="#000" opacity=".25"/>';
  if (sign) {
    const name = PERS_CITY[P.city];
    const w = Math.max(36, name.length * 5.8 + 10);
    s += '<path d="M78 104 V48" stroke="#8d93a3" stroke-width="2.4"/>' +
      '<rect x="' + (78 - w / 2) + '" y="26" width="' + w + '" height="20" rx="3" fill="#2f7d4a" stroke="#f3eee2" stroke-width="1.4"/>' +
      '<text x="78" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="9.4" font-weight="bold" fill="#f3eee2">' + name.toUpperCase() + '</text>';
  }
  return s + actStanding(persKey(X), sign ? 34 : 60, P.sc, P.pose) + '</svg>';
}
const PERS_CITY = { newyork: 'New York', londra: 'Londra', parigi: 'Parigi', osaka: 'Osaka', roma: 'Roma', milano: 'Milano' };

/* ---------- Lezione 13b: Com'è? giovane / anziano / anziana ---------- */
const SETA = choiceLesson({
  flag: 'eta', CH: { giovane: { the: 'giovane', alias: ['giovani'] }, anziano: { the: 'anziano' }, anziana: { the: 'anziana' } },
  items: { eta_bambino: { who: null, c: 'giovane' }, eta_signora: { who: null, c: 'anziana' }, eta_ragazzo: { who: null, c: 'giovane' },
    eta_bambina: { who: null, c: 'giovane' }, eta_signore: { who: null, c: 'anziano' }, eta_ragazza: { who: null, c: 'giovane' } },
  say: (X, c, neg) => persCap(PERS[persKey(X)].the) + (neg ? ' non' : '') + ' è ' + c,
  // la risposta sbagliata giusta per la persona: giovane ↔ anziano (lui) / anziana (lei)
  others: (X) => { const P = PERS[persKey(X)]; return P.age === 'giovane' ? [P.g === 'f' ? 'anziana' : 'anziano'] : ['giovane']; },
  q: (X) => 'Com\'è ' + PERS[persKey(X)].the + '?',
  fig: (X) => persFig(X, false),
  wrong: ['sono', 'vecchio', 'vecchia']
});

/* ---------- Lezione 13c: Di dov'è? di New York / di Londra… ---------- */
const SDOVE = choiceLesson({
  flag: 'dove', CH: { newyork: { the: 'di New York' }, londra: { the: 'di Londra' }, parigi: { the: 'di Parigi' },
    osaka: { the: 'di Osaka' }, roma: { the: 'di Roma' }, milano: { the: 'di Milano' } },
  items: { dove_ragazzo: { who: null, c: 'newyork' }, dove_bambino: { who: null, c: 'londra' }, dove_signore: { who: null, c: 'roma' },
    dove_ragazza: { who: null, c: 'osaka' }, dove_signora: { who: null, c: 'milano' }, dove_bambina: { who: null, c: 'parigi' } },
  say: (X, c, neg) => persCap(PERS[persKey(X)].who) + (neg ? ' non' : '') + ' è ' + { newyork: 'di New York', londra: 'di Londra', parigi: 'di Parigi', osaka: 'di Osaka', roma: 'di Roma', milano: 'di Milano' }[c],
  q: (X) => 'Di dov\'è ' + PERS[persKey(X)].who + '?',
  fig: (X) => persFig(X, true),
  wrong: ['sono', 'a', 'in', 'da']
});
