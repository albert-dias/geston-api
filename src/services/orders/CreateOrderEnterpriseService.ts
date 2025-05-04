import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import {
  PaymentType,
  Order,
  ServicesEnterprise,
  ServicesOrder,
} from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  client_id?: string;
  document?: string;
  car_license_plate: string;
  payment_type: PaymentType;
  total_value: number;
  services: ServicesEnterprise[];
}

export async function CreateOrderEnterpriseService({
  enterprise_id,
  client_id,
  document,
  car_license_plate,
  payment_type,
  total_value,
  services,
}: IRequest): Promise<Order> {
  if (total_value === null || !enterprise_id || services.length === 0) {
    throw new AppError('Dados incompletos');
  }

  let finalClientId = client_id ?? null;

  if (document) {
    const existingClient = await prisma.client.findFirst({
      where: {
        enterprise_id,
        document,
      },
    });

    if (existingClient) {
      finalClientId = existingClient.id;
    }
  }

  const servicesOder = services.map((service) => {
    return {
      service_id: service.id,
      value: service.value,
    };
  });

  const result = await prisma.order.create({
    data: {
      enterprise_id,
      client_id: finalClientId,
      car_license_plate,
      total_value,
      services_order: {
        create: servicesOder,
      },
    },
  });

  if (!result) {
    throw new AppError('Erro ao finalizar venda!');
  }

  return result;
}
