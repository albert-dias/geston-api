import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from '@/routes';
import { AppError } from '@/utils/AppError';
import { createServer } from 'http';
import bodyParser from 'body-parser';
import { AxiosError } from 'axios';

const app = express();

const httpServer = createServer(app);

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use(routes);

app.use((err: AxiosError, req: Request, res: any, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: `Internal server error: ${err.message}'`,
  });
});

// io.sockets.on('connection', function (socket) {
//   console.log('new connect. socket' + socket.id);

//   socket.on('clienteSolicitouPedido', async function (data: IOrderRequest) {
//     const result = await CreateOrderService(data);

//     io.sockets.emit('pedidoSolicitado', result);
//   });

//   socket.on('statusDoPedidoMudou', async function (data: IOrderStatusRequest) {
//     const result = await UpdateStatusOrderService({
//       order_id: data.order_id,
//       enterprise_id: data.enterprise_id,
//       status: data.status,
//     });
//     io.sockets.emit('statusPedido', result);
//   });
// });

httpServer.listen(3340, () => console.log('Api is only port: 3340'));
