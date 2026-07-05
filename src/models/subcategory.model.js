import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        },
        bannerVideo: {
            type: String,
            trim: true
        },
        banners: {
            type: [String],
            default: []
        },
        gallery: {
            type: [String],
            default: []
        },
        isTrending: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const SubCategory = mongoose.model("SubCategory", subCategorySchema);
