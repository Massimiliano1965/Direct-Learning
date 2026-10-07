'use strict';
/* =====================================================================
   LIVELLO 4: le lezioni «una forma del verbo» (formLesson). Si carica dopo passato_it.js e verbs_it.js (le scene).
   Ogni lezione: Max o Isa, sei azioni (le scene della lezione 23), una forma del verbo e la sua domanda:
     Lezione 79 «Futuro»:     Domani Max leggerà un libro.     Che cosa farà Max domani?     → Max leggerà un libro.
                              (la nuvoletta con la freccia azzurra in avanti = domani)
     Lezione 80 «Gerundio»:   Max sta leggendo un libro.        Che cosa sta facendo Max?     → Max sta leggendo un libro.
                              (la scena, adesso)
   Domande sì / no / «o» come nelle altre lezioni; errori: la forma di un altro tempo («legge», «ha letto»), le forme inventate.
   ===================================================================== */

const FORM_ACTS = ['read', 'eat', 'drink', 'phone', 'open', 'close'];
// cfg: flag, form(a) = «leggerà» / «sta leggendo», q(name), lead (parola davanti alla frase: «Domani»), fig(X), items
function formLesson(cfg) {
  const IT = cfg.items;
  const isX = (X) => !!IT[X];
  const who = (X) => X.charAt(cfg.flag.length + 1);
  const act = (X) => X.slice(cfg.flag.length + 3);
  const name = (X) => vName(who(X));
  const does = (a) => cfg.form(a) + (ACTS[a].obj ? ' ' + vObj(a) : '');                         // «leggerà un libro»
  const say = (X, a, neg) => name(X) + (neg ? ' non ' : ' ') + does(a || act(X));
  const lead = (t) => cfg.lead ? cfg.lead + ' ' + t.charAt(0).toLowerCase() + t.slice(1) : t;   // «Domani Max leggerà…» (i nomi restano maiuscoli)
  const other = (X) => pick(FORM_ACTS.filter(a => a !== act(X)));
  Object.keys(IT).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cfg.fig(X, who(X), act(X)) }); });
  const SX = gTag(cfg.flag, {
    present: (X) => { const p = (cfg.lead ? cfg.lead + ' ' : '') + say(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
    yes: (X) => ({ type: 'yes', show: X, prompt: say(X) + '?', model: 'Sì, ' + say(X) + '.' }),
    neg: (X) => { const o = other(X); return { type: 'neg', show: X, ask: o, prompt: say(X, o) + '?', model: 'No, ' + say(X, o, true) + '.', complete: say(X) + '.' }; },
    alt: (X) => { const o = other(X), ord = Math.random() < 0.5 ? [act(X), o] : [o, act(X)];
      return { type: 'alt', show: X, prompt: say(X, ord[0]) + ' o ' + does(ord[1]) + '?', model: say(X) + '.' }; },
    key: (X) => ({ type: 'key', show: X, prompt: cfg.q(name(X)), model: say(X) + '.' }),
    reveal: (X) => ({ type: 'reveal', show: X, prompt: cfg.q(name(X)) + ' ' + say(X) + '.', model: '' }),
    askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cfg.q(name(X)), model: cfg.q(name(X)) })
  });
  // le forme che si riconoscono: quella giusta (ok) e quelle di altri tempi (sbagliate qui)
  const FORMS = FORM_ACTS.map(a => ({ a: a, w: gNorm(cfg.form(a)).trim().split(' ') }));
  const WRONG = {};
  Object.keys(VFORM).forEach(w => { if (FORM_ACTS.indexOf(VFORM[w].act) !== -1) WRONG[w] = VFORM[w].act; });
  Object.keys(PS_FORM).forEach(w => { if (FORM_ACTS.indexOf(PS_FORM[w].act) !== -1) WRONG[w] = PS_FORM[w].act; });
  (cfg.wrong || []).forEach(([w, a]) => { WRONG[w] = a; });
  const qRe = new RegExp(gNorm(cfg.q('X')).trim().replace(' x', ' [a-z]+').replace(/ /g, ' '), 'g');
  function statements(s) {
    s = s.replace(qRe, ' # ');
    const names = vNames(), out = [], w = s.trim().split(' ');
    for (let i = 0; i < w.length; i++) {
      let f = FORMS.find(F => F.w.every((t, k) => w[i + k] === t)), n = f ? f.w.length : 1, a = f ? f.a : null, ok = !!f;
      let j = i - 1;
      if (!f) {
        if (WRONG[w[i]] === undefined || (WRONG[w[i]] === 'phone' && /^(il|un)$/.test(w[i - 1] || ''))) continue;
        a = WRONG[w[i]]; ok = false;
        if (w[j] === 'ha') j--;                  // «ha letto»: il soggetto è prima di «ha»
      }
      const neg = w[j] === 'non';
      if (neg) j--;
      const subj = names[w[j]] || (w[j] === 'lui' ? 'm' : w[j] === 'lei' ? 'f' : null);
      const want = ACTS[a].obj ? gNorm(vObj(a)).trim() : '', k = want ? want.split(' ').length : 0;
      const objOk = !want || w.slice(i + n, i + n + k).join(' ') === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + n] || '');
      out.push({ act: a, ok: ok && objOk, neg: neg, subj: subj });
      i += n - 1;
    }
    return out;
  }
  function evaluateX(step, text) {
    const s = gNorm(text), X = step.show;
    if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(cfg.q(name(X))).trim()), full: true };
    const st = statements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
    const truth = (x) => x.ok && x.act === act(X) && (x.subj === null || x.subj === who(X)), allPos = pos.every(truth);
    switch (step.type) {
      case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
      case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
      case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].act === step.ask && allPos, full: pos.some(truth) };
      default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
    }
  }
  function evalAskX(X, text) {
    const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cfg.q(name(X)) });
    if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
    if (has(s, gNorm(cfg.q('X')).trim().split(' x')[0])) return has(s, norm(vName(who(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
    const st = statements(s);
    if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].act === act(X) ? 'yes' : 'no', ask: st[0].act };
    if (st.length === 1) return bad(say(X, st[0].act) + '?');
    return bad();
  }
  function answerAskX(X, r) {
    if (r.kind === 'yes') return 'Sì, ' + say(X) + '.';
    if (r.kind === 'no') return 'No, ' + say(X, r.ask, true) + '. ' + say(X) + '.';
    return say(X) + '.';
  }
  gInstall(cfg.flag, isX, SX, evaluateX, evalAskX, answerAskX);
  return SX;
}

