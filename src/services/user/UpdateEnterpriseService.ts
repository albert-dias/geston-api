import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Enterprise } from '@prisma/client';

interface IRequest {
  user_id: string;
  enterprise_id: string;
  fantasy_name?: string;
  company_name?: string;
  document_enterprise?: string;
  zip_code?: string;
  address?: string;
  number?: string;
  complement?: string;
  region?: string;
  city?: string;
  state?: string;
  lat?: number;
  long?: number;
}

export async function UpdateEnterpriseService({
  user_id,
  enterprise_id,
  fantasy_name,
  company_name,
  document_enterprise,
  zip_code,
  address,
  number,
  complement,
  region,
  city,
  state,
  lat,
  long,
}: IRequest): Promise<Enterprise> {
  if (!user_id || !enterprise_id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se o usuário tem permissão para esta empresa
  const user = await prisma.user.findUnique({
    where: { id: user_id },
    include: {
      enterprise: {
        where: { id: enterprise_id },
      },
    },
  });

  if (!user) {
    throw AppError.notFound('Usuário não encontrado');
  }

  if (user.enterprise.length === 0) {
    throw AppError.forbidden('Você não tem permissão para esta empresa');
  }

  // Verificar se empresa existe
  const existingEnterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!existingEnterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  // Verificar se documento já existe (se estiver alterando)
  if (document_enterprise && document_enterprise !== existingEnterprise.document) {
    const documentExists = await prisma.enterprise.findUnique({
      where: { document: document_enterprise },
    });

    if (documentExists) {
      throw AppError.conflict('Este CNPJ já está em uso');
    }
  }

  // Construir objeto de atualização
  const updateData: Partial<{
    fantasy_name: string;
    company_name: string | null;
    document: string | null;
    zip_code: string;
    address: string;
    number: string;
    complement: string | null;
    region: string;
    city: string;
    state: string;
    lat: number;
    long: number;
  }> = {};

  if (fantasy_name !== undefined) updateData.fantasy_name = fantasy_name;
  if (company_name !== undefined) updateData.company_name = company_name || null;
  if (document_enterprise !== undefined) updateData.document = document_enterprise || null;
  if (zip_code !== undefined) updateData.zip_code = zip_code;
  if (address !== undefined) updateData.address = address;
  if (number !== undefined) updateData.number = number;
  if (complement !== undefined) updateData.complement = complement || null;
  if (region !== undefined) updateData.region = region;
  if (city !== undefined) updateData.city = city;
  if (state !== undefined) updateData.state = state;
  if (lat !== undefined) updateData.lat = lat;
  if (long !== undefined) updateData.long = long;

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  // Atualizar empresa
  const updatedEnterprise = await prisma.enterprise.update({
    where: { id: enterprise_id },
    data: updateData,
  });

  if (!updatedEnterprise) {
    throw AppError.internal('Erro ao atualizar empresa');
  }

  return updatedEnterprise;
}

