import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import {
  adminCreateService,
  adminCreateSocialLink,
  adminDeleteService,
  adminDeleteSocialLink,
  adminListServices,
  adminListSocialLinks,
  adminUpdateService,
  adminUpdateSocialLink,
} from "@/services/api";
import type { Service, ServicePayload, SocialLink, SocialLinkPayload } from "@/types";
import { adminInput, ErrorBanner, Field, RowActions } from "./adminUi";

const emptyService: ServicePayload = { title: "", description: "", icon: "", order: 0 };
const emptyLink: SocialLinkPayload = { platform: "", url: "", icon: "", order: 0 };

export function ContentTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingService, setEditingService] = useState<Service | "new" | null>(null);
  const [serviceForm, setServiceForm] = useState<ServicePayload>(emptyService);
  const [editingLink, setEditingLink] = useState<SocialLink | "new" | null>(null);
  const [linkForm, setLinkForm] = useState<SocialLinkPayload>(emptyLink);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([adminListServices(), adminListSocialLinks()]);
      setServices(s);
      setLinks(l);
    } catch (err) {
      onAuthError(err);
      setError("Failed to load content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitService(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingService === "new") {
        await adminCreateService(serviceForm);
      } else if (editingService) {
        await adminUpdateService(editingService.id, serviceForm);
      }
      setEditingService(null);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Saving the service failed — description needs at least 10 characters.");
    } finally {
      setSaving(false);
    }
  }

  async function submitLink(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingLink === "new") {
        await adminCreateSocialLink(linkForm);
      } else if (editingLink) {
        await adminUpdateSocialLink(editingLink.id, linkForm);
      }
      setEditingLink(null);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Saving the link failed — the URL must be valid.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete service "${service.title}"?`)) return;
    try {
      await adminDeleteService(service.id);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Delete failed.");
    }
  }

  async function deleteLink(link: SocialLink) {
    if (!window.confirm(`Delete social link "${link.platform}"?`)) return;
    try {
      await adminDeleteSocialLink(link.id);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Delete failed.");
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="space-y-10">
      <ErrorBanner message={error} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Services <span className="text-sm text-neutral-500">({services.length})</span>
          </h2>
          <Button
            onClick={() => {
              setServiceForm(emptyService);
              setEditingService("new");
            }}
            className="px-5 py-2 text-xs"
          >
            + Add service
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-3 text-neutral-200">{service.title}</td>
                  <td className="px-4 py-3 text-neutral-400">{service.icon}</td>
                  <td className="px-4 py-3 text-neutral-400">{service.order}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => {
                        setServiceForm({
                          title: service.title,
                          description: service.description,
                          icon: service.icon,
                          order: service.order,
                        });
                        setEditingService(service);
                      }}
                      onDelete={() => deleteService(service)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Social Links <span className="text-sm text-neutral-500">({links.length})</span>
          </h2>
          <Button
            onClick={() => {
              setLinkForm(emptyLink);
              setEditingLink("new");
            }}
            className="px-5 py-2 text-xs"
          >
            + Add link
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-line/50 last:border-0">
                  <td className="px-4 py-3 text-neutral-200">{link.platform}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-neutral-400">{link.url}</td>
                  <td className="px-4 py-3 text-neutral-400">{link.order}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() => {
                        setLinkForm({
                          platform: link.platform,
                          url: link.url,
                          icon: link.icon,
                          order: link.order,
                        });
                        setEditingLink(link);
                      }}
                      onDelete={() => deleteLink(link)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={editingService !== null}
        onClose={() => setEditingService(null)}
        label={editingService === "new" ? "Add service" : "Edit service"}
      >
        <form onSubmit={submitService} className="space-y-4 p-8">
          <h3 className="font-display text-lg font-semibold text-white">
            {editingService === "new" ? "Add service" : "Edit service"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                required
                minLength={2}
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                className={adminInput}
              />
            </Field>
            <Field label="Icon">
              <input
                required
                value={serviceForm.icon}
                onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                className={adminInput}
                placeholder="poster / motion / star…"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              required
              minLength={10}
              rows={3}
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              className={adminInput}
            />
          </Field>
          <Field label="Order">
            <input
              type="number"
              min={0}
              value={serviceForm.order}
              onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value) })}
              className={adminInput}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingService(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editingLink !== null}
        onClose={() => setEditingLink(null)}
        label={editingLink === "new" ? "Add social link" : "Edit social link"}
      >
        <form onSubmit={submitLink} className="space-y-4 p-8">
          <h3 className="font-display text-lg font-semibold text-white">
            {editingLink === "new" ? "Add social link" : "Edit social link"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform">
              <input
                required
                minLength={2}
                value={linkForm.platform}
                onChange={(e) => setLinkForm({ ...linkForm, platform: e.target.value })}
                className={adminInput}
                placeholder="Instagram"
              />
            </Field>
            <Field label="Icon">
              <input
                required
                value={linkForm.icon}
                onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })}
                className={adminInput}
                placeholder="instagram"
              />
            </Field>
          </div>
          <Field label="URL">
            <input
              required
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              className={adminInput}
              placeholder="https://…"
            />
          </Field>
          <Field label="Order">
            <input
              type="number"
              min={0}
              value={linkForm.order}
              onChange={(e) => setLinkForm({ ...linkForm, order: Number(e.target.value) })}
              className={adminInput}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingLink(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
