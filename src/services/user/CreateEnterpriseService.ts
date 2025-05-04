import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Enterprise, UserType } from '@prisma/client';

interface IRequest {
  name: string;
  email: string;
  password: string;
  document: string;
  phone: string;
  user_type?: UserType;
  fantasy_name: string;
  company_name: string;
  document_enterprise: string;
  status: string;
  address: string;
  number: string;
  zip_code: string;
  region: string;
  city: string;
  state: string;
  lat: number;
  long: number;
}

export async function CreateEnterpriseService({
  document,
  phone,
  name,
  email,
  password,
  user_type = 'USER',
  company_name,
  fantasy_name,
  document_enterprise,
  zip_code,
  region,
  address,
  number,
  city,
  state,
  lat,
  long,
}: IRequest): Promise<Enterprise> {
  if (
    !name ||
    !email ||
    !password ||
    !fantasy_name ||
    !zip_code ||
    !address ||
    !number ||
    !region ||
    !city ||
    !state
  ) {
    throw new AppError('Dados incompletos');
  }

  const enterprise = await prisma.enterprise.create({
    data: {
      fantasy_name,
      company_name,
      zip_code,
      region,
      document: document_enterprise,
      address,
      number,
      city,
      state,
      lat,
      long,
      users: { create: { name, email, password, user_type, document, phone } },
    },
  });

  if (!enterprise) {
    throw new AppError('Erro ao realizar o cadastro!');
  }

  return enterprise;
}
