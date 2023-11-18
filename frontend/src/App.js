import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

// マイクの音声を書き起こす
const Dictaphone = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  //ブラウザの音声認識が利用できないとき
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // transcript が更新されるたびに実行
  useEffect(() => {
    if (transcript) {
      const timestampedData = {
        text: transcript,
        timestamp: new Date().toISOString() // ISO 8601形式のタイムスタンプ
      };
      // バックエンドに送信する関数を呼び出す
      sendToBackend(timestampedData);
    }
  }, [transcript]);

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      {listening ? (
        <><Button variant="danger" onClick={SpeechRecognition.stopListening}>とめる</Button></>
      ) : (
        <><ButtonGroup aria-label="when not listening">
        <><Button variant="primary" onClick={() => SpeechRecognition.startListening({ continuous: true })}>はじめる</Button>{' '}</>
        <><Button variant="secondary" onClick={resetTranscript}>リセット</Button></>
        </ButtonGroup></>
        )}
    <Container className="p-5 mb-4 bg-light rounded-3">
    <p>{transcript}</p>
    </Container>
    </div>
  );
};


// 書き起こしテキストをバックエンドへ送信
const sendToBackend = async (data) => {
  try {
    // fetch API を使用
    console.log(data);
    const response = await fetch('http://127.0.0.1:8000/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error('Error sending data to backend', error);
  }
};


// 全体 Let's have a dynamic dialogue!
const App = () => (
  <Container className="p-3">
    <h1 className="header">DialDynamo</h1>
    <Dictaphone />
  </Container>
);
export default App;
