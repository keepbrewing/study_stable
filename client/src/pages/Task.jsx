import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../index.css";
import Background from "../components/Background";

import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";
import audioData from "../content/audio/task.json";

export default function Task() {
    const navigate = useNavigate();
    const [lang, setLang] = useState("en");
    const t = lang === "en" ? en : bn;
    const stored = JSON.parse(localStorage.getItem("participant"));

    useEffect(() => {
        if (!stored) {
            navigate("/", { replace: true });
        }
    }, []);

    const recognitionRef = useRef(null);

    const [transcript, setTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("participant"));

        if (!stored) {
            navigate("/", { replace: true });
            return;
        }

        const check = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/participant/${stored.participantId}`
                );

                if (!res.data) {
                    navigate("/", { replace: true });
                    return;
                }

                // WRONG STAGE → REDIRECT
                if (res.data.nextStage !== "task") {
                    navigate(`/${res.data.nextStage}`, { replace: true });
                }

            } catch (err) {
                navigate("/", { replace: true });
            }
        };

        check();
    }, []);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let text = "";
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }

            setTranscript(text);

            if (text.trim().length > 0) {
                setHasSpoken(true);
            }
        };

        recognitionRef.current = recognition;
    }, []);

    // LOGGING 
    const logResponse = async (payload) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/response/log`, {
                participantId: stored.participantId,
                data: payload
            });
        } catch (err) {
            console.error("Task logging failed:", err);
        }
    };

    const playAudio = () => {
        try {
            const audio = new Audio(audioData.instruction);
            audio.play().catch(() => { });
        } catch { }
    };

    const startRecording = () => {
        if (!recognitionRef.current) return;

        setTranscript("");
        setHasSpoken(false);
        setIsRecording(true);

        recognitionRef.current.start();
    };

    const stopRecording = () => {
        if (!recognitionRef.current) return;

        recognitionRef.current.stop();
        setIsRecording(false);
    };

    const handleProceed = async () => {
        if (transcript.trim().length > 0) {
            await logResponse({
                stage: "task",
                subStage: "1",
                type: "speech",
                transcript: transcript.trim()
            });
        }

        await completeTask();

        navigate("/gonogo"); // next stage
    };

    const completeTask = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/participant/complete-task`, {
                participantId: stored.participantId
            });

            // update localStorage too
            localStorage.setItem("participant", JSON.stringify({
                ...stored,
                stageFinished: "task",
                nextStage: "gonogo"
            }));

        } catch (err) {
            console.error("Task completion failed:", err);
        }
    };

    return (
        <div className="page">
            <Background />

            {/* Language Toggle */}
            <div className="lang-toggle">
                <button
                    onClick={() => setLang("en")}
                    className={lang === "en" ? "active" : ""}
                >
                    EN
                </button>
                <button
                    onClick={() => setLang("bn")}
                    className={lang === "bn" ? "active" : ""}
                >
                    BN
                </button>
            </div>

            {/* Disabled Controls (Aesthetic only) */}
            <div className="control-bar">
                <button disabled>⬅ Back</button>
                <button className="control-btn pause" disabled>
                    ⏸ Pause
                </button>
            </div>

            <div className="card pd-card">

                <h3>{t.task?.q1}</h3>

                {/* AUDIO */}
                <button className="audio-btn" onClick={playAudio}>
                    {'\u{1F50A}'} Audio Guide
                </button>

                {/* RECORD CONTROLS */}
                <div className="affect-controls">
                    <button onClick={startRecording} disabled={isRecording}>
                        {t.task?.record}
                    </button>

                    <button onClick={stopRecording} disabled={!isRecording}>
                        {t.task?.stop}
                    </button>
                </div>

                {/* TRANSCRIPT */}
                <div className="affect-transcript">
                    {transcript || t.task?.listening}
                </div>
                <br></br>

                {/* ALWAYS AVAILABLE */}
                <button
                    className="primary-btn active"
                    onClick={handleProceed}
                >
                    {t.task?.proceed}
                </button>

            </div>
        </div>
    );
}