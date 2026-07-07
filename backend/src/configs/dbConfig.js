import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            autoCreate: true,
            autoIndex: true,
        });

        console.log("Connected to database");
    } catch (error) {
        console.log(`Error connecting to database: ${error}`);
        process.exit(1);
    }
};
