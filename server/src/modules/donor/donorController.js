import { donorService } from "./donorService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class DonorController {
	registerDonor = async (req, res, next) => {
		try {
			const data = await donorService.registerDonor(req.body);
			await donorService.sendDonorRegistrationEmail({
				name: data.user.name,
				email: data.user.email,
				bloodType: data.donor.bloodType,
			});
			res.status(httpStatusCode.CREATED).json({
				statusMsg: httpStatusMsg.RESOURCE_CREATED,
				message: "Donor registered successfully",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	login = async (req, res, next) => {
		try {
			const { email, password } = req.body;
			const data = await donorService.login(email, password);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Login successful",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getMe = async (req, res, next) => {
		try {
			const data = await donorService.getMe(req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "User fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getDonorProfile = async (req, res, next) => {
		try {
			const data = await donorService.getDonorProfile(req.loggedInUser._id);
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

	updateDonorProfile = async (req, res, next) => {
		try {
			const data = await donorService.updateDonorProfile(req.loggedInUser._id, req.body, req.file);
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

	getLeaderboard = async (req, res, next) => {
		try {
			const data = await donorService.getLeaderboard();
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Leaderboard fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getDonorStats = async (req, res, next) => {
		try {
			const data = await donorService.getDonorStats(req.loggedInUser._id);
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
}

export const donorController = new DonorController();
