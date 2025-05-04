import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client, ServicesEnterprise } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
}

export async function ListClientsEnterpriseService({
  enterprise_id,
}: IRequest): Promise<Client[]> {
  if (!enterprise_id) {
    throw new AppError('Dados incompletos');
  }

  const result = await prisma.client.findMany({
    where: { enterprise_id },
  });

  if (!result) {
    throw new AppError('Erro ao listar clientes!');
  }

  return result;
}
