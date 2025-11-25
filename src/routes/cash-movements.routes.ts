import { Router } from 'express';
import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { CashMovementsController } from '@/controllers/CashMovementsController';
import { validateParams, validateBody, validateQuery } from '@/lib/validators';
import { z } from 'zod';
import { createCashMovementSchema } from '@/schemas/cash-movement.schema';

export const cashMovementsRouter = Router();
const cashMovementsController = new CashMovementsController();

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

const getSummaryQuerySchema = z.object({
  start_date: z.string()
    .min(1, 'Data inicial é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Data inicial inválida',
    }),
  end_date: z.string()
    .min(1, 'Data final é obrigatória')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: 'Data final inválida',
    }),
});

cashMovementsRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createCashMovementSchema),
  cashMovementsController.create
);

cashMovementsRouter.get(
  '/:enterprise_id/summary',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(getSummaryQuerySchema),
  cashMovementsController.getSummary
);

