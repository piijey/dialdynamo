import { EventEmitter } from 'events';

const messageEmitter = new EventEmitter();

export const useMessageSynthesizer = () => {
    const simulateResponse = (message) => {
        if (message.role === 'transcript' && message.status === 'final') {
            // タイムアウトで確定したテキストはユーザーメッセージとして表示する
            message.role = 'user';
            messageEmitter.emit('message', message); //MessageHandlerへ送信

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
