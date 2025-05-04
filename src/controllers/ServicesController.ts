import { CreateServiceEnterpriseService } from '@/services/services/CreateServiceEnterpriseService';
import { ListServicesEnterpriseService } from '@/services/services/ListServicesEnterpriseService';
import { UpdateServiceEnterpriseService } from '@/services/services/UpdateServiceEnterpriseService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class ServicesController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { name, value, stock_quantity } = req.body;
      const result = await CreateServiceEnterpriseService({
        enterprise_id,
        name,
        value,
        stock_quantity,
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
      const result = await ListServicesEnterpriseService({
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
      const { id, name, value, stock_quantity } = req.body;
      const result = await UpdateServiceEnterpriseService({
        enterprise_id,
        id,
        name,
        value,
        stock_quantity,
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
