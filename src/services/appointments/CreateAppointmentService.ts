import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { Appointment } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  car_license_plate: string;
  scheduled_date: Date;
  document?: string;
  client_id?: string;
  service_ids: string[];
  notes?: string;
}

export async function CreateAppointmentService({
  enterprise_id,
  car_license_plate,
  scheduled_date,
  document,
  client_id,
  service_ids,
  notes,
}: IRequest): Promise<Appointment> {
  if (!enterprise_id || !car_license_plate || !scheduled_date || !service_ids || service_ids.length === 0) {
    throw AppError.badRequest('Dados incompletos');
  }

  // Validar se a empresa existe
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterprise_id },
  });

  if (!enterprise) {
    throw AppError.notFound('Empresa não encontrada');
  }

  // Validar se a data não está no passado
  const now = new Date();
  if (scheduled_date < now) {
    throw AppError.badRequest('Data de agendamento não pode ser no passado');
  }

  // Validar se os serviços existem e pertencem à empresa
  const existingServices = await prisma.servicesEnterprise.findMany({
    where: {
      id: { in: service_ids },
      enterprise_id,
    },
  });

  if (existingServices.length !== service_ids.length) {
    const foundIds = existingServices.map((s) => s.id);
    const missingIds = service_ids.filter((id) => !foundIds.includes(id));
    throw AppError.notFound(
      `Serviços não encontrados ou não pertencem à empresa: ${missingIds.join(', ')}`
    );
  }

  // Buscar ou criar cliente se document fornecido
  let finalClientId = client_id ?? null;

  if (document) {
    const existingClient = await prisma.client.findFirst({
      where: {
        enterprise_id,
        document,
      },
    });

    if (existingClient) {
      finalClientId = existingClient.id;
    }
  }

  // Verificar conflito de horário (opcional - pode verificar se já existe agendamento no mesmo horário)
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      enterprise_id,
      car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ''),
      scheduled_date: {
        gte: new Date(scheduled_date.getTime() - 30 * 60 * 1000), // 30 minutos antes
        lte: new Date(scheduled_date.getTime() + 30 * 60 * 1000), // 30 minutos depois
      },
      status: 'SCHEDULED',
    },
  });

  if (conflictingAppointment) {
    throw AppError.conflict(
      'Já existe um agendamento para este veículo neste horário'
    );
  }

  const result = await prisma.appointment.create({
    data: {
      enterprise_id,
      client_id: finalClientId,
      car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ''),
      scheduled_date,
      service_ids,
      notes: notes || null,
      status: 'SCHEDULED',
    },
  });

  if (!result) {
    throw AppError.internal('Erro ao criar agendamento');
  }

  return result;
}

