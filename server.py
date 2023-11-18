from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel

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

class TextData(BaseModel):
    text: str
    timestamp: str

@app.post('/process')
async def process_text(data: TextData):
    print(f"{data.timestamp}\t{data.text}")
    # テキスト処理のロジックをここに記述する
    return {"message": "Processed", "data": data}
