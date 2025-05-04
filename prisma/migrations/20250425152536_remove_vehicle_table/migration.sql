/*
  Warnings:

  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_client_id_fkey";

-- DropTable
DROP TABLE "vehicles";
