import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

interface IRequest {
  user_id: string;
  old_password: string;
  new_password: string;
}

export async function UpdateUserPasswordService({
  user_id,
  old_password,
  new_password,
}: IRequest): Promise<void> {
  if (!user_id || !old_password || !new_password) {
    throw AppError.badRequest('Dados incompletos');
  }

  if (new_password.length < 6) {
    throw AppError.badRequest('A senha deve ter no mínimo 6 caracteres');
  }

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  // Verificar senha antiga
  const passwordMatched = await bcryptjs.compare(old_password, user.password);

  if (!passwordMatched) {
    throw AppError.unauthorized('Senha atual incorreta');
  }

  // Hash da nova senha
  const hashedPassword = await bcryptjs.hash(new_password, 8);

  // Atualizar senha
  await prisma.user.update({
    where: { id: user_id },
    data: { password: hashedPassword },
  });
}

