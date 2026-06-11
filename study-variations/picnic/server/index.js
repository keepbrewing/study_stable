import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo connected");
    })
    .catch(err => {
        console.log(err);
    });

app.get("/", (req, res) => {
    res.send("Picnic backend works!");
});

app.get("/insert", async (req, res) => {
    const item = await Test.create({
        name: "Hello Picnic"
    });

    res.json(item);
});

app.get("/hello", (req, res) => {
    res.json({
        success: true,
        message: "Hello from picnic backend"
    });
});

app.get("/all", async (req, res) => {
    const items = await Test.find();

    res.json(items);
});

app.listen(process.env.PORT || 5001, () => {
    console.log("Server running");
});