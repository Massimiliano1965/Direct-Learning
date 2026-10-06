# CIAO

*Communicator for Immersive Audio-Oral learning* (ex «Metodo Diretto»).

App Android (Cordova) per imparare l'italiano con il metodo diretto: l'insegnante indica una figura e parla solo in italiano, l'allievo risponde a voce. La prima volta l'app chiede la lingua dello studente (inglese, tedesco, giapponese): menu e messaggi in quella lingua. Un'app per ogni lingua da imparare: «CIAO» (italiano per stranieri) e «CIAO English» (inglese britannico per italiani). Il corso si sceglie quando si costruisce l'APK: `node tools/set_course.js it|en`.

- `www/` app: `js/course.js` (parole, lezioni, insegnanti del corso), `js/data.js` (figure), `js/logic.js` (valutazione e sequenza), `js/voice.js` (voce e microfono), `js/ui_lang.js` (scritte nella lingua dello studente), `js/teacher.js` (l'insegnante disegnato), `js/storage.js`, `js/demo.js`, `js/app.js`
- `tests/run.js` test della logica (italiano), `tests/run_en.js` test del corso di inglese (`js/course_en.js`, `js/grammar_en.js`)
- `res/build_icons.js` rigenera icone e splash
- La build dell'APK gira su GitHub Actions a ogni push su `main`.
