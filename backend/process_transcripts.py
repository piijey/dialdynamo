from datetime import datetime, timedelta
from backend.models import Message
from typing import Optional

TIME_DELTA = timedelta(milliseconds=500) #前回のメッセージとの時間差の閾値

def process(current: Message, prev: Message, time_delta: Optional[timedelta] = TIME_DELTA) -> Message:
    """
    以前のリクエストから TIME_DELTA 以上経過していれば、確定とみなして直前のユーザ入力を返す
    current: 最新の transcript
    prev: 直前の transcript
    """
    segment = Message()
    if prev.timestamp:
        time_diff = current.timestamp - prev.timestamp
        if time_diff > TIME_DELTA:
            segment = Message(role="user", text=prev.text, timestamp=prev.timestamp)
    return segment


def test():
    import json
    testfile = "dialdynamo_note/231118_text_frontend.txt"
    prev = Message()
    with open(testfile, "r") as f:
        for line in f:
            timestamp, text = line.strip().split("\t")
            current = Message(role="transcript", text=text, timestamp=timestamp)
            if prev.timestamp:
                segment = process(current, prev)
                if segment.text:
                    print(segment.text)
            prev = current


if __name__ == "__main__":
    ## 単体で実行するためには
    ## python -m backend.process_transcripts
    test()
