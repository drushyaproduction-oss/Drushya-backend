import { Router } from "express";
import { 
    getReviewsByCategory, 
    getReviewsByPackage,
    createReview, 
    getAllReviews,
    updateReview, 
    deleteReview 
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/category/:categoryId").get(getReviewsByCategory);
router.route("/package/:packageId").get(getReviewsByPackage);
router.route("/").post(createReview);

// Admin routes (Protected)
router.route("/").get(verifyJWT, getAllReviews);
router.route("/:id").put(verifyJWT, updateReview);
router.route("/:id").delete(verifyJWT, deleteReview);

export default router;
