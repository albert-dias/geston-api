import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { LoyaltyProgram } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
}

export async function GetLoyaltyProgramService({
  enterprise_id,
}: IRequest): Promise<LoyaltyProgram | null> {
  if (!enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  const program = await prisma.loyaltyProgram.findUnique({
    where: { enterprise_id },
  });

  return program;
}

