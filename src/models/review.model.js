import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Package",
            required: true
        },
        review: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export const Review = mongoose.model("Review", reviewSchema);
