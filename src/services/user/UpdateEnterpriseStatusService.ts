import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Enterprise, Status } from '@prisma/client';

interface IRequest {
  user_id: string;
  enterprise_id: string;
  status: Status;
}

export async function UpdateEnterpriseStatusService({
  user_id,
  enterprise_id,
  status,
}: IRequest): Promise<Enterprise> {
  if (!user_id || !enterprise_id || !status) {
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

  // Verificar se é a última empresa ativa
  if (status === 'INACTIVE') {
    const activeEnterprises = await prisma.user.findUnique({
      where: { id: user_id },
      include: {
        enterprise: {
          where: {
            status: 'ACTIVE',
            NOT: { id: enterprise_id },
          },
        },
      },
    });

    if (!activeEnterprises || activeEnterprises.enterprise.length === 0) {
      throw AppError.badRequest(
        'Não é possível desativar a última empresa ativa. Selecione outra empresa como ativa antes de desativar esta.'
      );
    }
  }

  // Atualizar status da empresa
  const enterprise = await prisma.enterprise.update({
    where: { id: enterprise_id },
    data: { status },
  });

  if (!enterprise) {
    throw AppError.internal('Erro ao atualizar status da empresa');
  }

  return enterprise;
}

