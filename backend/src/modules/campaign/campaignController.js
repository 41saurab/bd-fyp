import { campaignService } from "./campaignService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class CampaignController {
	getAllCampaigns = async (req, res, next) => {
		try {
			const data = await campaignService.getAllCampaigns(req.query);
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

	getCampaignById = async (req, res, next) => {
		try {
			const data = await campaignService.getCampaignById(req.params.id, req.loggedInUser);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Campaign fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	createCampaign = async (req, res, next) => {
		try {
			const data = await campaignService.createCampaign(req.loggedInUser._id, req.body, req.file);
			res.status(httpStatusCode.CREATED).json({
				statusMsg: httpStatusMsg.RESOURCE_CREATED,
				message: "Campaign created",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	updateCampaign = async (req, res, next) => {
		try {
			const data = await campaignService.updateCampaign(req.params.id, req.loggedInUser._id, req.body, req.file);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Campaign updated",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	cancelCampaign = async (req, res, next) => {
		try {
			const data = await campaignService.cancelCampaign(req.params.id, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Campaign cancelled",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	deleteCampaign = async (req, res, next) => {
		try {
			const data = await campaignService.deleteCampaign(req.params.id, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Campaign deleted",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	registerForCampaign = async (req, res, next) => {
		try {
			const data = await campaignService.registerForCampaign(req.params.id, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Registered successfully",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	markDonation = async (req, res, next) => {
		try {
			const data = await campaignService.markDonation(req.params.id, req.params.donorId, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Donation recorded",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getOrgCampaigns = async (req, res, next) => {
		try {
			const data = await campaignService.getOrgCampaigns(req.loggedInUser._id);
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

	getNearbyCampaigns = async (req, res, next) => {
		try {
			const data = await campaignService.getNearbyCampaigns(req.query);

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
}

export const campaignController = new CampaignController();
