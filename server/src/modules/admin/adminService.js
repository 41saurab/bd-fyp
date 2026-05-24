import { userModel } from "../userModel.js";
import { donorModel } from "../donor/donorModel.js";
import { organizationModel } from "../organization/organizationModel.js";
import { campaignModel } from "../campaign/campaignModel.js";
import { emergencyModel } from "../emergency/emergencyModel.js";
import { notificationModel } from "../notification/notificationModel.js";
import { mailSvc } from "../../services/emailService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { broadcastEmailTemplate, organizationStatusUpdateTemplate } from "../../utilities/emailTemplate.js";
import mongoose from "mongoose";

class AdminService {
	async getStats() {
		const [totalDonors, totalOrgs, pendingOrgs, totalCampaigns, activeCampaigns, emergencyRequests, totalUsers] = await Promise.all([donorModel.countDocuments(), organizationModel.countDocuments({ status: "approved" }), organizationModel.countDocuments({ status: "pending" }), campaignModel.countDocuments(), campaignModel.countDocuments({ status: "active" }), emergencyModel.countDocuments({ status: "active" }), userModel.countDocuments()]);

		const bloodTypeStats = await donorModel.aggregate([{ $group: { _id: "$bloodType", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const [recentDonors, recentOrgs] = await Promise.all([
			userModel.countDocuments({
				role: "donor",
				createdAt: { $gte: thirtyDaysAgo },
			}),
			organizationModel.countDocuments({
				createdAt: { $gte: thirtyDaysAgo },
			}),
		]);

		return {
			totalDonors,
			totalOrgs,
			pendingOrgs,
			totalCampaigns,
			activeCampaigns,
			emergencyRequests,
			totalUsers,
			bloodTypeStats,
			recentDonors,
			recentOrgs,
		};
	}

	async getAllOrganizations(query) {
		const { status, page = 1, limit = 10 } = query;
		const filter = status ? { status } : {};
		const orgs = await organizationModel
			.find(filter)
			.populate("user", "name email phone createdAt")
			.sort("-createdAt")
			.skip((page - 1) * limit)
			.limit(parseInt(limit));
		const total = await organizationModel.countDocuments(filter);
		return { orgs, total, pages: Math.ceil(total / limit) };
	}

	async updateOrgStatus(orgId, status, reason, adminId) {
		const org = await organizationModel.findById(orgId).populate("user");
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}

		org.status = status;
		if (status === "approved") {
			org.user.isActive = true;
			org.user.emailVerified = true;
			org.approvedBy = adminId;
			org.approvedAt = new Date();
			await notificationModel.create({
				recipient: org.user._id,
				title: "Organization Approved!",
				message: `${org.orgName} has been approved. You can now create campaigns.`,
				type: "approval",
			});
		}
		await org.save();
		return org;
	}

	async sendOrganizationStatusUpdateEmail(org) {
		const { subject, html } = organizationStatusUpdateTemplate(org);

		await mailSvc.sendEmail(org.email, subject, html);
	}

	async getAllDonors(query) {
		const { page = 1, limit = 10, bloodType, city } = query;
		const filter = {};
		if (bloodType) filter.bloodType = bloodType;
		if (city) filter.city = { $regex: city, $options: "i" };
		const donors = await donorModel
			.find(filter)
			.populate("user", "name email phone city createdAt isActive")
			.sort("-createdAt")
			.skip((page - 1) * limit)
			.limit(parseInt(limit));
		const total = await donorModel.countDocuments(filter);
		return { donors, total, pages: Math.ceil(total / limit) };
	}

	async toggleUserStatus(userId) {
		const user = await userModel.findById(userId);

		if (!user) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "User not found",
				statusMsg: httpStatusMsg.USER_NOT_FOUND,
			};
		}
		user.isActive = !user.isActive;
		await user.save();
		return user;
	}

	async getAllCampaigns() {
		return campaignModel
			.find()
			.populate({
				path: "organization",
				populate: { path: "user", select: "name email" },
			})
			.sort("-createdAt")
			.limit(50);
	}

	async getAllEmergencies() {
		return emergencyModel
			.find()
			.populate({
				path: "organization",
				populate: { path: "user", select: "name email" },
			})
			.sort("-createdAt")
			.limit(50);
	}

	async broadcastToAllDonors(subject, message) {
		const donors = await donorModel.find().populate("user", "email name");

		const emails = [];

		for (const donor of donors) {
			if (donor.user?.email) {
				emails.push(donor.user.email);

				await notificationModel.create({
					recipient: donor.user._id,
					title: subject,
					message,
					type: "info",
				});
			}
		}

		return emails;
	}

	async sendBroadcastEmail(emails, subject, message) {
		const { subject: emailSubject, html } = broadcastEmailTemplate({ subject, message });

		for (const email of emails) {
			await mailSvc.sendEmail(email, emailSubject, html);
		}
	}
}

export const adminService = new AdminService();
