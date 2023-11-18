# DialDynamo
爆速AI対話で盛り上がりたいわね

## 準備
- nodejs    20.8.1
- python    3.11.6

*開発環境は、macOS Sonoma, Google Chromeです*

### フロントエンド
- React で書いています
- 音声認識は、react-speech-recognition でブラウザの音声入力を利用します
- ボタンを見やすくするために react-bootstrap を入れています

**インストール・開発用サーバの起動**
```
cd frontend
npm install
npm start
```
`http://localhost:3000` で立ち上がります

### バックエンド
- Python で書いています
- FastAPI サーバでユーザ入力テキストを受け取ります
- サーバの起動には uvicorn を使います

**インストール・開発用サーバの起動**
```
pip install -r requirements.txt
uvicorn server:app --reload
```
`http://127.0.0.1:8000` で立ち上がります


## 使い方
1. フロントエンドとバックエンドの両方を起動した状態で、ブラウザで `http://localhost:3000` にアクセスします
2. 「はじめる」ボタンを押して何か話すと、音声認識されたテキストが、uvicorn を起動しているターミナルに出力されます

* 今後テキスト処理のロジックを作っていきます
