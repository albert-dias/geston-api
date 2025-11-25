import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { LoyaltyProgram } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  points_per_order?: number;
  discount_per_point?: number;
  active?: boolean;
}

export async function UpdateLoyaltyProgramService({
  enterprise_id,
  points_per_order,
  discount_per_point,
  active,
}: IRequest): Promise<LoyaltyProgram> {
  if (!enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se programa existe
  const existingProgram = await prisma.loyaltyProgram.findUnique({
    where: { enterprise_id },
  });

  if (!existingProgram) {
    throw AppError.notFound('Programa de fidelidade não encontrado');
  }

  // Validar valores se fornecidos
  if (points_per_order !== undefined && points_per_order < 1) {
    throw AppError.badRequest('Pontos por pedido deve ser pelo menos 1');
  }

  if (discount_per_point !== undefined && (discount_per_point <= 0 || discount_per_point > 1)) {
    throw AppError.badRequest('Desconto por ponto deve estar entre 0 e 1 (0% a 100%)');
  }

  // Construir objeto de atualização apenas com campos fornecidos
  const updateData: Partial<{
    points_per_order: number;
    discount_per_point: number;
    active: boolean;
  }> = {};

  if (points_per_order !== undefined) updateData.points_per_order = points_per_order;
  if (discount_per_point !== undefined) updateData.discount_per_point = discount_per_point;
  if (active !== undefined) updateData.active = active;

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  const result = await prisma.loyaltyProgram.update({
    where: { enterprise_id },
    data: updateData,
  });

  if (!result) {
    throw AppError.internal('Erro ao atualizar programa de fidelidade');
  }

  return result;
}

