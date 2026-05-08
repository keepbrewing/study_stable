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
        const affect3 = affect.find(r => r.subStage === "3")?.transcript || "";
        const affect4 = affect.find(r => r.subStage === "4")?.value || "";
        const affect5 = affect.find(r => r.subStage === "5")?.value || "";

        // TASK
        const task = responses.find(r => r.stage === "task");

        // GONOGO
        const gonogo = responses.filter(r => r.stage === "gonogo");
        const gonogoFormatted = gonogo.map(r => {

            if (r.modalInput) {
                return `${r.category} | ${r.value} | ${r.modalInput}`;
            }

            return `${r.category} | ${r.value} | ${r.modalInput}`;
        });

        const uniqueCategories = [...new Set(gonogo.map(r => r.category))];
        //const uniqueValues = [...new Set(gonogo.map(r => r.value))];

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
            gonogoResponses: gonogoFormatted.join(" || "),

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

router.get("/download-scoresheet", verifyAdmin, async (req, res) => {

    const data = await Participant.find().lean();

    if (data.length === 0) {
        return res.status(400).json({
            message: "No data available"
        });
    }

    const rows = data.map((p, index) => {

        const responses = p.responses || [];

        // PD selections only
        const pdSelections = responses.filter(
            r =>
                r.stage === "pd" &&
                r.eventType === "selection"
        );

        // correct selection
        const correctPD = pdSelections.find(r => r.correct === true);

        let s1_score = 0;

        // success within step 6 or 7
        if (
            correctPD &&
            (correctPD.step === 5 || correctPD.step === 6)
        ) {
            s1_score = 1;
        }

        const stage2bResponses = responses.filter(
            r =>
                r.stage === "affect" &&
                r.subStage === "2b"
        );

        const correct2B = stage2bResponses.find(
            r =>
                r.correct === true &&
                (r.attempt === 1 || r.attempt === 2)
        );

        const stage2B_score = correct2B ? 2 : 0;

        const stage2cResponses = responses.filter(
            r =>
                r.stage === "affect" &&
                r.subStage === "2c"
        );

        const correct2C = stage2cResponses.find(
            r =>
                r.correct === true &&
                (r.attempt === 1 || r.attempt === 2)
        );

        const stage2C_score = correct2C ? 1 : 0;

        const rowNumber = index + 2;
        const s2_final_formula = `=IF(D${rowNumber} = 2, 3, IF(E${rowNumber} = 2, 2, IF(F${rowNumber} = 1, 1, 0)))`;

        const s2_interpretation_formula = `=IF(G${rowNumber}=3,"independent recognition",IF(G${rowNumber}=2,"recognition with moderate support",IF(G${rowNumber}=1,"recognition with maximum support","failed recognition")))`;

        const affect4 = responses.find(
            r =>
                r.stage === "affect" &&
                r.subStage === "4"
        );

        let stage4_score = 0;

        if (affect4?.value === "sad") {
            stage4_score = 2;
        }
        else if (affect4?.value === "afraid") {
            stage4_score = 1;
        }

        const affect5 = responses.find(
            r =>
                r.stage === "affect" &&
                r.subStage === "5"
        );

        let stage5_score = 0;

        if (affect5?.value === "high") {
            stage5_score = 2;
        }
        else if (affect5?.value === "medium") {
            stage5_score = 1;
        }

        const s4_total_formula = `=J${rowNumber}+K${rowNumber}`;

        const gonogoResponses = responses.filter(
            r => r.stage === "gonogo"
        );

        let rc_score = 0;

        gonogoResponses.forEach((r) => {

            if (r.category === "ec") {
                rc_score += 3;
            }

            else if (r.category === "pd") {
                rc_score += 2;
            }

            else if (r.category === "ai") {
                rc_score += 0;
            }

            else if (r.category === "pa") {
                rc_score -= 1;
            }

        });

        const recognition_index_formula = `=G${rowNumber}`;

        const decoding_index_formula = `=I${rowNumber}`;

        const resonance_index_formula = `=L${rowNumber}`;

        const behavior_index_formula = `=M${rowNumber}`;

        const total_empathy_formula = `=C${rowNumber}+G${rowNumber} +I${rowNumber} +L${rowNumber} +M${rowNumber}`;

        return {
            participantId: p.participantId,
            name: p.name,

            S1_score: s1_score,

            Stage2A_score: "",

            Stage2B_score: stage2B_score,

            Stage2C_score: stage2C_score,

            S2_final_score: s2_final_formula,

            S2_interpretation: s2_interpretation_formula,

            Stage3_score: "",

            Stage4_score: stage4_score,

            Stage5_score: stage5_score,

            S4_total_score: s4_total_formula,

            RC_score: rc_score,

            Extra_scoring: "",

            Recognition_Index: recognition_index_formula,

            Decoding_Index: decoding_index_formula,

            Resonance_Index: resonance_index_formula,

            Behavior_Index: behavior_index_formula,

            Total_Empathy_Index: total_empathy_formula
        };
    });
    const parser = new Parser();

    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");

    res.attachment("scoresheet.csv");

    res.send(csv);
});

export default router;