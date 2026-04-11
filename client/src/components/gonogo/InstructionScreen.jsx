export default function InstructionScreen({ t, onStart, playAudio, isReady }) {
    return (
        <div className="affect-content">

            <p>{t.gonogo?.instruction?.l1}</p>
            <p>{t.gonogo?.instruction?.l2}</p>
            <p>{t.gonogo?.instruction?.l3}</p>

            <button className="audio-btn" onClick={playAudio}>
                {'\u{1F50A}'} Audio Guide
            </button>

            <button
                className={`primary-btn ${isReady ? "active" : "disabled"}`}
                onClick={onStart}
                disabled={!isReady}
            >
                {isReady
                    ? t.gonogo?.instruction?.start
                    : "Preparing data...⏳"}
            </button>

        </div>
    );
}