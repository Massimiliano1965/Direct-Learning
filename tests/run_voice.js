'use strict';
// Test della voce e del microfono con un telefono finto e "difettoso": node tests/run_voice.js
// (motore vocale che non risponde, fine frase persa, microfono che non richiama mai)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let fails = 0, count = 0;
function check(name, cond) { count++; if (!cond) { fails++; console.log('FALLITO: ' + name); } }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function phone(tts, sr) {
  const ctx = { console, setTimeout, clearTimeout, Promise, window: { TTS: tts, plugins: sr ? { speechRecognition: sr } : undefined }, COURSE: { lang: 'it-IT', voiceTags: ['it-it'] } };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  // voice.js usa «window» e funzioni globali: le esponiamo
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'www', 'js', 'voice.js'), 'utf8') + ';this.Mouth=Mouth;this.Ears=Ears;', ctx);
  return ctx;
}

(async () => {
  // 1. getVoices non risponde mai, speak funziona: la frase parte lo stesso (dopo l'attesa massima)
  {
    let spoke = 0;
    const c = phone({ getVoices: () => new Promise(() => {}), speak: () => { spoke++; return Promise.resolve(); }, stop: () => Promise.resolve() });
    let done = false;
    c.Mouth.speak('È un libro.', 1, 1, () => { done = true; });
    await sleep(3600);
    check('voce a freddo: parla senza la lista delle voci', spoke === 1 && done);
  }
  // 2. speak non finisce mai (fine frase persa): si va avanti e si spegne l'audio
  {
    let stopped = 0;
    const c = phone({ getVoices: () => Promise.resolve([]), speak: () => new Promise(() => {}), stop: () => { stopped++; return Promise.resolve(); } });
    let done = false;
    const t0 = Date.now();
    c.Mouth.speak('Sì.', 1, 1, () => { done = true; });
    await sleep(5000);
    check('fine frase persa: si va avanti', done && Date.now() - t0 < 6000);
    check('fine frase persa: audio spento prima di andare avanti', stopped >= 1);
  }
  // 3. cancel(): nessuna callback dopo, nessun timer appeso
  {
    const c = phone({ getVoices: () => Promise.resolve([]), speak: () => new Promise(() => {}), stop: () => Promise.resolve() });
    let called = false;
    c.Mouth.speak('È una sedia.', 1, 1, () => { called = true; });
    await sleep(50);
    c.Mouth.cancel();
    check('cancel: timer cancellati', c.Mouth.timers.length === 0);
    await sleep(5500);
    check('cancel: la frase annullata non richiama', !called);
  }
  // 4. microfono che non richiama mai: dopo il tempo massimo «non ho sentito» e microfono spento
  {
    let stops = 0;
    const sr = { isRecognitionAvailable: (ok) => ok(true), hasPermission: (ok) => ok(true), startListening: () => {}, stopListening: (a) => { stops++; if (a) a(); } };
    const c = phone(null, sr);
    c.Ears.LISTEN_MAX = 300;
    let res = null;
    c.Ears.listen(() => { res = 'ok'; }, (code) => { res = code; });
    await sleep(500);
    check('microfono muto: «non ho sentito»', res === 'no-speech');
    check('microfono muto: spento', stops >= 1 && !c.Ears.isListening());
  }
  // 5. abort: il risultato che arriva dopo non conta
  {
    let cb = null;
    const sr = { isRecognitionAvailable: (ok) => ok(true), hasPermission: (ok) => ok(true), startListening: (ok) => { cb = ok; }, stopListening: () => {} };
    const c = phone(null, sr);
    let res = null;
    c.Ears.listen(() => { res = 'ok'; }, () => { res = 'err'; });
    c.Ears.abort();
    if (cb) cb(['è un libro']);
    await sleep(50);
    check('abort: risultato in ritardo ignorato', res === null);
  }
  console.log(count - fails + ' / ' + count + ' test voce passati');
  process.exit(fails ? 1 : 0);
})();
