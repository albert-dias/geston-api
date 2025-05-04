import { CreateEnterpriseService } from '@/services/user/CreateEnterpriseService';
import { CreateUserService } from '@/services/user/CreateUserService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class UsersController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        document,
        phone,
        name,
        email,
        password,
        company_name,
        fantasy_name,
        document_enterprise,
        status,
        address,
        number,
        city,
        state,
        lat,
        long,
        zip_code,
        region,
      } = req.body;

      const result = await CreateEnterpriseService({
        zip_code,
        region,
        document,
        phone,
        name,
        email,
        password,
        company_name,
        fantasy_name,
        document_enterprise,
        status,
        address,
        number,
        city,
        state,
        lat,
        long,
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

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { document, phone, name, email, password } = req.body;
      const result = await CreateUserService({
        document,
        phone,
        name,
        email,
        password,
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
