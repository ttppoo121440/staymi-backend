import { Request } from 'express';
import multer from 'multer';

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  // 設定允許的檔案類型
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // 接受此檔案
  } else {
    cb(new Error('只接受 PNG、JPEG、JPG 圖片格式') as unknown as null, false); // 拒絕此檔案
  }
};

// 設定 Multer
export const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB 大小限制
  },
  fileFilter: fileFilter,
});
