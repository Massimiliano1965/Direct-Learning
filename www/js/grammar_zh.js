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

/* ---------- Confronto sul SUONO (per chi non pronuncia ancora bene) ----------
   Il microfono scrive caratteri con un suono simile ma diversi («日系说的» per «这是桌子»).
   Quindi: caratteri → sillabe senza toni → somiglianza con le frasi possibili del passo.
   Vince la frase che somiglia di più; se è quella giusta e somiglia abbastanza, va bene.
   Quanto basta dipende dall'insegnante: Mass vuole quasi la pronuncia giusta, Sara molto meno. */
const ZH_TOL = { mass: 0.82, giulia: 0.72, luca: 0.58, sara: 0.45 };
function zhTol() {
  const t = (typeof L !== 'undefined' && L && L.teacher) ? L.teacher.key : null;
  return ZH_TOL[t] || 0.6;
}
function zhSyl(text) {
  const out = [];
  for (const ch of String(text || '')) if (ZH_SOUND[ch]) out.push(ZH_SOUND[ch]);
  return out;
}
const ZH_INI = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
// suoni che chi impara confonde: stesso gruppo = quasi uguale
const ZH_GRP = { zh: 'Z', z: 'Z', j: 'Z', ch: 'C', c: 'C', q: 'C', sh: 'S', s: 'S', x: 'S', r: 'R',
  b: 'B', p: 'B', d: 'D', t: 'D', g: 'G', k: 'G', h: 'H', f: 'H', l: 'L', n: 'L', m: 'M', y: '', w: '', '': '' };
const ZH_NEAR = { 'Z|C': 0.5, 'Z|S': 0.45, 'C|S': 0.45, 'Z|R': 0.45, 'S|R': 0.4, 'L|R': 0.45, 'B|M': 0.3, 'D|L': 0.3 };
function zhSplit(s) {
  const i = ZH_INI.find(x => s.startsWith(x)) || '';
  let f = s.slice(i.length);
  if (i === 'y') f = f === 'u' || f.startsWith('u') ? 'v' + f.slice(1) : (f.startsWith('i') ? f : 'i' + f);
  if (i === 'w') f = f.startsWith('u') ? f : 'u' + f;
  if (/^(zh|ch|sh|r|z|c|s)$/.test(i) && f === 'i') f = 'I';           // la «i» di shi/zhi/ri/si
  if (/^[jqx]$/.test(i) && f.startsWith('u')) f = 'v' + f.slice(1);   // ju = jü
  return [i, f];
}
function zhEdit(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; for (let j = 1; j <= b.length; j++) d[i][j] = i ? 0 : j; }
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function zhSylSim(a, b) {
  if (a === b) return 1;
  const [ia, fa] = zhSplit(a), [ib, fb] = zhSplit(b);
  const ga = ZH_GRP[ia], gb = ZH_GRP[ib];
  const iniS = ia === ib ? 1 : ga === gb ? 0.8 : (ZH_NEAR[ga + '|' + gb] || ZH_NEAR[gb + '|' + ga] || 0);
  const fA = fa === 'I' ? 'i' : fa, fB = fb === 'I' ? 'i' : fb;
  const finS = fa === fb ? 1 : Math.max(0, 1 - zhEdit(fA, fB) / Math.max(fA.length, fB.length, 1));
  return 0.45 * iniS + 0.55 * finS;
}
// somiglianza tra due frasi (sillabe allineate, quelle in più o in meno costano)
function zhSim(a, b) {
  if (!a.length || !b.length) return 0;
  const GAP = -0.25;
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = []; for (let j = 0; j <= b.length; j++) d[i][j] = 0; }
  for (let i = 1; i <= a.length; i++) d[i][0] = i * GAP;
  for (let j = 1; j <= b.length; j++) d[0][j] = j * GAP;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.max(d[i - 1][j - 1] + zhSylSim(a[i - 1], b[j - 1]), d[i - 1][j] + GAP, d[i][j - 1] + GAP);
  return Math.max(0, d[a.length][b.length] / Math.max(a.length, b.length));
}
// Frasi possibili per un passo: quelle giuste (ok) e quelle sbagliate più probabili
function zhCandidates(step) {
  const all = Object.keys(ITEMS), X = step.show, out = [];
  const add = (t, ok, full) => out.push({ syl: zhSyl(t), ok: ok, full: !!full });
  const pres = (k) => '这是' + np(k);
  if (step.type === 'echo' && step.check === 'question') { add('这是什么', true); all.forEach(k => add(pres(k), false)); return out; }
  if (step.type === 'echo') { all.forEach(k => { add(pres(k), k === X); add('这不是' + np(k), false); }); return out; }
  if (step.type === 'yes') {
    all.forEach(k => { add('是这是' + np(k), k === X); add('不是这不是' + np(k), false); add(pres(k), false); });
    return out;
  }
  if (step.type === 'neg') {
    all.forEach(k => { add('不是这不是' + np(k), k === step.ask); add('是这是' + np(k), false); add(pres(k), false); });
    if (!step.fresh) all.forEach(k => { if (k !== step.ask) add('不是这不是' + np(step.ask) + '这是' + np(k), k === X, true); });
    return out;
  }
  // alt, key
  all.forEach(k => add(pres(k), k === X));
  add('这是什么', false);
  return out;
}
function zhBySound(step, text) {
  const heard = zhSyl(text);
  if (!heard.length) return null;
  const cands = zhCandidates(step);
  let best = null, bestWrong = 0;
  cands.forEach(c => {
    const s = zhSim(heard, c.syl);
    if (c.ok) { if (!best || s > best.s) best = { s: s, full: c.full }; }
    else bestWrong = Math.max(bestWrong, s);
  });
  const tol = zhTol();
  if (!best || best.s < tol || best.s <= bestWrong) return null;
  return { ok: true, full: best.full || step.type !== 'neg', bySound: true };
}
const zhEvaluateExact = evaluate;
evaluate = function (step, text) {
  const r = zhEvaluateExact(step, text);
  if (r.ok) return r;
  return zhBySound(step, text) || r;
};
// Sotto «Heard» anche la pronuncia di quello che ha capito il microfono
COURSE.heard = (text) => { const p = zhSyl(text).join(' '); return p ? text + ' (' + p + ')' : text; };

// Eco della domanda «o»: «…还是桌子» il microfono la scrive «是桌子 / 这是桌子»
const zhIsEchoBase = isEcho;
isEcho = function (step, text) {
  if (zhIsEchoBase(step, text)) return true;
  if (step && step.type === 'alt' && step.options && step.options[1] !== step.show) {
    const s = norm(text), c = zhClaims(s);
    if (c.length === 1 && c[0] === step.options[1] && !zhNegs(s).length && s.length <= np(c[0]).length + 3) return true;
  }
  return false;
};
