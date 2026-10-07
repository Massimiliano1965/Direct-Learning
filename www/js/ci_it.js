'use strict';
/* =====================================================================
   CAPITOLO 7: «Ci vado, ci sono» (lezione 47, livello 2). Si carica dopo geo_it.js (le città) e verbs_it.js (i due colleghi).
   Max o Isa vanno in una città (con la valigia e la freccia verde verso il monumento) oppure ci sono già (davanti al monumento):
     Max va a Roma. Ci va.            Isa è a Parigi. C'è.          → ripete
     Max va a Roma?                   → Sì, ci va.
     Max va a Londra?                 → No, non ci va.
     Isa è a Parigi?                  → Sì, c'è.
     Isa è a Londra?                  → No, non c'è.
   Il punto: «ci» al posto di «a Roma»: ci va, c'è (ci + è). «ci va» e «c'è» sottolineati.
   Errori: «Sì, va», «Sì, ci è», «Sì, ci vado», «c'è» per chi va e «ci va» per chi c'è, la città sbagliata.
   ===================================================================== */

const CV = { cv_m_roma_va: 1, cv_f_parigi_e: 1, cv_f_londra_va: 1, cv_m_newyork_e: 1, cv_m_parigi_va: 1, cv_f_roma_e: 1 };
const CV_CITIES = ['roma', 'parigi', 'londra', 'newyork'];
const isCv = (X) => !!CV[X];
const cvWho = (X) => X.charAt(3);
const cvCity = (X) => X.split('_')[2];
const cvGo = (X) => X.split('_')[3] === 'va';
const cvName = (X) => vName(cvWho(X));
const cvAt = (c) => 'a ' + GEO[c].name;                                                   // «a Roma»
const cvQ = (X, c) => cvName(X) + (cvGo(X) ? ' va ' : ' è ') + cvAt(c || cvCity(X)) + '?';   // «Max va a Roma?»
const cvFull = (X) => cvName(X) + (cvGo(X) ? ' va ' : ' è ') + cvAt(cvCity(X)) + '.';
const cvShort = (X, neg) => (neg ? 'non ' : '') + (cvGo(X) ? 'ci va' : 'c\'è');
const cvAns = (X, yes) => yes ? 'Sì, ' + cvShort(X) + '.' : 'No, ' + cvShort(X, true) + '.';
const cvOther = (X) => pick(CV_CITIES.filter(c => c !== cvCity(X)));

/* ---------- Figure: chi va (valigia in mano, freccia verde verso il monumento piccolo) e chi c'è (davanti al monumento) ---------- */
function cvFig(X) {
  const k = p3Key(cvWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const mon = inner(FIG['g_' + cvCity(X)]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const base = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
  if (cvGo(X)) {
    const bag = inner(FIG.suitcase_rosso || FIG.suitcase).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
    return base + '<ellipse cx="30" cy="97" rx="24" ry="3" fill="#000" opacity=".25"/>' +
      '<g transform="translate(84 46) scale(.32) translate(-50 -50)" opacity=".85">' + mon + '</g>' +
      V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [70, 66], [72, 78]), { mouth: 'smile' }, -22) +
      '<g transform="translate(52 84) scale(.22) translate(-50 -50)">' + bag + '</g>' +
      vArrow([50, 22], [62, 12], [74, 22]) + '</svg>';
  }
  return base + '<g transform="translate(66 46) scale(.62) translate(-50 -50)">' + mon + '</g>' +
    '<ellipse cx="34" cy="97" rx="24" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [74, 36], [72, 22]), { mouth: 'smile' }, -16) + '</svg>';
}
Object.keys(CV).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cvFig(X) }); });

const SCV = gTag('cv', {
  present: (X) => { const p = cvFull(X) + ' ' + gCap(cvShort(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: cvQ(X), model: cvAns(X, true), yesAns: true }),
  neg: (X) => { const o = cvOther(X); return { type: 'neg', show: X, ask: o, prompt: cvQ(X, o), model: cvAns(X, false), complete: cvFull(X) }; },
  key: (X) => ({ type: 'key', show: X, prompt: cvQ(X), model: cvAns(X, true) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: cvQ(X) + ' ' + cvAns(X, true), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cvQ(X), model: cvQ(X) })
});

/* ---------- Capire le risposte: «sì, ci va», «no, non c'è» (gNorm: «c e») ---------- */
function cvParse(s, X) {
  const names = vNames(), wrongName = Object.keys(names).some(n => names[n] !== cvWho(X) && has(s, n));
  const pos = (cvGo(X) ? / ci va /.test(s.replace(/ non ci va /g, ' # ')) : / c e /.test(s.replace(/ non c e /g, ' # ')));
  const neg = cvGo(X) ? / non ci va /.test(s) : / non c e /.test(s);
  // le forme sbagliate: «ci è», «ci vado», «ci sono», «sì, va», la forma dell'altro verbo
  const bad = wrongName || / ci e | ci vado | ci sono | ci vai | lo va | la va /.test(s) || / (si|no|non) (va|e) /.test(s) ||
    (cvGo(X) ? / c e /.test(s) : / ci va /.test(s));
  return { pos: pos, neg: neg, bad: bad, yes: has(s, 'si'), no: has(s, 'no') };
}
function cvEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const p = cvParse(s, X);
  if (step.type === 'echo') return { ok: has(s, gNorm(cvFull(X)).trim()) && p.pos && !p.neg && !p.bad, full: true };
  if (p.bad) return { ok: false, full: false };
  if (step.type === 'neg') return { ok: p.neg && !p.yes, full: has(s, gNorm(cvFull(X)).trim()) };
  return { ok: p.pos && !p.neg && !p.no, full: true };
}
// L'allievo: «Max va a Roma?», «Max va a Londra?», «Dove va Max?» / «Dov'è Max?»
function cvEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cvQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const nm = norm(cvName(X)).trim(), other = norm(vName(cvWho(X) === 'm' ? 'f' : 'm')).trim();
  if (has(s, other) || !has(s, nm)) return bad();
  if (has(s, 'dove va') || has(s, 'dov e') || has(s, 'dove e')) return { ok: true, kind: 'what' };
  const m = / (va|e) (a|in) ([a-z ]+?) $/.exec(s.replace(/ new york /, ' newyork '));
  if (!m || CV_CITIES.indexOf(m[3]) === -1) return bad();
  if (m[2] !== 'a') return bad(cvName(X) + (m[1] === 'va' ? ' va ' : ' è ') + cvAt(m[3]) + '?');
  const right = m[3] === cvCity(X) && (m[1] === 'va') === cvGo(X);
  return { ok: true, kind: right ? 'yes' : 'no', verbGo: m[1] === 'va' };
}
function cvAnswerAsk(X, r) {
  if (r.kind === 'yes') return cvAns(X, true);
  if (r.kind === 'no') return 'No, ' + (r.verbGo ? 'non ci va' : 'non c\'è') + '. ' + cvFull(X);
  return cvFull(X);
}
gInstall('cv', isCv, SCV, cvEvaluate, cvEvalAsk, cvAnswerAsk);
