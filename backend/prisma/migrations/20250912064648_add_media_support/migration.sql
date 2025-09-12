-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'media';

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "mediaUrl" TEXT,
ADD COLUMN "mediaType" TEXT,
ADD COLUMN "fileName" TEXT;