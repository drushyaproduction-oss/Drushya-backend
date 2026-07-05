import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
            trim: true
        },
        mobile: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        eventDate: {
            type: Date,
            required: true
        },
        eventLocation: {
            type: String,
            required: true,
            trim: true
        },
        studioLocation: {
            type: String,
            enum: ['Drushya Productions', "Rishi's Studio"],
            required: true
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
            required: true
        },
        message: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Rejected'],
            default: 'Pending'
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export const BookingRequest = mongoose.model("BookingRequest", bookingRequestSchema);
