from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    role: Optional[str] = None # 'transcript': 書き起こしテキスト, 'user': セグメント済みユーザテキスト, 'system': システムの返事
    text: Optional[str] = None
    timestamp: Optional[datetime] = None
    status: Optional[str] = None # 'stream': タイムアウトを待たずに送信された, 'final': タイムアウトで送信された
