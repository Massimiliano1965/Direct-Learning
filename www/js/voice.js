'use strict';
/* =====================================================================
   VOCE: parlare (Mouth) e ascoltare (Ears).
   Sul telefono usa i plugin Cordova (logica presa da StudyGame),
   nel browser ripiega su speechSynthesis e webkitSpeechRecognition.
   ===================================================================== */

// Voce maschile o femminile: i nomi delle voci non lo dicono in modo standard, quindi
// si riconoscono i nomi più comuni (voci di sistema: it-it-x-itc/itd = uomo, ita/itb/kda = donna;
// altri motori: "…SMTm…" = uomo, "…SMTf…" = donna; nel browser i nomi propri).
function voiceGender(name) {
  const s = String(name || '').toLowerCase();
  if (/female|donna|smtf|-x-it[ab]-|-x-kda-|elsa|alice|federica|paola|carla|bianca|isabella|giulia|google italiano/.test(s)) return 'f';
  if (/\bmale|uomo|smtm|-x-it[cd]-|diego|cosimo|luca|giorgio|roberto|lorenzo|giuseppe|fabio/.test(s)) return 'm';
  return '';
}

const cachedVoice = {};
function pickVoice(gender) {
  const key = gender || '-';
  if (cachedVoice[key] || !window.speechSynthesis) return cachedVoice[key] || null;
  const vs = window.speechSynthesis.getVoices() || [];
  const L = COURSE.lang, base = L.slice(0, 2);
  const pool = vs.filter(v => v.lang === L).concat(vs.filter(v => v.lang !== L && v.lang && v.lang.slice(0, 2).toLowerCase() === base));
  cachedVoice[key] = (gender && pool.find(v => voiceGender(v.name) === gender)) ||
                     pool.find(v => v.localService) || pool[0] || null;
  return cachedVoice[key];
}
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { Object.keys(cachedVoice).forEach(k => delete cachedVoice[k]); };
}

// Voce del telefono (plugin TTS): scelgo una voce locale nella lingua del corso, perché quella
// "network" offline dà errore. Al primo avvio il motore può essere "freddo": riprovo.
let ttsVoicesP = null;
const ttsVoiceIds = {};
function ttsLoadVoices() {
  if (!ttsVoicesP) {
    ttsVoicesP = (window.TTS && window.TTS.getVoices ? window.TTS.getVoices().catch(() => []) : Promise.resolve([]))
      .then(list => { list = Array.isArray(list) ? list : []; if (!list.length) ttsVoicesP = null; return list; });
  }
  return ttsVoicesP;
}
function ttsPickVoice(gender) {
  const key = gender || '-';
  if (key in ttsVoiceIds) return Promise.resolve(ttsVoiceIds[key]);
  return ttsLoadVoices().then(list => {
    const tags = (COURSE.voiceTags || [COURSE.lang]).map(x => x.toLowerCase());
    const names = list.map(v => String((v && (v.identifier || v.name)) || '')).filter(n => tags.some(x => n.toLowerCase().indexOf(x) !== -1));
    const local = names.filter(n => /local/i.test(n));
    const pool = local.length ? local : names.filter(n => !/network/i.test(n));
    const best = (gender && pool.find(n => voiceGender(n) === gender)) || pool[0] || '';
    if (list.length) ttsVoiceIds[key] = best;
    return best;
  });
}
function ttsWarmUp() {
  if (!window.TTS || !window.TTS.getVoices) return;
  let n = 0;
  const tick = () => ttsLoadVoices().then(list => { if (!list.length && ++n < 6) setTimeout(tick, 2000); });
  tick();
}
let voiceWarned = false;
function warnNoVoice() {
  if (voiceWarned) return;
  voiceWarned = true;
  if (typeof setStatus === 'function') setStatus('To hear the teacher, install the Italian text-to-speech voice on your phone', 'err');
}

