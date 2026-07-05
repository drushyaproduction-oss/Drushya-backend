import { Banner } from "../models/banner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteFile } from "../utils/fileUpload.js";

// @desc    Get all banners by type
// @route   GET /api/v1/banners
// @access  Public
export const getBanners = asyncHandler(async (req, res) => {
    const { type } = req.query;
    let query = {};
    if (type) {
        query.type = type;
    }
    const banners = await Banner.find(query).sort({ createdAt: -1 });
    
    return res
        .status(200)
        .json(new ApiResponse(200, banners, "Banners fetched successfully"));
});

// @desc    Create a banner
// @route   POST /api/v1/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
    const { type, title, subtitle, alt, status } = req.body;

    if (!type) {
        throw new ApiError(400, "Banner type is required");
    }

    let imageUrl = "";
    if (req.file) {
        const uploadResponse = await upload(req.file.buffer);
        if (!uploadResponse) {
            throw new ApiError(500, "Failed to upload image");
        }
        imageUrl = uploadResponse.toString();
    } else {
        throw new ApiError(400, "Banner image is required");
    }

    const banner = await Banner.create({
        type,
        imageUrl,
        title,
        subtitle,
        alt,
        status
    });

    return res
        .status(201)
        .json(new ApiResponse(201, banner, "Banner created successfully"));
});

// @desc    Update a banner
// @route   PUT /api/v1/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, title, subtitle, alt, status } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    let imageUrl = banner.imageUrl;

    if (req.file) {
        const uploadResponse = await upload(req.file.buffer);
        if (!uploadResponse) {
            throw new ApiError(500, "Failed to upload new image");
        }
        
        // Delete old image
        if (banner.imageUrl) {
            await deleteFile(banner.imageUrl);
        }
        
        imageUrl = uploadResponse.toString();
    }

    banner.type = type || banner.type;
    banner.title = title !== undefined ? title : banner.title;
    banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
    banner.alt = alt !== undefined ? alt : banner.alt;
    banner.status = status || banner.status;
    banner.imageUrl = imageUrl;

    await banner.save();

    return res
        .status(200)
        .json(new ApiResponse(200, banner, "Banner updated successfully"));
});

// @desc    Delete a banner
// @route   DELETE /api/v1/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
        throw new ApiError(404, "Banner not found");
    }

    if (banner.imageUrl) {
        await deleteFile(banner.imageUrl);
    }

    await banner.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Banner deleted successfully"));
});
