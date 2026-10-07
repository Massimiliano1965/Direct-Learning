'use strict';
/* =====================================================================
   CAPITOLO 19: «Presente, passato, futuro» con il calendario (lezione 97, livello 4). Si carica dopo giorni_it.js e verbs_it.js.
   Massi: i tempi con il calendario, e cose nuove da fare (non sempre il libro e il telefono).
   In alto la settimana: «ieri – oggi – domani» sotto i giorni, il giorno della cosa segnato; sotto, Mario o Anna che la fanno:
     Ieri Mario ha nuotato.                         → ripete
     Che cosa ha fatto Mario ieri?                  → Ieri Mario ha nuotato.   (va bene anche «Ha nuotato.»)
     Che cosa fa Anna oggi?                         → Oggi Anna cucina.
     Che cosa farà Mario domani?                    → Domani Mario ballerà.
     Domani Mario canterà?                          → No, domani Mario non canterà.
   Le cose nuove (con il disegno): nuotare, cucinare, ballare, cantare, giocare a tennis, dormire.
   Errori: il tempo sbagliato («ieri Mario nuota», «domani ha ballato»), «Mario nuotato» senza «ha», la cosa sbagliata.
   ===================================================================== */

const CAL_ACT = {
  swim:   { pres: 'nuota',   past: 'nuotato',  fut: 'nuoterà',   inf: ['nuotare', 'nuoto', 'nuoti'] },
  cook:   { pres: 'cucina',  past: 'cucinato', fut: 'cucinerà',  inf: ['cucinare', 'cucino', 'cucini'] },
  dance:  { pres: 'balla',   past: 'ballato',  fut: 'ballerà',   inf: ['ballare', 'ballo', 'balli'] },
  sing:   { pres: 'canta',   past: 'cantato',  fut: 'canterà',   inf: ['cantare', 'canto', 'canti'] },
  tennis: { pres: 'gioca',   past: 'giocato',  fut: 'giocherà',  inf: ['giocare', 'gioco', 'giochi'], extra: ' a tennis' },
  sleep:  { pres: 'dorme',   past: 'dormito',  fut: 'dormirà',   inf: ['dormire', 'dormo', 'dormi'] }
};
const CAL_WHEN = { past: 'ieri', pres: 'oggi', fut: 'domani' };
// le figure: cal_<chi>_<cosa>_<quando>_<oggi è il giorno n della settimana>
const CAL = { cal_m_swim_past_2: 1, cal_f_cook_pres_4: 1, cal_m_dance_fut_3: 1, cal_f_sing_past_1: 1, cal_m_tennis_pres_3: 1, cal_f_sleep_fut_0: 1 };
const isCal = (X) => !!CAL[X];
const calP = (X) => X.split('_');
const calWho = (X) => calP(X)[1], calAct = (X) => calP(X)[2], calT = (X) => calP(X)[3], calToday = (X) => +calP(X)[4];
const calName = (X) => vName(calWho(X));
const calDoes = (a, t) => (t === 'past' ? 'ha ' + CAL_ACT[a].past : CAL_ACT[a][t]) + (CAL_ACT[a].extra || '');            // «ha nuotato», «gioca a tennis»
const calSay = (X, a, neg) => gCap(CAL_WHEN[calT(X)]) + ' ' + calName(X) + (neg ? ' non ' : ' ') + calDoes(a || calAct(X), calT(X));
const calQ = (X) => ({ past: 'Che cosa ha fatto ', pres: 'Che cosa fa ', fut: 'Che cosa farà ' })[calT(X)] + calName(X) + ' ' + CAL_WHEN[calT(X)] + '?';
const calOther = (X) => pick(Object.keys(CAL_ACT).filter(a => a !== calAct(X)));