const Mouth = {
  token: 0,
  gender: '',   // 'm' o 'f': voce dell'insegnante di turno
  speak(text, rate, pitch, cb, gender) {
    const g = gender || this.gender;
    const tok = ++this.token;
    let done = false;
    let timer = null;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (tok === this.token && cb) cb();
    };
    const estimate = 1200 + text.length * 90 / (rate || 1);

    if (window.TTS && typeof window.TTS.speak === 'function') {
      // Rete di sicurezza larga: comprende i tentativi
      timer = setTimeout(finish, estimate + 8000);
      const wait = ms => new Promise(r => setTimeout(r, ms));
      (async () => {
        const vid = await ttsPickVoice(g);
        const opts = { text: text, locale: COURSE.lang, rate: (rate || 1) * 1.15, pitch: pitch || 1 };
        if (vid) opts.identifier = vid;
        for (let k = 0; k < 4; k++) {
          if (tok !== this.token) return;
          try { await window.TTS.speak(opts); finish(); return; }
          catch (e) {
            if (k === 1) delete opts.identifier;
            await wait(300 + k * 400);
          }
        }
        if (tok === this.token) warnNoVoice();
        finish();
      })();
      return;
    }
    // Rete di sicurezza: su Android a volte "fine frase" non arriva mai
    timer = setTimeout(finish, estimate + 2500);
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(text);
      u.lang = COURSE.lang;
      const v = pickVoice(g);
      if (v) u.voice = v;
      u.rate = rate || 1;
      u.pitch = pitch || 1;
      u.onend = finish;
      u.onerror = finish;
      setTimeout(() => {
        if (tok === this.token) {
          try { window.speechSynthesis.speak(u); } catch (e) { finish(); }
        }
      }, 60);
      return;
    }
    // Nessuna voce disponibile: aspetta il tempo di lettura
    warnNoVoice();
    clearTimeout(timer);
    timer = setTimeout(finish, estimate);
  },
  // parts: [{ text, rate }] dette una dopo l'altra
  speakParts(parts, pitch, cb) {
    const list = parts.filter(p => p && p.text);
    const next = (i) => {
      if (i >= list.length) { if (cb) cb(); return; }
      this.speak(list[i].text, list[i].rate, pitch, () => next(i + 1));
    };
    next(0);
  },
  cancel() {
    this.token++;
    try {
      if (window.TTS && window.TTS.stop) {
        const r = window.TTS.stop();
        if (r && r.catch) r.catch(() => {});
      }
    } catch (e) {}
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
};

function pluginSR() { return window.plugins && window.plugins.speechRecognition; }

const Ears = {
  handle: null,
  rec: null,
  available: false,   // il telefono ha detto una volta che il riconoscimento c'è
  listen(onOk, onErr) {
    this.abort();
    const h = { done: false };
    this.handle = h;
    const ok = (arr) => {
      if (h.done || this.handle !== h) return;
      h.done = true; this.handle = null; this.rec = null;
      onOk(arr);
    };
    const err = (code) => {
      if (h.done || this.handle !== h) return;
      h.done = true; this.handle = null; this.rec = null;
      onErr(code);
    };

    const sr = pluginSR();
    if (sr) {
      const start = () => {
        if (h.done || this.handle !== h) return;
        sr.startListening(
          (m) => { const arr = (Array.isArray(m) ? m : [m]).filter(x => x && String(x).trim()).map(String); if (arr.length) ok(arr); else err('no-speech'); },
          (e) => err(/permission|denied/i.test(String(e)) ? 'not-allowed' : 'no-speech'),
          { language: COURSE.lang, matches: 5, showPopup: false, showPartial: false }
        );
      };
      const withPermission = () => {
        if (h.done || this.handle !== h) return;
        sr.hasPermission(
          (yes) => { if (yes) start(); else sr.requestPermission(start, () => err('not-allowed')); },
          () => start()
        );
      };
      // Come StudyGame: prima si chiede se il riconoscimento esiste sul telefono
      if (this.available || typeof sr.isRecognitionAvailable !== 'function') { withPermission(); return; }
      sr.isRecognitionAvailable(
        (yes) => { if (yes) { this.available = true; withPermission(); } else err('unsupported'); },
        () => err('unsupported')
      );
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { err('unsupported'); return; }
    const r = new SR();
    this.rec = r;
    r.lang = COURSE.lang;
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    r.onresult = (e) => {
      const res = e.results[0];
      const arr = [];
      for (let i = 0; i < res.length; i++) arr.push(res[i].transcript);
      if (arr.length) ok(arr); else err('no-speech');
    };
    r.onerror = (e) => {
      const c = e.error;
      if (c === 'not-allowed' || c === 'service-not-allowed') err('not-allowed');
      else if (c === 'network') err('network');
      else err('no-speech');
    };
    r.onend = () => err('no-speech');
    try { r.start(); } catch (x) { err('no-speech'); }
  },
  isListening() { return !!this.handle; },
  abort() {
    const h = this.handle;
    this.handle = null;
    if (!h) return;
    h.done = true;
    const sr = pluginSR();
    if (sr) { try { sr.stopListening(() => {}, () => {}); } catch (e) {} }
    if (this.rec) { try { this.rec.abort(); } catch (e) {} this.rec = null; }
  }
};

/* ---------- Schermo acceso durante lezione e dimostrazione ----------
   Sul telefono: piccolo plugin insomnia. Nel browser: Wake Lock, se c'è. */
const Awake = {
  on: false,
  lock: null,
  keep() {
    this.on = true;
    try { if (window.plugins && window.plugins.insomnia) { window.plugins.insomnia.keepAwake(); return; } } catch (e) {}
    try {
      if (navigator.wakeLock && !this.lock) {
        navigator.wakeLock.request('screen').then(l => {
          if (this.on) { this.lock = l; l.addEventListener('release', () => { if (this.lock === l) this.lock = null; }); }
          else l.release().catch(() => {});
        }).catch(() => {});
      }
    } catch (e) {}
  },
  allow() {
    this.on = false;
    try { if (window.plugins && window.plugins.insomnia) window.plugins.insomnia.allowSleepAgain(); } catch (e) {}
    if (this.lock) { try { this.lock.release().catch(() => {}); } catch (e) {} this.lock = null; }
  }
};
