"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("@tiips/db");
dotenv_1.default.config({ path: "../../.env" });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "IIPT API" });
});
app.get("/api/test-db", async (req, res) => {
    try {
        const userCount = await db_1.prisma.user.count();
        res.json({ success: true, userCount });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.listen(port, () => {
    console.log(`TIIPS API listening at http://localhost:${port}`);
});
