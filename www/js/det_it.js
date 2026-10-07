'use strict';
/* =====================================================================
   CAPITOLO 5: le parole davanti al nome, al singolare e al plurale, con i colori (lezioni 35, 36, 37).
   Si carica dopo gen_it.js. Tre modi (la prima lettera della figura dopo «d»):
     dq_…  lezione 35  «Questo, questa, questi, queste»:   Questo telefono è giallo.  Queste tazze sono bianche.
     dd_…  lezione 36  «Il plurale degli articoli» (l' → gli, l' → le; e → i):  Gli ombrelli sono gialli.  I portatili sono bianchi.  Le chiavi sono gialle.
     dl_…  lezione 37  «Quel, quella, quei, quegli, quelle» (le cose lontane):  Quegli zaini sono rossi.  Quella valigia è rossa.
   Niente cose nere (sul fondo blu notte non si vedono): giallo, bianco e rosso.
   Domande: «Di che colore sono queste tazze?» → «Queste tazze sono bianche.»; sì, no, «o», come nella lezione 5.
   Come nella lezione 22, -o / -i azzurre e -a / -e rosse nelle parole che le hanno (nome, colore, questo / quello).
   Errori: la parola davanti sbagliata («questo tazze», «i ombrelli», «quei zaini»), il nome non al plurale,
   «è» / «sono», il colore non accordato («sono bianchi» per le tazze).
   ===================================================================== */

// figura: dq_cup_bianco_2 → modo q, cosa cup, colore bianco, due
const DET = {
  dq_phone_giallo_1: 1, dq_phone_giallo_2: 1, dq_cup_bianco_1: 1, dq_cup_bianco_2: 1, dq_suitcase_rosso_2: 1, dq_coat_rosso_1: 1,
  dd_umbrella_giallo_2: 1, dd_backpack_rosso_2: 1, dd_agenda_bianco_2: 1, dd_label_rosso_2: 1, dd_laptop_bianco_2: 1, dd_key_giallo_2: 1,
  dl_umbrella_giallo_1: 1, dl_phone_bianco_2: 1, dl_backpack_rosso_2: 1, dl_suitcase_rosso_1: 1, dl_cup_bianco_2: 1, dl_coat_rosso_1: 1
};
// le figure colorate che mancano
FIG.backpack_rosso = recolor(FIG.backpack, { '#3a4f7e': '#b3262f', '#2c3e66': '#861b22', '#24345a': '#6e1219' });
// colori chiari al posto del nero (Massi: le cose nere sul fondo blu notte non si vedono)
FIG.phone_giallo = CFIG.phone(['#f2c81e', '#c9a21a']);
FIG.umbrella_giallo = recolor(FIG.umbrella, { '#2c3e66': '#e8b81e', '#3a4f7e': '#f6d04a' });
FIG.agenda_bianco = recolor(FIG.agenda, { '#2e2f37': '#eceef2', '#24252c': '#c4cad4' });
// le chiavi gialle (lezione 36): quelle nere sul fondo blu notte non si vedevano (Massi)
FIG.key_giallo = recolor(FIG.key, { '#c9a45c': '#f2c81e', '#b8923f': '#d1a50f', '#e0c287': '#fbe57a' });
FIG.suitcase_rosso = FIG.suitcase_rosso || CFIG.suitcase(COL_SHADE.rosso);

const isDet = (X) => !!DET[X];
const dMode = (X) => X.charAt(1);                       // q, d, l
const dObj = (X) => X.split('_')[1];
const dCol = (X) => X.split('_')[2];
const dN = (X) => +X.split('_')[3];
const dStarts = (w) => ({ v: /^[aeiou]/.test(w), sc: /^(s[^aeiou]|z|gn|ps)/.test(w) });
// la parola davanti: questo / il / quel… (con l'apostrofo se serve)
function dDet(mode, obj, n) {
  const w = gWord(obj, n), f = gFem(obj), a = dStarts(w);
  if (mode === 'd') return gDef(obj, n);
  if (mode === 'q') return n === 1 ? (f ? 'questa' : 'questo') : (f ? 'queste' : 'questi');
  if (n === 1) return a.v ? 'quell\'' : f ? 'quella' : a.sc ? 'quello' : 'quel';
  return f ? 'quelle' : (a.v || a.sc) ? 'quegli' : 'quei';
}
const dThe = (X) => gJoin(dDet(dMode(X), dObj(X), dN(X)), gWord(dObj(X), dN(X)));       // «queste tazze», «quell'ombrello»
const dIs = (n) => n === 1 ? 'è' : 'sono';
const dSay = (X, col) => gCap(dThe(X)) + ' ' + dIs(dN(X)) + ' ' + gCol(col || dCol(X), dObj(X), dN(X));
const dQ = (X) => 'Di che colore ' + dIs(dN(X)) + ' ' + dThe(X) + '?';
const dOtherCol = (X) => pick(Object.keys(COLORS).filter(c => c !== dCol(X)));
Object.keys(DET).forEach(X => { FIG[X] = gMany(FIG[dObj(X) + '_' + dCol(X)], dN(X), dMode(X) === 'l'); });

