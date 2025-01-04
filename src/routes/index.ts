import { Router } from 'express';
import { sessionsRouter } from './sessions.routes';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';

const routes = Router();

routes.get('/', (req, res) => {
  res.json({ message: 'Bem vindo a api do Gest-ON!' });
});

routes.use('/sessions', sessionsRouter);

export default routes;
