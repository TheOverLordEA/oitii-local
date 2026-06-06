-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "fileName" TEXT NOT NULL,
    "localPath" TEXT NOT NULL,
    "parsedText" TEXT,
    "parsedJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "jobUrl" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "targetTitles" TEXT,
    "locations" TEXT,
    "workStyle" TEXT,
    "salaryFloor" INTEGER,
    "basicDetails" TEXT,
    "resumeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Resume_sessionId_idx" ON "Resume"("sessionId");

-- CreateIndex
CREATE INDEX "JobApplication_sessionId_idx" ON "JobApplication"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_sessionId_key" ON "UserProfile"("sessionId");
