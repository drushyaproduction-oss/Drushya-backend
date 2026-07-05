import { Router } from "express";
import { 
    createBookingRequest, 
    getAllBookingRequests,
    updateBookingRequest,
    deleteBookingRequest,
    sendBookingEmail
} from "../controllers/bookingRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").post(createBookingRequest);

// Admin routes (Protected)
router.route("/").get(verifyJWT, getAllBookingRequests);
router.route("/:id").put(verifyJWT, updateBookingRequest);
router.route("/:id").delete(verifyJWT, deleteBookingRequest);
router.route("/:id/send-email").post(verifyJWT, sendBookingEmail);

export default router;
