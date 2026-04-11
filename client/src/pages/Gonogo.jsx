import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../index.css";
import Background from "../components/Background";

import IntroScreen from "../components/gonogo/IntroScreen";
import InstructionScreen from "../components/gonogo/InstructionScreen";
import GameEngine from "../components/gonogo/GameEngine";
import LoadingScreen from "../components/gonogo/LoadingScreen";
import BreakScreen from "../components/gonogo/BreakScreen";

import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";
import audioData from "../content/audio/gonogo.json";

export default function GoNoGo() {
    const navigate = useNavigate();

    // LANGUAGE
    const [lockedLang, setLockedLang] = useState(null);
    const [lang, setLang] = useState("en");

    const activeLang = lockedLang || lang;
    const t = activeLang === "en" ? en : bn;

    // FLOW
    const [screen, setScreen] = useState("loading");

    //  DATA
    const stored = JSON.parse(localStorage.getItem("participant"));
    const [participantData, setParticipantData] = useState(null);
    const [stimuli, setStimuli] = useState([]);
    const [isPaused, setIsPaused] = useState(false);

    // BUILD STIMULI
    const buildStimuli = (avatar, gender, langToUse) => {
        const categories = (langToUse === "bn" ? bn : en).gonogo.categories;

        const ec = categories.ec;
        const pd = categories.pd;
        const ai = categories.ai;
        const pa = categories.pa;

        const p = Math.floor(Math.random() * 3);

        const practice = shuffle([
            { category: "ec", ...ec[p] },
            { category: "pd", ...pd[p] },
            { category: "ai", ...ai[p] },
            { category: "pa", ...pa[p] }
        ]);

        const finals = [

            { category: "ec", ...ec[0] },
            { category: "pd", ...pd[0] },
            { category: "ai", ...ai[0] },
            { category: "pa", ...pa[0] },

            { category: "pd", ...pd[1] },
            { category: "ai", ...ai[1] },
            { category: "pa", ...pa[1] },
            { category: "ec", ...ec[1] },

            { category: "ai", ...ai[2] },
            { category: "pa", ...pa[2] },
            { category: "ec", ...ec[2] },
            { category: "pd", ...pd[2] }
        ];

        const all = [...practice, ...finals];

        return all.map((s, i) => ({
            id: `${s.category}-${s.img}-${i}`,
            category: s.category,
            word: s.word,
            img: s.img,
            path: `/gonogo/${s.category}/${avatar}/${gender}/${s.img}`
        }));
    };

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    // PRELOAD
    const preloadImages = async (stimuli) => {
        const promises = stimuli.map(s => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = s.path;
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        await Promise.all(promises);
    };

    const playAudio = () => {
        try {
            const audio = new Audio(audioData.instruction);
            audio.play().catch(() => { });
        } catch { }
    };

    // INIT
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

                // WRONG STAGE
                if (res.data.nextStage !== "gonogo") {
                    navigate(`/${res.data.nextStage}`, { replace: true });
                    return;
                }

                setParticipantData(res.data);

                setScreen("intro");

            } catch (err) {
                console.error(err);
                navigate("/", { replace: true });
            }
        };

        fetchData();
    }, []);

    // UI

    if (screen === "loading") return <LoadingScreen />;

    return (
        <div className="page">
            <Background />

            {/* LANGUAGE */}
            <div className="lang-toggle">
                <button onClick={() => setLang("en")} disabled={screen === "game"} className={lang === "en" ? "active" : ""}>EN</button>
                <button onClick={() => setLang("bn")} disabled={screen === "game"} className={lang === "bn" ? "active" : ""}>BN</button>
            </div>

            {/* CONTROLS */}
            <div className="control-bar">
                <button disabled>⬅ Back</button>

                <button
                    className="control-btn pause"
                    onClick={() => setIsPaused(prev => !prev)}
                >
                    {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
            </div>

            <div className="card pd-card">

                {screen === "intro" && (
                    <IntroScreen
                        t={t}
                        onNext={() => setScreen("instruction")}
                    />
                )}

                {screen === "instruction" && (
                    <InstructionScreen
                        t={t}
                        onStart={async () => {
                            if (!participantData || !participantData.friend) {
                                console.error("Participant Data not ready");
                                return;
                            }


                            setLockedLang(lang);
                            const built = buildStimuli(
                                participantData.friend.avatar,
                                participantData.gender,
                                lang
                            );

                            setStimuli(built);

                            await preloadImages(built);
                            setScreen("game");
                        }}
                        isReady = {!!participantData?.friend}
                        playAudio={playAudio}
                    />
                )}

                {screen === "game" && (
                    <GameEngine
                        t={t}
                        stimuli={stimuli}
                        participantId={stored.participantId}
                        isPaused={isPaused}
                        onFinish={async () => {
                            try {
                                await axios.post(
                                    `${import.meta.env.VITE_API_URL}/api/participant/complete-gonogo`,
                                    {
                                        participantId: stored.participantId
                                    }
                                );

                                navigate("/thankyou", { replace: true });

                            } catch (err) {
                                console.error("GONOGO COMPLETE ERROR", err);
                            }
                        }}
                    />
                )}

            </div>
        </div>
    );
}