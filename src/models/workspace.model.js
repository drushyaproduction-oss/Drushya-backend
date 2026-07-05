import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);
