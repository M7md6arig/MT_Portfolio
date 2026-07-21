import type {
  HeroCardData,
  ProcessStep,
  Project,
  ProjectCategory,
  Service,
  SocialLink,
  Stat,
  TabDef,
  TrustedClient,
} from "@/types";

/* ------------------------------------------------------------------ */
/* All site copy below is PLACEHOLDER — edit freely in this one file.  */
/* ------------------------------------------------------------------ */

export const SITE = {
  name: "MT",
  fullName: "Mohamed Tarig",
  role: "Art Director & Designer",
};

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export const HERO_COPY = {
  title: "Mohamed Tarig",
  subtitle: "Art direction, posters, motion and web — stories told frame by frame.",
  scrollHint: "Scroll to enter",
};

export const TRANSITION_COPY = "Every frame tells a story. Step inside the studio.";

export const ABOUT = {
  title: "Design with a director's eye",
  bio: "I'm an art director who thinks in scenes: every poster, motion piece and interface starts with a mood, a light source and a reason to look. For the past years I've helped brands and filmmakers find the single frame that says everything.",
  stats: [
    { value: "6+", label: "Years of experience" },
    { value: "120+", label: "Projects delivered" },
    { value: "40+", label: "Happy clients" },
  ] satisfies Stat[],
};

export const WORK_TABS: TabDef[] = [
  { id: "poster", label: "Posters" },
  { id: "video", label: "Videos" },
  { id: "motion", label: "Motion Graphics" },
  { id: "website", label: "Websites & UI" },
];

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  poster: "Poster",
  video: "Video",
  motion: "Motion",
  website: "Web & UI",
};

/** Gradient fallbacks used when a project has no thumbnail yet */
export const CATEGORY_GRADIENTS: Record<ProjectCategory, string> = {
  poster: "from-rose-500/50 via-rose-900/40 to-night",
  video: "from-sky-500/50 via-indigo-900/40 to-night",
  motion: "from-violet-500/50 via-purple-900/40 to-night",
  website: "from-emerald-500/50 via-teal-900/40 to-night",
};

export const SERVICES_COPY = {
  title: "What I can do for you",
  subtitle: "Four crafts, one direction.",
  cta: "Start Your Project",
};

export const CONTACT_COPY = {
  title: "Let's make something worth staring at",
  subtitle: "Tell me about your project — I usually reply within a day.",
};

export const CLOSING_COPY = {
  eyebrow: "Same scene, new perspective",
  title: "The story loops back to you",
  text: "You've seen the work. Now let's talk about yours.",
  cta: "Get in touch",
};

/* ------------------------------------------------------------------ */
/* Hero / Closing floating cards                                       */
/* ------------------------------------------------------------------ */

/**
 * The arc ellipse the cards rest on AND orbit around (viewport %): center sits
 * between the portrait's shoulders; 0° = right of the portrait, 90° = above the head.
 * FloatingCard turns each card's (angle, radiusScale) into coordinates with
 * Math.cos/Math.sin — and drives BOTH from scrollYProgress, so cards revolve
 * around the person (growing radius) instead of sliding out in a straight line.
 */
export const ARC = { cx: 50, cy: 44, rx: 40, ry: 36 };

/**
 * Depth also decides layering: depth ≥ 0.6 renders IN FRONT of the portrait,
 * lower depths tuck BEHIND the body (see FloatingCard's zIndex).
 */
export const HERO_CARDS: HeroCardData[] = [
  // front layer — lower arc, floats over the portrait's body
  { id: "hc-1", title: "Neon Nights — Poster", category: "poster", depth: 0.85, angle: 245, radiusScale: 0.85, rotate: -5, aspect: "portrait" },
  { id: "hc-5", title: "SaaS Landing UI", category: "website", depth: 0.8, angle: 295, radiusScale: 0.85, rotate: 5, aspect: "video" },
  { id: "hc-2", title: "Brand Reel 2025", category: "video", depth: 0.65, angle: 200, radiusScale: 0.9, rotate: 3, aspect: "video" },
  // back layer — sides and crown, partially hidden behind the person
  { id: "hc-6", title: "Kinetic Type Promo", category: "motion", depth: 0.55, angle: 340, radiusScale: 1, rotate: -4, aspect: "portrait" },
  { id: "hc-3", title: "Logo Ident", category: "motion", depth: 0.4, angle: 160, radiusScale: 1, rotate: -3, aspect: "square" },
  { id: "hc-7", title: "Event Teaser", category: "video", depth: 0.35, angle: 20, radiusScale: 1, rotate: 3, aspect: "square" },
  { id: "hc-4", title: "Culture Fest Series", category: "poster", depth: 0.25, angle: 115, radiusScale: 0.9, rotate: 4, aspect: "portrait" },
  { id: "hc-8", title: "Portfolio UI Kit", category: "website", depth: 0.2, angle: 65, radiusScale: 0.9, rotate: -3, aspect: "video" },
];

