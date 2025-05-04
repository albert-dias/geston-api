import { Router } from 'express';
import { sessionsRouter } from './sessions.routes';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { usersRouter } from './users.routes';
import { serviceRouter } from './services.routes';
import { clientsRouter } from './clients.routes';
import { ordersRouter } from './orders.routes';

const routes = Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Bem vindo a api do Gest-ON!' });
});

routes.use('/sessions', sessionsRouter);
routes.use('/user', usersRouter);
routes.use('/services', serviceRouter);
routes.use('/clients', clientsRouter);
routes.use('/orders', ordersRouter);

export default routes;