/* ---------- Figure: la settimana con ieri / oggi / domani, e la persona che fa la cosa ---------- */
const CAL_NOTE = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"><path d="M0 0 v-9 l6 -2 v9" stroke="#f3d36b" stroke-width="1.4" fill="none"/><ellipse cx="-1.6" cy="0" rx="2.2" ry="1.6" fill="#f3d36b"/><ellipse cx="4.4" cy="-2" rx="2.2" ry="1.6" fill="#f3d36b"/></g>';
function calScene(a, LK) {
  const P = (arms, face, extra) => V_PERSON(LK, arms, face || { mouth: 'smile' }) + (extra || '');
  if (a === 'swim') return '<rect x="0" y="40" width="100" height="60" fill="#5fb0e6" opacity=".25"/>' +
    '<g transform="translate(0 30)">' + tHeadStill(LK, { mouth: 'smile' }) + '</g>' +
    '<path d="M38 66 q-10 -10 -18 -4 M62 66 q10 -14 20 -10" stroke="' + LK.skin + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M0 66 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 V100 H0z" fill="#3f9fd6"/><path d="M6 80 q6 -3 12 0 M40 86 q6 -3 12 0 M72 78 q6 -3 12 0" stroke="#bfe6f8" stroke-width="2" fill="none"/>';
  if (a === 'cook') return P(tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 60], [84, 64]) +
    '<path d="M38 8 q-6 -8 4 -9 q2 -7 8 -4 q6 -3 8 4 q10 1 4 9z" fill="#ffffff"/><rect x="39" y="7" width="22" height="6" fill="#ffffff"/>' +
    '<path d="M84 64 l6 -14" stroke="#a87a4e" stroke-width="2.4" stroke-linecap="round"/>', null,
    '') + '<rect x="72" y="76" width="28" height="20" fill="#8d93a3"/><path d="M74 66 h22 v10 q0 4 -4 4 h-14 q-4 0 -4 -4z" fill="#5d6577"/><path d="M80 62 q-3 -5 0 -9 M88 62 q-3 -5 0 -9" stroke="#e9edf2" stroke-width="1.6" fill="none"/>';
  if (a === 'dance') return P(tArm(LK, [35, 47], [24, 34], [18, 20]) + tArm(LK, [65, 47], [76, 34], [82, 20]), { mouth: 'open' }) + CAL_NOTE(14, 44) + CAL_NOTE(86, 46, .9) + CAL_NOTE(88, 14, .8) +
    '<path d="M10 70 q-4 -6 0 -12 M90 70 q4 -6 0 -12" stroke="#c9a45c" stroke-width="1.6" fill="none"/>';
  if (a === 'sing') return P(tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [70, 58], [58, 40]) +
    '<rect x="55.5" y="36" width="5" height="12" rx="2" fill="#3a3f4a"/><circle cx="58" cy="34" r="4" fill="#8d93a3"/>', { mouth: 'o' }) + CAL_NOTE(74, 24) + CAL_NOTE(84, 14, .8) + CAL_NOTE(80, 40, .7);
  if (a === 'tennis') return P(tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [78, 38], [82, 24]) +
    '<path d="M82 24 l2 -8" stroke="#3a3f4a" stroke-width="2.6"/><ellipse cx="86" cy="8" rx="7" ry="9" fill="none" stroke="#c8323b" stroke-width="2.4"/><path d="M80 8 h12 M86 0 v16 M82 3 h8 M82 13 h8" stroke="#dfe4ea" stroke-width=".7"/>' +
    '<circle cx="70" cy="6" r="3.6" fill="#d9e84a"/><path d="M67.6 4.4 q2.4 1.6 4.8 0" stroke="#fff" stroke-width=".7" fill="none"/>', { mouth: 'open' });
  // dorme: il letto, la testa sul cuscino, gli occhi chiusi, «z z z»
  return '<rect x="8" y="54" width="10" height="34" rx="2" fill="#8e6741"/><rect x="8" y="70" width="86" height="14" rx="3" fill="#f3eee2"/><rect x="12" y="62" width="22" height="12" rx="5" fill="#ffffff"/>' +
    '<circle cx="26" cy="62" r="9" fill="' + LK.skin + '"/><path d="M17 60 q9 -12 18 0 q-3 -5 -9 -5 q-6 0 -9 5z" fill="' + LK.hair + '"/>' +
    '<path d="M22 63 q2 1.6 4 0 M28 63 q2 1.6 4 0" stroke="#2a3346" stroke-width="1" fill="none"/><path d="M30 70 h64 v10 h-64z" fill="#5b4a8b"/><rect x="88" y="62" width="6" height="26" rx="2" fill="#8e6741"/>' +
    '<text x="40" y="44" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#c9d6e2">z</text><text x="48" y="36" font-family="Georgia,serif" font-size="12" font-weight="bold" fill="#c9d6e2">z</text><text x="58" y="26" font-family="Georgia,serif" font-size="15" font-weight="bold" fill="#c9d6e2">Z</text>';
}
function calFig(X) {
  const k = p3Key(calWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[k]) || null;
  const today = calToday(X), day = today + (calT(X) === 'past' ? -1 : calT(X) === 'fut' ? 1 : 0);
  let cal = '<rect x="2" y="1" width="96" height="31" rx="4" fill="#f3eee2"/><rect x="2" y="1" width="96" height="5" rx="2.5" fill="#5b4a8b"/>';
  for (let i = 0; i < 7; i++) {
    const x = 4 + i * 13.4, on = i === today, act = i === day;
    cal += '<rect x="' + x + '" y="7.5" width="12" height="11" rx="2" fill="' + (on ? '#c9a45c' : i >= 5 ? '#f4dbe6' : '#e2dccd') + '"' + (act ? ' stroke="#d23c44" stroke-width="1.6"' : '') + '/>' +
      '<text x="' + (x + 6) + '" y="15.8" text-anchor="middle" font-size="7" font-weight="700" font-family="Arial,sans-serif" fill="' + (on ? '#1d2638' : '#5a5f6e') + '">' + DAY_INIT[i] + '</text>';
    const w = i === today - 1 ? 'ieri' : i === today ? 'oggi' : i === today + 1 ? 'domani' : '';
    // «oggi» sulla riga di sotto, «ieri» e «domani» su quella di sopra: così non si toccano
    if (w) cal += '<text x="' + (x + 6) + '" y="' + (w === 'oggi' ? 30 : 24.4) + '" text-anchor="middle" font-size="' + (w === 'domani' ? 5.4 : 5.8) + '" font-style="italic" font-weight="bold" font-family="Georgia,serif" fill="' + (act ? '#d23c44' : '#5a5f6e') + '">' + w + '</text>';
  }
  const scene = LK && typeof tTorso === 'function' ? '<g transform="translate(15 33) scale(.7)">' + calScene(calAct(X), LK) + '</g>' : '';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + scene + cal + '</svg>';
}
Object.keys(CAL).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => calFig(X) }); });

