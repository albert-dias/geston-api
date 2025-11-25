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
  user: Omit<User, 'password'> & {
    enterprise?: Array<{
      services_enterprise: Array<{
        id: string;
        name: string;
        value: number;
        stock_quantity: number;
        minimum_stock: number | null;
        enterprise_id: string;
        created_at: Date;
        updated_at: Date;
      }>;
    } & {
      id: string;
      fantasy_name: string;
      company_name: string | null;
      document: string | null;
      status: string;
      payment_day: number | null;
      finish_plan: Date | null;
      zip_code: string;
      address: string;
      number: string;
      complement: string | null;
      region: string;
      city: string;
      state: string;
      lat: number;
      long: number;
      created_at: Date;
      updated_at: Date;
    }>;
  };
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

  const passwordMatched = await bcriptjs.compare(password, user.password);

  if (!passwordMatched) {
    throw new AppError('Combinação email/senha incorretos');
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

  const { refreshToken, expires: expiresRefreshToken } =
    await RefreshTokenUserService({ user_id: userWithEnterprise.id });

  const token = jwt.sign(
    { name: userWithEnterprise.name, email: userWithEnterprise.email, user_type: userWithEnterprise.user_type },
    secret,
    { subject: `${userWithEnterprise.id}`, expiresIn }
  );

  // Remover senha do objeto antes de retornar
  const { password: _, ...userWithoutPassword } = userWithEnterprise;

  return { user: userWithoutPassword, token, refreshToken, expiresRefreshToken };
}
