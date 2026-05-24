import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { dbConnection } from "./dbConfig.js";
import router from "./routerConfig.js";
import { httpStatusCode } from "../constants/httpStatusCode.js";
import { httpStatusMsg } from "../constants/httpStatusMsg.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database and seed admin
dbConnection().then(async () => {
    const { userModel } = await import("../modules/userModel.js");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bloodbridge.com";
    const existing = await userModel.findOne({ email: adminEmail });
    if (!existing) {
        await userModel.create({
            name: "System Admin",
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || "Admin@123",
            role: "admin",
        });
        console.log(`✅ Admin seeded: ${adminEmail}`);
    }
});

const application = express();

application.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use("/uploads", express.static(path.join(__dirname, "../../public")));

application.use("/api/v1", router);

application.get("/api/v1/health", (req, res) =>
    res.json({ status: "ok", message: "BloodBridge API running" })
);

application.use((req, res, next) => {
    next({
        status: httpStatusCode.NOT_FOUND,
        message: "Page not found",
        statusMsg: httpStatusMsg.NOT_FOUND,
    });
});

application.use((error, req, res, next) => {
    console.log("Error: ", error);

    let status = error.status || httpStatusCode.INTERNAL_SERVER_ERROR;
    let statusMsg = error.statusMsg || httpStatusMsg.INTERNAL_ERROR;
    let message = error.message || "Internal server error";
    let data = error.detail || null;

    if (+error.code === 11000) {
        status = httpStatusCode.BAD_REQUEST;
        statusMsg = httpStatusMsg.VALIDATION_FAILED;
        let msg = {};
        Object.keys(error.keyPattern).map((field) => {
            msg[field] = `${field} already exists`;
        });
        message = msg;
    }

    res.status(status).json({
        statusMsg: statusMsg,
        message: message,
        data: data,
        options: null,
    });
});

export default application;
