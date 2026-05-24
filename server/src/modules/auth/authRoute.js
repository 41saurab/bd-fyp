import express from "express";
import { donorController } from "../donor/donorController.js";
import { organizationController } from "../organization/organizationController.js";
import { checkLogin } from "../../middlewares/authMiddleware.js";
import { bodyValidator } from "../../middlewares/requestValidatorMiddleware.js";
import uploadFile from "../../middlewares/uploadFileMiddleware.js";
import { registerDonorDTO, loginDTO } from "../donor/donorRequest.js";
import { registerOrgDTO } from "../organization/organizationRequest.js";

const router = express.Router();

router.post("/register/donor", bodyValidator(registerDonorDTO), donorController.registerDonor);
router.post("/register/organization", uploadFile("doc").single("legalDocument"), bodyValidator(registerOrgDTO), organizationController.registerOrganization);
router.post("/login", bodyValidator(loginDTO), donorController.login);
router.get("/me", checkLogin, donorController.getMe);

export default router;
