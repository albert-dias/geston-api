import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ServicesEnterprise } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
}

export async function ListServicesEnterpriseService({
  enterprise_id,
}: IRequest): Promise<ServicesEnterprise[]> {
  if (!enterprise_id) {
    throw new AppError('Dados incompletos');
  }

  const user = await prisma.servicesEnterprise.findMany({
    where: { enterprise_id },
  });

  if (!user) {
    throw new AppError('Erro ao listar produtos!');
  }

  return user;
}
