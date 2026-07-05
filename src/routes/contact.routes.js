import { Router } from "express";
import { 
    createContactMessage, 
    getAllContactMessages,
    updateContactStatus,
    deleteContactMessage,
    sendContactEmail
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").post(createContactMessage);

// Admin routes (Protected)
router.route("/").get(verifyJWT, getAllContactMessages);
router.route("/:id").patch(verifyJWT, updateContactStatus);
router.route("/:id").delete(verifyJWT, deleteContactMessage);
router.route("/:id/send-email").post(verifyJWT, sendContactEmail);

export default router;
