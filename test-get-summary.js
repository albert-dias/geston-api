/**
 * Script de teste manual para GetCashSummaryService
 * 
 * Para executar:
 * 1. Certifique-se de que a API foi compilada: yarn build ou npm run build
 * 2. Execute: node test-get-summary.js [enterprise_id] [start_date] [end_date]
 * 
 * Exemplo:
 *   node test-get-summary.js 864fadfc-64b1-421c-9691-1978b50f70fb 2025-11-01T00:00:00 2025-11-30T23:59:59
 */

// Carregar variáveis de ambiente
try {
  require('dotenv').config();
} catch (e) {
  console.warn('dotenv não encontrado, usando variáveis de ambiente do sistema');
}

async function testGetSummary() {
  try {
    console.log('🚀 Iniciando teste do GetCashSummaryService...\n');

    // Verificar se dist existe
    const fs = require('fs');
    const path = require('path');
    const distPath = path.join(__dirname, 'dist');
    
    if (!fs.existsSync(distPath)) {
      console.error('❌ Erro: A pasta dist não existe. Execute "yarn build" primeiro.');
      process.exit(1);
    }

    // Importar após dotenv
    let GetCashSummaryService, prisma;
    try {
      const serviceModule = require('./dist/services/cash-movements/GetCashSummaryService.js');
      GetCashSummaryService = serviceModule.GetCashSummaryService || serviceModule.default;
      const prismaModule = require('./dist/lib/prisma.js');
      prisma = prismaModule.prisma || prismaModule.default;
    } catch (error) {
      console.error('❌ Erro ao importar módulos:', error.message);
      console.error('   Certifique-se de que executou "yarn build" e que os arquivos estão em dist/');
      process.exit(1);
    }

    // Parâmetros de teste
    const enterprise_id = process.argv[2] || '864fadfc-64b1-421c-9691-1978b50f70fb';
    const start_date = new Date(process.argv[3] || '2025-11-01T00:00:00');
    const end_date = new Date(process.argv[4] || '2025-11-30T23:59:59');

    console.log('📋 Parâmetros de teste:');
    console.log('  - enterprise_id:', enterprise_id);
    console.log('  - start_date:', start_date.toISOString());
    console.log('  - end_date:', end_date.toISOString());
    console.log('');

    // Primeiro, verificar se há movimentações no banco
    console.log('🔍 Verificando movimentações no banco...');
    const allMovements = await prisma.cashMovement.findMany({
      where: {
        enterprise_id,
      },
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    console.log(`  - Total de movimentações encontradas (primeiras 5): ${allMovements.length}`);
    if (allMovements.length > 0) {
      console.log('  - Exemplo de movimentação:');
      console.log('    ', JSON.stringify(allMovements[0], null, 2));
    }
    console.log('');

    // Verificar movimentações no período
    console.log('🔍 Verificando movimentações no período...');
    const movementsInPeriod = await prisma.cashMovement.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: start_date,
          lte: end_date,
        },
      },
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    console.log(`  - Movimentações no período: ${movementsInPeriod.length}`);
    if (movementsInPeriod.length > 0) {
      console.log('  - Exemplo de movimentação no período:');
      console.log('    ', JSON.stringify(movementsInPeriod[0], null, 2));
    }
    console.log('');

    // Executar o serviço
    console.log('▶️  Executando GetCashSummaryService...\n');
    const result = await GetCashSummaryService({
      enterprise_id,
      start_date,
      end_date,
    });

    console.log('✅ Resultado obtido:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Fechar conexão
    await prisma.$disconnect();
    console.log('✨ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:');
    console.error('  - Mensagem:', error.message);
    console.error('  - Stack:', error.stack);
    
    if (error.cause) {
      console.error('  - Cause:', error.cause);
    }

    process.exit(1);
  }
}

testGetSummary();

