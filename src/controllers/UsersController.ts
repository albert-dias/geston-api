import { CreateUserService } from '@/services/user/CreateUserService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class UsersController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, document, CNPJ, password, email, sector, user_type } =
        req.body;
      const result = await CreateUserService({
        name,
        password,
        email,
        user_type,
      });
      return res.status(201).json(result);
    } catch (err: any) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(400).json({ error: err.message });
    }
  }
  // async update(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id, name, document, CNPJ, email, sector, user_type } = req.body;
  //     const result = await UpdateUserService({
  //       id,
  //       name,
  //       document,
  //       CNPJ,
  //       email,
  //       sector,
  //       user_type,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async updatePass(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id, old_password, new_password } = req.body;
  //     const result = await UpdatePassUserService({
  //       id,
  //       old_password,
  //       new_password,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async list(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const result = await ListUserService();
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async show(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id } = req.params;
  //     const result = await ShowUserService({
  //       id,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
}
