import { adminService } from "./adminService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class AdminController {
	getStats = async (req, res, next) => {
		try {
			const data = await adminService.getStats();
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Stats fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllOrganizations = async (req, res, next) => {
		try {
			const data = await adminService.getAllOrganizations(req.query);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Organizations fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	updateOrgStatus = async (req, res, next) => {
		try {
			const { status, reason } = req.body;
			const data = await adminService.updateOrgStatus(req.params.id, status, reason, req.loggedInUser._id);

			await adminService.sendOrganizationStatusUpdateEmail({
				name: data.user.name,
				email: data.user.email,
				status,
				reason,
				orgName: data.orgName,
			});
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.RESOURCE_UPDATED,
				message: `Organization ${status}`,
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllDonors = async (req, res, next) => {
		try {
			const data = await adminService.getAllDonors(req.query);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Donors fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	toggleUserStatus = async (req, res, next) => {
		try {
			const data = await adminService.toggleUserStatus(req.params.id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.RESOURCE_UPDATED,
				message: `User ${data.isActive ? "activated" : "deactivated"}`,
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllCampaigns = async (req, res, next) => {
		try {
			const data = await adminService.getAllCampaigns();
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Campaigns fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllEmergencies = async (req, res, next) => {
		try {
			const data = await adminService.getAllEmergencies();
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Emergency requests fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	broadcast = async (req, res, next) => {
		try {
			const { subject, message } = req.body;

			const emails = await adminService.broadcastToAllDonors(subject, message);

			await adminService.sendBroadcastEmail(emails, subject, message);

			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: `Broadcast sent to ${emails.length} donors`,
				data: { count: emails.length },
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};
}

export const adminController = new AdminController();
