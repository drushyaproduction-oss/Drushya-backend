import { Contact } from "../models/contact.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/email.js";

// Public APIs
export const createContactMessage = asyncHandler(async (req, res) => {
    const { name, email, mobile, subject, message, studioLocation } = req.body;

    if (!name || !email || !mobile || !subject || !message || !studioLocation) {
        throw new ApiError(400, "All fields (name, email, mobile, subject, message, and studio location) are required");
    }

    const contact = await Contact.create({
        name,
        email,
        mobile,
        studioLocation,
        subject,
        message
    });

    return res
        .status(201)
        .json(new ApiResponse(201, contact, "Contact message sent successfully"));
});

// Admin APIs
export const getAllContactMessages = asyncHandler(async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, contacts, "Contact messages fetched successfully"));
});

export const updateContactStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
        throw new ApiError(404, "Contact message not found");
    }

    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;

    await contact.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, contact, "Contact status updated successfully"));
});

export const deleteContactMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
        throw new ApiError(404, "Contact message not found");
    }

    await Contact.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Contact message deleted successfully"));
});

export const sendContactEmail = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
        throw new ApiError(404, "Contact message not found");
    }

    const { name, email, subject: originalSubject, message: originalMessage } = contact;

    const subject = `Re: ${originalSubject} - Drushya's Production`;
    const message = `Hello ${name},\n\nYour query has been reviewed and resolved.\n\nOriginal Message: "${originalMessage}"\n\nThank you for choosing Drushya's Production!`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
            <div style="background-color: #000; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Drushya's Production</h1>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <h2 style="color: #10b981; font-size: 24px; margin-top: 0;">Query Resolved ✓</h2>
                <p style="color: #4b5563; font-size: 16px;">Hello <strong>${name}</strong>,</p>
                <p style="color: #4b5563; font-size: 16px;">Great news! Your recent inquiry has been fully reviewed and resolved by our team.</p>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 16px;">Your Original Message:</h3>
                    <p style="color: #6b7280; font-style: italic; margin-bottom: 0;">"${originalMessage}"</p>
                </div>

                <p style="color: #4b5563; font-size: 16px;">If you have any further questions or need more assistance, simply reply to this email. We're always here to help!</p>
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
        .json(new ApiResponse(200, null, "Contact reply email sent successfully"));
});