/* ------------------------------------------------------------------ */
/* TrustedBy — placeholder client wordmarks + per-client ambient glow  */
/* ------------------------------------------------------------------ */

export const TRUSTED_COPY = {
  title: "Trusted by teams & brands",
};

export const TRUSTED_CLIENTS: TrustedClient[] = [
  {
    id: "cl-1",
    name: "NOVA FILMS",
    rotate: -6,
    glow: "radial-gradient(600px circle at 25% 35%, rgba(224,177,92,0.14), transparent 70%)",
  },
  {
    id: "cl-2",
    name: "ATLAS STUDIO",
    rotate: 4,
    glow: "radial-gradient(600px circle at 40% 60%, rgba(96,165,250,0.12), transparent 70%)",
  },
  {
    id: "cl-3",
    name: "PULSE MEDIA",
    rotate: -3,
    glow: "radial-gradient(600px circle at 52% 35%, rgba(244,114,182,0.10), transparent 70%)",
  },
  {
    id: "cl-4",
    name: "ORBIT AGENCY",
    rotate: 7,
    glow: "radial-gradient(600px circle at 64% 60%, rgba(52,211,153,0.10), transparent 70%)",
  },
  {
    id: "cl-5",
    name: "MONO RECORDS",
    rotate: -8,
    glow: "radial-gradient(600px circle at 75% 35%, rgba(167,139,250,0.12), transparent 70%)",
  },
  {
    id: "cl-6",
    name: "VEGA EVENTS",
    rotate: 5,
    glow: "radial-gradient(600px circle at 85% 60%, rgba(251,191,36,0.10), transparent 70%)",
  },
];

/* ------------------------------------------------------------------ */
/* Process — milestones on the scroll-drawn SVG path                   */
/* ------------------------------------------------------------------ */

export const PROCESS_COPY = {
  title: "From brief to final frame",
  subtitle: "Every project walks the same path — the story never gets lost along the way.",
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "st-1",
    title: "Brief & Discovery",
    description: "We dig into the goal, the audience and the feeling the work has to leave behind.",
    at: 0.22,
  },
  {
    id: "st-2",
    title: "Concept & Direction",
    description: "Moodboards, references and one strong visual idea that everything else obeys.",
    at: 0.35,
  },
  {
    id: "st-3",
    title: "Production",
    description: "Design, motion and build — iterated in tight loops with your feedback on every pass.",
    at: 0.68,
  },
  {
    id: "st-4",
    title: "Delivery & Launch",
    description: "Final files in every format you need, plus support through the first release.",
    at: 0.82,
  },
];

/* ------------------------------------------------------------------ */
/* Placeholder data — used automatically when the API is unreachable   */
/* ------------------------------------------------------------------ */

const now = new Date().toISOString();

