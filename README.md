# Metodo Diretto

App Android (Cordova) per imparare l'italiano con il metodo diretto, per chi parla inglese: l'insegnante indica una figura e parla solo in italiano, l'allievo risponde a voce. Menu e messaggi in inglese.

- `www/` app: `js/course.js` (parole, lezioni, insegnanti del corso), `js/data.js` (figure), `js/logic.js` (valutazione e sequenza), `js/voice.js` (voce e microfono), `js/storage.js`, `js/demo.js`, `js/app.js`
- `tests/run.js` test della logica: `node tests/run.js`
- `res/build_icons.js` rigenera icone e splash
- La build dell'APK gira su GitHub Actions a ogni push su `main`.
