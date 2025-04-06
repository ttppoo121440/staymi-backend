import dotenv from 'dotenv';

import App from './app';
import { env } from './config/env';

dotenv.config();

const server = App.listen(env.PORT, () => {
  console.log(`🚀 Server is listening on port ${env.PORT}`);
});

// 確保 Jest 測試時可以關閉伺服器
export function closeServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未捕捉到的 rejection：', promise, '原因：', reason);
});

export { server };
