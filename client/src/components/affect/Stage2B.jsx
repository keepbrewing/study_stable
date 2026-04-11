import { useState, useEffect, useRef } from "react";
import audioData from "../../content/audio/affect.json";

export default function Stage2B({
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
    const [hasResponded, setHasResponded] = useState(false);
    const [waitStage, setWaitStage] = useState(1);

    const timerRef = useRef(null);

    const MAIN_DELAY = 30000;

    const startTimer = (callback, delay = MAIN_DELAY) => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(callback, delay);
    };

    // AUDIO
    const playAudio = () => {
        try {
            const key = attempt === 1 ? "q1" : "q2";
            const audio = new Audio(audioData["2b"][key]);
            audio.play().catch(() => { });
        } catch (err) {
            console.error("Audio failed:", err);
        }
    };

    // TIMER LOGIC
    useEffect(() => {
        if (isPaused || hasResponded) return;

        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {

            if (waitStage === 1) {
                // move to second wait
                setWaitStage(2);
                setAttempt(2); // update UI text
            }

            else if (waitStage === 2) {
                // final fallback
                onNext("2c");
            }

        }, MAIN_DELAY);

        return () => clearTimeout(timerRef.current);

    }, [waitStage, isPaused, hasResponded]);

    // HANDLE CLICK
    const handleClick = async (value) => {
        if (!hasResponded) setHasResponded(true); // only first interaction

        const isCorrect = value === "sad";
        const responseTime = Date.now() - startTime;

        await logResponse({
            stage: "affect",
            subStage: "2b",
            type: "emoji",
            value,
            correct: isCorrect,
            attempt,
            responseTimeMs: responseTime
        });

        if (isCorrect) {
            clearTimeout(timerRef.current);

            setTimeout(() => {
                onNext("3"); // EXPLICIT
            }, 1200);

            return;
        }

        // wrong attempt
        setFeedback(t.affect?.["2b"]?.retry);

        setAttempt(prev => prev + 1);
        setStartTime(Date.now());
    };

    return (
        <div className="affect-content">

            {/* QUESTION */}
            <h3>
                {(attempt === 1
                    ? t.affect?.["2b"]?.q1
                    : t.affect?.["2b"]?.q2
                )?.replaceAll("{name}", name)}
            </h3>

            {/* AUDIO */}
            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            {/* EMOJIS */}
            <div className="emoji-grid">

                <button onClick={() => handleClick("sad")} className="emoji-btn">
                    <span className="emoji">😢</span>
                </button>

                <button onClick={() => handleClick("neutral")} className="emoji-btn">
                    <span className="emoji">😐</span>
                </button>

                <button onClick={() => handleClick("happy")} className="emoji-btn">
                    <span className="emoji">😊</span>
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