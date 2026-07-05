import { Router } from "express";
import { loginAdmin, getAdminProfile, verifyOtp } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginAdmin);
router.route("/verify-otp").post(verifyOtp);
router.route("/me").get(verifyJWT, getAdminProfile);

export default router;
