import React, {useRef, useEffect} from 'react';
import { useMessageHandler } from './MessageHandler';
import { useSpeechRecognitionHandler } from './SpeechRecognitionHandler';
import { useMessageSynthesizer} from './MessageSynthesizer';
import { Container, Row, Col, Button} from 'react-bootstrap';
import { RiUser5Line, RiRobot2Line } from "react-icons/ri";
import './App.css';

// 全体 Let's have a dynamic dialogue!
const App = () => {
  const { simulateResponse, messageEmitter } = useMessageSynthesizer();
  const { messages, sendMessage, websocketStatus } = useMessageHandler(simulateResponse, messageEmitter);
  const { transcript, listening, browserSupportsSpeechRecognition, isMicOn, handleMicOnOff } = useSpeechRecognitionHandler(sendMessage);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // メッセージをレンダリング
  const renderMessageTexts = () => {
    return (
        <div className="d-grid gap-1">
      {messages.map((item, index) => (
      <div key={index}>
        <Row className="align-items-center">
          <Col sm={1} className='col-icon'><div className="message-icon">{item.role === 'system' ? <RiRobot2Line/> : null}</div></Col>
          <Col sm={10} className={`col-text p-2 rounded-3 ${item.role}-messagebox`}>{item.text}</Col>
          <Col sm={1} className='col-icon'><div className="message-icon">{item.role === 'user' ? <RiUser5Line/> : null}</div></Col>
        </Row>
        </div>
      ))}
      </div>
    );
  };

  // 最新のメッセージにスクロールする
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
  <div className="app">
    <Container className="p-1 mb-1 title">
      <h1>DialDynamo</h1>
      爆速AIチャットで盛り上がりたいわね【AI準備中】
    </Container>
    <hr className='hr'/>
    <Container className="p-1 messages">
      {renderMessageTexts()}
      <div ref={messagesEndRef} />
    </Container>

    <hr className='hr'/>
    <Container className="p-1 control-panel">
      <Row>
        <Container className="p-1">
          <Row className="align-items-center">
            <Col> Websocket: { websocketStatus }</Col>
            <Col> Microphone: {listening ? 'on' : 'off'} </Col>
            <Col className="text-end">
              {isMicOn ? (
              <Button variant="danger" onClick={handleMicOnOff}>とめる</Button>
            ) : (
              <Button variant="primary" onClick={handleMicOnOff}>はじめる</Button>
              )}
            </Col>
          </Row>
        </Container>
      </Row>
    </Container>
    <Container className="p-1 transcript">
      {transcript}
    </Container>
    <Container className="p-1 footer">
      <a href="https://github.com/piijey/dialdynamo">このページのソースコードを見る (GitHub)</a>
    </Container>
  </div>
  );
};

export default App;
