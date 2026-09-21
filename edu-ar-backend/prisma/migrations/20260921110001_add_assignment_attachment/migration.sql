-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "attachFileName" TEXT,
ADD COLUMN     "attachFileUrl" TEXT,
ADD COLUMN     "attachMimeType" TEXT,
ADD COLUMN     "attachOriginalName" TEXT,
ADD COLUMN     "attachSizeKb" INTEGER;
