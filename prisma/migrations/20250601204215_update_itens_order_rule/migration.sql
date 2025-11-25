/*
  Warnings:

  - You are about to drop the `services_order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "services_order" DROP CONSTRAINT "services_order_order_id_fkey";

-- DropForeignKey
ALTER TABLE "services_order" DROP CONSTRAINT "services_order_service_id_fkey";

-- DropTable
DROP TABLE "services_order";

-- CreateTable
CREATE TABLE "items_order" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items_order" ADD CONSTRAINT "items_order_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services_enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_order" ADD CONSTRAINT "items_order_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
