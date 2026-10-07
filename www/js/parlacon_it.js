'use strict';
/* =====================================================================
   «Parla con…» (lezione 82, livello 4). Si carica dopo telef_it.js (le persone: Max, Isa, Marco, Anna, il nonno, la nonna).
   Due persone una davanti all'altra; chi parla ha il fumetto che gli esce dalla bocca, con un saluto già conosciuto (Ciao, Max! Buongiorno! Grazie!…):
     Isa parla con Max.                            → ripete
     Isa parla con Max?                            → Sì, Isa parla con Max.
     Isa parla con il nonno?                       → No, Isa non parla con il nonno.
     Isa parla con Max o con Anna?                 → Isa parla con Max.
     Con chi parla Isa?                            → Isa parla con Max.
   Errori: la persona sbagliata, «con nonno» (senza «il»), «parla a Max».
   ===================================================================== */

const PC = { pc_f_m: 1, pc_m_nonna: 1, pc_marco_f: 1, pc_anna_nonno: 1, pc_nonno_marco: 1, pc_nonna_anna: 1 };
const PC_PEOPLE = ['m', 'f', 'marco', 'anna', 'nonno', 'nonna'];
const isPc = (X) => !!PC[X];
const pcA = (X) => X.split('_')[1];                       // chi parla
const pcB = (X) => X.split('_')[2];                       // con chi
const pcSay = (X, b, neg) => gCap(tlName(pcA(X))) + (neg ? ' non' : '') + ' parla con ' + tlName(b || pcB(X));
const pcQ = (X) => 'Con chi parla ' + tlName(pcA(X)) + '?';
const pcOther = (X) => pick(PC_PEOPLE.filter(k => k !== pcA(X) && k !== pcB(X)));

// che cosa dice (Massi): parole già conosciute (i saluti della lezione 48), un ripasso da leggere
const PC_WORDS = { pc_f_m: () => 'Ciao, ' + vName('m') + '!', pc_m_nonna: () => 'Buongiorno!', pc_marco_f: () => 'Buonasera!',
  pc_anna_nonno: () => 'Ciao, nonno!', pc_nonno_marco: () => 'Arrivederci!', pc_nonna_anna: () => 'Grazie!' };
const pcWords = (X) => PC_WORDS[X]();
/* ---------- Figura: chi parla a sinistra (bocca aperta, il fumetto), chi ascolta a destra ---------- */
function pcFig(X) {
  const A = tlLook(pcA(X)), B = tlLook(pcB(X));
  if (!A || !B || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const person = (LK, dx, face) => '<g transform="translate(' + dx + ' 14) scale(.86)">' + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), face) + '</g>';
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="25" cy="97" rx="20" ry="2.6" fill="#000" opacity=".25"/><ellipse cx="75" cy="97" rx="20" ry="2.6" fill="#000" opacity=".25"/>' +
    person(A, -18, { mouth: 'talk' }) + person(B, 32, { mouth: 'smile' }) +
    sayBubble([28, 1, 44, 20], [30, 30], [pcWords(X)], 7.5) + '</svg>';
}
Object.keys(PC).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => pcFig(X) }); });

const SPC = gTag('pc', {
  present: (X) => { const p = pcSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: pcSay(X) + '?', model: 'Sì, ' + tlName(pcA(X)) + ' parla con ' + tlName(pcB(X)) + '.' }),
  neg: (X) => { const o = pcOther(X); return { type: 'neg', show: X, ask: o, prompt: pcSay(X, o) + '?', model: 'No, ' + tlName(pcA(X)) + ' non parla con ' + tlName(o) + '.', complete: pcSay(X) + '.' }; },
  alt: (X) => { const o = pcOther(X), ord = Math.random() < 0.5 ? [pcB(X), o] : [o, pcB(X)];
    return { type: 'alt', show: X, prompt: pcSay(X, ord[0]) + ' o con ' + tlName(ord[1]) + '?', model: pcSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: pcQ(X), model: pcSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: pcQ(X) + ' ' + pcSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: pcQ(X), model: pcQ(X) })
});

/* ---------- Capire le frasi: «(Isa) (non) parla con (Max / il nonno)» ---------- */
// la persona che comincia alla parola i: { k, n = quante parole, ok = articolo giusto }
function pcPerson(w, i) {
  const names = vNames();
  if (names[w[i]]) return { k: names[w[i]], n: 1, ok: true };
  if (w[i] === 'marco' || w[i] === 'anna') return { k: w[i], n: 1, ok: true };
  if (w[i] === 'lui' || w[i] === 'lei') return { k: w[i], n: 1, ok: true };
  if (/^(il|la)$/.test(w[i] || '') && /^(nonno|nonna)$/.test(w[i + 1] || '')) return { k: w[i + 1], n: 2, ok: w[i] === (w[i + 1] === 'nonno' ? 'il' : 'la') };
  if (/^(nonno|nonna)$/.test(w[i] || '')) return { k: w[i], n: 1, ok: false };
  return null;
}
function pcStatements(s) {
  s = s.replace(/ con chi parla [a-z]+( [a-z]+)? /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'parla') continue;
    let j = i - 1;
    const neg = w[j] === 'non';
    if (neg) j--;
    // chi parla: una parola prima (Max, lui) o due (il nonno)
    let a = pcPerson(w, j);
    if (!a || a.n === 1 && /^(nonno|nonna)$/.test(w[j]) && /^(il|la)$/.test(w[j - 1] || '')) a = pcPerson(w, j - 1);
    const b = w[i + 1] === 'con' ? pcPerson(w, i + 2) : null;
    out.push({ a: a ? a.k : null, b: b ? b.k : null, neg: neg, good: !!b && b.ok && (!a || a.ok) });
  }
  return out;
}
const pcIs = (k, who) => k === who || (k === 'lui' && /^(m|marco|nonno)$/.test(who)) || (k === 'lei' && /^(f|anna|nonna)$/.test(who));
function evaluatePc(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(pcQ(X)).trim()), full: true };
  const st = pcStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const aOk = (x) => x.a === null || pcIs(x.a, pcA(X));
  const truth = (x) => x.good && aOk(x) && pcIs(x.b, pcB(X)) && x.b !== 'lui' && x.b !== 'lei', allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].good && aOk(neg[0]) && neg[0].b === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskPc(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || pcQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, gNorm(pcQ(X)).trim())) return { ok: true, kind: 'what' };
  if (has(s, 'con chi parla')) return bad();
  const st = pcStatements(s);
  if (st.length === 1 && st[0].good && (st[0].a === null || pcIs(st[0].a, pcA(X))) && PC_PEOPLE.indexOf(st[0].b) !== -1)
    return { ok: true, kind: st[0].b === pcB(X) ? 'yes' : 'no', ask: st[0].b };
  return bad();
}
function answerAskPc(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + tlName(pcA(X)) + ' parla con ' + tlName(pcB(X)) + '.';
  if (r.kind === 'no') return 'No, ' + tlName(pcA(X)) + ' non parla con ' + tlName(r.ask) + '. ' + pcSay(X) + '.';
  return pcSay(X) + '.';
}
gInstall('pc', isPc, SPC, evaluatePc, evalAskPc, answerAskPc);
