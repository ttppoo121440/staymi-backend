import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';
import { checkCoachMiddleware } from '@/middleware/checkCoach.middleware';

import { Course_bookingController } from '../course_booking/course_booking.controller';

import { CourseController } from './course.controller';

const courseRoutes = express.Router();
const courseController = new CourseController();
const course_bookingController = new Course_bookingController();

courseRoutes.get('/admin/coaches/courses', courseController.adminGetAll.bind(courseController));
courseRoutes.post('/admin/coaches/courses', authMiddleware, checkCoachMiddleware, (req, res) =>
  courseController.adminCreate(req, res),
);
courseRoutes.put('/admin/coaches/courses/:id', authMiddleware, checkCoachMiddleware, (req, res) =>
  courseController.adminUpdate(req, res),
);
courseRoutes.get('/courses', course_bookingController.getAll.bind(course_bookingController));
courseRoutes.post('/courses/:id', (req, res) => course_bookingController.create(req, res));
courseRoutes.delete('/courses/:id', (req, res) => course_bookingController.delete(req, res));

export default courseRoutes;
