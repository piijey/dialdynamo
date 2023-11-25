import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Stack from 'react-bootstrap/Stack';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { PiUser } from "react-icons/pi";
import { PiFlower } from "react-icons/pi";

// マイクの音声を書き起こす
const Dictaphone = () => {
  const [ws, setWs] = useState(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [messageTexts, setMessageTexts] = useState([]); //チャットの履歴

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
      setMessageTexts(messageTexts => [...messageTexts, JSON.parse(event.data)]);
    };
    websocket.onclose = (event) => { console.log('WebSocket Disconnected', event) };
    websocket.onerror = (event) => { console.error('WebSocket Error', event)};
    setWs(websocket);
    return () => {
      websocket.close();
    };
  }, []);  

  // 自動タイムアウト設定
  const [timeoutId, setTimeoutId] = useState(null);
  useEffect(() => {
    if (listening && transcript) {
      clearTimeout(timeoutId);
      const newTimeoutId = setTimeout(() => {
        console.log("client timeout", transcript)
        resetTranscript();
        ws.send(JSON.stringify({
          text: transcript,
          timestamp: new Date().toISOString()
        }));
      }, 5000); // 5秒後にタイムアウト
      setTimeoutId(newTimeoutId);
    }
  }, [transcript, listening, ws]);


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
  const renderMessageTexts = () => {
    const userMessageStyle = {
      color: '#333'
    };
  
    const systemMessageStyle = {
      backgroundColor: '#ffe7ba',
      color: '#333'
    };

    return (
      messageTexts.map((item, index) => (
        <Container
        md='auto'
        key={index}
        style={item.role === 'user' ? userMessageStyle : systemMessageStyle}
        className={item.role === 'user' ? "rounded-2" : "p-2 mb-1 rounded-2"}
      >
        {item.role === 'user' ? (
          <Stack direction="horizontal" gap={2}>
            <div className="p-2"><PiUser size="1.5em"/></div>
            <div className="p-2">{item.text}</div>
          </Stack>
        ):(
          <Stack direction="horizontal" gap={2}>
          <div className="p-2 ms-auto"> {item.text} </div>
          <div className="p-2"><PiFlower size="1.5em"/></div>
        </Stack>
        )}
      </Container>
    )
    ));
  };

  const messageStyles = {
    height: '500px',
    overflowY: 'scroll',
    backgroundColor: '#f0f0f0'
  };

  // websocket の状態を表示
  const getWebSocketStatus = (ws) => {
    if (!ws) {
      return 'disconnected';
    }
    switch (ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting...';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
        return 'closing...';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  };
  
  return (<>
      <Container className="header">
      <Row><Container className="p-2">
        <Row className="align-items-center">
        <Col> Websocket: { getWebSocketStatus(ws) }</Col>
        <Col> Microphone: {listening ? 'on' : 'off'} </Col>
        <Col className="text-end">
          {listening ? (
          <><Button variant="danger" onClick={SpeechRecognition.stopListening}>とめる</Button></>
        ) : (
          <><ButtonGroup aria-label="when not listening">
          <><Button variant="secondary" onClick={resetTranscript}>リセット</Button></>
          <><Button variant="primary" onClick={() => SpeechRecognition.startListening({ continuous: true })}>はじめる</Button></>
          </ButtonGroup></>
          )}
        </Col></Row>
      </Container></Row>
      <Row><Container className="p-2">
      <Accordion defaultActiveKey="0" flush>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Transcript</Accordion.Header>
        <Accordion.Body>{transcript}</Accordion.Body>
      </Accordion.Item></Accordion>
      </Container></Row>
      </Container>
      <div style={messageStyles}>
        {renderMessageTexts()}
      </div>
    </>);
};


// 全体 Let's have a dynamic dialogue!
const App = () => (
  <Container className="p-3">
    <h1 className="header">DialDynamo</h1>
    <Dictaphone />
  </Container>
);
export default App;
