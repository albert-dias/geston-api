import { CreateEmployeeService } from '@/services/employees/CreateEmployeeService';
import { ListEmployeesService } from '@/services/employees/ListEmployeesService';
import { UpdateEmployeeService } from '@/services/employees/UpdateEmployeeService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class EmployeesController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { name, document, phone, email, role, commission_rate } = req.body;

      const result = await CreateEmployeeService({
        enterprise_id,
        name,
        document,
        phone,
        email,
        role,
        commission_rate,
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
      const { page, limit, status, role, search } = req.query;

      const result = await ListEmployeesService({
        enterprise_id,
        page: Number(page),
        limit: Number(limit),
        status: status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | undefined,
        role: role as 'LAVADOR' | 'ATENDENTE' | 'GERENTE' | undefined,
        search: search as string | undefined,
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
      const {
        id,
        name,
        document,
        phone,
        email,
        role,
        commission_rate,
        status,
      } = req.body;

      const result = await UpdateEmployeeService({
        enterprise_id,
        id,
        name,
        document,
        phone,
        email,
        role,
        commission_rate,
        status,
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

