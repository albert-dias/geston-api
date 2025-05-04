import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Order } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  year: number;
  month: number;
  day?: number;
}

interface IResponse {
  orders: Order[];
  canceled: number;
  inline: number;
  completed: number;
  total: number;
}

export async function ListOrdersEnterpriseService({
  enterprise_id,
  year,
  month,
  day,
}: IRequest): Promise<IResponse> {
  if (!enterprise_id || !year || !month) {
    throw new AppError('Ano e mês são obrigatórios.');
  }

  let from: Date;
  let to: Date;

  if (day) {
    from = new Date(year, month - 1, day, 0, 0, 0);
    to = new Date(year, month - 1, day, 23, 59, 59);
  } else {
    from = new Date(year, month - 1, 1, 0, 0, 0);
    to = new Date(year, month, 0, 23, 59, 59); // último dia do mês
  }

  const result = await prisma.order.findMany({
    where: {
      enterprise_id,
      created_at: {
        gte: from,
        lte: to,
      },
    },
    include: {
      services_order: { include: { service: true } },
    },
    orderBy: { created_at: 'asc' },
  });

  const canceled = result.filter((order) => order.status === 'CANCELED').length;
  const inline = result.filter((order) => order.status === 'INLINE').length;
  const completed = result.filter(
    (order) => order.status === 'COMPLETED'
  ).length;
  const total = result.length;

  return {
    orders: result,
    canceled,
    inline,
    completed,
    total,
  };
}
