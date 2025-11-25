import { prisma } from '@/lib/prisma';
import { PaymentType } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  day: number;
  month: number;
  year: number;
}

interface IPaymentSummary {
  total_orders: number;
  total_value: number;
}

interface IDaySummary {
  day: number;
  total_value: number;
  payment_type_summary: Record<PaymentType, IPaymentSummary>;
}

interface IResponse {
  day_summary: Omit<IDaySummary, 'day'>;
  monthly_summary: IDaySummary[];
}

export async function GetOrdersSummaryByDateService({
  enterprise_id,
  day,
  month,
  year,
}: IRequest): Promise<IResponse> {
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  const daysInMonth = new Date(year, month, 0).getDate();

  const dailyOrders = await prisma.order.findMany({
    where: {
      enterprise_id,
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const monthlyOrders = await prisma.order.findMany({
    where: {
      enterprise_id,
      created_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const createEmptyDaySummary = (day: number): IDaySummary => ({
    day,
    total_value: 0,
    payment_type_summary: {
      PIX: { total_orders: 0, total_value: 0 },
      MONEY: { total_orders: 0, total_value: 0 },
      CREDITCARD: { total_orders: 0, total_value: 0 },
    },
  });

  // --- Dia específico ---
  const day_summary: Omit<IDaySummary, 'day'> = {
    total_value: 0,
    payment_type_summary: {
      PIX: { total_orders: 0, total_value: 0 },
      MONEY: { total_orders: 0, total_value: 0 },
      CREDITCARD: { total_orders: 0, total_value: 0 },
    },
  };

  for (const order of dailyOrders) {
    day_summary.total_value += order.total_value;
    if (order.payment_type) {
      const payment = day_summary.payment_type_summary[order.payment_type];
      payment.total_orders += 1;
      payment.total_value += order.total_value;
    }
  }

  // --- Resumo do mês ---
  const monthlyMap: Record<number, IDaySummary> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    monthlyMap[d] = createEmptyDaySummary(d);
  }

  for (const order of monthlyOrders) {
    const orderDay = new Date(order.created_at).getDate();
    const summary = monthlyMap[orderDay];

    summary.total_value += order.total_value;

    if (order.payment_type) {
      const payment = summary.payment_type_summary[order.payment_type];
      payment.total_orders += 1;
      payment.total_value += order.total_value;
    }
  }

  const monthly_summary = Object.values(monthlyMap).sort(
    (a, b) => a.day - b.day
  );

  return {
    day_summary,
    monthly_summary: monthly_summary || [],
  };
}
