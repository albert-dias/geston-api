import { Router } from 'express';
import { z } from 'zod';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { ClientsController } from '@/controllers/ClientsController';
import { validateBody, validateParams, validateQuery } from '@/lib/validators';
import {
  createClientSchema,
  updateClientSchema,
} from '@/schemas/client.schema';
import { paginationQuerySchema } from '@/schemas/pagination.schema';

export const clientsRouter = Router();

const clientsController = new ClientsController();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestão de clientes da empresa
 */

const enterpriseIdParamSchema = z.object({
  enterprise_id: z.string().uuid('ID da empresa inválido'),
});

const listClientsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

/**
 * @swagger
 * /clients/{enterprise_id}:
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
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
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               document:
 *                 type: string
 *                 example: "12345678901"
 *               phone:
 *                 type: string
 *                 example: "11987654321"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 */
clientsRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createClientSchema),
  clientsController.create
);

/**
 * @swagger
 * /clients/{enterprise_id}:
 *   get:
 *     summary: Listar clientes com paginação
 *     tags: [Clientes]
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
 *         description: Buscar por nome, documento ou telefone
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Não autorizado
 */
clientsRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listClientsQuerySchema),
  clientsController.list
);

/**
 * @swagger
 * /clients/{enterprise_id}/{id}:
 *   get:
 *     summary: Buscar cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enterprise_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Dados do cliente com histórico de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente não encontrado
 *       401:
 *         description: Não autorizado
 */
clientsRouter.get(
  '/:enterprise_id/:id',
  ensureAuthenticate,
  validateParams(
    enterpriseIdParamSchema.extend({
      id: z.string().uuid('ID do cliente inválido'),
    })
  ),
  clientsController.show
);

/**
 * @swagger
 * /clients/{enterprise_id}:
 *   put:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
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
 *                 example: João Silva
 *               document:
 *                 type: string
 *                 example: "12345678901"
 *               phone:
 *                 type: string
 *                 example: "11987654321"
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 *       401:
 *         description: Não autorizado
 */
clientsRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateClientSchema),
  clientsController.update
);

/**
 * @swagger
 * /clients/{enterprise_id}:
 *   delete:
 *     summary: Deletar cliente
 *     tags: [Clientes]
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
 *                 description: ID do cliente a ser deletado
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       409:
 *         description: Cliente possui pedidos associados e não pode ser deletado
 *       401:
 *         description: Não autorizado
 */
clientsRouter.delete(
  '/:enterprise_id',
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(
    z.object({
      id: z.string().uuid('ID do cliente inválido'),
    })
  ),
  clientsController.delete
);

// clientsRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   clientsController.updatePass
// );

// clientsRouter.get('/', ensureAuthenticate, clientsController.list);

// clientsRouter.get('/:id', ensureAuthenticate, clientsController.show);
