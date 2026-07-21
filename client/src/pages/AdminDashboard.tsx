import { isAxiosError } from "axios";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppearanceTab } from "@/components/admin/AppearanceTab";
import { ContentTab } from "@/components/admin/ContentTab";
import { ProjectsTab } from "@/components/admin/ProjectsTab";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

type TabId = "projects" | "content" | "appearance";

const TABS: { id: TabId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "content", label: "Services & Links" },
  { id: "appearance", label: "Appearance" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("projects");
  const { logout } = useAuth();
  const navigate = useNavigate();

  /** Expired/invalid token → drop the session and return to the login page. */
  const onAuthError = useCallback(
    (err: unknown) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        logout();
        navigate("/admin/login", { replace: true });
      }
    },
    [logout, navigate],
  );

  return (
    <main className="min-h-screen bg-night px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">MT Portfolio admin</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-4 py-2 text-xs text-neutral-300 transition-colors hover:border-accent/60 hover:text-accent"
            >
              View site ↗
            </a>
            <button
              onClick={() => {
                logout();
                navigate("/admin/login", { replace: true });
              }}
              className="rounded-lg border border-line px-4 py-2 text-xs text-neutral-300 transition-colors hover:border-red-500/60 hover:text-red-400"
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="flex gap-2 border-b border-line" role="tablist" aria-label="Dashboard sections">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors",
                tab === id
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-neutral-400 hover:text-neutral-200",
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "projects" && <ProjectsTab onAuthError={onAuthError} />}
        {tab === "content" && <ContentTab onAuthError={onAuthError} />}
        {tab === "appearance" && <AppearanceTab onAuthError={onAuthError} />}
      </div>
    </main>
  );
}
