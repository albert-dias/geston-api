import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { CashMovement, CashMovementType } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  order_id?: string;
  employee_id?: string;
  created_by: string;
}

export async function CreateCashMovementService({
  enterprise_id,
  type,
  amount,
  description,
  order_id,
  employee_id,
  created_by,
}: IRequest): Promise<CashMovement> {
  if (!enterprise_id || !type || !amount || !description || !created_by) {
    throw AppError.badRequest('Dados incompletos');
  }

  if (amount <= 0) {
    throw AppError.badRequest('Valor deve ser maior que zero');
  }

  // Validar se a empresa existe
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  // Validar se o usuário existe
  const user = await prisma.user.findUnique({
    where: { id: created_by },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  // Validar pedido se fornecido
  if (order_id) {
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        enterprise_id,
      },
    });

    if (!order) {
      throw AppError.notFound('Pedido não encontrado');
    }
  }

  // Validar funcionário se fornecido
  if (employee_id) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: employee_id,
        enterprise_id,
      },
    });

    if (!employee) {
      throw AppError.notFound('Funcionário não encontrado');
    }
  }

  const result = await prisma.cashMovement.create({
    data: {
      enterprise_id,
      type,
      amount,
      description,
      order_id: order_id || null,
      employee_id: employee_id || null,
      created_by,
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar movimentação de caixa');
  }

  return result;
}

