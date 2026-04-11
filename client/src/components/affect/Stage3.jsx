import { useState, useEffect, useRef } from "react";
import audioData from "../../content/audio/affect.json";

export default function Stage3({
    name,
    t,
    logResponse,
    onNext,
    isPaused
}) {
    const timerRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const recognitionRef = useRef(null);

    const [transcript, setTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [attempt, setAttempt] = useState(1);
    const [hasSpoken, setHasSpoken] = useState(false);
    const [completed, setCompleted] = useState(false);

    const MAIN_DELAY = 30000;
    const SILENCE_DELAY= 12000;

    const startTimer = (callback, delay = MAIN_DELAY) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(callback, delay);
    };

    // SPEECH
    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }

            setTranscript(text);

            if (text.trim().length > 0) {
                setHasSpoken(true);
                clearTimeout(silenceTimerRef.current);
            }
        };

        recognitionRef.current = recognition;
    }, []);

    // AUDIO
    const playAudio = () => {
        try {
            const key = attempt === 1 ? "q1" : "q2";
            const audio = new Audio(audioData["3"][key]);
            audio.play().catch(() => { });
        } catch { }
    };

    // RECORD
    const startRecording = () => {
        if (!recognitionRef.current) return;

        setTranscript("");
        setHasSpoken(false);
        setIsRecording(true);

        recognitionRef.current.start();

        silenceTimerRef.current = setTimeout(() => {
            if (!hasSpoken) handleNoSpeech();
        }, SILENCE_DELAY);
    };

    const stopRecording = async () => {
        if (!recognitionRef.current) return;

        recognitionRef.current.stop();
        setIsRecording(false);
        clearTimeout(silenceTimerRef.current);

        if (hasSpoken) {
            setCompleted(true);

            await logResponse({
                stage: "affect",
                subStage: "3",
                type: "speech",
                transcript: transcript.trim()
            });

            return;
        }

        handleNoSpeech();
    };

    const handleNoSpeech = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        setIsRecording(false);

        if (attempt === 1) {
            setAttempt(2);
            startTimer(() => onNext());
        } else {
            onNext();
        }
    };

    const handleProceed = () => {
        setCompleted(true);
        onNext();
    };

    // TIMER
    useEffect(() => {
        if (isRecording || completed || isPaused) return;

        if (attempt === 1) {
            startTimer(() => {
                setAttempt(2);

                startTimer(() => {
                    onNext();
                });
            });
        } else {
            startTimer(() => {
                onNext();
            });
        }

        return () => clearTimeout(timerRef.current);
    }, [attempt, isRecording, completed, isPaused]);

    return (
        <div className="affect-content">

            <h3>
                {(attempt === 1
                    ? t.affect?.["3"]?.q1
                    : t.affect?.["3"]?.q2
                )?.replaceAll("{name}", name)}
            </h3>

            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            <div className="affect-controls">
                <button onClick={startRecording} disabled={isRecording}>
                    {t.affect?.["3"]?.record}
                </button>

                <button onClick={stopRecording} disabled={!isRecording}>
                    {t.affect?.["3"]?.stop}
                </button>
            </div>

            <div className="affect-transcript">
                {transcript || t.affect?.["3"]?.listening}
            </div>

            {!isRecording && transcript && (
                <button className="primary-btn active" onClick={handleProceed}>
                    {t.affect?.["3"]?.proceed}
                </button>
            )}

        </div>
    );
}