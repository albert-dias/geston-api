import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import bcryptjs from 'bcryptjs';

interface IRequest {
  user_id: string;
  name?: string;
  email?: string;
  document?: string;
  phone?: string;
}

export async function UpdateUserService({
  user_id,
  name,
  email,
  document,
  phone,
}: IRequest): Promise<User> {
  if (!user_id) {
    throw AppError.badRequest('ID do usuário é obrigatório');
  }

  // Buscar usuário atual
  const existingUser = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!existingUser) {
    throw AppError.notFound('Usuário não encontrado');
  }

  // Verificar se email já existe (se estiver alterando)
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw AppError.conflict('Este email já está em uso');
    }
  }

  // Construir objeto de atualização
  const updateData: Partial<{
    name: string;
    email: string;
    document: string | null;
    phone: string | null;
  }> = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (document !== undefined) updateData.document = document || null;
  if (phone !== undefined) updateData.phone = phone || null;

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  // Atualizar usuário
  const updatedUser = await prisma.user.update({
    where: { id: user_id },
    data: updateData,
  });

  if (!updatedUser) {
    throw AppError.internal('Erro ao atualizar usuário');
  }

  // Remover senha do retorno
  const { password: _, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword as User;
}

