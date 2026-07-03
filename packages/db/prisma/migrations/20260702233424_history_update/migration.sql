/*
  Warnings:

  - Made the column `content` on table `History` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "History" ALTER COLUMN "content" SET NOT NULL;
