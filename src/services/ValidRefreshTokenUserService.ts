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
    include: {
      enterprise: {
        include: {
          services_enterprise: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('Usuário inexistente!');
  }

  // Se o usuário não tem empresas na relação many-to-many mas tem enterprise_id,
  // buscar a empresa diretamente e adicionar ao array
  let userWithEnterprise = user;
  if ((!user.enterprise || user.enterprise.length === 0) && user.enterprise_id) {
    const enterprise = await prisma.enterprise.findUnique({
      where: { id: user.enterprise_id },
      include: {
        services_enterprise: true,
      },
    });

    if (enterprise) {
      // Se a empresa existe mas não está relacionada, criar a relação
      await prisma.user.update({
        where: { id: user.id },
        data: {
          enterprise: {
            connect: { id: enterprise.id },
          },
        },
      });

      userWithEnterprise = {
        ...user,
        enterprise: [enterprise],
      };
    }
  }

  const { secret, expiresIn } = authConfig.jwt;

  const token = jwt.sign(
    {
      name: userWithEnterprise.name,
      email: userWithEnterprise.email,
      user_type: userWithEnterprise.user_type,
    },
    secret,
    {
      subject: `${userWithEnterprise.id}`,
      expiresIn,
    }
  );
  return { refreshToken, expiresRefreshToken: expires, token, user: userWithEnterprise };
}
