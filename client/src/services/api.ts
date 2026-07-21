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
  ProjectImage,
  ProjectPayload,
  Service,
  ServicePayload,
  SettingsPayload,
  SiteSettings,
  SocialLink,
  SocialLinkPayload,
} from "@/types";

export const TOKEN_STORAGE_KEY = "mt_admin_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export function fetchSettings(): Promise<SiteSettings> {
  return withFallback(
    async () => (await api.get<ApiResponse<SiteSettings>>("/settings")).data.data,
    { id: "main", primaryColor: "#0b0b10", secondaryColor: "#12141d", accentColor: "#e0b15c" },
    "fetchSettings",
  );
}

/*
 * Admin API — no placeholder fallback: the dashboard must surface real errors,
 * not silently show fake data.
 */

export async function adminListProjects(): Promise<Project[]> {
  return (await api.get<ApiResponse<Project[]>>("/projects")).data.data;
}

export async function adminCreateProject(payload: ProjectPayload): Promise<Project> {
  return (await api.post<ApiResponse<Project>>("/projects", payload)).data.data;
}

export async function adminUpdateProject(
  id: string,
  payload: Partial<ProjectPayload>,
): Promise<Project> {
  return (await api.put<ApiResponse<Project>>(`/projects/${id}`, payload)).data.data;
}

export async function adminDeleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function adminUploadProjectImage(
  projectId: string,
  file: File,
): Promise<ProjectImage> {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post<ApiResponse<ProjectImage>>(`/projects/${projectId}/images`, form, {
    timeout: 30000, // uploads need more headroom than the default 8s
  });
  return res.data.data;
}

export async function adminDeleteProjectImage(projectId: string, imageId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/images/${imageId}`);
}

export async function adminListServices(): Promise<Service[]> {
  return (await api.get<ApiResponse<Service[]>>("/services")).data.data;
}

export async function adminCreateService(payload: ServicePayload): Promise<Service> {
  return (await api.post<ApiResponse<Service>>("/services", payload)).data.data;
}

export async function adminUpdateService(
  id: string,
  payload: Partial<ServicePayload>,
): Promise<Service> {
  return (await api.patch<ApiResponse<Service>>(`/services/${id}`, payload)).data.data;
}

export async function adminDeleteService(id: string): Promise<void> {
  await api.delete(`/services/${id}`);
}

export async function adminListSocialLinks(): Promise<SocialLink[]> {
  return (await api.get<ApiResponse<SocialLink[]>>("/social-links")).data.data;
}

export async function adminCreateSocialLink(payload: SocialLinkPayload): Promise<SocialLink> {
  return (await api.post<ApiResponse<SocialLink>>("/social-links", payload)).data.data;
}

export async function adminUpdateSocialLink(
  id: string,
  payload: Partial<SocialLinkPayload>,
): Promise<SocialLink> {
  return (await api.patch<ApiResponse<SocialLink>>(`/social-links/${id}`, payload)).data.data;
}

export async function adminDeleteSocialLink(id: string): Promise<void> {
  await api.delete(`/social-links/${id}`);
}

export async function adminUpdateSettings(payload: SettingsPayload): Promise<SiteSettings> {
  return (await api.patch<ApiResponse<SiteSettings>>("/settings", payload)).data.data;
}
