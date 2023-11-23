from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from backend.models import Message
from backend.process_transcripts import process

app = FastAPI()

# Reactアプリ (localhost:3000) とFastAPIサーバ (127.0.0.1:8000) のドメインが異なるので
# CORS（Cross-Origin Resource Sharing）ポリシーに基づいてアクセスが制限されるため
# FastAPIのミドルウェアでCORSを許可する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Reactアプリからのリクエストを許可する
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのHTTPヘッダーを許可
)

# 設定
from datetime import timedelta
TIME_DELTA = timedelta(milliseconds=500) #前回のメッセージとの時間差の閾値

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    prev_transcript = Message()
    user_message = Message()
    try:
        await websocket.accept()
        while True:
            try:
                data = await websocket.receive_text()
                transcript = Message(role="transcript", **json.loads(data))
                print(f"transcript:\t{transcript.timestamp} {transcript.text}")
                user_message = process(transcript, prev_transcript, TIME_DELTA)
                if user_message.text:
                    print(f"user_message:\t{user_message.timestamp} {user_message.text}")
                    await websocket.send_text(user_message.model_dump_json())
                prev_transcript = transcript
            except json.JSONDecodeError as e:
                print(f"server.py JSONのデコードに失敗: {e}")
    except WebSocketDisconnect as e:
        print(f"server.py Websocketの接続に失敗: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
