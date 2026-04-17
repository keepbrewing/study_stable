import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

import { AppContext } from "../context/AppContext";
import Background from "../components/Background";
import avatars from "../content/media/avatars.json";
import audioData from "../content/audio/friend.json";

import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";

export default function Friend() {
    const navigate = useNavigate();
    const { setFriend } = useContext(AppContext);

    const [friendName, setFriendName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [lang, setLang] = useState("en");

    const t = lang === "en" ? en : bn;

    const isValid = friendName && selectedAvatar;

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

                // No participant
                if (!res.data) {
                    localStorage.removeItem("participant");
                    navigate("/", { replace: true });
                    return;
                }

                // Already has friend → move forward
                if (res.data.friend) {
                    navigate(`/${res.data.nextStage}`, { replace: true });
                    return;
                }

            } catch (err) {
                console.error(err);

                if (err.response?.status === 404) {
                    localStorage.removeItem("participant");
                    navigate("/", { replace: true });
                }
            }
        };

        fetchParticipant();
    }, []);

    const playAudio = () => {
        try {
            const audio = new Audio(audioData[lang]?.instruction);
            audio.play().catch(err => console.error("Audio error:", err));
        } catch (err) {
            console.error("Audio failed:", err);
        }
    };

    const handleContinue = async () => {
        if (!isValid) return;

        const participant = JSON.parse(localStorage.getItem("participant"));

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/participant/friend`, {
                participantId: participant.participantId,
                friendName,
                avatar: selectedAvatar
            });

            setFriend({
                name: friendName,
                avatar: selectedAvatar
            });

            localStorage.setItem("participant", JSON.stringify({
                ...participant,
                nextStage: "pd"
            }));

            navigate("/pd", { replace: true });

        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="page">
            <Background />

            {/* Language Toggle */}
            <div className="lang-toggle">
                <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
                <button onClick={() => setLang("bn")} className={lang === "bn" ? "active" : ""}>BN</button>
            </div>

            <div className="card">

                <h2>{t.friend?.title || "Choose your friend 🫂"}</h2>
                <button className="audio-btn" onClick={playAudio}>{'\u{1F50A}'} Audio Guide</button>

                {/* Friend Name */}
                <input
                    className="input"
                    placeholder={t.friend?.name || "Friend's name"}
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                />

                {/* Avatar Grid */}
                <div className="avatar-grid">
                    {avatars.map((a) => (
                        <div
                            key={a.id}
                            onClick={() => setSelectedAvatar(a.id)}
                            className={`avatar-card ${selectedAvatar === a.id ? "selected" : ""}`}
                        >
                            <img src={a.src} alt="" />
                        </div>
                    ))}
                </div>

                {/* Continue */}
                <button
                    onClick={handleContinue}
                    className={`primary-btn ${isValid ? "active" : "disabled"}`}
                    disabled={!isValid}
                >
                    {t.friend?.continue || "Continue"}
                </button>

            </div>
        </div>
    );
}
