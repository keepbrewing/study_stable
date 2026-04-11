import { useState, useEffect, useRef } from "react";
import axios from "axios";
import BreakScreen from "./BreakScreen";
import { useCallback } from "react";

export default function GameEngine({
    t,
    stimuli,
    participantId,
    isPaused,
    onFinish
}) {

    // STATE
    const [index, setIndex] = useState(0);
    const [showText, setShowText] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [phase, setPhase] = useState("practice");
    const [showModal, setShowModal] = useState(true);

    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const clickedRef = useRef(false);

    // CONFIG
    const IMAGE_TIME = 10000;
    const TEXT_TIME = 15000;

    // HELPERS
    const clearTimer = () => clearTimeout(timerRef.current);

    const startTimer = (cb, delay) => {
        clearTimer();
        timerRef.current = setTimeout(cb, delay);
    };

    // LOG
    const logResponse = async (stimulus) => {
        if (!stimulus?.category || !stimulus?.word) return;
        console.log(stimulus);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/response/log`, {
                participantId,
                data: {
                    stage: "gonogo",
                    category: stimulus.category,
                    value: stimulus.word
                }
            });
        } catch (err) {
            console.error("GONOGO LOG ERROR", err);
        }
    };

    // CLICK
    const handleClick = () => {
        if (clickedRef.current) return;

        clickedRef.current = true;
        setClicked(true);

        logResponse(stimuli[index]);
    };

    const handleBreak1End = useCallback(() => {
        setPhase("trial1");
        setIndex(4);
    }, []);

    const handleBreak2End = useCallback(() => {
        setPhase("trial2");
        setIndex(8);
    }, []);

    const handleBreak3End = useCallback(() => {
        setPhase("trial3");
        setIndex(12);
    }, []);

    // FLOW
    useEffect(() => {
        if (isPaused || showModal) return;

        const stimulus = stimuli[index];

        // HARD RESET BEFORE NEW STIMULUS
        clearTimer();
        setShowText(false);
        setClicked(false);
        clickedRef.current = false;

        // small delay prevents text flash bug
        const initDelay = setTimeout(() => {

            startTimeRef.current = Date.now();

            // IMAGE ONLY
            startTimer(() => {
                setShowText(true);

                // IMAGE + TEXT
                startTimer(() => {

                    moveNext();

                }, TEXT_TIME);

            }, IMAGE_TIME);

        }, 50);

        return () => {
            clearTimer();
            clearTimeout(initDelay);
        };

    }, [index, isPaused, showModal]);

    // MOVE NEXT
    const moveNext = () => {

        const nextIndex = index + 1;

        // PRACTICE DONE (0–3)
        if (phase === "practice" && nextIndex === 4) {
            clearTimer();
            setPhase("break1");
            return;
        }

        // TRIAL 1 DONE (4–7)
        if (phase === "trial1" && nextIndex === 8) {
            clearTimer();
            setPhase("break2");
            return;
        }

        // TRIAL 2 DONE (8–11)
        if (phase === "trial2" && nextIndex === 12) {
            clearTimer();
            setPhase("break3");
            return;
        }

        // TRIAL 3 DONE (12–15)
        if (phase === "trial3" && nextIndex === 16) {
            onFinish();
            return;
        }

        setIndex(nextIndex);
    };

    // BREAK SCREENS
    if (phase === "break1") {
        return (
            <BreakScreen
                text={t.gonogo?.breakReady || "Get ready for the game"}
                duration={5}
                onNext={handleBreak1End}
            />
        );
    }

    if (phase === "break2") {
        return (
            <BreakScreen
                text={t.gonogo?.breakRest || "Take a small break"}
                duration={10}
                onNext={handleBreak2End}
            />
        );
    }

    if (phase === "break3") {
        return (
            <BreakScreen
                text={t.gonogo?.breakRest || "Take a small break"}
                duration={10}
                onNext={handleBreak3End}
            />
        );
    }

    const stimulus = stimuli[index];

    return (
        <div className="affect-content">

            {/* PRACTICE MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <p>{t.gonogo?.practice || "This is a practice trial"}</p>
                        <button
                            className="primary-btn active"
                            onClick={() => setShowModal(false)}
                        >
                            {t.gonogo?.start || "Start"}
                        </button>
                    </div>
                </div>
            )}

            {/* IMAGE */}
            <div className="gonogo-img" onClick={handleClick}>
                <img src={stimulus.path} alt="" />
            </div>

            {/* TEXT */}
            {showText && <p>{stimulus.word}</p>}

            {/* FEEDBACK */}
            {clicked && <div className="affect-feedback">✔</div>}

        </div>
    );
}