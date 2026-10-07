'use strict';
/* =====================================================================
   CAPITOLO 4: «Il, la o l'?» (lezione 22). Si carica dopo colors_it.js e appt_it.js.
   È la lezione dei colori (lesson.colors) con parole che vogliono «l'»: con l' non si sente se la parola
   è maschile o femminile; lo dicono la -o e la -a finali, del nome e del colore (metodo di Massi):
     L'ombrello è nero.  L'orologio è bianco.  L'aereo è bianco.
     L'agenda è nera.    L'etichetta è rossa.  L'ambulanza è bianca.
   Nella frase scritta la -o finale è azzurra e la -a finale rosa (lesson.gender, vedi synWrap in app.js).
   Errori (dalla lezione dei colori): «lo ombrello», «la agenda», «l'agenda è nero», «l'aereo è bianca».
   ===================================================================== */

const recolor = (svg, map) => Object.keys(map).reduce((t, a) => t.split(a).join(map[a]), svg);
// figure nuove (anche senza colore, come gli altri oggetti)
FIG.plane = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="92" rx="32" ry="3" fill="#000" opacity=".25"/>' + APPT_ICON.a_plane + '</svg>';
FIG.label = FLAT('<path d="M58 18 q14 -10 22 -2 q6 8 -8 14" fill="none" stroke="#c9a45c" stroke-width="2.2"/>' +
  '<g transform="rotate(-14 50 54)"><path d="M28 30 h44 a4 4 0 0 1 4 4 v48 a4 4 0 0 1 -4 4 h-44 a4 4 0 0 1 -4 -4 v-36 z" fill="#b3262f"/>' +
  '<path d="M24 46 l12 -16" stroke="#861b22" stroke-width="2"/><circle cx="50" cy="38" r="3.4" fill="#141a27" stroke="#c9a45c" stroke-width="1.6"/>' +
  '<rect x="32" y="50" width="36" height="26" rx="2" fill="#f3eee2"/><path d="M36 57 h26 M36 63 h20 M36 69 h24" stroke="#8d93a3" stroke-width="1.6"/></g>', 26);
FIG.ambulance = FLAT('<path d="M8 40 h52 v-6 h14 l16 18 v24 h-82z" fill="#eceef2"/><path d="M8 62 h82" stroke="#c8262f" stroke-width="5"/>' +
  '<path d="M66 38 h8 l12 14 h-20z" fill="#9fbcd0"/><rect x="28" y="28" width="12" height="6" rx="2" fill="#3a6fd8"/>' +
  '<path d="M30 45 h6 v-5 h6 v5 h6 v6 h-6 v5 h-6 v-5 h-6z" fill="#c8262f"/>' +
  '<circle cx="26" cy="78" r="8" fill="#1d2638"/><circle cx="72" cy="78" r="8" fill="#1d2638"/><circle cx="26" cy="78" r="3" fill="#8d93a3"/><circle cx="72" cy="78" r="3" fill="#8d93a3"/>', 40);
// le versioni colorate per la lezione 22 (oggetto_colore, come nella lezione 5)
FIG.umbrella_nero = recolor(FIG.umbrella, { '#2c3e66': '#2b2e36', '#3a4f7e': '#40434e' });
FIG.clock_bianco = recolor(clockFig(10), { '#c9a45c': '#e3e6ec', '#f3eee2': '#fbfbfd' });
FIG.plane_bianco = FIG.plane;
FIG.agenda_nero = FIG.agenda;
FIG.label_rosso = FIG.label;
FIG.ambulance_bianco = FIG.ambulance;

// parole che in questa lezione mostrano la -o / -a finale (nomi degli oggetti e colori)
function genderWords(lesson) {
  const w = [];
  (lesson.known || []).forEach(X => { const c = typeof combo === 'function' && combo(X); if (c) w.push(ITEMS[c.obj].word); });
  Object.keys(COLORS).forEach(c => { w.push(COLORS[c].m, COLORS[c].f); });
  return w.filter((x, i) => /[oa]$/.test(x) && w.indexOf(x) === i);
}
