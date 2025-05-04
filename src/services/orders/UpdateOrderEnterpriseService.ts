import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import {
  PaymentType,
  Order,
  ServicesEnterprise,
  ServicesOrder,
  StatusOrder,
} from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  order_id: string;
  payment_type: PaymentType;
  status: StatusOrder;
}

export async function UpdateOrderEnterpriseService({
  enterprise_id,
  order_id,
  payment_type,
  status,
}: IRequest): Promise<Order> {
  if (!order_id || !enterprise_id || !status) {
    throw new AppError('Dados incompletos');
  }

  const result = await prisma.order.update({
    where: { enterprise_id, id: order_id },
    data: {
      payment_type,
      status,
    },
  });

  if (!result) {
    throw new AppError('Erro ao atualizar venda!');
  }

  return result;
}
