# DialDynamo
爆速AIチャットで盛り上がりたいわね（作成中のため、まだAIはいません）

公開中のデモサイト（フロントエンドのみ）は [こちら](https://piijey.github.io/chat/)

## 構成
ドキュメント・進捗状況のメモは、`progress/` にあります
```
┌─────────────────────┐
│  React Front-end    │
│  (localhost:3000)   │
│      frontend/      │
└──────────┬──────────┘
           │ Websocket
┌──────────┴──────────┐
│  Python Back-end    │
│  uvicorn, fastAPI   │
│  (127.0.0.1:8000)   │
│ server.py, backend/ │
│  ※ なくても動作します  │
└──────────┬──────────┘
           │ 今後追加予定
┌──────────┴──────────┐
│         ...         │
```

## 起動手順
### 事前準備
- nodejs    20.8.1
- python    3.11.6

*開発環境は、macOS 14.x (Sonoma), Google Chromeです*

### フロントエンド
- React で書いています
- 音声認識は、[react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition) でブラウザの音声入力を利用します
- ボタンを見やすくするために [react-bootstrap](https://react-bootstrap.netlify.app/) を入れています

**インストール**
```sh
cd frontend
npm install
```

**開発用サーバの起動**
```sh
npm start
```
`http://localhost:3000` で立ち上がります

### バックエンド
- Python で書いています
- FastAPI サーバでユーザ入力テキストを受け取ります
- サーバの起動には uvicorn を使います

**インストール**
```sh
pip install -r requirements.txt
```

**開発用サーバの起動**
```sh
uvicorn server:app --reload
# uvicorn server:app --reload --log-level="debug" #デバッグログを表示
```
`http://127.0.0.1:8000` で立ち上がります


## 使い方
**バックエンドサーバがない場合**
1. フロントエンドを `npm start` で起動し、ブラウザで `http://localhost:3000` にアクセスします
- または、[https://piijey.github.io/chat/](https://piijey.github.io/chat/) で公開中のページにアクセスします
2. 「はじめる」ボタンを押して何か話すと、音声認識中のテキストが下部のボックスに表示されます
3. 音声認識されたテキストはフロントエンド内部で処理され、その結果がメッセージ欄に表示されます

**バックエンドサーバがある場合**
1. フロントエンドとバックエンドの両方を起動した状態で、ブラウザで `http://localhost:3000` にアクセスします
2. 「はじめる」ボタンを押して何か話すと、音声認識中のテキストが下部のボックスに表示されます
3. 音声認識されたテキストはバックエンドへ送られて処理され、その結果がメッセージ欄に表示されます

## フロントエンドについて
- `frontend/src/App.js`: 本体
- `MessageHandler.js`: Websocket接続、メッセージをバックエンドへ/から送受信（バックエンド不使用時はフロントエンドの`MessageSynthesizer`へ/から）
- `MessageSynthesizer.js`: バックエンド不使用時にメッセージを処理
- `SpeechRecognitionHandler.js`: 音声認識を扱う

## バックエンドについて
[./progress/231126_backend_process_transcripts.md](./progress/231126_backend_process_transcripts.md)

## Websocket メッセージ仕様
フロントエンドとバックエンドの間でやりとりされるメッセージは、JSON形式で次のようになっています
```json
{
    "role": "transcript",
    "text": "こんにちは",
    "timestamp": "2023-11-16T13:54:55.198Z",
    "status": "final"
}
```
- `"role"`: メッセージの送信者
    - `"transcript"`: 音声認識されたテキスト（フロントエンドからバックエンドへ送信）
    - `"user"`: 処理済みのユーザーメッセージ（画面のメッセージ欄に表示する）
    - `"system"`: システムのメッセージ（画面のメッセージ欄に表示する）
- `"status"`: メッセージの送信者が "transcript" の場合に使用する
    - `"stream"`: タイムアウトを待たずに送信された
    - `"final"`: タイムアウトで送信された
    - `"null"`: メッセージの送信者が "transcript" 以外の場合

## 今後の予定
- 音声読み上げ
- フロントエンドのみで動作する場合のテキスト処理のロジックを追加
- バックエンドのテキスト処理を追加、AIをお迎え（API利用？）
