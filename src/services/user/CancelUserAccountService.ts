import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

interface IRequest {
  user_id: string;
  password: string;
}

export async function CancelUserAccountService({
  user_id,
  password,
}: IRequest): Promise<void> {
  if (!user_id || !password) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  // Verificar senha
  const passwordMatched = await bcryptjs.compare(password, user.password);

  if (!passwordMatched) {
    throw AppError.unauthorized('Senha incorreta');
  }

  // Deletar relacionamentos e depois o usuário
  // Como há relacionamentos, vamos usar uma transação
  await prisma.$transaction(async (tx) => {
    // Deletar tokens de refresh
    await tx.tokens.deleteMany({
      where: { user_id },
    });

    // Deletar usuário (os relacionamentos serão tratados pelo Prisma)
    await tx.user.delete({
      where: { id: user_id },
    });
  });
}

