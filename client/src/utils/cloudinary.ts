const UPLOAD_MARKER = "/upload/";
// An existing Cloudinary transformation segment right after /upload/, e.g.
// "f_auto,q_auto,w_400" — a comma-separated list of "letters_value" pairs.
// Doesn't match the version segment (e.g. "v1234567890"), which has no "_".
const TRANSFORMATION_SEGMENT = /^[a-z]+_[^/]+(,[a-z]+_[^/,]+)*\//i;
const MIN_WIDTH = 20;

/**
 * Requests an optimized, right-sized delivery of a Cloudinary-hosted image via
 * URL transformation (auto format + quality, capped width) instead of the
 * full original file — Cloudinary generates and caches the derived asset on
 * first request, no re-upload needed. Non-Cloudinary URLs (placeholders,
 * local blob: previews) pass through untouched.
 *
 * Idempotent and defensive: replaces (rather than stacks on top of) any
 * transformation already present, and floors the width — chained transforms
 * apply sequentially, so a bad/accidental small width from a previous call
 * (e.g. Array#map passing its index into an unwrapped callback) would
 * otherwise crush the image to a handful of pixels instead of just resizing
 * it, rendering as a smeared block of color.
 */
export function cloudinaryUrl(url: string, width: number): string {
  const index = url.indexOf(UPLOAD_MARKER);
  if (index === -1) return url;
  const insertAt = index + UPLOAD_MARKER.length;
  const rest = url.slice(insertAt).replace(TRANSFORMATION_SEGMENT, "");
  const safeWidth = Math.max(Math.round(width) || 0, MIN_WIDTH);
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${safeWidth}/${rest}`;
}

const VIDEO_UPLOAD_MARKER = "/video/upload/";
const VIDEO_EXTENSION = /\.(mp4|webm|mov|mkv|avi)$/i;

/**
 * Derives a still-frame JPG thumbnail from a Cloudinary-hosted video via its
 * on-the-fly video transformation: `so_2` (start offset, seconds) picks a
 * frame 2s in — enough to skip a black/blank opening frame on most clips —
 * and the delivered extension switches from the video format to .jpg, which
 * is all Cloudinary needs to serve a frame instead of the video itself.
 * Combines with the same f_auto/q_auto/w_ sizing cloudinaryUrl() uses, in one
 * transformation segment (Cloudinary reads comma-separated params together —
 * stacking two separate segments here would just re-run so_2 on that frame).
 * Non-Cloudinary video URLs (external YouTube/Facebook links) return null —
 * there's no equivalent transformation available for those.
 */
export function videoThumbnailUrl(mediaUrl: string, width?: number): string | null {
  const index = mediaUrl.indexOf(VIDEO_UPLOAD_MARKER);
  if (index === -1 || !VIDEO_EXTENSION.test(mediaUrl)) return null;
  const insertAt = index + VIDEO_UPLOAD_MARKER.length;
  const rest = mediaUrl.slice(insertAt).replace(VIDEO_EXTENSION, ".jpg");
  const safeWidth = width ? Math.max(Math.round(width) || 0, MIN_WIDTH) : null;
  const transform = safeWidth ? `so_2,f_auto,q_auto,w_${safeWidth}` : "so_2";
  return `${mediaUrl.slice(0, insertAt)}${transform}/${rest}`;
}
