'use strict';
/* =====================================================================
   CAPITOLO 15: «L'ho visto» (lezione 78, livello 3). Si carica dopo essere2_it.js e geo_it.js (i monumenti della lezione 9).
   Max o Isa ricordano il monumento che hanno visto (nella nuvoletta, con la freccia d'oro del passato):
     Max ha visto il Colosseo. L'ha visto.                 → ripete
     Max ha visto il Colosseo?                             → Sì, l'ha visto.
     Isa ha visto la Torre Eiffel?                         → Sì, l'ha vista.
     Max ha visto la Statua della Libertà?                 → No, non l'ha vista.
     Che cosa ha visto Max?                                → Max ha visto il Colosseo.
   Il punto: come nella lezione 46, con «l'» il participio prende la -o o la -a della cosa: l'ha visto (il Colosseo), l'ha vista (la Torre Eiffel).
   Errori: «l'ha visto» per la Torre Eiffel, «ha visto» senza «l'», il monumento sbagliato.
   ===================================================================== */

const VI_MON = { colosseo: 'roma', eiffel: 'parigi', bigben: 'londra', liberta: 'newyork' };
const VI = { vi_m_colosseo: 1, vi_f_eiffel: 1, vi_m_bigben: 1, vi_f_liberta: 1, vi_m_eiffel: 1, vi_f_colosseo: 1 };
const isVi = (X) => !!VI[X];
const viWho = (X) => X.charAt(3);
const viMon = (X) => X.slice(5);
const viName = (X) => vName(viWho(X));
const viFem = (m) => GEO[m].art === 'la';
const viThe = (m) => gWith(m);                                                          // «il Colosseo», «la Torre Eiffel»
const viPart = (m) => viFem(m) ? 'vista' : 'visto';
const viFull = (X, m, neg) => viName(X) + (neg ? ' non' : '') + ' ha visto ' + viThe(m || viMon(X));
const viShort = (m, neg) => (neg ? 'non ' : '') + 'l\'ha ' + viPart(m);
const viQ = (X) => 'Che cosa ha visto ' + viName(X) + '?';
const viOther = (X) => pick(Object.keys(VI_MON).filter(m => m !== viMon(X)));
Object.keys(VI).forEach(X => {
  Object.defineProperty(FIG, X, { enumerable: true, get: () => psMemFig(viWho(X), () => inner(cvFig('cv_' + viWho(X) + '_' + VI_MON[viMon(X)] + '_e')).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '')) });
});

const SVI = gTag('vi', {
  present: (X) => { const p = viFull(X) + '. ' + gCap(viShort(viMon(X))) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, ask: viMon(X), prompt: viFull(X) + '?', model: 'Sì, ' + viShort(viMon(X)) + '.' }),
  neg: (X) => { const o = viOther(X); return { type: 'neg', show: X, ask: o, prompt: viFull(X, o) + '?', model: 'No, ' + viShort(o, true) + '.', complete: viFull(X) + '.' }; },
  alt: (X) => { const o = viOther(X), ord = Math.random() < 0.5 ? [viMon(X), o] : [o, viMon(X)];
    return { type: 'alt', show: X, prompt: viFull(X, ord[0]) + ' o ' + viThe(ord[1]) + '?', model: viFull(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: viQ(X), model: viFull(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: viQ(X) + ' ' + viFull(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: viQ(X), model: viQ(X) })
});

/* ---------- Capire le frasi: «(non) l'ha visto / vista», «Max ha visto il Colosseo» ---------- */
const VI_WORD = { colosseo: 'colosseo', torre: 'eiffel', eiffel: 'eiffel', big: 'bigben', bigben: 'bigben', statua: 'liberta', liberta: 'liberta' };
function viStatements(s) {
  s = s.replace(/ (che )?cosa ha visto [a-z]+ /g, ' # ').replace(/ big ben /g, ' bigben ').replace(/ torre eiffel /g, ' eiffel ').replace(/ statua della liberta /g, ' liberta ');
  const names = vNames(), out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (!/^vist[oaie]$/.test(w[i]) || w[i - 1] !== 'ha') continue;
    let j = i - 2, pro = null, neg = false;
    if (/^(l|lo|la)$/.test(w[j] || '')) { pro = w[j]; j--; }
    if (w[j] === 'non') { neg = true; j--; }
    const subj = names[w[j]] || null;
    const art = w[i + 1], mon = VI_WORD[w[i + 2]] || null;
    out.push({ pro: pro, neg: neg, subj: subj, end: w[i].slice(-1), mon: pro ? null : mon, artOk: !mon || art === (viFem(mon) ? 'la' : 'il') });
  }
  return out;
}
// short = «l'ha visto / vista» (per il monumento m); full = «ha visto il Colosseo»
function viGood(x, X, m, short) {
  if (x.subj !== null && x.subj !== viWho(X)) return false;
  if (short) return !!x.pro && x.end === (viFem(m) ? 'a' : 'o');
  return !x.pro && x.mon === m && x.artOk && x.end === 'o';
}
function viEvaluate(step, text) {
  const s = gNorm(text), X = step.show, m = viMon(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(viQ(X)).trim()), full: true };
  const st = viStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  switch (step.type) {
    case 'echo': return { ok: pos.length === 2 && viGood(pos[0], X, m, false) && viGood(pos[1], X, m, true) && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && pos.length > 0 && pos.every(x => viGood(x, X, m, true) || viGood(x, X, m, false)) && !neg.length, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && viGood(neg[0], X, step.ask, true) && pos.every(x => viGood(x, X, m, false) || viGood(x, X, m, true)), full: pos.length > 0 };
    default: return { ok: pos.length > 0 && pos.every(x => viGood(x, X, m, false)) && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function viEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || viQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'cosa ha visto')) return has(s, norm(vName(viWho(X) === 'm' ? 'f' : 'm')).trim()) ? bad() : { ok: true, kind: 'what' };
  const st = viStatements(s);
  if (st.length === 1 && st[0].mon && st[0].artOk && !st[0].pro) return { ok: true, kind: st[0].mon === viMon(X) ? 'yes' : 'no', ask: st[0].mon };
  return bad();
}
function viAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + viShort(viMon(X)) + '.';
  if (r.kind === 'no') return 'No, ' + viShort(r.ask, true) + '. ' + viFull(X) + '.';
  return viFull(X) + '.';
}
gInstall('vi', isVi, SVI, viEvaluate, viEvalAsk, viAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => lesson.vi ? ['visto', 'vista'] : bGw(lesson);
}
