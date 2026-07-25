import multer from "multer";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "../config/uploadLimits";
import { HttpError } from "./errorHandler";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_VIDEO_EXTENSIONS = /\.(mp4|webm|mov)$/i;

/**
 * Some browsers/OSes report an unhelpful mimetype for otherwise-valid video
 * files — empty string, "application/octet-stream", or (for .mov specifically)
 * "video/x-quicktime" instead of "video/quicktime" depending on the source
 * device. Fall back to the file extension rather than rejecting a real video
 * on a technicality; Cloudinary itself validates the actual content anyway.
 */
function isAllowedVideo(file: Express.Multer.File): boolean {
  return ALLOWED_VIDEO_TYPES.has(file.mimetype) || ALLOWED_VIDEO_EXTENSIONS.test(file.originalname);
}

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
    if (!isAllowedVideo(file)) {
      callback(new HttpError(400, "Only mp4, webm and mov videos are allowed"));
      return;
    }
    callback(null, true);
  },
});
