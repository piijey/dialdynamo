# DialDynamo
爆速AI対話で盛り上がりたいわね（作成中のため、まだAIはいません）

## 事前準備
- nodejs    20.8.1
- python    3.11.6

*開発環境は、macOS Sonoma, Google Chromeです*

## 起動
構成
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
└──────────┬──────────┘
           │ 今後追加予定
┌──────────┴──────────┐
│         ...         │
```

### フロントエンド
- React で書いています
- 音声認識は、[react-speech-recognition](https://www.npmjs.com/package/react-speech-recognition) でブラウザの音声入力を利用します
- ボタンを見やすくするために react-bootstrap を入れています

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
1. フロントエンドとバックエンドの両方を起動した状態で、ブラウザで `http://localhost:3000` にアクセスします
2. 「はじめる」ボタンを押して何か話すと、音声認識されたテキストがブラウザで上側のボックスに表示されます
3. 音声認識されたテキストはバックエンドへ送られて処理され、その結果がブラウザブラウザで下側のボックスに表示されます

* 今後テキスト処理のロジックを作っていきます
