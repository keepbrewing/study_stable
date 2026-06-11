import mongoose, { mongo } from "mongoose";

const TestSchema = new mongoose.Schema({
    name: String,
    createdAT: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Test", TestSchema);