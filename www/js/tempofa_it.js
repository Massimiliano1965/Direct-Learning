'use strict';
/* =====================================================================
   CAPITOLO 19: «Il tempo che fa» (lezione 87, livello 4). Si carica dopo gen_it.js.
   Il cielo: il sole, la pioggia (con l'ombrello), la neve, il vento (l'albero piegato), le nuvole; il termometro per il caldo e il freddo:
     C'è il sole.                       → ripete
     Piove?                             → Sì, piove.
     Nevica?                            → No, non nevica.
     Fa caldo o fa freddo?              → Fa caldo.
     Che tempo fa?                      → Piove.
   Il punto: ogni tempo ha la sua frase: c'è il sole, c'è vento, piove, nevica, è nuvoloso, fa caldo, fa freddo.
   Errori: il tempo sbagliato, «fa sole», «è piove».
   ===================================================================== */

const TFA = { tf_sole: 1, tf_piove: 1, tf_nevica: 1, tf_vento: 1, tf_nuvoloso: 1, tf_caldo: 1, tf_freddo: 1 };
const TF_SAY = { sole: 'c\'è il sole', piove: 'piove', nevica: 'nevica', vento: 'c\'è vento', nuvoloso: 'è nuvoloso', caldo: 'fa caldo', freddo: 'fa freddo' };
const TF_NOT = { sole: 'non c\'è il sole', piove: 'non piove', nevica: 'non nevica', vento: 'non c\'è vento', nuvoloso: 'non è nuvoloso', caldo: 'non fa caldo', freddo: 'non fa freddo' };
// come lo scrive gNorm (c'è → «c e»)
const TF_RE = { sole: 'c e (il )?sole', piove: 'piove', nevica: 'nevica', vento: '(c e (il )?vento|tira vento)', nuvoloso: 'e nuvoloso', caldo: 'fa caldo', freddo: 'fa freddo' };
const isTf = (X) => !!TFA[X];
const tfK = (X) => X.slice(3);
const TF_Q = 'Che tempo fa?';
const tfOther = (X) => pick(Object.keys(TF_SAY).filter(k => k !== tfK(X) && !(tfK(X) === 'sole' && k === 'caldo') && !(tfK(X) === 'caldo' && k === 'sole') &&
  !(tfK(X) === 'nevica' && k === 'freddo') && !(tfK(X) === 'freddo' && k === 'nevica') && !(tfK(X) === 'piove' && k === 'nuvoloso')));

/* ---------- Figure ---------- */
const tfCloud = (x, y, s, c) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-18 6 q-8 0 -8 -7 q0 -8 9 -8 q2 -10 13 -10 q10 0 13 8 q10 -2 12 7 q1 10 -9 10z" fill="' + c + '"/></g>';
const tfThermo = (hot) => '<rect x="38" y="10" width="24" height="76" rx="12" fill="#f3eee2" stroke="#8d93a3" stroke-width="1.2"/>' +
  '<rect x="46" y="18" width="8" height="54" rx="4" fill="#dfe4ea"/><rect x="46" y="' + (hot ? 22 : 58) + '" width="8" height="' + (hot ? 50 : 14) + '" rx="4" fill="' + (hot ? '#d23c44' : '#3f8fd0') + '"/>' +
  '<circle cx="50" cy="76" r="8" fill="' + (hot ? '#d23c44' : '#3f8fd0') + '"/>' +
  [24, 34, 44, 54, 64].map(y => '<path d="M56 ' + y + ' h4" stroke="#8d93a3" stroke-width="1"/>').join('') +
  '<text x="72" y="' + (hot ? 26 : 64) + '" font-family="Georgia,serif" font-size="11" font-weight="bold" fill="' + (hot ? '#d23c44' : '#3f8fd0') + '">' + (hot ? '35°' : '−5°') + '</text>';
