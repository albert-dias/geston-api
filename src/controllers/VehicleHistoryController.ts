import { GetVehicleHistoryService } from '@/services/vehicle-history/GetVehicleHistoryService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class VehicleHistoryController {
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id, car_license_plate } = req.params;
      const { page, limit, start_date, end_date } = req.query;

      const result = await GetVehicleHistoryService({
        enterprise_id,
        car_license_plate,
        page: Number(page),
        limit: Number(limit),
        start_date: start_date ? new Date(start_date as string) : undefined,
        end_date: end_date ? new Date(end_date as string) : undefined,
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

