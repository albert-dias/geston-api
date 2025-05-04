import { Router } from 'express';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { OrdersController } from '@/controllers/OrdersController';

export const ordersRouter = Router();

const ordersController = new OrdersController();

ordersRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  ordersController.create
);
ordersRouter.get('/:enterprise_id', ensureAuthenticate, ordersController.list);

ordersRouter.get(
  '/:enterprise_id/dash',
  ensureAuthenticate,
  ordersController.dash
);

ordersRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  ordersController.update
);

// ordersRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   ordersController.updatePass
// );

// ordersRouter.get('/', ensureAuthenticate, ordersController.list);

// ordersRouter.get('/:id', ensureAuthenticate, ordersController.show);
