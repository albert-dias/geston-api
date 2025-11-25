import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Employee } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  name: string;
  document: string;
  phone: string;
  email?: string;
  role: 'LAVADOR' | 'ATENDENTE' | 'GERENTE';
  commission_rate?: number;
}

export async function CreateEmployeeService({
  enterprise_id,
  name,
  document,
  phone,
  email,
  role,
  commission_rate,
}: IRequest): Promise<Employee> {
  if (!enterprise_id || !name || !document || !phone || !role) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Validar se a empresa existe
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  // Verificar se já existe funcionário com mesmo documento na empresa
  const existingEmployee = await prisma.employee.findFirst({
    where: {
      enterprise_id,
      document,
    },
  });

  if (existingEmployee) {
    throw AppError.conflict('Já existe um funcionário com este CPF nesta empresa');
  }

  // Validar taxa de comissão
  if (commission_rate !== undefined) {
    if (commission_rate < 0 || commission_rate > 1) {
      throw AppError.badRequest('Taxa de comissão deve estar entre 0 e 1 (0% a 100%)');
    }
  }

  const result = await prisma.employee.create({
    data: {
      enterprise_id,
      name,
      document: document.replace(/\D/g, ''),
      phone: phone.replace(/\D/g, ''),
      email: email || null,
      role,
      commission_rate: commission_rate ?? null,
      status: 'ACTIVE',
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar funcionário');
  }

  return result;
}

