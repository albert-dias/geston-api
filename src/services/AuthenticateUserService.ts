import jwt from 'jsonwebtoken';

import authConfig from '@/config/auth';
import { User } from '@prisma/client';
import { RefreshTokenUserService } from './RefreshTokenUserService';
import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import bcriptjs from 'bcryptjs';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresRefreshToken: Date;
}

export async function AuthenticatedUserService({
  email,
  password,
}: IRequest): Promise<IResponse> {
  if (!email || !password) {
    throw new AppError('Dados incompletos');
  }

  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      enterprise: {
        include: {
          services_enterprise: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Combinação email/senha incorretos');
  }

  const passwordMatched = bcriptjs.compare(password, user.password);

  if (!passwordMatched) {
    throw new AppError('Combinação email/senha incorretos');
  }

  const { secret, expiresIn } = authConfig.jwt;

  const { refreshToken, expires: expiresRefreshToken } =
    await RefreshTokenUserService({ user_id: user.id });

  const token = jwt.sign(
    { name: user.name, email: user.email, user_type: user.user_type },
    secret,
    { subject: `${user.id}`, expiresIn }
  );

  delete user.password;

  return { user, token, refreshToken, expiresRefreshToken };
}
