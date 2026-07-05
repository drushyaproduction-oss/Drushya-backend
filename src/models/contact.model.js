import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
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
        mobile: {
            type: String,
            required: true,
            trim: true
        },
        studioLocation: {
            type: String,
            enum: ['Drushya Productions', "Rishi's Studio"],
            required: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved'],
            default: 'Pending'
        },
        notes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false
        }
    }
);

export const Contact = mongoose.model("Contact", contactSchema);
