import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ["info", "success", "warning", "emergency", "campaign", "approval", "badge", "reminder"],
        default: "info",
    },
    link: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export const notificationModel = mongoose.model("Notification", notificationSchema);
