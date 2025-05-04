-- DropIndex
DROP INDEX "enterprises_document_key";

-- AlterTable
ALTER TABLE "enterprises" ALTER COLUMN "document" DROP NOT NULL;
