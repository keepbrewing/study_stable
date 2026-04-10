import express from "express";
import jwt from "jsonwebtoken";
import Participant from "../models/Participant.js";
import { verifyAdmin } from "../middleware/auth.js";
import { Parser } from "json2csv";

const router = express.Router();

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        const token = jwt.sign(
            { role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );
        return res.json({ token });
    }

    return res.status(401).json({ message: "Invalid credentials" });
});

router.get("/participants", verifyAdmin, async (req, res) => {
    const data = await Participant.find();
    res.json(data);
});

router.delete("/participant/:id", verifyAdmin, async (req, res) => {
    await Participant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

router.get("/download", verifyAdmin, async (req, res) => {
    const data = await Participant.find().lean();

    if (data.length === 0) {
        return res.status(400).json({ message: "No data available" });
    }

    const rows = [];

    data.forEach(p => {
        p.responses.forEach(r => {

            rows.push({
                // PARTICIPANT
                participantId: p.participantId,
                name: p.name,
                gender: p.gender,
                friendName: p.friend?.name || "",
                friendAvatar: p.friend?.avatar || "",

                // COMMON
                stage: r.stage || "",

                // PD
                eventType: r.eventType || "",
                step: r.step ?? "",

                subStage: r.subStage || "",
                type: r.type || "",
                transcript: r.transcript || "",
                attempt: r.attempt ?? "",

                // SHARED
                value: r.value || "",
                correct: r.correct ?? "",
                responseTimeMs: r.responseTimeMs ?? "",

                // GONOGO
                gonogoCategory: r.stage === "gonogo" ? r.category : "",
                gonogoValue: r.stage === "gonogo" ? r.value : "",

                // TIMESTAMP
                createdAt: r.createdAt
            });

        });
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("participants.csv");
    res.send(csv);
});

export default router;