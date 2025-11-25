import { Router } from 'express';
import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { EmployeesController } from '@/controllers/EmployeesController';
import { validateParams, validateBody, validateQuery } from '@/lib/validators';
import { z } from 'zod';
import { createEmployeeSchema, updateEmployeeSchema } from '@/schemas/employee.schema';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

export const employeesRouter = Router();
const employeesController = new EmployeesController();

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

const listEmployeesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  role: z.enum(['LAVADOR', 'ATENDENTE', 'GERENTE']).optional(),
  search: z.string().optional(),
});

employeesRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createEmployeeSchema),
  employeesController.create
);

employeesRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listEmployeesQuerySchema),
  employeesController.list
);

employeesRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateEmployeeSchema),
  employeesController.update
);

