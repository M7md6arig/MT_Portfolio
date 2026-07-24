import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { adminUpdateSettings, adminUploadSiteLogo, fetchSettings } from "@/services/api";
import type { SettingsPayload } from "@/types";
import { applyTheme } from "@/utils/theme";
import { ErrorBanner, Field, FlashNote, useFlash } from "./adminUi";
import { SingleImageUpload } from "./SingleImageUpload";

type ColorFields = Pick<SettingsPayload, "primaryColor" | "secondaryColor" | "accentColor">;

const COLOR_FIELDS: { key: keyof ColorFields; label: string; hint: string }[] = [
  { key: "primaryColor", label: "Primary (background)", hint: "Hero & Closing background" },
  { key: "secondaryColor", label: "Secondary (inner world)", hint: "Sections between the scenes" },
  { key: "accentColor", label: "Accent", hint: "Buttons, highlights, glows" },
];

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function AppearanceTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [colors, setColors] = useState<Required<ColorFields>>({
    primaryColor: "#0b0b10",
    secondaryColor: "#12141d",
    accentColor: "#e0b15c",
  });
  // What the hex text inputs show — may be mid-edit and temporarily invalid.
  const [drafts, setDrafts] = useState<Required<ColorFields>>(colors);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [flashMessage, flash] = useFlash();

  useEffect(() => {
    fetchSettings()
      .then(({ primaryColor, secondaryColor, accentColor, logoUrl }) => {
        setColors({ primaryColor, secondaryColor, accentColor });
        setDrafts({ primaryColor, secondaryColor, accentColor });
        setLogoUrl(logoUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  function setColor(key: keyof ColorFields, value: string) {
    setSaved(false);
    setDrafts((d) => ({ ...d, [key]: value }));
    if (HEX_PATTERN.test(value)) {
      setColors((c) => ({ ...c, [key]: value.toLowerCase() }));
    }
  }

  const allValid = Object.values(drafts).every((v) => HEX_PATTERN.test(v));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const settings = await adminUpdateSettings(colors);
      // Re-theme this tab immediately; the public site picks it up on next load.
      applyTheme(settings);
      setSaved(true);
    } catch (err) {
      onAuthError(err);
      setError("Saving colors failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="max-w-xl space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Site logo</h2>
          <FlashNote message={flashMessage} />
        </div>
        <p className="text-xs text-neutral-500">
          Shown in the navbar instead of the "MT.studio" text. Remove it to fall back to the text
          wordmark.
        </p>
        <SingleImageUpload
          label="Logo"
          imageUrl={logoUrl}
          onError={setError}
          onUpload={async (file) => {
            const settings = await adminUploadSiteLogo(file);
            setLogoUrl(settings.logoUrl);
            flash("Logo uploaded ✓");
          }}
        />
        {logoUrl && (
          <button
            type="button"
            onClick={async () => {
              try {
                const settings = await adminUpdateSettings({ clearLogo: true });
                setLogoUrl(settings.logoUrl);
                flash("Logo removed ✓ — back to text wordmark");
              } catch (err) {
                onAuthError(err);
                setError("Removing the logo failed.");
              }
            }}
            className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-red-400 hover:underline"
          >
            Remove logo (use text wordmark)
          </button>
        )}
      </section>

      <form onSubmit={onSubmit} className="space-y-6">
        <h2 className="font-display text-lg font-semibold text-white">Theme colors</h2>
        <ErrorBanner message={error} />

      <div className="space-y-5">
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
      </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving || !allValid} className="disabled:opacity-60">
            {saving ? "Saving…" : "Save colors"}
          </Button>
          {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}
