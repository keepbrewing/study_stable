import { useEffect, useState } from "react";

export default function BreakScreen({ text, duration = 5, onNext }) {
    const [count, setCount] = useState(duration);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onNext();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="affect-content">
            <h3>{text}</h3>
            <p>{count}</p>
        </div>
    );
}