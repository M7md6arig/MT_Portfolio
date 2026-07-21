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

export function AppearanceTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [colors, setColors] = useState<Required<SettingsPayload>>({
    primaryColor: "#0b0b10",
    secondaryColor: "#12141d",
    accentColor: "#e0b15c",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(({ primaryColor, secondaryColor, accentColor }) =>
        setColors({ primaryColor, secondaryColor, accentColor }),
      )
      .finally(() => setLoading(false));
  }, []);

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
        {COLOR_FIELDS.map(({ key, label, hint }) => (
          <Field key={key} label={label}>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => {
                  setColors({ ...colors, [key]: e.target.value });
                  setSaved(false);
                }}
                className="h-11 w-16 cursor-pointer rounded-lg border border-line bg-transparent"
                aria-label={label}
              />
              <code className="text-sm text-neutral-300">{colors[key]}</code>
              <span className="text-xs text-neutral-500">{hint}</span>
            </div>
          </Field>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving} className="disabled:opacity-60">
          {saving ? "Saving…" : "Save colors"}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
      </div>
    </form>
  );
}
