import fs from 'fs';
import path from 'path';

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, errors, label } = format;

// log格式
const logFormat = printf(({ level, message, timestamp, stack, label }) => {
  return `${timestamp} [${label}] [${level}]: ${stack || message}`;
});

// 檢查並建立 log 資料夾
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 設定 log
const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'GYMSystem' }), // 加入標籤
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    // 記錄 DEBUG 級別以上的日誌
    new transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
    }),
    // 記錄 INFO 級別以上的日誌
    new transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
    }),
    // 記錄 ERROR 級別的日誌
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    // 控制台輸出
    new transports.Console({
      format: combine(format.colorize(), logFormat),
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

export default logger;
