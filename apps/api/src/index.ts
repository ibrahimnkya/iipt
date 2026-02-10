import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "@tiips/db";

dotenv.config({ path: "../../.env" });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "TIIPS API" });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ success: true, userCount });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`TIIPS API listening at http://localhost:${port}`);
});
