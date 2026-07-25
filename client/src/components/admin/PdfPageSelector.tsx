import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const THUMBNAIL_SCALE = 0.4;
const EXPORT_SCALE = 2;

interface UploadProgress {
  index: number;
  total: number;
}

interface PdfPageSelectorProps {
  file: File;
  uploadProgress: UploadProgress | null;
  onUpload: (files: File[]) => Promise<void>;
  onCancel: () => void;
}

/** Renders every page of a PDF as a thumbnail so the user can pick which pages become gallery images. */
export function PdfPageSelector({ file, uploadProgress, onUpload, onCancel }: PdfPageSelectorProps) {
  const [thumbnails, setThumbnails] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          pages.push(canvas.toDataURL("image/png"));
        }
        if (cancelled) return;
        setThumbnails(pages);
        setSelected(new Set(Array.from({ length: pdf.numPages }, (_, i) => i + 1)));
      } catch {
        if (!cancelled) setError("Couldn't read this PDF — it may be corrupted or password-protected.");
      }
    })();
    return () => {
      cancelled = true;
      void loadingTaskRef.current?.destroy();
    };
  }, [file]);

  function togglePage(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function applyRange() {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (!thumbnails || Number.isNaN(from) || Number.isNaN(to) || from < 1 || to > thumbnails.length || from > to) {
      setError("Enter a valid page range.");
      return;
    }
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      for (let i = from; i <= to; i++) next.add(i);
      return next;
    });
  }

  function selectAll() {
    if (thumbnails) setSelected(new Set(Array.from({ length: thumbnails.length }, (_, i) => i + 1)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleUpload() {
    const pdf = pdfRef.current;
    if (!pdf) return;
    setError(null);
    try {
      const pageNumbers = Array.from(selected).sort((a, b) => a - b);
      const baseName = file.name.replace(/\.pdf$/i, "");
      const files: File[] = [];
      for (const n of pageNumbers) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: EXPORT_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
        );
        files.push(new File([blob], `${baseName}-page-${n}.png`, { type: "image/png" }));
      }
      await onUpload(files);
    } catch {
      setError("Converting PDF pages to images failed.");
    }
  }

  const count = selected.size;
  const busy = uploadProgress !== null;

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-line bg-night/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm text-neutral-300">{file.name}</span>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="shrink-0 text-xs text-neutral-500 hover:text-red-400 disabled:opacity-40"
        >
          Cancel
        </button>
      </div>

      {!thumbnails && !error && <p className="text-xs text-neutral-500">Reading PDF…</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {thumbnails && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500">From page</span>
            <input
              type="number"
              min={1}
              max={thumbnails.length}
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="w-14 rounded-lg border border-line bg-night px-2 py-1 text-neutral-200"
            />
            <span className="text-neutral-500">to</span>
            <input
              type="number"
              min={1}
              max={thumbnails.length}
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="w-14 rounded-lg border border-line bg-night px-2 py-1 text-neutral-200"
            />
            <button
              type="button"
              onClick={applyRange}
              className="rounded-lg border border-line px-3 py-1 text-neutral-300 transition-colors hover:border-accent/60 hover:text-accent"
            >
              Apply
            </button>
            <span className="mx-1 h-4 w-px bg-line" />
            <button
              type="button"
              onClick={selectAll}
              className="text-neutral-300 underline-offset-2 transition-colors hover:text-accent hover:underline"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-neutral-300 underline-offset-2 transition-colors hover:text-accent hover:underline"
            >
              Deselect All
            </button>
          </div>

          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {thumbnails.map((src, i) => {
              const pageNum = i + 1;
              const isSelected = selected.has(pageNum);
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => togglePage(pageNum)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border-2 transition-colors",
                    isSelected ? "border-accent" : "border-line opacity-50 hover:opacity-80",
                  )}
                >
                  <img src={src} alt={`Page ${pageNum}`} className="w-full bg-white" />
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] text-neutral-200">
                    {pageNum}
                  </span>
                  {isSelected && (
                    <span className="absolute left-0.5 top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-accent text-[8px] font-bold text-night">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={count === 0 || busy}
            onClick={() => void handleUpload()}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-night transition-opacity disabled:opacity-40"
          >
            {busy
              ? `Uploading page ${uploadProgress.index} of ${uploadProgress.total}…`
              : `Upload Selected Pages (${count})`}
          </button>
        </>
      )}
    </div>
  );
}
