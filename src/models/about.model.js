import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Rushikesh Lokhande",
    },
    role: {
      type: String,
      required: true,
      default: "Lead Photographer & Visionary",
    },
    description1: {
      type: String,
      required: true,
    },
    description2: {
      type: String,
    },
    yearsExperience: {
      type: Number,
      required: true,
      default: 10,
    },
    studiosCount: {
      type: Number,
      required: true,
      default: 2,
    },
    professionalExcellence: {
      type: Number,
      required: true,
      default: 100,
    },
    profileImage1: {
      type: String,
      required: true,
    },
    profileImage2: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const About = mongoose.model("About", aboutSchema);
