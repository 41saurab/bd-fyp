import { emergencyModel } from "./emergencyModel.js";
import { organizationModel } from "../organization/organizationModel.js";
import { donorModel } from "../donor/donorModel.js";
import { notificationModel } from "../notification/notificationModel.js";
import { mailSvc } from "../../services/emailService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { emergencyAlertEmailTemplate } from "../../utilities/emailTemplate.js";

// Returns donor blood types that are compatible with the recipient's blood type
const getCompatibleDonorTypes = (recipientBloodType) => {
	const compatibility = {
		"O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
		"O+": ["O+", "A+", "B+", "AB+"],
		"A-": ["A-", "A+", "AB-", "AB+"],
		"A+": ["A+", "AB+"],
		"B-": ["B-", "B+", "AB-", "AB+"],
		"B+": ["B+", "AB+"],
		"AB-": ["AB-", "AB+"],
		"AB+": ["AB+"],
	};
	return Object.entries(compatibility)
		.filter(([donor, recipients]) => recipients.includes(recipientBloodType))
		.map(([donor]) => donor);
};

class EmergencyService {
	async getAllEmergencies(query) {
		const { bloodType, city, status = "active" } = query;
		const filter = { status };
		if (bloodType) filter.bloodType = bloodType;
		if (city) filter.city = { $regex: city, $options: "i" };
		return emergencyModel
			.find(filter)
			.populate({
				path: "organization",
				select: "orgName city orgType logo",
				populate: { path: "user", select: "name" },
			})
			.sort("-createdAt");
	}

	async getEmergencyById(id) {
		const request = await emergencyModel.findById(id).populate({ path: "organization", populate: { path: "user", select: "name email" } });
		if (!request) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Emergency request not found",
				statusMsg: httpStatusMsg.EMERGENCY_NOT_FOUND,
			};
		}
		return request;
	}

	async createEmergency(userId, body) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org || org.status !== "approved") {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "Organization not approved",
				statusMsg: httpStatusMsg.ORG_NOT_APPROVED,
			};
		}

		const { patientName, bloodType, unitsNeeded, urgencyLevel, reason, location, city, contactPerson, contactPhone, deadline, additionalNotes } = body;

		const request = await emergencyModel.create({
			organization: org._id,
			patientName,
			bloodType,
			unitsNeeded,
			urgencyLevel: urgencyLevel || "urgent",
			reason,
			location,
			city,
			contactPerson,
			contactPhone,
			deadline,
			additionalNotes,
		});

		const compatible = getCompatibleDonorTypes(bloodType);
		const donors = await donorModel.find({ bloodType: { $in: compatible }, "notificationPreferences.emergency": true }).populate("user", "email name");

		let emailCount = 0;

		for (const donor of donors) {
			if (donor.user?.email) {
				const { subject, html } = emergencyAlertEmailTemplate({
					name: donor.user.name,
					orgName: org.orgName,
					patientName,
					bloodType,
					unitsNeeded,
					reason,
					location,
					city,
					deadline,
				});

				await mailSvc.sendEmail(donor.user.email, subject, html);

				await notificationModel.create({
					recipient: donor.user._id,
					title: `🚨 Emergency: ${bloodType} Blood Needed!`,
					message: `${org.orgName} urgently needs ${bloodType} blood in ${city}`,
					type: "emergency",
					link: `/emergency/${request._id}`,
				});

				emailCount++;
			}
		}

		request.emailSentCount = emailCount;
		await request.save();

		return { request, emailSentTo: emailCount };
	}

	async respondToEmergency(requestId, userId) {
		const request = await emergencyModel.findById(requestId);
		if (!request || request.status !== "active") {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: "Emergency request not available",
				statusMsg: httpStatusMsg.EMERGENCY_UNAVAILABLE,
			};
		}

		const donor = await donorModel.findOne({ user: userId });
		const alreadyResponded = request.respondents.find((r) => r.donor.toString() === donor._id.toString());
		if (alreadyResponded) {
			throw {
				status: httpStatusCode.CONFLICT,
				message: "Already responded",
				statusMsg: httpStatusMsg.ALREADY_RESPONDED,
			};
		}

		request.respondents.push({ donor: donor._id });
		await request.save();

		const org = await organizationModel.findById(request.organization).populate("user");
		if (org && org.user) {
			await notificationModel.create({
				recipient: org.user._id,
				title: "Donor Responded to Emergency",
				message: `A donor has responded to your emergency blood request for ${request.bloodType}`,
				type: "info",
			});
		}

		return request;
	}

	async fulfillEmergency(requestId, userId) {
		const request = await emergencyModel.findById(requestId);
		const org = await organizationModel.findOne({ user: userId });
		if (!org || request.organization.toString() !== org._id.toString()) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "Access denied",
				statusMsg: httpStatusMsg.UNAUTHORIZED,
			};
		}
		request.status = "fulfilled";
		await request.save();
		return request;
	}

	async getOrgEmergencies(userId) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		return emergencyModel.find({ organization: org._id }).sort("-createdAt");
	}
}

export const emergencyService = new EmergencyService();
