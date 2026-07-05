import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Workspace } from "../models/workspace.model.js";
import { upload } from "../utils/fileUpload.js";

// @desc    Create new workspace
// @route   POST /api/v1/workspaces
// @access  Private/Admin
export const createWorkspace = asyncHandler(async (req, res) => {
    const { title, description, status } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const imageBuffer = req.file?.buffer;
    if (!imageBuffer) {
        throw new ApiError(400, "Image file is required");
    }

    const image = await upload(imageBuffer);
    if (!image) {
        throw new ApiError(500, "Error uploading image to Cloudinary");
    }

    const workspace = await Workspace.create({
        title,
        description,
        status: status || 'Active',
        imageUrl: image.url
    });

    return res.status(201).json(
        new ApiResponse(201, workspace, "Workspace created successfully")
    );
});

// @desc    Get all workspaces
// @route   GET /api/v1/workspaces
// @access  Public
export const getAllWorkspaces = asyncHandler(async (req, res) => {
    const workspaces = await Workspace.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, workspaces, "Workspaces retrieved successfully")
    );
});

// @desc    Get workspace by ID
// @route   GET /api/v1/workspaces/:id
// @access  Public
export const getWorkspaceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const workspace = await Workspace.findById(id);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    return res.status(200).json(
        new ApiResponse(200, workspace, "Workspace retrieved successfully")
    );
});

// @desc    Update workspace
// @route   PUT /api/v1/workspaces/:id
// @access  Private/Admin
export const updateWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    if (title) workspace.title = title;
    if (description) workspace.description = description;
    if (status) workspace.status = status;

    // Check if new image is uploaded
    const imageBuffer = req.file?.buffer;
    if (imageBuffer) {
        const image = await upload(imageBuffer);
        if (!image) {
            throw new ApiError(500, "Error uploading image to Cloudinary");
        }
        workspace.imageUrl = image.url;
    }

    const updatedWorkspace = await workspace.save();

    return res.status(200).json(
        new ApiResponse(200, updatedWorkspace, "Workspace updated successfully")
    );
});

// @desc    Delete workspace
// @route   DELETE /api/v1/workspaces/:id
// @access  Private/Admin
export const deleteWorkspace = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const workspace = await Workspace.findByIdAndDelete(id);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Workspace deleted successfully")
    );
});
