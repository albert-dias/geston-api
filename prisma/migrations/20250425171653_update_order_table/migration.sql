/*
  Warnings:

  - Added the required column `order_id` to the `services_order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services_order" ADD COLUMN     "order_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "services_order" ADD CONSTRAINT "services_order_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
