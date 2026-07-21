-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "primaryColor" TEXT NOT NULL DEFAULT '#0b0b10',
    "secondaryColor" TEXT NOT NULL DEFAULT '#12141d',
    "accentColor" TEXT NOT NULL DEFAULT '#e0b15c',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

