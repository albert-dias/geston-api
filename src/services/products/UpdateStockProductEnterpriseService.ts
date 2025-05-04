import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { ProductsEnterprise, User, UserType } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
  stock_quantity: number;
}

export async function UpdateStockProductEnterpriseService({
  enterprise_id,
  id,
  stock_quantity,
}: IRequest): Promise<ProductsEnterprise> {
  if (!enterprise_id || !id) {
    throw new AppError('Dados incompletos');
  }

  const user = await prisma.productsEnterprise.update({
    where: { id, enterprise_id },
    data: { stock_quantity },
  });

  if (!user) {
    throw new AppError('Erro ao atualizar estoque do produto!');
  }

  return user;
}
