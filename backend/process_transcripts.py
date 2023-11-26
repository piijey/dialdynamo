from datetime import datetime, timedelta
from backend.models import Message
from typing import Optional, Tuple

# ユーザ入力テキスト(transcript)をタイムアウトに基づいて確定する
# タイムアウトを変更する場合は server.py の USER_TIMEOUT で設定すること
TIME_DELTA = timedelta(milliseconds=500) #前回のメッセージとの時間差の閾値（デフォルト値）

def get_segment(current: Message, prev: Message, time_delta: timedelta) -> Message:
    """
    直前のリクエストから time_delta 以上経過していれば、確定とみなして直前のtranscriptを返す
    current: 最新の transcript
    prev: 直前の transcript
    """
    segment = Message()
    if prev.timestamp:
        time_diff = current.timestamp - prev.timestamp
        #print(f"{current.timestamp}\t{current.text}\t{time_diff}\t{time_diff > time_delta}")
        if time_diff > time_delta:
            segment = Message(role="user", text=prev.text, timestamp=prev.timestamp)
    return segment


def process(current: Message, prev: Message, message_list: list, time_delta: Optional[timedelta] = TIME_DELTA) -> Tuple[Message, list]:
    """
    ユーザ入力テキスト(transcript)をタイムアウトに基づいて確定する
    current: transcript (最新)
    prev: transcript (直前)
    message_list: 確定履歴
    segment: ユーザ入力テキストの確定部分
    """
    segment = get_segment(current, prev, time_delta) #確定した transcript
    if segment.text is None:
        # 確定しない場合、segment, message_list は変更なし
        pass
    else:
        # segment から、新たに追加された文字列を抜きだす
        for m in message_list:
            segment.text = segment.text.removeprefix(m.text).strip()
        message_list.append(segment)
    return segment, message_list


def test():
    import json
    testfile = "dialdynamo_note/231118_text_frontend.txt"
    prev = Message()
    messages = []
    with open(testfile, "r") as f:
        for line in f:
            timestamp, text = line.strip("\n").split("\t")
            current = Message(role="transcript", text=text, timestamp=timestamp)
            if prev.timestamp:
                segment, messages = process(current, prev, messages, timedelta(milliseconds=500))
                if segment.text:
                    print(f"SEGMENT: {segment.text}")
            prev = current


if __name__ == "__main__":
    ## 単体で実行するためには
    ## python -m backend.process_transcripts
    test()
