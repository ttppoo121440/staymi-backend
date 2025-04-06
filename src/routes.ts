import type { Application } from 'express';

import CoachRoutes from './features/coach/coach.routes';
import courseRoutes from './features/course/course.routes';
import credit_packageRoutes from './features/credit_package/credit_package.routes';
import skillRoutes from './features/skill/skill.routes';
import userRoutes from './features/user/user.routes';
import { NotFound } from './utils/appResponse';

export const setupRoutes = (app: Application): void => {
  app.use('/api/credit_package', credit_packageRoutes);
  app.use('/api/skill', skillRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api', courseRoutes);
  app.use('/api/admin/coaches', CoachRoutes);
  app.use(NotFound);
};
