import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Employee } from '@prisma/client';
import {
  PaginationParams,
  PaginatedResponse,
  normalizePaginationParams,
  createPaginationMeta,
} from '@/lib/pagination';

interface IRequest extends PaginationParams {
  enterprise_id: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  role?: 'LAVADOR' | 'ATENDENTE' | 'GERENTE';
  search?: string;
}

export async function ListEmployeesService({
  enterprise_id,
  page,
  limit,
  status,
  role,
  search,
}: IRequest): Promise<PaginatedResponse<Employee>> {
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

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { document: { contains: search.replace(/\D/g, '') } },
      { phone: { contains: search.replace(/\D/g, '') } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Buscar total e dados paginados
  const [total, data] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: normalizedLimit,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);

  return {
    data,
    meta,
  };
}

