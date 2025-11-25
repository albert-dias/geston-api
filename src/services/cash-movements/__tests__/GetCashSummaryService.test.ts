import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCashSummaryService } from '../GetCashSummaryService';
import { AppError } from '@/utils/AppError';
import { prisma } from '@/lib/prisma';

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    cashMovement: {
      findMany: vi.fn(),
    },
  },
}));

describe('GetCashSummaryService', () => {
  const mockEnterpriseId = '864fadfc-64b1-421c-9691-1978b50f70fb';
  const mockStartDate = new Date('2025-11-01T00:00:00');
  const mockEndDate = new Date('2025-11-30T23:59:59');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar erro se enterprise_id não for fornecido', async () => {
    await expect(
      GetCashSummaryService({
        enterprise_id: '',
        start_date: mockStartDate,
        end_date: mockEndDate,
      })
    ).rejects.toThrow(AppError);
  });

  it('deve retornar erro se datas não forem fornecidas', async () => {
    await expect(
      GetCashSummaryService({
        enterprise_id: mockEnterpriseId,
        start_date: null as any,
        end_date: mockEndDate,
      })
    ).rejects.toThrow(AppError);
  });

  it('deve retornar erro se data inicial for maior que data final', async () => {
    await expect(
      GetCashSummaryService({
        enterprise_id: mockEnterpriseId,
        start_date: mockEndDate,
        end_date: mockStartDate,
      })
    ).rejects.toThrow(AppError);
  });

  it('deve retornar estrutura vazia quando não há movimentações', async () => {
    (prisma.cashMovement.findMany as any).mockResolvedValue([]);

    const result = await GetCashSummaryService({
      enterprise_id: mockEnterpriseId,
      start_date: mockStartDate,
      end_date: mockEndDate,
    });

    expect(result).toEqual({
      total_entries: 0,
      total_exits: 0,
      balance: 0,
      movements: {
        entries: [],
        exits: [],
      },
    });
  });

  it('deve separar corretamente entradas e saídas', async () => {
    const mockMovements = [
      {
        id: '1',
        type: 'ENTRY',
        amount: 10000, // R$ 100,00 em centavos
        description: 'Entrada teste',
        created_at: new Date('2025-11-15T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
      {
        id: '2',
        type: 'EXIT',
        amount: 5000, // R$ 50,00 em centavos
        description: 'Saída teste',
        created_at: new Date('2025-11-16T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
    ];

    (prisma.cashMovement.findMany as any).mockResolvedValue(mockMovements);

    const result = await GetCashSummaryService({
      enterprise_id: mockEnterpriseId,
      start_date: mockStartDate,
      end_date: mockEndDate,
    });

    expect(result.total_entries).toBe(10000);
    expect(result.total_exits).toBe(5000);
    expect(result.balance).toBe(5000);
    expect(result.movements.entries).toHaveLength(1);
    expect(result.movements.exits).toHaveLength(1);
    expect(result.movements.entries[0].type).toBe('ENTRY');
    expect(result.movements.exits[0].type).toBe('EXIT');
  });

  it('deve calcular totais corretamente com múltiplas movimentações', async () => {
    const mockMovements = [
      {
        id: '1',
        type: 'ENTRY',
        amount: 10000,
        description: 'Entrada 1',
        created_at: new Date('2025-11-15T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
      {
        id: '2',
        type: 'ENTRY',
        amount: 20000,
        description: 'Entrada 2',
        created_at: new Date('2025-11-16T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
      {
        id: '3',
        type: 'EXIT',
        amount: 5000,
        description: 'Saída 1',
        created_at: new Date('2025-11-17T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
    ];

    (prisma.cashMovement.findMany as any).mockResolvedValue(mockMovements);

    const result = await GetCashSummaryService({
      enterprise_id: mockEnterpriseId,
      start_date: mockStartDate,
      end_date: mockEndDate,
    });

    expect(result.total_entries).toBe(30000);
    expect(result.total_exits).toBe(5000);
    expect(result.balance).toBe(25000);
  });

  it('deve ignorar movimentações inválidas', async () => {
    const mockMovements = [
      {
        id: '1',
        type: 'ENTRY',
        amount: 10000,
        description: 'Entrada válida',
        created_at: new Date('2025-11-15T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      },
      {
        // Movimentação inválida - sem id
        type: 'ENTRY',
        amount: 5000,
        description: 'Entrada inválida',
        created_at: new Date('2025-11-16T10:00:00'),
        enterprise_id: mockEnterpriseId,
        order_id: null,
        employee_id: null,
        created_by: 'user-1',
      } as any,
    ];

    (prisma.cashMovement.findMany as any).mockResolvedValue(mockMovements);

    const result = await GetCashSummaryService({
      enterprise_id: mockEnterpriseId,
      start_date: mockStartDate,
      end_date: mockEndDate,
    });

    expect(result.movements.entries).toHaveLength(1);
    expect(result.total_entries).toBe(10000);
  });

  it('deve chamar prisma com os parâmetros corretos', async () => {
    (prisma.cashMovement.findMany as any).mockResolvedValue([]);

    await GetCashSummaryService({
      enterprise_id: mockEnterpriseId,
      start_date: mockStartDate,
      end_date: mockEndDate,
    });

    expect(prisma.cashMovement.findMany).toHaveBeenCalledWith({
      where: {
        enterprise_id: mockEnterpriseId,
        created_at: {
          gte: mockStartDate,
          lte: mockEndDate,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  });
});

