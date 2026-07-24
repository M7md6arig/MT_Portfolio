import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { adminUpdateSettings, adminUploadSiteLogo, fetchSettings } from "@/services/api";
import type { SettingsPayload } from "@/types";
import { applyTheme } from "@/utils/theme";
import { ErrorBanner, Field } from "./adminUi";

type ColorFields = Pick<SettingsPayload, "primaryColor" | "secondaryColor" | "accentColor">;

const COLOR_FIELDS: { key: keyof ColorFields; label: string; hint: string }[] = [
  { key: "primaryColor", label: "Primary (background)", hint: "Hero & Closing background" },
  { key: "secondaryColor", label: "Secondary (inner world)", hint: "Sections between the scenes" },
  { key: "accentColor", label: "Accent", hint: "Buttons, highlights, glows" },
];

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const MAX_LOGO_BYTES = 20 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AppearanceTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [colors, setColors] = useState<Required<ColorFields>>({
    primaryColor: "#0b0b10",
    secondaryColor: "#12141d",
    accentColor: "#e0b15c",
  });
  // What the hex text inputs show — may be mid-edit and temporarily invalid.
  const [drafts, setDrafts] = useState<Required<ColorFields>>(colors);

  // Logo: savedLogoUrl is what's on the server; logoFile/logoPreview are a
  // pending selection that only takes effect on Save (same submit as colors).
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(({ primaryColor, secondaryColor, accentColor, logoUrl }) => {
        setColors({ primaryColor, secondaryColor, accentColor });
        setDrafts({ primaryColor, secondaryColor, accentColor });
        setSavedLogoUrl(logoUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  // Release the local preview URL once it's no longer shown.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function setColor(key: keyof ColorFields, value: string) {
    setSaved(false);
    setDrafts((d) => ({ ...d, [key]: value }));
    if (HEX_PATTERN.test(value)) {
      setColors((c) => ({ ...c, [key]: value.toLowerCase() }));
    }
  }

  function onPickLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.includes(file.type) || file.size > MAX_LOGO_BYTES) {
      setError("Only jpg/png/webp up to 20MB are allowed.");
      return;
    }
    setError(null);
    setSaved(false);
    setRemoveLogo(false);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  const displayedLogo = removeLogo ? null : (logoPreview ?? savedLogoUrl);
  const allValid = Object.values(drafts).every((v) => HEX_PATTERN.test(v));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      let settings = await adminUpdateSettings(removeLogo ? { ...colors, clearLogo: true } : colors);
      if (logoFile) {
        settings = await adminUploadSiteLogo(logoFile);
      }
      applyTheme(settings);
      setSavedLogoUrl(settings.logoUrl);
      setLogoFile(null);
      setLogoPreview(null);
      setRemoveLogo(false);
      setSaved(true);
    } catch (err) {
      onAuthError(err);
      setError("Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-10">
      <ErrorBanner message={error} />

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Site logo</h2>
        <p className="text-xs text-neutral-500">
          Shown in the navbar instead of the "MT.studio" text. Picking a new image or removing the
          logo only takes effect once you press Save below.
        </p>

        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          className="group relative block w-full overflow-hidden rounded-xl border border-dashed border-line bg-night/40 transition-colors hover:border-accent/60"
        >
          {displayedLogo ? (
            <img src={displayedLogo} alt="" className="h-32 w-full bg-night object-contain" />
          ) : (
            <div className="grid h-24 place-items-center text-xs text-neutral-500">
              {removeLogo ? "Logo will be removed on save" : "Click to upload"}
            </div>
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Choose image
          </span>
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onPickLogo}
        />

        {displayedLogo && (
          <button
            type="button"
            onClick={() => {
              setRemoveLogo(true);
              setLogoFile(null);
              setLogoPreview(null);
              setSaved(false);
            }}
            className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-red-400 hover:underline"
          >
            Remove logo (use text wordmark)
          </button>
        )}
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-white">Theme colors</h2>

        {COLOR_FIELDS.map(({ key, label, hint }) => {
          const draftValid = HEX_PATTERN.test(drafts[key]);
          return (
            <Field key={key} label={label}>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColor(key, e.target.value)}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-line bg-transparent"
                  aria-label={label}
                />
                <input
                  type="text"
                  value={drafts[key]}
                  onChange={(e) => setColor(key, e.target.value.trim())}
                  onBlur={() => {
                    // Abandon an invalid edit instead of leaving a broken value behind.
                    if (!HEX_PATTERN.test(drafts[key])) {
                      setDrafts((d) => ({ ...d, [key]: colors[key] }));
                    }
                  }}
                  spellCheck={false}
                  maxLength={7}
                  aria-label={`${label} hex value`}
                  aria-invalid={!draftValid}
                  className={`w-28 rounded-xl border bg-night/60 px-3 py-2.5 font-mono text-sm text-neutral-100 transition-colors focus:outline-none ${
                    draftValid ? "border-line focus:border-accent/60" : "border-red-500/70"
                  }`}
                  placeholder="#e0b15c"
                />
                <span className="text-xs text-neutral-500">{hint}</span>
              </div>
              {!draftValid && (
                <p className="mt-1 text-xs text-red-400">Use the #rrggbb format, e.g. #e0b15c</p>
              )}
            </Field>
          );
        })}
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving || !allValid} className="disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
      </div>
    </form>
  );
}
