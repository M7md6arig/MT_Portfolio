import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { adminDeleteProjectImage, adminUploadProjectImage } from "@/services/api";
import type { ProjectImage } from "@/types";
import { cn } from "@/utils/cn";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface GalleryUploaderProps {
  projectId: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  /** Current thumbnail of the project (highlighted in the grid) */
  thumbnailUrl: string;
  /** Called when an image should become the project thumbnail */
  onUseAsThumbnail: (url: string) => void;
}

export function GalleryUploader({
  projectId,
  images,
  onChange,
  thumbnailUrl,
  onUseAsThumbnail,
}: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0); // number of in-flight uploads
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);

    const rejected = list.filter((f) => !ALLOWED.includes(f.type) || f.size > MAX_BYTES);
    if (rejected.length > 0) {
      setError("Some files were skipped — only jpg/png/webp up to 5MB are allowed.");
    }

    const accepted = list.filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_BYTES);
    let current = images;
    for (const file of accepted) {
      setUploading((n) => n + 1);
      try {
        const image = await adminUploadProjectImage(projectId, file);
        current = [...current, image];
        onChange(current);
        // First image of the gallery becomes the thumbnail automatically.
        if (current.length === 1) onUseAsThumbnail(image.url);
      } catch {
        setError(`Uploading "${file.name}" failed — check your connection and try again.`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) void uploadFiles(event.target.files);
    event.target.value = ""; // allow re-selecting the same file
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files);
  }

  async function removeImage(image: ProjectImage) {
    setError(null);
    try {
      await adminDeleteProjectImage(projectId, image.id);
      onChange(images.filter((i) => i.id !== image.id));
    } catch {
      setError("Deleting the image failed.");
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
          dragOver ? "border-accent bg-accent/10" : "border-line hover:border-accent/60",
        )}
      >
        <span className="text-sm text-neutral-300">
          {uploading > 0 ? `Uploading ${uploading} image${uploading > 1 ? "s" : ""}…` : "Upload photos"}
        </span>
        <span className="text-xs text-neutral-500">
          Click or drag & drop — jpg / png / webp, max 5MB each
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={onPick}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => {
            const isThumb = image.url === thumbnailUrl;
            return (
              <div
                key={image.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border",
                  isThumb ? "border-accent" : "border-line",
                )}
              >
                <img src={image.url} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  aria-label="Delete image"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-neutral-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                >
                  ×
                </button>
                {isThumb ? (
                  <span className="absolute bottom-1 left-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-night">
                    Thumbnail
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUseAsThumbnail(image.url)}
                    className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-neutral-300 opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    Use as thumbnail
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {uploading > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <div className="aspect-square animate-pulse rounded-lg border border-line bg-white/5" />
        </div>
      )}
    </div>
  );
}
