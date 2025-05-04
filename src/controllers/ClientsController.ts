import { CreateClientEnterpriseService } from '@/services/clients/CreateClientEnterpriseService';
import { ListClientsEnterpriseService } from '@/services/clients/ListClientsEnterpriseService';
import { UpdateClientEnterpriseService } from '@/services/clients/UpdateClientEnterpriseService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class ClientsController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { name, document, phone } = req.body;

      const result = await CreateClientEnterpriseService({
        enterprise_id,
        name,
        document,
        phone,
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

  async list(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const result = await ListClientsEnterpriseService({
        enterprise_id,
      });
      return res.status(200).json(result);
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

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { id, name, document, phone } = req.body;
      const result = await UpdateClientEnterpriseService({
        enterprise_id,
        id,
        name,
        document,
        phone,
      });
      return res.status(200).json(result);
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
