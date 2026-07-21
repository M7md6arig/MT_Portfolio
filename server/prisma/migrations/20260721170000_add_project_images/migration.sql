-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_order_idx" ON "ProjectImage"("projectId", "order");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

