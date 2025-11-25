import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Enterprise } from '@prisma/client';

interface IRequest {
  user_id: string;
}

export async function ListUserEnterprisesService({
  user_id,
}: IRequest): Promise<Enterprise[]> {
  if (!user_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Buscar todas as empresas relacionadas ao usuário
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    include: {
      enterprise: true,
    },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  return user.enterprise;
}

