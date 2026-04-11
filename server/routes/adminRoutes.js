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

    const rows = data.map(p => {

        const responses = p.responses || [];

        // PD
        const pd = responses.filter(r => r.stage === "pd");

        // AFFECT
        const affect = responses.filter(r => r.stage === "affect");

        const affect2a = affect.find(r => r.subStage === "2a")?.transcript || "";
        const affect2b = affect.find(r => r.subStage === "2b")?.value || "";
        const affect2c = affect.find(r => r.subStage === "2c")?.value || "";
        const affect3  = affect.find(r => r.subStage === "3")?.transcript || "";
        const affect4  = affect.find(r => r.subStage === "4")?.value || "";
        const affect5  = affect.find(r => r.subStage === "5")?.value || "";

        // TASK
        const task = responses.find(r => r.stage === "task");

        // GONOGO
        const gonogo = responses.filter(r => r.stage === "gonogo");

        const uniqueCategories = [...new Set(gonogo.map(r => r.category))];
        const uniqueValues = [...new Set(gonogo.map(r => r.value))];

        return {
            // PARTICIPANT
            participantId: p.participantId,
            name: p.name,
            gender: p.gender,
            friendName: p.friend?.name || "",
            friendAvatar: p.friend?.avatar || "",

            // PD
            pdCount: pd.length,

            // AFFECT
            affect_2a: affect2a,
            affect_2b: affect2b,
            affect_2c: affect2c,
            affect_3: affect3,
            affect_4: affect4,
            affect_5: affect5,

            // TASK
            task: task?.transcript || "",

            // GONOGO
            gonogoCategories: uniqueCategories.join(", "),
            gonogoResponses: uniqueValues.join(", "),

            // META
            totalResponses: responses.length,
            createdAt: p.createdAt
        };
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("participants_clean.csv");
    res.send(csv);
});

export default router;