import express from "express";
import { donorController } from "./donorController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/rbacMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";

const router = express.Router();

router.get("/profile", checkLogin, checkPermission(["donor"]), donorController.getDonorProfile);
router.put("/profile", checkLogin, checkPermission(["donor"]), uploadFile("image").single("profileImage"), donorController.updateDonorProfile);
router.get("/leaderboard", donorController.getLeaderboard);
router.get("/stats", checkLogin, checkPermission(["donor"]), donorController.getDonorStats);

export default router;
