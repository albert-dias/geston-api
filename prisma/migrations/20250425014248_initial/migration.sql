/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts_payable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts_receivable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appointment_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_flows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cash_registers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses_enterprise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products_sale_enterprise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professional_commissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professional_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professionals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_enterprise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_movements` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'MANAGER';

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "accounts_payable" DROP CONSTRAINT "accounts_payable_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "accounts_receivable" DROP CONSTRAINT "accounts_receivable_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "appointment_payments" DROP CONSTRAINT "appointment_payments_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_service_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_flows" DROP CONSTRAINT "cash_flows_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_movements" DROP CONSTRAINT "cash_movements_cash_register_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_movements" DROP CONSTRAINT "cash_movements_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "cash_registers" DROP CONSTRAINT "cash_registers_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "expenses_enterprise" DROP CONSTRAINT "expenses_enterprise_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_transactions" DROP CONSTRAINT "financial_transactions_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "products_sale_enterprise" DROP CONSTRAINT "products_sale_enterprise_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products_sale_enterprise" DROP CONSTRAINT "products_sale_enterprise_sales_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_commissions" DROP CONSTRAINT "professional_commissions_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_commissions" DROP CONSTRAINT "professional_commissions_service_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_services" DROP CONSTRAINT "professional_services_professional_id_fkey";

-- DropForeignKey
ALTER TABLE "professional_services" DROP CONSTRAINT "professional_services_service_id_fkey";

-- DropForeignKey
ALTER TABLE "professionals" DROP CONSTRAINT "professionals_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "sales_enterprise" DROP CONSTRAINT "sales_enterprise_cash_register_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_enterprise_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_product_id_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "accounts_payable";

-- DropTable
DROP TABLE "accounts_receivable";

-- DropTable
DROP TABLE "appointment_payments";

-- DropTable
DROP TABLE "appointments";

-- DropTable
DROP TABLE "cash_flows";

-- DropTable
DROP TABLE "cash_movements";

-- DropTable
DROP TABLE "cash_registers";

-- DropTable
DROP TABLE "expenses_enterprise";

-- DropTable
DROP TABLE "financial_transactions";

-- DropTable
DROP TABLE "products_sale_enterprise";

-- DropTable
DROP TABLE "professional_commissions";

-- DropTable
DROP TABLE "professional_services";

-- DropTable
DROP TABLE "professionals";

-- DropTable
DROP TABLE "purchase_items";

-- DropTable
DROP TABLE "purchases";

-- DropTable
DROP TABLE "sales_enterprise";

-- DropTable
DROP TABLE "services";

-- DropTable
DROP TABLE "stock_movements";