const SDT = gTag('dt', {
  present: (X) => { const p = dSay(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: dSay(X) + '?', model: 'Sì, ' + dThe(X) + ' ' + dIs(dN(X)) + ' ' + gCol(dCol(X), dObj(X), dN(X)) + '.' }),
  neg: (X) => { const o = dOtherCol(X);
    return { type: 'neg', show: X, ask: o, prompt: dSay(X, o) + '?', model: 'No, ' + dThe(X) + ' non ' + dIs(dN(X)) + ' ' + gCol(o, dObj(X), dN(X)) + '.', complete: dSay(X) + '.' }; },
  alt: (X) => { const o = dOtherCol(X), ord = Math.random() < 0.5 ? [dCol(X), o] : [o, dCol(X)];
    return { type: 'alt', show: X, prompt: gCap(dThe(X)) + ' ' + dIs(dN(X)) + ' ' + gCol(ord[0], dObj(X), dN(X)) + ' o ' + gCol(ord[1], dObj(X), dN(X)) + '?', model: dSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: dQ(X), model: dSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: dQ(X) + ' ' + dSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: dQ(X), model: dQ(X) })
});

/* ---------- Capire le frasi: «queste tazze (non) sono bianche» ---------- */
const D_DETS = 'il|lo|la|l|i|gli|le|questo|questa|quest|questi|queste|quel|quello|quella|quell|quei|quegli|quelle';
function dStatements(s) {
  s = s.replace(/ di che colore (e|sono) /g, ' # ');
  const out = [], re = new RegExp(' (' + D_DETS + ') ([a-z]+) (non )?(e|sono) ([a-z]+)(?= )', 'g');
  let m;
  while ((m = re.exec(s)) !== null) {
    const nn = gNoun(m[2]), cw = G_COLOR_WORD[m[5]];
    if (!cw) continue;
    out.push({ det: m[1], noun: nn, neg: !!m[3], verb: m[4], col: cw.col, cg: cw.g, cpl: cw.plural });
  }
  return out;
}
// la frase dice la figura X (con il colore col)? parola davanti, nome, verbo e colore accordati
function dGood(x, X) {
  const o = dObj(X), n = dN(X), want = dDet(dMode(X), o, n).replace('\'', '');
  const detOk = x.det === want || (want === 'questo' || want === 'questa') && x.det === 'quest' && dStarts(gWord(o, n)).v;
  return detOk && x.noun && x.noun.obj === o && x.noun.plural === (n > 1) && x.verb === (n > 1 ? 'sono' : 'e') &&
    x.cg === (gFem(o) ? 'f' : 'm') && x.cpl === (n > 1);
}
function dEvaluate(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(dQ(X)).trim()), full: true };
  const st = dStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg);
  const yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => dGood(x, X) && x.col === dCol(X), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.some(x => dGood(x, X) && x.col === step.ask) && !neg.some(x => x.col === dCol(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !has(s, 'o') && !has(s, 'di che colore'), full: true };
  }
}
function dEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || dQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'di che colore')) return has(s, gNorm(dQ(X)).trim()) ? { ok: true, kind: 'what' } : bad();
  const st = dStatements(s);
  if (st.length === 1 && dGood(st[0], X)) return { ok: true, kind: st[0].col === dCol(X) ? 'yes' : 'no', ask: st[0].col };
  if (st.length === 1) return bad(dSay(X, st[0].col) + '?');
  return bad();
}
function dAnswerAsk(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + dThe(X) + ' ' + dIs(dN(X)) + ' ' + gCol(dCol(X), dObj(X), dN(X)) + '.';
  if (r.kind === 'no') return 'No, ' + dThe(X) + ' non ' + dIs(dN(X)) + ' ' + gCol(r.ask, dObj(X), dN(X)) + '. ' + dSay(X) + '.';
  return dSay(X) + '.';
}
gInstall('dt', isDet, SDT, dEvaluate, dEvalAsk, dAnswerAsk);
if (typeof genderWords === 'function') {
  const bGw = genderWords;
  genderWords = (lesson) => {
    if (!lesson.dt) return bGw(lesson);
    const objs = lesson.known.map(dObj), w = gGenderWords(objs);
    Object.keys(G_COLORS).forEach(c => w.push(G_COLORS[c].m, G_COLORS[c].f, COLORS_PL[c].m, COLORS_PL[c].f));
    w.push('questo', 'questa', 'questi', 'queste', 'quello', 'quella', 'quelle', 'quegli', 'quei');
    return w.filter((x, i) => w.indexOf(x) === i);
  };
}
