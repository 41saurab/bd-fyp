import { campaignModel } from "./campaignModel.js";
import { organizationModel } from "../organization/organizationModel.js";
import { donorModel } from "../donor/donorModel.js";
import { notificationModel } from "../notification/notificationModel.js";
import { mailSvc } from "../../services/emailService.js";
import { httpStatusCode } from "../../constants/httpStatusCode.js";
import { httpStatusMsg } from "../../constants/httpStatusMsg.js";
import { badgeEarnedEmailTemplate, campaignInviteEmailTemplate, campaignCancelledEmailTemplate } from "../../utilities/emailTemplate.js";
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

	async getCampaignById(id, requester) {
		const campaign = await campaignModel.findById(id).populate({
			path: "organization",
			populate: { path: "user", select: "name email" },
		});

		if (!campaign) {
			throw {
				status: 404,
				message: "Campaign not found",
				statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
			};
		}

		// Same PII gating as emergency respondents: this endpoint is public
		// (no login required to view a campaign), so without this check
		// anyone could read every registered donor's name/email/phone just by
		// requesting a campaign id.
		let isAuthorizedViewer = false;
		let viewerDonorId = null;
		if (requester?.role === "admin") {
			isAuthorizedViewer = true;
		} else if (requester?.role === "organization") {
			const org = await organizationModel.findOne({ user: requester._id }).select("_id");
			isAuthorizedViewer = !!org && org._id.toString() === campaign.organization._id.toString();
		} else if (requester?.role === "donor") {
			const donor = await donorModel.findOne({ user: requester._id }).select("_id");
			viewerDonorId = donor?._id?.toString() || null;
		}

		const plain = campaign.toObject();
		// Computed before stripping, so a donor can still tell whether THEY
		// are registered even though other donors' identities get hidden below.
		const isRegistered = viewerDonorId ? plain.registeredDonors.some((r) => r.donor.toString() === viewerDonorId) : false;

		if (isAuthorizedViewer) {
			await campaign.populate({
				path: "registeredDonors.donor",
				populate: { path: "user", select: "name email phone" },
			});
			plain.registeredDonors = campaign.toObject().registeredDonors;
		} else {
			// Everyone else just gets the count via .length — strip identities.
			plain.registeredDonors = plain.registeredDonors.map((r) => ({ status: r.status, registeredAt: r.registeredAt }));
		}

		return { ...plain, isRegistered };
	}

	async _getOwnedCampaign(campaignId, userId) {
		const campaign = await campaignModel.findById(campaignId);
		if (!campaign) {
			throw {
				status: httpStatusCode.NOT_FOUND,
				message: "Campaign not found",
				statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
			};
		}
		const org = await organizationModel.findOne({ user: userId });
		if (!org || campaign.organization.toString() !== org._id.toString()) {
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: "You can only manage your own campaigns",
				statusMsg: httpStatusMsg.UNAUTHORIZED,
			};
		}
		return { campaign, org };
	}

	async updateCampaign(campaignId, userId, body, file) {
		const { campaign } = await this._getOwnedCampaign(campaignId, userId);

		if (campaign.status === "completed" || campaign.status === "cancelled") {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `A ${campaign.status} campaign can no longer be edited`,
				statusMsg: httpStatusMsg.CAMPAIGN_CLOSED,
			};
		}

		const { title, description, type, targetBloodTypes, targetUnits, startDate, endDate, venue, city, address, pointsReward, requirements, contactInfo, tags, latitude, longitude } = body;

		if (targetUnits != null && Number(targetUnits) < campaign.collectedUnits) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `Target units can't be set below the ${campaign.collectedUnits} units already collected`,
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			};
		}

		const nextStart = startDate ? new Date(startDate) : campaign.startDate;
		const nextEnd = endDate ? new Date(endDate) : campaign.endDate;
		if (nextEnd <= nextStart) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: "End date must be after start date",
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			};
		}

		if (title !== undefined) campaign.title = title;
		if (description !== undefined) campaign.description = description;
		if (type !== undefined) campaign.type = type;
		if (targetBloodTypes !== undefined) campaign.targetBloodTypes = typeof targetBloodTypes === "string" ? JSON.parse(targetBloodTypes) : targetBloodTypes;
		if (targetUnits !== undefined) campaign.targetUnits = targetUnits;
		if (startDate !== undefined) campaign.startDate = startDate;
		if (endDate !== undefined) campaign.endDate = endDate;
		if (venue !== undefined) campaign.venue = venue;
		if (city !== undefined) campaign.city = city;
		if (address !== undefined) campaign.address = address;
		if (pointsReward !== undefined) campaign.pointsReward = pointsReward;
		if (requirements !== undefined) campaign.requirements = requirements;
		if (contactInfo !== undefined) campaign.contactInfo = contactInfo;
		if (tags !== undefined) campaign.tags = typeof tags === "string" ? JSON.parse(tags) : tags;

		if (latitude != null && longitude != null) {
			campaign.geoLocation = { type: "Point", coordinates: [Number(longitude), Number(latitude)] };
		}

		if (file) {
			const uploadResult = await FileUploadService.uploadFile(file.path, "campaigns");
			campaign.image = uploadResult;
		}

		// Re-derive status from the (possibly changed) dates, same rule used at
		// creation time, unless it's already been manually cancelled.
		if (campaign.status !== "cancelled") {
			const now = new Date();
			if (now < campaign.startDate) campaign.status = "upcoming";
			else if (now <= campaign.endDate) campaign.status = "active";
		}

		await campaign.save();
		return campaign;
	}

	async cancelCampaign(campaignId, userId) {
		const { campaign, org } = await this._getOwnedCampaign(campaignId, userId);
		if (campaign.status === "completed") {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: "A completed campaign can't be cancelled",
				statusMsg: httpStatusMsg.CAMPAIGN_CLOSED,
			};
		}
		campaign.status = "cancelled";
		await campaign.save();

		// Let anyone already registered know it's off.
		for (const reg of campaign.registeredDonors) {
			if (reg.status !== "registered") continue;
			const donor = await donorModel.findById(reg.donor).populate("user", "name email");
			if (donor?.user) {
				await notificationModel.create({
					recipient: donor.user._id,
					title: "Campaign Cancelled",
					message: `"${campaign.title}" has been cancelled by the organizing org.`,
					type: "warning",
				});

				if (donor.user.email) {
					const { subject, html } = campaignCancelledEmailTemplate({
						name: donor.user.name,
						orgName: org.orgName,
						campaignTitle: campaign.title,
						city: campaign.city,
						venue: campaign.venue,
					});

					await mailSvc.sendEmail(donor.user.email, subject, html);
				}
			}
		}

		return campaign;
	}

	async deleteCampaign(campaignId, userId) {
		const { campaign } = await this._getOwnedCampaign(campaignId, userId);

		// Hard delete is only safe when nothing depends on this record yet —
		// otherwise a donor's donation history / points would point at a
		// campaign that no longer exists. Anything with registrations should
		// be cancelled instead, which keeps the record (and history) intact.
		if (campaign.registeredDonors.length > 0) {
			throw {
				status: httpStatusCode.BAD_REQUEST,
				message: `This campaign has ${campaign.registeredDonors.length} registered donor(s) and can't be deleted — cancel it instead to preserve their history.`,
				statusMsg: httpStatusMsg.VALIDATION_FAILED,
			};
		}

		await campaignModel.findByIdAndDelete(campaignId);
		return { deleted: true };
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

		donor.isEligible = donor.checkEligibility();
		if (!donor.isEligible) {
			const daysLeft = donor.lastDonationDate ? Math.max(0, 56 - Math.floor((Date.now() - donor.lastDonationDate) / (1000 * 60 * 60 * 24))) : 0;
			await donor.save();
			throw {
				status: httpStatusCode.FORBIDDEN,
				message: `You must wait ${daysLeft} more day(s) since your last donation before registering to donate again`,
				statusMsg: httpStatusMsg.DONOR_INELIGIBLE,
			};
		}

		const targetBloodTypes = campaign.targetBloodTypes || [];

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
		if (!campaign) {
			throw {
				status: 404,
				message: "Campaign not found",
				statusMsg: httpStatusMsg.CAMPAIGN_NOT_FOUND,
			};
		}

		// Ownership check — without this, any authenticated organization could
		// mark a donation on ANY campaign (not just their own) by knowing/
		// guessing its id, letting them inflate another org's inventory or a
		// donor's points/badges.
		const org = await organizationModel.findOne({ user: orgUserId });
		if (!org || campaign.organization.toString() !== org._id.toString()) {
			throw {
				status: 403,
				message: "You can only record donations for your own campaigns",
				statusMsg: httpStatusMsg.UNAUTHORIZED,
			};
		}

		const donor = await donorModel.findById(donorId).populate("user");
		if (!donor) {
			throw {
				status: 404,
				message: "Donor not found",
				statusMsg: httpStatusMsg.DONOR_NOT_FOUND,
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

		// 56-day cooldown — blocks marking a donation for a donor who donated
		// too recently elsewhere.
		if (!donor.checkEligibility()) {
			const daysLeft = donor.lastDonationDate ? Math.max(0, 56 - Math.floor((Date.now() - donor.lastDonationDate) / (1000 * 60 * 60 * 24))) : 0;
			throw {
				status: 403,
				message: `Donor is not eligible yet — ${daysLeft} day(s) remaining of the mandatory 56-day gap between donations`,
				statusMsg: httpStatusMsg.DONOR_INELIGIBLE,
			};
		}

		reg.status = "donated";
		campaign.collectedUnits += 1;
		await campaign.save();

		donor.totalDonations += 1;
		donor.lastDonationDate = new Date();
		donor.isEligible = false;
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

		// Auto-credit the organization's blood inventory and donation total —
		// previously this required a separate manual PATCH after every single
		// donation, so inventory numbers silently drifted from reality.
		if (org.bloodInventory && donor.bloodType in org.bloodInventory) {
			org.bloodInventory[donor.bloodType] = (org.bloodInventory[donor.bloodType] || 0) + 1;
		}
		org.totalDonationsReceived += 1;
		await org.save();

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

		const maxDistance = Number(radius) * 1000;

		const filter = { status };

		if (bloodType && bloodType !== "All") {
			filter.targetBloodTypes = { $in: [bloodType, "All"] };
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

}

export const campaignService = new CampaignService();
