import { CreateOrderEnterpriseService } from '@/services/orders/CreateOrderEnterpriseService';
import { GetOrdersSummaryByDateService } from '@/services/orders/GetOrdersSummaryByDateService';
import { ListOrdersEnterpriseService } from '@/services/orders/ListOrdersEnterpriseService';
import { UpdateOrderEnterpriseService } from '@/services/orders/UpdateOrderEnterpriseService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class OrdersController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const {
        total_value,
        services,
        client_id,
        document,
        car_license_plate,
        payment_type,
      } = req.body;
      const result = await CreateOrderEnterpriseService({
        enterprise_id,
        total_value,
        document,
        services,
        client_id,
        car_license_plate,
        payment_type,
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
      const { year, month, day } = req.query;
      const result = await ListOrdersEnterpriseService({
        enterprise_id,
        year: Number(year),
        month: Number(month),
        day: Number(day),
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

  async dash(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { year, month, day } = req.query;
      const result = await GetOrdersSummaryByDateService({
        enterprise_id,
        year: Number(year),
        month: Number(month),
        day: Number(day),
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
      const { order_id, payment_type, status } = req.body;
      const user_id = req.user?.id as string | undefined;
      
      const result = await UpdateOrderEnterpriseService({
        enterprise_id,
        order_id,
        payment_type,
        status,
        user_id,
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
