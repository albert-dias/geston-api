import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
  name: string;
  document: string;
  phone: string;
}

export async function UpdateClientEnterpriseService({
  enterprise_id,
  id,
  name,
  document,
  phone,
}: IRequest): Promise<Client> {
  if (!enterprise_id || !id) {
    throw new AppError('Dados incompletos');
  }

  const result = await prisma.client.update({
    where: { id, enterprise_id },
    data: { name, document, phone },
  });

  if (!result) {
    throw new AppError('Erro ao atualizar cliente!');
  }

  return result;
}
