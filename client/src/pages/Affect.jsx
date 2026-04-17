import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../index.css";
import Background from "../components/Background";

import Stage2A from "../components/affect/Stage2A";
import Stage2B from "../components/affect/Stage2B";
import Stage2C from "../components/affect/Stage2C";
import Stage3 from "../components/affect/Stage3";
import Stage4 from "../components/affect/Stage4";
import Stage5 from "../components/affect/Stage5";

import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";

export default function Affect() {
    const navigate = useNavigate();

    //  LANGUAGE
    const [lang, setLang] = useState("en");
    const t = lang === "en" ? en : bn;

    //  STAGE 
    const [stage, setStage] = useState("2a");
    const [isPaused, setIsPaused] = useState(false);

    //  PARTICIPANT 
    const stored = JSON.parse(localStorage.getItem("participant"));
    const [participantData, setParticipantData] = useState(null);

    useEffect(() => {
        if (!stored) {
            navigate("/", { replace: true });
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/participant/${stored.participantId}`
                );
                if (!res.data) {
                    navigate("/", { replace: true });
                    return;
                }

                if (!res.data.friend) {
                    navigate("/friend", { replace: true });
                    return;
                }
                setParticipantData(res.data);
            } catch (err) {
                console.error("Participant fetch failed:", err);
                if (err.response?.status === 404) {
                    localStorage.removeItem("participant"); // clear stale data
                    navigate("/", { replace: true });
                }
            }
        };

        fetchData();
    }, []);

    const avatar = participantData?.friend?.avatar;
    const name = participantData?.friend?.name;

    //  IMAGE 
    const targetImage = `/pd/target/${avatar}.png`;

    //  LOGGING
    const logResponse = async (payload) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/response/log`, {
                participantId: stored.participantId,
                data: payload
            });
        } catch (err) {
            console.error(err);
        }
    };

    // CONTROLS
    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    const goBack = () => {
        if (stage === '2a') return;
        if (stage === "2b") setStage("2a");
        else if (stage === "2c") setStage("2b");
        else if (stage === "3") setStage("2b");
        else if (stage === "4") setStage("3");
        else if (stage === "5") setStage("4");
    };

    const completeAffect = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/participant/complete-affect`, {
                participantId: stored.participantId
            });

            const updated = {
                ...stored,
                stageFinished: "affect",
                nextStage: "task"
            };

            localStorage.setItem("participant", JSON.stringify(updated));

        } catch (err) {
            console.error("Affect completion failed", err);
        }
    };

    useEffect(() => {
        if (stage === "task") {
            navigate("/task", { replace: true });
        }
    }, [stage]);

    return (
        <div className="page">
            <Background />

            {/* Language */}
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

            {/* Back + Pause */}
            <div className="control-bar">
                <button onClick={goBack}>⬅ Back</button>

                <button
                    className="control-btn pause"
                    onClick={togglePause}
                >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
            </div>

            <div className="card pd-card">

                {!participantData || !participantData.friend ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {/* IMAGE */}
                        <img
                            src={targetImage}
                            alt="target"
                            className="affect-image"
                        />

                        {/* STAGES */}

                        {stage === "2a" && (
                            <Stage2A
                                name={name}
                                t={t}
                                lang={lang}
                                logResponse={logResponse}
                                isPaused={isPaused}
                                onNext={() => setStage("2b")}
                            />
                        )}

                        {stage === "2b" && (
                            <Stage2B
                                name={name}
                                t={t}
                                lang={lang}
                                isPaused={isPaused}
                                onNext={(nextStage) => setStage(nextStage || "3")}
                                logResponse={logResponse}
                            />
                        )}
                        {stage === "2c" && (
                            <Stage2C
                                name={name}
                                t={t}
                                lang={lang}
                                isPaused={isPaused}
                                logResponse={logResponse}
                                onNext={() => setStage("3")}
                            />
                        )}
                        {stage === "3" && (
                            <Stage3
                                name={name}
                                t={t}
                                lang={lang}
                                logResponse={logResponse}
                                isPaused={isPaused}
                                onNext={() => setStage("4")}
                            />
                        )}
                        {stage === "4" && (
                            <Stage4
                                name={name}
                                t={t}
                                lang={lang}
                                logResponse={logResponse}
                                completeAffect={completeAffect}
                                onNext={(next) => setStage(next)}
                            />
                        )}

                        {stage === "5" && (
                            <Stage5
                                name={name}
                                t={t}
                                lang={lang}
                                logResponse={logResponse}
                                completeAffect={completeAffect}
                                onNext={(next) => setStage(next)}
                            />
                        )}
                    </>
                )}

            </div>
        </div>
    );
}