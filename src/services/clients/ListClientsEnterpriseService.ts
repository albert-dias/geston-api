import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client } from '@prisma/client';
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

export async function ListClientsEnterpriseService({
  enterprise_id,
  page,
  limit,
  search,
  useCache = true,
}: IRequest): Promise<PaginatedResponse<Client>> {
  if (!enterprise_id) {
    throw new AppError('Dados incompletos');
  }

  const { page: normalizedPage, limit: normalizedLimit, skip } =
    normalizePaginationParams(page, limit);

  // Tentar buscar do cache (apenas se não houver busca e for primeira página)
  if (useCache && !search && normalizedPage === 1) {
    const cacheKey = CacheKeys.clients(enterprise_id, normalizedPage, normalizedLimit);
    const cached = cache.get<PaginatedResponse<Client>>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Construir filtro de busca
  const where: any = {
    enterprise_id,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { document: { contains: search.replace(/\D/g, '') } },
      { phone: { contains: search.replace(/\D/g, '') } },
    ];
  }

  // Buscar total de registros e dados paginados
  const [total, data] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      skip,
      take: normalizedLimit,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);

  const result: PaginatedResponse<Client> = {
    data,
    meta,
  };

  // Salvar no cache (apenas primeira página sem busca, TTL de 2 minutos)
  // Cache de clientes pode ser menor pois mudam mais frequentemente
  if (useCache && !search && normalizedPage === 1) {
    const cacheKey = CacheKeys.clients(enterprise_id, normalizedPage, normalizedLimit);
    cache.set(cacheKey, result, 2 * 60 * 1000);
  }

  return result;
}
