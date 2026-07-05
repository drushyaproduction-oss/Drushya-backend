import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to verify JSON Web Token (JWT) from cookies or Authorization header.
 * 
 * Extracts the token, verifies it using the JWT_SECRET, and finds the corresponding 
 * admin user. If valid, attaches the admin object to the request (`req.admin`) and 
 * calls the next middleware.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next function.
 * @throws {ApiError} 401 - If token is missing, invalid, or admin is not found.
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request. Missing authentication token.");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        const admin = await Admin.findById(decodedToken?._id).select("-password");

        if (!admin) {
            throw new ApiError(401, "Invalid access token. Admin not found.");
        }

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token.");
    }
});
