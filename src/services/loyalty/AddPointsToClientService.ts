import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ClientLoyaltyPoints } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  client_id: string;
  points: number;
}

export async function AddPointsToClientService({
  enterprise_id,
  client_id,
  points,
}: IRequest): Promise<ClientLoyaltyPoints> {
  if (!enterprise_id || !client_id || !points || points <= 0) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Validar se cliente existe e pertence à empresa
  const client = await prisma.client.findFirst({
    where: {
      id: client_id,
      enterprise_id,
    },
  });

  if (!client) {
    throw AppError.notFound('Cliente não encontrado');
  }

  // Buscar ou criar programa de fidelidade
  let program = await prisma.loyaltyProgram.findUnique({
    where: { enterprise_id },
  });

  if (!program) {
    // Criar programa padrão se não existir
    program = await prisma.loyaltyProgram.create({
      data: {
        enterprise_id,
        points_per_order: 1,
        discount_per_point: 0.01,
        active: true,
      },
    });
  }

  if (!program.active) {
    throw AppError.badRequest('Programa de fidelidade está inativo');
  }

  // Buscar ou criar pontos do cliente
  const existingPoints = await prisma.clientLoyaltyPoints.findUnique({
    where: {
      client_id_program_id: {
        client_id,
        program_id: program.id,
      },
    },
  });

  if (existingPoints) {
    // Atualizar pontos existentes
    const result = await prisma.clientLoyaltyPoints.update({
      where: { id: existingPoints.id },
      data: {
        points: existingPoints.points + points,
      },
    });
    return result;
  } else {
    // Criar novos pontos
    const result = await prisma.clientLoyaltyPoints.create({
      data: {
        client_id,
        program_id: program.id,
        points,
      },
    });
    return result;
  }
}

