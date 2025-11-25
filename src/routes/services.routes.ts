import { Router } from 'express';
import { z } from 'zod';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { ServicesController } from '@/controllers/ServicesController';
import { validateBody, validateParams, validateQuery } from '@/lib/validators';
import {
  createServiceSchema,
  updateServiceSchema,
} from '@/schemas/service.schema';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

export const serviceRouter = Router();

const serviceController = new ServicesController();

/**
 * @swagger
 * tags:
 *   name: Serviços
 *   description: Gestão de serviços da empresa
 */

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

const listServicesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

/**
 * @swagger
 * /services/{enterprise_id}:
 *   post:
 *     summary: Criar novo serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enterprise_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - value
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lavagem Completa
 *               value:
 *                 type: number
 *                 example: 5000
 *                 description: Valor em centavos
 *               stock_quantity:
 *                 type: number
 *                 example: 0
 *                 description: Quantidade em estoque (opcional)
 *               minimum_stock:
 *                 type: number
 *                 example: 10
 *                 description: Estoque mínimo (opcional)
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 */
serviceRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createServiceSchema),
  serviceController.create
);

/**
 * @swagger
 * /services/{enterprise_id}:
 *   get:
 *     summary: Listar serviços com paginação
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enterprise_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome do serviço
 *     responses:
 *       200:
 *         description: Lista de serviços
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Não autorizado
 */
serviceRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listServicesQuerySchema),
  serviceController.list
);

/**
 * @swagger
 * /services/{enterprise_id}:
 *   put:
 *     summary: Atualizar serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enterprise_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Lavagem Completa
 *               value:
 *                 type: number
 *                 example: 5500
 *                 description: Valor em centavos
 *               stock_quantity:
 *                 type: number
 *                 example: 5
 *               minimum_stock:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Serviço não encontrado
 *       401:
 *         description: Não autorizado
 */
serviceRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateServiceSchema),
  serviceController.update
);

// serviceRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   serviceController.updatePass
// );

// serviceRouter.get('/', ensureAuthenticate, serviceController.list);

// serviceRouter.get('/:id', ensureAuthenticate, serviceController.show);
