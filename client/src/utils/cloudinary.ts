const UPLOAD_MARKER = "/upload/";

/**
 * Requests an optimized, right-sized delivery of a Cloudinary-hosted image via
 * URL transformation (auto format + quality, capped width) instead of the
 * full original file — Cloudinary generates and caches the derived asset on
 * first request, no re-upload needed. Non-Cloudinary URLs (placeholders,
 * local blob: previews) pass through untouched.
 */
export function cloudinaryUrl(url: string, width: number): string {
  const index = url.indexOf(UPLOAD_MARKER);
  if (index === -1) return url;
  const insertAt = index + UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${url.slice(insertAt)}`;
}
