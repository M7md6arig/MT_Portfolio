-- CreateTable
CREATE TABLE "HeroCard" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroCard_pkey" PRIMARY KEY ("id")
);