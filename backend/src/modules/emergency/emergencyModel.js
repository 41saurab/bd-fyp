import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
	organization: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Organization",
		required: true,
	},
	patientName: { type: String, required: true },
	bloodType: {
		type: String,
		enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
		required: true,
	},
	unitsNeeded: { type: Number, required: true },
	unitsReceived: { type: Number, default: 0 },
	urgencyLevel: {
		type: String,
		enum: ["critical", "urgent", "moderate"],
		default: "urgent",
	},
	// Emergency donations reward more points than a routine campaign donation
	// since they're time-critical and unscheduled for the donor. Mirrors
	// campaign.pointsReward but derived from urgency rather than set by the org.
	pointsReward: { type: Number, default: 15 },
	reason: { type: String, required: true },
	location: { type: String, required: true },
	city: { type: String, required: true },

	geoLocation: {
		type: {
			type: String,
			enum: ["Point"],
		},
		coordinates: {
			type: [Number],
		},
	},

	contactPerson: { type: String, required: true },
	contactPhone: { type: String, required: true },
	deadline: { type: Date },
	status: {
		type: String,
		enum: ["active", "fulfilled", "expired", "cancelled"],
		default: "active",
	},
	respondents: [
		{
			donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
			respondedAt: { type: Date, default: Date.now },
			status: {
				type: String,
				enum: ["interested", "donated", "cancelled"],
				default: "interested",
			},
		},
	],
	emailSentCount: { type: Number, default: 0 },
	additionalNotes: { type: String },
	createdAt: { type: Date, default: Date.now },
});

emergencySchema.index({ geoLocation: "2dsphere" });

export const emergencyModel = mongoose.model("EmergencyRequest", emergencySchema);
