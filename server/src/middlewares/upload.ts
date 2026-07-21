import multer from "multer";
import { HttpError } from "./errorHandler";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Accepts a single image file in memory; Cloudinary receives the buffer directly. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Only jpg, png and webp images are allowed"));
      return;
    }
    callback(null, true);
  },
});
