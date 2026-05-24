import { userModel } from "../userModel.js";
import { organizationModel } from "./organizationModel.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { mailSvc } from "../../services/emailService.js";
import { organizationRegistrationEmailTemplate } from "../../utilities/emailTemplate.js";

class OrganizationService {
	async registerOrganization(body, file) {
		const { name, email, password, phone, orgName, orgType, registrationNumber, address, city, website, description, contactPerson, contactPhone } = body;

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
			role: "organization",
			phone,
			city,
			isActive: false,
		});

		const org = await organizationModel.create({
			user: user._id,
			orgName,
			orgType,
			registrationNumber,
			address,
			city,
			website,
			description,
			contactPerson,
			contactPhone,
			legalDocument: file ? file.path : null,
			status: "pending",
		});

		return {
			message: "Organization registered. Awaiting admin approval.",
			user: { _id: user._id, name, email, role: "organization" },
			org,
		};
	}

	async sendOrganizationRegistrationEmail(orgUser) {
		const { subject, html } = organizationRegistrationEmailTemplate({
			name: orgUser.name,
			email: orgUser.email,
		});

		await mailSvc.sendEmail(orgUser.email, subject, html);
	}

	async getAllPublicOrgs(query) {
		const { city, orgType } = query;
		const filter = { status: "approved" };
		if (city) filter.city = { $regex: city, $options: "i" };
		if (orgType) filter.orgType = orgType;
		return organizationModel.find(filter).populate("user", "name").sort("-totalDonationsReceived");
	}

	async getOrgProfile(userId) {
		const org = await organizationModel.findOne({ user: userId }).populate("user", "name email phone city");
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Profile not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		return org;
	}

	async updateOrgProfile(userId, body, file) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		const fields = ["orgName", "orgType", "description", "website", "contactPerson", "contactPhone", "address", "city"];
		fields.forEach((f) => {
			if (body[f] !== undefined) org[f] = body[f];
		});
		if (file) org.logo = file.path;
		await org.save();
		return org;
	}

	async getOrgDashboard(userId) {
		const { campaignModel } = await import("../campaign/campaignModel.js");
		const { emergencyModel } = await import("../emergency/emergencyModel.js");

		const org = await organizationModel.findOne({ user: userId });
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}

		const [activeCampaigns, totalCampaigns, activeEmergencies, totalEmergencies] = await Promise.all([campaignModel.countDocuments({ organization: org._id, status: "active" }), campaignModel.countDocuments({ organization: org._id }), emergencyModel.countDocuments({ organization: org._id, status: "active" }), emergencyModel.countDocuments({ organization: org._id })]);

		const recentCampaigns = await campaignModel.find({ organization: org._id }).sort("-createdAt").limit(5);
		const recentEmergencies = await emergencyModel.find({ organization: org._id }).sort("-createdAt").limit(5);

		return {
			org,
			activeCampaigns,
			totalCampaigns,
			activeEmergencies,
			totalEmergencies,
			recentCampaigns,
			recentEmergencies,
		};
	}

	async updateBloodInventory(userId, inventoryData) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		org.bloodInventory = { ...org.bloodInventory, ...inventoryData };
		await org.save();
		return org.bloodInventory;
	}

	async getPublicOrgById(id) {
		const { campaignModel } = await import("../campaign/campaignModel.js");
		const org = await organizationModel.findById(id).populate("user", "name email");
		if (!org || org.status !== "approved") {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		const campaigns = await campaignModel.find({ organization: org._id, status: { $in: ["active", "upcoming"] } }).limit(5);
		return { org, campaigns };
	}
}

export const organizationService = new OrganizationService();
