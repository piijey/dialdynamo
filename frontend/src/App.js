import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

// マイクの音声を書き起こす
const Dictaphone = () => {
  const [ws, setWs] = useState(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [userTexts, setUserTexts] = useState([]); //音声入力の履歴

  //ブラウザの音声認識が利用できないとき
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // websocket インスタンスの初期化、イベントハンドラの設定
  useEffect(() => {
    const websocket = new WebSocket('ws://127.0.0.1:8000/ws');
    websocket.onopen = () => {
      console.log('WebSocket Connected');
    };
    websocket.onmessage = (event) => { 
      console.log(`Received message: ${event.data}`);
      setUserTexts(userTexts => [...userTexts, JSON.parse(event.data)]);
    };
    websocket.onclose = (event) => { console.log('WebSocket Disconnected', event) };
    websocket.onerror = (event) => { console.error('WebSocket Error', event)};
    setWs(websocket);
    return () => {
      websocket.close();
    };
  }, []);  


  // transcript が更新されるたびにサーバへ送信
  useEffect(() => {
    if (transcript && ws && ws.readyState === WebSocket.OPEN) {
      // バックエンドへ送信する
      ws.send(JSON.stringify({
          text: transcript,
          timestamp: new Date().toISOString() // ISO 8601形式のタイムスタンプ
        }));
      }
  }, [transcript, ws]);

  // サーバから来たテキストをレンダリング
  const renderUserTexts = () => {
    return userTexts.map((item, index) => <p key={index}>{item.text}</p>);
  };


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
    <Container className="p-5 mb-4 bg-info rounded-3">
    <p>{transcript}</p>
    </Container>
    <Container className="p-5 mb-4 bg-light rounded-3">{renderUserTexts()}</Container>
    </div>
  );
};


// 全体 Let's have a dynamic dialogue!
const App = () => (
  <Container className="p-3">
    <h1 className="header">DialDynamo</h1>
    <Dictaphone />
  </Container>
);
export default App;
