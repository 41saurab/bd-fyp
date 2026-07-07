import express from "express";
import { campaignController } from "./campaignController.js";
import { checkLogin, optionalAuth } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import { bodyValidator } from "../../middlewares/requestValidatorMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";
import { createCampaignDTO, updateCampaignDTO } from "./campaignRequest.js";

const router = express.Router();

router.get("/", campaignController.getAllCampaigns);
router.get("/org/mine", checkLogin, checkPermission(["organization"]), campaignController.getOrgCampaigns);

router.post("/", checkLogin, checkPermission(["organization"]), uploadFile("image").single("image"), bodyValidator(createCampaignDTO), campaignController.createCampaign);
router.put("/:id", checkLogin, checkPermission(["organization"]), uploadFile("image").single("image"), bodyValidator(updateCampaignDTO), campaignController.updateCampaign);
router.patch("/:id/cancel", checkLogin, checkPermission(["organization"]), campaignController.cancelCampaign);
router.delete("/:id", checkLogin, checkPermission(["organization"]), campaignController.deleteCampaign);

router.get("/nearby", campaignController.getNearbyCampaigns);
router.post("/:id/register", checkLogin, checkPermission(["donor"]), campaignController.registerForCampaign);

router.patch("/:id/donors/:donorId/donate", checkLogin, checkPermission(["organization"]), campaignController.markDonation);

router.get("/:id", optionalAuth, campaignController.getCampaignById);
export default router;
