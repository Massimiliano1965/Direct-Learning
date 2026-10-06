'use strict';
/* =====================================================================
   REGOLE DEL CINESE (mandarino) per il motore della lezione.
   Si carica dopo logic.js e sostituisce solo le parti legate alla lingua:
   frasi dell'insegnante, valutazione delle risposte, domande dell'allievo.
   Il flusso della lezione (buildSteps, ripetizioni, punteggi) resta quello.
     这是书。        È un libro.
     这是书吗？      È un libro?          → 是，这是书。 / 不是，这不是书。
     这是书还是笔？  È un libro o una penna?  → 这是笔。
     这是什么？      Che cos'è?           → 这是笔。
   Niente articoli né generi: «questo/questa» non serve.
   ===================================================================== */

const ZH_KEYS = Object.keys(ITEMS).sort((a, b) => ITEMS[b].word.length - ITEMS[a].word.length);
const ZH_W = ZH_KEYS.map(k => ITEMS[k].word).join('|');

np = (k) => ITEMS[k].word;
altPrompt = (a, b) => '这是' + np(a) + '还是' + np(b) + '？';
Q = '这是什么？';

// Solo caratteri cinesi; i caratteri con lo stesso suono e tono diventano la parola giusta;
// «一本书 / 一张桌子 / 这个» → «书 / 桌子 / 这».
norm = function (text) {
  let s = String(text || '').replace(/[^一-鿿]/g, '');
  // proteggo le parole giuste, poi correggo gli alias, poi rimetto le parole
  const mark = (i) => '\u0001' + String.fromCharCode(65 + i) + '\u0002';
  ZH_KEYS.forEach((k, i) => { s = s.split(ITEMS[k].word).join(mark(i)); });
  ZH_KEYS.forEach((k, i) => {
    ITEMS[k].alias.slice().sort((a, b) => b.length - a.length).forEach(a => { s = s.split(a).join(mark(i)); });
  });
  ZH_KEYS.forEach((k, i) => { s = s.split(mark(i)).join(ITEMS[k].word); });
  s = s.replace(/这个/g, '这');
  s = s.replace(new RegExp('一?(?:本|张|把|支|个|只)(?=(?:' + ZH_W + '))', 'g'), '');
  return s;
};

const ZH_KEY = {};
ZH_KEYS.forEach(k => { ZH_KEY[ITEMS[k].word] = k; });
function zhFind(s, re) {
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) out.push(ZH_KEY[m[1]]);
  return out;
}
// «不是书» → negazione; «是书» (non preceduto da 不) → affermazione
function zhNegs(s) { return zhFind(s, new RegExp('不是(' + ZH_W + ')', 'g')); }
function zhClaims(s) { return zhFind(s, new RegExp('(?<!不)是(' + ZH_W + ')', 'g')); }
// «是，这是书» / «是的» / «对» all'inizio; «不是，这不是书» / «不对»
function zhYes(s) { return /^(?:是的|对的|对)/.test(s) || /^是(?=这|$)/.test(s); }
function zhNo(s) { return /^不对/.test(s) || /^不是(?=这|$)/.test(s); }

evaluate = function (step, text) {
  const s = norm(text);
  const c = zhClaims(s), n = zhNegs(s);
  const X = step.show;
  const yes = zhYes(s), no = zhNo(s);
  const onlyX = c.every(w => w === X);
  switch (step.type) {
    case 'echo':
      if (step.check === 'question') return { ok: s.indexOf('什么') !== -1 && !c.length && !n.length, full: true };
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length, full: true };
    case 'yes':
      return { ok: yes && !no && !n.length && c.indexOf(X) !== -1 && onlyX, full: true };
    case 'neg':
      // «不是，这不是书。» oppure solo «这不是书。»
      return { ok: !yes && n.indexOf(step.ask) !== -1 && n.indexOf(X) === -1 && onlyX, full: c.indexOf(X) !== -1 };
    case 'alt':
    case 'key':
      return { ok: c.indexOf(X) !== -1 && onlyX && !n.length && s.indexOf('还是') === -1, full: true };
  }
  return { ok: false, full: false };
};

