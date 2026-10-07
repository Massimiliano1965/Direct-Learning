# Ripartenza — per una chat nuova (CIAO-Italiano)

Leggi questo file prima di tutto. Poi `docs/percorso.md` (l'ordine delle lezioni dal libro e le regole del corso).

## Chi è Massi e come lavorare
- Massi non è un programmatore. Rispondi in **italiano semplice**, **un pezzo alla volta**, dandogli del **tu**.
- **Prima mostrami, poi pusha**: ogni modifica visiva → foto dall'app vera (playwright, telefono Moto g05 = 360×725), poi il push **solo quando scrive «pusha»**.
  Accordo: Massi dice quali lezioni fare; si fanno **tutte**, e **solo alla fine** si fa un unico push (non uno per lezione).
- Niente mail al suo posto. Controllo sintassi con `node --check` su ogni file js toccato.
- Prove automatiche: `node tests/run.js` (italiano), `node tests/run_en.js`, `node tests/run_voice.js`: devono passare tutte.
- Non fare cose non chieste: proporre prima, con esempi (foto), e fare dopo il suo sì.

## L'app
- Cordova Android. GitHub Actions costruisce due APK a ogni push su `main` (CIAO-Italiano e CIAO-English). Massi scarica da **Actions**.
- Corso italiano: `www/js/course.js` (oggetti, lezioni, insegnanti), `logic.js` (motore), un file per tipo di lezione
  (`colors_it`, `numbers_it`, `geo_it`, `poss_it`, `size_it`, `third_it`, `nat_it`, `essere_it`, `altro_it`, `prep_it`, `anche_it`, `ora_it`, `appt_it`, `gender_it`, `verbs_it`, `perche_it`, `pron_it`, `sum_it`, `km_it`, `fam_it`, `avere_it`, `gen_it` (pezzi comuni dalla 32), `plur_it`, `cece_it`, `costa_it`, `det_it`, `irr_it`, `contr_it`, `stare_it`, `celha_it`, `imper_it`),
  caricati in ordine da `www/index.html`. Ogni file ha in cima la spiegazione della lezione.
- Insegnanti: Max (molto severo, approva col pollice ogni tanto), Isa (chiave `giulia`: era Giulia; bionda, capelli sciolti fino alle spalle (stile «bob»), senza occhiali; Max: occhiali, pelle chiara), Pietro (chiave `luca`), Sara. Voci diverse: Max e Isa la prima voce del telefono del loro genere, Pietro e Sara la seconda (`voice` in TEACHERS), e toni distanti (Max 0,78, Pietro 1,05, Isa 1,02, Sara 1,3). Il tailleur di Isa è viola (il color vino non gli piaceva). Stile sobrio blu notte e oro.
- 4 livelli (blu notte, blu acciaio, viola, rosa antico), «Livello N» accanto al titolo. Tutte le lezioni fatte sono livello 1; il livello 2 parte dal capitolo 6.
- Pulsanti di prova sotto la lezione: «Avanti ▶» e «Rispondo: sì/no» (`TEST_BUTTONS` in `course.js`; a fine progetto → false).

## Regole del corso decise da Massi
- L'insegnante non usa parole che l'allievo non conosce: niente «bravo/ottimo»; errore = «No.»; l'entusiasmo col corpo.
- Parole che vanno bene tutte e due (`COURSE.synonyms`): si alternano in oro nella frase scritta, la voce ogni tanto usa la seconda, il microfono le accetta.
- Numeri composti (lezioni 28, 29; `numParts`): la radice (venti, cinquecento) sottolineata in oro, l'unità rosa; con «uno» e «otto» la vocale della radice tolta e barrata in rosso (vent(i)otto). Idea di Massi.
- Maschile/femminile: la -o finale azzurra, la -a finale rosa (lezione 22). Esempi solo con parole in -o/-a (niente aggettivi in -e).
- Si dà del Lei (Suo/Sua). Bandiera del Regno Unito per «inglese».
- Niente bordeaux né marroni nei colori dell'app; gli piacciono viola e rosa.
- Le cose «nere» si disegnano grigio antracite con il bordo chiaro (`COL_SHADE.nero`): il nero vero sul fondo blu notte non si vede.

## A che punto siamo (lezioni fatte: 1–42)
1–4 oggetti · 5 colori · 6–7 numeri · 8–9 città e monumenti · 10 il mio/il Suo · 11 grande/piccolo · 12 il suo/la sua · 13 nazionalità ·
14 essere · 15 un altro · 16 un/una/un'/uno · 17 il/la/l'/lo · 18 sul/nel… (a e di più avanti) · 19 anche/neanche · 20 che ora è ·
21 a che ora (aereo, riunione…) · 22 il, la o l'? (-o/-a in colore) · 23 cosa fa? (Max legge un libro, Isa telefona…) · 24 perché? per… (Max prende il libro per leggere; nuvoletta con la scena della 23) · 25 lo/la (Max legge il libro? Sì, lo legge.) · 26 numeri 11–20 · 27 decine 30–100 · 28 quanto fa? (20 + 8 = ventotto: la radice e l'unità; 100 + 100… fino a mille; `numWord` scrive tutti i numeri 1–1000) · 29 quanti chilometri? (cartello verde dell'autostrada) · 30 la famiglia (Chi è? È la nonna.) · 31 essere o avere (Max ha un telefono. Il telefono è nero.) · 32 plurale o→i, a→e (Sono due libri.) · 33 c'è / ci sono (sul tavolo) · 34 quanto costa / costano (cartellino in euro) · 35 questo/questi… (Queste tazze sono bianche.) · 36 gli/le, e→i (Gli ombrelli sono gialli. I portatili sono bianchi. Le chiavi sono gialle). Nelle lezioni 35–37 niente cose nere (non si vedono sul blu notte): giallo, bianco, rosso; «giallo» non è nella lezione 5 · 37 quel/quei/quegli (le cose lontane) · 38 plurali irregolari (uomini, mani, uova, caffè, computer) · **livello 2:** 39 il contrario (aperto/chiuso, pieno/vuoto, lungo/corto) · 40 essere o stare (sta bene / sta male / è stanco) · 41 ce l'ha / non ce l'ha · 42 imperativo con il Lei (Apra la porta!).

## Da ricordare
- Ogni lezione ha le **domande dello studente** (tocca una figura e chiede): 7 per lezione. Mantenerle nelle lezioni nuove.
- **Test di fine livello**: storia da descrivere a voce, niente «giusto/sbagliato» durante, risultato alla fine, ripasso consigliato
  (anche con un avviso nelle lezioni dopo se gli errori continuano). Dettagli in `docs/percorso.md`.

## Prossimi passi
- Lezioni 1–42 caricate su `main`. Livello 2 dalla 39 (`level: 2` in LESSONS). I numeri fino a 1000 sono solo 4 lezioni (26–29): decisione di Massi, «non di più».
- Da fare: il **test di fine livello 1** (manca ancora: va progettato con Massi). Prossime lezioni: capitolo 7 (Qual è la domanda?, né… né…, passato prossimo…).
- Più avanti: preposizioni «a» e «di»; il test di fine livello; CIAO English quando le lezioni italiane sono strutturate.
- Stima: circa 100 lezioni in tutto (ne mancano circa 58), in 4 livelli, più i 4 test.
