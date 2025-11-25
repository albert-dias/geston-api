import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';
import { CashMovementType, CashMovement } from '@prisma/client';

interface IRequest {
  enterprise_id: string;
  start_date: Date;
  end_date: Date;
}

interface CashSummary {
  total_entries: number;
  total_exits: number;
  balance: number;
  movements: {
    entries: Array<{
      id: string;
      amount: number;
      description: string;
      created_at: Date;
      type: CashMovementType;
    }>;
    exits: Array<{
      id: string;
      amount: number;
      description: string;
      created_at: Date;
      type: CashMovementType;
    }>;
  };
}

export async function GetCashSummaryService({
  enterprise_id,
  start_date,
  end_date,
}: IRequest): Promise<CashSummary> {
  console.log('[GetCashSummaryService] Iniciando com:', {
    enterprise_id,
    start_date,
    end_date,
  });

  if (!enterprise_id || !start_date || !end_date) {
    console.error('[GetCashSummaryService] Dados incompletos:', {
      enterprise_id: !!enterprise_id,
      start_date: !!start_date,
      end_date: !!end_date,
    });
    throw AppError.badRequest('Dados incompletos');
  }

  if (start_date > end_date) {
    console.error('[GetCashSummaryService] Data inicial maior que final');
    throw AppError.badRequest('Data inicial não pode ser maior que data final');
  }

  // Buscar todas as movimentações do período
  let movements: CashMovement[];

  try {
    console.log('[GetCashSummaryService] Buscando movimentações no banco...');
    const result = await prisma.cashMovement.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: start_date,
          lte: end_date,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    console.log('[GetCashSummaryService] Resultado da query:', {
      count: result?.length || 0,
      isArray: Array.isArray(result),
      type: typeof result,
      firstItem: result?.[0] || null,
    });

    // Garantir que movements é sempre um array válido
    movements = Array.isArray(result) ? result : [];
    console.log('[GetCashSummaryService] Movements após validação:', {
      count: movements.length,
      isArray: Array.isArray(movements),
    });
  } catch (error: any) {
    console.error('[GetCashSummaryService] Erro ao buscar movimentações:', error);
    console.error('[GetCashSummaryService] Erro detalhado:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    });
    throw AppError.internal(`Erro ao buscar movimentações de caixa: ${error?.message || 'Erro desconhecido'}`);
  }

  // Validação adicional
  if (!Array.isArray(movements)) {
    console.error('[GetCashSummaryService] Movements não é um array:', {
      type: typeof movements,
      value: movements,
    });
    movements = [];
  }

  // Separar entradas e saídas com validação robusta
  const entries: Array<{
    id: string;
    amount: number;
    description: string;
    created_at: Date;
    type: CashMovementType;
  }> = [];

  const exits: Array<{
    id: string;
    amount: number;
    description: string;
    created_at: Date;
    type: CashMovementType;
  }> = [];

  console.log('[GetCashSummaryService] Processando movimentações:', movements.length);

  for (const m of movements) {
    try {
      if (!m || !m.id || typeof m.amount !== 'number' || !m.description || !m.created_at || !m.type) {
        console.warn('[GetCashSummaryService] Movimentação inválida ignorada:', {
          hasM: !!m,
          hasId: !!m?.id,
          hasAmount: typeof m?.amount,
          hasDescription: !!m?.description,
          hasCreatedAt: !!m?.created_at,
          hasType: !!m?.type,
          m,
        });
        continue;
      }

      const movement = {
        id: m.id,
        amount: m.amount,
        description: m.description,
        created_at: m.created_at,
        type: m.type as CashMovementType,
      };

      if (m.type === 'ENTRY') {
        entries.push(movement);
      } else if (m.type === 'EXIT') {
        exits.push(movement);
      }
    } catch (err: any) {
      console.error('[GetCashSummaryService] Erro ao processar movimentação:', {
        error: err?.message,
        movement: m,
      });
    }
  }

  console.log('[GetCashSummaryService] Resultado do processamento:', {
    entries: entries.length,
    exits: exits.length,
  });

  // Calcular totais - garantir que entries e exits sejam arrays
  const entriesArray = Array.isArray(entries) ? entries : [];
  const exitsArray = Array.isArray(exits) ? exits : [];

  const total_entries = entriesArray.reduce((sum, m) => {
    if (!m || typeof m.amount !== 'number') return sum;
    return sum + m.amount;
  }, 0);

  const total_exits = exitsArray.reduce((sum, m) => {
    if (!m || typeof m.amount !== 'number') return sum;
    return sum + m.amount;
  }, 0);

  const balance = total_entries - total_exits;

  const result = {
    total_entries,
    total_exits,
    balance,
    movements: {
      entries: entriesArray,
      exits: exitsArray,
    },
  };

  console.log('[GetCashSummaryService] Resultado final:', {
    total_entries,
    total_exits,
    balance,
    entriesCount: entriesArray.length,
    exitsCount: exitsArray.length,
  });

  return result;
}

