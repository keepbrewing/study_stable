import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

import Background from "../components/Background";

import pdMedia from "../content/media/pd.json";
import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";

export default function Pd() {
    const navigate = useNavigate();

    const [lang, setLang] = useState("en");
    const t = lang === "en" ? en : bn;

    const [step, setStep] = useState(1);
    const [imagesEnabled, setImagesEnabled] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [modalStep, setModalStep] = useState(null);

    const [startTime, setStartTime] = useState(Date.now());
    const [participantData, setParticipantData] = useState(null);

    // FETCH FROM DB
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("participant"));

        if (!stored) {
            navigate("/", { replace: true });
            return;
        }

        const fetchParticipant = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/participant/${stored.participantId}`
                );

                if (!res.data) {
                    localStorage.removeItem("participant");
                    navigate("/", { replace: true });
                    return;
                }

                if (!res.data.friend) {
                    navigate("/friend", { replace: true });
                    return;
                }

                if (res.data.nextStage !== "pd") {
                    navigate(`/${res.data.nextStage}`, { replace: true });
                    return;
                }

                setParticipantData(res.data);

            } catch (err) {
                console.error("DB FETCH FAILED:", err);

                if (err.response?.status === 404) {
                    localStorage.removeItem("participant");
                    navigate("/", { replace: true });
                }
            }
        };

        fetchParticipant();
    }, []);

    // WAIT FOR DATA
    if (!participantData || !participantData.friend) {
        return (
            <div className="page">
                <Background />
                <div className="card">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const avatar = participantData.friend.avatar;
    const name = participantData.friend.name;

    // MEDIA
    const targetImage = `${pdMedia.targetPath}${avatar}.png`;

    const images = [
        { id: "contrast1", src: pdMedia.contrast[0] },
        { id: "contrast2", src: pdMedia.contrast[1] },
        { id: "contrast3", src: pdMedia.contrast[2] },
        { id: "target", src: targetImage }
    ];

    // TIMER
    const resetTimer = () => {
        setStartTime(Date.now());
    };

    const triggerHint = () => {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 800);
    };

    // LOGGING
    const logResponse = async (payload) => {
        const stored = JSON.parse(localStorage.getItem("participant"));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/response/log`, {
                participantId: stored.participantId,
                data: payload
            });
        } catch (err) {
            console.error("Logging failed", err);
        }
    };

    const completePD = async () => {
        const stored = JSON.parse(localStorage.getItem("participant"));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/participant/complete-pd`, {
                participantId: stored.participantId
            });

            stored.stageFinished = "pd";
            stored.nextStage = "affect";

            localStorage.setItem("participant", JSON.stringify(stored));

        } catch (err) {
            console.error("PD completion failed", err);
        }
    };

    // AWARENESS
    const handleAwareness = async (value) => {
        const responseTime = Date.now() - startTime;

        await logResponse({
            stage: "pd",
            eventType: "awareness",
            step,
            value,
            responseTimeMs: responseTime
        });

        if (value === "yes") {
            setStep(5);
            setImagesEnabled(true);
            resetTimer();
            return;
        }

        if (step === 1) setStep(2);
        else if (step === 2) setStep(3);
        else if (step === 3) setModalStep(4);

        triggerHint();
        resetTimer();
    };

    // SELECTION
    const handleSelection = async (id) => {
        if (step < 5) return;

        const responseTime = Date.now() - startTime;
        const correct = id === "target";

        await logResponse({
            stage: "pd",
            eventType: "selection",
            step,
            value: id,
            correct,
            responseTimeMs: responseTime
        });

        if (correct) {
            await completePD();
            navigate("/affect", { replace: true });
            return;
        }

        if (step === 5) setStep(6);
        else if (step === 6) setStep(7);
        else if (step === 7) setModalStep(8);

        triggerHint();
        resetTimer();
    };

    // AUDIO
    const playAudio = (customStep = step) => {
        const audio = new Audio(`/pd/audio/${lang}/step${customStep}.mp3`);
        console.log(customStep);
        audio.play().catch(() => { });
    };

    return (
        <div className="page">
            <Background />

            <div className="lang-toggle">
                <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
                <button onClick={() => setLang("bn")} className={lang === "bn" ? "active" : ""}>BN</button>
            </div>

            <div className="card pd-card">

                <h2>
                    {t.pd?.steps?.[step]?.replaceAll("{name}", name)}
                </h2>

                <button className="audio-btn" onClick={() => playAudio()}>
                    {'\u{1F50A}'} Audio Guide
                </button>

                <div className="pd-grid">
                    {images.map(img => (
                        <div
                            key={img.id}
                            className={`
                                pd-img 
                                ${!imagesEnabled ? "disabled" : ""}
                                ${showHint && img.id === "target" ? "hint" : ""}
                            `}
                            onClick={() => handleSelection(img.id)}
                        >
                            <img src={img.src} alt="" />
                        </div>
                    ))}
                </div>

                {step < 5 && (
                    <div className="pd-actions">
                        <button className="primary-btn active" onClick={() => handleAwareness("yes")}>
                            Yes
                        </button>
                        <button className="primary-btn" onClick={() => handleAwareness("no")}>
                            No
                        </button>
                    </div>
                )}

                {modalStep && (
                    <div className="modal-overlay">
                        <div className="modal-box">

                            <button
                                className="modal-close"
                                onClick={async () => {
                                    if (modalStep === 4) {
                                        setModalStep(null);
                                        setStep(5);
                                        setImagesEnabled(true);
                                    }

                                    if (modalStep === 8) {
                                        setModalStep(null);
                                        await completePD();
                                        navigate("/affect", { replace: true });
                                    }
                                }}
                            >
                                ✖
                            </button>

                            <p>
                                {t.pd?.modals?.[modalStep]?.replaceAll("{name}", name)}
                            </p>

                            <button className="audio-btn" onClick={() => playAudio(modalStep)}>
                                {'\u{1F50A}'} Audio Guide
                            </button>

                            {modalStep === 8 && (
                                <div className="modal-image">
                                    <img src={targetImage} alt="target" />
                                </div>
                            )}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}