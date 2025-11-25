import { z } from 'zod';

export const createOrderSchema = z.object({
  car_license_plate: z
    .string()
    .min(7, 'Placa deve ter no mínimo 7 caracteres')
    .max(8, 'Placa deve ter no máximo 8 caracteres')
    .regex(
      /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
      'Formato de placa inválido (use formato Mercosul ou antigo)'
    )
    .transform((val) => val.replace('-', '').toUpperCase()),
  document: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, '')),
      'CPF deve ter 11 dígitos'
    )
    .transform((val) => (val ? val.replace(/\D/g, '') : undefined)),
  client_id: z.string().uuid().optional(),
  payment_type: z.enum(['PIX', 'CREDITCARD', 'MONEY']).optional(),
  total_value: z
    .number()
    .int()
    .positive('Valor total deve ser maior que zero')
    .min(1, 'Valor total deve ser pelo menos 1 centavo'),
  services: z
    .array(
      z.object({
        id: z.string().uuid('ID do serviço inválido'),
        value: z
          .number()
          .int()
          .positive('Valor do serviço deve ser maior que zero'),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, 'Pelo menos um serviço deve ser selecionado'),
});

export const updateOrderSchema = z.object({
  order_id: z.string().uuid('ID do pedido inválido'),
  payment_type: z.enum(['PIX', 'CREDITCARD', 'MONEY']).optional(),
  status: z.enum(['INLINE', 'COMPLETED', 'CANCELED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

