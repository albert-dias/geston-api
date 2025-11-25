import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ServicesEnterprise } from '@prisma/client';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest {
  enterprise_id: string;
  id: string;
  name?: string;
  value?: number;
  stock_quantity?: number;
}

export async function UpdateServiceEnterpriseService({
  enterprise_id,
  id,
  name,
  value,
  stock_quantity,
}: IRequest): Promise<ServicesEnterprise> {
  if (!enterprise_id || !id) {
    throw new AppError('Dados incompletos');
  }

  // Verificar se serviço existe
  const existingService = await prisma.servicesEnterprise.findFirst({
    where: { id, enterprise_id },
  });

  if (!existingService) {
    throw new AppError('Serviço não encontrado');
  }

  // Construir objeto de atualização apenas com campos fornecidos
  const updateData: Partial<{
    name: string;
    value: number;
    stock_quantity: number;
  }> = {};

  if (name !== undefined) updateData.name = name;
  if (value !== undefined) updateData.value = value;
  if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;

  if (Object.keys(updateData).length === 0) {
    throw new AppError('Nenhum campo para atualizar');
  }

  const result = await prisma.servicesEnterprise.update({
    where: { id },
    data: updateData,
  });

  if (!result) {
    throw new AppError('Erro ao atualizar serviço!');
  }

  // Invalidar cache de serviços da empresa e do serviço específico
  cache.deletePattern(`services:${enterprise_id}*`);
  cache.delete(CacheKeys.service(enterprise_id, id));

  return result;
}
