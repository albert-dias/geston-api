import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import {
  PaymentType,
  Order,
  StatusOrder,
} from '@prisma/client';
import { CreateCashMovementService } from '../cash-movements/CreateCashMovementService';

interface IRequest {
  enterprise_id: string;
  order_id: string;
  payment_type: PaymentType;
  status: StatusOrder;
  user_id?: string;
}

export async function UpdateOrderEnterpriseService({
  enterprise_id,
  order_id,
  payment_type,
  status,
  user_id,
}: IRequest): Promise<Order> {
  if (!order_id || !enterprise_id || !status) {
    throw new AppError('Dados incompletos');
  }

  // Buscar o pedido antes de atualizar para verificar se já estava COMPLETED
  const existingOrder = await prisma.order.findFirst({
    where: { id: order_id, enterprise_id },
  });

  if (!existingOrder) {
    throw new AppError('Pedido não encontrado');
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

  // Se o status foi alterado para COMPLETED e o pedido não estava COMPLETED antes,
  // criar movimentação de caixa automaticamente
  if (
    status === 'COMPLETED' &&
    existingOrder.status !== 'COMPLETED' &&
    user_id
  ) {
    try {
      const paymentTypeDescription = 
        payment_type === 'PIX' ? 'PIX' :
        payment_type === 'CREDITCARD' ? 'Cartão de Crédito' :
        payment_type === 'MONEY' ? 'Dinheiro' : 'Pagamento';

      await CreateCashMovementService({
        enterprise_id,
        type: 'ENTRY',
        amount: result.total_value,
        description: `Pagamento de serviço - Placa: ${result.car_license_plate} (${paymentTypeDescription})`,
        order_id: result.id,
        created_by: user_id,
      });
    } catch (error) {
      // Log erro mas não falha a atualização do pedido
      console.error('Erro ao criar movimentação de caixa:', error);
    }
  }

  return result;
}
