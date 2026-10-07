'use strict';
/* =====================================================================
   CAPITOLO 17: «Che lingua parla?» (lezione 81, livello 4). Si carica dopo nat_it.js (le persone e le bandiere della lezione 13).
   La persona con la sua bandiera e il fumetto che le esce dalla bocca: dentro la bandiera della lingua e il saluto (Hello!, Hallo!, こんにちは…):
     Questa signora è americana. Parla inglese.           → ripete
     Questo signore parla italiano?                       → Sì, questo signore parla italiano.
     Questa signora parla cinese?                         → No, questa signora non parla cinese.
     Questo signore parla tedesco o giapponese?           → Questo signore parla giapponese.
     Che lingua parla questa signora?                     → Questa signora parla tedesco.
   Il punto: la nazionalità cambia (italiano / italiana, tedesco / tedesca), la lingua no («parla italiano», anche lei);
   l'americana parla inglese. Ci sono le lingue degli allievi: inglese, tedesco, giapponese.
   Errori: «parla italiana», «parla americano», la lingua sbagliata, «questa signore».
   ===================================================================== */

const LG_LANG = { italia: 'italiano', francia: 'francese', inghilterra: 'inglese', america: 'inglese', germania: 'tedesco', giappone: 'giapponese', cina: 'cinese' };
const LG_FLAG = { italiano: 'italia', francese: 'francia', inglese: 'inghilterra', tedesco: 'germania', giapponese: 'giappone', cinese: 'cina' };
const LG = { lg_m_italia: 1, lg_f_america: 1, lg_m_giappone: 1, lg_f_germania: 1, lg_m_inghilterra: 1, lg_f_francia: 1, lg_m_cina: 1 };
const isLg = (X) => !!LG[X];
const lgG = (X) => X.charAt(3);
const lgC = (X) => X.slice(5);
const lgLang = (X) => LG_LANG[lgC(X)];
const lgWho = (X) => nWho(lgG(X));                                                       // «questo signore», «questa signora»
const lgSay = (X, l, neg) => gCap(lgWho(X)) + (neg ? ' non' : '') + ' parla ' + (l || lgLang(X));
const lgQ = (X) => 'Che lingua parla ' + lgWho(X) + '?';
const lgOther = (X) => pick(Object.keys(LG_FLAG).filter(l => l !== lgLang(X)));

/* ---------- Figura: la persona della lezione 13 e il fumetto con la bandiera della lingua; le parole escono dalla bocca ---------- */
// il saluto nella lingua (Massi): non solo «bla bla», la parola vera; giapponese e cinese con la pronuncia sotto
const LG_HELLO = { italiano: ['Ciao!'], inglese: ['Hello!'], tedesco: ['Hallo!'], francese: ['Bonjour!'], giapponese: ['こんにちは', 'konnichiwa'], cinese: ['你好', 'nǐ hǎo'] };
function lgFig(X) {
  const lang = lgLang(X), base = natFig('n_' + lgG(X) + '_' + lgC(X)), flag = (typeof FLAG !== 'undefined' && FLAG[LG_FLAG[lang]]) || '', h = LG_HELLO[lang];
  const big = h[1] ? Math.min(7, 28 / h[0].length) : Math.min(9, 29 / (h[0].length * .56));
  const txt = (y, size, t, extra) => '<text x="18" y="' + y + '" text-anchor="middle" font-family="Georgia,\'Noto Sans CJK JP\',serif" font-size="' + size + '" fill="#2a3346"' + (extra || '') + '>' + t + '</text>';
  const bubble = '<path d="M7 2 h22 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-1 l17 8 l-23 -8 h-15 a6 6 0 0 1 -6 -6 v-24 a6 6 0 0 1 6 -6z" fill="#f3eee2" stroke="#c9a45c" stroke-width="1.2"/>' +
    '<g transform="translate(10 5) scale(.16 .107)">' + flag + '</g><rect x="10" y="5" width="16" height="10.7" fill="none" stroke="#8d93a3" stroke-width=".5"/>' +
    // il saluto esce dalla bocca e va nel fumetto, resta lì da leggere, poi ricomincia
    '<g>' + txt(h[1] ? 26 : 29, big.toFixed(1), h[0], ' font-weight="bold"') + (h[1] ? txt(34, 5.4, h[1], ' font-style="italic"') : '') +
    '<animateTransform attributeName="transform" type="translate" values="30 14;0 0;0 0" keyTimes="0;.12;1" dur="3.5s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.94;1" dur="3.5s" repeatCount="indefinite"/></g>';
  // la persona un po' a destra, così il fumetto non copre la faccia
  return base.replace('translate(50 100) scale(1.42)', 'translate(60 100) scale(1.42)').replace(/<\/svg>$/, bubble + '</svg>');
}
Object.keys(LG).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => lgFig(X) }); });

