'use strict';
/* =====================================================================
   CAPITOLO 8: «Possessivi: i suoi, le sue» (lezione 52, livello 2). Si carica dopo third_it.js e gen_it.js.
   Come la lezione 12 («è il suo telefono»), al plurale: due cose di Max o di Isa (il bollino con la faccia).
   «Suoi / sue» va con le cose, non con la persona: i suoi libri (di Isa), le sue chiavi (di Max).
     Sono i libri di Max. Sono i suoi libri.          → ripete
     Sono i libri di Max?                             → Sì, sono i suoi libri.
     Sono i libri di Isa?                             → No, non sono i suoi libri.
     Sono i libri di Max o di Isa?                    → Sono i libri di Max.
     Di chi sono questi libri?                        → Sono i libri di Max.
   Gli ombrelli → i suoi ombrelli (non «gli suoi»). Come nella lezione 22, -i azzurra e -e rosa non servono: -o/-a solo.
   Errori: «i sue libri», «le suoi chiavi», «gli suoi ombrelli», «il suo libri», la persona sbagliata.
   ===================================================================== */

const SPZ = { sp_m_book: 1, sp_f_key: 1, sp_f_book: 1, sp_m_key: 1, sp_m_umbrella: 1, sp_f_cup: 1 };
const isSp = (X) => !!SPZ[X];
const spWho = (X) => X.charAt(3);
const spObj = (X) => X.slice(5);
const spName = (w) => vName(w);
const spThe = (o) => gThe(o, 2);                                                      // «i libri», «gli ombrelli», «le chiavi»
const spPoss = (o) => (gFem(o) ? 'le sue ' : 'i suoi ') + PLURAL[o];                 // «i suoi libri», «le sue chiavi»
const spOf = (X, w) => spThe(spObj(X)) + ' di ' + spName(w || spWho(X));            // «i libri di Max»
const spQ = (X) => 'Di chi sono ' + (gFem(spObj(X)) ? 'queste ' : 'questi ') + PLURAL[spObj(X)] + '?';
const spOtherW = (X) => spWho(X) === 'm' ? 'f' : 'm';
FIG.key_giallo = FIG.key_giallo || FIG.key;
FIG.umbrella_giallo = FIG.umbrella_giallo || FIG.umbrella;

/* ---------- Figura: due cose e il bollino con la faccia del collega (come nella lezione 12) ---------- */
function spFig(X) {
  const o = spObj(X), f = o === 'key' ? FIG.key_giallo : o === 'umbrella' ? FIG.umbrella_giallo : FIG[o];
  const base = inner(gMany(f, 2));
  const k = p3Key(spWho(X)), look = TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca';
  const head = (typeof tHeadStill === 'function' && typeof LOOKS !== 'undefined') ? tHeadStill(LOOKS[look] || LOOKS.luca, { mouth: 'smile' }) : '';
  const badge = '<circle cx="84" cy="18" r="14" fill="#1d2638"/><g transform="translate(84 17) scale(.55) translate(-50 -26)">' + head + '</g><circle cx="84" cy="18" r="13" fill="none" stroke="#c9a45c" stroke-width="2.4"/>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + base + badge + '</svg>';
}
Object.keys(SPZ).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => spFig(X) }); });

const SSP = gTag('sp', {
  present: (X) => { const p = 'Sono ' + spOf(X) + '. Sono ' + spPoss(spObj(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: 'Sono ' + spOf(X) + '?', model: 'Sì, sono ' + spPoss(spObj(X)) + '.' }),
  neg: (X) => ({ type: 'neg', show: X, ask: spOtherW(X), prompt: 'Sono ' + spOf(X, spOtherW(X)) + '?', model: 'No, non sono ' + spPoss(spObj(X)) + '.', complete: 'Sono ' + spOf(X) + '.' }),
  alt: (X) => { const ord = Math.random() < 0.5 ? [spWho(X), spOtherW(X)] : [spOtherW(X), spWho(X)];
    return { type: 'alt', show: X, prompt: 'Sono ' + spOf(X, ord[0]) + ' o di ' + spName(ord[1]) + '?', model: 'Sono ' + spOf(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: spQ(X), model: 'Sono ' + spOf(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: spQ(X) + ' Sono ' + spOf(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: spQ(X), model: spQ(X) })
});

/* ---------- Capire le frasi: «(non) sono i libri di Max», «(non) sono i suoi libri» ---------- */
function spStatements(s) {
  s = s.replace(/ di chi sono [a-z]+ [a-z]+ /g, ' # ');
  const names = vNames(), out = [];
  let m;
  const reP = / (non )?(?:sono )?(i|gli|le|il|la|lo|l) (suoi|sue|suo|sua) ([a-z]+)(?= )/g;
  while ((m = reP.exec(s)) !== null) {
    const n = gNoun(m[4]);
    if (!n) continue;
    const want = gFem(n.obj) ? ['le', 'sue'] : ['i', 'suoi'];
    out.push({ kind: 'poss', neg: !!m[1], obj: n.obj, good: n.plural !== false && m[2] === want[0] && m[3] === want[1] });
  }
  const reO = / (non )?(?:sono )?(i|gli|le|il|la|lo|l) ([a-z]+) di ([a-z]+)(?= )/g;
  while ((m = reO.exec(s)) !== null) {
    const n = gNoun(m[3]);
    if (!n) continue;
    out.push({ kind: 'of', neg: !!m[1], obj: n.obj, who: names[m[4]] || '?', good: n.plural !== false && m[2] === gDef(n.obj, 2) });
  }
  return out;
}
function spEvaluate(step, text) {
  const s = gNorm(text), X = step.show, o = spObj(X), W = spWho(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(spQ(X)).trim()), full: true };
  const st = spStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.obj === o && (x.kind === 'poss' || x.who === W), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && pos.every(truth) && pos.some(x => x.kind === 'poss') && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.length > 0 && allPos && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].good && neg[0].obj === o && (neg[0].kind === 'poss' || neg[0].who === step.ask) && allPos, full: pos.length > 0 };
    default: return { ok: pos.some(x => truth(x) && x.kind === 'of') && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function spEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || spQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'di chi sono')) return has(s, gNorm(PLURAL[spObj(X)]).trim()) ? { ok: true, kind: 'what' } : bad();
  const st = spStatements(s).filter(x => x.kind === 'of');
  if (st.length === 1 && st[0].obj === spObj(X) && st[0].good && st[0].who !== '?') return { ok: true, kind: st[0].who === spWho(X) ? 'yes' : 'no' };
  if (st.length === 1 && st[0].obj === spObj(X)) return bad('Sono ' + spOf(X) + '?');
  return bad();
}
function spAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, sono ' + spPoss(spObj(X)) + '.';
  if (r.kind === 'no') return 'No, non sono ' + spPoss(spObj(X)) + '. Sono ' + spOf(X) + '.';
  return 'Sono ' + spOf(X) + '.';
}
gInstall('sp', isSp, SSP, spEvaluate, spEvalAsk, spAnswerAsk);
