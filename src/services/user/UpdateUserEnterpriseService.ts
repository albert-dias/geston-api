import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

interface IRequest {
  user_id: string;
  enterprise_id: string;
}

export async function UpdateUserEnterpriseService({
  user_id,
  enterprise_id,
}: IRequest): Promise<User> {
  if (!user_id || !enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se o usuário tem permissão para esta empresa
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    include: {
      enterprise: {
        where: { id: enterprise_id },
      },
    },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  if (user.enterprise.length === 0) {
    throw AppError.forbidden('Você não tem permissão para esta empresa');
  }

  // Verificar se a empresa está ativa
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  if (enterprise.status !== 'ACTIVE') {
    throw AppError.badRequest('Não é possível selecionar uma empresa inativa');
  }

  // Atualizar enterprise_id do usuário
  // Também garantir que a relação many-to-many esteja estabelecida
  const updatedUser = await prisma.user.update({
    where: { id: user_id },
    data: {
      enterprise_id,
      enterprise: {
        connect: { id: enterprise_id },
      },
    },
    include: {
      enterprise: {
        where: { id: enterprise_id },
        include: {
          services_enterprise: true,
        },
      },
    },
  });

  if (!updatedUser) {
    throw AppError.internal('Erro ao atualizar empresa do usuário');
  }

  return updatedUser;
}

