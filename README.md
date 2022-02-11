# ニュースシェアアプリの GraphQL サーバー

## コンセプト

- 認証無しで誰でも投稿はできる(いたずら防止策は必要？流石にいらなそうだけど、一度でも起きたら要検討)
- それか、slack ログイン必須にするのはアリ。
- 基本的に url のみで投稿でき、そこからスクレイピングしてタイトルなどを表示
- 認証済みの運営陣はニュースの更新、削除といったすべての処理ができる(いたずらやミス防止のため)

## 実装済み(バックエンド)

- [x] ニュースの作成(投稿)
  - [x] URL のみで投稿でき、その URL にリクエスト投げて OGP 用の title, description, imageUrl を取得し保存
  - [x] Rust でスクレイピングして meta データを取得、DB へ保存
  - [x] 403 などの認証が必要な場合の対応(多分やったはず、要動作確認)

## 欲しい機能(?)

- ニュースを明日へ延期する(多い場合やイベント時など)
  - [x] 単体のニュースの更新(日付、タイトル、概要、ニックネーム、シェアする日時等)
  - [x] 複数選択や、一括で更新
    - サロンのカレンダーを取り込んで自動で延期？でもそうするとカレンダーの信用性とか色々必要になってくる
    - 別でサロンのカレンダーアプリ的なの会っても面白いかも。カレンダーつくれて Slack に投稿もできる
- [x] ニュースの削除(運営のみ)
- [ ] 運営用メールアドレスの追加とか？
  - Slack 認証にする場合とかはいいかも。それで User モデルの Role の enum 変更してとかよさそう
- [ ] Slack チャンネルへの送信 https://app.slack.com/block-kit-builder/
  - https://github.com/SlackAPI/node-slack-sdk これ使って Slack アプリ？作ったりなんかやるのもありかも(殆ど使わなそうだけど)
  - Google 認証実装したいから、運営＆自分のみ延期できるよう、メールアドレスとかハードコードして認証済みの人のみ Slack 通知できる
  - もしくは、時間になったら自動で毎日送信？
    - アーカイブ動画の URL とか、連絡事項(メッセージ)も一緒に送れると良いかも？
- [ ] 過去のニュースを日付やタイトルで検索できる機能
  - [x] 日付で検索
  - [ ] タイトルや概要で検索(Prisma に full-text-search あるからそれ使う)
- [ ] ニュースの本文の文字の数とかから何分で読み終わるか的なやつ(いらないかもなので検討)
- [ ] ニュースシェアを開始するを押してからニュースへ飛ぶと、その日見たニュースとまだ見てないニュースで分かれるてきな？
  - その日どのニュースをまだ話してないか見やすくする(これも要検討)
- (却下済み)保存するのは URL だけにして、表示時に URL へリクエストして取得して返すでも良いかも(タイトルとか概要で検索したいので DB に持たせる)

## 個人的にやりたいこととか(フロント含む)

- 認証のチェックはデコレーター実装してやりたい。TS はデフォでサポートしてないらしいから調べる
- ログインと新規登録の口は一緒にする
- 重複した URL の登録を許容するけど、フロント側で警告とか何回目かをだしたい
- kbar ってライブラリ使っていい感じにカスタマイズとかできたらかっこいいからしたい（フロント）
- Rust 練習のために WASM 使う
- バグ、機能追加の要望フォームとか、GitHub の URL もおいとく

## 起動

.env に Google の API キーなど がある前提

1. DB の起動

```bash:terminal
docker-compose up
```

2. Web サーバーの起動

```bash:terminal
npm run dev
```

## メモ

/src/generated/schema.graphql を Apollo Studio が参照している（/src/schema.ts を参照）
