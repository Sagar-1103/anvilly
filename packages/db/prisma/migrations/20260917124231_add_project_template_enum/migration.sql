-- CreateEnum
CREATE TYPE "Template" AS ENUM ('bun-react-shadcn', 'node-react-native-expo');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "previewImage" TEXT,
ADD COLUMN     "template" "Template" NOT NULL DEFAULT 'bun-react-shadcn',
ADD COLUMN     "tunnelUrl" TEXT;
