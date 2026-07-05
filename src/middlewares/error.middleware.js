import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

/**
 * Global error handling middleware for Express.
 * 
 * Catches all errors, formats them into a consistent structure using the `ApiError` 
 * utility, and sends a JSON response. In development mode, it also includes the stack trace.
 * 
 * @param {Error|ApiError} err - The error object thrown by the application.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next function.
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }
    try {
        fs.appendFileSync('error_log.txt', new Date().toISOString() + ' ' + error.message + '\n' + (error.stack || '') + '\n\n');
    } catch (e) {}

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
