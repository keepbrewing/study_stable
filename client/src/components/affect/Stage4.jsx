import { useState } from "react";
import audioData from "../../content/audio/affect.json";

export default function Stage4({
    name,
    t,
    lang,
    logResponse,
    onNext,
    completeAffect
}) {
    const [selected, setSelected] = useState("");
    const [feedback, setFeedback] = useState("");

    const playAudio = () => {
        try {
            const audio = new Audio(audioData[lang]?.["4"]?.q1);
            audio.play().catch(() => { });
        } catch { }
    };

    const handleClick = async (value) => {
        setSelected(value);

        await logResponse({
            stage: "affect",
            subStage: "4",
            type: "emotion",
            value
        });

        if (value === "none") {
            await completeAffect(); // finish here
            onNext("task");
        } else {
            onNext("5");
        }
    };

    return (
        <div className="affect-content">

            <h3>
                {t.affect?.["4"]?.q1?.replaceAll("{name}", name)}
            </h3>

            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            <div className="emoji-grid">

                <button onClick={() => handleClick("sad")} className="emoji-btn">
                    <span className="emoji">😢</span>
                    <span>{t.affect?.["4"]?.sad}</span>
                </button>

                <button onClick={() => handleClick("afraid")} className="emoji-btn">
                    <span className="emoji">😨</span>
                    <span>{t.affect?.["4"]?.afraid}</span>
                </button>

                <button onClick={() => handleClick("happy")} className="emoji-btn">
                    <span className="emoji">😊</span>
                    <span>{t.affect?.["4"]?.happy}</span>
                </button>

                <button onClick={() => handleClick("none")} className="emoji-btn">
                    <span className="emoji">😐</span>
                    <span>{t.affect?.["4"]?.none}</span>
                </button>

            </div>

        </div>
    );
}