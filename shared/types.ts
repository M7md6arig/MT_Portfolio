/**
 * Shared types between client and server.
 * The server maps Prisma models to these shapes; the client consumes them via services/api.ts.
 */

export type ProjectCategory = "poster" | "video" | "motion" | "website" | "branding";

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  order: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  thumbnailUrl: string;
  mediaUrl: string | null;
  liveUrl: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  /** Gallery images; optional so client placeholder data stays valid (phase 2 wires the UI). */
  images?: ProjectImage[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

/** Dashboard-managed content override for a fixed hero floating-card slot. */
export interface HeroCardContent {
  id: string;
  title: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
}

/** A "trusted by" client card managed from the dashboard. */
export interface Client {
  id: string;
  name: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
  order: number;
  createdAt: string;
}

export type ClientPayload = Pick<Client, "name" | "order">;

export interface SiteSettings {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  /** Navbar wordmark image; null falls back to the "MT.studio" text logo. */
  logoUrl: string | null;
}

export type ProjectPayload = Omit<Project, "id" | "createdAt">;
export type ServicePayload = Omit<Service, "id">;
export type SocialLinkPayload = Omit<SocialLink, "id">;
export type SettingsPayload = Partial<Omit<SiteSettings, "id">>;

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Every API endpoint wraps its payload in { data } */
export interface ApiResponse<T> {
  data: T;
}
