-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "appointment_id" TEXT,
ADD COLUMN     "employee_id" TEXT;

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "client_id" TEXT,
    "car_license_plate" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "service_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "commission_rate" DOUBLE PRECISION,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_movements" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "order_id" TEXT,
    "employee_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_history" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "car_license_plate" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "services" TEXT[],
    "total_value" INTEGER NOT NULL,
    "client_id" TEXT,
    "employee_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_programs" (
    "id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "points_per_order" INTEGER NOT NULL DEFAULT 1,
    "discount_per_point" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_loyalty_points" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_loyalty_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_enterprise_id_scheduled_date_idx" ON "appointments"("enterprise_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "appointments_car_license_plate_enterprise_id_idx" ON "appointments"("car_license_plate", "enterprise_id");

-- CreateIndex
CREATE INDEX "employees_enterprise_id_status_idx" ON "employees"("enterprise_id", "status");

-- CreateIndex
CREATE INDEX "cash_movements_enterprise_id_created_at_idx" ON "cash_movements"("enterprise_id", "created_at");

-- CreateIndex
CREATE INDEX "cash_movements_type_enterprise_id_idx" ON "cash_movements"("type", "enterprise_id");

-- CreateIndex
CREATE INDEX "vehicle_history_car_license_plate_enterprise_id_created_at_idx" ON "vehicle_history"("car_license_plate", "enterprise_id", "created_at");

-- CreateIndex
CREATE INDEX "vehicle_history_client_id_idx" ON "vehicle_history"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_programs_enterprise_id_key" ON "loyalty_programs"("enterprise_id");

-- CreateIndex
CREATE INDEX "client_loyalty_points_client_id_idx" ON "client_loyalty_points"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_loyalty_points_client_id_program_id_key" ON "client_loyalty_points"("client_id", "program_id");

-- CreateIndex
CREATE INDEX "orders_car_license_plate_enterprise_id_idx" ON "orders"("car_license_plate", "enterprise_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_movements" ADD CONSTRAINT "cash_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_history" ADD CONSTRAINT "vehicle_history_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_history" ADD CONSTRAINT "vehicle_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_history" ADD CONSTRAINT "vehicle_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_loyalty_points" ADD CONSTRAINT "client_loyalty_points_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_loyalty_points" ADD CONSTRAINT "client_loyalty_points_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "loyalty_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
