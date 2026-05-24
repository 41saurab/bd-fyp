import { dbConnection } from "../src/configs/dbConfig.js";
import { userModel } from "../src/modules/userModel.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const seedAdmin = async () => {
    try {
        await dbConnection();
        const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
        const existing = await userModel.findOne({ email: adminEmail });
        if (!existing) {
            await userModel.create({
                name: "System Admin",
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || "Admin@123",
                role: "admin",
            });
            console.log(`✅ Admin created: ${adminEmail}`);
        } else {
            console.log(`ℹ️  Admin already exists: ${adminEmail}`);
        }
        process.exit(0);
    } catch (err) {
        console.error("Seed admin error:", err.message);
        process.exit(1);
    }
};

seedAdmin();
