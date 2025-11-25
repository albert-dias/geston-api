import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Order, PaymentType } from '@prisma/client';
import { CreateVehicleHistoryService } from '../vehicle-history/CreateVehicleHistoryService';
import { AddPointsToClientService } from '../loyalty/AddPointsToClientService';

interface IServiceInput {
  id: string;
  value: number;
  quantity?: number;
}

interface IRequest {
  enterprise_id: string;
  client_id?: string;
  document?: string;
  car_license_plate: string;
  payment_type?: PaymentType;
  total_value: number;
  services: IServiceInput[];
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

  // Validar se a empresa existe
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw new AppError('Empresa não encontrada');
  }

  // Validar se todos os serviços existem e pertencem à empresa
  const serviceIds = services.map((s) => s.id);
  const existingServices = await prisma.servicesEnterprise.findMany({
    where: {
      id: { in: serviceIds },
      enterprise_id,
    },
  });

  if (existingServices.length !== serviceIds.length) {
    const foundIds = existingServices.map((s) => s.id);
    const missingIds = serviceIds.filter((id) => !foundIds.includes(id));
    throw new AppError(
      `Serviços não encontrados ou não pertencem à empresa: ${missingIds.join(', ')}`
    );
  }

  // Validar valores dos serviços
  for (const serviceInput of services) {
    const existingService = existingServices.find((s) => s.id === serviceInput.id);
    if (!existingService) continue;

    // Permitir que o valor possa ser diferente (desconto/aumento) mas validar se é positivo
    if (serviceInput.value <= 0) {
      throw new AppError(`Valor do serviço ${existingService.name} deve ser maior que zero`);
    }
  }

  // Buscar ou criar cliente se document fornecido
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

  // Preparar itens do pedido
  const servicesOrder = services.map((service) => {
    return {
      service_id: service.id,
      value: service.value,
      quantity: service.quantity ?? 1,
    };
  });

  // Calcular total esperado para validação
  const expectedTotal = servicesOrder.reduce(
    (sum, item) => sum + item.value * item.quantity,
    0
  );

  // Validar se o total_value corresponde à soma dos serviços (com tolerância de 1 centavo)
  if (Math.abs(total_value - expectedTotal) > 1) {
    throw new AppError(
      `Valor total (${total_value}) não corresponde à soma dos serviços (${expectedTotal})`
    );
  }

  const result = await prisma.order.create({
    data: {
      enterprise_id,
      client_id: finalClientId,
      car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ''),
      payment_type: payment_type ?? null,
      total_value,
      items_order: {
        create: servicesOrder,
      },
    },
    include: {
      items_order: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError('Erro ao finalizar venda!');
  }

  // Registrar histórico do veículo (em background, não bloqueia resposta)
  try {
    const serviceNames = result.items_order.map((item) => item.service.name);
    await CreateVehicleHistoryService({
      enterprise_id,
      order_id: result.id,
      car_license_plate,
      services: serviceNames,
      total_value,
      client_id: finalClientId || undefined,
    });
  } catch (error) {
    // Log erro mas não falha o pedido
    console.error('Erro ao registrar histórico do veículo:', error);
  }

  // Adicionar pontos de fidelidade se cliente existir (em background)
  if (finalClientId) {
    try {
      const program = await prisma.loyaltyProgram.findUnique({
        where: { enterprise_id },
      });

      if (program && program.active) {
        await AddPointsToClientService({
          enterprise_id,
          client_id: finalClientId,
          points: program.points_per_order,
        });
      }
    } catch (error) {
      // Log erro mas não falha o pedido
      console.error('Erro ao adicionar pontos de fidelidade:', error);
    }
  }

  return result;
}
