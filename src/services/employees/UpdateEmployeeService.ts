import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Employee, Status } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  role?: 'LAVADOR' | 'ATENDENTE' | 'GERENTE';
  commission_rate?: number;
  status?: Status;
}

export async function UpdateEmployeeService({
  enterprise_id,
  id,
  name,
  document,
  phone,
  email,
  role,
  commission_rate,
  status,
}: IRequest): Promise<Employee> {
  if (!enterprise_id || !id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se funcionário existe e pertence à empresa
  const existingEmployee = await prisma.employee.findFirst({
    where: { id, enterprise_id },
  });

  if (!existingEmployee) {
    throw AppError.notFound('Funcionário não encontrado');
  }

  // Se estiver atualizando documento, verificar se não existe outro com mesmo documento
  if (document && document !== existingEmployee.document) {
    const duplicateEmployee = await prisma.employee.findFirst({
      where: {
        enterprise_id,
        document: document.replace(/\D/g, ''),
        NOT: { id },
      },
    });

    if (duplicateEmployee) {
      throw AppError.conflict('Já existe outro funcionário com este CPF');
    }
  }

  // Construir objeto de atualização
  const updateData: Partial<{
    name: string;
    document: string;
    phone: string;
    email: string;
    role: string;
    commission_rate: number;
    status: Status;
  }> = {};

  if (name !== undefined) updateData.name = name;
  if (document !== undefined) updateData.document = document.replace(/\D/g, '');
  if (phone !== undefined) updateData.phone = phone.replace(/\D/g, '');
  if (email !== undefined) updateData.email = email || null;
  if (role !== undefined) updateData.role = role;
  if (commission_rate !== undefined) {
    if (commission_rate < 0 || commission_rate > 1) {
      throw AppError.badRequest('Taxa de comissão deve estar entre 0 e 1 (0% a 100%)');
    }
    updateData.commission_rate = commission_rate;
  }
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  const result = await prisma.employee.update({
    where: { id },
    data: updateData,
  });

  if (!result) {
    throw AppError.internal('Erro ao atualizar funcionário');
  }

  return result;
}

