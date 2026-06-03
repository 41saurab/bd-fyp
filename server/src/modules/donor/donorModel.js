import mongoose from "mongoose";

const donorSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	bloodType: {
		type: String,
		enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
		required: true,
	},
	dateOfBirth: { type: Date },
	gender: { type: String, enum: ["male", "female", "other"] },
	weight: { type: Number },
	address: { type: String },
	city: { type: String },

	location: {
		type: {
			type: String,
			enum: ["Point"],
			default: "Point",
		},
		coordinates: {
			type: [Number],
			default: undefined,
		},
	},

	lastDonationDate: { type: Date },
	totalDonations: { type: Number, default: 0 },
	points: { type: Number, default: 0 },
	badges: [{ type: String }],
	isEligible: { type: Boolean, default: true },
	medicalConditions: [{ type: String }],
	notificationPreferences: {
		campaigns: { type: Boolean, default: true },
		emergency: { type: Boolean, default: true },
		reminders: { type: Boolean, default: true },
	},
	availability: { type: Boolean, default: true },
	profileImage: { type: String },
	donationHistory: [
		{
			campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
			organization: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Organization",
			},
			date: { type: Date },
			units: { type: Number, default: 1 },
			pointsEarned: { type: Number, default: 10 },
			certificate: { type: String },
		},
	],
	createdAt: { type: Date, default: Date.now },
});

donorSchema.index({ location: "2dsphere" });

donorSchema.index({ bloodType: 1, availability: 1, isEligible: 1 });

donorSchema.methods.checkEligibility = function () {
	if (!this.lastDonationDate) return true;
	const daysSince = (Date.now() - this.lastDonationDate) / (1000 * 60 * 60 * 24);
	return daysSince >= 56;
};

donorSchema.methods.updateBadges = function () {
	const count = this.totalDonations;
	const badges = [];
	if (count >= 1) badges.push("First Drop");
	if (count >= 5) badges.push("Life Saver");
	if (count >= 10) badges.push("Hero");
	if (count >= 25) badges.push("Champion");
	if (count >= 50) badges.push("Legend");
	this.badges = badges;
};

export const donorModel = mongoose.model("Donor", donorSchema);
