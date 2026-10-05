# Metodo Diretto

App Android (Cordova) per imparare l'inglese con il metodo diretto: l'insegnante indica una figura e parla solo in inglese, lo studente risponde a voce.

- `www/` app: `js/data.js` (oggetti, lezioni, insegnanti, figure), `js/logic.js` (valutazione e sequenza), `js/voice.js` (voce e microfono), `js/storage.js`, `js/demo.js`, `js/app.js`
- `tests/run.js` test della logica: `node tests/run.js`
- `res/build_icons.js` rigenera icone e splash
- La build dell'APK gira su GitHub Actions a ogni push su `main`.
