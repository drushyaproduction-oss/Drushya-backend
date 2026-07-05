import { Category } from "../models/category.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { Package } from "../models/package.model.js";
import { BookingRequest } from "../models/bookingRequest.model.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteFile } from "../utils/fileUpload.js";

// Public APIs
export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category details fetched successfully"));
});

// Admin APIs
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    if (!req.file) {
        throw new ApiError(400, "Category thumbnail is required");
    }

    // Upload thumbnail
    const thumbnailPath = await upload(req.file.buffer);
    if (!thumbnailPath) {
        throw new ApiError(500, "Failed to upload category thumbnail");
    }

    const category = await Category.create({
        name,
        description,
        thumbnail: thumbnailPath
    });

    return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    if (req.file) {
        // Upload new thumbnail
        const thumbnailPath = await upload(req.file.buffer);
        if (!thumbnailPath) {
            throw new ApiError(500, "Failed to upload new category thumbnail");
        }
        
        // Delete old thumbnail file
        await deleteFile(category.thumbnail);
        category.thumbnail = thumbnailPath;
    }

    await category.save();

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Cascading delete
    // Find all subcategories belonging to this category
    const subCategories = await SubCategory.find({ categoryId: id });

    // Delete subcategory thumbnails & records, and packages & booking requests, and gallery images
    for (const subCat of subCategories) {
        // Find package belonging to this subcategory
        const pkg = await Package.findOne({ subCategoryId: subCat._id });
        if (pkg) {
            // Delete package cover image
            await deleteFile(pkg.coverImage);
            // Delete package record
            await Package.findByIdAndDelete(pkg._id);
        }

        // Delete gallery images and banners
        if (subCat.gallery && subCat.gallery.length > 0) {
            for (const img of subCat.gallery) {
                await deleteFile(img);
            }
        }
        
        if (subCat.banners && subCat.banners.length > 0) {
            for (const img of subCat.banners) {
                await deleteFile(img);
            }
        }

        // Delete subcategory thumbnail
        await deleteFile(subCat.thumbnail);
    }

    // Delete all SubCategory records
    await SubCategory.deleteMany({ categoryId: id });

    // Delete reviews belonging to this Category
    await Review.deleteMany({ categoryId: id });

    // Delete Category thumbnail
    await deleteFile(category.thumbnail);

    // Delete the Category record
    await Category.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Category and all related subcategories, packages, bookings, reviews, and gallery images deleted successfully"));
});
