import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["regular", "emergency", "special"], default: "regular" },
    targetBloodTypes: [
        { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "All"] },
    ],
    targetUnits: { type: Number, default: 50 },
    collectedUnits: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    image: { type: String },
    status: {
        type: String,
        enum: ["upcoming", "active", "completed", "cancelled"],
        default: "upcoming",
    },
    registeredDonors: [
        {
            donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
            registeredAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ["registered", "donated", "cancelled", "no_show"],
                default: "registered",
            },
        },
    ],
    emailSentCount: { type: Number, default: 0 },
    pointsReward: { type: Number, default: 10 },
    tags: [{ type: String }],
    requirements: { type: String },
    contactInfo: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export const campaignModel = mongoose.model("Campaign", campaignSchema);
