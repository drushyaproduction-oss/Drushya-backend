import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();

// File filter to restrict uploads to images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, gif)!"), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});
