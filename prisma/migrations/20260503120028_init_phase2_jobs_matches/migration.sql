-- CreateTable
CREATE TABLE "DiscoveredJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CuratedMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "aiReasoning" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending_Approval',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuratedMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "DiscoveredJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CuratedMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CuratedMatch_jobId_idx" ON "CuratedMatch"("jobId");

-- CreateIndex
CREATE INDEX "CuratedMatch_userId_idx" ON "CuratedMatch"("userId");
