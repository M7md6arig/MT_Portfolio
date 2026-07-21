import axios from "axios";
import {
  PLACEHOLDER_PROJECTS,
  PLACEHOLDER_SERVICES,
  PLACEHOLDER_SOCIAL_LINKS,
} from "@/data/constants";
import type {
  ApiResponse,
  AuthResponse,
  ContactPayload,
  Project,
  ProjectCategory,
  Service,
  SocialLink,
} from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 8000,
});

/** Read endpoints degrade gracefully: if the API is down, placeholder data keeps the site alive. */
async function withFallback<T>(request: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await request();
  } catch (error) {
    console.warn(`[api] ${label} failed — falling back to placeholder data`, error);
    return fallback;
  }
}

export function fetchProjects(category?: ProjectCategory): Promise<Project[]> {
  return withFallback(
    async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects", {
        params: category ? { category } : undefined,
      });
      return res.data.data;
    },
    category ? PLACEHOLDER_PROJECTS.filter((p) => p.category === category) : PLACEHOLDER_PROJECTS,
    "fetchProjects",
  );
}

export function fetchServices(): Promise<Service[]> {
  return withFallback(
    async () => (await api.get<ApiResponse<Service[]>>("/services")).data.data,
    PLACEHOLDER_SERVICES,
    "fetchServices",
  );
}

export function fetchSocialLinks(): Promise<SocialLink[]> {
  return withFallback(
    async () => (await api.get<ApiResponse<SocialLink[]>>("/social-links")).data.data,
    PLACEHOLDER_SOCIAL_LINKS,
    "fetchSocialLinks",
  );
}

/** No fallback here — the Contact form shows an explicit error state instead. */
export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  await api.post("/contact", payload);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
  return res.data.data;
}
