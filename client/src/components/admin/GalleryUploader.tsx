import { ChangeEvent, DragEvent, Suspense, lazy, useRef, useState } from "react";
import { adminDeleteProjectImage, adminUploadProjectImage } from "@/services/api";
import type { ProjectImage } from "@/types";
import { cn } from "@/utils/cn";

// pdfjs-dist is a large dependency (~500KB gzipped plus a worker file) needed only
// when an admin actually picks a PDF — lazy-loaded so it never bloats the bundle
// every visitor (including the public site) downloads on first load.
const PdfPageSelector = lazy(() =>
  import("./PdfPageSelector").then((m) => ({ default: m.PdfPageSelector })),
);

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

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
  const [progress, setProgress] = useState<{ index: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);

    const pdfFiles = list.filter(isPdf);
    const rest = list.filter((f) => !isPdf(f));

    const rejected = rest.filter((f) => !ALLOWED_IMAGE_TYPES.includes(f.type) || f.size > MAX_BYTES);
    const messages: string[] = [];
    if (pdfFiles.length > 1) {
      messages.push("Only the first PDF was opened — add the others afterwards.");
    }
    if (rejected.length > 0) {
      messages.push("Some files were skipped — only jpg/png/webp up to 20MB are allowed.");
    }
    if (messages.length > 0) setError(messages.join(" "));

    // A PDF isn't uploaded directly — its pages are picked first, then converted
    // to images and fed back through this same function (see the onUpload prop below).
    if (pdfFiles.length > 0) setPdfFile(pdfFiles[0]);

    const accepted = rest.filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_BYTES);
    let current = images;
    for (let i = 0; i < accepted.length; i++) {
      const file = accepted[i];
      setProgress({ index: i + 1, total: accepted.length });
      try {
        const image = await adminUploadProjectImage(projectId, file);
        current = [...current, image];
        onChange(current);
        // First image of the gallery becomes the thumbnail automatically.
        if (current.length === 1) onUseAsThumbnail(image.url);
      } catch {
        setError(`Uploading "${file.name}" failed — check your connection and try again.`);
      }
    }
    setProgress(null);
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
      {pdfFile ? (
        <Suspense
          fallback={
            <div className="rounded-xl border border-dashed border-line bg-night/40 p-4 text-xs text-neutral-500">
              Loading PDF viewer…
            </div>
          }
        >
          <PdfPageSelector
            file={pdfFile}
            uploadProgress={progress}
            onCancel={() => setPdfFile(null)}
            onUpload={async (pageFiles) => {
              await uploadFiles(pageFiles);
              setPdfFile(null);
            }}
          />
        </Suspense>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            // The Field wrapper renders a native <label>; since this div isn't itself
            // a form control, a plain click also triggers the label's own default
            // action of activating the first labelable descendant (this hidden file
            // input) — doubling up with the explicit .click() below and opening the
            // OS file picker twice per click. preventDefault() suppresses that.
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.click();
          }}
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
            {progress ? `Uploading ${progress.index} of ${progress.total}…` : "Upload photos or a PDF"}
          </span>
          <span className="text-xs text-neutral-500">
            Click or drag & drop — jpg / png / webp (max 20MB) or a PDF to pick pages from
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
        multiple
        hidden
        onChange={onPick}
      />

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

      {progress !== null && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <div className="aspect-square animate-pulse rounded-lg border border-line bg-white/5" />
        </div>
      )}
    </div>
  );
}
