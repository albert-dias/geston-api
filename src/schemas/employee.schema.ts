import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  document: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .transform((val) => val.replace(/\D/g, '')),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(11, 'Telefone deve ter no máximo 11 dígitos')
    .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números')
    .transform((val) => val.replace(/\D/g, '')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  role: z.enum(['LAVADOR', 'ATENDENTE', 'GERENTE']).default('LAVADOR'),
  commission_rate: z
    .number()
    .min(0, 'Taxa de comissão deve ser maior ou igual a 0')
    .max(1, 'Taxa de comissão deve ser menor ou igual a 1')
    .optional(),
});

export const updateEmployeeSchema = z.object({
  id: z.string().uuid('ID do funcionário inválido'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  document: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')
    .transform((val) => val.replace(/\D/g, ''))
    .optional(),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(11, 'Telefone deve ter no máximo 11 dígitos')
    .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números')
    .transform((val) => val.replace(/\D/g, ''))
    .optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  role: z.enum(['LAVADOR', 'ATENDENTE', 'GERENTE']).optional(),
  commission_rate: z
    .number()
    .min(0)
    .max(1)
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

