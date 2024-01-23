import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useSpeechRecognitionHandler = (sendMessage) => {
    const [isMicOn, setIsMicOn] = useState(false);
    const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [timeoutId, setTimeoutId] = useState(null);
    const [transcriptToSend, setTranscriptToSend] = useState('');

    // マイクのオンオフ
    function handleMicOnOff() {
        setIsMicOn(!listening)
        if (listening) {
            SpeechRecognition.stopListening();
        }
        else {
            SpeechRecognition.startListening({ continuous: true });
        }
    }
    // transcript が更新されるたびにサーバへ送信
    useEffect(() => {
        if (transcript) {
            sendMessage({ role: 'transcript', text: transcript, timestamp: new Date().toISOString(), status: 'stream' });
        }
    }, [transcript]);

    // 書き起こしテキストが一定時間以上更新されないとき、バックエンドへ送信するテキスト(transcriptToSend)にコピーしておいてtranscriptをリセットする
    // transcriptのリセットを送信前に行うのは、送信中にもtranscriptが更新される可能性があるため
    // しかし依然としてタイムアウト直後に話し始めの音声が認識されない場合があり、未解決
    useEffect(() => {
        if (transcript) {
        clearTimeout(timeoutId);
        const newTimeoutId = setTimeout(() => {
            setTranscriptToSend(transcript);
            resetTranscript();
        }, 2000); // 2秒タイムアウトで実行
        setTimeoutId(newTimeoutId);
        }
    }, [transcript, listening]);

    useEffect(() => {
        if (transcriptToSend) {
            sendMessage({ role: 'transcript', text: transcriptToSend, timestamp: new Date().toISOString(), status: 'final' });
            setTranscriptToSend('');
        }
    }, [transcriptToSend]);

    return { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicOn, handleMicOnOff };
};
