import { CreateClientEnterpriseService } from '@/services/clients/CreateClientEnterpriseService';
import { ListClientsEnterpriseService } from '@/services/clients/ListClientsEnterpriseService';
import { UpdateClientEnterpriseService } from '@/services/clients/UpdateClientEnterpriseService';
import { DeleteClientEnterpriseService } from '@/services/clients/DeleteClientEnterpriseService';
import { ShowClientEnterpriseService } from '@/services/clients/ShowClientEnterpriseService';
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
        document: document || undefined,
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
      const { page, limit, search } = req.query;

      const result = await ListClientsEnterpriseService({
        enterprise_id,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
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

  async show(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id, id } = req.params;
      const result = await ShowClientEnterpriseService({
        enterprise_id,
        id,
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
        document: document || undefined,
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

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { id } = req.body;

      await DeleteClientEnterpriseService({
        enterprise_id,
        id,
      });
      return res.status(204).send();
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
