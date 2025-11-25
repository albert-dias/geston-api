import { Router } from 'express';
import { sessionsRouter } from './sessions.routes';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { usersRouter } from './users.routes';
import { serviceRouter } from './services.routes';
import { clientsRouter } from './clients.routes';
import { ordersRouter } from './orders.routes';
import { appointmentsRouter } from './appointments.routes';
import { employeesRouter } from './employees.routes';
import { vehicleHistoryRouter } from './vehicle-history.routes';
import { cashMovementsRouter } from './cash-movements.routes';
import { loyaltyRouter } from './loyalty.routes';

const routes = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Informações da API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Mensagem de boas-vindas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bem vindo a api do Gest-ON!
 */
routes.get('/', (req, res) => {
  res.json({ message: 'Bem vindo a api do Gest-ON!' });
});

routes.use('/sessions', sessionsRouter);
routes.use('/user', usersRouter);
routes.use('/services', serviceRouter);
routes.use('/clients', clientsRouter);
routes.use('/orders', ordersRouter);
routes.use('/appointments', appointmentsRouter);
routes.use('/employees', employeesRouter);
routes.use('/vehicle-history', vehicleHistoryRouter);
routes.use('/cash-movements', cashMovementsRouter);
routes.use('/loyalty', loyaltyRouter);

export default routes;
