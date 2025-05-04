import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ServicesEnterprise } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
  name: string;
  value: number;
  stock_quantity: number;
}

export async function UpdateServiceEnterpriseService({
  enterprise_id,
  id,
  name,
  value,
  stock_quantity,
}: IRequest): Promise<ServicesEnterprise> {
  if (!name || !enterprise_id || !id) {
    throw new AppError('Dados incompletos');
  }

  const user = await prisma.servicesEnterprise.update({
    where: { id, enterprise_id },
    data: { name, value, stock_quantity },
  });

  if (!user) {
    throw new AppError('Erro ao atualizar produto!');
  }

  return user;
}
