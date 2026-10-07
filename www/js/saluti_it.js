'use strict';
/* =====================================================================
   CAPITOLO 7: «Saluti» (lezione 48, livello 2). Si carica dopo verbs_it.js e passato_it.js.
   Max o Isa salutano: la mattina (il sole), la sera (la luna), la notte (la luna e «Z z»), quando vanno via (la valigia),
   quando ricevono un regalo:
     Max dice: «Buongiorno!»                          → ripete
     Che cosa dice Max?                               → Buongiorno!   (va bene anche «Max dice: buongiorno.»)
     Max dice «Buongiorno»?                           → Sì, Max dice: «Buongiorno!»
     Max dice «Buonanotte»?                           → No, Max non dice: «Buonanotte!»
     Max dice «Buongiorno» o «Buonasera»?             → Buongiorno!
   Errori: il saluto sbagliato per l'ora («Buonasera» con il sole), «Grazie» per chi va via.
   ===================================================================== */

const SAL = { giorno: 'Buongiorno', sera: 'Buonasera', notte: 'Buonanotte', arriv: 'Arrivederci', grazie: 'Grazie' };
const SALU = { sa_m_giorno: 1, sa_f_sera: 1, sa_m_notte: 1, sa_f_arriv: 1, sa_m_grazie: 1, sa_f_giorno: 1 };
const isSa = (X) => !!SALU[X];
const saWho = (X) => X.charAt(3);
const saKind = (X) => X.slice(5);
const saName = (X) => vName(saWho(X));
const saSay = (X, k) => saName(X) + ' dice: «' + SAL[k || saKind(X)] + '!»';
const saQ = (X) => 'Che cosa dice ' + saName(X) + '?';
// la domanda «no»: un saluto vicino (per l'ora del giorno) così si guarda bene la figura
const saOther = (X) => pick({ giorno: ['sera', 'notte'], sera: ['giorno', 'notte'], notte: ['sera', 'giorno'], arriv: ['grazie', 'giorno'], grazie: ['arriv', 'sera'] }[saKind(X)]);

/* ---------- Figure: il cielo (sole / luna) o la cosa, e la persona che saluta ---------- */
const SALU_SUN = '<rect x="56" y="4" width="40" height="40" rx="10" fill="#8cc4e3"/><circle cx="76" cy="26" r="8" fill="#f3d36b"/>' +
  '<path d="M76 12 v-4 M76 40 v4 M62 26 h-4 M90 26 h4 M66 16 l-3 -3 M86 16 l3 -3 M66 36 l-3 3 M86 36 l3 3" stroke="#f3d36b" stroke-width="2" stroke-linecap="round"/>';
const SA_MOON = (night) => '<rect x="56" y="4" width="40" height="40" rx="10" fill="' + (night ? '#141a2e' : '#3b3f78') + '"/>' +
  (night ? '' : '<rect x="56" y="34" width="40" height="10" rx="0" fill="#c56b6b" opacity=".55"/>') +
  '<path d="M80 12 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#f1e6b8"/>' +
  '<circle cx="64" cy="12" r="1" fill="#fff"/><circle cx="70" cy="20" r=".8" fill="#fff"/><circle cx="62" cy="30" r=".9" fill="#fff"/>';
const SA_GIFT = '<g transform="translate(70 62)"><rect x="-9" y="-6" width="18" height="14" rx="1.5" fill="#c97bb5"/><rect x="-10" y="-9" width="20" height="5" rx="1.5" fill="#d996c8"/>' +
  '<path d="M0 -9 v17" stroke="#f3d36b" stroke-width="2.4"/><path d="M0 -9 q-6 -7 -8 -2 q2 3 8 2 q6 -7 8 -2 q-2 3 -8 2" fill="none" stroke="#f3d36b" stroke-width="1.6"/></g>';
