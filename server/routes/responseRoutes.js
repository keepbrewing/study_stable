import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();

router.post("/log", async (req, res) => {
    try {
        const { participantId, data } = req.body;

        // BASIC VALIDATION
        if (!participantId || !data || !data.stage) {
            return res.status(400).json({ status: "invalid_data" });
        }

        const user = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({ status: "error" });
        }

        // ensure array exists
        if (!user.responses) {
            user.responses = [];
        }

        const validStages = ["pd", "affect", "task", "gonogo"];
        if (!validStages.includes(data.stage)) {
            return res.status(400).json({ status: "invalid_stage" });
        }

        //PD 
        if (data.stage === "pd") {
            if (
                !data.eventType ||
                typeof data.step !== "number" ||
                typeof data.responseTimeMs !== "number"
            ) {
                return res.status(400).json({ status: "invalid_pd_data" });
            }

            const validEvents = ["awareness", "selection"];
            if (!validEvents.includes(data.eventType)) {
                return res.status(400).json({ status: "invalid_pd_event" });
            }
        }

        // AFFECT (NEW, SAFE)
        if (data.stage === "affect") {
            if (!data.subStage) {
                return res.status(400).json({ status: "missing_subStage" });
            }

            if (["2a", "3"].includes(data.subStage)) {
                if (data.type !== "speech") {
                    return res.status(400).json({ status: "invalid_speech_type" });
                }

                if (!data.transcript || data.transcript.trim().length === 0) {
                    return res.status(400).json({ status: "empty_transcript" });
                }
            }

            if (data.subStage === "4") {
                if (!["sad", "afraid", "happy", "none"].includes(data.value)) {
                    return res.status(400).json({ status: "invalid_stage4_value" });
                }
            }

            if (data.subStage === "5") {
                if (!["low", "medium", "high"].includes(data.value)) {
                    return res.status(400).json({ status: "invalid_stage5_value" });
                }
            }

            if (["2b", "2c"].includes(data.subStage)) {
                if (data.type !== "emoji") {
                    return res.status(400).json({ status: "invalid_emoji_type" });
                }

                if (!["sad", "neutral", "happy"].includes(data.value)) {
                    return res.status(400).json({ status: "invalid_emoji_value" });
                }

                if (typeof data.correct !== "boolean") {
                    return res.status(400).json({ status: "missing_correct_flag" });
                }

                if (typeof data.attempt !== "number") {
                    return res.status(400).json({ status: "missing_attempt" });
                }

                if (typeof data.responseTimeMs !== "number") {
                    return res.status(400).json({ status: "missing_response_time" });
                }
            }
            if (data.subStage === "2c") {
                if (data.type !== "emoji") {
                    return res.status(400).json({ status: "invalid_2c_type" });
                }

                if (!["sad", "neutral", "happy"].includes(data.value)) {
                    return res.status(400).json({ status: "invalid_emoji_value" });
                }

                if (typeof data.correct !== "boolean") {
                    return res.status(400).json({ status: "missing_correct_flag" });
                }

                if (typeof data.attempt !== "number") {
                    return res.status(400).json({ status: "missing_attempt" });
                }

                if (typeof data.responseTimeMs !== "number") {
                    return res.status(400).json({ status: "missing_response_time" });
                }
            }
        }

        if (data.stage === "task") {
            if (data.type !== "speech") {
                return res.status(400).json({ status: "invalid_task_type" });
            }

            if (!data.transcript || data.transcript.trim().length === 0) {
                return res.status(400).json({ status: "empty_task_transcript" });
            }
        }

        if (data.stage === "gonogo") {

            if (!data.category || !data.value) {
                return res.status(400).json({ status: "invalid_gonogo_data" });
            }

            // PREVENT DUPLICATES
            const exists = user.responses.find(r =>
                r.stage === "gonogo" &&
                r.category === data.category &&
                r.value === data.value
            );

            if (exists) {
                return res.json({ status: "duplicate_ignored" });
            }
        }

        //SMART SAVE (NO DUPLICATES)

        if (data.stage === "affect") {
            const existingIndex = user.responses.findIndex(
                r => r.stage === "affect" && r.subStage === data.subStage
            );

            if (existingIndex !== -1) {
                user.responses[existingIndex] = {
                    ...user.responses[existingIndex],
                    ...data,
                    createdAt: new Date()
                };
            } else {
                user.responses.push({
                    ...data,
                    createdAt: new Date()
                });
            }
        } else if (data.stage === "gonogo") {

            user.responses.push({
                stage: "gonogo",
                category: data.category,
                value: data.value,
                createdAt: new Date()
            });
        }
        else {
            // PD + others (unchanged behavior)
            user.responses.push({
                ...data,
                createdAt: new Date()
            });
        }

        await user.save();

        res.json({ status: "ok" });

    } catch (err) {
        console.error("🔥 BACKEND ERROR:", err);
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
});

export default router;