from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
from datetime import timedelta, datetime, timezone
from backend.models import Message
from backend.process_transcripts import process
from backend.generate_response import request_generate

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
USER_TIMEOUT = 0.5 #(秒) ユーザ入力テキストメッセージを自動的に区切るための閾値
SYSTEM_TIMEOUT = 20 #(秒) システムが次の話をする

async def receive_transcript_input(websocket, model_input_queue):
    """
    文字起こしテキストをWebSocket経由で受け取り、タイムアウトに基づいてテキストを確定
    確定したテキストは、WebSocket経由でクライアント（フロントエンド）へ返し、応答生成モデルのキューに追加
    """
    prev_transcript = Message() #直前の入力内容
    messages = [] #過去の入力内容
    while True:
        user_message = Message()
        try:
            data = await asyncio.wait_for(websocket.receive_text(), timeout=USER_TIMEOUT)
            transcript = Message(role="transcript", **json.loads(data))
            user_message, messages = process(transcript, prev_transcript, messages, timedelta(seconds=USER_TIMEOUT))
            prev_transcript = transcript
        except json.JSONDecodeError:
            print(f"receive_transcript_input: JSONのデコードに失敗しました")
        except asyncio.TimeoutError:
            pass
        if user_message.text:
            await websocket.send_text(user_message.model_dump_json())
            model_input_queue.put_nowait(user_message) # モデルの入力キューにデータを追加


async def generate_system_response(model_input_queue, websocket):
    """ 応答を生成し、WebSocket経由でクライアント（フロントエンド）へ送信する """
    while True:
        try:
            # モデル入力キューからデータを取得（非同期）
            input_message = await asyncio.wait_for(model_input_queue.get(), timeout=SYSTEM_TIMEOUT)
            # ここでテキスト生成モデルへユーザ入力を送り、応答を生成する予定
            system_message = request_generate(input_message)
            #print(f"generate_system_response: {input_message.text} ==> {system_message.text}")
            # 生成した応答をWebSocket経由で送信
            await websocket.send_text(system_message.model_dump_json())
        except asyncio.TimeoutError:
            print("キュェー")
            #timeout_message = request_generate(timeout=True)
            #await websocket.send_text(system_message.model_dump_json())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        model_input_queue = asyncio.Queue()
        # 音声入力受信タスクと応答生成タスクを並行して実行
        await asyncio.gather(
            receive_transcript_input(websocket, model_input_queue),
            generate_system_response(model_input_queue, websocket)
        )
    except WebSocketDisconnect as e:
        print(f"WebSocket接続が切断されました: {e}")
    except Exception as e:
        print(f"WebSocket処理中にエラーが発生しました: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")
# python server.py または、uvicorn server:app --reload --log-level="debug" で立ち上げる
