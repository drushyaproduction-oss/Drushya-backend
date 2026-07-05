import { Review } from "../models/review.model.js";
import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Public APIs
export const getReviewsByCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const reviews = await Review.find({ categoryId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

export const getReviewsByPackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const reviews = await Review.find({ packageId }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

export const createReview = asyncHandler(async (req, res) => {
    console.log("createReview body:", req.body);
    const { categoryId, packageId, customerName, mobile, rating, review } = req.body;

    if (!categoryId || !packageId || !customerName || !mobile || !rating || !review) {
        console.error("Missing fields in createReview:", { categoryId, packageId, customerName, mobile, rating, review });
        throw new ApiError(400, "Category ID, Package ID, customer name, mobile, rating, and review text are required");
    }

    // Verify category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    const newReview = await Review.create({
        categoryId,
        packageId,
        customerName,
        mobile,
        rating: Number(rating),
        review
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newReview, "Review submitted successfully"));
});

// Admin APIs
export const getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find()
        .populate("categoryId", "name")
        .populate("packageId", "title")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, reviews, "All reviews fetched successfully"));
});

export const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;

    const existingReview = await Review.findById(id);
    if (!existingReview) {
        throw new ApiError(404, "Review not found");
    }

    if (rating) existingReview.rating = Number(rating);
    if (review !== undefined) existingReview.review = review;

    await existingReview.save();

    return res
        .status(200)
        .json(new ApiResponse(200, existingReview, "Review updated successfully"));
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    await Review.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Review deleted successfully"));
});
