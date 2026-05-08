export default function StimulusPreview({
    t,
    stimuli,
    onNext
}) {

    // remove duplicates
    const uniqueStimuli = stimuli.filter(
        (s, index, self) =>
            index === self.findIndex((x) => x.word === s.word)
    );

    return (
        <div className="affect-content">

            <h3>
                {t.gonogo?.previewTitle || "Look at all the pictures carefully"}
            </h3>

            <div className="stimulus-grid">

                {uniqueStimuli.map((s) => (
                    <div key={s.id} className="stimulus-card">

                        <img src={s.path} alt="" />

                        <p>{s.word}</p>

                    </div>
                ))}

            </div>

            <button
                className="primary-btn active"
                onClick={onNext}
            >
                {t.common?.proceed || "Proceed"}
            </button>

        </div>
    );
}