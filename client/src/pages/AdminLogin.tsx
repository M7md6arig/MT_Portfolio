import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";

const inputClasses =
  "w-full rounded-xl border border-line bg-night/60 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 transition-colors duration-300 focus:border-accent/60 focus:outline-none";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("Login failed — check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm space-y-5 rounded-2xl p-8">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-neutral-400">MT Portfolio dashboard</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
            placeholder="admin@example.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder="••••••••"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full disabled:opacity-60">
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
