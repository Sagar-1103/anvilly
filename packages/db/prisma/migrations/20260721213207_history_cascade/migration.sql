-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_projectId_fkey";

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
