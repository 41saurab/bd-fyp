import { campaignModel } from "./campaignModel.js";
import { organizationModel } from "../organization/organizationModel.js";
import { donorModel } from "../donor/donorModel.js";
import { notificationModel } from "../notification/notificationModel.js";
import { mailSvc } from "../../services/emailService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { badgeEarnedEmailTemplate, campaignInviteEmailTemplate } from "../../utilities/emailTemplate.js";
import FileUploadService from "../../services/cloudinary-service.js";

const CAMPAIGN_NOTIFY_RADIUS_METERS = 25_000;

class CampaignService {
	async getAllCampaigns(query) {
		const { status, city, bloodType, page = 1, limit = 12 } = query;

		const filter = {};

		if (status) filter.status = status;

		if (city) {
			filter.city = { $regex: city, $options: "i" };
		}

		if (bloodType && bloodType !== "All") {
			filter.targetBloodTypes = { $in: [bloodType, "All"] };
		}

		const campaigns = await campaignModel
			.find(filter)
			.populate({
				path: "organization",
				select: "orgName city orgType logo",
				populate: { path: "user", select: "name" },
			})
			.sort("-createdAt")
			.skip((page - 1) * limit)
			.limit(parseInt(limit));

		const total = await campaignModel.countDocuments(filter);

		return {
			campaigns,
			total,
			pages: Math.ceil(total / limit),
		};
	}

	// async getCampaignById(id) {
	// 	const campaign = await campaignModel
	// 		.findById(id)
	// 		.populate({ path: "organization", populate: { path: "user", select: "name email" } })
	// 		.populate("registeredDonors.donor");
	// 	if (!campaign) {
	// 		throw {
	// 			status: httpStatusCode.NOT_FOUND,
	// 			message: "Campaign not found",
	// 			statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
	// 		};
	// 	}
	// 	return campaign;
	// }
	async getCampaignById(id) {
		const campaign = await campaignModel
			.findById(id)
			.populate({
				path: "organization",
				populate: { path: "user", select: "name email" },
			})
			.populate("registeredDonors.donor");

		if (!campaign) {
			throw {
				status: 404,
				message: "Campaign not found",
				statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
			};
		}

		return campaign;
	}

