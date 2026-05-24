import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgName: { type: String, required: true },
    orgType: {
        type: String,
        enum: ["hospital", "blood_bank", "clinic", "ngo", "other"],
        required: true,
    },
    registrationNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String },
    description: { type: String },
    contactPerson: { type: String },
    contactPhone: { type: String },
    legalDocument: { type: String },
    logo: { type: String },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    bloodInventory: {
        "A+": { type: Number, default: 0 },
        "A-": { type: Number, default: 0 },
        "B+": { type: Number, default: 0 },
        "B-": { type: Number, default: 0 },
        "AB+": { type: Number, default: 0 },
        "AB-": { type: Number, default: 0 },
        "O+": { type: Number, default: 0 },
        "O-": { type: Number, default: 0 },
    },
    totalCampaigns: { type: Number, default: 0 },
    totalDonationsReceived: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: [
        {
            donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String },
            date: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

export const organizationModel = mongoose.model(
    "Organization",
    organizationSchema
);
