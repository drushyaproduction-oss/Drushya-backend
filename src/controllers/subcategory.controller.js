import { SubCategory } from "../models/subcategory.model.js";
import { Category } from "../models/category.model.js";
import { Package } from "../models/package.model.js";
import { BookingRequest } from "../models/bookingRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteFile } from "../utils/fileUpload.js";

// Public APIs

export const getAllSubcategories = asyncHandler(async (req, res) => {
    const subcategories = await SubCategory.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, subcategories, "All subcategories fetched successfully"));
});

export const getTrendingSubcategories = asyncHandler(async (req, res) => {
    const subcategories = await SubCategory.find({ isTrending: true, status: 'Active' }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, subcategories, "Trending subcategories fetched successfully"));
});

export const getSubcategoriesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const subcategories = await SubCategory.find({ categoryId }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, subcategories, "Subcategories fetched successfully"));
});


export const getSubcategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const subcategory = await SubCategory.findById(id);
    if (!subcategory) {
        throw new ApiError(404, "Subcategory not found");
    }
    return res.status(200).json(new ApiResponse(200, subcategory, "Subcategory fetched successfully"));
});

// Admin APIs

export const createSubcategory = asyncHandler(async (req, res) => {
    
    const { name, description, categoryId: bodyCategoryId, status, bannerVideo, isTrending } = req.body;
    const categoryId = req.params.categoryId || bodyCategoryId;

    if (!categoryId || !name) {             
        throw new ApiError(400, "Category ID and Subcategory name are required");
    }

    // Verify parent category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        throw new ApiError(404, "Parent Category not found");
    }

    if (!req.files || !req.files.thumbnail) {
        throw new ApiError(400, "Subcategory thumbnail is required");
    }

    // Upload thumbnail
    const thumbnailPath = await upload(req.files.thumbnail[0].buffer);
    if (!thumbnailPath) {
        throw new ApiError(500, "Failed to upload subcategory thumbnail");
    }

    // Upload banners
    let banners = [];
    if (req.files.banners && req.files.banners.length > 0) {
        for (const file of req.files.banners) {
            const uploaded = await upload(file.buffer);
            if (uploaded) banners.push(uploaded.secure_url || uploaded.url);
        }
    }

    // Upload gallery
    let gallery = [];
    if (req.files.gallery && req.files.gallery.length > 0) {
        for (const file of req.files.gallery) {
            const uploaded = await upload(file.buffer);
            if (uploaded) gallery.push(uploaded.secure_url || uploaded.url);
        }
    }

    const subCategory = await SubCategory.create({
        categoryId,
        name,
        description: description || "",
        thumbnail: thumbnailPath,
        status: status || "Active",
        bannerVideo: bannerVideo || "",
        banners,
        gallery,
        isTrending: isTrending === 'true' || isTrending === true
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subCategory, "Subcategory created successfully"));
});

export const updateSubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, categoryId, status, bannerVideo, isTrending } = req.body;
    
    // Front-end will send existing URLs as strings or arrays of strings
    let existingBanners = req.body.existingBanners || [];
    let existingGallery = req.body.existingGallery || [];

    // Ensure they are arrays
    if (typeof existingBanners === 'string') existingBanners = [existingBanners];
    if (typeof existingGallery === 'string') existingGallery = [existingGallery];

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
        throw new ApiError(404, "Subcategory not found");
    }

    if (categoryId) {
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            throw new ApiError(404, "New Parent Category not found");
        }
        subCategory.categoryId = categoryId;
    }

    if (name) subCategory.name = name;
    if (description !== undefined) subCategory.description = description;
    if (status) subCategory.status = status;
    if (bannerVideo !== undefined) subCategory.bannerVideo = bannerVideo;
    if (isTrending !== undefined) subCategory.isTrending = isTrending === 'true' || isTrending === true;

    // Handle thumbnail replacement
    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        const thumbnailPath = await upload(req.files.thumbnail[0].buffer);
        if (thumbnailPath) {
            await deleteFile(subCategory.thumbnail);
            subCategory.thumbnail = thumbnailPath;
        }
    }

    // Handle banners (combine existing with newly uploaded)
    let newBanners = [...existingBanners];
    if (req.files && req.files.banners && req.files.banners.length > 0) {
        for (const file of req.files.banners) {
            const uploaded = await upload(file.buffer);
            if (uploaded) newBanners.push(uploaded.secure_url || uploaded.url);
        }
    }
    
    // Delete banners that were removed
    for (const oldBanner of subCategory.banners) {
        if (!newBanners.includes(oldBanner)) {
            await deleteFile(oldBanner);
        }
    }
    subCategory.banners = newBanners;

    // Handle gallery (combine existing with newly uploaded)
    let newGallery = [...existingGallery];
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
        for (const file of req.files.gallery) {
            const uploaded = await upload(file.buffer);
            if (uploaded) newGallery.push(uploaded.secure_url || uploaded.url);
        }
    }

    // Delete gallery images that were removed
    for (const oldGalleryImg of subCategory.gallery) {
        if (!newGallery.includes(oldGalleryImg)) {
            await deleteFile(oldGalleryImg);
        }
    }
    subCategory.gallery = newGallery;

    await subCategory.save();

    return res
        .status(200)
        .json(new ApiResponse(200, subCategory, "Subcategory updated successfully"));
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
        throw new ApiError(404, "Subcategory not found");
    }

    // Cascading delete
    // Find and delete packages
    const pkg = await Package.findOne({ subCategoryId: id });
    if (pkg) {
        // BookingRequest does not have a packageId, so we cannot delete requests by packageId
        // Just delete coverImage and package
        await deleteFile(pkg.coverImage);
        await Package.findByIdAndDelete(pkg._id);
    }

    // Delete thumbnail
    await deleteFile(subCategory.thumbnail);

    // Delete banners
    if (subCategory.banners && subCategory.banners.length > 0) {
        for (const banner of subCategory.banners) {
            await deleteFile(banner);
        }
    }

    // Delete gallery
    if (subCategory.gallery && subCategory.gallery.length > 0) {
        for (const img of subCategory.gallery) {
            await deleteFile(img);
        }
    }

    // Delete subcategory record
    await SubCategory.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Subcategory and all related data deleted successfully"));
});
