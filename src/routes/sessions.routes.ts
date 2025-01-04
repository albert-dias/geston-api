import { SessionsController } from '@/controllers/SessionsController';
import { Router } from 'express';

const sessionsController = new SessionsController();
export const sessionsRouter = Router();

sessionsRouter.post('/', sessionsController.login);

sessionsRouter.post('/refreshtoken', sessionsController.refresh_token);

sessionsRouter.post('/logout-all', sessionsController.logout_all);
