import express from "express";
import { adminController } from "./adminController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";

const router = express.Router();

router.use(checkLogin, checkPermission(["admin"]));

router.get("/stats", adminController.getStats);
router.get("/organizations", adminController.getAllOrganizations);
router.patch("/organizations/:id/status", adminController.updateOrgStatus);
router.get("/donors", adminController.getAllDonors);
router.patch("/users/:id/toggle", adminController.toggleUserStatus);
router.get("/campaigns", adminController.getAllCampaigns);
router.get("/emergency", adminController.getAllEmergencies);
router.post("/broadcast", adminController.broadcast);

export default router;
