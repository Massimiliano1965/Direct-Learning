'use strict';
/* =====================================================================
   CAPITOLO 11: «Preposizioni: sopra, sotto, davanti, dietro, accanto» (lezione 75, livello 3). Si carica dopo gen_it.js.
   Il tavolo e una cosa (la valigia rossa o il libro): sul tavolo, sotto il tavolo, davanti al tavolo, dietro il tavolo, accanto al tavolo.
     La valigia è sotto il tavolo.                      → ripete
     Dov'è la valigia?                                  → La valigia è sotto il tavolo.   (va bene anche «È sotto il tavolo.»)
     La valigia è dietro il tavolo?                     → No, la valigia non è dietro il tavolo.
     La valigia è sotto il tavolo o sul tavolo?         → La valigia è sotto il tavolo.
   Il punto: «davanti al», «accanto al» (con «a»); «sotto il», «dietro il» (anche «dietro al»); «sul» (come nella lezione 18).
   Errori: «davanti il tavolo», «accanto il tavolo», «su il tavolo», il posto sbagliato.
   ===================================================================== */

const DV_POS = {
  sul:     { say: 'sul tavolo',       ok: ['sul', 'sopra il', 'sopra al'] },
  sotto:   { say: 'sotto il tavolo',  ok: ['sotto il', 'sotto al'] },
  davanti: { say: 'davanti al tavolo', ok: ['davanti al'] },
  dietro:  { say: 'dietro il tavolo', ok: ['dietro il', 'dietro al'] },
  accanto: { say: 'accanto al tavolo', ok: ['accanto al'] }
};
const DVP = { dvp_suitcase_sotto: 1, dvp_book_sul: 1, dvp_suitcase_davanti: 1, dvp_book_accanto: 1, dvp_suitcase_dietro: 1, dvp_book_sotto: 1 };
const isDvp = (X) => !!DVP[X];
const dvpObj = (X) => X.split('_')[1];
const dvpPos = (X) => X.split('_')[2];
const dvpThe = (X) => gThe(dvpObj(X), 1);                                      // «la valigia», «il libro»
const dvpSay = (X, p, neg) => gCap(dvpThe(X)) + (neg ? ' non' : '') + ' è ' + DV_POS[p || dvpPos(X)].say;
const dvpQ = (X) => 'Dov\'è ' + dvpThe(X) + '?';
const dvpOther = (X) => pick(Object.keys(DV_POS).filter(p => p !== dvpPos(X)));

/* ---------- Figura: il tavolo e la cosa al suo posto ---------- */
function dvpFig(X) {
  const o = dvpObj(X), p = dvpPos(X);
  const thing = inner(o === 'suitcase' ? (FIG.suitcase_rosso || FIG.suitcase) : FIG[o]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
  const at = (x, y, sc) => '<g transform="translate(' + x + ' ' + y + ') scale(' + sc + ') translate(-50 -50)">' + thing + '</g>';
  // il tavolo più grande, un po' a sinistra (a destra c'è posto per «accanto»): il piano è tra y 49 e 60
  const table = '<g transform="translate(40 94) scale(.8) translate(-50 -90)">' + inner(FIG.table).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '') + '</g>';
  const floor = '<ellipse cx="50" cy="95" rx="44" ry="3" fill="#000" opacity=".25"/>';
  let body;
  // sul: appoggiata sul piano, con la sua ombra
  if (p === 'sul') body = table + '<ellipse cx="40" cy="49.5" rx="10" ry="1.6" fill="#000" opacity=".3"/>' + at(40, 37, .3);
  else if (p === 'sotto') body = at(40, 80, .24) + table;
  else if (p === 'davanti') body = table + at(36, 76, .46);
  // dietro: la valigia sta per terra dietro il tavolo: si vede sopra il piano e, sotto, tra le gambe
  else if (p === 'dietro') body = at(48, 58, .72) + table;
  else body = table + at(88, 82, .26);
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + floor + body + '</svg>';
}
Object.keys(DVP).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => dvpFig(X) }); });

const SDVP = gTag('dvp', {
  present: (X) => { const p = dvpSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: dvpSay(X) + '?', model: 'Sì, ' + dvpThe(X) + ' è ' + DV_POS[dvpPos(X)].say + '.' }),
  neg: (X) => { const o = dvpOther(X); return { type: 'neg', show: X, ask: o, prompt: dvpSay(X, o) + '?', model: 'No, ' + dvpThe(X) + ' non è ' + DV_POS[o].say + '.', complete: dvpSay(X) + '.' }; },
  alt: (X) => { const o = dvpOther(X), ord = Math.random() < 0.5 ? [dvpPos(X), o] : [o, dvpPos(X)];
    return { type: 'alt', show: X, prompt: dvpSay(X, ord[0]) + ' o ' + DV_POS[ord[1]].say + '?', model: dvpSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: dvpQ(X), model: dvpSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: dvpQ(X) + ' ' + dvpSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: dvpQ(X), model: dvpQ(X) })
});

/* ---------- Capire le frasi: «(non) è sotto il tavolo», «davanti al tavolo» ---------- */
function dvpStatements(s) {
  s = s.replace(/ dov e (il|la|l) [a-z]+ /g, ' # ').replace(/ dove e (il|la|l) [a-z]+ /g, ' # ');
  const out = [], re = / (non )?(?:e )?(sul|su il|su|sopra|sotto|davanti|dietro|accanto)(?: (il|al|a il|a))? tavolo(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const w = m[2], art = m[3] || '';
    const p = w === 'sopra' || w === 'sul' ? 'sul' : w === 'su il' || w === 'su' ? 'sul' : w;
    const form = (w === 'su il' || w === 'su') ? 'x' : w === 'sul' ? 'sul' : w + ' ' + art;
    out.push({ p: p, neg: !!m[1], ok: DV_POS[p].ok.indexOf(form.trim()) !== -1 });
  }
  return out;
}
function dvpEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(dvpQ(X)).trim()) || has(s, gNorm(dvpQ(X)).trim().replace('dov e', 'dove e')), full: true };
  const st = dvpStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  // la cosa nominata, se c'è, deve essere quella giusta
  const other = Object.keys(DVP).map(dvpObj).filter((o, i, a) => o !== dvpObj(X) && a.indexOf(o) === i).some(o => has(s, gNorm(ITEMS[o].word).trim()));
  if (other) return { ok: false, full: false };
  const truth = (x) => x.ok && x.p === dvpPos(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].ok && neg[0].p === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function dvpEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || dvpQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'dov e') || has(s, 'dove e')) return { ok: true, kind: 'what' };
  const st = dvpStatements(s);
  if (st.length === 1 && st[0].ok) return { ok: true, kind: st[0].p === dvpPos(X) ? 'yes' : 'no', ask: st[0].p };
  if (st.length === 1) return bad(dvpSay(X, st[0].p) + '?');
  return bad();
}
function dvpAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + dvpThe(X) + ' è ' + DV_POS[dvpPos(X)].say + '.';
  if (r.kind === 'no') return 'No, ' + dvpThe(X) + ' non è ' + DV_POS[r.ask].say + '. ' + dvpSay(X) + '.';
  return dvpSay(X) + '.';
}
gInstall('dvp', isDvp, SDVP, dvpEvaluate, dvpEvalAsk, dvpAnswerAsk);
