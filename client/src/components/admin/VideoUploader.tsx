import { ChangeEvent, useRef, useState } from "react";
import { adminDeleteProjectVideo, adminUploadProjectVideo } from "@/services/api";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = ["video/mp4", "video/webm", "video/quicktime"];

interface VideoUploaderProps {
  projectId: string;
  videoUrl: string | null;
  onChange: (videoUrl: string | null) => void;
}

/** Uploads a project's video file directly to Cloudinary; a new upload replaces the old one. */
export function VideoUploader({ projectId, videoUrl, onChange }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type) || file.size > MAX_BYTES) {
      setError("Only mp4, webm and mov videos up to 50MB are allowed.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const project = await adminUploadProjectVideo(projectId, file);
      onChange(project.mediaUrl);
    } catch {
      setError("Uploading the video failed — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onRemove() {
    setError(null);
    try {
      await adminDeleteProjectVideo(projectId);
      onChange(null);
    } catch {
      setError("Removing the video failed.");
    }
  }

  return (
    <div className="space-y-2">
      {videoUrl ? (
        <div className="space-y-2">
          <video src={videoUrl} controls className="w-full rounded-xl border border-line bg-night" />
          <button
            type="button"
            onClick={() => void onRemove()}
            className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-red-400 hover:underline"
          >
            Remove video
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-night/40 px-4 py-6 text-center transition-colors hover:border-accent/60"
        >
          <span className="text-sm text-neutral-300">
            {uploading ? "Uploading video…" : "Upload video"}
          </span>
          <span className="text-xs text-neutral-500">mp4 / webm / mov — max 50MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        hidden
        onChange={onPick}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
