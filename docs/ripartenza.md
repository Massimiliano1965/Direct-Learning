# Ripartenza — per una chat nuova (CIAO-Italiano)

Leggi questo file prima di tutto. Poi `docs/percorso.md` (l'ordine delle lezioni dal libro e le regole del corso).

## Chi è Massi e come lavorare
- Massi non è un programmatore. Rispondi in **italiano semplice**, **un pezzo alla volta**, dandogli del **tu**.
- **Prima mostrami, poi pusha**: ogni modifica visiva → foto dall'app vera (playwright, telefono Moto g05 = 360×725), poi il push **solo quando scrive «pusha»**.
  Accordo: si carica **ogni 4 lezioni** (o quando dice «pusha»).
- Niente mail al suo posto. Controllo sintassi con `node --check` su ogni file js toccato.
- Prove automatiche: `node tests/run.js` (italiano), `node tests/run_en.js`, `node tests/run_voice.js`: devono passare tutte.
- Non fare cose non chieste: proporre prima, con esempi (foto), e fare dopo il suo sì.

## L'app
- Cordova Android. GitHub Actions costruisce due APK a ogni push su `main` (CIAO-Italiano e CIAO-English). Massi scarica da **Actions**.
- Corso italiano: `www/js/course.js` (oggetti, lezioni, insegnanti), `logic.js` (motore), un file per tipo di lezione
  (`colors_it`, `numbers_it`, `geo_it`, `poss_it`, `size_it`, `third_it`, `nat_it`, `essere_it`, `altro_it`, `prep_it`, `anche_it`, `ora_it`, `appt_it`, `gender_it`, `verbs_it`),
  caricati in ordine da `www/index.html`. Ogni file ha in cima la spiegazione della lezione.
- Insegnanti: Max (molto severo, approva col pollice ogni tanto), Isa (chiave `giulia`: era Giulia; bionda, capelli sciolti fino alle spalle (stile «bob»), senza occhiali; Max: occhiali, pelle chiara), Pietro (chiave `luca`), Sara. Il tailleur di Isa è viola (il color vino non gli piaceva). Stile sobrio blu notte e oro.
- 4 livelli (blu notte, blu acciaio, viola, rosa antico), «Livello N» accanto al titolo. Tutte le lezioni fatte sono livello 1; il livello 2 parte dal capitolo 6.
- Pulsanti di prova sotto la lezione: «Avanti ▶» e «Rispondo: sì/no» (`TEST_BUTTONS` in `course.js`; a fine progetto → false).

## Regole del corso decise da Massi
- L'insegnante non usa parole che l'allievo non conosce: niente «bravo/ottimo»; errore = «No.»; l'entusiasmo col corpo.
- Parole che vanno bene tutte e due (`COURSE.synonyms`): si alternano in oro nella frase scritta, la voce ogni tanto usa la seconda, il microfono le accetta.
- Maschile/femminile: la -o finale azzurra, la -a finale rosa (lezione 22). Esempi solo con parole in -o/-a (niente aggettivi in -e).
- Si dà del Lei (Suo/Sua). Bandiera del Regno Unito per «inglese».
- Niente bordeaux né marroni nei colori dell'app; gli piacciono viola e rosa.

## A che punto siamo (lezioni fatte: 1–23)
1–4 oggetti · 5 colori · 6–7 numeri · 8–9 città e monumenti · 10 il mio/il Suo · 11 grande/piccolo · 12 il suo/la sua · 13 nazionalità ·
14 essere · 15 un altro · 16 un/una/un'/uno · 17 il/la/l'/lo · 18 sul/nel… (a e di più avanti) · 19 anche/neanche · 20 che ora è ·
21 a che ora (aereo, riunione…) · 22 il, la o l'? (-o/-a in colore) · 23 cosa fa? (Max legge un libro, Isa telefona…; *da approvare*).

## Da ricordare
- Ogni lezione ha le **domande dello studente** (tocca una figura e chiede): 7 per lezione. Mantenerle nelle lezioni nuove.
- **Test di fine livello**: storia da descrivere a voce, niente «giusto/sbagliato» durante, risultato alla fine, ripasso consigliato
  (anche con un avviso nelle lezioni dopo se gli errori continuano). Dettagli in `docs/percorso.md`.

## Prossimi passi
- Lezione 23 fatta, non ancora caricata: aspetta il sì di Massi sulle foto (figure e frasi). Poi «Perché? Per…», «Lo prendo — la prendo».
- Più avanti: preposizioni «a» e «di»; il test di fine livello; CIAO English quando le lezioni italiane sono strutturate.
- Stima: circa 100 lezioni in tutto (ne mancano circa 77), in 4 livelli, più i 4 test.
