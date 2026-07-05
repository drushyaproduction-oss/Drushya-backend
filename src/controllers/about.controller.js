import { About } from "../models/about.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteFile } from "../utils/fileUpload.js";

// @desc    Get the about profile info
// @route   GET /api/v1/about
// @access  Public
export const getAboutProfile = asyncHandler(async (req, res) => {
    // We assume there is only one About profile for the entire site
    const about = await About.findOne();
    
    if (!about) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No about profile found"));
    }
    
    return res
        .status(200)
        .json(new ApiResponse(200, about, "About profile fetched successfully"));
});

// @desc    Create or Update the about profile info
// @route   POST /api/v1/about
// @access  Private/Admin
export const saveAboutProfile = asyncHandler(async (req, res) => {
    const { 
        name, 
        role, 
        description1, 
        description2, 
        yearsExperience, 
        studiosCount, 
        professionalExcellence 
    } = req.body;

    // Check if profile exists
    let about = await About.findOne();
    
    let profileImage1 = about?.profileImage1 || "";
    let profileImage2 = about?.profileImage2 || "";

    // Handle Image 1 upload
    if (req.files && req.files.profileImage1) {
        const uploadResponse1 = await upload(req.files.profileImage1[0].buffer);
        if (!uploadResponse1) {
            throw new ApiError(500, "Failed to upload profile image 1");
        }
        // Delete old image 1
        if (about && about.profileImage1) {
            await deleteFile(about.profileImage1);
        }
        profileImage1 = uploadResponse1.toString();
    }

    // Handle Image 2 upload
    if (req.files && req.files.profileImage2) {
        const uploadResponse2 = await upload(req.files.profileImage2[0].buffer);
        if (!uploadResponse2) {
            throw new ApiError(500, "Failed to upload profile image 2");
        }
        // Delete old image 2
        if (about && about.profileImage2) {
            await deleteFile(about.profileImage2);
        }
        profileImage2 = uploadResponse2.toString();
    }

    if (about) {
        // Update existing profile
        about.name = name || about.name;
        about.role = role || about.role;
        about.description1 = description1 || about.description1;
        about.description2 = description2 !== undefined ? description2 : about.description2;
        about.yearsExperience = yearsExperience !== undefined ? yearsExperience : about.yearsExperience;
        about.studiosCount = studiosCount !== undefined ? studiosCount : about.studiosCount;
        about.professionalExcellence = professionalExcellence !== undefined ? professionalExcellence : about.professionalExcellence;
        about.profileImage1 = profileImage1;
        about.profileImage2 = profileImage2;

        await about.save();
    } else {
        // Create new profile
        if (!description1) {
            throw new ApiError(400, "description1 is required to create the profile");
        }

        about = await About.create({
            name: name || "Rushikesh Lokhande",
            role: role || "Lead Photographer & Visionary",
            description1,
            description2: description2 || "",
            yearsExperience: yearsExperience || 10,
            studiosCount: studiosCount || 2,
            professionalExcellence: professionalExcellence || 100,
            profileImage1,
            profileImage2
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, about, "About profile saved successfully"));
});

// @desc    Delete the about profile info
// @route   DELETE /api/v1/about
// @access  Private/Admin
export const deleteAboutProfile = asyncHandler(async (req, res) => {
    const about = await About.findOne();
    
    if (!about) {
        throw new ApiError(404, "About profile not found");
    }

    if (about.profileImage1) {
        await deleteFile(about.profileImage1);
    }
    
    if (about.profileImage2) {
        await deleteFile(about.profileImage2);
    }

    await about.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "About profile deleted successfully"));
});