const TF_FIG = {
  sole: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#5fb0e6"/><circle cx="50" cy="40" r="16" fill="#f3d36b"/>' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => '<path d="M50 16 v-8" transform="rotate(' + a + ' 50 40)" stroke="#f3d36b" stroke-width="3" stroke-linecap="round"/>').join('') +
    '<path d="M2 76 q48 -10 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#7cc06a"/>',
  piove: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#8794a6"/>' + tfCloud(36, 30, 1.1, '#5d6577') + tfCloud(68, 26, 1, '#6e7686') +
    [[20, 40], [32, 46], [44, 38], [56, 44], [68, 38], [80, 46], [26, 60], [74, 60], [86, 30], [14, 30]].map(([x, y]) => '<path d="M' + x + ' ' + y + ' l-3 8" stroke="#bfe0ee" stroke-width="2" stroke-linecap="round"/>').join('') +
    '<path d="M2 82 h96 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#5d6f63"/>' +
    // l'ombrello aperto, giallo (la lezione 36: gli ombrelli gialli)
    '<path d="M30 66 q20 -22 40 0 q-5 -4 -10 0 q-5 -4 -10 0 q-5 -4 -10 0 q-5 -4 -10 0z" fill="#f2c81e"/><path d="M50 52 v32 q0 4 -4 4" stroke="#3a3f4a" stroke-width="2" fill="none"/>' +
    '<ellipse cx="70" cy="90" rx="10" ry="2.4" fill="#9fb4c8" opacity=".7"/>',
  nevica: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#aebccb"/>' + tfCloud(40, 28, 1.1, '#e4e9ef') + tfCloud(70, 24, .9, '#d5dce5') +
    [[18, 40], [34, 48], [50, 40], [66, 50], [82, 42], [26, 62], [58, 64], [76, 66], [42, 74]].map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ')" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><path d="M0 -4 v8 M-3.5 -2 l7 4 M-3.5 2 l7 -4"/></g>').join('') +
    '<path d="M2 78 q48 -8 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#f4f6f9"/>',
  vento: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#9fc6e2"/><path d="M2 80 q48 -6 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#7cb06a"/>' +
    '<path d="M64 82 q2 -20 -8 -34" stroke="#7a5735" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="40" rx="20" ry="12" transform="rotate(-25 50 40)" fill="#4f8f4f"/>' +
    '<path d="M8 22 h30 q8 0 8 -6 q0 -5 -5 -5 M10 34 h18 M6 58 h26 q7 0 7 5 q0 4 -4 4 M76 26 h14" stroke="#f3eee2" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    [[22, 46, 30], [34, 70, -20], [86, 50, 60]].map(([x, y, r]) => '<ellipse cx="' + x + '" cy="' + y + '" rx="4" ry="2" transform="rotate(' + r + ' ' + x + ' ' + y + ')" fill="#5a9a46"/>').join(''),
  nuvoloso: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#9aa6b6"/>' + tfCloud(32, 34, 1.1, '#e4e9ef') + tfCloud(70, 30, 1.1, '#cfd6df') + tfCloud(52, 60, 1.2, '#dfe4ea') +
    '<path d="M2 82 q48 -6 96 0 V88 a10 10 0 0 1 -10 10 H12 a10 10 0 0 1 -10 -10z" fill="#6f8a6a"/>',
  caldo: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#f2c27a"/><circle cx="18" cy="18" r="9" fill="#f3d36b"/>' +
    '<path d="M14 40 q4 -5 0 -10 M22 44 q4 -5 0 -10 M84 56 q4 -5 0 -10" stroke="#e8862a" stroke-width="2" fill="none" stroke-linecap="round"/>' + tfThermo(true),
  freddo: '<rect x="2" y="2" width="96" height="96" rx="10" fill="#c9dbea"/>' +
    '<path transform="translate(8 3) scale(.84)" d="M2 2 h96 v6 l-6 10 l-4 -10 l-6 14 l-5 -14 l-6 8 l-4 -8 l-8 12 l-4 -12 l-6 6 l-4 -6 l-8 16 l-4 -16 l-6 10 l-4 -10 l-6 12 l-5 -12 l-8 8 v-14z" fill="#f4f8fc"/>' +
    [[18, 50], [84, 70], [20, 80]].map(([x, y]) => '<g transform="translate(' + x + ' ' + y + ')" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><path d="M0 -4 v8 M-3.5 -2 l7 4 M-3.5 2 l7 -4"/></g>').join('') + tfThermo(false)
};
Object.keys(TFA).forEach(X => { FIG[X] = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + TF_FIG[tfK(X)] + '</svg>'; });

const STF = gTag('tf', {
  present: (X) => { const p = gCap(TF_SAY[tfK(X)]) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: gCap(TF_SAY[tfK(X)]) + '?', model: 'Sì, ' + TF_SAY[tfK(X)] + '.' }),
  neg: (X) => { const o = tfOther(X); return { type: 'neg', show: X, ask: o, prompt: gCap(TF_SAY[o]) + '?', model: 'No, ' + TF_NOT[o] + '.', complete: gCap(TF_SAY[tfK(X)]) + '.' }; },
  alt: (X) => { const o = tfOther(X), ord = Math.random() < 0.5 ? [tfK(X), o] : [o, tfK(X)];
    return { type: 'alt', show: X, prompt: gCap(TF_SAY[ord[0]]) + ' o ' + TF_SAY[ord[1]] + '?', model: gCap(TF_SAY[tfK(X)]) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: TF_Q, model: gCap(TF_SAY[tfK(X)]) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: TF_Q + ' ' + gCap(TF_SAY[tfK(X)]) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: TF_Q, model: TF_Q })
});

/* ---------- Capire le frasi ---------- */
function tfStatements(s) {
  s = s.replace(/ che tempo fa /g, ' # ');
  const out = [];
  Object.keys(TF_RE).forEach(k => {
    const re = new RegExp(' (non )?' + TF_RE[k] + '(?= )', 'g');
    let m;
    while ((m = re.exec(s)) !== null) out.push({ k: k, neg: !!m[1] });
  });
  // «fa sole», «è piove»: sbagliato
  const bad = / fa (il )?sole | e (piove|nevica) | fa (piove|nevica|vento) /.test(s);
  return { st: out, bad: bad };
}
function evaluateTf(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, 'che tempo fa'), full: true };
  const { st, bad } = tfStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.k === tfK(X), allPos = pos.every(truth) && !bad;
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].k === step.ask && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskTf(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || TF_Q });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che tempo fa')) return { ok: true, kind: 'what' };
  const { st, bad: b } = tfStatements(s);
  if (st.length === 1 && !b) return { ok: true, kind: st[0].k === tfK(X) ? 'yes' : 'no', ask: st[0].k };
  return bad();
}
function answerAskTf(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + TF_SAY[tfK(X)] + '.';
  if (r.kind === 'no') return 'No, ' + TF_NOT[r.ask] + '. ' + gCap(TF_SAY[tfK(X)]) + '.';
  return gCap(TF_SAY[tfK(X)]) + '.';
}
gInstall('tf', isTf, STF, evaluateTf, evalAskTf, answerAskTf);
