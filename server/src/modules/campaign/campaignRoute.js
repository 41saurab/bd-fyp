import express from "express";
import { campaignController } from "./campaignController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", campaignController.getAllCampaigns);
router.get("/org/mine", checkLogin, checkPermission(["organization"]), campaignController.getOrgCampaigns);

// Organization routes
router.post("/", checkLogin, checkPermission(["organization"]), uploadFile("image").single("image"), campaignController.createCampaign);

router.get("/nearby", campaignController.getNearbyCampaigns);
// Donor routes
router.post("/:id/register", checkLogin, checkPermission(["donor"]), campaignController.registerForCampaign);

// Mark donation complete
router.patch("/:id/donors/:donorId/donate", checkLogin, checkPermission(["organization"]), campaignController.markDonation);

router.get("/:id", campaignController.getCampaignById);
export default router;
