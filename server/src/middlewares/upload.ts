import multer from "multer";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "../config/uploadLimits";
import { HttpError } from "./errorHandler";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES };

/** Accepts a single image file in memory; Cloudinary receives the buffer directly. */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Only jpg, png and webp images are allowed"));
      return;
    }
    callback(null, true);
  },
});

/** Accepts a single video file in memory; mp4/webm/mov only, capped at MAX_VIDEO_BYTES. */
export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_VIDEO_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Only mp4, webm and mov videos are allowed"));
      return;
    }
    callback(null, true);
  },
});
