import { Router } from "express";
import { 
    getAllPackages, 
    getPackageBySubcategory, 
    getPackageById, 
    getPackagesByCategory,
    createPackage, 
    updatePackage, 
    deletePackage 
} from "../controllers/package.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllPackages); // NO NEEDED
router.route("/subcategory/:subCategoryId").get(getPackageBySubcategory);
router.route("/category/:categoryId").get(getPackagesByCategory);
router.route("/:id").get(getPackageById);

// Admin routes (Protected)
router.route("/").post(verifyJWT, upload.single("coverImage"), createPackage);
router.route("/:id").post(verifyJWT, upload.single("coverImage"), createPackage);
router.route("/:id").put(verifyJWT, upload.single("coverImage"), updatePackage);
router.route("/:id").delete(verifyJWT, deletePackage);

export default router;