export const PLACEHOLDER_PROJECTS: Project[] = [
  {
    id: "ph-poster-1",
    title: "Neon Nights — Film Poster",
    description:
      "Key art and typography for an indie neo-noir feature. Built around a single practical light source and heavy grain to sell the mood before the first frame plays.",
    category: "poster",
    thumbnailUrl: "",
    mediaUrl: null,
    liveUrl: null,
    tags: ["Key Art", "Typography", "Print"],
    order: 0,
    createdAt: now,
  },
  {
    id: "ph-poster-2",
    title: "Culture Fest — Event Series",
    description:
      "A modular poster system for a month-long culture festival: one grid, twelve events, each with its own color voice while staying unmistakably one family.",
    category: "poster",
    thumbnailUrl: "",
    mediaUrl: null,
    liveUrl: null,
    tags: ["Poster System", "Branding"],
    order: 1,
    createdAt: now,
  },
  {
    id: "ph-video-1",
    title: "Brand Reel 2025",
    description:
      "A 60-second brand film cut to an original score. Shot-listed, directed and edited end-to-end, with color grading tuned for both cinema and social crops.",
    category: "video",
    thumbnailUrl: "",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveUrl: null,
    tags: ["Direction", "Editing", "Color"],
    order: 0,
    createdAt: now,
  },
  {
    id: "ph-video-2",
    title: "Event Teaser — 15s",
    description:
      "Vertical-first teaser for a product launch event. Three beats, one reveal, designed to survive muted autoplay feeds.",
    category: "video",
    thumbnailUrl: "",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveUrl: null,
    tags: ["Teaser", "Social"],
    order: 1,
    createdAt: now,
  },
  {
    id: "ph-motion-1",
    title: "Logo Ident — Studio Sting",
    description:
      "A 4-second animated ident: the mark assembles from light streaks and settles with a tactile bounce. Delivered as alpha-channel ProRes for broadcast.",
    category: "motion",
    thumbnailUrl: "",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveUrl: null,
    tags: ["Ident", "After Effects"],
    order: 0,
    createdAt: now,
  },
  {
    id: "ph-motion-2",
    title: "Kinetic Type — Album Promo",
    description:
      "Lyric-driven kinetic typography synced to the drop. Every cut lands on the beat; every word earns its frame.",
    category: "motion",
    thumbnailUrl: "",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    liveUrl: null,
    tags: ["Kinetic Type", "Music"],
    order: 1,
    createdAt: now,
  },
  {
    id: "ph-web-1",
    title: "Product Landing — SaaS",
    description:
      "Design and front-end for a conversion-focused SaaS landing page: scroll-triggered feature reveals, sub-second LCP, and a 12% lift in sign-ups after launch.",
    category: "website",
    thumbnailUrl: "",
    mediaUrl: null,
    liveUrl: "https://example.com",
    tags: ["UI/UX", "React", "Landing"],
    order: 0,
    createdAt: now,
  },
  {
    id: "ph-web-2",
    title: "Portfolio UI Kit",
    description:
      "A reusable dark-mode UI kit for creative portfolios: 40+ components, motion presets, and a token system that themes in minutes.",
    category: "website",
    thumbnailUrl: "",
    mediaUrl: null,
    liveUrl: "https://example.com",
    tags: ["Design System", "Figma"],
    order: 1,
    createdAt: now,
  },
];

export const PLACEHOLDER_SERVICES: Service[] = [
  {
    id: "ph-svc-1",
    title: "Poster & Key Art Design",
    description: "Cinematic posters and campaign key art that set the tone in a single frame.",
    icon: "poster",
    order: 0,
  },
  {
    id: "ph-svc-2",
    title: "Motion Graphics",
    description: "Idents, kinetic type and animated stories that move with purpose.",
    icon: "motion",
    order: 1,
  },
  {
    id: "ph-svc-3",
    title: "UI/UX Design",
    description: "Interfaces designed like scenes: clear focus, deliberate rhythm, zero noise.",
    icon: "uiux",
    order: 2,
  },
  {
    id: "ph-svc-4",
    title: "Websites & Landing Pages",
    description: "Fast, expressive websites built with React — from concept to deployment.",
    icon: "web",
    order: 3,
  },
];

export const PLACEHOLDER_SOCIAL_LINKS: SocialLink[] = [
  { id: "ph-soc-1", platform: "Behance", url: "https://behance.net/your-handle", icon: "behance", order: 0 },
  { id: "ph-soc-2", platform: "Instagram", url: "https://instagram.com/your-handle", icon: "instagram", order: 1 },
  { id: "ph-soc-3", platform: "LinkedIn", url: "https://linkedin.com/in/your-handle", icon: "linkedin", order: 2 },
  { id: "ph-soc-4", platform: "YouTube", url: "https://youtube.com/@your-handle", icon: "youtube", order: 3 },
];
