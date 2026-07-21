import { Category, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const projects = [
  {
    title: "Neon Nights — Film Poster",
    description:
      "Key art and typography for an indie neo-noir feature. Built around a single practical light source and heavy grain to sell the mood before the first frame plays.",
    category: Category.poster,
    thumbnailUrl: "https://picsum.photos/seed/poster-1/800/1000",
    tags: ["Key Art", "Typography", "Print"],
    order: 0,
  },
  {
    title: "Culture Fest — Event Series",
    description:
      "A modular poster system for a month-long culture festival: one grid, twelve events, each with its own color voice while staying unmistakably one family.",
    category: Category.poster,
    thumbnailUrl: "https://picsum.photos/seed/poster-2/800/1000",
    tags: ["Poster System", "Branding"],
    order: 1,
  },
  {
    title: "Brand Reel 2025",
    description:
      "A 60-second brand film cut to an original score. Shot-listed, directed and edited end-to-end, with color grading tuned for both cinema and social crops.",
    category: Category.video,
    thumbnailUrl: "https://picsum.photos/seed/video-1/1200/675",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["Direction", "Editing", "Color"],
    order: 0,
  },
  {
    title: "Event Teaser — 15s",
    description:
      "Vertical-first teaser for a product launch event. Three beats, one reveal, designed to survive muted autoplay feeds.",
    category: Category.video,
    thumbnailUrl: "https://picsum.photos/seed/video-2/1200/675",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["Teaser", "Social"],
    order: 1,
  },
  {
    title: "Logo Ident — Studio Sting",
    description:
      "A 4-second animated ident: the mark assembles from light streaks and settles with a tactile bounce. Delivered as alpha-channel ProRes for broadcast.",
    category: Category.motion,
    thumbnailUrl: "https://picsum.photos/seed/motion-1/1200/675",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["Ident", "After Effects"],
    order: 0,
  },
  {
    title: "Kinetic Type — Album Promo",
    description:
      "Lyric-driven kinetic typography synced to the drop. Every cut lands on the beat; every word earns its frame.",
    category: Category.motion,
    thumbnailUrl: "https://picsum.photos/seed/motion-2/1200/675",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["Kinetic Type", "Music"],
    order: 1,
  },
  {
    title: "Product Landing — SaaS",
    description:
      "Design and front-end for a conversion-focused SaaS landing page: scroll-triggered feature reveals, sub-second LCP, and a 12% lift in sign-ups after launch.",
    category: Category.website,
    thumbnailUrl: "https://picsum.photos/seed/web-1/1200/750",
    liveUrl: "https://example.com",
    tags: ["UI/UX", "React", "Landing"],
    order: 0,
  },
  {
    title: "Portfolio UI Kit",
    description:
      "A reusable dark-mode UI kit for creative portfolios: 40+ components, motion presets, and a token system that themes in minutes.",
    category: Category.website,
    thumbnailUrl: "https://picsum.photos/seed/web-2/1200/750",
    liveUrl: "https://example.com",
    tags: ["Design System", "Figma"],
    order: 1,
  },
];

const services = [
  {
    title: "Poster & Key Art Design",
    description: "Cinematic posters and campaign key art that set the tone in a single frame.",
    icon: "poster",
    order: 0,
  },
  {
    title: "Motion Graphics",
    description: "Idents, kinetic type and animated stories that move with purpose.",
    icon: "motion",
    order: 1,
  },
  {
    title: "UI/UX Design",
    description: "Interfaces designed like scenes: clear focus, deliberate rhythm, zero noise.",
    icon: "uiux",
    order: 2,
  },
  {
    title: "Websites & Landing Pages",
    description: "Fast, expressive websites built with React — from concept to deployment.",
    icon: "web",
    order: 3,
  },
];

const socialLinks = [
  { platform: "Behance", url: "https://behance.net/your-handle", icon: "behance", order: 0 },
  { platform: "Instagram", url: "https://instagram.com/your-handle", icon: "instagram", order: 1 },
  { platform: "LinkedIn", url: "https://linkedin.com/in/your-handle", icon: "linkedin", order: 2 },
  { platform: "YouTube", url: "https://youtube.com/@your-handle", icon: "youtube", order: 3 },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    },
  });

  // Idempotent re-seed for content tables
  await prisma.project.deleteMany();
  await prisma.service.deleteMany();
  await prisma.socialLink.deleteMany();

  await prisma.project.createMany({ data: projects });
  await prisma.service.createMany({ data: services });
  await prisma.socialLink.createMany({ data: socialLinks });

  console.log(`Seed complete — admin: ${adminEmail}, projects: ${projects.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
