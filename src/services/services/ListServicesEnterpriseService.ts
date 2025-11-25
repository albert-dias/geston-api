import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ServicesEnterprise } from '@prisma/client';
import {
  PaginationParams,
  PaginatedResponse,
  normalizePaginationParams,
  createPaginationMeta,
} from '@/lib/pagination';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest extends PaginationParams {
  enterprise_id: string;
  search?: string;
  useCache?: boolean;
}

export async function ListServicesEnterpriseService({
  enterprise_id,
  page,
  limit,
  search,
  useCache = true,
}: IRequest): Promise<PaginatedResponse<ServicesEnterprise>> {
  if (!enterprise_id) {
    throw new AppError('Dados incompletos');
  }

  const { page: normalizedPage, limit: normalizedLimit, skip } =
    normalizePaginationParams(page, limit);

  // Tentar buscar do cache (apenas se não houver busca e for primeira página)
  if (useCache && !search && normalizedPage === 1) {
    const cacheKey = CacheKeys.services(enterprise_id);
    const cached = cache.get<PaginatedResponse<ServicesEnterprise>>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Construir filtro de busca
  const where: any = {
    enterprise_id,
  };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  // Buscar total de registros e dados paginados
  const [total, data] = await Promise.all([
    prisma.servicesEnterprise.count({ where }),
    prisma.servicesEnterprise.findMany({
      where,
      skip,
      take: normalizedLimit,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);

  const result: PaginatedResponse<ServicesEnterprise> = {
    data,
    meta,
  };

  // Salvar no cache (apenas primeira página sem busca, TTL de 5 minutos)
  if (useCache && !search && normalizedPage === 1) {
    const cacheKey = CacheKeys.services(enterprise_id);
    cache.set(cacheKey, result, 5 * 60 * 1000);
  }

  return result;
}
