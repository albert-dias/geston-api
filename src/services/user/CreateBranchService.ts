import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Enterprise } from '@prisma/client';

interface IRequest {
  user_id: string;
  fantasy_name: string;
  company_name?: string;
  document_enterprise?: string;
  zip_code: string;
  region: string;
  address: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  lat: number;
  long: number;
}

export async function CreateBranchService({
  user_id,
  fantasy_name,
  company_name,
  document_enterprise,
  zip_code,
  region,
  address,
  number,
  complement,
  city,
  state,
  lat,
  long,
}: IRequest): Promise<Enterprise> {
  if (
    !user_id ||
    !fantasy_name ||
    !zip_code ||
    !address ||
    !number ||
    !region ||
    !city ||
    !state
  ) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se usuário existe
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  // Criar nova filial vinculada ao usuário
  const enterprise = await prisma.enterprise.create({
    data: {
      fantasy_name,
      company_name: company_name || null,
      document: document_enterprise || null,
      zip_code,
      region,
      address,
      number,
      complement: complement || null,
      city,
      state,
      lat,
      long,
      users: {
        connect: { id: user_id },
      },
    },
  });

  if (!enterprise) {
    throw AppError.internal('Erro ao criar filial');
  }

  return enterprise;
}

