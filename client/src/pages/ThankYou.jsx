import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "../index.css";
import Background from "../components/Background";

import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";

export default function ThankYou() {
    const navigate = useNavigate();

    const lang = "en";
    const t = lang === "en" ? en : bn;

    const stored = JSON.parse(localStorage.getItem("participant"));

    useEffect(() => {
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

                // 🚫 NOT FINAL → redirect properly
                if (res.data.nextStage !== "thankyou") {
                    navigate(`/${res.data.nextStage}`, { replace: true });
                    return;
                }

            } catch (err) {
                console.error(err);
                navigate("/", { replace: true });
            }
        };

        check();
    }, []);

    useEffect(() => {
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            navigate("/", { replace: true });
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return (
        <div className="page">
            <Background />

            <div className="card pd-card">

                {/* IMAGE */}
                <img
                    src="/thankyou.png"
                    alt="thank you"
                    className="affect-image"
                />

                {/* TEXT */}
                <h3>
                    {t.common?.thankyou || "Thank you for playing!"}
                </h3>

            </div>
        </div>
    );
}