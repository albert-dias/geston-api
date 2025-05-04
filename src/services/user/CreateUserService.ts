import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { User, UserType } from '@prisma/client';

interface IRequest {
  name: string;
  email: string;
  password: string;
  document: string;
  phone: string;
  user_type?: UserType;
}

export async function CreateUserService({
  document,
  phone,
  name,
  email,
  password,
  user_type = 'USER',
}: IRequest): Promise<User> {
  if (!name || !email || !password) {
    throw new AppError('Dados incompletos');
  }

  const user = await prisma.user.create({
    data: { name, email, password, user_type, document, phone },
  });

  if (!user) {
    throw new AppError('Erro ao criar usuário!');
  }

  return user;
}
