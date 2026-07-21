import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { adminUpdateSettings, fetchSettings } from "@/services/api";
import type { SettingsPayload } from "@/types";
import { applyTheme } from "@/utils/theme";
import { ErrorBanner, Field } from "./adminUi";

const COLOR_FIELDS: { key: keyof SettingsPayload; label: string; hint: string }[] = [
  { key: "primaryColor", label: "Primary (background)", hint: "Hero & Closing background" },
  { key: "secondaryColor", label: "Secondary (inner world)", hint: "Sections between the scenes" },
  { key: "accentColor", label: "Accent", hint: "Buttons, highlights, glows" },
];

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function AppearanceTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [colors, setColors] = useState<Required<SettingsPayload>>({
    primaryColor: "#0b0b10",
    secondaryColor: "#12141d",
    accentColor: "#e0b15c",
  });
  // What the hex text inputs show — may be mid-edit and temporarily invalid.
  const [drafts, setDrafts] = useState<Required<SettingsPayload>>(colors);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(({ primaryColor, secondaryColor, accentColor }) => {
        setColors({ primaryColor, secondaryColor, accentColor });
        setDrafts({ primaryColor, secondaryColor, accentColor });
      })
      .finally(() => setLoading(false));
  }, []);

  function setColor(key: keyof SettingsPayload, value: string) {
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
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
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
  );
}
