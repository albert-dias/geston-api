import { Router } from 'express';
import { z } from 'zod';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { OrdersController } from '@/controllers/OrdersController';
import { validateBody, validateQuery, validateParams } from '@/lib/validators';
import { createOrderSchema, updateOrderSchema } from '@/schemas/order.schema';

export const ordersRouter = Router();

const ordersController = new OrdersController();

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Gestão de pedidos (lavagens) da empresa
 */

// Schema para validação de parâmetros enterprise_id
const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

// Schema para validação de query params de listagem
const listOrdersQuerySchema = z.object({
  year: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(2000).max(3000)),
  month: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().min(1).max(12)),
  day: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)).pipe(z.number().int().min(1).max(31).optional()),
});

/**
 * @swagger
 * /orders/{enterprise_id}:
 *   post:
 *     summary: Criar novo pedido (lavagem)
 *     tags: [Pedidos]
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
 *               - car_license_plate
 *               - total_value
 *               - services
 *             properties:
 *               car_license_plate:
 *                 type: string
 *                 example: ABC1234
 *                 description: Placa do veículo (formato Mercosul ou antigo)
 *               document:
 *                 type: string
 *                 example: "12345678901"
 *                 description: CPF do cliente (opcional, será vinculado automaticamente)
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID do cliente (opcional)
 *               payment_type:
 *                 type: string
 *                 enum: [PIX, CREDITCARD, MONEY]
 *                 description: Tipo de pagamento (opcional)
 *               total_value:
 *                 type: number
 *                 example: 5000
 *                 description: Valor total em centavos
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - value
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     value:
 *                       type: number
 *                       example: 5000
 *                     quantity:
 *                       type: number
 *                       default: 1
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Serviços não encontrados
 *       401:
 *         description: Não autorizado
 */
ordersRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createOrderSchema),
  ordersController.create
);

/**
 * @swagger
 * /orders/{enterprise_id}:
 *   get:
 *     summary: Listar pedidos por data
 *     tags: [Pedidos]
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
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2025
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 1
 *       - in: query
 *         name: day
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 31
 *           example: 15
 *         description: Dia específico (opcional, se não informado retorna todo o mês)
 *     responses:
 *       200:
 *         description: Lista de pedidos com resumo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdersListResponse'
 *       400:
 *         description: Ano e mês são obrigatórios
 *       401:
 *         description: Não autorizado
 */
ordersRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listOrdersQuerySchema),
  ordersController.list
);

/**
 * @swagger
 * /orders/{enterprise_id}/dash:
 *   get:
 *     summary: Dashboard de pedidos (relatórios)
 *     tags: [Pedidos]
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
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2025
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 1
 *       - in: query
 *         name: day
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 31
 *           example: 15
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Não autorizado
 */
ordersRouter.get(
  '/:enterprise_id/dash',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listOrdersQuerySchema),
  ordersController.dash
);

/**
 * @swagger
 * /orders/{enterprise_id}:
 *   put:
 *     summary: Atualizar pedido (status e forma de pagamento)
 *     tags: [Pedidos]
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
 *               - order_id
 *               - status
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *               status:
 *                 type: string
 *                 enum: [INLINE, COMPLETED, CANCELED]
 *                 example: COMPLETED
 *               payment_type:
 *                 type: string
 *                 enum: [PIX, CREDITCARD, MONEY]
 *                 example: PIX
 *                 description: Forma de pagamento (obrigatório ao marcar como COMPLETED)
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Pedido não encontrado
 *       401:
 *         description: Não autorizado
 */
ordersRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateOrderSchema),
  ordersController.update
);

// ordersRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   ordersController.updatePass
// );

// ordersRouter.get('/', ensureAuthenticate, ordersController.list);

// ordersRouter.get('/:id', ensureAuthenticate, ordersController.show);
