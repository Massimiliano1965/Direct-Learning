// Prepara il progetto per un corso: node tools/set_course.js it|en|ru|ar|zh
// Scrive www/js/build.js e cambia nome e identità dell'app in config.xml
// (ogni corso è un'app separata sul telefono e sul Play Store).
const fs = require('fs');
const path = require('path');
const COURSES = {
  it: { id: 'it.metododiretto.app', name: 'CIAO', desc: 'Italian with the direct method: look, listen, answer.' },
  en: { id: 'it.metododiretto.en', name: 'CIAO English', desc: 'Inglese con il metodo diretto: guarda, ascolta, rispondi.' },
  ru: { id: 'it.metododiretto.ru', name: 'CIAO Русский', desc: 'Russo con il metodo diretto, con la pronuncia scritta.' },
  ar: { id: 'it.metododiretto.ar', name: 'CIAO العربية', desc: 'Arabo con il metodo diretto, con la pronuncia scritta.' },
  zh: { id: 'it.metododiretto.zh', name: 'CIAO 中文', desc: 'Cinese con il metodo diretto, con la pronuncia scritta.' }
};
const code = process.argv[2];
const c = COURSES[code];
if (!c) { console.error('Corso sconosciuto: ' + code + ' (usa: ' + Object.keys(COURSES).join(', ') + ')'); process.exit(1); }
const root = path.join(__dirname, '..');
const b = path.join(root, 'www', 'js', 'build.js');
fs.writeFileSync(b, fs.readFileSync(b, 'utf8').replace(/var BUILD_COURSE = '[a-z]+';/, "var BUILD_COURSE = '" + code + "';"));
const x = path.join(root, 'config.xml');
let s = fs.readFileSync(x, 'utf8');
s = s.replace(/<widget id="[^"]+"/, '<widget id="' + c.id + '"')
     .replace(/<name>[^<]*<\/name>/, '<name>' + c.name + '</name>')
     .replace(/(AndroidWindowSplashScreenAnimatedIcon" value=")[^"]+"/, '$1res/splash-' + code + '.png"')
     // l'icona del corso, con la bandierina della lingua (res/build_icons.js)
     .replace(/res\/android\/(?:[a-z]{2}\/)?(icon|fg)-/g, 'res/android/' + code + '/$1-')
     .replace(/<description>[^<]*<\/description>/, '<description>CIAO – Communicator for Immersive Audio-Oral learning. ' + c.desc + '</description>');
fs.writeFileSync(x, s);
console.log('Corso ' + code + ': ' + c.name + ' (' + c.id + ')');
