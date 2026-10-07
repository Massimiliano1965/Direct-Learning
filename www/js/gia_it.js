'use strict';
/* =====================================================================
   CAPITOLO 13: «Già — non ancora» (lezione 69, livello 3). Si carica dopo passato_it.js (la nuvoletta del ricordo).
   Nella nuvoletta: con la freccia d'oro ↺ la cosa è fatta (già); con la clessidra azzurra e la scena sbiadita, non è ancora fatta:
     Max ha già mangiato.              Isa non ha ancora letto.          → ripete
     Max ha già mangiato?              → Sì, ha già mangiato.
     Isa ha già letto?                 → No, non ha ancora letto.
     Max ha già telefonato?            → No, non ha ancora telefonato.   (ha mangiato, non ha telefonato)
     Max ha già mangiato o non ha ancora mangiato?   → Max ha già mangiato.
   Il punto: «ha già …» / «non ha ancora …». «già» e «non ancora» sottolineati.
   Errori: «non ha già», «ha ancora mangiato», senza «già» / «ancora», il sì e il no scambiati.
   ===================================================================== */

const GN = { gn_m_eat_1: 1, gn_f_read_0: 1, gn_m_phone_0: 1, gn_f_drink_1: 1, gn_m_read_1: 1, gn_f_eat_0: 1 };
const GN_ACTS = ['eat', 'read', 'drink', 'phone'];
const isGn = (X) => !!GN[X];
const gnWho = (X) => X.charAt(3);
const gnAct = (X) => X.split('_')[2];
const gnDone = (X) => X.slice(-1) === '1';
const gnName = (X) => vName(gnWho(X));
const gnPhr = (a, done) => done ? 'ha già ' + PS_PART[a] : 'non ha ancora ' + PS_PART[a];      // «ha già mangiato», «non ha ancora letto»
const gnSay = (X) => gnName(X) + ' ' + gnPhr(gnAct(X), gnDone(X));
const gnQ = (X, a) => gnName(X) + ' ha già ' + PS_PART[a || gnAct(X)] + '?';
const gnAns = (a, done) => (done ? 'Sì, ' : 'No, ') + gnPhr(a, done) + '.';
const gnOther = (X) => pick(GN_ACTS.filter(a => a !== gnAct(X)));
Object.keys(GN).forEach(X => {
  Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(gnWho(X), (LK) => V_SCENE[gnAct(X)](LK), null, !gnDone(X)) });
});

const SGN = gTag('gn', {
  present: (X) => { const p = gnSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  // la domanda sulla sua cosa: sì (già) o no (non ancora)
  yes: (X) => ({ type: gnDone(X) ? 'yes' : 'neg', show: X, ask: gnAct(X), done: gnDone(X), prompt: gnQ(X), model: gnAns(gnAct(X), gnDone(X)), complete: '' }),
  // un'altra cosa, che non ha fatto: no, non ancora
  neg: (X) => { const o = gnOther(X); return { type: 'neg', show: X, ask: o, done: false, prompt: gnQ(X, o), model: gnAns(o, false), complete: gnSay(X) + '.' }; },
  alt: (X) => { const a = gnAct(X), ord = Math.random() < 0.5 ? [true, false] : [false, true];
    return { type: 'alt', show: X, prompt: gnName(X) + ' ' + gnPhr(a, ord[0]) + ' o ' + gnPhr(a, ord[1]) + '?', model: gnSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, ask: gnAct(X), done: gnDone(X), prompt: gnQ(X), model: gnAns(gnAct(X), gnDone(X)) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: gnQ(X) + ' ' + gnAns(gnAct(X), gnDone(X)), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: gnQ(X), model: gnQ(X) })
});

/* ---------- Capire le frasi: «(Max) ha già mangiato», «(Isa) non ha ancora letto» ---------- */
function gnStatements(s) {
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = PS_FORM[w[i]];
    if (!f || GN_ACTS.indexOf(f.act) === -1) continue;
    const adv = w[i - 1], aux = w[i - 2], neg = w[i - 3] === 'non';
    const subj = names[w[neg ? i - 4 : i - 3]] || null;
    // giusto: «ha già …» (senza non) oppure «non ha ancora …»
    const done = adv === 'gia' && !neg, notYet = adv === 'ancora' && neg;
    out.push({ act: f.act, ok: f.ok && aux === 'ha' && (done || notYet), done: done, subj: subj });
  }
  return out;
}
function gnEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const st = gnStatements(s), yes = has(s, 'si'), no = has(s, 'no');
  const okFor = (x) => x.ok && (x.subj === null || x.subj === gnWho(X)) && (x.act === gnAct(X) ? x.done === gnDone(X) : !x.done);
  if (!st.length || !st.every(okFor)) return { ok: false, full: false };
  if (step.type === 'echo' || step.type === 'alt') return { ok: st.some(x => x.act === gnAct(X)) && !yes && !no, full: true };
  // le domande sì / no e la domanda chiave: la risposta sulla cosa chiesta, con sì o no giusto
  const about = st.find(x => x.act === step.ask);
  if (!about) return { ok: false, full: false };
  if (step.type === 'key') return { ok: about.done ? !no : !yes, full: true };
  return { ok: about.done ? yes && !no : no && !yes, full: true };
}
function gnEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || gnQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  const m = / ha gia ([a-z]+) /.exec(s), f = m && PS_FORM[m[1]];
  if (f && f.ok && GN_ACTS.indexOf(f.act) !== -1) return { ok: true, kind: f.act === gnAct(X) && gnDone(X) ? 'yes' : 'no', ask: f.act };
  return bad();
}
function gnAnswerAsk(X, r) {
  if (r.kind === 'yes') return gnAns(gnAct(X), true);
  return gnAns(r.ask, false) + (r.ask !== gnAct(X) ? ' ' + gnSay(X) + '.' : '');
}
gInstall('gn', isGn, SGN, gnEvaluate, gnEvalAsk, gnAnswerAsk);
