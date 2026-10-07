'use strict';
/* =====================================================================
   CAPITOLO 15: «Il passato con essere» (lezione 77, livello 3). Si carica dopo ci_it.js (le città) e passato_it.js (la nuvoletta).
   Max o Isa ricordano il viaggio (nella nuvoletta: davanti al monumento della città, con la freccia d'oro del passato):
     Max è andato a Roma.             Isa è andata a Parigi.          → ripete
     Dove è andato Max?               → Max è andato a Roma.   (va bene anche «È andato a Roma.»)
     Isa è andata a Londra?           → No, Isa non è andata a Londra.
     Max è andato a Roma o a Parigi?  → Max è andato a Roma.
   Il punto: «andare» al passato vuole «essere» (non «avere»), e il participio va con la persona: andato (Max), andata (Isa).
   Come nella lezione 22, -o azzurra e -a rosa. Errori: «Max ha andato», «Isa è andato», «in Roma», la città sbagliata.
   ===================================================================== */

const PE = { pe_m_roma: 1, pe_f_parigi: 1, pe_m_londra: 1, pe_f_roma: 1, pe_m_newyork: 1, pe_f_londra: 1 };
const isPe = (X) => !!PE[X];
const peWho = (X) => X.charAt(3);
const peCity = (X) => X.slice(5);
const peName = (X) => vName(peWho(X));
const pePart = (X) => peWho(X) === 'f' ? 'andata' : 'andato';
const peSay = (X, c, neg) => peName(X) + (neg ? ' non' : '') + ' è ' + pePart(X) + ' ' + cvAt(c || peCity(X));     // «Isa è andata a Parigi»
const peQ = (X) => 'Dove è ' + pePart(X) + ' ' + peName(X) + '?';
const peOther = (X) => pick(CV_CITIES.filter(c => c !== peCity(X)));
Object.keys(PE).forEach(X => {
  Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(peWho(X), () => inner(cvFig('cv_' + peWho(X) + '_' + peCity(X) + '_e')).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '')) });
});

const SPE = gTag('pe', {
  present: (X) => { const p = peSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: peSay(X) + '?', model: 'Sì, ' + peSay(X) + '.' }),
  neg: (X) => { const o = peOther(X); return { type: 'neg', show: X, ask: o, prompt: peSay(X, o) + '?', model: 'No, ' + peSay(X, o, true) + '.', complete: peSay(X) + '.' }; },
  alt: (X) => { const o = peOther(X), ord = Math.random() < 0.5 ? [peCity(X), o] : [o, peCity(X)];
    return { type: 'alt', show: X, prompt: peSay(X, ord[0]) + ' o ' + cvAt(ord[1]) + '?', model: peSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: peQ(X), model: peSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: peQ(X) + ' ' + peSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: peQ(X), model: peQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) è andato a Roma» ---------- */
function peStatements(s) {
  s = s.replace(/ dove (e|ha) andat[oaie] [a-z]+ /g, ' # ').replace(/ new york /g, ' newyork ');
  const names = vNames(), out = [], re = / (?:([a-z]+) )?(non )?(e|ha|sono|hai) (andato|andata|andati|andate)(?: (a|in) ([a-z]+))?(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const subj = names[m[1]] || (m[1] === 'lui' ? 'm' : m[1] === 'lei' ? 'f' : null);
    out.push({ subj: subj, neg: !!m[2], aux: m[3], part: m[4], prep: m[5] || null, city: m[6] && CV_CITIES.indexOf(m[6]) !== -1 ? m[6] : (m[6] ? '?' : null) });
  }
  return out;
}
const peOk = (x, X) => x.aux === 'e' && x.part === pePart(X) && (x.subj === null || x.subj === peWho(X)) && (x.prep === null || x.prep === 'a');
function peEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(peQ(X)).trim()), full: true };
  const st = peStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => peOk(x, X) && x.city === peCity(X), allPos = pos.every(truth);
  // anche solo «A Roma.» alla domanda «Dove?»
  const bare = step.type === 'key' && !st.length && new RegExp(' a ' + GEO[peCity(X)].name.toLowerCase().replace(' ', '') + ' ').test(s.replace(/ new york /g, ' newyork '));
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && peOk(neg[0], X) && neg[0].city === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: (pos.some(truth) && allPos && !neg.length || bare) && !yes && !no && !has(s, 'o'), full: true };
  }
}
function peEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || peQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'dove e andato') || has(s, 'dove e andata')) return has(s, gNorm(peQ(X)).trim()) ? { ok: true, kind: 'what' } : bad();
  const st = peStatements(s);
  if (st.length === 1 && peOk(st[0], X) && st[0].city && st[0].city !== '?') return { ok: true, kind: st[0].city === peCity(X) ? 'yes' : 'no', ask: st[0].city };
  if (st.length === 1 && st[0].city && st[0].city !== '?') return bad(peSay(X, st[0].city) + '?');
  return bad();
}
function peAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + peSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + peSay(X, r.ask, true) + '. ' + peSay(X) + '.';
  return peSay(X) + '.';
}
gInstall('pe', isPe, SPE, peEvaluate, peEvalAsk, peAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.pe ? ['andato', 'andata'] : bGw(lesson);
}
