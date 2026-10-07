'use strict';
/* =====================================================================
   LIVELLO 4: le lezioni «le cose dell'Italia» (choiceLesson). Si carica dopo verbs_it.js (le persone) e colaz_it.js (il cibo).
   Ogni figura ha una risposta scelta tra poche (il cappuccino, il treno, Roma…); la frase è sempre la stessa forma:
     Lezione 90 «Al bar»:  Al bar Max prende un cappuccino.     Che cosa prende Max al bar?    → Max prende un cappuccino.
   Si capisce: la cosa con la parola davanti giusta («un cappuccino», «in treno», «a Roma»), il «non», chi lo fa.
   Va bene anche solo la cosa («Un cappuccino.»). Errori: la cosa sbagliata, la parola davanti sbagliata («una cappuccino»).
   ===================================================================== */

// proper(parola) = è un nome proprio (resta maiuscolo dopo «Sì,»); same(c1, c2) = le cose che si possono confrontare
// cfg: flag, CH = { chiave: { the: 'un cappuccino', alias: ['cappuccini'] } }, items = { X: { who: 'm' | 'f' | null, c: chiave } },
//      say(X, c, neg) = la frase, q(X) = la domanda chiave, lead(X) = parole davanti nella presentazione, fig(X), wrong = parole sbagliate al posto del verbo
function choiceLesson(cfg) {
  const IT = cfg.items, CH = cfg.CH;
  const isX = (X) => !!IT[X];
  const ch = (X) => IT[X].c;
  const others = (X) => Object.keys(CH).filter(c => c !== ch(X) && (!cfg.same || cfg.same(c, ch(X))));
  const other = (X) => pick(others(X));
  const say = (X, c, neg) => cfg.say(X, c || ch(X), !!neg);
  Object.keys(IT).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => cfg.fig(X, IT[X]) }); });
  const SX = gTag(cfg.flag, {
    present: (X) => { const p = (cfg.lead ? cfg.lead(X) + ' ' + lc(say(X)) : say(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
    yes: (X) => ({ type: 'yes', show: X, prompt: say(X) + '?', model: 'Sì, ' + lc(say(X)) + '.' }),
    neg: (X) => { const o = other(X); return { type: 'neg', show: X, ask: o, prompt: say(X, o) + '?', model: 'No, ' + lc(say(X, o, true)) + '.', complete: say(X) + '.' }; },
    alt: (X) => { const o = other(X), ord = Math.random() < 0.5 ? [ch(X), o] : [o, ch(X)];
      return { type: 'alt', show: X, prompt: say(X, ord[0]) + ' o ' + CH[ord[1]].the + '?', model: say(X) + '.' }; },
    key: (X) => ({ type: 'key', show: X, prompt: cfg.q(X), model: say(X) + '.' }),
    reveal: (X) => ({ type: 'reveal', show: X, prompt: cfg.q(X) + ' ' + say(X) + '.', model: '' }),
    askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: cfg.q(X), model: cfg.q(X) })
  });
  // i nomi propri restano maiuscoli: «Sì, Max prende…», «No, a Roma…» (lc toglie la maiuscola solo alle parole comuni)
  function lc(t) { const w = t.split(' ')[0]; return cfg.proper && cfg.proper(w) ? t : t.charAt(0).toLowerCase() + t.slice(1); }
  // le cose: la frase normalizzata e la parola principale (l'ultima), più gli alias
  const PH = {};
  Object.keys(CH).forEach(c => { const t = gNorm(CH[c].the).trim().split(' '); PH[c] = { pre: t.slice(0, -1), word: t[t.length - 1], alias: (CH[c].alias || []).map(a => gNorm(a).trim()) }; });
  const qN = (X) => gNorm(cfg.q(X)).trim();
  function statements(s, X) {
    s = s.replace(new RegExp(' ' + qN(X).replace(/ /g, ' ') + ' ', 'g'), ' # ');
    if (cfg.strip) s = s.replace(cfg.strip, ' # ');
    const names = vNames(), w = s.trim().split(' '), out = [];
    for (let i = 0; i < w.length; i++) {
      const c = Object.keys(PH).find(k => PH[k].word === w[i] || PH[k].alias.indexOf(w[i]) !== -1);
      if (!c) continue;
      const P = PH[c], n = P.pre.length, ok = P.word === w[i] && P.pre.every((t, k) => w[i - n + k] === t);
      // indietro, fino a 4 parole: il «non», il nome, una parola sbagliata
      let neg = false, who = null, bad = false;
      for (let j = i - n - 1; j >= Math.max(0, i - n - 5); j--) {
        if (w[j] === '#' || w[j] === 'o' || w[j] === 'si' || w[j] === 'no') break;
        if (w[j] === 'non') neg = true;
        if (names[w[j]]) { who = names[w[j]]; break; }
        if (cfg.wrong && cfg.wrong.indexOf(w[j]) !== -1) bad = true;
      }
      out.push({ c: c, ok: ok && !bad, neg: neg, who: who });
    }
    return out;
  }
  function evaluateX(step, text) {
    const s = gNorm(text), X = step.show;
    if (step.type === 'echo' && step.check === 'question') return { ok: has(s, qN(X)), full: true };
    const st = statements(s, X), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
    const whoOk = (x) => x.who === null || !IT[X].who || x.who === IT[X].who;
    const truth = (x) => x.ok && whoOk(x) && x.c === ch(X), allPos = pos.every(truth);
    switch (step.type) {
      case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
      case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
      case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && whoOk(neg[0]) && neg[0].c === step.ask && allPos, full: pos.some(truth) };
      default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
    }
  }
  function evalAskX(X, text) {
    const s = gNorm(text), bad = (model) => ({ ok: false, model: model || cfg.q(X) });
    if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
    if (has(s, qN(X))) return { ok: true, kind: 'what' };
    const st = statements(s, X);
    if (st.length === 1 && st[0].ok && (st[0].who === null || !IT[X].who || st[0].who === IT[X].who)) return { ok: true, kind: st[0].c === ch(X) ? 'yes' : 'no', ask: st[0].c };
    if (st.length === 1) return bad(say(X, st[0].c) + '?');
    return bad();
  }
  function answerAskX(X, r) {
    if (r.kind === 'yes') return 'Sì, ' + lc(say(X)) + '.';
    if (r.kind === 'no') return 'No, ' + lc(say(X, r.ask, true)) + '. ' + say(X) + '.';
    return say(X) + '.';
  }
  gInstall(cfg.flag, isX, SX, evaluateX, evalAskX, answerAskX);
  return SX;
}

