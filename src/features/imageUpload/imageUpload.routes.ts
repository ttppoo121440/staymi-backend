import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { handleFileUpload } from '@/middleware/uploadMiddleware';

import { ImageUploadController } from './imageUpload.controller';

const imageUploadRoutes = express.Router();
const imageUploadController = new ImageUploadController();

imageUploadRoutes.post('/', authMiddleware, handleFileUpload('file'), imageUploadController.upload);

export default imageUploadRoutes;
