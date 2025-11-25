import { CreateAppointmentService } from '@/services/appointments/CreateAppointmentService';
import { ListAppointmentsService } from '@/services/appointments/ListAppointmentsService';
import { UpdateAppointmentService } from '@/services/appointments/UpdateAppointmentService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class AppointmentsController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const {
        car_license_plate,
        scheduled_date,
        document,
        client_id,
        service_ids,
        notes,
      } = req.body;

      const result = await CreateAppointmentService({
        enterprise_id,
        car_license_plate,
        scheduled_date: new Date(scheduled_date),
        document,
        client_id,
        service_ids,
        notes,
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
      const { page, limit, start_date, end_date, status, car_license_plate } =
        req.query;

      const result = await ListAppointmentsService({
        enterprise_id,
        page: Number(page),
        limit: Number(limit),
        start_date: start_date ? new Date(start_date as string) : undefined,
        end_date: end_date ? new Date(end_date as string) : undefined,
        status: status as 'SCHEDULED' | 'CANCELED' | 'COMPLETED' | undefined,
        car_license_plate: car_license_plate as string | undefined,
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
      const { id, scheduled_date, status, notes, service_ids } = req.body;

      const result = await UpdateAppointmentService({
        enterprise_id,
        id,
        scheduled_date: scheduled_date
          ? new Date(scheduled_date)
          : undefined,
        status,
        notes,
        service_ids,
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

