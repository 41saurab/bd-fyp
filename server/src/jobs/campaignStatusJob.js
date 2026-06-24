import cron from "node-cron";
import { campaignModel } from "../modules/campaign/campaignModel.js";

export const startCampaignStatusJob = () => {
	cron.schedule("*/2 * * * *", async () => {
		try {
			const now = new Date();

			const activated = await campaignModel.updateMany(
				{
					startDate: { $lte: now },
					endDate: { $gte: now },
					status: "upcoming",
				},
				{
					$set: { status: "active" },
				},
			);

			const completed = await campaignModel.updateMany(
				{
					endDate: { $lt: now },
					status: { $ne: "completed" },
				},
				{
					$set: { status: "completed" },
				},
			);

			console.log(`[Campaign Cron] Activated: ${activated.modifiedCount}, Completed: ${completed.modifiedCount}`);
		} catch (err) {
			console.error("[Campaign Cron Error]", err);
		}
	});
};
