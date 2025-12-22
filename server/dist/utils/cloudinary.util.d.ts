import { UploadApiResponse } from "cloudinary";
export declare const uploadToCloudinary: (file: Express.Multer.File, folder?: string) => Promise<UploadApiResponse>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export declare const getPublicIdFromUrl: (url: string) => string;
//# sourceMappingURL=cloudinary.util.d.ts.map