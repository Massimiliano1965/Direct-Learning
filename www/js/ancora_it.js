'use strict';
/* =====================================================================
   CAPITOLO 14: «Ancora — non più» (lezione 73, livello 3). Si carica dopo gia_it.js e celha_it.js.
   Ancora: la persona fa la cosa, con la freccia verde che gira (continua). Non più: la persona è ferma e la cosa
   è nella nuvoletta, barrata in rosso (come «non ce l'ha», lezione 41):
     Max legge ancora.                    Isa non mangia più.           → ripete
     Max legge ancora?                    → Sì, legge ancora.
     Isa mangia ancora?                   → No, non mangia più.
     Max telefona ancora?                 → No, non telefona più.   (legge, non telefona)
     Max legge ancora o non legge più?    → Max legge ancora.
   Il punto: «ancora» (continua) e «non … più» (è finito). «ancora» e «non … più» sottolineati.
   Errori: «non legge ancora» (qui si dice «non legge più»), «legge più», il sì e il no scambiati.
   ===================================================================== */

const AN = { an_m_read_1: 1, an_f_eat_0: 1, an_m_phone_0: 1, an_f_drink_1: 1, an_m_eat_1: 1, an_f_read_0: 1 };
const AN_ACTS = ['read', 'eat', 'drink', 'phone'];
const isAn = (X) => !!AN[X];
const anWho = (X) => X.charAt(3);
const anAct = (X) => X.split('_')[2];
const anStill = (X) => X.slice(-1) === '1';
const anName = (X) => vName(anWho(X));
const anPhr = (a, still) => still ? ACTS[a].verb + ' ancora' : 'non ' + ACTS[a].verb + ' più';      // «legge ancora», «non legge più»
const anSay = (X) => anName(X) + ' ' + anPhr(anAct(X), anStill(X));
const anQ = (X, a) => anName(X) + ' ' + ACTS[a || anAct(X)].verb + ' ancora?';
const anAns = (a, still) => (still ? 'Sì, ' : 'No, ') + anPhr(a, still) + '.';
const anOther = (X) => pick(AN_ACTS.filter(a => a !== anAct(X)));

/* ---------- Figure: ancora = la scena con la freccia verde che gira; non più = ferma, la scena nella nuvoletta barrata ---------- */
function anFig(X) {
  const k = p3Key(anWho(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const a = anAct(X);
  if (anStill(X)) return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="34" ry="3" fill="#000" opacity=".25"/>' + V_SCENE[a](LK) +
    '<g transform="translate(86 16)"><circle r="9" fill="#1d2638" stroke="#3fb35f" stroke-width="1.4"/><path d="M-4.5 -2 A5 5 0 1 1 -3 4" fill="none" stroke="#3fb35f" stroke-width="2" stroke-linecap="round"/><path d="M-7.5 -3.5 l3.5 2.5 l1 -4z" fill="#3fb35f"/></g></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'flat' }, -20) +
    '<circle cx="42" cy="28" r="1.8" fill="#f3eee2"/><circle cx="47" cy="22" r="2.6" fill="#f3eee2"/>' +
    '<rect x="50" y="1" width="49" height="49" rx="16" fill="#f3eee2"/><rect x="52.5" y="3.5" width="44" height="44" rx="13" fill="#2a3346"/>' +
    '<g transform="translate(53 4) scale(.43)"><g opacity=".95">' + V_SCENE[a](LK) + '</g></g>' +
    '<path d="M56 7 l38 38 M94 7 l-38 38" stroke="#d23a3a" stroke-width="2.2" stroke-linecap="round" opacity=".85"/></svg>';
}
Object.keys(AN).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => anFig(X) }); });

const SAN = gTag('an', {
  present: (X) => { const p = anSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: anStill(X) ? 'yes' : 'neg', show: X, ask: anAct(X), prompt: anQ(X), model: anAns(anAct(X), anStill(X)), complete: '' }),
  neg: (X) => { const o = anOther(X); return { type: 'neg', show: X, ask: o, prompt: anQ(X, o), model: anAns(o, false), complete: anSay(X) + '.' }; },
  alt: (X) => { const a = anAct(X), ord = Math.random() < 0.5 ? [true, false] : [false, true];
    return { type: 'alt', show: X, prompt: anName(X) + ' ' + anPhr(a, ord[0]) + ' o ' + anPhr(a, ord[1]) + '?', model: anSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, ask: anAct(X), prompt: anQ(X), model: anAns(anAct(X), anStill(X)) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: anQ(X) + ' ' + anAns(anAct(X), anStill(X)), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: anQ(X), model: anQ(X) })
});

/* ---------- Capire le frasi: «(Max) legge ancora», «(Isa) non mangia più» ---------- */
function anStatements(s) {
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const v = VFORM[w[i]];
    if (!v || AN_ACTS.indexOf(v.act) === -1 || !/^(ancora|piu)$/.test(w[i + 1] || '')) continue;
    if (v.act === 'phone' && /^(il|un)$/.test(w[i - 1] || '')) continue;
    const neg = w[i - 1] === 'non', subj = names[w[neg ? i - 2 : i - 1]] || null;
    const still = w[i + 1] === 'ancora' && !neg, over = w[i + 1] === 'piu' && neg;
    out.push({ act: v.act, ok: v.p === 3 && (still || over), still: still, subj: subj });
  }
  return out;
}
function anEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const st = anStatements(s), yes = has(s, 'si'), no = has(s, 'no');
  const okFor = (x) => x.ok && (x.subj === null || x.subj === anWho(X)) && (x.act === anAct(X) ? x.still === anStill(X) : !x.still);
  if (!st.length || !st.every(okFor)) return { ok: false, full: false };
  if (step.type === 'echo' || step.type === 'alt') return { ok: st.some(x => x.act === anAct(X)) && !yes && !no, full: true };
  const about = st.find(x => x.act === step.ask);
  if (!about) return { ok: false, full: false };
  if (step.type === 'key') return { ok: about.still ? !no : !yes, full: true };
  return { ok: about.still ? yes && !no : no && !yes, full: true };
}
function anEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || anQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const st = anStatements(s);
  if (st.length === 1 && st[0].ok && st[0].still) return { ok: true, kind: st[0].act === anAct(X) && anStill(X) ? 'yes' : 'no', ask: st[0].act };
  return bad();
}
function anAnswerAsk(X, r) { return r.kind === 'yes' ? anAns(anAct(X), true) : anAns(r.ask, false) + (r.ask !== anAct(X) ? ' ' + anSay(X) + '.' : ''); }
gInstall('an', isAn, SAN, anEvaluate, anEvalAsk, anAnswerAsk);
