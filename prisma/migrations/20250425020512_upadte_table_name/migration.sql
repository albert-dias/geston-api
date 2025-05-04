/*
  Warnings:

  - You are about to drop the `products_enterprise` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products_enterprise" DROP CONSTRAINT "products_enterprise_enterprise_id_fkey";

-- DropTable
DROP TABLE "products_enterprise";

-- CreateTable
CREATE TABLE "services_enterprise" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_enterprise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "services_enterprise" ADD CONSTRAINT "services_enterprise_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
