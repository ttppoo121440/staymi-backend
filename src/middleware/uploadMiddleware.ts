import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { memUpload } from '@/config/multerConfig';
import { HttpStatus } from '@/types/http-status.enum';
import { appError } from '@/utils/appError';

export const handleFileUpload = (fieldName = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    memUpload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Multer 錯誤處理
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(appError('圖片大小不能超過 1MB', HttpStatus.BAD_REQUEST));
          }
        }
        // 其他錯誤，例如檔案格式錯誤
        return next(appError('只接受 jpg、jpeg、png 格式的圖片', HttpStatus.BAD_REQUEST));
      }
      next();
    });
  };
};
