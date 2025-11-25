import { z } from 'zod';

export const createAppointmentSchema = z.object({
  car_license_plate: z
    .string()
    .min(7, 'Placa deve ter no mínimo 7 caracteres')
    .max(8, 'Placa deve ter no máximo 8 caracteres')
    .regex(
      /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
      'Formato de placa inválido (use formato Mercosul ou antigo)'
    )
    .transform((val) => val.replace('-', '').toUpperCase()),
  scheduled_date: z
    .string()
    .datetime('Data inválida')
    .transform((val) => new Date(val)),
  document: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, '')),
      'CPF deve ter 11 dígitos'
    )
    .transform((val) => (val ? val.replace(/\D/g, '') : undefined)),
  client_id: z.string().uuid().optional(),
  service_ids: z
    .array(z.string().uuid('ID do serviço inválido'))
    .min(1, 'Pelo menos um serviço deve ser selecionado'),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  id: z.string().uuid('ID do agendamento inválido'),
  scheduled_date: z
    .string()
    .datetime('Data inválida')
    .transform((val) => new Date(val))
    .optional(),
  status: z.enum(['SCHEDULED', 'CANCELED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
  service_ids: z.array(z.string().uuid()).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