	async createCampaign(userId, body, file) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org || org.status !== "approved") {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "Organization not approved",
				statusMsg: httpStatusMsg.ORG_NOT_APPROVED,
			};
		}
		let imageUrl = null;

		if (file) {
			const uploadResult = await FileUploadService.uploadFile(file.path, "campaigns");
			imageUrl = uploadResult;
		}

		const { title, description, type, targetBloodTypes, targetUnits, startDate, endDate, venue, city, address, pointsReward, requirements, contactInfo, tags, latitude, longitude } = body;

		const geoLocation =
			latitude != null && longitude != null
				? {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					}
				: undefined;

		const campaign = await campaignModel.create({
			organization: org._id,
			title,
			description,
			type: type || "regular",
			targetBloodTypes: typeof targetBloodTypes === "string" ? JSON.parse(targetBloodTypes) : targetBloodTypes,
			targetUnits,
			startDate,
			endDate,
			venue,
			city,
			address,
			image: imageUrl,
			geoLocation,
			pointsReward: pointsReward || 10,
			requirements,
			contactInfo,
			tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
			status: new Date(startDate) <= new Date() ? "active" : "upcoming",
		});

		org.totalCampaigns += 1;
		await org.save();

		let donors = [];
		const bloodTypesFilter = campaign.targetBloodTypes.includes("All") ? {} : { bloodType: { $in: campaign.targetBloodTypes } };

		if (geoLocation) {
			donors = await donorModel
				.find({
					...bloodTypesFilter,
					"notificationPreferences.campaigns": true,
					location: {
						$near: {
							$geometry: geoLocation,
							$maxDistance: CAMPAIGN_NOTIFY_RADIUS_METERS,
						},
					},
				})
				.populate("user", "email name");
		}

		if (!geoLocation || donors.length === 0) {
			donors = await donorModel
				.find({
					...bloodTypesFilter,
					city: { $regex: city, $options: "i" },
					"notificationPreferences.campaigns": true,
				})
				.populate("user", "email name");
		}

		let emailCount = 0;

		for (const donor of donors) {
			if (donor.user?.email) {
				const { subject, html } = campaignInviteEmailTemplate({
					donorName: donor.user.name,
					campaignTitle: campaign.title,
					orgName: org.orgName,
					city: campaign.city,
					venue: campaign.venue,
					startDate: campaign.startDate,
					endDate: campaign.endDate,
				});

				await mailSvc.sendEmail(donor.user.email, subject, html);

				await notificationModel.create({
					recipient: donor.user._id,
					title: `New Campaign: ${title}`,
					message: `${org.orgName} is organizing a blood donation campaign in ${city}`,
					type: "campaign",
					link: `/campaigns/${campaign._id}`,
				});

				emailCount++;
			}
		}

		campaign.emailSentCount = emailCount;
		await campaign.save();

		return { campaign, emailSentTo: emailCount };
	}

	async registerForCampaign(campaignId, userId) {
		const campaign = await campaignModel.findById(campaignId);
		if (!campaign) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Campaign not found",
				statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
			};
		}
		if (!["upcoming", "active"].includes(campaign.status)) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: "Campaign not accepting registrations",
				statusMsg: httpStatusMsg.CAMPAIGN_CLOSED,
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

		const targetBloodTypes = campaign.targetBloodTypes || [];

		// If campaign has no restriction → allow all
		const isAllowed = targetBloodTypes.length === 0 || targetBloodTypes.includes("All") || targetBloodTypes.includes(donor.bloodType);

		if (!isAllowed) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: `This campaign only accepts ${targetBloodTypes.join(", ")} donors`,
				statusMsg: "INVALID_BLOOD_TYPE",
			};
		}

		const alreadyRegistered = campaign.registeredDonors.find((r) => r.donor.toString() === donor._id.toString());
		if (alreadyRegistered) {
			throw {
				status: httpStatusCode.CONFLICT,
				message: "Already registered",
				statusMsg: httpStatusMsg.ALREADY_REGISTERED,
			};
		}

		campaign.registeredDonors.push({ donor: donor._id });
		await campaign.save();

		await notificationModel.create({
			recipient: userId,
			title: "Registration Confirmed!",
			message: `You are registered for "${campaign.title}"`,
			type: "success",
		});

		return campaign;
	}

	async markDonation(campaignId, donorId, orgUserId) {
		const campaign = await campaignModel.findById(campaignId);
		const donor = await donorModel.findById(donorId).populate("user");

		if (!campaign) {
			throw {
				status: 404,
				message: "Campaign not found",
			};
		}

		if (!donor) {
			throw {
				status: 404,
				message: "Donor not found",
			};
		}

		const reg = campaign.registeredDonors.find((r) => r.donor?.toString() === donorId);
		if (!reg) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Donor not in campaign",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
			};
		}
		if (reg.status === "donated") {
			return {
				message: "Donation already marked",
			};
		}
		reg.status = "donated";
		campaign.collectedUnits += 1;
		await campaign.save();

		// Update donor stats
		donor.totalDonations += 1;
		donor.lastDonationDate = new Date();
		donor.points += campaign.pointsReward || 10;
		donor.donationHistory.push({
			campaign: campaign._id,
			organization: campaign.organization,
			date: new Date(),
			units: 1,
			pointsEarned: campaign.pointsReward || 10,
		});

		const prevBadges = [...donor.badges];
		donor.updateBadges();
		const newBadge = donor.badges.find((b) => !prevBadges.includes(b));
		await donor.save();

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

		return { donor, newBadge };
	}

	async getOrgCampaigns(userId) {
		const org = await organizationModel.findOne({ user: userId });
		if (!org) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Organization not found",
				statusMsg: httpStatusMsg.ORG_NOT_FOUND,
			};
		}
		return campaignModel.find({ organization: org._id }).sort("-createdAt");
	}

	async getNearbyCampaigns({ lat, lng, radius = 25, status = "active", bloodType }) {
		if (!lat || !lng) {
			throw {
				status: 400,
				message: "Latitude and longitude are required",
			};
		}

		const maxDistance = Number(radius) * 1000; // km → meters

		const filter = { status };

		if (bloodType) {
			filter.targetBloodTypes = bloodType;
		}

		const campaigns = await campaignModel
			.find({
				...filter,
				geoLocation: {
					$near: {
						$geometry: {
							type: "Point",
							coordinates: [Number(lng), Number(lat)],
						},
						$maxDistance: maxDistance,
					},
				},
			})
			.populate("organization", "orgName");

		return campaigns;
	}

	// 	async getNearbyCampaigns(lat, lng, radiusKm = 25, bloodType, status = "active") {
	// 		const filter = {
	// 			status,
	// 			geoLocation: {
	// 				$near: {
	// 					$geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
	// 					$maxDistance: radiusKm * 1000,
	// 				},
	// 			},
	// 		};
	// 		if (bloodType && bloodType !== "All") filter.targetBloodTypes = { $in: [bloodType, "All"] };

	// 		return campaignModel.find(filter).populate({
	// 			path: "organization",
	// 			select: "orgName city orgType logo",
	// 			populate: { path: "user", select: "name" },
	// 		});
	// 	}
}

export const campaignService = new CampaignService();
