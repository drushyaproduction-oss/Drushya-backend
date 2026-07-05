import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

// Generate JWT token
adminSchema.methods.generateJWT = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
};

export const Admin = mongoose.model("Admin", adminSchema);
