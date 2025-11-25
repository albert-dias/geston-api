import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import routes from '@/routes';
import { errorHandler } from '@/middlewares/errorHandler';
import { swaggerSpec } from '@/config/swagger';
import socketio from 'socket.io';
import { createServer } from 'http';

const app = express();

const httpServer = createServer(app);
const io = new socketio.Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true,
  },
});

// Segurança
app.use(helmet());

// CORS configurado de forma mais segura
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP no período
  message: 'Muitas requisições deste IP, tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting mais restritivo para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login por IP no período
  message: 'Muitas tentativas de login, tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/sessions', authLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Documentação da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(routes);

// Middleware global de tratamento de erros (deve ser o último)
app.use(errorHandler);

io.sockets.on('connection', function (socket) {
  console.log('new connect. socket' + socket.id);

  socket.on('customerEnterInLine', async function (data: any) {
    // const result = await CreateOrderService(data);
    // io.sockets.emit('pedidoSolicitado', result);
  });

  socket.on('statusDoPedidoMudou', async function (data: any) {
    // const result = await UpdateStatusOrderService({
    //   order_id: data.order_id,
    //   enterprise_id: data.enterprise_id,
    //   status: data.status,
    // });
    // io.sockets.emit('statusPedido', result);
  });
});

httpServer.listen(3338, () => console.log('🚘 - Api is only port: 3338'));
