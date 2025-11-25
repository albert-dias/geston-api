import { Router } from 'express';
import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { VehicleHistoryController } from '@/controllers/VehicleHistoryController';
import { validateParams, validateQuery } from '@/lib/validators';
import { z } from 'zod';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

export const vehicleHistoryRouter = Router();
const vehicleHistoryController = new VehicleHistoryController();

const getHistoryParamsSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
  car_license_plate: z.string().min(7).max(8),
});

const getHistoryQuerySchema = paginationQuerySchema.extend({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

vehicleHistoryRouter.get(
  '/:enterprise_id/:car_license_plate',
  ensureAuthenticate,
  validateParams(getHistoryParamsSchema),
  validateQuery(getHistoryQuerySchema),
  vehicleHistoryController.getHistory
);

