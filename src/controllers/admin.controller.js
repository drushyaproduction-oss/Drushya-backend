import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/email.js";

export const loginAdmin = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
        throw new ApiError(404, "Admin account not found");
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    admin.otp = otp;
    admin.otpExpiry = otpExpiry;
    await admin.save({ validateBeforeSave: false }); // Skip validation to avoid password hashing issue on update if needed

    // Send email
    try {
        const subject = "Your Drushya Admin Login OTP";
        const message = `Your One-Time Password (OTP) for Drushya Admin login is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`;
        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
                <div style="background-color: #000; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #fbbf24; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Drushya's Admin</h1>
                </div>
                
                <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
                    <h2 style="color: #111827; font-size: 24px; margin-top: 0;">Login Verification</h2>
                    <p style="color: #4b5563; font-size: 16px;">You are attempting to log into the Admin Dashboard. Please use the verification code below to complete the process.</p>
                    
                    <div style="background-color: #f9fafb; border: 2px dashed #fbbf24; padding: 25px; margin: 30px 0; border-radius: 12px;">
                        <h3 style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</h3>
                        <div style="font-size: 42px; font-weight: bold; color: #111827; letter-spacing: 8px; margin-top: 10px;">
                            ${otp}
                        </div>
                    </div>

                    <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 5px;">⚠️ Security Warning</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 0;">This code is valid for exactly <strong>10 minutes</strong>. Do not share this code with anyone. Our team will never ask for your OTP.</p>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Drushya's Production. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail({
            email: admin.email,
            subject,
            message,
            html
        });
    } catch (error) {
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save({ validateBeforeSave: false });
        throw new ApiError(500, "Failed to send OTP email. Please try again.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "OTP sent successfully to your email")
        );
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
        throw new ApiError(404, "Admin account not found");
    }

    if (admin.otp !== otp || admin.otpExpiry < new Date()) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    // Clear OTP after successful verification
    admin.otp = undefined;
    admin.otpExpiry = undefined;
    await admin.save({ validateBeforeSave: false });

    // Generate token
    const token = admin.generateJWT();

    const loggedInAdmin = await Admin.findById(admin._id).select("-password -otp -otpExpiry");

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    return res
        .status(200)
        .cookie("token", token, cookieOptions)
        .cookie("accessToken", token, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                { admin: loggedInAdmin, token }, 
                "Admin logged in successfully"
            )
        );
});

export const getAdminProfile = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                req.admin, 
                "Admin profile fetched successfully"
            )
        );
});
