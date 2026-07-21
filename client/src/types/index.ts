import type { ProjectCategory } from "@shared/types";

export type {
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
} from "@shared/types";

/** A floating work card in the Hero / Closing scenes */
export interface HeroCardData {
  id: string;
  title: string;
  category: ProjectCategory;
  /** 0 (far away) → 1 (close to camera): drives size, opacity and orbital speed */
  depth: number;
  /** resting angle (deg) on the ARC ellipse: 0 = right of the portrait, 90 = above the head */
  angle: number;
  /** resting radius as a multiple of ARC's rx/ry — < 1 pulls the card inward */
  radiusScale: number;
  rotate: number;
  aspect: "portrait" | "video" | "square";
}

/** A client wordmark card in the TrustedBy strip */
export interface TrustedClient {
  id: string;
  name: string;
  /** small natural tilt, deg (-8 … 8) */
  rotate: number;
  /** CSS background for the ambient glow shown behind the strip on hover */
  glow: string;
}

/** A milestone on the Process section's scroll-drawn path */
export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  /** scrollYProgress anchor (0 → 1) at which this step lights up */
  at: number;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TabDef {
  id: ProjectCategory;
  label: string;
}
