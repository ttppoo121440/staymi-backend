import type { Application } from 'express';

import adminUserRoutes from './features/adminUser/adminUser.routes';
import authStoreRoutes from './features/authStore/authStore.routes';
import imageUploadRoutes from './features/imageUpload/imageUpload.routes';
import storeHotelRoutes from './features/storeHotel/storeHotel.routes';
import userRoutes from './features/user/user.routes';
import { NotFound } from './utils/appResponse';

export const setupRoutes = (app: Application): void => {
  app.use('/api/v1/admin/users', adminUserRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/store/hotel', storeHotelRoutes);
  app.use('/api/v1/store', authStoreRoutes);
  app.use('/api/v1/upload', imageUploadRoutes);
  app.all('*', NotFound);
};
