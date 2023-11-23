from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
from datetime import timedelta, datetime, timezone
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
TIMEOUT = 0.5 #(秒)
TIME_DELTA = timedelta(seconds=TIMEOUT) #前回のメッセージとの時間差の閾値

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    prev_transcript = Message() #直前の入力内容
    messages = [] #過去の入力内容
    try:
        await websocket.accept()
        while True:
            user_message = Message()
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=TIMEOUT)
                transcript = Message(role="transcript", **json.loads(data))
                print(f"transcript:\t{transcript.timestamp} {transcript.text}")
                user_message, messages = process(transcript, prev_transcript, messages, TIME_DELTA)
                prev_transcript = transcript
            except asyncio.TimeoutError: #TIMEOUT秒間ユーザ入力がないとき、ユーザ入力を確定する
                timeout_message = Message(role="timeout", timestamp=datetime.now(timezone.utc))
                user_message, messages = process(timeout_message, prev_transcript, messages, TIME_DELTA)
            except json.JSONDecodeError as e:
                print(f"server.py JSONのデコードに失敗: {e}")
            if user_message.text:
                print(f"user_message:\t{user_message.timestamp} {user_message.text}")
                await websocket.send_text(user_message.model_dump_json())
    except WebSocketDisconnect as e:
        print(f"server.py Websocketの接続に失敗: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
