import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
// A thin wrapper around pdfjs-dist's own worker script — see its comment for
// why this can't just be "pdfjs-dist/build/pdf.worker.min.mjs?url" directly.
// "?worker&url" (not a bare "?url") is Vite's documented pattern for handing
// a worker's URL, as a string, to a third-party library that constructs its
// own Worker instance — it bundles the module's own import graph (the nested
// pdf.worker.min.mjs import) into a proper standalone worker chunk, which a
// bare "?url" on a source file silently failed to do.
import pdfWorkerUrl from "@/utils/pdfWorkerEntry.ts?worker&url";

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

/** True once a page has failed to render — thumbnails.current[i] stays null for it. */
function isRenderable(src: string | null): src is string {
  return src !== null;
}

/** Renders every page of a PDF as a thumbnail so the user can pick which pages become gallery images. */
export function PdfPageSelector({ file, uploadProgress, onUpload, onCancel }: PdfPageSelectorProps) {
  const [thumbnails, setThumbnails] = useState<(string | null)[] | null>(null);
  const [failedPages, setFailedPages] = useState<Set<number>>(new Set());
  const [failureReasons, setFailureReasons] = useState<Map<number, string>>(new Map());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<pdfjsLib.PDFDocumentLoadingTask | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Loading the document and rendering its pages are two very different
      // failure modes. A load failure means the file itself couldn't be opened
      // (genuinely corrupt, or actually password-protected) — that's fatal.
      // A single page failing to render (an unsupported font, an odd color
      // space, one malformed object) does NOT mean the file is bad; the other
      // pages are still perfectly usable, so it must not abort the whole preview.
      let pdf: pdfjsLib.PDFDocumentProxy;
      try {
        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        loadingTaskRef.current = loadingTask;
        pdf = await loadingTask.promise;
      } catch (err) {
        if (cancelled) return;
        const isPasswordProtected =
          err instanceof Error && err.name === "PasswordException";
        setError(
          isPasswordProtected
            ? "This PDF is password-protected — remove the password and try again."
            : `Couldn't open this PDF: ${err instanceof Error ? err.message : String(err)}`,
        );
        return;
      }
      if (cancelled) return;
      pdfRef.current = pdf;

      const pages: (string | null)[] = [];
      const failed = new Set<number>();
      const reasons = new Map<number, string>();
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("2D canvas context unavailable");
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          pages.push(canvas.toDataURL("image/png"));
        } catch (err) {
          console.error(`[PdfPageSelector] page ${i} failed to render:`, err);
          pages.push(null);
          failed.add(i);
          // Surfaced in the UI too (not just the console) — the exact reason
          // varies a lot page to page (an unsupported font, an odd color
          // space, a malformed image stream), so a generic "unsupported
          // content" banner previously hid the one detail actually needed to
          // diagnose it without reopening dev tools.
          reasons.set(i, err instanceof Error ? `${err.name}: ${err.message}` : String(err));
        }
      }
      if (cancelled) return;
      setThumbnails(pages);
      setFailedPages(failed);
      setFailureReasons(reasons);
      // Pages that failed to render can't be converted to an image either — leave them unselected.
      setSelected(new Set(Array.from({ length: pdf.numPages }, (_, i) => i + 1).filter((n) => !failed.has(n))));
    })();
    return () => {
      cancelled = true;
      void loadingTaskRef.current?.destroy();
    };
  }, [file]);

  function togglePage(n: number) {
    if (failedPages.has(n)) return;
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
      for (let i = from; i <= to; i++) if (!failedPages.has(i)) next.add(i);
      return next;
    });
  }

  function selectAll() {
    if (thumbnails) {
      setSelected(
        new Set(Array.from({ length: thumbnails.length }, (_, i) => i + 1).filter((n) => !failedPages.has(n))),
      );
    }
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleUpload() {
    const pdf = pdfRef.current;
    if (!pdf) return;
    setError(null);
    const pageNumbers = Array.from(selected).sort((a, b) => a - b);
    const baseName = file.name.replace(/\.pdf$/i, "");
    const files: File[] = [];
    const failedExports: number[] = [];
    for (const n of pageNumbers) {
      try {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: EXPORT_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2D canvas context unavailable");
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
        );
        files.push(new File([blob], `${baseName}-page-${n}.png`, { type: "image/png" }));
      } catch (err) {
        console.error(`[PdfPageSelector] page ${n} failed to convert for upload:`, err);
        failedExports.push(n);
      }
    }
    if (failedExports.length > 0) {
      setError(
        `Page${failedExports.length > 1 ? "s" : ""} ${failedExports.join(", ")} couldn't be converted and ${
          failedExports.length > 1 ? "were" : "was"
        } skipped.`,
      );
    }
    if (files.length > 0) await onUpload(files);
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

          {failedPages.size > 0 && (
            <div className="space-y-1 text-xs text-amber-400">
              <p>
                Page{failedPages.size > 1 ? "s" : ""} {Array.from(failedPages).sort((a, b) => a - b).join(", ")}{" "}
                couldn't be previewed and {failedPages.size > 1 ? "are" : "is"} excluded:
              </p>
              <ul className="list-inside list-disc space-y-0.5 text-amber-400/80">
                {Array.from(failureReasons.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([n, reason]) => (
                    <li key={n} className="break-all">
                      Page {n}: {reason}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
            {thumbnails.map((src, i) => {
              const pageNum = i + 1;
              const isSelected = selected.has(pageNum);
              const failed = !isRenderable(src);
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => togglePage(pageNum)}
                  disabled={failed}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border-2 transition-colors",
                    failed
                      ? "cursor-not-allowed border-line/50 bg-black/40"
                      : isSelected
                        ? "border-accent"
                        : "border-line opacity-50 hover:opacity-80",
                  )}
                >
                  {failed ? (
                    <div className="grid aspect-[3/4] w-full place-items-center text-[9px] text-neutral-600">
                      Preview failed
                    </div>
                  ) : (
                    <img src={src} alt={`Page ${pageNum}`} className="w-full bg-white" />
                  )}
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
