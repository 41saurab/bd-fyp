import express from "express";
import authRouter from "../modules/auth/authRoute.js";
import donorRouter from "../modules/donor/donorRoute.js";
import organizationRouter from "../modules/organization/organizationRoute.js";
import adminRouter from "../modules/admin/adminRoute.js";
import campaignRouter from "../modules/campaign/campaignRoute.js";
import emergencyRouter from "../modules/emergency/emergencyRoute.js";
import notificationRouter from "../modules/notification/notificationRoute.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/donors", donorRouter);
router.use("/organizations", organizationRouter);
router.use("/admin", adminRouter);
router.use("/campaigns", campaignRouter);
router.use("/emergency", emergencyRouter);
router.use("/notifications", notificationRouter);

export default router;
