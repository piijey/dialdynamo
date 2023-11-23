from datetime import datetime, timedelta
from backend.models import Message
from typing import Optional, Tuple

TIME_DELTA = timedelta(milliseconds=500) #前回のメッセージとの時間差の閾値

def get_segment(current: Message, prev: Message, time_delta: timedelta) -> Message:
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


def process(current: Message, prev: Message, message_list: list, time_delta: Optional[timedelta] = TIME_DELTA) -> Tuple[Message, list]:
    """
    current: transcript (最新)
    prev: transcript (直前)
    segment: user ユーザ入力の最新の確定部分
    """
    segment = get_segment(current, prev, time_delta) #最新の確定した transcript
    if segment.text is None:
        # segment は Messageクラスの初期値のまま、message_list は変更なし
        pass
    else:
        # segment から、新たに追加された文字列を抜きだす
        for m in message_list:
            segment.text = segment.text.replace(m.text, "").strip()
        message_list.append(segment)
    return segment, message_list


def test():
    import json
    testfile = "dialdynamo_note/231118_text_frontend.txt"
    prev = Message()
    messages = []
    with open(testfile, "r") as f:
        for line in f:
            timestamp, text = line.strip().split("\t")
            current = Message(role="transcript", text=text, timestamp=timestamp)
            if prev.timestamp:
                segment, messages = process(current, prev, messages, timedelta(milliseconds=10))
                if segment.text:
                    print(segment.text)
            prev = current


if __name__ == "__main__":
    ## 単体で実行するためには
    ## python -m backend.process_transcripts
    test()
