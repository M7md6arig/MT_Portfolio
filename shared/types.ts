/**
 * Shared types between client and server.
 * The server maps Prisma models to these shapes; the client consumes them via services/api.ts.
 */

export type ProjectCategory = "poster" | "video" | "motion" | "website";

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
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

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
