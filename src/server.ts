import dotenv from 'dotenv';

import App from './app';
import { env } from './config/env';

dotenv.config();

const server = (() => {
  try {
    console.log('準備啟動伺服器，PORT:', env.PORT);
    return App.listen(env.PORT, () => {
      console.log(`🚀 Server is listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('伺服器啟動失敗：', error);
    // 返回一個空的伺服器物件或 null
    return null;
  }
})();

// 確保 Jest 測試時可以關閉伺服器
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

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未捕捉到的 rejection：', promise, '原因：', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕捉到的異常：', error);
  console.error(error.stack);
});

export { server };
