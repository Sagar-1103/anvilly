-- CreateEnum
CREATE TYPE "BuildPlatform" AS ENUM ('ANDROID', 'IOS');

-- CreateEnum
CREATE TYPE "BuildType" AS ENUM ('APK', 'AAB');

-- CreateEnum
CREATE TYPE "BuildProfile" AS ENUM ('PREVIEW', 'PRODUCTION', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'FINISHED', 'ERRORED', 'CANCELED');

-- CreateTable
CREATE TABLE "ExpoToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "tokenPreview" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpoToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBuild" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "platform" "BuildPlatform" NOT NULL DEFAULT 'ANDROID',
    "buildType" "BuildType" NOT NULL,
    "profile" "BuildProfile" NOT NULL DEFAULT 'PREVIEW',
    "status" "BuildStatus" NOT NULL DEFAULT 'QUEUED',
    "expoBuildId" TEXT,
    "expoBuildUrl" TEXT,
    "artifactUrl" TEXT,
    "errorDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBuild_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpoToken_userId_key" ON "ExpoToken"("userId");

-- CreateIndex
CREATE INDEX "ExpoToken_userId_idx" ON "ExpoToken"("userId");

-- CreateIndex
CREATE INDEX "ProjectBuild_projectId_idx" ON "ProjectBuild"("projectId");

-- AddForeignKey
ALTER TABLE "ExpoToken" ADD CONSTRAINT "ExpoToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBuild" ADD CONSTRAINT "ProjectBuild_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
