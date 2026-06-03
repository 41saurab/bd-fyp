import { emergencyService } from "./emergencyService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";

class EmergencyController {
	getAllEmergencies = async (req, res, next) => {
		try {
			const data = await emergencyService.getAllEmergencies(req.query);
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

	// ✅ NEW: GET /emergencies/nearby?lat=27.7&lng=85.3&radius=20&bloodType=A+
	getNearbyEmergencies = async (req, res, next) => {
		try {
			const { lat, lng, radius = 50, bloodType } = req.query;
			if (!lat || !lng) {
				return res.status(httpStatusCode.BAD_REQUEST).json({
					statusMsg: "VALIDATION_ERROR",
					message: "lat and lng query parameters are required",
					data: null,
					options: null,
				});
			}
			const data = await emergencyService.getNearbyEmergencies(lat, lng, parseFloat(radius), bloodType);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Nearby emergency requests fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getEmergencyById = async (req, res, next) => {
		try {
			const data = await emergencyService.getEmergencyById(req.params.id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Emergency request fetched",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	createEmergency = async (req, res, next) => {
		try {
			const data = await emergencyService.createEmergency(req.loggedInUser._id, req.body);
			res.status(httpStatusCode.CREATED).json({
				statusMsg: httpStatusMsg.RESOURCE_CREATED,
				message: "Emergency request created",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	respondToEmergency = async (req, res, next) => {
		try {
			const data = await emergencyService.respondToEmergency(req.params.id, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Response recorded. The hospital will contact you.",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	fulfillEmergency = async (req, res, next) => {
		try {
			const data = await emergencyService.fulfillEmergency(req.params.id, req.loggedInUser._id);
			res.status(httpStatusCode.OK).json({
				statusMsg: httpStatusMsg.SUCCESS,
				message: "Request marked as fulfilled",
				data,
				options: null,
			});
		} catch (error) {
			next(error);
		}
	};

	getOrgEmergencies = async (req, res, next) => {
		try {
			const data = await emergencyService.getOrgEmergencies(req.loggedInUser._id);
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
}

export const emergencyController = new EmergencyController();
