import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";
import en from "../content/translations/en.json";
import bn from "../content/translations/bn.json";
import audioData from "../content/audio/participant.json";
import Background from "../components/Background";

export default function Participant() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [participantId, setParticipantId] = useState("");
    const [gender, setGender] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lang, setLang] = useState("en");

    const t = lang === "en" ? en : bn;

    const isValid = name && participantId && gender;

    const handleSubmit = async () => {
        if (!isValid) {
            setError("Please fill all fields");
            return;
        }
        try {
            setLoading(true);
            setError("");
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/participant/enter`,
                {
                    name,
                    participantId,
                    gender
                }
            );
            const data = res.data;
            if (data.status === "completed") {
                setError("You have already completed this study");
                return;
            }
            if (data.status === "new" || data.status === "resume") {
                localStorage.setItem("participant", JSON.stringify(data.participant));
                navigate(`/${data.nextStage}`);
            }
        } catch (error) {
            console.error(error);
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const playAudio = () => {
        try {
            const audio = new Audio(audioData.instruction);
            audio.play().catch(err => console.error("Audio error:", err));
        } catch (err) {
            console.error("Audio failed:", err);
        }
    };

    return (
        <div className="page">
            <Background />
            <div className="lang-toggle">
                <button onClick={() => setLang("en")} className={lang === "en" ? "active" : ""}>EN</button>
                <button onClick={() => setLang("bn")} className={lang === "bn" ? "active" : ""}>BN</button>
            </div>
            <div className="card">

                <h2>{t.participant.title}</h2>

                <button className="audio-btn" onClick={playAudio}>{'\u{1F50A}'} Audio Guide</button>

                <input
                    className="input"
                    placeholder={t.participant.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="input"
                    placeholder={t.participant.id}
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                />

                <div className="gender-group">
                    <button
                        onClick={() => setGender("male")}
                        className={`gender-btn ${gender === "male" ? "active male" : ""}`}
                    >
                        Male
                    </button>

                    <button
                        onClick={() => setGender("female")}
                        className={`gender-btn ${gender === "female" ? "active female" : ""}`}
                    >
                        Female
                    </button>
                </div>

                <button
                    onClick={handleSubmit}
                    className={`primary-btn ${isValid ? "active" : "disabled"}`}
                    disabled={!isValid || loading}
                >
                    {loading ? "Starting..." : t.participant.start}
                </button>

                {error && <p className="error">{error}</p>}

            </div>
        </div>
    );
}