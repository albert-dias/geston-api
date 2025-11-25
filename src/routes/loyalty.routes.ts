import { Router } from 'express';
import { z } from 'zod';
import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { validateParams, validateBody } from '@/lib/validators';
import { LoyaltyController } from '@/controllers/LoyaltyController';
import { createLoyaltyProgramSchema, updateLoyaltyProgramSchema } from '@/schemas/loyalty.schema';

export const loyaltyRouter = Router();

const loyaltyController = new LoyaltyController();

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

loyaltyRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createLoyaltyProgramSchema),
  loyaltyController.create
);

loyaltyRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  loyaltyController.show
);

loyaltyRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateLoyaltyProgramSchema),
  loyaltyController.update
);

