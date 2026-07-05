import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import https from "https";

// Cloudinary will be configured dynamically in the functions

// Fetch the real timestamp from an external API to bypass the user's 2026 system clock
const getRealTimestamp = async () => {
    return new Promise((resolve) => {
        https.get('https://timeapi.io/api/Time/current/zone?timeZone=UTC', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // Extract the date and convert it cleanly
                    const dateStr = json.dateTime.endsWith('Z') ? json.dateTime : json.dateTime + 'Z'; 
                    const unixTime = Math.floor(new Date(dateStr).getTime() / 1000);
                    if (unixTime && !isNaN(unixTime)) {
                        resolve(unixTime);
                    } else {
                        resolve(Math.floor(Date.now() / 1000));
                    }
                } catch (e) {
                    resolve(Math.floor(Date.now() / 1000));
                }
            });
        }).on('error', () => {
            resolve(Math.floor(Date.now() / 1000));
        });
    });
};

const upload = async (fileBuffer) => {
    try {
        if (!fileBuffer) return null;

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            throw new Error("Cloudinary credentials are not set in the .env file.");
        }

        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        const realTimestamp = await getRealTimestamp();

        // Upload the file on cloudinary using upload_stream
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    timestamp: realTimestamp
                },
                (error, response) => {
                    if (error) {
                        console.error("Cloudinary upload explicitly failed:", error.message || error);
                        reject(error);
                    } else {
                        // Add toString override so Mongoose saves the URL string directly into database
                        response.toString = function() {
                            return this.secure_url || this.url;
                        };
                        resolve(response);
                    }
                }
            );
            
            // Pass the buffer into the upload stream
            uploadStream.end(fileBuffer);
        });

    } catch (error) {
        console.error("Cloudinary upload error:", error.message || error);
        throw error;
    }
};

const deleteFile = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Cloudinary delete fallback
        if (
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
        ) {
            cloudinary.config({ 
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
                api_key: process.env.CLOUDINARY_API_KEY, 
                api_secret: process.env.CLOUDINARY_API_SECRET 
            });
            const getPublicIdFromUrl = (url) => {
                if (!url) return null;
                const parts = url.split('/upload/');
                if (parts.length < 2) return null;
                let filePart = parts[1];
                filePart = filePart.replace(/^v\d+\//, '');
                const lastDotIndex = filePart.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    filePart = filePart.substring(0, lastDotIndex);
                }
                return filePart;
            };

            const publicId = getPublicIdFromUrl(fileUrl);
            if (publicId) {
                const realTimestamp = await getRealTimestamp();
                await cloudinary.uploader.destroy(publicId, { timestamp: realTimestamp });
            }
        }
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};

export { upload, deleteFile };
