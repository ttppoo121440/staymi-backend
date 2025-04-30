import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { HttpStatus } from '@/types/http-status.enum';
import { JwtUserPayload } from '@/types/JwtUserPayload';
import { appError } from '@/utils/appError';
import { successResponse } from '@/utils/appResponse';
import { FileUploadService } from '@/utils/services/FileUpload.service';

export class ImageUploadController {
  constructor(private fileUploadService = new FileUploadService()) {}
  upload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(appError('請上傳圖片', HttpStatus.BAD_REQUEST));
    }

    const userId: string = (req.user as JwtUserPayload).id;
    const result = await this.fileUploadService.uploadToCloudinary(req.file, userId);

    console.log('🔥 req.file:', req.file);
    console.log('🔥 cloudinaryUrl:', result);
    res.status(HttpStatus.OK).json(successResponse({ image: { url: result } }, '上傳成功'));
  });
}
