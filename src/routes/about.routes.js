import express from "express";
import { getAboutProfile, saveAboutProfile, deleteAboutProfile } from "../controllers/about.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route to fetch the about profile
router.route("/")
    .get(getAboutProfile);

// Protected routes to manage the about profile
router.route("/")
    .post(
        verifyJWT, 
        upload.fields([
            { name: 'profileImage1', maxCount: 1 }, 
            { name: 'profileImage2', maxCount: 1 }
        ]), 
        saveAboutProfile
    )
    .delete(verifyJWT, deleteAboutProfile);

export default router;
