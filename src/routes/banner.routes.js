import express from "express";
import { getBanners, createBanner, updateBanner, deleteBanner } from "../controllers/banner.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
    .get(getBanners)
    .post(verifyJWT, upload.single("image"), createBanner);

router.route("/:id")
    .put(verifyJWT, upload.single("image"), updateBanner)
    .delete(verifyJWT, deleteBanner);

export default router;
