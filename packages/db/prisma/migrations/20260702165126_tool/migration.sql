/*
  Warnings:

  - The values [TEXT_MESSAGE] on the enum `HistoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HistoryType_new" AS ENUM ('TOOL_CALL', 'TEXT');
ALTER TABLE "History" ALTER COLUMN "type" TYPE "HistoryType_new" USING ("type"::text::"HistoryType_new");
ALTER TYPE "HistoryType" RENAME TO "HistoryType_old";
ALTER TYPE "HistoryType_new" RENAME TO "HistoryType";
DROP TYPE "public"."HistoryType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ToolCall" ADD VALUE 'BUILD_PROJECT_TOOL';
ALTER TYPE "ToolCall" ADD VALUE 'CREATE_FILE_TOOL';
ALTER TYPE "ToolCall" ADD VALUE 'DELETE_FILE_TOOL';
ALTER TYPE "ToolCall" ADD VALUE 'READ_FILE_TOOL';
ALTER TYPE "ToolCall" ADD VALUE 'RUN_PROJECT_TOOL';
ALTER TYPE "ToolCall" ADD VALUE 'UPDATE_FILE_TOOL';
