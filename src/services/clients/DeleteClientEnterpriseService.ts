import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { cache, CacheKeys } from '@/lib/cache';

interface IRequest {
  enterprise_id: string;
  id: string;
}

export async function DeleteClientEnterpriseService({
  enterprise_id,
  id,
}: IRequest): Promise<void> {
  if (!enterprise_id || !id) {
    throw AppError.badRequest('Dados incompletos', {
      required: ['enterprise_id', 'id'],
      received: { enterprise_id: !!enterprise_id, id: !!id },
    });
  }

  // Verificar se o cliente existe e pertence à empresa
  const client = await prisma.client.findFirst({
    where: {
      id,
      enterprise_id,
    },
    include: {
      orders: {
        take: 1,
      },
    },
  });

  if (!client) {
    throw AppError.notFound('Cliente não encontrado');
  }

  // Verificar se o cliente tem pedidos associados
  if (client.orders.length > 0) {
    throw AppError.conflict(
      'Não é possível excluir cliente que possui pedidos associados. Recomenda-se desativar o cliente.',
      { orderCount: client.orders.length }
    );
  }

  await prisma.client.delete({
    where: { id },
  });

  // Invalidar cache de clientes da empresa
  cache.deletePattern(`clients:${enterprise_id}*`);
  cache.delete(CacheKeys.client(enterprise_id, id));
}

