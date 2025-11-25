import { Router } from 'express';
import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { AppointmentsController } from '@/controllers/AppointmentsController';
import { validateParams, validateBody, validateQuery } from '@/lib/validators';
import { z } from 'zod';
import { createAppointmentSchema, updateAppointmentSchema } from '@/schemas/appointment.schema';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

export const appointmentsRouter = Router();
const appointmentsController = new AppointmentsController();

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

const listAppointmentsQuerySchema = paginationQuerySchema.extend({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  status: z.enum(['SCHEDULED', 'CANCELED', 'COMPLETED']).optional(),
  car_license_plate: z.string().optional(),
});

appointmentsRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createAppointmentSchema),
  appointmentsController.create
);

appointmentsRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listAppointmentsQuerySchema),
  appointmentsController.list
);

appointmentsRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateAppointmentSchema),
  appointmentsController.update
);

