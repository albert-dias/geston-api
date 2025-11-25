import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Appointment } from '@prisma/client';
import {
  PaginationParams,
  PaginatedResponse,
  normalizePaginationParams,
  createPaginationMeta,
} from '@/lib/pagination';

interface IRequest extends PaginationParams {
  enterprise_id: string;
  start_date?: Date;
  end_date?: Date;
  status?: 'SCHEDULED' | 'CANCELED' | 'COMPLETED';
  car_license_plate?: string;
}

export async function ListAppointmentsService({
  enterprise_id,
  page,
  limit,
  start_date,
  end_date,
  status,
  car_license_plate,
}: IRequest): Promise<PaginatedResponse<Appointment>> {
  if (!enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  const { page: normalizedPage, limit: normalizedLimit, skip } =
    normalizePaginationParams(page, limit);

  // Construir filtro
  const where: any = {
    enterprise_id,
  };

  if (status) {
    where.status = status;
  }

  if (car_license_plate) {
    where.car_license_plate = car_license_plate.toUpperCase().replace(/-/g, '');
  }

  if (start_date || end_date) {
    where.scheduled_date = {};
    if (start_date) {
      where.scheduled_date.gte = start_date;
    }
    if (end_date) {
      where.scheduled_date.lte = end_date;
    }
  }

  // Buscar total e dados paginados
  const [total, data] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      skip,
      take: normalizedLimit,
      orderBy: { scheduled_date: 'asc' },
      include: {
        client: true,
        enterprise: true,
      },
    }),
  ]);

  const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);

  return {
    data,
    meta,
  };
}

