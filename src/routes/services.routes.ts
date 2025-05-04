import { Router } from 'express';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { ServicesController } from '@/controllers/ServicesController';

export const serviceRouter = Router();

const serviceController = new ServicesController();

serviceRouter.post(
  '/:enterprise_id',
  ensureAuthenticate,
  serviceController.create
);
serviceRouter.get('/:enterprise_id', serviceController.list);

serviceRouter.put(
  '/:enterprise_id',
  ensureAuthenticate,
  serviceController.update
);

// serviceRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   serviceController.updatePass
// );

// serviceRouter.get('/', ensureAuthenticate, serviceController.list);

// serviceRouter.get('/:id', ensureAuthenticate, serviceController.show);
