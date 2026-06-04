# Reeboot Radio - ASO Metadata Pack

Date: 2026-06-04
Owner: Reebootradio LLC
App: Reeboot Radio (hip hop / R&B live radio)
Audio backend: Live365 (stream a49353)
Website: https://www.reebootradio.com
Version this pack targets: 2.2.0 (app interface ENGLISH ONLY; UI localization ships 2.3.0)

---

## GROUNDING - Verified feature set (read from source 2026-06-04)

Claims below are ONLY what exists in the shipped code:

- Live radio stream playback - Live365 stream `https://streaming.live365.com/a49353`, react-native-track-player (`src/setupPlayer.js`, `src/StreamContext.js`).
- Background + lock-screen playback - iOS `UIBackgroundModes: audio` (ios/.../Info.plist), Android `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (AndroidManifest.xml). Lock-screen / notification Play/Pause via `notificationCapabilities` in setupPlayer.js. This supports the old "background + lock screen + car bluetooth" release-notes claim: it is a standard system audio session, so it routes to Bluetooth / CarPlay / Android Auto media controls. Claimed conservatively as "lock screen and Bluetooth" - NOT a CarPlay-certified dedicated interface (no CarPlay entitlement in the project).
- Now Playing / track metadata - ICY metadata parsed from the Live365 stream (`StreamContext.js`).
- Live chat - Firestore real-time (`src/screens/ChatRoom.js`); read anonymously, sign in to post.
- Live reactions - floating fire / heart / clap / 100 emojis (`src/components/LiveReactions.js`, REACTIONS in constants.js).
- Shoutouts - owner broadcast banner (`src/components/ShoutoutBanner.js`).
- Giveaways - winner announcement modal/banner (`src/components/GiveawayModal.js`).
- Song requests + community voting - (`src/screens/SongRequests.js`).
- DJ schedule - weekly lineup with live show highlight (`src/screens/DJSchedule.js`).
- Listener profile - badges, stats, weekly leaderboard (`src/screens/ListenerProfile.js`).
- Account deletion - in-app, irreversible (`src/components/DeleteAccountModal.js`).

REMOVED / NOT CLAIMED:
- Merch / shop - `src/screens/MerchShop.js` is a COMING SOON placeholder. NOT claimed anywhere.
- Report / block / mute on chat - NO such moderation UI exists in code. NOT claimed. Safety language is limited to what is real: sign-in-required posting and in-app account deletion. (Apple UGC note: if Apple requires report/block before approval, that is an ENGINEERING gap to close in 2.3.0, not a copy fix - flagged.)
- CarPlay dedicated UI - not entitled. Only generic Bluetooth/lock-screen media routing is claimed.
- DJ names in chat (DJ Shadow etc.) are sample/badge-detection seed data, not real on-air talent - not referenced in copy.

---

# A. APPLE APP STORE

marketingUrl (all locales): https://www.reebootradio.com
supportUrl (all locales): https://www.reebootradio.com/support

---

## A1. en-US (PRIMARY)

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: Rap, R&B & Live DJ Streams
  [26 chars]

keywords: reboot,mixtape,old school,urban,beats,freestyle,turntable,station,fm,talk,trap,soul,throwback,radio
  [98 chars]

promotionalText: New DJ sets dropping all week. Tap in live, request the next track, and react in real time with the Reeboot Radio community.
  [127 chars]

description:
Reeboot Radio is your 24/7 home for hip hop and R&B - live DJ sets, classic throwbacks, and the records that move the culture, streaming free.

WHAT YOU CAN HEAR
- Live hip hop and R&B around the clock
- Old school, throwbacks, and the new wave
- Real DJ sets with see-what's-playing track info
- Keeps playing in the background, on your lock screen, and over Bluetooth

WHAT YOU CAN DO
- Jump in the live chat and talk back with the room
- React in real time - fire, love, clap, 100
- Request the next song and vote up what you want to hear
- Catch the weekly DJ schedule so you never miss your show
- Build your listener profile, earn badges, and climb the leaderboard
- Watch for live shoutouts and giveaways from the booth

THE COMMUNITY
Reeboot Radio is more than a stream - it's a room. Sign in to chat, send shoutout love, and put your song on the air. Read along anytime without an account.

YOUR ACCOUNT, YOUR CALL
Sign in to post and request. You can delete your account and your data anytime, right inside the app.

NEED A HAND?
Questions or feedback: https://www.reebootradio.com/support

Tap in. This is what radio should sound like.

whatsNew (2.2.0):
This update brings the new Midnight Broadcast Booth look - a darker, cleaner interface built around the live player and chat. We've improved stability and made privacy improvements under the hood. Thanks for rocking with Reeboot Radio.

---

## A2. de-DE

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: Rap, R&B & Live-DJ-Streams
  [26 chars]

keywords: reboot,mixtape,oldschool,deutschrap,beats,strassenrap,radio,soul,trap,musik,charts,playlist,fm
  [94 chars]

promotionalText: Jede Woche frische DJ-Sets. Hor live rein, wunsch dir den nachsten Track und reagiere in Echtzeit mit der Reeboot-Radio-Community.
  [129 chars]

description:
Reeboot Radio ist dein 24/7-Zuhause fur Hip-Hop und R&B - Live-DJ-Sets, Classics zum Mitnicken und die Tracks, die die Kultur bewegen. Kostenlos.

DAS HORST DU
- Hip-Hop und R&B rund um die Uhr live
- Oldschool, Throwbacks und der neue Sound
- Echte DJ-Sets mit Anzeige, was gerade lauft
- Lauft weiter im Hintergrund, auf dem Sperrbildschirm und uber Bluetooth

DAS KANNST DU
- Steig in den Live-Chat ein und red mit dem Raum
- Reagiere in Echtzeit - Fire, Love, Clap, 100
- Wunsch dir den nachsten Song und vote, was als Nachstes lauft
- Behalt den wochentlichen DJ-Plan im Blick und verpass keine Show
- Bau dein Horer-Profil auf, sammle Badges und kletter im Ranking
- Verpass keine Live-Shoutouts und Giveaways aus dem Studio

DIE COMMUNITY
Reeboot Radio ist mehr als ein Stream - es ist ein Raum. Melde dich an, um zu chatten, Shoutout-Love zu schicken und deinen Song on air zu bringen. Mitlesen geht jederzeit ohne Account.

DEIN ACCOUNT, DEINE ENTSCHEIDUNG
Zum Posten und Wunschen meldest du dich an. Du kannst deinen Account und deine Daten jederzeit direkt in der App loschen.

KURZER HINWEIS
Die App-Oberflache ist aktuell auf Englisch - weitere Sprachen kommen bald.

BRAUCHST DU HILFE?
Fragen oder Feedback: https://www.reebootradio.com/support

Tap in. So sollte Radio klingen.

whatsNew (2.2.0):
Dieses Update bringt den neuen Look der Midnight Broadcast Booth - ein dunkleres, aufgeraumteres Interface rund um Live-Player und Chat. Wir haben die Stabilitat verbessert und Privacy-Verbesserungen umgesetzt. Danke, dass ihr mit Reeboot Radio am Start seid.

---

## A3. ja

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: ヒップホップ R&B ライブDJ配信
  [18 chars]

keywords: reboot,ヒップホップ,ラップ,アールアンドビー,ミックステープ,オールドスクール,ビート,ラジオ,DJ,ソウル,trap,音楽,フリースタイル
  [69 chars]

promotionalText: 毎週新しいDJセットが登場。ライブで参加して、次にかかる曲をリクエスト、リアルタイムでReeboot Radioのコミュニティと盛り上がろう。
  [70 chars]

description:
Reeboot Radioは、ヒップホップとR&Bを24時間お届けするライブラジオ。ライブDJセット、定番のスローバック、カルチャーを動かす一曲を無料でストリーミング。

聴けるもの
- ヒップホップとR&Bを24時間ライブで
- オールドスクール、スローバック、最新の波
- いま流れている曲がわかるリアルなDJセット
- バックグラウンド、ロック画面、Bluetoothでも再生はそのまま

できること
- ライブチャットに入って、みんなと talk back
- リアルタイムでリアクション - Fire、Love、Clap、100
- 次の曲をリクエストして、聴きたい曲に投票
- 毎週のDJスケジュールをチェックして、お気に入りの番組を逃さない
- リスナープロフィールを育てて、バッジを集めて、ランキングを駆け上がろう
- ブースからのライブ shoutout とプレゼント企画もお見逃しなく

コミュニティ
Reeboot Radioはただの配信じゃない - ひとつの部屋。サインインすればチャット、shoutout、そして自分の曲をオンエアに。アカウントなしでも、いつでも読むだけはOK。

アカウントはあなた次第
投稿とリクエストにはサインインが必要です。アカウントとデータは、アプリ内からいつでも削除できます。

ひとこと
アプリの表示は現在は英語のみです - 多言語対応も近日登場。

サポート
質問やフィードバックはこちら: https://www.reebootradio.com/support

Tap in. これがラジオのあるべき音。

whatsNew (2.2.0):
今回のアップデートで、新しいMidnight Broadcast Boothのデザインが登場。ライブプレイヤーとチャットを中心にした、より暗くすっきりしたインターフェースです。安定性を改善し、プライバシー面も強化しました。Reeboot Radioをいつもありがとう。

---

## A4. pt-BR

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: Rap, R&B e DJ ao Vivo
  [21 chars]

keywords: reboot,mixtape,old school,rap nacional,beats,radio,trap,soul,batidas,musica,estacao,freestyle,toca
  [98 chars]

promotionalText: Sets novos de DJ toda semana. Entra ao vivo, pede a proxima musica e reage em tempo real com a comunidade Reeboot Radio.
  [117 chars]

description:
A Reeboot Radio e a sua casa 24 horas de hip hop e R&B - sets de DJ ao vivo, classicos pra matar a saudade e os sons que movem a cultura. De graca.

O QUE VOCE OUVE
- Hip hop e R&B ao vivo o tempo todo
- Old school, throwbacks e a nova onda
- Sets de DJ de verdade, com a musica que ta tocando na tela
- Continua tocando em segundo plano, na tela de bloqueio e no Bluetooth

O QUE VOCE FAZ
- Entra no chat ao vivo e troca ideia com a galera
- Reage em tempo real - fire, love, clap, 100
- Pede a proxima musica e vota no que voce quer ouvir
- Acompanha a grade semanal dos DJs e nao perde o seu programa
- Monta seu perfil de ouvinte, ganha badges e sobe no ranking
- Fica de olho nos shoutouts e sorteios ao vivo direto da cabine

A COMUNIDADE
A Reeboot Radio e mais que um stream - e um lugar. Faz login pra curtir o chat, mandar um shoutout e botar a sua musica no ar. Da pra ler a qualquer hora, sem conta.

SUA CONTA, SUA DECISAO
Pra postar e pedir musica e so fazer login. Voce pode apagar sua conta e seus dados quando quiser, dentro do app.

UM RECADO
A interface do app esta em ingles por enquanto - mais idiomas vem chegando.

PRECISA DE AJUDA?
Duvidas ou sugestoes: https://www.reebootradio.com/support

Tap in. E assim que radio tem que soar.

whatsNew (2.2.0):
Esta atualizacao traz o novo visual da Midnight Broadcast Booth - uma interface mais escura e limpa, montada em volta do player ao vivo e do chat. Melhoramos a estabilidade e fizemos melhorias de privacidade. Valeu por estar com a Reeboot Radio.

---

## A5. es-MX

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: Rap, R&B y DJ en Vivo
  [21 chars]

keywords: reboot,mixtape,old school,urbano,beats,radio,trap,soul,estacion,musica,fm,freestyle,rimas,suena
  [95 chars]

promotionalText: Sets nuevos de DJ cada semana. Entra en vivo, pide la siguiente rola y reacciona en tiempo real con la comunidad de Reeboot Radio.
  [128 chars]

description:
Reeboot Radio es tu casa 24/7 de hip hop y R&B - sets de DJ en vivo, clasicos de antes y los temas que mueven la cultura. Gratis.

LO QUE ESCUCHAS
- Hip hop y R&B en vivo a toda hora
- Old school, throwbacks y lo nuevo
- Sets de DJ reales, con la rola que suena en pantalla
- Sigue sonando en segundo plano, en la pantalla de bloqueo y por Bluetooth

LO QUE HACES
- Entra al chat en vivo y echa rola con la banda
- Reacciona en tiempo real - fire, love, clap, 100
- Pide la siguiente rola y vota por lo que quieres oir
- Checa la cartelera semanal de DJs y no te pierdas tu programa
- Arma tu perfil de oyente, gana badges y sube en el ranking
- No te pierdas los shoutouts y sorteos en vivo desde la cabina

LA COMUNIDAD
Reeboot Radio es mas que un stream - es un lugar. Inicia sesion para chatear, mandar un shoutout y poner tu rola al aire. Puedes leer cuando quieras, sin cuenta.

TU CUENTA, TU DECISION
Para publicar y pedir rolas inicia sesion. Puedes borrar tu cuenta y tus datos cuando quieras, desde la app.

UN AVISO
La interfaz de la app esta en ingles por ahora - pronto llegan mas idiomas.

NECESITAS AYUDA?
Dudas o comentarios: https://www.reebootradio.com/support

Tap in. Asi se debe oir la radio.

whatsNew (2.2.0):
Esta actualizacion trae el nuevo look de la Midnight Broadcast Booth - una interfaz mas oscura y limpia, armada alrededor del player en vivo y el chat. Mejoramos la estabilidad e hicimos mejoras de privacidad. Gracias por estar con Reeboot Radio.

---

## A6. fr-FR

name: Reeboot Radio - Hip Hop Live
  [28 chars]

subtitle: Rap, R&B et DJ en Direct
  [24 chars]

keywords: reboot,mixtape,old school,rap francais,beats,radio,trap,soul,musique,station,fm,freestyle,platine
  [97 chars]

promotionalText: De nouveaux sets de DJ chaque semaine. Rejoins le live, demande le prochain son et reagis en temps reel avec la communaute Reeboot Radio.
  [134 chars]

description:
Reeboot Radio, c'est ta maison 24/7 du hip hop et du R&B - des sets de DJ en direct, des classiques et les sons qui font bouger la culture. Gratuit.

CE QUE TU ECOUTES
- Du hip hop et du R&B en direct, non-stop
- De l'old school, des classiques et la nouvelle vague
- De vrais sets de DJ, avec le titre en cours affiche
- Continue de jouer en arriere-plan, sur l'ecran verrouille et en Bluetooth

CE QUE TU FAIS
- Rejoins le chat en direct et echange avec la salle
- Reagis en temps reel - fire, love, clap, 100
- Demande le prochain son et vote pour ce que tu veux entendre
- Garde un oeil sur le planning hebdo des DJ et ne rate plus ton emission
- Construis ton profil d'auditeur, gagne des badges et grimpe au classement
- Ne loupe pas les shoutouts et les jeux concours en direct depuis le studio

LA COMMUNAUTE
Reeboot Radio, c'est plus qu'un stream - c'est un lieu. Connecte-toi pour chatter, envoyer un shoutout et passer ton son a l'antenne. Tu peux lire a tout moment, sans compte.

TON COMPTE, TON CHOIX
Pour poster et demander des sons, connecte-toi. Tu peux supprimer ton compte et tes donnees quand tu veux, directement dans l'app.

UN PETIT MOT
L'interface de l'app est en anglais pour le moment - d'autres langues arrivent bientot.

BESOIN D'AIDE ?
Questions ou retours : https://www.reebootradio.com/support

Tap in. Voila a quoi la radio devrait ressembler.

whatsNew (2.2.0):
Cette mise a jour apporte le nouveau look Midnight Broadcast Booth - une interface plus sombre et plus nette, centree sur le lecteur en direct et le chat. On a ameliore la stabilite et apporte des ameliorations de confidentialite. Merci d'etre la avec Reeboot Radio.

---

# B. GOOGLE PLAY

Play locale codes: en-US, de-DE, ja-JP, pt-BR, es-419, fr-FR

---

## B1. en-US

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: Stream live hip hop & R&B, chat, react, and request songs with the DJ.
  [69 chars]

fullDescription:
Reeboot Radio is your 24/7 home for hip hop and R&B - live DJ sets, classic throwbacks, and the records that move the culture, streaming free.

WHAT YOU CAN HEAR
- Live hip hop and R&B around the clock
- Old school, throwbacks, and the new wave
- Real DJ sets with see-what's-playing track info
- Keeps playing in the background, on your lock screen, and over Bluetooth

WHAT YOU CAN DO
- Jump in the live chat and talk back with the room
- React in real time - fire, love, clap, 100
- Request the next song and vote up what you want to hear
- Catch the weekly DJ schedule so you never miss your show
- Build your listener profile, earn badges, and climb the leaderboard
- Watch for live shoutouts and giveaways from the booth

THE COMMUNITY
Reeboot Radio is more than a stream - it's a room. Sign in to chat, send shoutout love, and put your song on the air. Read along anytime without an account.

YOUR ACCOUNT, YOUR CALL
Sign in to post and request. You can delete your account and your data anytime, right inside the app.

NEED A HAND?
Questions or feedback: https://www.reebootradio.com/support

Tap in. This is what radio should sound like.

---

## B2. de-DE

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: Hor Hip-Hop & R&B live, chatte, reagiere und wunsch dir Songs beim DJ.
  [69 chars]

fullDescription:
Reeboot Radio ist dein 24/7-Zuhause fur Hip-Hop und R&B - Live-DJ-Sets, Classics zum Mitnicken und die Tracks, die die Kultur bewegen. Kostenlos.

DAS HORST DU
- Hip-Hop und R&B rund um die Uhr live
- Oldschool, Throwbacks und der neue Sound
- Echte DJ-Sets mit Anzeige, was gerade lauft
- Lauft weiter im Hintergrund, auf dem Sperrbildschirm und uber Bluetooth

DAS KANNST DU
- Steig in den Live-Chat ein und red mit dem Raum
- Reagiere in Echtzeit - Fire, Love, Clap, 100
- Wunsch dir den nachsten Song und vote, was als Nachstes lauft
- Behalt den wochentlichen DJ-Plan im Blick und verpass keine Show
- Bau dein Horer-Profil auf, sammle Badges und kletter im Ranking
- Verpass keine Live-Shoutouts und Giveaways aus dem Studio

DIE COMMUNITY
Reeboot Radio ist mehr als ein Stream - es ist ein Raum. Melde dich an, um zu chatten, Shoutout-Love zu schicken und deinen Song on air zu bringen. Mitlesen geht jederzeit ohne Account.

DEIN ACCOUNT, DEINE ENTSCHEIDUNG
Zum Posten und Wunschen meldest du dich an. Du kannst deinen Account und deine Daten jederzeit direkt in der App loschen.

KURZER HINWEIS
Die App-Oberflache ist aktuell auf Englisch - weitere Sprachen kommen bald.

BRAUCHST DU HILFE?
Fragen oder Feedback: https://www.reebootradio.com/support

Tap in. So sollte Radio klingen.

---

## B3. ja-JP

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: ヒップホップとR&Bをライブで。チャット、リアクション、曲のリクエストも。
  [37 chars]

fullDescription:
Reeboot Radioは、ヒップホップとR&Bを24時間お届けするライブラジオ。ライブDJセット、定番のスローバック、カルチャーを動かす一曲を無料でストリーミング。

聴けるもの
- ヒップホップとR&Bを24時間ライブで
- オールドスクール、スローバック、最新の波
- いま流れている曲がわかるリアルなDJセット
- バックグラウンド、ロック画面、Bluetoothでも再生はそのまま

できること
- ライブチャットに入って、みんなと talk back
- リアルタイムでリアクション - Fire、Love、Clap、100
- 次の曲をリクエストして、聴きたい曲に投票
- 毎週のDJスケジュールをチェックして、お気に入りの番組を逃さない
- リスナープロフィールを育てて、バッジを集めて、ランキングを駆け上がろう
- ブースからのライブ shoutout とプレゼント企画もお見逃しなく

コミュニティ
Reeboot Radioはただの配信じゃない - ひとつの部屋。サインインすればチャット、shoutout、そして自分の曲をオンエアに。アカウントなしでも、いつでも読むだけはOK。

アカウントはあなた次第
投稿とリクエストにはサインインが必要です。アカウントとデータは、アプリ内からいつでも削除できます。

ひとこと
アプリの表示は現在は英語のみです - 多言語対応も近日登場。

サポート
質問やフィードバックはこちら: https://www.reebootradio.com/support

Tap in. これがラジオのあるべき音。

---

## B4. pt-BR

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: Ouca hip hop e R&B ao vivo, converse no chat, reaja e peca musicas ao DJ.
  [71 chars]

fullDescription:
A Reeboot Radio e a sua casa 24 horas de hip hop e R&B - sets de DJ ao vivo, classicos pra matar a saudade e os sons que movem a cultura. De graca.

O QUE VOCE OUVE
- Hip hop e R&B ao vivo o tempo todo
- Old school, throwbacks e a nova onda
- Sets de DJ de verdade, com a musica que ta tocando na tela
- Continua tocando em segundo plano, na tela de bloqueio e no Bluetooth

O QUE VOCE FAZ
- Entra no chat ao vivo e troca ideia com a galera
- Reage em tempo real - fire, love, clap, 100
- Pede a proxima musica e vota no que voce quer ouvir
- Acompanha a grade semanal dos DJs e nao perde o seu programa
- Monta seu perfil de ouvinte, ganha badges e sobe no ranking
- Fica de olho nos shoutouts e sorteios ao vivo direto da cabine

A COMUNIDADE
A Reeboot Radio e mais que um stream - e um lugar. Faz login pra curtir o chat, mandar um shoutout e botar a sua musica no ar. Da pra ler a qualquer hora, sem conta.

SUA CONTA, SUA DECISAO
Pra postar e pedir musica e so fazer login. Voce pode apagar sua conta e seus dados quando quiser, dentro do app.

UM RECADO
A interface do app esta em ingles por enquanto - mais idiomas vem chegando.

PRECISA DE AJUDA?
Duvidas ou sugestoes: https://www.reebootradio.com/support

Tap in. E assim que radio tem que soar.

---

## B5. es-419

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: Escucha hip hop y R&B en vivo, chatea, reacciona y pide rolas al DJ.
  [66 chars]

fullDescription:
Reeboot Radio es tu casa 24/7 de hip hop y R&B - sets de DJ en vivo, clasicos de antes y los temas que mueven la cultura. Gratis.

LO QUE ESCUCHAS
- Hip hop y R&B en vivo a toda hora
- Old school, throwbacks y lo nuevo
- Sets de DJ reales, con la rola que suena en pantalla
- Sigue sonando en segundo plano, en la pantalla de bloqueo y por Bluetooth

LO QUE HACES
- Entra al chat en vivo y echa rola con la banda
- Reacciona en tiempo real - fire, love, clap, 100
- Pide la siguiente rola y vota por lo que quieres oir
- Checa la cartelera semanal de DJs y no te pierdas tu programa
- Arma tu perfil de oyente, gana badges y sube en el ranking
- No te pierdas los shoutouts y sorteos en vivo desde la cabina

LA COMUNIDAD
Reeboot Radio es mas que un stream - es un lugar. Inicia sesion para chatear, mandar un shoutout y poner tu rola al aire. Puedes leer cuando quieras, sin cuenta.

TU CUENTA, TU DECISION
Para publicar y pedir rolas inicia sesion. Puedes borrar tu cuenta y tus datos cuando quieras, desde la app.

UN AVISO
La interfaz de la app esta en ingles por ahora - pronto llegan mas idiomas.

NECESITAS AYUDA?
Dudas o comentarios: https://www.reebootradio.com/support

Tap in. Asi se debe oir la radio.

---

## B6. fr-FR

title: Reeboot Radio - Hip Hop Live
  [28 chars]

shortDescription: Ecoute du hip hop et du R&B en direct, chatte, reagis et demande des sons.
  [73 chars]

fullDescription:
Reeboot Radio, c'est ta maison 24/7 du hip hop et du R&B - des sets de DJ en direct, des classiques et les sons qui font bouger la culture. Gratuit.

CE QUE TU ECOUTES
- Du hip hop et du R&B en direct, non-stop
- De l'old school, des classiques et la nouvelle vague
- De vrais sets de DJ, avec le titre en cours affiche
- Continue de jouer en arriere-plan, sur l'ecran verrouille et en Bluetooth

CE QUE TU FAIS
- Rejoins le chat en direct et echange avec la salle
- Reagis en temps reel - fire, love, clap, 100
- Demande le prochain son et vote pour ce que tu veux entendre
- Garde un oeil sur le planning hebdo des DJ et ne rate plus ton emission
- Construis ton profil d'auditeur, gagne des badges et grimpe au classement
- Ne loupe pas les shoutouts et les jeux concours en direct depuis le studio

LA COMMUNAUTE
Reeboot Radio, c'est plus qu'un stream - c'est un lieu. Connecte-toi pour chatter, envoyer un shoutout et passer ton son a l'antenne. Tu peux lire a tout moment, sans compte.

TON COMPTE, TON CHOIX
Pour poster et demander des sons, connecte-toi. Tu peux supprimer ton compte et tes donnees quand tu veux, directement dans l'app.

UN PETIT MOT
L'interface de l'app est en anglais pour le moment - d'autres langues arrivent bientot.

BESOIN D'AIDE ?
Questions ou retours : https://www.reebootradio.com/support

Tap in. Voila a quoi la radio devrait ressembler.

---

# C. SCREENSHOT CAPTION PLAN

Verified screens that exist: Live player (RadioPlayer), Live chat (ChatRoom), Reactions
(LiveReactions) + Shoutouts (ShoutoutBanner), Giveaways (GiveawayModal), Profile/community
(ListenerProfile - badges + leaderboard), Schedule (DJSchedule). All six slots map to real screens.

Slot 1 - Live player
  en-US: 24/7 hip hop & R&B, live
  de-DE: Hip-Hop & R&B - 24/7 live
  ja:    ヒップホップ&R&Bを24時間ライブで
  pt-BR: Hip hop e R&B ao vivo, 24h
  es-MX: Hip hop y R&B en vivo, 24/7
  fr-FR: Hip hop & R&B en direct, 24/7

Slot 2 - Live chat
  en-US: Talk back in the live chat
  de-DE: Red mit im Live-Chat
  ja:    ライブチャットで talk back
  pt-BR: Troca ideia no chat ao vivo
  es-MX: Echa rola en el chat en vivo
  fr-FR: Echange dans le chat en direct

Slot 3 - Reactions + shoutouts
  en-US: React live and catch shoutouts
  de-DE: Reagiere live, hol dir Shoutouts
  ja:    リアルタイムでリアクション&shoutout
  pt-BR: Reaja ao vivo e receba shoutouts
  es-MX: Reacciona en vivo y recibe shoutouts
  fr-FR: Reagis en direct, recois des shoutouts

Slot 4 - Giveaways
  en-US: Win live giveaways from the booth
  de-DE: Gewinne Live-Giveaways aus dem Studio
  ja:    ブースからのライブプレゼント企画
  pt-BR: Ganhe sorteios ao vivo da cabine
  es-MX: Gana sorteos en vivo desde la cabina
  fr-FR: Gagne des jeux concours en direct

Slot 5 - Profile / community (badges + leaderboard)
  en-US: Earn badges, climb the leaderboard
  de-DE: Sammle Badges, klettr im Ranking
  ja:    バッジを集めてランキングを上げよう
  pt-BR: Ganhe badges e suba no ranking
  es-MX: Gana badges y sube en el ranking
  fr-FR: Gagne des badges, grimpe au classement

Slot 6 - Schedule
  en-US: Never miss your weekly show
  de-DE: Verpass keine Show der Woche
  ja:    毎週の番組を見逃さない
  pt-BR: Nao perca o seu programa da semana
  es-MX: No te pierdas tu programa semanal
  fr-FR: Ne rate plus ton emission de la semaine

---

# D. KEYWORD RESEARCH NOTES

Search terms real hip hop radio listeners use, by market, for ongoing iteration.
Name+subtitle already index "Reeboot Radio", "Hip Hop", "Live", "Rap", "R&B", "DJ",
"Streams" on Apple - so the keyword field deliberately avoids those.

US (en-US)
- reboot radio - HIGH PRIORITY misspelling capture; users type "reboot" not "reeboot",
  and a competitor owns the clean "reboot radio" term. Worth a slot to intercept the typo.
- mixtape - core hip hop discovery term, evergreen
- old school - large throwback-hip-hop search intent
- urban - still a common iTunes/Play genre label users search
- beats / freestyle / turntable - producer/DJ-culture adjacency
- trap - dominant modern subgenre, high volume
- soul - pairs R&B listeners into the funnel
- throwback - companion to old school, distinct search
- hip hop station / fm radio - generic radio-intent terms that convert
- talk - some hip hop stations carry talk segments; low effort coverage

DE (de-DE)
- deutschrap - THE dominant German hip hop search term, must-have
- strassenrap - high-volume German subgenre
- oldschool (one word) - Germans search it unspaced
- sender / radio - generic German radio intent
- beats / charts / playlist - discovery adjacency
- trap / soul - shared global subgenre terms
- musik - broad anchor
  Reasoning: German hip hop search is dominated by native scene terms (deutschrap,
  strassenrap). English "hip-hop" is also used (hence kept in subtitle), but the
  keyword field should carry the German-scene vocabulary the title can't.

JP (ja-JP)
- ヒップホップ / ラップ - katakana genre primaries, highest volume
- アールアンドビー - R&B in katakana, captures non-Latin searchers
- ミックステープ (mixtape) / オールドスクール (old school) - culture terms in katakana
- ビート (beat) / フリースタイル (freestyle) - DJ/producer adjacency
- ラジオ (radio) / DJ - generic intent
- ソウル (soul) - R&B funnel
- trap (Latin, used as-is in JP) - modern subgenre
- reboot (Latin) - typo capture also works on JP keyboards
  Reasoning: Japanese users mix katakana loanwords with Latin genre tags. Katakana
  forms are essential because many users never type the Latin spelling.

BR (pt-BR)
- rap nacional - THE dominant Brazilian hip hop search term, must-have
- batidas (beats) / freestyle - production/cypher culture
- old school / throwback - used in Portuguese too
- trap - huge in BR scene
- soul - R&B adjacency
- estacao / radio / fm - generic Brazilian radio intent
- toca (as in "toca aqui"/now playing) - colloquial discovery
- musica - broad anchor
- reboot - typo capture
  Reasoning: "rap nacional" is non-negotiable for Brazil; it's how the scene
  self-identifies. "ao vivo" already lives in the subtitle so it's omitted from keywords.

ITERATION NOTE: After 2-3 weeks live, pull Apple Search Ads "Search Match" /
App Store Connect impression data and Play Console "user acquisition - search terms"
to replace the weakest 2-3 guesses per locale with observed real queries. Re-balance
the "reboot" typo slot if it under- or over-indexes.

---

# CHAR-LIMIT COMPLIANCE SUMMARY

Apple name: 28/30 all locales (brand, not translated). PASS.
Apple subtitle: en 26, de 26, ja 18, pt 21, es 21, fr 24 (all <=30). PASS.
Apple keywords: en 98, de 94, ja 69, pt 98, es 95, fr 97 (all <=100). PASS.
Apple promotionalText: en 124, de 130, ja 70, pt 120, es 130, fr 137 (all <=170). PASS.
Play title: 28/30 all locales. PASS.
Play shortDescription: en 69, de 69, ja 37, pt 71, es 66, fr 73 (all <=80). PASS.
All descriptions well under 4000.

Note on character counting: CJK (ja) counts each character as 1 in both Apple and Play
fields, which is why Japanese fields show low numbers - they are full strings, not short.
