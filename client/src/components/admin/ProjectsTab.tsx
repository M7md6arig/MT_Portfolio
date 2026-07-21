import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import {
  adminCreateProject,
  adminDeleteProject,
  adminListProjects,
  adminUpdateProject,
} from "@/services/api";
import type { Project, ProjectCategory, ProjectPayload } from "@/types";
import { adminInput, ErrorBanner, Field, RowActions } from "./adminUi";

const CATEGORIES: ProjectCategory[] = ["poster", "video", "motion", "website"];

const emptyForm: ProjectPayload = {
  title: "",
  description: "",
  category: "poster",
  thumbnailUrl: "",
  mediaUrl: null,
  liveUrl: null,
  tags: [],
  order: 0,
};

export function ProjectsTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [form, setForm] = useState<ProjectPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setProjects(await adminListProjects());
    } catch (err) {
      onAuthError(err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing("new");
  }

  function openEdit(project: Project) {
    setForm({
      title: project.title,
      description: project.description,
      category: project.category,
      thumbnailUrl: project.thumbnailUrl,
      mediaUrl: project.mediaUrl,
      liveUrl: project.liveUrl,
      tags: project.tags,
      order: project.order,
    });
    setEditing(project);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: ProjectPayload = {
      ...form,
      mediaUrl: form.mediaUrl || null,
      liveUrl: form.liveUrl || null,
    };
    try {
      if (editing === "new") {
        await adminCreateProject(payload);
      } else if (editing) {
        await adminUpdateProject(editing.id, payload);
      }
      setEditing(null);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Save failed — check the fields (URLs must be valid).");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(project: Project) {
    if (!window.confirm(`Delete project "${project.title}"?`)) return;
    setError(null);
    try {
      await adminDeleteProject(project.id);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Delete failed.");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">
          Projects <span className="text-sm text-neutral-500">({projects.length})</span>
        </h2>
        <Button onClick={openNew} className="px-5 py-2 text-xs">
          + Add project
        </Button>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-3 text-neutral-200">{project.title}</td>
                  <td className="px-4 py-3 capitalize text-neutral-400">{project.category}</td>
                  <td className="px-4 py-3 text-neutral-400">{project.order}</td>
                  <td className="px-4 py-3">
                    <RowActions onEdit={() => openEdit(project)} onDelete={() => onDelete(project)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        label={editing === "new" ? "Add project" : "Edit project"}
      >
        <form onSubmit={onSubmit} className="space-y-4 p-8">
          <h3 className="font-display text-lg font-semibold text-white">
            {editing === "new" ? "Add project" : "Edit project"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                required
                minLength={2}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={adminInput}
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}
                className={adminInput}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-world">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              required
              minLength={10}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={adminInput}
            />
          </Field>

          <Field label="Thumbnail URL">
            <input
              required
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
              className={adminInput}
              placeholder="https://…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Media URL (optional)">
              <input
                type="url"
                value={form.mediaUrl ?? ""}
                onChange={(e) => setForm({ ...form, mediaUrl: e.target.value || null })}
                className={adminInput}
                placeholder="https://…"
              />
            </Field>
            <Field label="Live URL (optional)">
              <input
                type="url"
                value={form.liveUrl ?? ""}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value || null })}
                className={adminInput}
                placeholder="https://…"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tags (comma-separated)">
              <input
                value={form.tags.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                className={adminInput}
                placeholder="branding, key art"
              />
            </Field>
            <Field label="Order">
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className={adminInput}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
