import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();
console.log("participant route file loaded");
router.post("/enter", async (req, res) => {
    console.log("/enter route hit");
    try {
        const { name, participantId, gender } = req.body;

        if (!name || !participantId || !gender) {
            return res.status(400).json({
                status: "error",
                message: "Missing fields"
            });
        }

        const existing = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });
        if (!existing) {
            const newUser = await Participant.create({
                name,
                participantId: participantId.trim().toLowerCase(),
                gender
            });

            return res.json({
                status: "new",
                nextStage: "friend",
                participant: newUser
            });
        }
        if (existing.stageFinished === "gonogo") {
            return res.json({
                status: "completed"
            });
        }

        return res.json({
            status: "resume",
            nextStage: existing.nextStage,
            participant: existing
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error" });
    }
});

router.post("/friend", async (req, res) => {
    try {
        const { participantId, friendName, avatar } = req.body;

        const user = await Participant.findOne({ participantId });

        if (!user) {
            return res.status(404).json({ status: "error" });
        }

        user.friend = {
            name: friendName,
            avatar: avatar
        };

        user.stageFinished = "friend";
        user.nextStage = "pd";

        await user.save();

        res.json({
            status: "ok",
            nextStage: "pd"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
});

router.post("/complete-pd", async (req, res) => {
    try {
        const { participantId } = req.body;

        const user = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({ status: "error" });
        }

        user.stageFinished = "pd";
        user.nextStage = "affect";

        await user.save();

        res.json({ status: "ok" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
});

router.post("/complete-affect", async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ status: "missing_id" });
        }

        const user = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({ status: "not_found" });
        }

        user.stageFinished = "affect";
        user.nextStage = "task";

        await user.save();

        res.json({ status: "ok" });

    } catch (err) {
        console.error("AFFECT COMPLETE ERROR:", err);
        res.status(500).json({ status: "error" });
    }
});

router.post("/complete-task", async (req, res) => {
    try {
        const { participantId } = req.body;

        const user = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({ status: "error" });
        }

        user.stageFinished = "task";
        user.nextStage = "gonogo"; // next flow

        await user.save();

        res.json({ status: "ok" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
});

router.post("/complete-gonogo", async (req, res) => {
    try {
        const { participantId } = req.body;

        const user = await Participant.findOne({
            participantId: participantId.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({ status: "error" });
        }

        user.stageFinished = "gonogo";
        user.nextStage = "thankyou";

        await user.save();

        res.json({ status: "ok" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
});

router.get("/:participantId", async (req, res) => {
    try {
        const user = await Participant.findOne({
            participantId: req.params.participantId
        });

        if (!user) {
            return res.status(404).json({ message: "Participant not found" });
        }

        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;