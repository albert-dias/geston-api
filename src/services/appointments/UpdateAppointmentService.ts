import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Appointment, AppointmentStatus } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  id: string;
  scheduled_date?: Date;
  status?: AppointmentStatus;
  notes?: string;
  service_ids?: string[];
}

export async function UpdateAppointmentService({
  enterprise_id,
  id,
  scheduled_date,
  status,
  notes,
  service_ids,
}: IRequest): Promise<Appointment> {
  if (!enterprise_id || !id) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Verificar se agendamento existe e pertence à empresa
  const existingAppointment = await prisma.appointment.findFirst({
    where: { id, enterprise_id },
  });

  if (!existingAppointment) {
    throw AppError.notFound('Agendamento não encontrado');
  }

  // Construir objeto de atualização
  const updateData: Partial<{
    scheduled_date: Date;
    status: AppointmentStatus;
    notes: string;
    service_ids: string[];
  }> = {};

  if (scheduled_date !== undefined) {
    // Validar se a data não está no passado (exceto se estiver completando)
    if (scheduled_date < new Date() && status !== 'COMPLETED') {
      throw AppError.badRequest('Data de agendamento não pode ser no passado');
    }
    updateData.scheduled_date = scheduled_date;
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  if (service_ids !== undefined) {
    // Validar se os serviços existem e pertencem à empresa
    if (service_ids.length > 0) {
      const existingServices = await prisma.servicesEnterprise.findMany({
        where: {
          id: { in: service_ids },
          enterprise_id,
        },
      });

      if (existingServices.length !== service_ids.length) {
        throw AppError.notFound('Um ou mais serviços não encontrados');
      }
    }
    updateData.service_ids = service_ids;
  }

  if (Object.keys(updateData).length === 0) {
    throw AppError.badRequest('Nenhum campo para atualizar');
  }

  const result = await prisma.appointment.update({
    where: { id },
    data: updateData,
  });

  if (!result) {
    throw AppError.internal('Erro ao atualizar agendamento');
  }

  return result;
}

