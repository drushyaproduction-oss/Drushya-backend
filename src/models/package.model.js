import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    coverImage: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    services: {
        type: [String],
        required: false,
        default: []
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    features: {
        type: [String],
        default: []
    },
    benefits: {
        type: [String],
        default: []
    },
    requirements: {
        type: [String],
        default: []
    },
    itinerary: [
        {
            phase: String,
            items: [String]
        }
    ],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
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

export const Package = mongoose.model("Package", packageSchema);
