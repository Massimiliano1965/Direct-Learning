'use strict';
/* =====================================================================
   CAPITOLO 9: «Complemento indiretto: gli, le» (lezione 55, livello 2). Si carica dopo verbs_it.js e gen_it.js.
   Max dà una cosa a Isa, o Isa la dà a Max (a sinistra chi dà, a destra chi riceve, la freccia verde in mezzo):
     Max dà il libro a Isa. Le dà il libro.            → ripete
     Max dà il libro a Isa?                            → Sì, le dà il libro.
     Max dà la penna a Isa?                            → No, non le dà la penna.
     Max dà a Isa il libro o la penna?                 → Le dà il libro.
     Che cosa dà Max a Isa?                            → Le dà il libro.
   Il punto: a Isa → le; a Max → gli. «gli» e «le» sottolineati.
   Errori: «gli dà» per Isa, «le dà» per Max, «la dà il libro», la cosa sbagliata, «dà il libro a Isa» (qui si dice «le»).
   ===================================================================== */

const DA = { da_m_book: 1, da_f_pen: 1, da_m_key: 1, da_f_cup: 1, da_m_phone: 1, da_f_umbrella: 1 };
const isDa = (X) => !!DA[X];
const daWho = (X) => X.charAt(3);                                     // chi dà
const daTo = (X) => daWho(X) === 'm' ? 'f' : 'm';                     // chi riceve
const daObj = (X) => X.slice(5);
const daPro = (X) => daTo(X) === 'f' ? 'le' : 'gli';
const daThe = (o) => gThe(o, 1);                                      // «il libro», «l'ombrello»
const daFull = (X, o) => vName(daWho(X)) + ' dà ' + daThe(o || daObj(X)) + ' a ' + vName(daTo(X));   // «Max dà il libro a Isa»
const daShort = (X, o, neg) => (neg ? 'non ' : '') + daPro(X) + ' dà ' + daThe(o || daObj(X));       // «le dà il libro»
const daQ = (X) => 'Che cosa dà ' + vName(daWho(X)) + ' a ' + vName(daTo(X)) + '?';
const daOther = (X) => pick(Object.keys(DA).map(daObj).filter(o => o !== daObj(X)));
const daFig1 = (o) => o === 'key' ? (FIG.key_giallo || FIG.key) : o === 'umbrella' ? (FIG.umbrella_giallo || FIG.umbrella) : o === 'phone' ? (FIG.phone_giallo || FIG.phone) : FIG[o];   // colori chiari: si vedono

/* ---------- Figura: chi dà (a sinistra) porge la cosa a chi riceve (a destra) ---------- */
function daFig(X) {
  const look = (w) => { const k = p3Key(w); return (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : 'luca']) || null; };
  const g = look(daWho(X)), r = look(daTo(X));
  if (!g || !r || typeof tTorso !== 'function') return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"></svg>';
  const thing = inner(daFig1(daObj(X))).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="97" rx="46" ry="3" fill="#000" opacity=".25"/>' +
    '<g transform="translate(-22 16) scale(.8)">' + V_PERSON(g, tArm(g, ...DOWN_L) + tArm(g, [65, 47], [76, 58], [86, 54]), { mouth: 'smile' }) + '</g>' +
    '<g transform="translate(42 16) scale(.8)">' + V_PERSON(r, tArm(r, [35, 47], [26, 60], [18, 58]) + tArm(r, ...DOWN_R), { mouth: 'open' }) + '</g>' +
    '<g transform="translate(50 60) scale(.34) translate(-50 -50)">' + thing + '</g>' + vArrow([36, 30], [50, 20], [64, 30]) + '</svg>';
}
Object.keys(DA).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => daFig(X) }); });

const SDA = gTag('da', {
  present: (X) => { const p = daFull(X) + '. ' + gCap(daShort(X)) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: daFull(X) + '?', model: 'Sì, ' + daShort(X) + '.' }),
  neg: (X) => { const o = daOther(X); return { type: 'neg', show: X, ask: o, prompt: daFull(X, o) + '?', model: 'No, ' + daShort(X, o, true) + '.', complete: gCap(daShort(X)) + '.' }; },
  alt: (X) => { const o = daOther(X), ord = Math.random() < 0.5 ? [daObj(X), o] : [o, daObj(X)];
    return { type: 'alt', show: X, prompt: vName(daWho(X)) + ' dà a ' + vName(daTo(X)) + ' ' + daThe(ord[0]) + ' o ' + daThe(ord[1]) + '?', model: gCap(daShort(X)) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: daQ(X), model: gCap(daShort(X)) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: daQ(X) + ' ' + gCap(daShort(X)) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: daQ(X), model: daQ(X) })
});

/* ---------- Capire le frasi: «(non) le dà il libro» (gNorm: «le da il libro»), «Max dà il libro a Isa» ---------- */
function daStatements(s) {
  s = s.replace(/ (che )?cosa da [a-z]+ a [a-z]+ /g, ' # ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'da' && w[i] !== 'do' && w[i] !== 'dai' && w[i] !== 'dare') continue;
    const verbOk = w[i] === 'da';
    let j = i - 1, pro = null, neg = false;
    if (/^(gli|le|lo|la|li|l)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    const art = w[i + 1], n = gNoun(w[i + 2]);
    if (!n || !/^(il|la|lo|l|un|una|uno)$/.test(art || '')) { if (pro) out.push({ pro: pro, neg: neg, obj: null, ok: false }); continue; }
    const artOk = art === gDef(n.obj, 1).replace('\'', '');
    // «a Isa» dopo la cosa: la frase intera
    const to = w[i + 3] === 'a' && names[w[i + 4]] ? names[w[i + 4]] : null;
    out.push({ pro: pro, neg: neg, obj: n.obj, ok: verbOk && artOk && n.plural !== true, to: to, giver: names[w[j]] || null });
  }
  return out;
}
// short = con «gli / le»; full = la frase intera «Max dà il libro a Isa»
const daGood = (x, X, o, short) => x.ok && x.obj === o && (short ? x.pro === daPro(X) && !x.to : !x.pro && x.to === daTo(X) && x.giver === daWho(X));
function daEvaluate(step, text) {
  const s = gNorm(text), X = step.show, o = daObj(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(daQ(X)).trim()), full: true };
  const st = daStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && daGood(pos[0], X, o, false) && daGood(pos[1], X, o, true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.length > 0 && pos.every(x => daGood(x, X, o, true)) && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && daGood(neg[0], X, step.ask, true) && pos.every(x => daGood(x, X, o, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => daGood(x, X, o, true)) && !neg.length && !yes && !no, full: true };
  }
}
function daEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || daQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa da')) return has(s, gNorm(daQ(X)).trim().replace(/^che /, '')) ? { ok: true, kind: 'what' } : bad();
  const st = daStatements(s);
  if (st.length === 1 && st[0].ok && !st[0].pro && st[0].giver === daWho(X) && st[0].to === daTo(X)) return { ok: true, kind: st[0].obj === daObj(X) ? 'yes' : 'no', ask: st[0].obj };
  if (st.length === 1 && st[0].obj) return bad(daFull(X, st[0].obj) + '?');
  return bad();
}
function daAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + daShort(X) + '.';
  if (r.kind === 'no') return 'No, ' + daShort(X, r.ask, true) + '. ' + gCap(daShort(X)) + '.';
  return gCap(daShort(X)) + '.';
}
gInstall('da', isDa, SDA, daEvaluate, daEvalAsk, daAnswerAsk);
