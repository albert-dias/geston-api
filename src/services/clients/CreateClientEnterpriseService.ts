import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client } from '@prisma/client';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest {
  enterprise_id: string;
  name: string;
  document?: string;
  phone: string;
}

export async function CreateClientEnterpriseService({
  enterprise_id,
  name,
  document,
  phone,
}: IRequest): Promise<Client> {
  if (!name || !enterprise_id || !phone) {
    throw AppError.badRequest('Dados incompletos', {
      required: ['name', 'enterprise_id', 'phone'],
      received: { name: !!name, enterprise_id: !!enterprise_id, phone: !!phone },
    });
  }

  const enterpriseExists = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterpriseExists) {
    throw AppError.notFound('Empresa não encontrada');
  }

  const result = await prisma.client.create({
    data: {
      name,
      document: document || null,
      phone,
      enterprise_id,
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar cliente');
  }

  // Invalidar cache de clientes da empresa
  cache.deletePattern(`clients:${enterprise_id}*`);

  return result;
}
