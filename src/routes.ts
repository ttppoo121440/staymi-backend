import type { Application } from 'express';

import adminUserRoutes from './features/adminUser/adminUser.routes';
import userRoutes from './features/user/user.routes';
import { NotFound } from './utils/appResponse';

export const setupRoutes = (app: Application): void => {
  app.use('/api/v1/admin/users', adminUserRoutes);
  app.use('/api/v1/users', userRoutes);
  app.all('*', NotFound);
};
