import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import participantRoutes from "./routes/participantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/participant", participantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/response", responseRoutes);

app.get("/", (req, res) => {
    res.send("API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});