'use strict';
/* =====================================================================
   CAPITOLO 10: «Verbi al presente e al passato» (lezione 60, livello 2). Si carica dopo passato_it.js e chiama_it.js.
   L'insegnante fa una cosa adesso (la scena) o l'ha già fatta (la nuvoletta del ricordo, come nella lezione 45).
   L'insegnante dice «io», l'allievo risponde con il Lei:
     Io leggo un libro.          Io ho letto un libro.                 → ripete
     Che cosa faccio io?                         → Lei legge un libro.
     Che cosa ho fatto io?                       → Lei ha letto un libro.
     Io leggo un libro o ho letto un libro?      → Lei legge un libro.     (adesso o prima?)
     Io mangio un'arancia?                       → No, Lei non mangia un'arancia.
   Il punto: io leggo / Lei legge; io ho letto / Lei ha letto. I verbi sottolineati.
   Errori: «Io leggo» nella risposta, il presente per il passato e il passato per il presente, il verbo sbagliato.
   ===================================================================== */

const TV = { tv_now_read: 1, tv_past_read: 1, tv_now_eat: 1, tv_past_eat: 1, tv_now_phone: 1, tv_past_phone: 1 };
const TV_IO = { read: 'leggo', eat: 'mangio', phone: 'telefono' };
const isTv = (X) => !!TV[X];
const tvPast = (X) => X.split('_')[1] === 'past';
const tvAct = (X) => X.split('_')[2];
const tvObj = (a) => ACTS[a].obj ? ' ' + vObj(a) : '';
const tvIo = (a, past, neg) => 'Io ' + (neg ? 'non ' : '') + (past ? 'ho ' + PS_PART[a] : TV_IO[a]) + tvObj(a);       // «Io leggo un libro», «Io ho letto un libro»
const tvLei = (a, past, neg) => 'Lei ' + (neg ? 'non ' : '') + (past ? 'ha ' + PS_PART[a] : ACTS[a].verb) + tvObj(a); // «Lei legge un libro»
const tvQ = (X) => tvPast(X) ? 'Che cosa ho fatto io?' : 'Che cosa faccio io?';
const tvOther = (X) => pick(Object.keys(TV_IO).filter(a => a !== tvAct(X)));

/* ---------- Figure: l'insegnante che fa la cosa (adesso) o che la ricorda (prima) ---------- */
function tvFig(X) {
  const t = eTeacher(), LK = (typeof LOOKS !== 'undefined' && LOOKS[t.look || t.key || 'luca']) || null;
  if (!LK || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const a = tvAct(X);
  if (!tvPast(X)) return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="34" ry="3" fill="#000" opacity=".25"/>' + V_SCENE[a](LK) + '</svg>';
  return psMemFig(null, () => V_SCENE[a](LK), LK);
}
Object.keys(TV).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => tvFig(X) }); });

