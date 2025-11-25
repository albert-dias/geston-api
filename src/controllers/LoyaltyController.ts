import { CreateLoyaltyProgramService } from '@/services/loyalty/CreateLoyaltyProgramService';
import { GetLoyaltyProgramService } from '@/services/loyalty/GetLoyaltyProgramService';
import { UpdateLoyaltyProgramService } from '@/services/loyalty/UpdateLoyaltyProgramService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class LoyaltyController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { points_per_order, discount_per_point } = req.body;

      const result = await CreateLoyaltyProgramService({
        enterprise_id,
        points_per_order,
        discount_per_point,
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

  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;

      const result = await GetLoyaltyProgramService({
        enterprise_id,
      });

      if (!result) {
        return res.status(404).json({
          status: 'error',
          message: 'Programa de fidelidade não encontrado',
        });
      }

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
      const { points_per_order, discount_per_point, active } = req.body;

      const result = await UpdateLoyaltyProgramService({
        enterprise_id,
        points_per_order,
        discount_per_point,
        active,
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
}

