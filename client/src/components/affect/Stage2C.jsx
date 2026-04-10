import { useState, useEffect, useRef } from "react";
import audioData from "../../content/audio/affect.json";

export default function Stage2C({
    name,
    t,
    isPaused,
    onNext,
    logResponse
}) {
    // STATE
    const [attempt, setAttempt] = useState(1);
    const [feedback, setFeedback] = useState("");
    const [startTime, setStartTime] = useState(Date.now());

    const timerRef = useRef(null);

    const startTimer = (callback, delay = 10000) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(callback, delay);
    };

    // AUDIO
    const playAudio = () => {
        try {
            const key = attempt === 1 ? "q1" : "q2";
            const audio = new Audio(audioData["2c"][key]);
            audio.play().catch(() => { });
        } catch (err) {
            console.error("Audio failed:", err);
        }
    };

    // TIMER
    useEffect(() => {
        if (isPaused) return;

        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {

            if (attempt === 1) {
                // move to retry question
                setAttempt(2);
            }

            else if (attempt === 2) {
                // final fallback → Stage 3
                onNext();
            }

        }, 10000);

        return () => clearTimeout(timerRef.current);

    }, [attempt, isPaused]);

    // ---------------- HANDLE CLICK ----------------
    const handleClick = async (value) => {
        const isCorrect = value === "sad";
        const responseTime = Date.now() - startTime;

        await logResponse({
            stage: "affect",
            subStage: "2c",
            type: "emoji",
            value,
            correct: isCorrect,
            attempt,
            responseTimeMs: responseTime
        });

        if (isCorrect) {
            setFeedback(t.affect?.["2c"]?.correct);
        } else {
            setFeedback(t.affect?.["2c"]?.retry);
            setAttempt(prev => prev + 1);
            setStartTime(Date.now());
            return;
        }

        clearTimeout(timerRef.current);

        setTimeout(() => {
            onNext(); // → Stage 3
        }, 800);
    };

    // ---------------- UI ----------------
    return (
        <div className="affect-content">

            {/* QUESTION */}
            <h3>
                {(attempt === 1
                    ? t.affect?.["2c"]?.q1
                    : t.affect?.["2c"]?.q2
                )?.replaceAll("{name}", name)}
            </h3>

            {/* AUDIO */}
            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            {/* EMOJIS + TEXT */}
            <div className="emoji-grid">

                <button onClick={() => handleClick("sad")} className="emoji-btn">
                    <span className="emoji">😢</span>
                    <span>{t.affect?.["2c"]?.sad}</span>
                </button>

                <button onClick={() => handleClick("neutral")} className="emoji-btn">
                    <span className="emoji">😐</span>
                    <span>{t.affect?.["2c"]?.neutral}</span>
                </button>

                <button onClick={() => handleClick("happy")} className="emoji-btn">
                    <span className="emoji">😊</span>
                    <span>{t.affect?.["2c"]?.happy}</span>
                </button>

            </div>

            {/* FEEDBACK */}
            {feedback && (
                <div className="affect-feedback">
                    {feedback}
                </div>
            )}

        </div>
    );
}