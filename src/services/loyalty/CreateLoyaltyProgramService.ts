import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { LoyaltyProgram } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  points_per_order?: number;
  discount_per_point?: number;
}

export async function CreateLoyaltyProgramService({
  enterprise_id,
  points_per_order = 1,
  discount_per_point = 0.01,
}: IRequest): Promise<LoyaltyProgram> {
  if (!enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Validar se a empresa existe
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  // Verificar se já existe programa de fidelidade
  const existingProgram = await prisma.loyaltyProgram.findUnique({
    where: { enterprise_id },
  });

  if (existingProgram) {
    throw AppError.conflict('Já existe um programa de fidelidade para esta empresa');
  }

  // Validar valores
  if (points_per_order < 1) {
    throw AppError.badRequest('Pontos por pedido deve ser pelo menos 1');
  }

  if (discount_per_point <= 0 || discount_per_point > 1) {
    throw AppError.badRequest('Desconto por ponto deve estar entre 0 e 1 (0% a 100%)');
  }

  const result = await prisma.loyaltyProgram.create({
    data: {
      enterprise_id,
      points_per_order,
      discount_per_point,
      active: true,
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar programa de fidelidade');
  }

  return result;
}

