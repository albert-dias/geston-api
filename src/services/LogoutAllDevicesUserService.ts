import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';

interface IRequest {
  tokenValue: string;
}

export async function LogoutAllDevicesUserService({
  tokenValue,
}: IRequest): Promise<void> {
  if (!tokenValue) {
    throw new AppError('Token ausente!');
  }

  const validToken = await prisma.tokens.findUnique({
    where: { token: tokenValue },
  });

  if (!validToken) {
    throw new AppError('Token não existe!');
  }

  await prisma.tokens.updateMany({
    where: { user_id: validToken.user_id },
    data: { valid: false },
  });

  return;
}
