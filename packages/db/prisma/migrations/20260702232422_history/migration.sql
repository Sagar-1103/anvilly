/*
  Warnings:

  - You are about to drop the column `contents` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `History` table. All the data in the column will be lost.
  - The `toolCall` column on the `History` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `role` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "contents",
DROP COLUMN "from",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "toolCall",
ADD COLUMN     "toolCall" TEXT;

-- DropEnum
DROP TYPE "ToolCall";
