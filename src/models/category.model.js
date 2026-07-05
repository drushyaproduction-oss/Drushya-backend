import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true
    }
);

// Pre-validate hook to generate slug from name
categorySchema.pre("validate", function () {
    if (this.name && (!this.slug || this.isModified("name"))) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});

export const Category = mongoose.model("Category", categorySchema);
