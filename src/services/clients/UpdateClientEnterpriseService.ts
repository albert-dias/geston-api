import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Client } from '@prisma/client';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest {
  enterprise_id: string;
  id: string;
  name?: string;
  document?: string;
  phone?: string;
}

export async function UpdateClientEnterpriseService({
  enterprise_id,
  id,
  name,
  document,
  phone,
}: IRequest): Promise<Client> {
  if (!enterprise_id || !id) {
    throw AppError.badRequest('Dados incompletos', {
      required: ['enterprise_id', 'id'],
      received: { enterprise_id: !!enterprise_id, id: !!id },
    });
  }

  // Verificar se o cliente existe e pertence à empresa
  const existingClient = await prisma.client.findFirst({
    where: { id, enterprise_id },
  });

  if (!existingClient) {
    throw AppError.notFound('Cliente não encontrado');
  }

  // Construir objeto de atualização apenas com campos fornecidos
  const updateData: Partial<{
    name: string;
    document: string;
    phone: string;
  }> = {};

  if (name !== undefined) updateData.name = name;
  if (document !== undefined) updateData.document = document;
  if (phone !== undefined) updateData.phone = phone;

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  const result = await prisma.client.update({
    where: { id },
    data: updateData,
  });

  if (!result) {
    throw AppError.internal('Erro ao atualizar cliente');
  }

  // Invalidar cache de clientes da empresa e do cliente específico
  cache.deletePattern(`clients:${enterprise_id}*`);
  cache.delete(CacheKeys.client(enterprise_id, id));

  return result;
}
