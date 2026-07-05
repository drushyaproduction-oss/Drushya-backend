import { BookingRequest } from "../models/bookingRequest.model.js";
import { Package } from "../models/package.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/email.js";

// Public APIs
export const createBookingRequest = asyncHandler(async (req, res) => {
    const body = { ...req.query, ...(req.body || {}) };
    const { packageId, customerName, mobile, email, eventDate, eventLocation, studioLocation, message } = body;

    if (!packageId || !customerName || !mobile || !email || !eventDate || !eventLocation || !studioLocation) {
        throw new ApiError(400, "Package ID, customer name, mobile, email, event date, event location, and studio location are required");
    }

    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
        throw new ApiError(404, "Package not found");
    }

    const bookingRequest = await BookingRequest.create({
        packageId,
        customerName,
        mobile,
        email,
        eventDate: new Date(eventDate),
        eventLocation,
        studioLocation,
        message: message || ""
    });

    return res
        .status(201)
        .json(new ApiResponse(201, bookingRequest, "Booking request submitted successfully"));
});

// Admin APIs
export const getAllBookingRequests = asyncHandler(async (req, res) => {
    const bookings = await BookingRequest.find()
        .populate("packageId", "title")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, bookings, "Booking requests fetched successfully"));
});

export const updateBookingRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const bookingRequest = await BookingRequest.findById(id);
    if (!bookingRequest) {
        throw new ApiError(404, "Booking request not found");
    }

    if (status) bookingRequest.status = status;
    if (notes !== undefined) bookingRequest.notes = notes;

    await bookingRequest.save();

    return res
        .status(200)
        .json(new ApiResponse(200, bookingRequest, "Booking request updated successfully"));
});

export const deleteBookingRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bookingRequest = await BookingRequest.findById(id);
    if (!bookingRequest) {
        throw new ApiError(404, "Booking request not found");
    }

    await BookingRequest.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Booking request deleted successfully"));
});

export const sendBookingEmail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bookingRequest = await BookingRequest.findById(id).populate("packageId", "title");
    if (!bookingRequest) {
        throw new ApiError(404, "Booking request not found");
    }

    const { customerName, email, eventDate, eventLocation, studioLocation } = bookingRequest;
    const packageName = bookingRequest.packageId?.title || 'Selected Package';
    const dateStr = new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let studioAddress = '';
    let mapLink = '';

    if (studioLocation === "Drushya Productions") {
        studioAddress = "Baner, Pune";
        mapLink = "https://maps.app.goo.gl/auy9TwgFgL5ZXvL5A";
    } else if (studioLocation === "Rishi's Studio") {
        studioAddress = "Savedi, Ahilyanagar";
        mapLink = "https://maps.app.goo.gl/bcCMyUS5wVj1hTk67";
    }

    const subject = "Booking Confirmation - Drushya's Production";
    const message = `Hello ${customerName},\n\nYour booking for ${packageName} on ${dateStr} has been confirmed.\n\nThank you for choosing Drushya's Production!`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
            <div style="background-color: #000; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Drushya's Production</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="color: #111827; font-size: 24px; margin-top: 0;">Booking Confirmed! 🎉</h2>
                <p style="color: #4b5563; font-size: 16px;">Hello <strong>${customerName}</strong>,</p>
                <p style="color: #4b5563; font-size: 16px;">We are thrilled to confirm your upcoming session with us. We can't wait to capture your beautiful moments.</p>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #fbbf24; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Session Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Package:</strong></td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${packageName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${dateStr}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;"><strong>Event Location:</strong></td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600;">${eventLocation}</td>
                        </tr>
                    </table>
                </div>

                ${studioLocation ? `
                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
                    <h3 style="margin-top: 0; color: #92400e; font-size: 18px;">Your Selected Studio</h3>
                    <p style="color: #b45309; font-size: 16px; margin: 10px 0;"><strong>${studioLocation}</strong><br/>${studioAddress}</p>
                    <a href="${mapLink}" style="display: inline-block; background-color: #fbbf24; color: #000; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; margin-top: 10px; font-size: 14px;">View on Google Maps</a>
                </div>
                ` : ''}

                <p style="color: #4b5563; font-size: 16px;">If you have any questions or need to make changes, please reply directly to this email.</p>
                <br/>
                <p style="color: #4b5563; font-size: 16px; margin-bottom: 0;">Warm regards,</p>
                <p style="color: #111827; font-size: 16px; font-weight: bold; margin-top: 5px;">The Drushya's Production Team</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Drushya's Production. All rights reserved.
            </div>
        </div>
    `;

    await sendEmail({ email, subject, message, html });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Booking confirmation email sent successfully"));
});