const STV = gTag('tv', {
  present: (X) => { const p = tvIo(tvAct(X), tvPast(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: tvIo(tvAct(X), tvPast(X)) + '?', model: 'Sì, ' + tvLei(tvAct(X), tvPast(X)) + '.' }),
  neg: (X) => { const o = tvOther(X);
    return { type: 'neg', show: X, ask: o, prompt: tvIo(o, tvPast(X)) + '?', model: 'No, ' + tvLei(o, tvPast(X), true) + '.', complete: tvLei(tvAct(X), tvPast(X)) + '.' }; },
  // adesso o prima? «Io leggo un libro o ho letto un libro?»
  alt: (X) => { const a = tvAct(X), ord = Math.random() < 0.5 ? [false, true] : [true, false];
    const second = ord[1] ? 'ho ' + PS_PART[a] + tvObj(a) : TV_IO[a] + tvObj(a);
    return { type: 'alt', show: X, prompt: tvIo(a, ord[0]) + ' o ' + second + '?', model: tvLei(a, tvPast(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: tvQ(X), model: tvLei(tvAct(X), tvPast(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: tvQ(X) + ' ' + tvLei(tvAct(X), tvPast(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: tvQ(X), model: tvQ(X) })
});

/* ---------- Capire le frasi: «(io / Lei) (non) leggo / legge / ho letto / ha letto (un libro)» ---------- */
const TV_FORM = {};
Object.keys(TV_IO).forEach(a => { TV_FORM[TV_IO[a]] = { act: a, p: 1, past: false }; TV_FORM[ACTS[a].verb] = { act: a, p: 3, past: false }; });
['leggere', 'leggi', 'mangiare', 'mangi', 'telefonare', 'telefoni'].forEach(w => { TV_FORM[w] = { act: VFORM[w].act, p: 0, past: false }; });
function tvStatements(s) {
  s = s.replace(/ (che )?cosa (faccio|ho fatto) io /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    let f = null;
    if (PS_FORM[w[i]] && /^(ho|ha|hai)$/.test(w[i - 1] || '')) { const pf = PS_FORM[w[i]]; f = { act: pf.act, p: w[i - 1] === 'ho' ? 1 : w[i - 1] === 'ha' ? 3 : 2, past: true, ok: pf.ok }; }
    else if (TV_FORM[w[i]] && !(w[i] === 'telefono' && /^(il|un)$/.test(w[i - 1] || ''))) f = Object.assign({ ok: true }, TV_FORM[w[i]]);
    if (!f || !TV_IO[f.act]) continue;
    const before = f.past ? w[i - 2] : w[i - 1], neg = before === 'non';
    const want = ACTS[f.act].obj ? gNorm(vObj(f.act)).trim() : '', n = want ? want.split(' ').length : 0;
    const objOk = !want || w.slice(i + 1, i + 1 + n).join(' ') === want || !/^(il|la|lo|l|un|una|uno)$/.test(w[i + 1] || '');
    out.push({ act: f.act, p: f.p, past: f.past, ok: f.ok && objOk, neg: neg });
  }
  return out;
}
function tvEvaluate(step, text) {
  const s = gNorm(text), X = step.show, echo = step.type === 'echo';
  if (echo && step.check === 'question') return { ok: has(s, gNorm(tvQ(X)).trim()), full: true };
  const st = tvStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const p = echo ? 1 : 3;                               // si ripete «io»; si risponde «Lei»
  const truth = (x) => x.ok && x.p === p && x.past === tvPast(X) && x.act === tvAct(X), allPos = pos.every(truth);
  if (!echo && has(s, 'io')) return { ok: false, full: false };
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].p === 3 && neg[0].past === tvPast(X) && neg[0].act === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
// L'allievo chiede all'insegnante: «Che cosa fa Lei?», «Che cosa ha fatto Lei?», «Lei legge un libro?», «Lei ha letto un libro?»
function tvEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || (tvPast(X) ? 'Che cosa ha fatto Lei?' : 'Che cosa fa Lei?') });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ha fatto')) return tvPast(X) ? { ok: true, kind: 'what' } : bad('Che cosa fa Lei?');
  if (has(s, 'cosa fa')) return tvPast(X) ? bad('Che cosa ha fatto Lei?') : { ok: true, kind: 'what' };
  const st = tvStatements(s);
  if (st.length === 1 && st[0].ok && st[0].p === 3) return { ok: true, kind: st[0].act === tvAct(X) && st[0].past === tvPast(X) ? 'yes' : 'no', ask: st[0].act, past: st[0].past };
  if (st.length === 1) return bad(tvLei(st[0].act, st[0].past) + '?');
  return bad();
}
function tvAnswerAsk(X, r) {
  const io = (a, past, neg) => tvIo(a, past, neg).replace(/^Io /, 'io ');
  if (r.kind === 'yes') return 'Sì, ' + io(tvAct(X), tvPast(X)) + '.';
  if (r.kind === 'no') return 'No, ' + io(r.ask, r.past, true) + '. ' + tvIo(tvAct(X), tvPast(X)) + '.';
  return tvIo(tvAct(X), tvPast(X)) + '.';
}
gInstall('tv', isTv, STV, tvEvaluate, tvEvalAsk, tvAnswerAsk);
