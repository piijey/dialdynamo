from datetime import datetime, timezone
from backend.models import Message


def request_generate(user_message: Message) -> Message:
    """ システムの返事を生成する """
    system_message = Message(
        role = "system",
        text = "ぴぇぴぇ",
        timestamp = datetime.now(timezone.utc)
    )
    return system_message

def test():
    import json
    test_message = Message(role="user", text="こんにちは", timestamp=datetime.now(timezone.utc))
    test_response = request_generate(test_message)
    print(test_response)


if __name__ == "__main__":
    ## 単体で実行するためには
    ## python -m backend.generate_response
    test()
