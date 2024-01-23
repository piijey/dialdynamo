import React, { useState, useEffect } from 'react';
import { EventEmitter } from 'events';
const messageEmitter = new EventEmitter();
var kuromoji = require("kuromoji");

export const useMessageSynthesizer = () => {
    const [userInputText, setUserInputText] = useState("");
    const [tokens, setTokens] = useState([]);
    const [tokenizer, setTokenizer] = useState(null);
  
    useEffect(() => { //アプリのマウント時にkuromojiトークナイザを初期化
        kuromoji.builder({ dicPath: process.env.PUBLIC_URL + '/kuromoji-dict/' }).build(function (err, buildTokenizer) { //dicPathで辞書のディレクトリを指定
          if (err) {
            console.log(err);
          } else {
            setTokenizer(buildTokenizer);
          }
        });
      }, []);

    useEffect(() => {
        tokens.map((token, index) => (
            console.log(token.surface_form)
        ))
    }, [tokens]);

    const simulateResponse = (message) => {
        if (message.role === 'transcript' && message.status === 'final') {
            // タイムアウトで確定したテキストはユーザーメッセージとして表示する
            message.role = 'user';
            messageEmitter.emit('message', message); //MessageHandlerへ送信

            const path = tokenizer.tokenize(message.text);
            setTokens(path); // トークナイズ結果をステートにセット
        
            // ここで今後、時間のかかる処理を行い、システムメッセージをMessageHandlerへ送信
            setTimeout(() => {
                const reply = 'うんうん'
                const systemMessage = { role: 'system', text: reply, timestamp: new Date().toISOString(), status: null };
                console.log(systemMessage.text)
                messageEmitter.emit('message', systemMessage);
            }, 1000);// 1秒後にシステムメッセージを生成
        }
        else {
            // ユーザーメッセージが未確定(ストリーミング)の場合
            if (Math.random() < 0.05) {
                const reply = ''.concat('ぴぇ、', message.text, "、ぴぇぴぇ");
                const systemMessage = { role: 'system', text: reply, timestamp: new Date().toISOString(), status: null };
                messageEmitter.emit('message', systemMessage);
              }
        }
    };
    return { simulateResponse, messageEmitter }
}
