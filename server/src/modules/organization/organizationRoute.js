import express from "express";
import { organizationController } from "./organizationController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";

const router = express.Router();

// Protected organization routes
router.get("/profile", checkLogin, checkPermission(["organization"]), organizationController.getOrgProfile);
router.put("/profile", checkLogin, checkPermission(["organization"]), uploadFile("image").single("logo"), organizationController.updateOrgProfile);
router.get("/dashboard", checkLogin, checkPermission(["organization"]), organizationController.getOrgDashboard);
router.patch("/inventory", checkLogin, checkPermission(["organization"]), organizationController.updateBloodInventory);

// Public routes
router.get("/", organizationController.getAllPublicOrgs);
router.get("/:id", organizationController.getPublicOrgById);
export default router;