function saFig(X) {
  const k = p3Key(saWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const kind = saKind(X), wave = tArm(LK, [65, 47], [74, 36], [72, 22]);
  let body, back = '';
  if (kind === 'giorno') { back = SALU_SUN; body = V_PERSON(LK, tArm(LK, ...DOWN_L) + wave, { mouth: 'open' }, -18); }
  else if (kind === 'sera') { back = SA_MOON(false); body = V_PERSON(LK, tArm(LK, ...DOWN_L) + wave, { mouth: 'open' }, -18); }
  else if (kind === 'notte') {
    back = SA_MOON(true);
    body = V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [70, 58], [56, 33]), { mouth: 'o' }, -18) +
      '<text x="42" y="14" font-size="8" font-weight="700" font-family="Georgia, serif" fill="#c9a45c">Z</text><text x="49" y="8" font-size="6" font-weight="700" font-family="Georgia, serif" fill="#c9a45c" opacity=".8">z</text>';
  } else if (kind === 'arriv') {
    const bag = inner(FIG.suitcase_rosso || FIG.suitcase).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
    body = V_PERSON(LK, tArm(LK, [35, 47], [26, 36], [28, 22]) + tArm(LK, [65, 47], [70, 66], [72, 78]), { mouth: 'open' }, -8) +
      '<g transform="translate(66 84) scale(.22) translate(-50 -50)">' + bag + '</g>' + vArrow([72, 30], [84, 22], [94, 32]);
  } else { body = V_PERSON(LK, tArm(LK, [35, 47], [40, 66], [58, 64]) + tArm(LK, [65, 47], [74, 66], [80, 64]), { mouth: 'open', happy: true }, -8) + SA_GIFT; }
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' + back + body + '</svg>';
}
Object.keys(SALU).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => saFig(X) }); });

const SSA = gTag('sa', {
  present: (X) => { const p = saSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: saName(X) + ' dice «' + SAL[saKind(X)] + '»?', model: 'Sì, ' + saSay(X) }),
  neg: (X) => { const o = saOther(X);
    return { type: 'neg', show: X, ask: o, prompt: saName(X) + ' dice «' + SAL[o] + '»?', model: 'No, ' + saName(X) + ' non dice: «' + SAL[o] + '!»', complete: saSay(X) }; },
  alt: (X) => { const o = saOther(X), ord = Math.random() < 0.5 ? [saKind(X), o] : [o, saKind(X)];
    return { type: 'alt', show: X, prompt: saName(X) + ' dice «' + SAL[ord[0]] + '» o «' + SAL[ord[1]] + '»?', model: SAL[saKind(X)] + '!' }; },
  key: (X) => ({ type: 'key', show: X, prompt: saQ(X), model: SAL[saKind(X)] + '!' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: saQ(X) + ' ' + SAL[saKind(X)] + '!', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: saQ(X), model: saQ(X) })
});

/* ---------- Capire le frasi: i saluti detti, con o senza «Max dice», anche con «non dice» ---------- */
const SA_WORD = { buongiorno: 'giorno', buonasera: 'sera', buonanotte: 'notte', arrivederci: 'arriv', grazie: 'grazie' };
function saGreets(s) {
  s = s.replace(/ che cosa dice [a-z]+ /g, ' # ').replace(/ buon giorno /g, ' buongiorno ').replace(/ buona sera /g, ' buonasera ')
    .replace(/ buona notte /g, ' buonanotte ').replace(/ arrive derci /g, ' arrivederci ');
  const out = [], w = s.trim().split(' ');
  let neg = false;
  for (let i = 0; i < w.length; i++) {
    if (w[i] === 'dice') neg = w[i - 1] === 'non';   // «non dice» vale fino al prossimo «dice»
    if (SA_WORD[w[i]]) out.push({ k: SA_WORD[w[i]], neg: neg });
  }
  return out;
}
function saEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(saQ(X)).trim()), full: true };
  const names = vNames(), wrongName = Object.keys(names).some(n => names[n] !== saWho(X) && has(s, n));
  const g = saGreets(s), pos = g.filter(x => !x.neg), neg = g.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const allPos = pos.every(x => x.k === saKind(X)), hasPos = pos.length > 0 && allPos;
  if (wrongName) return { ok: false, full: false };
  switch (step.type) {
    case 'echo': return { ok: hasPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && hasPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].k === step.ask && allPos, full: hasPos };
    default: return { ok: hasPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function saEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || saQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che cosa dice') || has(s, 'cosa dice')) return has(s, norm(vName(saWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const g = saGreets(s);
  if (g.length === 1 && has(s, 'dice')) return { ok: true, kind: g[0].k === saKind(X) ? 'yes' : 'no', ask: g[0].k };
  return bad();
}
function saAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + saSay(X);
  if (r.kind === 'no') return 'No, ' + saName(X) + ' non dice: «' + SAL[r.ask] + '!» ' + saSay(X);
  return SAL[saKind(X)] + '!';
}
gInstall('sa', isSa, SSA, saEvaluate, saEvalAsk, saAnswerAsk);
