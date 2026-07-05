import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createWorkspace,
    getAllWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace
} from "../controllers/workspace.controller.js";

const router = Router();

router.route("/").post(upload.single("image"), createWorkspace).get(getAllWorkspaces);
router.route("/:id").get(getWorkspaceById).put(upload.single("image"), updateWorkspace).delete(deleteWorkspace);

export default router;
