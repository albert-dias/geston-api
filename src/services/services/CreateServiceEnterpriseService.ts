import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ServicesEnterprise } from '@prisma/client';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest {
  enterprise_id: string;
  name: string;
  value: number;
  stock_quantity?: number;
}

export async function CreateServiceEnterpriseService({
  enterprise_id,
  name,
  value,
  stock_quantity = 0,
}: IRequest): Promise<ServicesEnterprise> {
  if (!name || !enterprise_id || value == null) {
    throw new AppError('Dados incompletos');
  }

  const enterpriseExists = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterpriseExists) {
    throw new AppError('Empresa não encontrada');
  }

  const result = await prisma.servicesEnterprise.create({
    data: {
      enterprise: {
        connect: {
          id: enterprise_id,
        },
      },
      name,
      value,
      stock_quantity: stock_quantity ?? 0,
    },
  });

  if (!result) {
    throw new AppError('Erro ao criar serviço!');
  }

  // Invalidar cache de serviços da empresa
  cache.deletePattern(`services:${enterprise_id}*`);

  return result;
}
