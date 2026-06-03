import express from "express";
import { emergencyController } from "./emergencyController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import { bodyValidator } from "../../middlewares/requestValidatorMiddleware.js";
import { createEmergencyDTO } from "./emergencyRequest.js";

const router = express.Router();

// Public routes
router.get("/", emergencyController.getAllEmergencies);

// ✅ NEW: Proximity route — must be declared BEFORE /:id to avoid route collision
router.get("/nearby", emergencyController.getNearbyEmergencies);

router.get("/org/mine", checkLogin, checkPermission(["organization"]), emergencyController.getOrgEmergencies);
router.get("/:id", emergencyController.getEmergencyById);

// Organization routes
router.post("/", checkLogin, checkPermission(["organization"]), bodyValidator(createEmergencyDTO), emergencyController.createEmergency);
router.patch("/:id/fulfill", checkLogin, checkPermission(["organization"]), emergencyController.fulfillEmergency);

// Donor routes
router.post("/:id/respond", checkLogin, checkPermission(["donor"]), emergencyController.respondToEmergency);

export default router;