/* ---------- Lezione 90: al bar ---------- */
const BAR_CH = {
  cappuccino: { the: 'un cappuccino', alias: ['cappuccini'] }, caffe: { the: 'un caffè', alias: ['caffe', 'espresso'] },
  cornetto: { the: 'un cornetto', alias: ['cornetti', 'brioche'] }, tramezzino: { the: 'un tramezzino', alias: ['tramezzini', 'panino'] },
  gelato: { the: 'un gelato', alias: ['gelati'] }, spremuta: { the: 'una spremuta', alias: ['spremute'] }
};
const BAR_FIG = {
  cappuccino: '<path d="M30 40 h40 v18 q0 18 -20 18 q-20 0 -20 -18z" fill="#f3eee2"/><ellipse cx="50" cy="40" rx="20" ry="5" fill="#e9d7b8"/><path d="M45 39 q2.5 -3 5 0 q2.5 -3 5 0 l-5 4z" fill="#a8774a"/>' +
    '<path d="M70 46 q10 0 10 8 q0 8 -10 8" fill="none" stroke="#f3eee2" stroke-width="4"/><ellipse cx="50" cy="80" rx="28" ry="5" fill="#e2dccd"/>',
  caffe: CZ_FIG.caffe,
  cornetto: CZ_FIG.cornetto,
  tramezzino: '<path d="M22 70 L50 30 L78 70z" fill="#f3eee2"/><path d="M24 66 L50 30 L76 66" fill="none" stroke="#e2c79a" stroke-width="2"/>' +
    '<path d="M26 64 q12 -6 24 0 q12 -6 24 0" stroke="#5a9a46" stroke-width="4" fill="none"/><path d="M28 60 h44" stroke="#e8a0a8" stroke-width="3"/><path d="M22 70 h56 v5 h-56z" fill="#e9dcc0"/>',
  gelato: '<path d="M38 50 L50 86 L62 50z" fill="#d9a25a"/><path d="M41 56 l15 -4 M43 64 l11 -3 M46 72 l7 -2" stroke="#b07a3a" stroke-width="1.4"/>' +
    '<circle cx="44" cy="44" r="10" fill="#f4a6c4"/><circle cx="56" cy="44" r="10" fill="#f3e3a0"/><circle cx="50" cy="34" r="10" fill="#9a6a44"/>',
  spremuta: CZ_FIG.succo
};
function barFig(X, it) {
  const k = p3Key(it.who), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return FLAT(BAR_FIG[it.c], 20);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    // il bancone del bar e l'insegna
    '<rect x="62" y="4" width="34" height="13" rx="3" fill="#2f5d4a"/><text x="79" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="9" font-weight="bold" fill="#f3d36b">BAR</text>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, [65, 47], [72, 64], [80, 66]), { mouth: 'smile' }, -14) +
    '<rect x="52" y="70" width="48" height="27" rx="2" fill="#7a5735"/><rect x="50" y="66" width="50" height="5" rx="1.5" fill="#a87a4e"/>' +
    '<g transform="translate(77 48) scale(.52) translate(-50 -60)">' + BAR_FIG[it.c] + '</g></svg>';
}
const SBAR = choiceLesson({
  flag: 'bar', CH: BAR_CH,
  items: { bar_m_cappuccino: { who: 'm', c: 'cappuccino' }, bar_f_cornetto: { who: 'f', c: 'cornetto' }, bar_m_caffe: { who: 'm', c: 'caffe' },
    bar_f_gelato: { who: 'f', c: 'gelato' }, bar_m_tramezzino: { who: 'm', c: 'tramezzino' }, bar_f_spremuta: { who: 'f', c: 'spremuta' } },
  say: (X, c, neg) => vName(X.charAt(4)) + (neg ? ' non' : '') + ' prende ' + BAR_CH[c].the,
  lead: () => 'Al bar',
  proper: (w) => vNames()[gNorm(w).trim()] !== undefined,
  q: (X) => 'Che cosa prende ' + vName(X.charAt(4)) + ' al bar?',
  fig: barFig,
  wrong: ['prendo', 'prendi', 'prendere', 'mangia', 'beve']
});
