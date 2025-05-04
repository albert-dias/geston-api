/*
  Warnings:

  - Added the required column `value` to the `services_order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusOrder" AS ENUM ('INLINE', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "StatusOrder" NOT NULL DEFAULT 'INLINE';

-- AlterTable
ALTER TABLE "services_order" ADD COLUMN     "value" INTEGER NOT NULL;
