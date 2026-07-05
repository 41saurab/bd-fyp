import express from "express";
import { campaignController } from "./campaignController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";

const router = express.Router();

router.get("/", campaignController.getAllCampaigns);
router.get("/org/mine", checkLogin, checkPermission(["organization"]), campaignController.getOrgCampaigns);

router.post("/", checkLogin, checkPermission(["organization"]), uploadFile("image").single("image"), campaignController.createCampaign);

router.get("/nearby", campaignController.getNearbyCampaigns);
router.post("/:id/register", checkLogin, checkPermission(["donor"]), campaignController.registerForCampaign);

router.patch("/:id/donors/:donorId/donate", checkLogin, checkPermission(["organization"]), campaignController.markDonation);

router.get("/:id", campaignController.getCampaignById);
export default router;
