import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // Wait for the GET /auth/me check before deciding — otherwise a hard
  // refresh always bounces to /login for a frame, even with a valid cookie.
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-night text-sm text-neutral-500">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
