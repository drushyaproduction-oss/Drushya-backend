import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import connectDB from "./src/db/db_index.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import { Admin } from "./src/models/admin.model.js";


// Load environment variables
dotenv.config({
    path: "./.env"
});


const app = express();

// Middlewares
app.use(cors({
    origin: function(origin, callback) {
        callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Force JSON parsing for write requests when no content-type is provided or is plain text
app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
        const contentType = req.headers["content-type"];
        if (!contentType || contentType.includes("text/plain")) {
            req.headers["content-type"] = "application/json";
        }
    }
    next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // Serve static files from 'public' folder (e.g. public/uploads)
app.use(cookieParser());

// Seed default Admin if not exists
const seedAdmin = async () => {
    try {
        const count = await Admin.countDocuments();
        if (count === 0) {
            console.log("No admin found in database. Seeding default admin...");
            const username = process.env.ADMIN_USERNAME || "admin";
            const email = process.env.ADMIN_EMAIL || "admin@drushya.com";
            const password = process.env.ADMIN_PASSWORD || "adminPassword123";

            await Admin.create({
                username,
                email,
                password
            });
            console.log(`✅ Default admin created. Username: ${username}, Email: ${email}`);
        } else {
            console.log("Admin account exists. Skipping seed.");
        }
    } catch (error) {
        console.error("❌ Admin seeding failed:", error);
    }
};

// Import Routes
import adminRouter from "./src/routes/admin.routes.js";
import categoryRouter from "./src/routes/category.routes.js";
import subcategoryRouter from "./src/routes/subcategory.routes.js";
import packageRouter from "./src/routes/package.routes.js";
import bookingRouter from "./src/routes/bookingRequest.routes.js";
import reviewRouter from "./src/routes/review.routes.js";
import contactRouter from "./src/routes/contact.routes.js";
import bannerRouter from "./src/routes/banner.routes.js";
import workspaceRouter from "./src/routes/workspace.routes.js";
import aboutRouter from "./src/routes/about.routes.js";

// Register Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subcategories", subcategoryRouter);
app.use("/api/v1/packages", packageRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/contacts", contactRouter);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/workspaces", workspaceRouter);
app.use("/api/v1/about", aboutRouter);

// Global Error Handler (must be registered last)
app.use(errorHandler);

// Database Connection and Server Startup
connectDB()
    .then(async () => {
        // Seed admin user
        await seedAdmin();

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`⚙️ Server is running at port : ${port}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