// Domande dell'allievo
evalAsk = function (X, text) {
  const s = norm(text);
  const bad = (model) => ({ ok: false, model: model || Q });
  if (zhNo(s) || zhNegs(s).length || /^(?:是的|对)/.test(s) || /^是这/.test(s)) return bad();   // ha risposto, non chiesto
  const alt = new RegExp('是(' + ZH_W + ')还是(' + ZH_W + ')').exec(s);
  if (alt) {
    const A = ZH_KEY[alt[1]], B = ZH_KEY[alt[2]];
    return A !== B ? { ok: true, kind: 'alt', ask: A, ask2: B } : bad();
  }
  const c = zhClaims(s);
  if (s.indexOf('什么') !== -1 && !c.length) return { ok: true, kind: 'what' };
  if (c.length === 1) return { ok: true, kind: c[0] === X ? 'yes' : 'no', ask: c[0] };
  return bad();
};
answerAsk = function (X, r) {
  const x = np(X);
  if (r.kind === 'what') return '这是' + x + '。';
  if (r.kind === 'yes') return '是，这是' + x + '。';
  if (r.kind === 'alt') return (r.ask === X || r.ask2 === X) ? '这是' + x + '。' : '这不是' + np(r.ask) + '，也不是' + np(r.ask2) + '。这是' + x + '。';
  return '不是，这不是' + np(r.ask) + '。这是' + x + '。';
};

// Frasi dell'insegnante (q = «questo/questa» non esiste in cinese: si ignora)
Object.assign(S, {
  present: (X) => { const p = '这是' + np(X) + '。'; return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  yes:     (X, q) => ({ type: 'yes', show: X, questo: !!q, prompt: '这是' + np(X) + '吗？', model: '是，这是' + np(X) + '。' }),
  neg:  (X, Y, q) => ({ type: 'neg', show: X, ask: Y, questo: !!q, prompt: '这是' + np(Y) + '吗？', model: '不是，这不是' + np(Y) + '。' }),
  alt:  (X, Y, q) => {
    const o = Math.random() < 0.5 ? [X, Y] : [Y, X];
    return { type: 'alt', show: X, options: o, questo: !!q, prompt: altPrompt(o[0], o[1]), model: '这是' + np(X) + '。' };
  },
  key:     (X) => ({ type: 'key', show: X, prompt: Q, model: '这是' + np(X) + '。' }),
  reveal:  (X) => ({ type: 'reveal', show: X, prompt: Q + '这是' + np(X) + '。', model: '' }),
  askQ:    (X) => ({ type: 'echo', check: 'question', show: X, prompt: Q, model: Q })
});

/* ---------- Pinyin sotto i caratteri (solo per lo schermo) ---------- */
const ZH_PY = {
  '这': 'zhè', '是': 'shì', '不是': 'bú shì', '吗': 'ma', '什么': 'shénme', '还是': 'háishi',
  '也': 'yě', '轮到': 'lúndào', '你': 'nǐ', '了': 'le', '现在': 'xiànzài',
  '对': 'duì', '错': 'cuò', '不对': 'bú duì', '正确': 'zhèngquè', '很': 'hěn', '好': 'hǎo',
  '太': 'tài', '真': 'zhēn', '棒': 'bàng', '非常': 'fēicháng', '可惜': 'kěxī',
  '这一课': 'zhè yí kè', '结束': 'jiéshù', '做得': 'zuò de', '的': 'de', '一': 'yī'
};
Object.keys(ITEMS).forEach(k => { ZH_PY[ITEMS[k].word] = ITEMS[k].py; });
const ZH_PUNCT = { '。': '.', '，': ',', '？': '?', '！': '!', '、': ',' };
function pinyin(text) {
  const keys = Object.keys(ZH_PY).sort((a, b) => b.length - a.length);
  let out = '', i = 0, cap = true;
  while (i < text.length) {
    const ch = text[i];
    if (ZH_PUNCT[ch]) { out += ZH_PUNCT[ch]; cap = ch !== '，' && ch !== '、'; i++; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    const w = keys.find(k => text.startsWith(k, i));
    let p = w ? ZH_PY[w] : ch;
    if (cap) { p = p.charAt(0).toUpperCase() + p.slice(1); cap = false; }
    out += (out && !/\s$/.test(out) ? ' ' : '') + p;
    i += w ? w.length : 1;
  }
  return out.replace(/ ([.,?!])/g, '$1');
}
COURSE.show = (text) => text + '\n' + pinyin(text);
