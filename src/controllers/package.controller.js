import { Package } from "../models/package.model.js";
import { SubCategory } from "../models/subcategory.model.js";
import { BookingRequest } from "../models/bookingRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload, deleteFile } from "../utils/fileUpload.js";

// Public APIs
export const getAllPackages = asyncHandler(async (req, res) => {
    const packages = await Package.find();
    
    return res
        .status(200)
        .json(new ApiResponse(200, packages, "Packages fetched successfully"));
});

export const getPackageBySubcategory = asyncHandler(async (req, res) => {
    const { subCategoryId } = req.params;

    const pkg = await Package.findOne({ subCategoryId });
    
    return res
        .status(200)
        .json(new ApiResponse(200, pkg, "Subcategory package fetched successfully"));
});

export const getPackageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pkg = await Package.findById(id);

    if (!pkg) {
        throw new ApiError(404, "Package not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, pkg, "Package details fetched successfully"));
});

export const getPackagesByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const subcategories = await SubCategory.find({ categoryId });
    
    if (subcategories.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No packages found for this category"));
    }

    const subCategoryIds = subcategories.map(sub => sub._id);

    const packages = await Package.find({ subCategoryId: { $in: subCategoryIds } })
        .populate("subCategoryId");

    return res
        .status(200)
        .json(new ApiResponse(200, packages, "Packages fetched successfully"));
});

// Admin APIs
export const createPackage = asyncHandler(async (req, res) => {
    const { title, description, services, price, categoryId, status, isTrending, features, benefits, requirements, itinerary } = req.body;
    const { id: paramId, subCategoryId: paramSubCategoryId } = req.params;
    const subCategoryId = paramId || paramSubCategoryId || req.body.subCategoryId;

    if (!subCategoryId || !categoryId || !title || !description || !price) {
        throw new ApiError(400, "Category ID, Subcategory ID, title, description, and price are required");
    }

    // Verify subcategory exists
    const subcategoryExists = await SubCategory.findById(subCategoryId);
    if (!subcategoryExists) {
        throw new ApiError(404, "Subcategory not found");
    }

    // Check if subcategory already has a package (1:1 constraint)
    const existingPackage = await Package.findOne({ subCategoryId });
    if (existingPackage) {
        throw new ApiError(400, "A package already exists for this subcategory");
    }

    let coverImagePath = null;

    if (req.file) {
        coverImagePath = await upload(req.file.buffer);
        if (!coverImagePath) {
            throw new ApiError(500, "Failed to upload package cover image");
        }
    } else {
        // Fallback to subcategory thumbnail or first banner
        coverImagePath = subcategoryExists.thumbnail || (subcategoryExists.banners && subcategoryExists.banners[0]);
        if (!coverImagePath) {
            throw new ApiError(400, "Package cover image is required (or upload a thumbnail/banner to the service first)");
        }
    }

    // Process services (support array from JSON body or stringified array/delimited string)
    
    // Helper to parse arrays from FormData
    const parseArrayField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch (e) { return field.split(',').map(s => s.trim()).filter(Boolean); }
        }
        return [];
    };

    const parsedFeatures = parseArrayField(features);
    const parsedBenefits = parseArrayField(benefits);
    const parsedRequirements = parseArrayField(requirements);
    
    let parsedItinerary = [];
    if (itinerary) {
        if (Array.isArray(itinerary)) parsedItinerary = itinerary;
        else if (typeof itinerary === 'string') {
            try { parsedItinerary = JSON.parse(itinerary); } catch (e) { parsedItinerary = []; }
        }
    }

    const pkg = await Package.create({
        categoryId,
        subCategoryId,
        title,
        description,
        coverImage: coverImagePath,
        services: parseArrayField(services),
        price: Number(price),
        features: parsedFeatures,
        benefits: parsedBenefits,
        requirements: parsedRequirements,
        itinerary: parsedItinerary,
        status: status || 'Active',
        isTrending: isTrending === 'true' || isTrending === true
    });

    return res
        .status(201)
        .json(new ApiResponse(201, pkg, "Package created successfully"));
});

export const updatePackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = { ...req.query, ...req.body };
    const { title, description, services, price, categoryId, subCategoryId, status, isTrending, features, benefits, requirements, itinerary } = body;

    const pkg = await Package.findById(id);
    if (!pkg) {
        throw new ApiError(404, "Package not found");
    }

    if (title) pkg.title = title;
    if (description) pkg.description = description;
    if (price) pkg.price = Number(price);
    if (categoryId) pkg.categoryId = categoryId;
    if (subCategoryId) pkg.subCategoryId = subCategoryId;
    if (status) pkg.status = status;
    if (isTrending !== undefined) pkg.isTrending = isTrending === 'true' || isTrending === true;

    const parseArrayField = (field) => {
        if (!field) return undefined;
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch (e) { return field.split(',').map(s => s.trim()).filter(Boolean); }
        }
        return undefined;
    };

    if (services !== undefined) pkg.services = parseArrayField(services) || [];
    if (features !== undefined) pkg.features = parseArrayField(features) || [];
    if (benefits !== undefined) pkg.benefits = parseArrayField(benefits) || [];
    if (requirements !== undefined) pkg.requirements = parseArrayField(requirements) || [];
    
    if (itinerary !== undefined) {
        if (Array.isArray(itinerary)) pkg.itinerary = itinerary;
        else if (typeof itinerary === 'string') {
            try { pkg.itinerary = JSON.parse(itinerary); } catch (e) { pkg.itinerary = []; }
        }
    }

    if (req.file) {
        const coverImagePath = await upload(req.file.buffer);
        if (!coverImagePath) {
            throw new ApiError(500, "Failed to upload new package cover image");
        }
        if (pkg.coverImage) {
            // Check if it's an uploaded file (starts with /uploads or similar) before deleting, to avoid deleting subcategory images if reused
            await deleteFile(pkg.coverImage);
        }
        pkg.coverImage = coverImagePath;
    }

    await pkg.save();

    return res
        .status(200)
        .json(new ApiResponse(200, pkg, "Package updated successfully"));
});

export const deletePackage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
        throw new ApiError(404, "Package not found");
    }

    // Delete cover image file
    await deleteFile(pkg.coverImage);

    // Delete package record
    await Package.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Package and all related booking requests deleted successfully"));
});
