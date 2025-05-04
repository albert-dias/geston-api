import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client, ServicesEnterprise } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  name: string;
  document: string;
  phone: string;
}

export async function CreateClientEnterpriseService({
  enterprise_id,
  name,
  document,
  phone,
}: IRequest): Promise<Client> {
  if (!name || !enterprise_id || !document || !phone) {
    throw new AppError('Dados incompletos');
  }

  const enterpriseExists = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterpriseExists) {
    throw new AppError('Empresa não encontrada');
  }

  const result = await prisma.client.create({
    data: {
      name,
      document,
      phone,
      enterprise_id,
    },
  });

  if (!result) {
    throw new AppError('Erro ao criar clientes!');
  }

  return result;
}
