'use strict';
/* =====================================================================
   CAPITOLO 7: «Passato prossimo» (lezione 45, livello 2). Si carica dopo verbs_it.js (le scene della lezione 23).
   Max o Isa ricordano quello che hanno fatto: nella nuvoletta la scena della lezione 23, con la freccia d'oro
   che torna indietro (il passato):
     Max ha letto un libro.                                  → ripete
     Che cosa ha fatto Max?                                  → Max ha letto un libro.   (va bene anche «Ha letto un libro.»)
     Max ha letto un libro?                                  → Sì, Max ha letto un libro.
     Max ha mangiato un'arancia?                             → No, Max non ha mangiato un'arancia.
     Max ha letto un libro o ha bevuto un'aranciata?         → Max ha letto un libro.
   Il punto: «ha» + il participio: letto, aperto, chiuso, bevuto (irregolari) e mangiato, telefonato (-ato). «ha …» sottolineato.
   Errori: il presente («legge»), senza «ha» («Max letto»), «è letto», le forme inventate («leggiuto», «aprito», «chiudito», «beveto»).
   ===================================================================== */

const PS_PART = { read: 'letto', open: 'aperto', eat: 'mangiato', drink: 'bevuto', close: 'chiuso', phone: 'telefonato' };
const PS_WRONG = { read: ['leggiuto', 'leggito', 'leguto'], open: ['aprito', 'aputo'], eat: ['mangiuto', 'mangito'], drink: ['beveto', 'bevito', 'beuto'],
  close: ['chiudito', 'chiuduto'], phone: ['telefonito', 'telefonuto'] };
const PS_FORM = {};
Object.keys(PS_PART).forEach(a => { PS_FORM[PS_PART[a]] = { act: a, ok: true }; PS_WRONG[a].forEach(w => { PS_FORM[w] = { act: a, ok: false }; }); });
const PS = { ps_m_read: 1, ps_f_open: 1, ps_m_eat: 1, ps_f_drink: 1, ps_m_close: 1, ps_f_phone: 1 };
const isPs = (X) => !!PS[X];
const psWho = (X) => X.charAt(3);
const psAct = (X) => X.slice(5);
const psName = (X) => vName(psWho(X));
const psDone = (a) => PS_PART[a] + (ACTS[a].obj ? ' ' + vObj(a) : '');           // «letto un libro», «telefonato»
const psSay = (X, a) => psName(X) + ' ha ' + psDone(a || psAct(X));               // «Max ha letto un libro»
const psQ = (X) => 'Che cosa ha fatto ' + psName(X) + '?';
const psOther = (X) => pick(Object.keys(PS_PART).filter(a => a !== psAct(X)));

/* ---------- Figura: la persona, ferma, e nella nuvoletta il ricordo (la scena della lezione 23) con la freccia indietro ---------- */
// who = 'm' / 'f'; scene(LK) = il disegno del ricordo (anche le lezioni 46 e 60 la usano); look = una faccia già scelta (l'insegnante)
function psMemFig(who, scene, look) {
  const k = who && p3Key(who), LK = look || (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="97" rx="26" ry="3" fill="#000" opacity=".25"/>' +
    V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'smile' }, -20) +
    '<circle cx="42" cy="28" r="1.8" fill="#f3eee2"/><circle cx="47" cy="22" r="2.6" fill="#f3eee2"/>' +
    '<rect x="50" y="1" width="49" height="49" rx="16" fill="#f3eee2"/><rect x="52.5" y="3.5" width="44" height="44" rx="13" fill="#2a3346"/>' +
    '<g transform="translate(53 4) scale(.43)"><g opacity=".92">' + scene(LK) + '</g></g>' +
    // la freccia d'oro che gira indietro: il passato
    '<g transform="translate(91 44) scale(-1.15 1.15)"><circle r="7.5" fill="#1d2638" stroke="#c9a45c" stroke-width="1.4"/>' +
    '<path d="M3.6 -2.6 A4.4 4.4 0 1 0 4 2" fill="none" stroke="#c9a45c" stroke-width="1.6" stroke-linecap="round"/><path d="M1.6 -4.6 L4.4 -2.2 L1.2 -0.6z" fill="#c9a45c"/></g></svg>';
}
const psFig = (X) => psMemFig(psWho(X), (LK) => V_SCENE[psAct(X)](LK));
Object.keys(PS).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => psFig(X) }); });

const SPS = gTag('ps', {
  present: (X) => { const p = psSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: psSay(X) + '?', model: 'Sì, ' + psSay(X) + '.' }),
  neg: (X) => { const o = psOther(X);
    return { type: 'neg', show: X, ask: o, prompt: psSay(X, o) + '?', model: 'No, ' + psName(X) + ' non ha ' + psDone(o) + '.', complete: psSay(X) + '.' }; },
  alt: (X) => { const o = psOther(X), ord = Math.random() < 0.5 ? [psAct(X), o] : [o, psAct(X)];
    return { type: 'alt', show: X, prompt: psName(X) + ' ha ' + psDone(ord[0]) + ' o ha ' + psDone(ord[1]) + '?', model: psSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: psQ(X), model: psSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: psQ(X) + ' ' + psSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: psQ(X), model: psQ(X) })
});

/* ---------- Capire le frasi: «(Max) (non) ha letto (un libro)» ---------- */
function psStatements(s) {
  s = s.replace(/ (che )?cosa ha fatto [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    const f = PS_FORM[w[i]], pres = VFORM[w[i]];
    // il presente («legge») o l'infinito: non è il passato
    if (!f && pres && !(pres.act === 'phone' && /^(il|un)$/.test(w[i - 1] || ''))) { out.push({ act: pres.act, ok: false, neg: w[i - 1] === 'non' }); continue; }
    if (!f) continue;
    let j = i - 1, aux = false, neg = false, subj = null;
    if (w[j] === 'ha') { aux = true; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    if (names[w[j]]) subj = names[w[j]]; else if (w[j] === 'lui') subj = 'm'; else if (w[j] === 'lei') subj = 'f';
    else if (/^(io|tu|noi|voi|loro)$/.test(w[j] || '')) subj = '?';
    // la cosa dopo il participio, se c'è, deve essere quella giusta, con l'articolo giusto
    const want = ACTS[f.act].obj ? gNorm(vObj(f.act)).trim() : '', n = want ? want.split(' ').length : 0;
    const after = w.slice(i + 1, i + 1 + n).join(' ');
    const objOk = !want || after === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '');
    out.push({ act: f.act, ok: f.ok && aux && objOk, neg: neg, subj: subj });
  }
  return out;
}
const psRight = (x, X) => x.ok && (x.subj === null || x.subj === psWho(X));
function psEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'cosa ha fatto') && has(s, norm(psName(X)).trim()), full: true };
  const st = psStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => psRight(x, X) && x.act === psAct(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && psRight(neg[0], X) && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'cosa ha fatto'), full: true };
  }
}
function psEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || psQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ha fatto')) return has(s, norm(vName(psWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = psStatements(s);
  if (st.length === 1 && psRight(st[0], X)) return { ok: true, kind: st[0].act === psAct(X) ? 'yes' : 'no', ask: st[0].act };
  if (st.length === 1) return bad(psSay(X, st[0].act) + '?');
  return bad();
}
function psAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + psSay(X) + '.';
  if (r.kind === 'no') return 'No, ' + psName(X) + ' non ha ' + psDone(r.ask) + '. ' + psSay(X) + '.';
  return psSay(X) + '.';
}
gInstall('ps', isPs, SPS, psEvaluate, psEvalAsk, psAnswerAsk);
