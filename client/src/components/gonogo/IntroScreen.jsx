import { useState, useEffect } from "react";

export default function IntroScreen({ t, onNext, lang, audioData }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 1500),
            setTimeout(() => setStep(2), 3000),
            setTimeout(() => setStep(3), 4500)
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    const playAudio = () => {
        try {
            const audio = new Audio(audioData[lang]?.intro);
            audio.play().catch(() => { });
        }
        catch { }
    };

    return (
        <div className="affect-content">

            {step >= 1 && <p>{t.gonogo?.intro?.l1}</p>}
            {step >= 2 && <p>{t.gonogo?.intro?.l2}</p>}
            {step >= 3 && <p>{t.gonogo?.intro?.l3}</p>}

            {step >= 1 && (
                <button className="audio-btn" onClick={playAudio}>
                    {'\u{1F50A}'} Audio Guide
                </button>
            )}

            {step >= 3 && (
                <button
                    className="primary-btn active"
                    onClick={onNext}
                >
                    {t.common?.proceed || "Proceed"}
                </button>
            )}

        </div>
    );
}