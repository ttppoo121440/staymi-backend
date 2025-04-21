import path from 'path';

import { cloudinary } from '@/libs/cloudinary';

export class FileUploadService {
  async uploadToCloudinary(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // 先驗證圖片
      const validation = this.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // 獲取檔案格式，避免所有檔案都轉為 png
      const format = file.mimetype.split('/')[1];

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `stay-mi/image/${userId}`,
          public_id: path.parse(file.originalname).name,
          format: format, // 根據原始格式保存
          transformation: [{ width: 800, height: 800, crop: 'limit' }],
        },
      );

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary 上傳錯誤:', error);
      throw new Error(error instanceof Error ? error.message : '檔案上傳失敗');
    }
  }
  validateImage(file: Express.Multer.File): { valid: boolean; message?: string } {
    // 檢查檔案類型
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return { valid: false, message: '只接受 PNG、JPEG、JPG  圖片格式' };
    }

    // 檢查檔案大小
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      return { valid: false, message: '圖片大小不能超過 1MB' };
    }

    return { valid: true };
  }
}
