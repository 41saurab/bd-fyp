import express from "express";
import { notificationController } from "./notificationController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", checkLogin, notificationController.getNotifications);
router.patch("/mark-all-read", checkLogin, notificationController.markAllAsRead);
router.patch("/:id/read", checkLogin, notificationController.markAsRead);

export default router;
