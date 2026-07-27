import { isAxiosError } from "axios";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { adminDeleteProjectVideo, adminUploadProjectVideo } from "@/services/api";
import { cn } from "@/utils/cn";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXTENSIONS = /\.(mp4|webm|mov)$/i;

/**
 * Some browsers/OSes report an unhelpful mimetype for otherwise-valid video
 * files (empty string, "application/octet-stream", device-specific variants
 * of .mov's type). Fall back to the file extension instead of rejecting a
 * real video on a technicality — the server re-validates the same way.
 */
function isAllowedVideo(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.test(file.name);
}

interface VideoUploaderProps {
  projectId: string;
  videoUrl: string | null;
  onChange: (videoUrl: string | null) => void;
}

/** Uploads a project's video file directly to Cloudinary; a new upload replaces the old one. */
export function VideoUploader({ projectId, videoUrl, onChange }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    if (uploading) return;
    if (!isAllowedVideo(file) || file.size > MAX_BYTES) {
      setError("Only mp4, webm and mov videos up to 50MB are allowed.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const project = await adminUploadProjectVideo(projectId, file);
      onChange(project.mediaUrl);
    } catch (err) {
      // Surface the server's actual reason (wrong type, too large, etc.)
      // instead of a generic message that hides what really went wrong.
      const serverMessage = isAxiosError(err) ? (err.response?.data as { error?: string })?.error : null;
      setError(serverMessage ?? "Uploading the video failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  async function onRemove() {
    setError(null);
    try {
      await adminDeleteProjectVideo(projectId);
      onChange(null);
    } catch (err) {
      const serverMessage = isAxiosError(err) ? (err.response?.data as { error?: string })?.error : null;
      setError(serverMessage ?? "Removing the video failed.");
    }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        // Only wire up click-to-upload on the empty state — once a video exists,
        // native <video controls> (play, scrub) live in this same area and must
        // keep receiving clicks; replacing then goes through the explicit button.
        onClick={
          videoUrl
            ? undefined
            : (e) => {
                // The Field wrapper renders a native <label>; since this div isn't itself
                // a form control, a plain click also triggers the label's own default
                // action of activating the first labelable descendant (this hidden file
                // input) — doubling up with the explicit .click() below and opening the
                // OS file picker twice per click. preventDefault() suppresses that.
                e.preventDefault();
                e.stopPropagation();
                inputRef.current?.click();
              }
        }
        role={videoUrl ? undefined : "button"}
        tabIndex={videoUrl ? undefined : 0}
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-dashed transition-colors",
          videoUrl ? "" : "cursor-pointer",
          dragOver ? "border-accent bg-accent/10" : "border-line bg-night/40 hover:border-accent/60",
        )}
      >
        {videoUrl ? (
          <>
            <video src={videoUrl} controls className="w-full rounded-xl bg-night" />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="absolute right-2 top-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/90 hover:text-accent disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Replace video"}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
            <span className="text-sm text-neutral-300">
              {uploading ? "Uploading video…" : "Upload video"}
            </span>
            <span className="text-xs text-neutral-500">
              Click or drag & drop — mp4 / webm / mov, max 50MB
            </span>
          </div>
        )}
      </div>

      {videoUrl && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void onRemove()}
          className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-red-400 hover:underline disabled:opacity-60"
        >
          Remove video
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        hidden
        onChange={onPick}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
