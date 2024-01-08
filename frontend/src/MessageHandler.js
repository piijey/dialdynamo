import { useState, useEffect } from 'react';

export const useMessageHandler = (simulateResponse, messageEmitter) => {
    const [ws, setWs] = useState(null);
    const [websocketStatus, setWebsocketStatus] = useState('disconnected');
    const [messages, setMessages] = useState([]);

    // WebSocketの初期化と接続試行
    useEffect(() => {
        const websocket = new WebSocket('ws://127.0.0.1:8000/ws');
        websocket.onopen = () => {
            console.log('WebSocket Connected');
            setWebsocketStatus('connected');
        }
        websocket.onmessage = (event) => {
            console.log(`Received message: ${event.data}`);
            setMessages(prev => [...prev, JSON.parse(event.data)]);
        }
        websocket.onclose = () => {
            console.log('WebSocket Disconnected');
            setWebsocketStatus('disconnected');
        }
        websocket.onerror = (event) => {
            console.error('WebSocket Error', event);
            setWebsocketStatus('error');
        }
        setWs(websocket);
        return () => {
            websocket.close();
            setWebsocketStatus('disconnected')
        }
    }, []);


    //初期メッセージ
    useEffect(() => {
        let initialSystemMessage = { role: 'system', text: '「はじめる」ボタンを押してしゃべってね', timestamp: new Date().toISOString(), status: null }
        setMessages(prev => [...prev, initialSystemMessage]);
    }, []);


    //ユーザーメッセージをバックエンドへ送信する
    const sendMessage = (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Websocket接続中は、バックエンドへメッセージを送信
            ws.send(JSON.stringify(message));
        } else {
            // Websocketに接続されていない時は、フロントエンドのsimulateResponseへ送る
            simulateResponse(message);
        }
    };

    // Websocketに接続されていない場合は、simulateResponse が発行するイベントをリッスンする（websocket.onmessage の代わり）
    useEffect(() => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            const handleMessage = (newMessage) => {
                setMessages(prev => [...prev, newMessage]);
            };
            
            messageEmitter.on('message', handleMessage);
        
            return () => {
                //コンポーネントがアンマウントされる際にイベントリスナーを削除
                messageEmitter.off('message', handleMessage);
            };
        };
    }, [messageEmitter]);

    return { messages, sendMessage, websocketStatus };
};
