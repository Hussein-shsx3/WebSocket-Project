"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicIdFromUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const uploadToCloudinary = async (file, folder = "chat-app/avatars") => {
    return new Promise((resolve, reject) => {
        const upload = cloudinary_config_1.default.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        upload.end(file.buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary_config_1.default.uploader.destroy(publicId);
    }
    catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const getPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${filename}`;
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
//# sourceMappingURL=cloudinary.util.js.map