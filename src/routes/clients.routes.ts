import { Router } from 'express';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { ClientsController } from '@/controllers/ClientsController';

export const clientsRouter = Router();

const clientsController = new ClientsController();

clientsRouter.post('/:enterprise_id', clientsController.create);

clientsRouter.get(
  '/:enterprise_id',
  ensureAuthenticate,
  clientsController.list
);

clientsRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  clientsController.update
);

// clientsRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   clientsController.updatePass
// );

// clientsRouter.get('/', ensureAuthenticate, clientsController.list);

// clientsRouter.get('/:id', ensureAuthenticate, clientsController.show);