const SLG = gTag('lg', {
  present: (X) => { const p = gCap(lgWho(X)) + ' è ' + nAdj(lgC(X), lgG(X)) + '. Parla ' + lgLang(X) + '.'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes: (X) => ({ type: 'yes', show: X, prompt: lgSay(X) + '?', model: 'Sì, ' + lgWho(X) + ' parla ' + lgLang(X) + '.' }),
  neg: (X) => { const o = lgOther(X); return { type: 'neg', show: X, ask: o, prompt: lgSay(X, o) + '?', model: 'No, ' + lgWho(X) + ' non parla ' + o + '.', complete: lgSay(X) + '.' }; },
  alt: (X) => { const o = lgOther(X), ord = Math.random() < 0.5 ? [lgLang(X), o] : [o, lgLang(X)];
    return { type: 'alt', show: X, prompt: lgSay(X, ord[0]) + ' o ' + ord[1] + '?', model: lgSay(X) + '.' }; },
  key: (X) => ({ type: 'key', show: X, prompt: lgQ(X), model: lgSay(X) + '.' }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: lgQ(X) + ' ' + lgSay(X) + '.', model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: lgQ(X), model: lgQ(X) })
});

/* ---------- Capire le frasi: «(questo signore / lei) (non) parla inglese» ---------- */
function lgStatements(s) {
  s = s.replace(/ che lingua parla( (questo|questa) (signore|signora)| lui| lei)? /g, ' # ');
  const out = [], w = s.trim().split(' ');
  for (let i = 0; i < w.length; i++) {
    if (w[i] !== 'parla') continue;
    let j = i - 1;
    const neg = w[j] === 'non';
    if (neg) j--;
    let g = null, dem = true;
    if (/^(signore|signora)$/.test(w[j] || '')) { g = w[j] === 'signora' ? 'f' : 'm'; dem = w[j - 1] === (g === 'f' ? 'questa' : 'questo') || !/^(questo|questa|quest)$/.test(w[j - 1] || ''); }
    else if (w[j] === 'lui') g = 'm';
    else if (w[j] === 'lei') g = 'f';
    const lang = LG_FLAG[w[i + 1]] ? w[i + 1] : null;
    out.push({ g: g, lang: lang, neg: neg, good: dem && !!lang });
  }
  return out;
}
function evaluateLg(step, text) {
  const s = gNorm(text), X = step.show;
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(lgQ(X)).trim()), full: true };
  const st = lgStatements(s), pos = st.filter(x => !x.neg), neg = st.filter(x => x.neg), yes = has(s, 'si'), no = has(s, 'no');
  const truth = (x) => x.good && x.lang === lgLang(X) && (x.g === null || x.g === lgG(X)), allPos = pos.every(truth);
  switch (step.type) {
    case 'echo': return { ok: pos.some(truth) && allPos && !neg.length, full: true };
    case 'yes': return { ok: yes && !no && !neg.length && pos.some(truth) && allPos, full: true };
    case 'neg': return { ok: !yes && neg.length === 1 && neg[0].good && neg[0].lang === step.ask && (neg[0].g === null || neg[0].g === lgG(X)) && allPos, full: pos.some(truth) };
    default: return { ok: pos.some(truth) && allPos && !neg.length && !yes && !no && !has(s, 'o'), full: true };
  }
}
function evalAskLg(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || lgQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, 'che lingua parla')) return { ok: true, kind: 'what' };
  const st = lgStatements(s);
  if (st.length === 1 && st[0].good && (st[0].g === null || st[0].g === lgG(X))) return { ok: true, kind: st[0].lang === lgLang(X) ? 'yes' : 'no', ask: st[0].lang };
  if (st.length === 1 && st[0].lang) return bad(lgSay(X, st[0].lang) + '?');
  return bad();
}
function answerAskLg(X, r) {
  if (r.kind === 'yes') return 'Sì, ' + lgWho(X) + ' parla ' + lgLang(X) + '.';
  if (r.kind === 'no') return 'No, ' + lgWho(X) + ' non parla ' + r.ask + '. ' + lgSay(X) + '.';
  return lgSay(X) + '.';
}
gInstall('lg', isLg, SLG, evaluateLg, evalAskLg, answerAskLg);
