import { useState } from "react";
import audioData from "../../content/audio/affect.json";

export default function Stage5({
    name,
    t,
    logResponse,
    onNext,
    completeAffect
}) {
    const [selected, setSelected] = useState("");

    const playAudio = () => {
        try {
            const audio = new Audio(audioData["5"]?.q1);
            audio.play().catch(() => { });
        } catch { }
    };

    const handleClick = async (value) => {
        setSelected(value);

        await logResponse({
            stage: "affect",
            subStage: "5",
            type: "intensity",
            value
        });

        await completeAffect(); // always ends here
        onNext("task");
    };

    return (
        <div className="affect-content">

            <h3>
                {t.affect?.["5"]?.q1}
            </h3>

            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            <div className="emoji-grid">

                <button onClick={() => handleClick("low")} className="emoji-btn">
                    <span className="emoji">😶</span>
                    <span>{t.affect?.["5"]?.low}</span>
                </button>

                <button onClick={() => handleClick("medium")} className="emoji-btn">
                    <span className="emoji">😳</span>
                    <span>{t.affect?.["5"]?.medium}</span>
                </button>

                <button onClick={() => handleClick("high")} className="emoji-btn">
                    <span className="emoji">🤯</span>
                    <span>{t.affect?.["5"]?.high}</span>
                </button>

            </div>

        </div>
    );
}