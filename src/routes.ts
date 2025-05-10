import type { Application } from 'express';

import adminUserRoutes from './features/adminUser/adminUser.routes';
import authStoreRoutes from './features/authStore/authStore.routes';
import hotelRoomRoutes from './features/hotelRoom/hotelRoom.routes';
import imageUploadRoutes from './features/imageUpload/imageUpload.routes';
import paypalRouter from './features/paypal/paypal.routes';
import productPlanRoutes from './features/productPlan/productPlan.routes';
import roomPlanRoutes from './features/roomPlan/roomPlan.routes';
import roomTypeRoutes from './features/roomType/roomType.routes';
import storeHotelRoutes from './features/storeHotel/storeHotel.routes';
import subscriptionRoutes from './features/subscription/subscription.routes';
import userRoutes from './features/user/user.routes';
import { NotFound } from './utils/appResponse';

export const setupRoutes = (app: Application): void => {
  app.use('/api/v1/admin/users', adminUserRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/users/subscriptions', subscriptionRoutes);
  app.use('/api/v1/store/hotel/room-type', roomTypeRoutes);
  app.use('/api/v1/store/hotel/hotel-rooms', hotelRoomRoutes);
  app.use('/api/v1/store/hotel/room-plan', roomPlanRoutes);
  app.use('/api/v1/store/hotel/product-plan', productPlanRoutes);
  app.use('/api/v1/store/hotel', storeHotelRoutes);
  app.use('/api/v1/store', authStoreRoutes);
  app.use('/api/v1/upload', imageUploadRoutes);
  app.use('/api/v1/paypal', paypalRouter);
  app.all('*', NotFound);
};
