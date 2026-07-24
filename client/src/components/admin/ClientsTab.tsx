import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import {
  adminCreateClient,
  adminDeleteClient,
  adminListClients,
  adminUpdateClient,
  adminUploadClientBackground,
  adminUploadClientLogo,
} from "@/services/api";
import type { Client } from "@/types";
import { adminInput, ErrorBanner, Field, FlashNote, useFlash } from "./adminUi";
import { SingleImageUpload } from "./SingleImageUpload";

export function ClientsTab({ onAuthError }: { onAuthError: (err: unknown) => void }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [flashMessage, flash] = useFlash();

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      setClients((await adminListClients()).sort((a, b) => a.order - b.order));
    } catch (err) {
      onAuthError(err);
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setName("");
    setEditing("new");
  }

  function openEdit(client: Client) {
    setName(client.name);
    setEditing(client);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        const order = clients.length > 0 ? Math.max(...clients.map((c) => c.order)) + 1 : 0;
        const created = await adminCreateClient({ name: name.trim(), order });
        // Keep the modal open, now in edit mode, so logo/background can be uploaded right away.
        setEditing(created);
        flash("Client created ✓ — add a logo below");
        await reload();
      } else if (editing) {
        await adminUpdateClient(editing.id, { name: name.trim() });
        flash("Saved ✓");
        setEditing(null);
        await reload();
      }
    } catch (err) {
      onAuthError(err);
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(client: Client) {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;
    setError(null);
    try {
      await adminDeleteClient(client.id);
      flash("Deleted ✓");
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Delete failed.");
    }
  }

  async function move(client: Client, direction: -1 | 1) {
    const sorted = [...clients].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((c) => c.id === client.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    setError(null);
    try {
      await Promise.all([
        adminUpdateClient(client.id, { order: swapWith.order }),
        adminUpdateClient(swapWith.id, { order: client.order }),
      ]);
      await reload();
    } catch (err) {
      onAuthError(err);
      setError("Reordering failed.");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">
          Clients <span className="text-sm text-neutral-500">({clients.length})</span>
        </h2>
        <div className="flex items-center gap-4">
          <FlashNote message={flashMessage} />
          <Button onClick={openNew} className="px-5 py-2 text-xs">
            + Add client
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client, index) => (
            <div key={client.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt=""
                    className="h-full w-full object-contain p-1.5"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                ) : (
                  <span className="text-[10px] text-neutral-600">No logo</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-neutral-200">{client.name}</p>
                <p className="text-xs text-neutral-500">order {client.order}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => move(client, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="rounded border border-line px-1.5 text-xs text-neutral-400 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(client, 1)}
                  disabled={index === clients.length - 1}
                  aria-label="Move down"
                  className="rounded border border-line px-1.5 text-xs text-neutral-400 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => openEdit(client)}
                  className="rounded-lg border border-line px-3 py-1 text-xs text-neutral-300 transition-colors hover:border-accent/60 hover:text-accent"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(client)}
                  className="rounded-lg border border-line px-3 py-1 text-xs text-neutral-300 transition-colors hover:border-red-500/60 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {clients.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-neutral-500">No clients yet.</p>
          )}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        label={editing === "new" ? "Add client" : "Edit client"}
      >
        <div className="space-y-5 p-8">
          <h3 className="font-display text-lg font-semibold text-white">
            {editing === "new" ? "Add client" : "Edit client"}
          </h3>

          <form onSubmit={onSubmit} className="flex gap-2">
            <div className="flex-1">
              <Field label="Name">
                <input
                  required
                  minLength={1}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={adminInput}
                />
              </Field>
            </div>
            <Button type="submit" disabled={saving} className="mt-6 px-5 py-2 text-xs disabled:opacity-60">
              {saving ? "Saving…" : "Save name"}
            </Button>
          </form>

          {editing !== "new" && editing !== null ? (
            <div className="space-y-4">
              <SingleImageUpload
                label="Logo"
                required
                imageUrl={editing.logoUrl}
                onError={setError}
                onUpload={async (file) => {
                  const updated = await adminUploadClientLogo(editing.id, file);
                  setEditing(updated);
                  flash("Logo uploaded ✓");
                  await reload();
                }}
              />
              <SingleImageUpload
                label="Background pattern (optional)"
                imageUrl={editing.backgroundUrl}
                onError={setError}
                onUpload={async (file) => {
                  const updated = await adminUploadClientBackground(editing.id, file);
                  setEditing(updated);
                  flash("Background uploaded ✓");
                  await reload();
                }}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-4 text-xs text-neutral-500">
              Save the name first — logo and background uploads open right here afterwards.
            </p>
          )}
        </div>
      </Modal>
    </section>
  );
}
