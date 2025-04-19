import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './docs/swagger';
import { setupRoutes } from './routes';
import { HttpStatus } from './types/http-status.enum';
import { globalErrorHandler, jsonParseErrorHandler } from './utils/errorHandler';

const app: Application = express();

// Express Middlewares
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Root Route
app.get('/OPTION', (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json();
});
app.get('/', (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({ message: '歡迎使用 API！' });
});
app.get('/test', (_req, res) => {
  console.log('測試路由被呼叫');
  res.status(200).json({ status: 'ok', message: '伺服器正在運行！' });
});

//Route
setupRoutes(app);

// 錯誤處理中介軟體：捕捉 JSON 解析錯誤
app.use(jsonParseErrorHandler);
// middleware全域錯誤處理
app.use(globalErrorHandler);

export default app;
