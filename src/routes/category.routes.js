import { Router } from "express";
import { 
    getAllCategories, 
    getCategoryBySlug, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from "../controllers/category.controller.js";
import { getSubcategoriesByCategory } from "../controllers/subcategory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCategories);
router.route("/s/:slug").get(getCategoryBySlug); // PENDING
// router.route("/:categoryId/subcategories").get(getSubcategoriesByCategory);   // AVAILABLE

// Admin routes (Protected)
router.route("/create").post(verifyJWT, upload.single("thumbnail"), createCategory);
router.route("/:id").put(verifyJWT, upload.single("thumbnail"), updateCategory);
router.route("/:id").delete(verifyJWT, deleteCategory);

export default router;
