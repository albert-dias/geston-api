/*
  Warnings:

  - Added the required column `region` to the `enterprises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `enterprises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "enterprises" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "zip_code" TEXT NOT NULL;
