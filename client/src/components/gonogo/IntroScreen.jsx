import { useState, useEffect } from "react";

export default function IntroScreen({ t, onNext }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 1500),
            setTimeout(() => setStep(2), 3000),
            setTimeout(() => setStep(3), 4500),
            setTimeout(() => onNext(), 6500)
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="affect-content">

            {step >= 1 && <p>{t.gonogo?.intro?.l1}</p>}
            {step >= 2 && <p>{t.gonogo?.intro?.l2}</p>}
            {step >= 3 && <p>{t.gonogo?.intro?.l3}</p>}

        </div>
    );
}