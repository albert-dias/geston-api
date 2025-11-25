import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { VehicleHistory } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  order_id: string;
  car_license_plate: string;
  services: string[]; // Array de nomes de serviços
  total_value: number;
  client_id?: string;
  employee_id?: string;
}

export async function CreateVehicleHistoryService({
  enterprise_id,
  order_id,
  car_license_plate,
  services,
  total_value,
  client_id,
  employee_id,
}: IRequest): Promise<VehicleHistory> {
  if (!enterprise_id || !order_id || !car_license_plate || !services || services.length === 0) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se o pedido existe e pertence à empresa
  const order = await prisma.order.findFirst({
    where: {
      id: order_id,
      enterprise_id,
    },
    include: {
      items_order: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!order) {
    throw AppError.notFound('Pedido não encontrado');
  }

  // Criar histórico
  const result = await prisma.vehicleHistory.create({
    data: {
      enterprise_id,
      order_id,
      car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ''),
      services,
      total_value,
      client_id: client_id || null,
      employee_id: employee_id || null,
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar histórico do veículo');
  }

  return result;
}

