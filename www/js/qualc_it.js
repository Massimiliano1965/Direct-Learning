'use strict';
/* =====================================================================
   CAPITOLO 9: «Qualcuno / nessuno, qualche cosa / niente» (lezione 56, livello 2).
   Si carica dopo cece_it.js (il tavolo) e verbs_it.js (i due colleghi).
   La stanza con Max o Isa, oppure vuota; il tavolo con una cosa, oppure vuoto:
     Nella stanza c'è qualcuno. C'è Max.          Nella stanza non c'è nessuno.     → ripete
     C'è qualcuno nella stanza?                   → Sì, c'è qualcuno.   /  No, non c'è nessuno.
     C'è Isa nella stanza?                        → No, non c'è Isa.
     Chi c'è nella stanza?                        → C'è Max.            /  Non c'è nessuno.
     C'è qualche cosa sul tavolo?                 → Sì, c'è qualche cosa.   /  No, non c'è niente.
     Che cosa c'è sul tavolo?                     → C'è un libro.       /  Non c'è niente.
   Il punto: «non c'è nessuno», «non c'è niente» (con «non»); qualcuno per le persone, qualche cosa per le cose.
   Errori: «c'è nessuno» (senza non), «non c'è qualcuno», «nessuno» per il tavolo e «niente» per la stanza.
   ===================================================================== */

const QNC = { qn_p_m: 1, qn_p_f: 1, qn_p_0: 1, qn_t_book: 1, qn_t_cup: 1, qn_t_0: 1 };
const isQn = (X) => !!QNC[X];
const qnRoom = (X) => X.charAt(3) === 'p';
const qnWhat = (X) => X.slice(5);                         // 'm' / 'f' / 'book' / 'cup' / '0'
const qnEmpty = (X) => qnWhat(X) === '0';
const qnPlace = (X) => qnRoom(X) ? 'nella stanza' : 'sul tavolo';
const qnSome = (X) => qnRoom(X) ? 'qualcuno' : 'qualche cosa';
const qnNone = (X) => qnRoom(X) ? 'nessuno' : 'niente';
const qnThing = (X, v) => qnRoom(X) ? vName(v || qnWhat(X)) : np(v || qnWhat(X));       // «Max», «un libro»
const qnKeyQ = (X) => qnRoom(X) ? 'Chi c\'è nella stanza?' : 'Che cosa c\'è sul tavolo?';
const qnYesQ = (X) => 'C\'è ' + qnSome(X) + ' ' + qnPlace(X) + '?';
const qnIs = (X) => qnEmpty(X) ? 'Non c\'è ' + qnNone(X) + '.' : 'C\'è ' + qnThing(X) + '.';   // la risposta alla domanda chiave
const qnSay = (X) => gCap(qnPlace(X)) + (qnEmpty(X) ? ' non c\'è ' + qnNone(X) + '.' : ' c\'è ' + qnSome(X) + '. C\'è ' + qnThing(X) + '.');
const qnOther = (X) => qnRoom(X) ? pick(['m', 'f'].filter(w => w !== qnWhat(X))) : pick(['book', 'cup', 'phone', 'key'].filter(o => o !== qnWhat(X)));

/* ---------- Figure: la stanza (con la finestra) e il tavolo della lezione 33 ---------- */
function qnFig(X) {
  if (!qnRoom(X)) {
    const o = qnWhat(X), body = o === '0' ? '' : inner(FIG[o]).replace(/<ellipse[^>]*opacity="\.2[58]"[^>]*\/>/, '');
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + inner(FIG.table) +
      (body ? '<g transform="translate(50 36) scale(.36) translate(-50 -88)">' + body + '</g>' : '') + '</svg>';
  }
  const room = '<rect x="4" y="4" width="92" height="74" rx="3" fill="#e3d8c1"/><rect x="4" y="78" width="92" height="18" fill="#a9876a"/>' +
    '<path d="M4 78 H96" stroke="#8e6741" stroke-width="1.6"/>' + '<rect x="62" y="14" width="26" height="26" fill="#8e6741"/>' + vView(64, 16, 22, 22) +
    '<path d="M75 16 v22 M64 27 h22" stroke="#8e6741" stroke-width="1.4"/>';
  let who = '';
  if (!qnEmpty(X)) {
    const k = p3Key(qnWhat(X)), LK = (typeof LOOKS !== 'undefined' && LOOKS[TEACHERS[k] ? (TEACHERS[k].look || k) : k]) || null;
    if (LK && typeof tTorso === 'function') who = '<g transform="translate(6 10) scale(.86)">' + V_PERSON(LK, tArm(LK, ...DOWN_L) + tArm(LK, ...DOWN_R), { mouth: 'smile' }, -10) + '</g>';
  }
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' + room + who + '</svg>';
}
Object.keys(QNC).forEach(X => { Object.defineProperty(FIG, X, { enumerable: true, get: () => qnFig(X) }); });

