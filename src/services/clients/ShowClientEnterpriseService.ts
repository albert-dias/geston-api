import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
}

export async function ShowClientEnterpriseService({
  enterprise_id,
  id,
}: IRequest): Promise<Client> {
  if (!enterprise_id || !id) {
    throw new AppError('Dados incompletos');
  }

  const result = await prisma.client.findFirst({
    where: { id, enterprise_id },
    include: {
      orders: {
        include: {
          services_order: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError('Erro ao atualizar cliente!');
  }

  return result;
}
