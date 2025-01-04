import { Router } from 'express';

import ensureAuthenticate from '@/middlewares/ensureAuthenticated';
import { UsersController } from '@/controllers/UsersController';

export const usersRouter = Router();

const usersController = new UsersController();

usersRouter.post('/', usersController.create);

// usersRouter.put('/', ensureAuthenticate, usersController.update);

// usersRouter.patch(
//   '/update-pass',
//   ensureAuthenticate,
//   usersController.updatePass
// );

// usersRouter.get('/', ensureAuthenticate, usersController.list);

// usersRouter.get('/:id', ensureAuthenticate, usersController.show);
