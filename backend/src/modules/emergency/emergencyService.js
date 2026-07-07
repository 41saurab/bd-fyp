import { emergencyModel } from "./emergencyModel.js";
import { organizationModel } from "../organization/organizationModel.js";
import { donorModel } from "../donor/donorModel.js";
import { notificationModel } from "../notification/notificationModel.js";
import { mailSvc } from "../../services/emailService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { emergencyAlertEmailTemplate, badgeEarnedEmailTemplate, emergencyCancelledEmailTemplate } from "../../utilities/emailTemplate.js";

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

const NEARBY_RADIUS_METERS = 10_000;
const FALLBACK_RADIUS_METERS = 50_000;
const MIN_NEARBY_DONORS = 5;

// Emergency donations pay more points than a routine campaign donation —
// they're unscheduled and time-critical for the donor, and the more urgent
// the request, the bigger the reward.
const EMERGENCY_POINTS_BY_URGENCY = {
	critical: 25,
	urgent: 15,
	moderate: 10,
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

	async getNearbyEmergencies(lat, lng, radiusKm = 50, bloodType) {
		const radiusMeters = radiusKm * 1000;
		const filter = {
			status: "active",
			geoLocation: {
				$near: {
					$geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
					$maxDistance: radiusMeters,
				},
			},
		};
		if (bloodType) filter.bloodType = bloodType;

		return emergencyModel.find(filter).populate({
			path: "organization",
			select: "orgName city orgType logo",
			populate: { path: "user", select: "name" },
		});
	}

	async getEmergencyById(id, requester) {
		const request = await emergencyModel.findById(id).populate({ path: "organization", populate: { path: "user", select: "name email" } });
		if (!request) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Emergency request not found",
				statusMsg: httpStatusMsg.EMERGENCY_NOT_FOUND,
			};
		}

		// Figure out whether the viewer is allowed to see WHO responded.
		// This endpoint is public (no login required), so without this check
		// anyone could read every responding donor's name/phone/email just by
		// opening the page — a real PII leak, not just a UX nicety.
		let isAuthorizedViewer = false;
		let viewerDonorId = null;

		if (requester?.role === "admin") {
			isAuthorizedViewer = true;
		} else if (requester?.role === "organization") {
			const org = await organizationModel.findOne({ user: requester._id }).select("_id");
			isAuthorizedViewer = !!org && org._id.toString() === request.organization._id.toString();
		} else if (requester?.role === "donor") {
			const donor = await donorModel.findOne({ user: requester._id }).select("_id");
			viewerDonorId = donor?._id?.toString() || null;
		}

		const plain = request.toObject();
		const respondentCount = plain.respondents.length;
		// Comparing respondents.donor (a Donor _id) against a donor's own
		// Donor _id — not the User _id, which is a different collection's id
		// and would never match.
		const hasResponded = viewerDonorId ? plain.respondents.some((r) => r.donor.toString() === viewerDonorId) : false;

		if (isAuthorizedViewer) {
			await request.populate({ path: "respondents.donor", populate: { path: "user", select: "name email phone" } });
			plain.respondents = request.toObject().respondents;
		} else {
			// Strip donor identities for everyone else (other donors, guests).
			delete plain.respondents;
		}

		return { ...plain, respondentCount, hasResponded };
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

		const { patientName, bloodType, unitsNeeded, urgencyLevel, reason, location, city, contactPerson, contactPhone, deadline, additionalNotes, latitude, longitude } = body;
		const lat = latitude === "" ? null : latitude;
		const lng = longitude === "" ? null : longitude;
		const geoLocation = lat != null && lng != null ? { type: "Point", coordinates: [Number(lng), Number(lat)] } : undefined;

		const resolvedUrgency = urgencyLevel || "urgent";

		const request = await emergencyModel.create({
			organization: org._id,
			patientName,
			bloodType,
			unitsNeeded,
			urgencyLevel: resolvedUrgency,
			reason,
			location,
			city,
			contactPerson,
			contactPhone,
			deadline,
			additionalNotes,
			geoLocation,
			pointsReward: EMERGENCY_POINTS_BY_URGENCY[resolvedUrgency] || 15,
		});

		const compatible = getCompatibleDonorTypes(bloodType);

		let donors = [];

		if (geoLocation) {
			// const nearbyBaseFilter = {
			// 	bloodType: { $in: compatible },
			// 	"notificationPreferences.emergency": true,
			// 	availability: true,
			// 	isEligible: true,
			// 	location: {
			// 		$near: {
			// 			$geometry: geoLocation,
			// 			$maxDistance: NEARBY_RADIUS_METERS,
			// 		},
			// 	},
			// };
			const baseFilter = {
				bloodType: { $in: compatible },
				"notificationPreferences.emergency": true,
				availability: true,
				isEligible: true,
			};

			donors = await donorModel
				.find({
					...baseFilter,
					location: {
						$near: {
							$geometry: geoLocation,
							$maxDistance: NEARBY_RADIUS_METERS,
						},
					},
				})
				.populate("user", "email name");

			if (donors.length < MIN_NEARBY_DONORS) {
				donors = await donorModel
					.find({
						...baseFilter,
						location: {
							$near: {
								$geometry: geoLocation,
								$maxDistance: FALLBACK_RADIUS_METERS,
							},
						},
					})
					.populate("user", "email name");
			}

			if (donors.length === 0) {
				donors = await donorModel
					.find({
						...baseFilter,
						city: { $regex: city, $options: "i" },
					})
					.populate("user", "email name");
			}
		} else {
			donors = await donorModel
				.find({
					bloodType: { $in: compatible },
					"notificationPreferences.emergency": true,
					city: { $regex: city, $options: "i" },
				})
				.populate("user", "email name");
		}

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

		if (!donor) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor profile not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}

		const isCompatible = request.bloodType === donor.bloodType || request.bloodType === "All";

		if (!isCompatible) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: `This emergency requires ${request.bloodType} blood type`,
				statusMsg: "INCOMPATIBLE_BLOOD_TYPE",
			};
		}

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
				message: `A donor has responded for ${request.bloodType} emergency`,
				type: "info",
			});
		}

		return request;
	}

	async _getOwnedEmergency(requestId, userId) {
		const request = await emergencyModel.findById(requestId);
		if (!request) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Emergency request not found",
				statusMsg: httpStatusMsg.EMERGENCY_NOT_FOUND,
			};
		}
		const org = await organizationModel.findOne({ user: userId });
		if (!org || request.organization.toString() !== org._id.toString()) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "You can only manage your own emergency requests",
				statusMsg: httpStatusMsg.UNAUTHORIZED,
			};
		}
		return { request, org };
	}

	// Records that a specific responding donor actually donated for this
	// emergency — the counterpart to campaignService.markDonation. Without
	// this, "respond" only ever registered interest; nothing downstream
	// (points, badges, donation history, org inventory) ever fired for
	// emergency donors even though the exact same thing happens for a
	// campaign donation via markDonation.
	async markEmergencyDonation(requestId, donorId, orgUserId) {
		const request = await emergencyModel.findById(requestId);
		if (!request) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Emergency request not found",
				statusMsg: httpStatusMsg.EMERGENCY_NOT_FOUND,
			};
		}

		// Ownership check — same reasoning as campaign markDonation: without
		// it any authenticated org could credit donations on someone else's
		// emergency request.
		const org = await organizationModel.findOne({ user: orgUserId });
		if (!org || request.organization.toString() !== org._id.toString()) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "You can only record donations for your own emergency requests",
				statusMsg: httpStatusMsg.UNAUTHORIZED,
			};
		}

		const donor = await donorModel.findById(donorId).populate("user");
		if (!donor) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}

		const respondent = request.respondents.find((r) => r.donor?.toString() === donorId);
		if (!respondent) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor has not responded to this request",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}
		if (respondent.status === "donated") {
			return { message: "Donation already marked" };
		}

		if (["fulfilled", "expired", "cancelled"].includes(request.status)) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `This request is ${request.status} and can no longer accept donations`,
				statusMsg: httpStatusMsg.EMERGENCY_UNAVAILABLE,
			};
		}

		respondent.status = "donated";
		request.unitsReceived += 1;
		// Auto-close once enough units have come in, same as an org would do
		// manually via fulfillEmergency — but don't fight a manual close.
		if (request.unitsReceived >= request.unitsNeeded) {
			request.status = "fulfilled";
		}
		await request.save();

		const pointsEarned = request.pointsReward || EMERGENCY_POINTS_BY_URGENCY[request.urgencyLevel] || 15;

		donor.totalDonations += 1;
		donor.lastDonationDate = new Date();
		donor.isEligible = false;
		donor.points += pointsEarned;
		donor.donationHistory.push({
			source: "emergency",
			emergency: request._id,
			organization: request.organization,
			date: new Date(),
			units: 1,
			pointsEarned,
		});

		const prevBadges = [...donor.badges];
		donor.updateBadges();
		const newBadge = donor.badges.find((b) => !prevBadges.includes(b));
		await donor.save();

		// Auto-credit the organization's inventory/total, same as campaigns —
		// otherwise emergency donations never showed up in stock at all.
		if (org.bloodInventory && donor.bloodType in org.bloodInventory) {
			org.bloodInventory[donor.bloodType] = (org.bloodInventory[donor.bloodType] || 0) + 1;
		}
		org.totalDonationsReceived += 1;
		await org.save();

		if (donor.user) {
			await notificationModel.create({
				recipient: donor.user._id,
				title: "Thank You for Donating!",
				message: `You earned ${pointsEarned} points for donating in response to the ${request.bloodType} emergency for ${request.patientName}.`,
				type: "success",
			});
		}

		if (newBadge && donor.user) {
			const { subject, html } = badgeEarnedEmailTemplate({
				name: donor.user.name,
				badge: newBadge,
				totalDonations: donor.totalDonations,
			});

			await mailSvc.sendEmail(donor.user.email, subject, html);

			await notificationModel.create({
				recipient: donor.user._id,
				title: `🏆 Badge Earned: ${newBadge}!`,
				message: `Congratulations! You've earned the "${newBadge}" badge!`,
				type: "badge",
			});
		}

		return { donor, request, newBadge };
	}

	async fulfillEmergency(requestId, userId) {
		const { request } = await this._getOwnedEmergency(requestId, userId);
		request.status = "fulfilled";
		await request.save();
		return request;
	}

	async updateEmergency(requestId, userId, body) {
		const { request } = await this._getOwnedEmergency(requestId, userId);

		if (request.status !== "active") {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `A ${request.status} emergency request can no longer be edited`,
				statusMsg: httpStatusMsg.EMERGENCY_UNAVAILABLE,
			};
		}

		const { patientName, bloodType, unitsNeeded, urgencyLevel, reason, location, city, contactPerson, contactPhone, deadline, additionalNotes, latitude, longitude } = body;

		if (unitsNeeded != null && Number(unitsNeeded) < request.unitsReceived) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `Units needed can't be set below the ${request.unitsReceived} units already received`,
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			};
		}

		if (patientName !== undefined) request.patientName = patientName;
		if (bloodType !== undefined) request.bloodType = bloodType;
		if (unitsNeeded !== undefined) request.unitsNeeded = unitsNeeded;
		if (urgencyLevel !== undefined) {
			request.urgencyLevel = urgencyLevel;
			// Keep the point reward in sync with urgency so donors who
			// respond after an edit still get the right amount.
			request.pointsReward = EMERGENCY_POINTS_BY_URGENCY[urgencyLevel] || request.pointsReward;
		}
		if (reason !== undefined) request.reason = reason;
		if (location !== undefined) request.location = location;
		if (city !== undefined) request.city = city;
		if (contactPerson !== undefined) request.contactPerson = contactPerson;
		if (contactPhone !== undefined) request.contactPhone = contactPhone;
		if (deadline !== undefined) request.deadline = deadline;
		if (additionalNotes !== undefined) request.additionalNotes = additionalNotes;

		const lat = latitude === "" ? null : latitude;
		const lng = longitude === "" ? null : longitude;
		if (lat != null && lng != null) {
			request.geoLocation = { type: "Point", coordinates: [Number(lng), Number(lat)] };
		}

		await request.save();
		return request;
	}

	async cancelEmergency(requestId, userId) {
		const { request, org } = await this._getOwnedEmergency(requestId, userId);
		if (["fulfilled", "cancelled"].includes(request.status)) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `This request is already ${request.status}`,
				statusMsg: httpStatusMsg.EMERGENCY_UNAVAILABLE,
			};
		}
		request.status = "cancelled";
		await request.save();

		for (const r of request.respondents) {
			const donor = await donorModel.findById(r.donor).populate("user", "name email");
			if (donor?.user) {
				await notificationModel.create({
					recipient: donor.user._id,
					title: "Emergency Request Cancelled",
					message: `The ${request.bloodType} emergency request you responded to has been cancelled.`,
					type: "warning",
				});

				if (donor.user.email) {
					const { subject, html } = emergencyCancelledEmailTemplate({
						name: donor.user.name,
						orgName: org.orgName,
						bloodType: request.bloodType,
						patientName: request.patientName,
						city: request.city,
					});

					await mailSvc.sendEmail(donor.user.email, subject, html);
				}
			}
		}

		return request;
	}

	async deleteEmergency(requestId, userId) {
		const { request } = await this._getOwnedEmergency(requestId, userId);

		// Same reasoning as campaigns: once someone has responded, deleting
		// outright would silently erase their response from history. Cancel
		// instead to keep the record but stop it from being actionable.
		if (request.respondents.length > 0) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `This request has ${request.respondents.length} donor response(s) and can't be deleted — cancel it instead to preserve their history.`,
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			};
		}

		await emergencyModel.findByIdAndDelete(requestId);
		return { deleted: true };
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
