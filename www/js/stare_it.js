'use strict';
/* =====================================================================
   CAPITOLO 6: «Essere o stare» (lezione 40). Si carica dopo gen_it.js e verbs_it.js (i nomi dei due colleghi).
   Come stanno Max e Isa: bene, male (con la febbre) o stanchi (sbadigliano).
     Max sta bene.  Isa sta male.  Max è stanco.  Isa è stanca.   → ripete
     Come sta Max?                                                  → Max sta bene.   (va bene anche «Sta bene.»)
     Isa sta male?                                                  → Sì, Isa sta male.
     Max sta male?                                                  → No, Max non sta male.
     Isa è stanca o sta bene?                                       → Isa è stanca.
   Il punto: «stare» con bene e male, «essere» con stanco (stanco / stanca: -o azzurra, -a rosa). «sta» ed «è» sottolineati.
   Errori: «Max è bene», «Isa sta stanca», «Isa è stanco», «Max sto bene».
   ===================================================================== */

const STA = { st_m_bene: 1, st_f_male: 1, st_m_stanco: 1, st_f_bene: 1, st_m_male: 1, st_f_stanco: 1 };
const isSta = (X) => !!STA[X];
const stWho = (X) => X.charAt(3);
const stState = (X) => X.slice(5);
const stName = (X) => vName(stWho(X));
const stPhr = (st, w) => st === 'stanco' ? 'è ' + (w === 'f' ? 'stanca' : 'stanco') : 'sta ' + st;      // «sta bene», «è stanca»
const stNot = (st, w) => st === 'stanco' ? 'non è ' + (w === 'f' ? 'stanca' : 'stanco') : 'non sta ' + st;
const stSay = (X, st) => stName(X) + ' ' + stPhr(st || stState(X), stWho(X));
const stQ = (X) => 'Come sta ' + stName(X) + '?';
const stOther = (X) => pick(['bene', 'male', 'stanco'].filter(s => s !== stState(X)));

/* ---------- Figure: il collega o la collega che sta bene, sta male o è stanco ---------- */
function staFig(X) {
  const k = p3Key(stWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const st = stState(X);
  let arms, face, extra = '';
  if (st === 'bene') {        // sorride, pollice in su, una stellina d'oro
    face = { mouth: 'smile', brow: 1 }; arms = tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [77, 67], [71, 55], [0, -5.5]);
    extra = '<path d="M82 14 l2 5 l5 1 l-4 3 l1 5 l-4 -3 l-4 3 l1 -5 l-4 -3 l5 -1z" fill="#c9a45c"/>';
  } else if (st === 'male') { // febbre: termometro in bocca, mano sulla fronte, una goccia di sudore
    face = { mouth: 'flat', brow: -1 }; arms = tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [72, 34], [57, 15]);
    extra = '<path d="M51 31 l13 4" stroke="#e9edf2" stroke-width="2.2" stroke-linecap="round"/><circle cx="64.5" cy="35.2" r="1.8" fill="#c8262f"/>' +
      '<path d="M41 15 q-2 4 0 6 q2 -2 0 -6z" fill="#9fbcd0"/><path d="M44 28 h3 M53 28 h3" stroke="#d98c8c" stroke-width="1.6" opacity=".7"/>';
  } else {                    // stanco: occhi chiusi, sbadiglio, la mano davanti alla bocca, «Z z»
    face = { mouth: 'o' }; arms = tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [70, 58], [56, 33]);
    extra = '<ellipse cx="45.5" cy="23.6" rx="2.2" ry="1.8" fill="' + LK.skin + '"/><ellipse cx="54.5" cy="23.6" rx="2.2" ry="1.8" fill="' + LK.skin + '"/>' +
      '<path d="M43.8 24 q1.7 1.2 3.4 0 M52.8 24 q1.7 1.2 3.4 0" stroke="#2a2026" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '<text x="68" y="16" font-size="9" font-weight="700" font-family="Georgia, serif" fill="#c9a45c">Z</text><text x="76" y="9" font-size="6.5" font-weight="700" font-family="Georgia, serif" fill="#c9a45c" opacity=".8">z</text>';
  }
  const head = tHeadStill(LK, face);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="30" ry="3" fill="#000" opacity=".25"/>' +
    '<g transform="translate(0 6)">' + tTorso(LK) + head + extra + arms + '</g></svg>';
}
Object.keys(STA).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => staFig(X) }); });

const SST = gTag('sta', {
  present: (X) => { const p = stSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: stSay(X) + '?', model: 'Sì, ' + stSay(X) + '.' }),
  neg: (X) => { const o = stOther(X); return { type: 'neg', show: X, ask: o, prompt: stSay(X, o) + '?', model: 'No, ' + stName(X) + ' ' + stNot(o, stWho(X)) + '.', complete: stSay(X) + '.' }; },
  alt: (X) => { const o = stOther(X), ord = Math.random() < 0.5 ? [stState(X), o] : [o, stState(X)];
    return { type: 'alt', show: X, prompt: stName(X) + ' ' + stPhr(ord[0], stWho(X)) + ' o ' + stPhr(ord[1], stWho(X)) + '?', model: stSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: stQ(X), model: stSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: stQ(X) + ' ' + stSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: stQ(X), model: stQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) sta bene», «(Isa) (non) è stanca» ---------- */
function staStatements(s) {
  s = s.replace(/ come sta /g, ' # ');
  const names = vNames(), out = [], re = / (?:([a-z]+) )?(non )?(sta|sto|stai|stanno|e|sono|ha) (bene|male|stanco|stanca|stanchi|stanche)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const subj = names[m[1]] || (m[1] === 'lui' ? 'm' : m[1] === 'lei' ? 'f' : null);
    const st = /^stanc/.test(m[4]) ? 'stanco' : m[4];
    const g = m[4] === 'stanca' ? 'f' : m[4] === 'stanco' ? 'm' : null;
    const verbOk = st === 'stanco' ? m[3] === 'e' : m[3] === 'sta';
    out.push({ subj: subj, other: !!m[1] && !subj && !/^(si|no|e|ma)$/.test(m[1]), neg: !!m[2], st: st, g: g, good: verbOk && (st !== 'stanco' || !!g) });
  }
  return out;
}
const staOk = (x, X) => x.good && (x.subj === null ? !x.other : x.subj === stWho(X)) && (x.st !== 'stanco' || x.g === stWho(X));
function staEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'come sta') && has(s, norm(stName(X)).trim()), full: true };
  const st = staStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => staOk(x, X) && x.st === stState(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => staOk(x, X) && x.st === step.ask) && !neg.some(x => x.st === stState(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'come sta'), full: true };
  }
}
function staEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || stQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'come sta')) return has(s, norm(vName(stWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = staStatements(s);
  if (st.length === 1 && staOk(st[0], X)) return { ok: true, kind: st[0].st === stState(X) ? 'yes' : 'no', ask: st[0].st };
  if (st.length === 1) return bad(stSay(X, st[0].st) + '?');
  return bad();
}
function staAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + stSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + stName(X) + ' ' + stNot(r.ask, stWho(X)) + '. ' + stSay(X) + '.';
  return stSay(X) + '.';
}
gInstall('sta', isSta, SST, staEvaluate, staEvalAsk, staAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.sta ? ['stanco', 'stanca'] : bGw(lesson);
}