const SQN = gTag('qn', {
  present: (X) => { const p = qnSay(X); return { type: 'echo', check: 'claim', show: X, prompt: p, model: p }; },
  // «C'è qualcuno nella stanza?»: sì (c'è qualcuno) o no (non c'è nessuno)
  yes: (X) => ({ type: qnEmpty(X) ? 'neg' : 'yes', show: X, ask: 'some', prompt: qnYesQ(X),
    model: qnEmpty(X) ? 'No, non c\'è ' + qnNone(X) + '.' : 'Sì, c\'è ' + qnSome(X) + '.', complete: qnEmpty(X) ? '' : qnIs(X) }),
  // un'altra persona o un'altra cosa: no
  neg: (X) => { const o = qnOther(X);
    return { type: 'neg', show: X, ask: o, prompt: 'C\'è ' + qnThing(X, o) + ' ' + qnPlace(X) + '?',
      model: qnEmpty(X) ? 'No, non c\'è ' + qnNone(X) + '.' : 'No, non c\'è ' + qnThing(X, o) + '.', complete: qnEmpty(X) ? '' : qnIs(X) }; },
  key: (X) => ({ type: 'key', show: X, prompt: qnKeyQ(X), model: qnIs(X) }),
  reveal: (X) => ({ type: 'reveal', show: X, prompt: qnKeyQ(X) + ' ' + qnIs(X), model: '' }),
  askQ: (X) => ({ type: 'echo', check: 'question', show: X, prompt: qnKeyQ(X), model: qnKeyQ(X) })
});

/* ---------- Capire le frasi: «(non) c'è qualcuno / nessuno / qualche cosa / niente / Max / un libro» ---------- */
function qnStatements(s) {
  s = s.replace(/ chi c e /g, ' # ').replace(/ che cosa c e /g, ' # ').replace(/ qualcosa /g, ' qualche cosa ').replace(/ nulla /g, ' niente ');
  const names = vNames(), out = [], re = / (non )?c e (qualche cosa|qualcuno|nessuno|niente|(?:un|una|uno) [a-z]+|[a-z]+)(?= )/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const neg = !!m[1], [w, w2] = m[2].split(' ').length === 2 && /^(un|una|uno) /.test(m[2]) ? m[2].split(' ') : [m[2], null];
    if (w === 'qualcuno') out.push({ neg: neg, k: 'some', room: true });
    else if (w === 'qualche cosa') out.push({ neg: neg, k: 'some', room: false });
    else if (w === 'nessuno') out.push({ neg: neg, k: 'none', room: true });
    else if (w === 'niente') out.push({ neg: neg, k: 'none', room: false });
    else if (names[w]) out.push({ neg: neg, k: 'one', room: true, v: names[w] });
    else if (w2) {
      const n = gNoun(w2);
      if (n) out.push({ neg: neg, k: 'one', room: false, v: n.obj, artOk: np(n.obj).split(' ')[0].replace('\'', '') === w || (ITEMS[n.obj].art === 'un\'' && w === 'un') });
    }
  }
  return out;
}
// la frase è vera per la figura X?
function qnTrue(x, X) {
  if (x.room !== qnRoom(X) || x.artOk === false) return false;
  const e = qnEmpty(X), v = qnWhat(X);
  if (x.k === 'some') return !x.neg && !e;
  if (x.k === 'none') return x.neg && e;                 // «non c'è nessuno» (con «non»)
  return x.neg ? x.v !== v : !e && x.v === v;           // «c'è Max» / «non c'è Isa»
}
function qnEvaluate(step, text) {
  const s = gNorm(text), X = step.show, e = qnEmpty(X);
  if (step.type === 'echo' && step.check === 'question') return { ok: has(s, gNorm(step.prompt).trim()), full: true };
  const st = qnStatements(s), allTrue = st.length > 0 && st.every(x => qnTrue(x, X)), yes = has(s, 'si'), no = has(s, 'no');
  const hasK = (k, neg) => st.some(x => x.k === k && x.neg === neg);
  if (!allTrue) return { ok: false, full: false };
  if (step.type === 'echo') return { ok: e ? hasK('none', true) : hasK('some', false) && hasK('one', false), full: true };
  if (step.type === 'key') return { ok: !yes && !no && (e ? hasK('none', true) : hasK('one', false)), full: true };
  if (step.ask === 'some') return e ? { ok: no && !yes && hasK('none', true), full: true } : { ok: yes && !no && (hasK('some', false) || hasK('one', false)), full: true };
  // la domanda su un'altra persona / cosa
  return { ok: no && !yes && (e ? hasK('none', true) || st.some(x => x.k === 'one' && x.neg && x.v === step.ask) : st.some(x => x.k === 'one' && x.neg && x.v === step.ask)), full: e || hasK('one', false) };
}
// L'allievo: «Chi c'è nella stanza?», «C'è qualcuno nella stanza?», «C'è Max nella stanza?»
function qnEvalAsk(X, text) {
  const s = gNorm(text), bad = (model) => ({ ok: false, model: model || qnKeyQ(X) });
  if (has(s, 'si') || has(s, 'no') || has(s, 'non')) return bad();
  if (has(s, qnRoom(X) ? 'chi c e' : 'che cosa c e')) return { ok: true, kind: 'what' };
  const st = qnStatements(s);
  if (st.length !== 1 || st[0].room !== qnRoom(X) || st[0].k === 'none' || st[0].artOk === false) return bad(st.length === 1 && st[0].k === 'none' ? qnYesQ(X) : null);
  if (st[0].k === 'some') return { ok: true, kind: qnEmpty(X) ? 'no' : 'yes', some: true };
  return { ok: true, kind: !qnEmpty(X) && st[0].v === qnWhat(X) ? 'yes' : 'no', v: st[0].v };
}
function qnAnswerAsk(X, r) {
  if (r.kind === 'yes') return r.some ? 'Sì, c\'è ' + qnSome(X) + '. ' + qnIs(X) : 'Sì, ' + qnIs(X).charAt(0).toLowerCase() + qnIs(X).slice(1);
  if (r.kind === 'no') return qnEmpty(X) ? 'No, non c\'è ' + qnNone(X) + '.' : 'No, non c\'è ' + qnThing(X, r.v) + '. ' + qnIs(X);
  return qnIs(X);
}
gInstall('qn', isQn, SQN, qnEvaluate, qnEvalAsk, qnAnswerAsk);
