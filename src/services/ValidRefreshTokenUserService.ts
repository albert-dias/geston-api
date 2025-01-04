import crypto from 'node:crypto';

import authConfig from '@/config/auth';
import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';

interface IRequest {
  tokenValue: string;
}

interface IResponse {
  expiresRefreshToken: Date;
  refreshToken: string;
  token: string;
  user: User;
}

export async function ValidRefreshTokenUserService({
  tokenValue,
}: IRequest): Promise<IResponse> {
  if (!tokenValue) {
    throw new AppError('Token ausente!');
  }

  const validToken = await prisma.tokens.findUnique({
    where: { token: tokenValue },
  });

  if (!validToken) {
    throw new AppError('Token não existe!');
  }

  if (validToken.valid && validToken.expires >= new Date()) {
    await prisma.tokens.update({
      where: { token: tokenValue },
      data: { valid: false },
    });
  }

  const refreshToken = `${validToken.user_id}${crypto
    .randomBytes(64)
    .toString('hex')}`;
  const expires = new Date(Date.now() + authConfig.refreshToken.duration);

  await prisma.tokens.create({
    data: {
      expires,
      token: refreshToken,
      user_id: validToken.user_id,
      valid: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: validToken.user_id },
  });

  if (!user) {
    throw new AppError('Usuário inexistente!');
  }

  const { secret, expiresIn } = authConfig.jwt;

  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      user_type: user.user_type,
    },
    secret,
    {
      subject: `${user.id}`,
      expiresIn,
    }
  );
  return { refreshToken, expiresRefreshToken: expires, token, user };
}
