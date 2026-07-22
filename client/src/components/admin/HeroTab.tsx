import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { HERO_CARDS } from "@/data/constants";
import {
  adminUpdateHeroCard,
  adminUploadHeroCardImage,
  fetchHeroCards,
} from "@/services/api";
import type { HeroCardContent } from "@/types";
import { adminInput, ErrorBanner, Field, FlashNote, useFlash } from "./adminUi";

/** One fixed hero slot: artwork upload (instant) + title with an explicit save. */
function SlotEditor({
  slotId,
  defaultTitle,
  content,
  onContentChange,
  onError,
  flash,
}: {
  slotId: string;
  defaultTitle: string;
  content: HeroCardContent | undefined;
  onContentChange: (next: HeroCardContent) => void;
  onError: (err: unknown, message: string) => void;
  flash: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(content?.title ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(content?.title ?? "");
  }, [content?.title]);

  async function onPickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      onError(null, "Only jpg/png/webp up to 5MB are allowed.");
      return;
    }
    setUploading(true);
    try {
      onContentChange(await adminUploadHeroCardImage(slotId, file));
      flash("Image uploaded ✓");
    } catch (err) {
      onError(err, `Uploading the image for ${slotId} failed.`);
    } finally {
      setUploading(false);
    }
  }

  async function saveTitle() {
    setSaving(true);
    try {
      onContentChange(await adminUpdateHeroCard(slotId, { title: title.trim() || null }));
      flash("Title saved ✓");
    } catch (err) {
      onError(err, `Saving the title for ${slotId} failed.`);
    } finally {
      setSaving(false);
    }
  }

  const dirty = (content?.title ?? "") !== title.trim() && !(title.trim() === "" && !content?.title);

  return (
    <div className="space-y-3 rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-neutral-500">{slotId}</span>
        {content?.imageWidth && content?.imageHeight && (
          <span className="text-[10px] text-neutral-600">
            {content.imageWidth}×{content.imageHeight}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative block w-full overflow-hidden rounded-xl border border-dashed border-line transition-colors hover:border-accent/60"
        aria-label={`Upload image for ${slotId}`}
      >
        {content?.imageUrl ? (
          <img src={content.imageUrl} alt="" className="max-h-40 w-full object-contain bg-night" />
        ) : (
          <div className="grid h-24 place-items-center text-xs text-neutral-500">
            No custom image — using project cover
          </div>
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
        onChange={onPickImage}
      />

      {content?.imageUrl && (
        <button
          type="button"
          onClick={async () => {
            try {
              onContentChange(await adminUpdateHeroCard(slotId, { clearImage: true }));
              flash("Image removed ✓ — back to project cover");
            } catch (err) {
              onError(err, `Removing the image for ${slotId} failed.`);
            }
          }}
          className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-red-400 hover:underline"
        >
          Remove image (use project cover)
        </button>
      )}

      <Field label="Title">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={defaultTitle}
            maxLength={80}
            className={adminInput}
          />
          <Button
            onClick={saveTitle}
            disabled={saving || !dirty}
            className="px-4 py-2 text-xs disabled:opacity-50"
          >
            {saving ? "…" : "Save"}
          </Button>
        </div>
      </Field>
    </div>
  );
}

export function HeroTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [contents, setContents] = useState<Map<string, HeroCardContent>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, flash] = useFlash();

  useEffect(() => {
    fetchHeroCards()
      .then((cards) => setContents(new Map(cards.map((c) => [c.id, c]))))
      .finally(() => setLoading(false));
  }, []);

  function handleError(err: unknown, message: string) {
    if (err) onAuthError(err);
    setError(message);
  }

  if (loading) return <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Hero cards</h2>
          <p className="mt-1 text-xs text-neutral-500">
            Positions are fixed by the scene layout. Uploading an image resizes the card to the
            image&apos;s own aspect ratio; an empty title falls back to the default.
          </p>
        </div>
        <FlashNote message={flashMessage} />
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HERO_CARDS.map((slot) => (
          <SlotEditor
            key={slot.id}
            slotId={slot.id}
            defaultTitle={slot.title}
            content={contents.get(slot.id)}
            onContentChange={(next) => {
              setError(null);
              setContents((m) => new Map(m).set(next.id, next));
            }}
            onError={handleError}
            flash={flash}
          />
        ))}
      </div>
    </section>
  );
}
