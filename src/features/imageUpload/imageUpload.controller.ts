import { NextFunction, Request, Response } from 'express';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import { FileUploadService } from '@/utils/services/FileUpload.service';

export class ImageUploadController {
  constructor(private fileUploadService = new FileUploadService()) {}
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        return next(appError('請上傳圖片', HttpStatus.BAD_REQUEST));
      }

      const userId: string = (req.user as JwtUserPayload).id;

      const cloudinaryUrl = await this.fileUploadService.uploadToCloudinary(req.file, userId);

      console.log('🔥 req.file:', req.file);
      console.log('🔥 cloudinaryUrl:', cloudinaryUrl);
      res.status(HttpStatus.OK).json(successResponse({ image: { url: cloudinaryUrl } }, '上傳成功'));
    } catch (err) {
      console.error('上傳錯誤:', err);
      if (err instanceof Error) {
        next(appError(err.message, HttpStatus.BAD_REQUEST));
        return;
      } else {
        next(err);
      }
    }
  }
}
