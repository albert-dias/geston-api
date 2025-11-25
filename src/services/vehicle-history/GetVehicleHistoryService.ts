import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { VehicleHistory } from '@prisma/client';
import {
  PaginationParams,
  PaginatedResponse,
  normalizePaginationParams,
  createPaginationMeta,
} from '@/lib/pagination';

interface IRequest extends PaginationParams {
  enterprise_id: string;
  car_license_plate: string;
  start_date?: Date;
  end_date?: Date;
}

interface VehicleStats {
  total_washes: number;
  total_value: number;
  most_used_services: Array<{
    service: string;
    count: number;
  }>;
  average_value: number;
  last_wash_date: Date | null;
}

export async function GetVehicleHistoryService({
  enterprise_id,
  car_license_plate,
  page,
  limit,
  start_date,
  end_date,
}: IRequest): Promise<PaginatedResponse<VehicleHistory> & { stats: VehicleStats }> {
  if (!enterprise_id || !car_license_plate) {
    throw AppError.badRequest('Dados incompletos');
  }

  const { page: normalizedPage, limit: normalizedLimit, skip } =
    normalizePaginationParams(page, limit);

  const normalizedPlate = car_license_plate.toUpperCase().replace(/-/g, '');

  // Construir filtro
  const where: any = {
    enterprise_id,
    car_license_plate: normalizedPlate,
  };

  if (start_date || end_date) {
    where.created_at = {};
    if (start_date) {
      where.created_at.gte = start_date;
    }
    if (end_date) {
      where.created_at.lte = end_date;
    }
  }

  // Buscar total e dados paginados
  const [total, data] = await Promise.all([
    prisma.vehicleHistory.count({ where }),
    prisma.vehicleHistory.findMany({
      where,
      skip,
      take: normalizedLimit,
      orderBy: { created_at: 'desc' },
      include: {
        order: {
          include: {
            items_order: {
              include: {
                service: true,
              },
            },
          },
        },
        employee: true,
      },
    }),
  ]);

  // Calcular estatísticas
  const allHistory = await prisma.vehicleHistory.findMany({
    where: {
      enterprise_id,
      car_license_plate: normalizedPlate,
    },
  });

  const total_washes = allHistory.length;
  const total_value = allHistory.reduce((sum, h) => sum + h.total_value, 0);
  const average_value = total_washes > 0 ? total_value / total_washes : 0;
  const last_wash_date =
    allHistory.length > 0
      ? allHistory.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0]
          .created_at
      : null;

  // Contar serviços mais usados
  const serviceCount: Record<string, number> = {};
  allHistory.forEach((history) => {
    history.services.forEach((service) => {
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });
  });

  const most_used_services = Object.entries(serviceCount)
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 serviços

  const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);

  return {
    data,
    meta,
    stats: {
      total_washes,
      total_value,
      most_used_services,
      average_value: Math.round(average_value),
      last_wash_date,
    },
  };
}

