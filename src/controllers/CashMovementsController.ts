import { CreateCashMovementService } from '@/services/cash-movements/CreateCashMovementService';
import { GetCashSummaryService } from '@/services/cash-movements/GetCashSummaryService';
import { AppError } from '@/utils/AppError';
import { Request, Response } from 'express';

export class CashMovementsController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { enterprise_id } = req.params;
      const { type, amount, description, order_id, employee_id } = req.body;
      const user_id = req.user?.id as string | undefined;

      if (!user_id) {
        throw AppError.unauthorized('Usuário não autenticado');
      }

      const result = await CreateCashMovementService({
        enterprise_id,
        type,
        amount,
        description,
        order_id,
        employee_id,
        created_by: user_id,
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

  async getSummary(req: Request, res: Response): Promise<Response> {
    console.log('[CashMovementsController.getSummary] Requisição recebida:', {
      enterprise_id: req.params?.enterprise_id,
      start_date: req.query?.start_date,
      end_date: req.query?.end_date,
      query: req.query,
      params: req.params,
    });

    try {
      const { enterprise_id } = req.params;
      const { start_date, end_date } = req.query;

      console.log('[CashMovementsController.getSummary] Parâmetros extraídos:', {
        enterprise_id,
        start_date,
        end_date,
      });

      if (!start_date || !end_date) {
        console.error('[CashMovementsController.getSummary] Datas faltando');
        throw AppError.badRequest('Data inicial e final são obrigatórias');
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);

      console.log('[CashMovementsController.getSummary] Datas convertidas:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateValid: !isNaN(startDate.getTime()),
        endDateValid: !isNaN(endDate.getTime()),
      });

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('[CashMovementsController.getSummary] Datas inválidas');
        throw AppError.badRequest('Datas inválidas');
      }

      console.log('[CashMovementsController.getSummary] Chamando GetCashSummaryService...');
      const result = await GetCashSummaryService({
        enterprise_id,
        start_date: startDate,
        end_date: endDate,
      });

      console.log('[CashMovementsController.getSummary] Resultado obtido:', {
        total_entries: result.total_entries,
        total_exits: result.total_exits,
        balance: result.balance,
        entriesCount: result.movements?.entries?.length || 0,
        exitsCount: result.movements?.exits?.length || 0,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[CashMovementsController.getSummary] Erro capturado:', {
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        isAppError: err instanceof AppError,
        statusCode: err instanceof AppError ? err.statusCode : undefined,
      });

      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: 'error',
          message: err.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: err?.message || 'Erro interno do servidor'
      });
    }
  }
}

