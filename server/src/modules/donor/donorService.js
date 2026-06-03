import jwt from "jsonwebtoken";
import { userModel } from "../userModel.js";
import { donorModel } from "./donorModel.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { mailSvc } from "../../services/emailService.js";
import { donorWelcomeEmailTemplate } from "../../utilities/emailTemplate.js";
import FileUploadService from "../../services/cloudinary-service.js";

const signToken = (id) =>
	jwt.sign({ sub: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "7d",
	});

class DonorService {
	async registerDonor(body) {
		const { name, email, password, phone, city, bloodType, dateOfBirth, gender, weight, latitude, longitude } = body;

		const existing = await userModel.findOne({ email });
		if (existing) {
			throw {
				status: httpStatusCode.CONFLICT,
				message: "Email already registered",
				statusMsg: httpStatusMsg.ALREADY_EXISTS,
			};
		}

		const user = await userModel.create({
			name,
			email,
			password,
			role: "donor",
			phone,
			city,
		});

		const location = latitude && longitude ? { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] } : undefined;

		const donor = await donorModel.create({
			user: user._id,
			bloodType,
			city,
			dateOfBirth,
			gender,
			weight,
			location,
		});

		return {
			token: signToken(user._id),
			user: { _id: user._id, name, email, role: "donor" },
			donor,
		};
	}

	async sendDonorRegistrationEmail(donor) {
		const { subject, html } = donorWelcomeEmailTemplate({
			name: donor.name,
			email: donor.email,
			city: donor.city,
			bloodType: donor.bloodType,
		});

		await mailSvc.sendEmail(donor.email, subject, html);
	}

	async login(email, password) {
		const user = await userModel.findOne({ email });
		if (!user || !(await user.comparePassword(password))) {
			throw {
				status: httpStatusCode.UNAUTHORIZED,
				message: "Invalid credentials",
				statusMsg: httpStatusMsg.INVALID_CREDENTIALS,
			};
		}

		if (!user.isActive) {
			throw {
				status: httpStatusCode.UNAUTHORIZED,
				message: "Account deactivated",
				statusMsg: httpStatusMsg.ACCOUNT_DEACTIVATED,
			};
		}

		let profile = null;
		if (user.role === "donor") {
			profile = await donorModel.findOne({ user: user._id });
		} else if (user.role === "organization") {
			const { organizationModel } = await import("../organization/organizationModel.js");
			profile = await organizationModel.findOne({ user: user._id });
		}

		return {
			token: signToken(user._id),
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
				city: user.city,
			},
			profile,
		};
	}

	async getMe(userId) {
		const user = await userModel.findById(userId).select("-password");
		if (!user) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "User not found",
				statusMsg: httpStatusMsg.USER_NOT_FOUND,
			};
		}

		let profile = null;
		if (user.role === "donor") {
			profile = await donorModel.findOne({ user: user._id });
		} else if (user.role === "organization") {
			const { organizationModel } = await import("../organization/organizationModel.js");
			profile = await organizationModel.findOne({ user: user._id });
		}

		return { user, profile };
	}

	async getDonorProfile(userId) {
		const donor = await donorModel.findOne({ user: userId }).populate("user", "name email phone city").populate("donationHistory.campaign", "title startDate").populate("donationHistory.organization", "orgName");

		if (!donor) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Profile not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}
		return donor;
	}

	async updateDonorProfile(userId, body, file) {
		const { city, weight, availability, notificationPreferences, address, medicalConditions, latitude, longitude } = body;

		const donor = await donorModel.findOne({ user: userId });
		if (!donor) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}

		if (city) donor.city = city;
		if (weight) donor.weight = weight;
		if (availability !== undefined) donor.availability = availability;
		if (notificationPreferences)
			donor.notificationPreferences = {
				...donor.notificationPreferences,
				...JSON.parse(notificationPreferences),
			};
		if (address) donor.address = address;
		if (medicalConditions) donor.medicalConditions = JSON.parse(medicalConditions);

		if (latitude && longitude) {
			donor.location = {
				type: "Point",
				coordinates: [parseFloat(longitude), parseFloat(latitude)],
			};
		}

		if (file) {
			const uploadResult = await FileUploadService.uploadFile(file.path, "donor-profiles");
			donor.profileImage = uploadResult;
		}
		donor.isEligible = donor.checkEligibility();

		await donor.save();

		const updates = {};
		if (body.name) updates.name = body.name;
		if (body.phone) updates.phone = body.phone;
		if (city) updates.city = city;
		if (Object.keys(updates).length) await userModel.findByIdAndUpdate(userId, updates);

		return donor;
	}

	async getLeaderboard() {
		return donorModel.find().populate("user", "name city").sort("-points").limit(20);
	}

	async getDonorStats(userId) {
		const donor = await donorModel.findOne({ user: userId });
		if (!donor) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}
		donor.isEligible = donor.checkEligibility();
		const daysUntilEligible = donor.lastDonationDate ? Math.max(0, 56 - Math.floor((Date.now() - donor.lastDonationDate) / (1000 * 60 * 60 * 24))) : 0;

		return {
			totalDonations: donor.totalDonations,
			points: donor.points,
			badges: donor.badges,
			isEligible: donor.isEligible,
			daysUntilEligible,
			lastDonationDate: donor.lastDonationDate,
		};
	}

	async getDonorsNearLocation(lat, lng, radiusKm = 10, bloodType) {
		const filter = {
			availability: true,
			isEligible: true,
			location: {
				$near: {
					$geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
					$maxDistance: radiusKm * 1000,
				},
			},
		};
		if (bloodType) filter.bloodType = bloodType;

		return donorModel.find(filter).populate("user", "name email phone city").limit(50);
	}
}

export const donorService = new DonorService();
