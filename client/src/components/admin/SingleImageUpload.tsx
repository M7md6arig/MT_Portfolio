import { ChangeEvent, useRef, useState } from "react";
import { Field } from "./adminUi";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface SingleImageUploadProps {
  label: string;
  required?: boolean;
  imageUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onError: (message: string) => void;
}

/** One click-to-upload image slot; each new upload replaces the previous one. */
export function SingleImageUpload({ label, required, imageUrl, onUpload, onError }: SingleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED.includes(file.type) || file.size > MAX_BYTES) {
      onError("Only jpg/png/webp up to 20MB are allowed.");
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      onError(`Uploading ${label.toLowerCase()} failed.`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field label={required ? `${label} *` : label}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative block w-full overflow-hidden rounded-xl border border-dashed border-line bg-night/40 transition-colors hover:border-accent/60"
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-32 w-full bg-night object-contain" />
        ) : (
          <div className="grid h-24 place-items-center text-xs text-neutral-500">Click to upload</div>
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? "Uploading…" : "Upload image"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={onPick}
      />
    </Field>
  );
}
