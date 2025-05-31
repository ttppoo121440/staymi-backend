import type { Server } from 'http';

import dotenv from 'dotenv';

import App from './app';
import { env, serverUrl } from './config/env';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

let server: Server | null = null;

export function startServer(): void {
  try {
    console.log('準備啟動伺服器，PORT:', env.PORT);
    server = App.listen(env.PORT, () => {
      console.log(`🚀 Server is listening on port ${env.PORT}`);
      console.log(`Swagger Docs at ${serverUrl}/api-docs`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗：', error);
  }
}

export function closeServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!server) {
      return resolve();
    }
    server.close((err?: Error) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// 只有直接執行 server.ts 時才會啟動伺服器
if (require.main === module) {
  startServer();
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未捕捉到的 rejection：', promise, '原因：', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕捉到的異常：', error);
  console.error(error.stack);
});

export { server };
