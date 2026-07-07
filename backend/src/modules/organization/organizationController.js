import { organizationService } from "./organizationService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class OrganizationController {
	registerOrganization = async (req, res, next) => {
		try {
			const data = await organizationService.registerOrganization(req.body, req.file);
			await organizationService.sendOrganizationRegistrationEmail({
				name: data.user.name,
				email: data.user.email,
			});
			res.status(httpStatusCode.CREATED).json({
				statusMsg: httpStatusMsg.RESOURCE_CREATED,
				message: data.message,
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllPublicOrgs = async (req, res, next) => {
		try {
			const data = await organizationService.getAllPublicOrgs(req.query);
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

	getOrgProfile = async (req, res, next) => {
		try {
			const data = await organizationService.getOrgProfile(req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Profile fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	updateOrgProfile = async (req, res, next) => {
		try {
			const data = await organizationService.updateOrgProfile(req.loggedInUser._id, req.body, req.file);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.RESOURCE_UPDATED,
				message: "Profile updated",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getOrgDashboard = async (req, res, next) => {
		try {
			const data = await organizationService.getOrgDashboard(req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Dashboard data fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	updateBloodInventory = async (req, res, next) => {
		try {
			const data = await organizationService.updateBloodInventory(req.loggedInUser._id, req.body);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.RESOURCE_UPDATED,
				message: "Inventory updated",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getPublicOrgById = async (req, res, next) => {
		try {
			const data = await organizationService.getPublicOrgById(req.params.id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Organization fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};
}

export const organizationController = new OrganizationController();
