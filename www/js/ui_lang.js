'use strict';
/* =====================================================================
   LINGUA DELLO STUDENTE: menu, messaggi e didascalie della dimostrazione.
   La lezione resta tutta nella lingua del corso (metodo diretto): qui solo
   le poche cose che servono per orientarsi.
   La prima volta l'app chiede «Che lingua parli?» (COURSE.students = le lingue
   offerte da questo corso); la scelta si cambia dal menu.
   Traduzioni giapponesi: da far controllare (Massi).
   ===================================================================== */

const UI_LANGS = {
  en: { name: 'English',  ask: 'Which language do you speak?' },
  de: { name: 'Deutsch',  ask: 'Welche Sprache sprichst du?' },
  ja: { name: '日本語',    ask: 'あなたの言語は何ですか？' },
  it: { name: 'Italiano', ask: 'Che lingua parli?' }
};

const UI_TEXT = {
  en: {
    testTitle: 'Test mode', testText: 'Tap a teacher to choose. Your choice stays until you change it.',
    trialTitle: '{d}-day trial', trialText: 'Each teacher for {n} days. Then the app tells you which one works best for you.',
    trialDay: 'Trial: day {d} of {n}', trialToday: 'Today\'s teacher: {t}.',
    trialDone: 'Trial complete', trialDoneText: 'Open the results to see which teacher suits you best.',
    today: 'today', labelTeacher: 'Teacher', labelLessons: 'Lessons', labelOptions: 'Options', level: 'Level {n}',
    optText: 'Show the sentences in writing', optSpeed: 'Lesson speed', speedSlow: 'Slow', speedNormal: 'Normal', speedFast: 'Fast', yourLang: 'Your language', regTitle: 'How the teacher speaks to you', regLei: 'Lei — formal (business)', regTu: 'tu — everyday (shops, bars)', regLocked: 'Unlock to use it', regNote: 'You can change it any time. It changes the lessons from the first one.', btnReport: 'Trial results',
    demoLesson: 'Demo lesson', seen: 'seen', watchFirst: 'watch first', lesson: 'Lesson {n}',
    talk: 'Talk', repeat: 'Repeat', exit: 'Exit', skipDemo: 'Skip the demo',
    favs: 'My sentences', favHint: 'Tap the star ☆ during a lesson to save a sentence here.', favEmpty: 'No sentences yet. In a lesson, tap the star ☆ next to the title.', favPractice: 'Practise', favAgain: 'Again', favWrong: 'No — listen and go on', favPerfect: 'Perfect!', favDone: 'Practice finished', favScore: 'Right first time: {p}%', fav_in1h: 'In 1 hour', fav_tonight: 'Tonight at 8', fav_tomorrow: 'Tomorrow at 9', fav_daily: 'Every day at 9', favNoTimer: 'No reminder', favNeedsApp: 'The reminder works in the app on the phone.', favNoPerm: 'Allow notifications to get the reminder.', search: 'Search', searchBtn: 'Search a word', searchPh: 'A word, a verb, an article…', searchTip: 'Write or say a word: you will find the lessons where it is, and you start right there.', searchNone: 'Nothing found.', searchMaybe: 'Maybe:', searchFound: 'Lessons: {n}', tagline: 'Learn the language, solve the mystery.', storyEp: 'Episode {n}', storyNext: 'Next ▶', storyGo: '▶ Next lesson', storyNextIn: 'To be continued… in lesson {n}', storyLocked: 'after lesson {n}', storyWatch: 'Watch episode {n}', stories: 'Stories', lessonsRange: 'Lessons {a}–{b}', storyEpisodes: 'Episodes', storySoon: 'coming soon', genre_giallo: 'Mystery', genre_commedia: 'Comedy', genre_romantica: 'Romance', remindLabel: 'Reminder to study', remindOff: 'Off', remindOn: 'Every day at {h}: tap the notification and the lesson starts.', remindTitle: 'time for your lesson!', unlockSwitch: 'Reminder when I unlock the phone (Android)', unlockLabel: 'Reminder on unlock', unlockTitle: 'five minutes of Italian?', unlockStudy: '▶ Study now', unlockLater: 'Later', unlockToday: 'Enough for today', unlockOn: 'Reminder on unlock is on', unlockOnShort: 'When you unlock the phone, the teacher reminds you to study (8–21, at most every 3 hours, never if you have already studied today).', unlockNeedsAndroid: 'This works in the app on an Android phone.', unlockTest: 'Try it now', unlockReady: 'Done: the reminder on unlock is on.', guideTitle: 'One permission', guideOpen: 'Open the settings', guideInfo: 'Android won\'t let me', guideBack: 'Not now', unlockG1: 'Tap «Open the settings».', unlockG2: 'Find CIAO and switch on «Display over other apps».', unlockG3: 'Go back to CIAO: the reminder is on.', unlockGMore: 'If Android says «Restricted setting»: tap «Android won\'t let me», then the menu ⋮ at the top right, «Allow restricted settings», and do it again.',
    lessonComplete: 'Lesson complete', again: 'Repeat the lesson', menu: 'Menu',
    reportTitle: 'Trial results', resetAll: 'Delete all data', confirmReset: 'Delete all trial and lesson data?',
    listen: 'Listen', pickAsk: 'Your turn: tap a picture, then ask', correct: 'Correct', movingOn: 'Moving on',
    tryAgain: 'Try again', speakNow: 'Speak now', micBlocked: 'Microphone blocked: allow it, then tap {talk}',
    noSR: 'This phone has no speech recognition. You can only listen', needNet: 'Speech recognition needs internet. Tap {talk}',
    notHeard: 'I didn\'t hear you', tapReady: 'Tap {talk} when you are ready', heard: 'Heard', practice: 'Practice {i} / {n}',
    levelTest: 'Level {n} test', testDone: 'Level {n}: test complete', testAsk: 'Ask a question about the picture', testScore: '{n} out of {t}', testIntro: 'Test: no corrections now, the results come at the end', testMistakes: 'To check', testYou: 'You', testRight: 'Right', testNoAnswer: '(no answer)', testFree: 'Free description (not scored)', testExample: 'For example', testReview: 'Review recommended', testDoReview: 'I\'ll review', testSkip: 'Skip', testAllRight: 'All correct!', rightFirst: 'right first time', teacherIs: 'Teacher: {t}', tapPicFirst: 'Tap a picture first', paused: 'Paused',
    installVoice: 'To hear the teacher, install the {lang} text-to-speech voice on your phone',
    repTrialDay: 'Trial day {d} of {n}.', repFirst: 'Right first time', repAvg: 'Average answer time: {s}', repNoData: 'no data yet',
    repLine: 'Answers: {a}, mistakes: {e}, lessons: {l}, days: {d}', repNoAdvice: 'No advice yet',
    repNeed: 'At least {n} answers with each teacher are needed. Still missing: {names}.',
    repBest: 'Best for you: {t}', repWhy: 'With this teacher you got more answers right first time, and answered faster.',
    d1: 'Demo lesson: just watch and listen. You don\'t need to touch anything.',
    d2: 'The teacher points at each picture and says what it is. You repeat.',
    d3: 'When the Talk button flashes, it\'s your turn to speak.',
    d4: 'Three times, all the objects.', d5: 'Big «?»: it\'s a question.',
    d6: 'The teacher gives the answer, then points at you: repeat it.', d7: 'If the question is wrong, say no.',
    d8: 'If you make a mistake…', d9: '…the teacher crosses their arms and says the right answer. You repeat it, then you practise that word a little.',
    d10: 'A new object. The teacher won\'t tell you its name. Keep saying no.', d11: '…until you learn the question to ask.',
    d12: 'If the app doesn\'t hear you…', d13: '…tap {talk} and answer.', d14: 'Didn\'t catch the question?',
    d15: 'Tap {repeat} to hear it again.', d16: 'Once you know the question, you ask too: tap a picture and ask.', d17: 'Now it\'s your turn!'
  },
  de: {
    testTitle: 'Testmodus', testText: 'Tippe auf eine Lehrkraft. Deine Wahl bleibt, bis du sie änderst.',
    trialTitle: '{d}-Tage-Test', trialText: 'Jede Lehrkraft {n} Tage lang. Danach sagt dir die App, wer am besten zu dir passt.',
    trialDay: 'Test: Tag {d} von {n}', trialToday: 'Lehrkraft heute: {t}.',
    trialDone: 'Test abgeschlossen', trialDoneText: 'Öffne die Ergebnisse, um zu sehen, wer am besten zu dir passt.',
    today: 'heute', labelTeacher: 'Lehrkraft', labelLessons: 'Lektionen', labelOptions: 'Optionen', level: 'Stufe {n}',
    optText: 'Sätze auch schriftlich zeigen', optSpeed: 'Tempo der Lektion', speedSlow: 'Langsam', speedNormal: 'Normal', speedFast: 'Schnell', yourLang: 'Deine Sprache', regTitle: 'Wie die Lehrkraft mit dir spricht', regLei: 'Lei — formell (Business)', regTu: 'tu — Alltag (Geschäfte, Bars)', regLocked: 'Zum Benutzen freischalten', regNote: 'Du kannst es jederzeit ändern. Es ändert die Lektionen ab der ersten.', btnReport: 'Testergebnisse',
    demoLesson: 'Probelektion', seen: 'gesehen', watchFirst: 'zuerst ansehen', lesson: 'Lektion {n}',
    talk: 'Sprechen', repeat: 'Wiederholen', exit: 'Beenden', skipDemo: 'Demo überspringen',
    favs: 'Meine Sätze', favHint: 'Tippe in einer Lektion auf den Stern ☆, um einen Satz hier zu speichern.', favEmpty: 'Noch keine Sätze. Tippe in einer Lektion auf den Stern ☆ neben dem Titel.', favPractice: 'Üben', favAgain: 'Nochmal', favWrong: 'Nein — hör zu, weiter', favPerfect: 'Perfekt!', favDone: 'Übung beendet', favScore: 'Beim ersten Mal richtig: {p}%', fav_in1h: 'In 1 Stunde', fav_tonight: 'Heute um 20 Uhr', fav_tomorrow: 'Morgen um 9 Uhr', fav_daily: 'Jeden Tag um 9 Uhr', favNoTimer: 'Keine Erinnerung', favNeedsApp: 'Die Erinnerung funktioniert in der App auf dem Handy.', favNoPerm: 'Erlaube Benachrichtigungen für die Erinnerung.', search: 'Suchen', searchBtn: 'Ein Wort suchen', searchPh: 'Ein Wort, ein Verb, ein Artikel…', searchTip: 'Schreib oder sag ein Wort: Du findest die Lektionen, in denen es vorkommt, und beginnst genau dort.', searchNone: 'Nichts gefunden.', searchMaybe: 'Vielleicht:', searchFound: 'Lektionen: {n}', tagline: 'Lerne die Sprache und löse das Rätsel.', storyEp: 'Folge {n}', storyNext: 'Weiter ▶', storyGo: '▶ Nächste Lektion', storyNextIn: 'Fortsetzung folgt… in Lektion {n}', storyLocked: 'nach Lektion {n}', storyWatch: 'Folge {n} ansehen', stories: 'Geschichten', lessonsRange: 'Lektionen {a}–{b}', storyEpisodes: 'Folgen', storySoon: 'demnächst', genre_giallo: 'Krimi', genre_commedia: 'Komödie', genre_romantica: 'Liebesgeschichte', remindLabel: 'Erinnerung zum Lernen', remindOff: 'Aus', remindOn: 'Jeden Tag um {h}: Tippe auf die Benachrichtigung und die Lektion beginnt.', remindTitle: 'Zeit für deine Lektion!', unlockSwitch: 'Erinnerung beim Entsperren (Android)', unlockLabel: 'Erinnerung beim Entsperren', unlockTitle: 'fünf Minuten Italienisch?', unlockStudy: '▶ Jetzt lernen', unlockLater: 'Später', unlockToday: 'Genug für heute', unlockOn: 'Erinnerung beim Entsperren ist an', unlockOnShort: 'Wenn du das Handy entsperrst, erinnert dich der Lehrer ans Lernen (8–21 Uhr, höchstens alle 3 Stunden, nie wenn du heute schon gelernt hast).', unlockNeedsAndroid: 'Das funktioniert in der App auf einem Android-Handy.', unlockTest: 'Jetzt ausprobieren', unlockReady: 'Fertig: die Erinnerung beim Entsperren ist an.', guideTitle: 'Eine Berechtigung', guideOpen: 'Einstellungen öffnen', guideInfo: 'Android lässt mich nicht', guideBack: 'Nicht jetzt', unlockG1: 'Tippe auf «Einstellungen öffnen».', unlockG2: 'Suche CIAO und schalte «Über anderen Apps einblenden» ein.', unlockG3: 'Geh zurück zu CIAO: die Erinnerung ist an.', unlockGMore: 'Wenn Android «Eingeschränkte Einstellung» sagt: tippe auf «Android lässt mich nicht», dann oben rechts auf ⋮, «Eingeschränkte Einstellungen zulassen», und mach es noch einmal.',
    lessonComplete: 'Lektion beendet', again: 'Lektion wiederholen', menu: 'Menü',
    reportTitle: 'Testergebnisse', resetAll: 'Alle Daten löschen', confirmReset: 'Alle Test- und Lektionsdaten löschen?',
    listen: 'Zuhören', pickAsk: 'Du bist dran: tippe auf ein Bild und frage', correct: 'Richtig', movingOn: 'Weiter',
    tryAgain: 'Noch einmal', speakNow: 'Jetzt sprechen', micBlocked: 'Mikrofon gesperrt: erlaube es und tippe auf {talk}',
    noSR: 'Dieses Telefon hat keine Spracherkennung. Du kannst nur zuhören', needNet: 'Die Spracherkennung braucht Internet. Tippe auf {talk}',
    notHeard: 'Ich habe dich nicht gehört', tapReady: 'Tippe auf {talk}, wenn du bereit bist', heard: 'Gehört', practice: 'Übung {i} / {n}',
    levelTest: 'Test Stufe {n}', testDone: 'Stufe {n}: Test beendet', testAsk: 'Stelle eine Frage zum Bild', testScore: '{n} von {t}', testIntro: 'Test: jetzt keine Korrekturen, die Ergebnisse kommen am Ende', testMistakes: 'Zum Nachschauen', testYou: 'Du', testRight: 'Richtig', testNoAnswer: '(keine Antwort)', testFree: 'Freie Beschreibung (zählt nicht)', testExample: 'Zum Beispiel', testReview: 'Wiederholung empfohlen', testDoReview: 'Ich wiederhole', testSkip: 'Überspringen', testAllRight: 'Alles richtig!', rightFirst: 'beim ersten Mal richtig', teacherIs: 'Lehrkraft: {t}', tapPicFirst: 'Tippe zuerst auf ein Bild', paused: 'Pause',
    installVoice: 'Um die Lehrkraft zu hören, installiere die {lang} Sprachausgabe auf deinem Telefon',
    repTrialDay: 'Testtag {d} von {n}.', repFirst: 'Beim ersten Mal richtig', repAvg: 'Durchschnittliche Antwortzeit: {s}', repNoData: 'noch keine Daten',
    repLine: 'Antworten: {a}, Fehler: {e}, Lektionen: {l}, Tage: {d}', repNoAdvice: 'Noch keine Empfehlung',
    repNeed: 'Mit jeder Lehrkraft sind mindestens {n} Antworten nötig. Es fehlen noch: {names}.',
    repBest: 'Am besten für dich: {t}', repWhy: 'Mit dieser Lehrkraft hattest du mehr Antworten beim ersten Mal richtig und warst schneller.',
    d1: 'Probelektion: einfach zusehen und zuhören. Du musst nichts berühren.',
    d2: 'Die Lehrkraft zeigt auf jedes Bild und sagt, was es ist. Du sprichst nach.',
    d3: 'Wenn die Taste «Sprechen» blinkt, bist du dran.',
    d4: 'Dreimal, alle Gegenstände.', d5: 'Großes «?»: Das ist eine Frage.',
    d6: 'Die Lehrkraft gibt die Antwort und zeigt dann auf dich: Sprich sie nach.', d7: 'Wenn die Frage falsch ist, sag nein.',
    d8: 'Wenn du einen Fehler machst…', d9: '…kreuzt die Lehrkraft die Arme und sagt die richtige Antwort. Du sprichst nach und übst das Wort ein wenig.',
    d10: 'Ein neuer Gegenstand. Die Lehrkraft sagt seinen Namen nicht. Sag weiter nein.', d11: '…bis du die richtige Frage lernst.',
    d12: 'Wenn die App dich nicht hört…', d13: '…tippe auf {talk} und antworte.', d14: 'Frage nicht verstanden?',
    d15: 'Tippe auf {repeat}, um sie noch einmal zu hören.', d16: 'Wenn du die Frage kennst, fragst du auch: Tippe auf ein Bild und frage.', d17: 'Jetzt bist du dran!'
  },
  ja: {
    testTitle: 'テストモード', testText: '先生をタップして選んでください。変更するまで選択は保存されます。',
    trialTitle: '{d}日間のお試し', trialText: '各先生を{n}日ずつ。その後、あなたに一番合う先生をアプリがお知らせします。',
    trialDay: 'お試し：{n}日中{d}日目', trialToday: '今日の先生：{t}',
    trialDone: 'お試し終了', trialDoneText: '結果を開いて、あなたに一番合う先生を確認してください。',
    today: '今日', labelTeacher: '先生', labelLessons: 'レッスン', labelOptions: '設定', level: 'レベル{n}',
    optText: '文を文字でも表示する', optSpeed: 'レッスンの速さ', speedSlow: 'ゆっくり', speedNormal: 'ふつう', speedFast: 'はやい', yourLang: 'あなたの言語', regTitle: '先生の話し方', regLei: 'Lei — ていねい（ビジネス）', regTu: 'tu — ふだん（店・バール）', regLocked: 'ロック解除で使えます', regNote: 'いつでも変えられます。最初のレッスンから変わります。', btnReport: 'お試しの結果',
    demoLesson: 'デモレッスン', seen: '視聴済み', watchFirst: 'まず見る', lesson: 'レッスン{n}',
    talk: '話す', repeat: 'もう一度', exit: '終了', skipDemo: 'デモをスキップ',
    favs: 'わたしの文', favHint: 'レッスン中に星 ☆ をタップすると、ここに文が保存されます。', favEmpty: 'まだ文がありません。レッスンでタイトルの横の星 ☆ をタップしてください。', favPractice: '練習する', favAgain: 'もう一度', favWrong: 'いいえ — 聞いて次へ', favPerfect: '完璧！', favDone: '練習終了', favScore: '一回目で正解：{p}%', fav_in1h: '1時間後', fav_tonight: '今夜8時', fav_tomorrow: '明日9時', fav_daily: '毎日9時', favNoTimer: 'リマインダーなし', favNeedsApp: 'リマインダーはスマホのアプリで使えます。', favNoPerm: 'リマインダーには通知を許可してください。', search: '検索', searchBtn: 'ことばを検索', searchPh: '単語・動詞・冠詞…', searchTip: 'ことばを書くか言ってください。そのことばがあるレッスンが見つかり、その場所から始められます。', searchNone: '見つかりません。', searchMaybe: 'もしかして：', searchFound: 'レッスン：{n}', tagline: 'ことばを学んで、なぞを解こう。', storyEp: '第{n}話', storyNext: '次へ ▶', storyGo: '▶ 次のレッスン', storyNextIn: 'つづく… レッスン{n}で', storyLocked: 'レッスン{n}のあと', storyWatch: '第{n}話を見る', stories: 'ストーリー', lessonsRange: 'レッスン {a}–{b}', storyEpisodes: 'エピソード', storySoon: '近日公開', genre_giallo: 'ミステリー', genre_commedia: 'コメディ', genre_romantica: 'ラブストーリー', remindLabel: '勉強のリマインダー', remindOff: 'オフ', remindOn: '毎日{h}に通知します。タップするとレッスンが始まります。', remindTitle: 'レッスンの時間です！', unlockSwitch: 'ロック解除のときのリマインダー（Android）', unlockLabel: 'ロック解除のリマインダー', unlockTitle: 'イタリア語を5分どうですか？', unlockStudy: '▶ 今すぐ勉強', unlockLater: 'あとで', unlockToday: '今日はもういい', unlockOn: 'ロック解除のリマインダーはオンです', unlockOnShort: 'スマホのロックを解除すると、先生が勉強を思い出させます（8〜21時、3時間に1回まで、今日もう勉強したら出ません）。', unlockNeedsAndroid: 'Androidスマホのアプリで使えます。', unlockTest: '今ためす', unlockReady: '完了：ロック解除のリマインダーはオンです。', guideTitle: '許可がひとつ必要です', guideOpen: '設定を開く', guideInfo: 'Androidが許可させてくれない', guideBack: '今はしない', unlockG1: '「設定を開く」をタップ。', unlockG2: 'CIAOを探して「他のアプリの上に重ねて表示」をオンに。', unlockG3: 'CIAOに戻る：リマインダーはオンです。', unlockGMore: 'Androidが「制限付き設定」と言ったら：「Androidが許可させてくれない」をタップし、右上の ⋮ から「制限付き設定を許可」を選んで、もう一度。',
    lessonComplete: 'レッスン終了', again: 'もう一度レッスン', menu: 'メニュー',
    reportTitle: 'お試しの結果', resetAll: 'すべてのデータを削除', confirmReset: 'お試しとレッスンのデータをすべて削除しますか？',
    listen: '聞いてください', pickAsk: 'あなたの番：絵をタップして質問してください', correct: '正解', movingOn: '次へ',
    tryAgain: 'もう一度', speakNow: '話してください', micBlocked: 'マイクがブロックされています。許可してから「{talk}」をタップしてください',
    noSR: 'この電話には音声認識がありません。聞くことだけできます', needNet: '音声認識にはインターネットが必要です。「{talk}」をタップしてください',
    notHeard: '聞こえませんでした', tapReady: '準備ができたら「{talk}」をタップしてください', heard: '聞き取り', practice: '練習 {i} / {n}',
    levelTest: 'レベル{n}のテスト', testDone: 'レベル{n}：テスト終了', testAsk: '絵について質問してください', testScore: '{t}問中{n}問', testIntro: 'テスト：途中で訂正はありません。結果は最後に', testMistakes: '確認するところ', testYou: 'あなた', testRight: '正しい答え', testNoAnswer: '（答えなし）', testFree: '自由な説明（点数に入りません）', testExample: '例', testReview: '復習をおすすめします', testDoReview: '復習する', testSkip: 'スキップ', testAllRight: '全問正解！', rightFirst: '一回目で正解', teacherIs: '先生：{t}', tapPicFirst: 'まず絵をタップしてください', paused: '一時停止',
    installVoice: '先生の声を聞くには、電話に{lang}の音声合成をインストールしてください',
    repTrialDay: 'お試し{n}日中{d}日目。', repFirst: '一回目で正解', repAvg: '平均回答時間：{s}', repNoData: 'まだデータがありません',
    repLine: '回答：{a}、間違い：{e}、レッスン：{l}、日数：{d}', repNoAdvice: 'まだおすすめはありません',
    repNeed: '各先生と少なくとも{n}回の回答が必要です。まだ足りない先生：{names}。',
    repBest: 'あなたに一番合う先生：{t}', repWhy: 'この先生のとき、一回目の正解が多く、答えるのも速かったです。',
    d1: 'デモレッスン：見て聞くだけです。何も触る必要はありません。',
    d2: '先生が絵を一つずつ指して、何かを言います。あなたはくり返します。',
    d3: '「話す」ボタンが点滅したら、あなたが話す番です。',
    d4: '3回、すべての物で。', d5: '大きな「？」：質問です。',
    d6: '先生が答えを言って、あなたを指さします。くり返してください。', d7: '質問がまちがっていたら、「いいえ」と言います。',
    d8: 'まちがえたら…', d9: '…先生は腕でバツを作り、正しい答えを言います。くり返して、その言葉を少し練習します。',
    d10: '新しい物です。先生は名前を言いません。「いいえ」と言い続けてください。', d11: '…質問のしかたを覚えるまで。',
    d12: 'アプリに聞こえなかったら…', d13: '…「{talk}」をタップして答えてください。', d14: '質問が聞き取れなかったら？',
    d15: '「{repeat}」をタップすると、もう一度聞けます。', d16: '質問を覚えたら、あなたも質問します。絵をタップして聞いてください。', d17: 'さあ、あなたの番です！'
  },
  it: {
    testTitle: 'Modalità prova', testText: 'Tocca un insegnante per sceglierlo. La scelta resta finché non la cambi.',
    trialTitle: 'Prova di {d} giorni', trialText: 'Ogni insegnante per {n} giorni. Poi l\'app ti dice quale va meglio per te.',
    trialDay: 'Prova: giorno {d} di {n}', trialToday: 'Insegnante di oggi: {t}.',
    trialDone: 'Prova finita', trialDoneText: 'Apri i risultati per vedere quale insegnante va meglio per te.',
    today: 'oggi', labelTeacher: 'Insegnante', labelLessons: 'Lezioni', labelOptions: 'Opzioni', level: 'Livello {n}',
    optText: 'Mostra anche le frasi scritte', optSpeed: 'Velocità della lezione', speedSlow: 'Lenta', speedNormal: 'Normale', speedFast: 'Veloce', yourLang: 'La tua lingua', regTitle: 'Come ti parla l\'insegnante', regLei: 'Lei — formale (business)', regTu: 'tu — normale (negozi, bar)', regLocked: 'Da sbloccare', regNote: 'Si può cambiare quando vuoi. Cambia le lezioni dalla prima.', btnReport: 'Risultati della prova',
    demoLesson: 'Lezione dimostrativa', seen: 'vista', watchFirst: 'guardala prima', lesson: 'Lezione {n}',
    talk: 'Parla', repeat: 'Riascolta', exit: 'Esci', skipDemo: 'Salta la dimostrazione',
    favs: 'Le mie frasi', favHint: 'Nella lezione tocca la stellina ☆ per salvare qui una frase.', favEmpty: 'Ancora nessuna frase. Nella lezione tocca la stellina ☆ accanto al titolo.', favPractice: 'Esercitati', favAgain: 'Ancora', favWrong: 'No — ascolta e avanti', favPerfect: 'Perfetto!', favDone: 'Esercizio finito', favScore: 'Giuste al primo colpo: {p}%', fav_in1h: 'Tra un\'ora', fav_tonight: 'Stasera alle 20', fav_tomorrow: 'Domani alle 9', fav_daily: 'Ogni giorno alle 9', favNoTimer: 'Nessun promemoria', favNeedsApp: 'Il promemoria funziona nell\'app sul telefono.', favNoPerm: 'Permetti le notifiche per avere il promemoria.', search: 'Cerca', searchBtn: 'Cerca una parola', searchPh: 'Una parola, un verbo, un articolo…', searchTip: 'Scrivi o di\' una parola: trovi le lezioni dove c\'è, e parti proprio da lì.', searchNone: 'Non ho trovato niente.', searchMaybe: 'Forse:', searchFound: 'Lezioni: {n}', tagline: 'Impara la lingua e scopri il mistero.', storyEp: 'Puntata {n}', storyNext: 'Avanti ▶', storyGo: '▶ La lezione dopo', storyNextIn: 'Continua… nella lezione {n}', storyLocked: 'dopo la lezione {n}', storyWatch: 'Guarda la puntata {n}', stories: 'Le storie', lessonsRange: 'Lezioni {a}–{b}', storyEpisodes: 'Le puntate', storySoon: 'in arrivo', genre_giallo: 'Giallo', genre_commedia: 'Commedia', genre_romantica: 'Romantica', remindLabel: 'Promemoria per studiare', remindOff: 'Spento', remindOn: 'Ogni giorno alle {h}: tocchi la notifica e parte la lezione.', remindTitle: 'è ora della lezione!', unlockSwitch: 'Promemoria quando sblocco il telefono (Android)', unlockLabel: 'Promemoria allo sblocco', unlockTitle: 'cinque minuti di italiano?', unlockStudy: '▶ Studio adesso', unlockLater: 'Più tardi', unlockToday: 'Basta per oggi', unlockOn: 'Promemoria allo sblocco acceso', unlockOnShort: 'Quando sblocchi il telefono, l\'insegnante ti ricorda di studiare (dalle 8 alle 21, al massimo ogni 3 ore, mai se oggi hai già studiato).', unlockNeedsAndroid: 'Funziona nell\'app su un telefono Android.', unlockTest: 'Prova adesso', unlockReady: 'Fatto: il promemoria allo sblocco è acceso.', guideTitle: 'Un permesso', guideOpen: 'Apri le impostazioni', guideInfo: 'Android non me lo fa dare', guideBack: 'Non ora', unlockG1: 'Tocca «Apri le impostazioni».', unlockG2: 'Trova CIAO e accendi «Mostra sopra altre app».', unlockG3: 'Torna a CIAO: il promemoria è acceso.', unlockGMore: 'Se Android dice «Impostazione con restrizioni»: tocca «Android non me lo fa dare», poi il menu ⋮ in alto a destra, «Consenti impostazioni con restrizioni», e rifallo.',
    lessonComplete: 'Lezione finita', again: 'Rifai la lezione', menu: 'Menu',
    reportTitle: 'Risultati della prova', resetAll: 'Cancella tutti i dati', confirmReset: 'Cancellare tutti i dati della prova e delle lezioni?',
    listen: 'Ascolta', pickAsk: 'Tocca a te: tocca una figura, poi chiedi', correct: 'Giusto', movingOn: 'Avanti',
    tryAgain: 'Riprova', speakNow: 'Parla ora', micBlocked: 'Microfono bloccato: permettilo, poi tocca {talk}',
    noSR: 'Questo telefono non ha il riconoscimento vocale. Puoi solo ascoltare', needNet: 'Il riconoscimento vocale ha bisogno di internet. Tocca {talk}',
    notHeard: 'Non ti ho sentito', tapReady: 'Tocca {talk} quando sei pronto', heard: 'Sentito', practice: 'Esercizio {i} / {n}',
    levelTest: 'Test del livello {n}', testDone: 'Livello {n}: test finito', testAsk: 'Fai una domanda sulla figura', testScore: '{n} su {t}', testIntro: 'Test: niente correzioni adesso, i risultati alla fine', testMistakes: 'Da rivedere', testYou: 'Tu', testRight: 'Giusto', testNoAnswer: '(nessuna risposta)', testFree: 'Descrizione libera (non conta)', testExample: 'Per esempio', testReview: 'Ripasso consigliato', testDoReview: 'Faccio il ripasso', testSkip: 'Salto', testAllRight: 'Tutto giusto!', rightFirst: 'giuste al primo colpo', teacherIs: 'Insegnante: {t}', tapPicFirst: 'Prima tocca una figura', paused: 'In pausa',
    installVoice: 'Per sentire l\'insegnante, installa sul telefono la voce {lang} della sintesi vocale',
    repTrialDay: 'Giorno di prova {d} di {n}.', repFirst: 'Giuste al primo colpo', repAvg: 'Tempo medio di risposta: {s}', repNoData: 'ancora nessun dato',
    repLine: 'Risposte: {a}, errori: {e}, lezioni: {l}, giorni: {d}', repNoAdvice: 'Ancora nessun consiglio',
    repNeed: 'Servono almeno {n} risposte con ogni insegnante. Mancano ancora: {names}.',
    repBest: 'Il migliore per te: {t}', repWhy: 'Con questo insegnante hai dato più risposte giuste al primo colpo, e più in fretta.',
    d1: 'Lezione dimostrativa: guarda e ascolta. Non devi toccare niente.',
    d2: 'L\'insegnante indica ogni figura e dice cos\'è. Tu ripeti.',
    d3: 'Quando il tasto Parla lampeggia, tocca a te parlare.',
    d4: 'Tre volte, tutti gli oggetti.', d5: '«?» grande: è una domanda.',
    d6: 'L\'insegnante dà la risposta, poi ti indica: ripetila.', d7: 'Se la domanda è sbagliata, di\' di no.',
    d8: 'Se sbagli…', d9: '…l\'insegnante incrocia le braccia e dice la risposta giusta. Tu la ripeti, poi ti eserciti un po\' su quella parola.',
    d10: 'Un oggetto nuovo. L\'insegnante non dice il suo nome. Continua a dire di no.', d11: '…finché impari la domanda da fare.',
    d12: 'Se l\'app non ti sente…', d13: '…tocca {talk} e rispondi.', d14: 'Non hai capito la domanda?',
    d15: 'Tocca {repeat} per sentirla di nuovo.', d16: 'Quando conosci la domanda, chiedi anche tu: tocca una figura e chiedi.', d17: 'Ora tocca a te!'
  }
};

// Nome della lingua del corso, detto nella lingua dello studente (per «installa la voce …»)
const COURSE_LANG_NAME = {
  it: { en: 'Italian', de: 'italienische', ja: 'イタリア語', it: 'italiana' },
  en: { en: 'English', de: 'englische', ja: '英語', it: 'inglese' },
  de: { en: 'German', de: 'deutsche', ja: 'ドイツ語', it: 'tedesca' },
  ru: { en: 'Russian', de: 'russische', ja: 'ロシア語', it: 'russa' },
  ar: { en: 'Arabic', de: 'arabische', ja: 'アラビア語', it: 'araba' },
  zh: { en: 'Chinese', de: 'chinesische', ja: '中国語', it: 'cinese' }
};

let UI_LANG = 'en';
function setUiLang(code) { UI_LANG = UI_TEXT[code] ? code : 'en'; }
// tx('key', { n: 3 }) → testo nella lingua dello studente
function tx(key, vars) {
  let s = (UI_TEXT[UI_LANG] && UI_TEXT[UI_LANG][key]) || UI_TEXT.en[key] || key;
  if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}
