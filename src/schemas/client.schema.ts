import { z } from 'zod';

// Validação de CPF com dígito verificador
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // Todos os dígitos iguais

  let sum = 0;
  let remainder: number;

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

export const createClientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  document: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateCPF(val),
      'CPF inválido ou dígito verificador incorreto'
    )
    .transform((val) => (val ? val.replace(/\D/g, '') : undefined)),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(11, 'Telefone deve ter no máximo 11 dígitos')
    .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números')
    .transform((val) => val.replace(/\D/g, '')),
});

export const updateClientSchema = z.object({
  id: z.string().uuid('ID do cliente inválido'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  document: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateCPF(val),
      'CPF inválido ou dígito verificador incorreto'
    )
    .transform((val) => (val ? val.replace(/\D/g, '') : undefined)),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(11, 'Telefone deve ter no máximo 11 dígitos')
    .regex(/^\d{10,11}$/, 'Telefone deve conter apenas números')
    .transform((val) => val.replace(/\D/g, ''))
    .optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

