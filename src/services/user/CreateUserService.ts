import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { User, UserType } from '@prisma/client';

interface IRequest {
  name: string;
  email: string;
  password: string;
  user_type: UserType;
}

export async function CreateUserService({
  name,
  email,
  password,
  user_type = 'USER',
}: IRequest): Promise<User> {
  if (!name || !email || !password) {
    throw new AppError('Token ausente!');
  }

  const user = await prisma.user.create({
    data: { name, email, password, user_type },
  });

  if (!user) {
    throw new AppError('Create user error!');
  }

  return user;
}