const SCAL = gTag('cal', {
  present: (X) => { const p = calSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: calSay(X) + '?', model: 'Sì, ' + calSay(X).charAt(0).toLowerCase() + calSay(X).slice(1) + '.' }),
  neg: (X) => { const o = calOther(X), n = calSay(X, o, true); return { type: 'neg', show: X, ask: o, prompt: calSay(X, o) + '?', model: 'No, ' + n.charAt(0).toLowerCase() + n.slice(1) + '.', complete: calSay(X) + '.' }; },
  alt: (X) => { const o = calOther(X), ord = Math.random() < 0.5 ? [calAct(X), o] : [o, calAct(X)];
    return { type: 'alt', show: X, prompt: calSay(X, ord[0]) + ' o ' + calDoes(ord[1], calT(X)) + '?', model: calSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: calQ(X), model: calSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: calQ(X) + ' ' + calSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: calQ(X), model: calQ(X) })
});

/* ---------- Capire le frasi: il verbo nel suo tempo, «ha» davanti al passato, ieri / oggi / domani, chi ---------- */
const CAL_FORM = {};
Object.keys(CAL_ACT).forEach(a => {
  const A = CAL_ACT[a];
  ['pres', 'past', 'fut'].forEach(t => { CAL_FORM[gNorm(A[t]).trim()] = { a: a, t: t }; });
  A.inf.forEach(w => { CAL_FORM[w] = { a: a, t: 'bad' }; });
});
function calStatements(s, X) {
  s = s.replace(new RegExp(' ' + gNorm(calQ(X)).trim() + ' ', 'g'), ' # ').replace(/ (che )?cosa (ha fatto|fa|fara) [a-z]+( ieri| oggi| domani)? /g, ' # ');
  const names = vNames(), w = s.trim().split(' '), out = [];
  for (let i = 0; i < w.length; i++) {
    const f = CAL_FORM[w[i]];
    if (!f || (f.a === 'cook' && /^(la|in|una)$/.test(w[i - 1] || ''))) continue;   // «la cucina» è la stanza
    let t = f.t, j = i - 1;
    if (t === 'past') { if (w[j] === 'ha') j--; else t = 'bad'; }                     // «Mario nuotato» senza «ha»
    const neg = w[j] === 'non';
    if (neg) j--;
    const who = names[w[j]] || (w[j] === 'lui' ? 'm' : w[j] === 'lei' ? 'f' : null);
    out.push({ a: f.a, t: t, neg: neg, who: who });
  }
  const when = ['ieri', 'oggi', 'domani'].filter(x => has(s, x));
  return { st: out, when: when };
}
function evaluateCal(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(calQ(X)).trim()), full: true };
  const { st, when } = calStatements(s, X), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const timeOk = when.every(x => x === CAL_WHEN[calT(X)]);                           // «domani» per una cosa di ieri: sbagliato
  const good = (x) => x.t === calT(X) && (x.who === null || x.who === calWho(X));
  const truth = (x) => good(x) && x.a === calAct(X), allPos = pos.every(truth) && timeOk;
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && good(neg[0]) && neg[0].a === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskCal(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || calQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(calQ(X)).trim()) || has(s, gNorm(calQ(X)).trim().replace(/ (ieri|oggi|domani)$/, ''))) return { ok: true, kind: 'what' };
  const { st } = calStatements(s, X);
  if (st.length === 1 && st[0].t === calT(X)) return { ok: true, kind: st[0].a === calAct(X) ? 'yes' : 'no', ask: st[0].a };
  if (st.length === 1) return bad(calSay(X, st[0].a) + '?');
  return bad();
}
function answerAskCal(X, r) {
  const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  if (r.kind === 'yes') return 'Sì, ' + lc(calSay(X)) + '.';
  if (r.kind === 'no') return 'No, ' + lc(calSay(X, r.ask, true)) + '. ' + calSay(X) + '.';
  return calSay(X) + '.';
}
gInstall('cal', isCal, SCAL, evaluateCal, evalAskCal, answerAskCal);
