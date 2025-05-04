import crypto from 'node:crypto';

import authConfig from '@/config/auth';
import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';

interface IRequest {
  user_id: string;
}

interface IResponse {
  expires: Date;
  refreshToken: string;
}

export async function RefreshTokenUserService({
  user_id,
}: IRequest): Promise<IResponse> {
  if (!user_id) {
    throw new AppError('Id do usuário ausente!');
  }

  await prisma.tokens.deleteMany({
    where: { user_id, valid: true },
  });

  const refreshToken = `${user_id}${crypto.randomBytes(64).toString('hex')}`;
  const expires = new Date(Date.now() + authConfig.refreshToken.duration);

  await prisma.tokens.create({
    data: {
      expires,
      token: refreshToken,
      user_id,
      valid: true,
    },
  });

  return { refreshToken, expires };
}
