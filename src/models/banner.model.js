import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Home", "Workspace", "About", "Contact"],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    alt: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export const Banner = mongoose.model("Banner", bannerSchema);
