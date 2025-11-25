import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { User, UserType } from '@prisma/client';
import bcriptjs from 'bcryptjs';

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

  const hashedPassword = await bcriptjs.hash(password, 8);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, user_type, document, phone },
  });

  if (!user) {
    throw new AppError('Erro ao criar usuário!');
  }

  return user;
}
