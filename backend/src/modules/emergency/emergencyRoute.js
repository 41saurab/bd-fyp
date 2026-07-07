import express from "express";
import { emergencyController } from "./emergencyController.js";
import { checkLogin, optionalAuth } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import { bodyValidator } from "../../middlewares/requestValidatorMiddleware.js";
import { createEmergencyDTO, updateEmergencyDTO } from "./emergencyRequest.js";

const router = express.Router();

router.get("/", emergencyController.getAllEmergencies);

router.get("/nearby", emergencyController.getNearbyEmergencies);

router.get("/org/mine", checkLogin, checkPermission(["organization"]), emergencyController.getOrgEmergencies);
router.get("/:id", optionalAuth, emergencyController.getEmergencyById);

router.post("/", checkLogin, checkPermission(["organization"]), bodyValidator(createEmergencyDTO), emergencyController.createEmergency);
router.put("/:id", checkLogin, checkPermission(["organization"]), bodyValidator(updateEmergencyDTO), emergencyController.updateEmergency);
router.patch("/:id/fulfill", checkLogin, checkPermission(["organization"]), emergencyController.fulfillEmergency);
router.patch("/:id/cancel", checkLogin, checkPermission(["organization"]), emergencyController.cancelEmergency);
router.delete("/:id", checkLogin, checkPermission(["organization"]), emergencyController.deleteEmergency);

router.post("/:id/respond", checkLogin, checkPermission(["donor"]), emergencyController.respondToEmergency);
router.patch("/:id/donors/:donorId/donate", checkLogin, checkPermission(["organization"]), emergencyController.markEmergencyDonation);

export default router;
