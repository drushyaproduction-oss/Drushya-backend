import { Router } from "express";
import { 
    getSubcategoriesByCategory, 
    createSubcategory, 
    updateSubcategory, 
    deleteSubcategory,
    getSubcategoryById,
    getAllSubcategories,
    getTrendingSubcategories
} from "../controllers/subcategory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllSubcategories);
router.route("/trending").get(getTrendingSubcategories);
router.route("/detail/:id").get(getSubcategoryById);
router.route("/category/:categoryId").get(getSubcategoriesByCategory);

// Admin routes (Protected)
router.route("/create-sub-category/:categoryId").post(
    verifyJWT, 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banners', maxCount: 5 },
        { name: 'gallery', maxCount: 15 }
    ]), 
    createSubcategory
);

router.route("/:id").put(
    verifyJWT, 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banners', maxCount: 5 },
        { name: 'gallery', maxCount: 15 }
    ]), 
    updateSubcategory
);

router.route("/:id").delete(verifyJWT, deleteSubcategory);

export default router;
