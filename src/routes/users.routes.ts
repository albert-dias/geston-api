import { Router } from 'express';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { UsersController } from '@/controllers/UsersController';

export const usersRouter = Router();

const usersController = new UsersController();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gestão de usuários e empresas
 */

/**
 * @swagger
 * /user/create-account:
 *   post:
 *     summary: Criar nova conta (usuário e empresa)
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - fantasy_name
 *               - zip_code
 *               - address
 *               - number
 *               - city
 *               - state
 *               - lat
 *               - long
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: senha123
 *               document:
 *                 type: string
 *                 example: "12345678901"
 *               phone:
 *                 type: string
 *                 example: "11987654321"
 *               company_name:
 *                 type: string
 *                 example: Lava Rápido Silva LTDA
 *               fantasy_name:
 *                 type: string
 *                 example: Lava Rápido Silva
 *               document_enterprise:
 *                 type: string
 *                 example: "12345678000190"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLOCKED]
 *                 example: ACTIVE
 *               zip_code:
 *                 type: string
 *                 example: "12345678"
 *               address:
 *                 type: string
 *                 example: Rua Exemplo
 *               number:
 *                 type: string
 *                 example: "123"
 *               complement:
 *                 type: string
 *                 example: Apto 45
 *               region:
 *                 type: string
 *                 example: Centro
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 example: SP
 *               lat:
 *                 type: number
 *                 example: -23.5505
 *               long:
 *                 type: number
 *                 example: -46.6333
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 enterprise:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.post('/create-account', usersController.create);

usersRouter.get(
  '/enterprises',
  ensureAuthenticate,
  usersController.listEnterprises
);

usersRouter.post(
  '/create-branch',
  ensureAuthenticate,
  usersController.createBranch
);

usersRouter.patch(
  '/enterprises/:enterprise_id/deactivate',
  ensureAuthenticate,
  usersController.deactivateBranch
);

usersRouter.patch(
  '/select-enterprise',
  ensureAuthenticate,
  usersController.selectBranch
);

usersRouter.put(
  '/profile',
  ensureAuthenticate,
  usersController.updateUser
);

usersRouter.patch(
  '/password',
  ensureAuthenticate,
  usersController.updatePassword
);

usersRouter.delete(
  '/account',
  ensureAuthenticate,
  usersController.cancelAccount
);

usersRouter.put(
  '/enterprises/:enterprise_id',
  ensureAuthenticate,
  usersController.updateEnterprise
);

// usersRouter.put('/', ensureAuthenticate, usersController.update);

// usersRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   usersController.updatePass
// );

// usersRouter.get('/', ensureAuthenticate, usersController.list);

// usersRouter.get('/:id', ensureAuthenticate, usersController.show);