// Lezione 79: il futuro (la nuvoletta con la freccia in avanti: domani)
const FUT = { read: 'leggerà', eat: 'mangerà', drink: 'berrà', phone: 'telefonerà', open: 'aprirà', close: 'chiuderà' };
const SFU = formLesson({
  flag: 'fu', lead: 'Domani',
  form: (a) => FUT[a],
  q: (n) => 'Che cosa farà ' + n + ' domani?',
  fig: (X, w, a) => psMemFig(w, (LK) => V_SCENE[a](LK), null, 'future'),
  wrong: [['leggero', 'read'], ['mangero', 'eat'], ['bevera', 'drink'], ['berro', 'drink'], ['telefonero', 'phone'], ['chiudero', 'close'], ['leggere', 'read']],
  items: { fu_m_read: 1, fu_f_drink: 1, fu_m_phone: 1, fu_f_open: 1, fu_m_eat: 1, fu_f_close: 1 }
});
// Lezione 80: il gerundio (la scena, adesso)
const GER = { read: 'sta leggendo', eat: 'sta mangiando', drink: 'sta bevendo', phone: 'sta telefonando', open: 'sta aprendo', close: 'sta chiudendo' };
const SGE = formLesson({
  flag: 'ge',
  form: (a) => GER[a],
  q: (n) => 'Che cosa sta facendo ' + n + '?',
  fig: (X, w, a) => FIG['v_' + w + '_' + a],
  wrong: [['leggendo', 'read'], ['mangiando', 'eat'], ['bevendo', 'drink'], ['telefonando', 'phone'], ['aprendo', 'open'], ['chiudendo', 'close']],
  items: { ge_m_read: 1, ge_f_drink: 1, ge_m_phone: 1, ge_f_open: 1, ge_m_eat: 1, ge_f_close: 1 }
});
