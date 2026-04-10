import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    stage: String,
    eventType: { type: String, default: null },
    step: { type: Number, default: null },

    value: String,
    correct: Boolean,

    responseTimeMs: { type: Number, default: null },

    subStage: String,
    type: String,
    transcript: String,
    attempt: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const participantSchema = new mongoose.Schema(
    {
        participantId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        stageFinished: {
            type: String,
            default: "participant"
        },
        nextStage: {
            type: String,
            default: "friend"
        },
        friend: {
            name: String,
            avatar: String
        },

        // IMPORTANT FIX HERE
        responses: {
            type: [responseSchema],
            default: []
        }

    }, { timestamps: true });

export default mongoose.model("Participant", participantSchema);