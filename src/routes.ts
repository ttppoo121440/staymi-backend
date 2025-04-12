import type { Application } from 'express';

import userRoutes from './features/user/user.routes';
import { NotFound } from './utils/appResponse';

export const setupRoutes = (app: Application): void => {
  app.use('/api/v1/users', userRoutes);
  app.all('*', NotFound);
};
