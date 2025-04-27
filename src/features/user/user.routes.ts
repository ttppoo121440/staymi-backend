import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { AuthController } from '../auth/auth.controller';

import { UserController } from './user.controller';

const userRoutes = express.Router();
const authController = new AuthController();
const userController = new UserController();

userRoutes.get('/user-profile', authMiddleware, userController.getUserProfile);
userRoutes.put('/user-profile', authMiddleware, userController.update);
userRoutes.post('/signup', authController.signup);
userRoutes.post('/login', authController.login);
userRoutes.put('/change-password', authMiddleware, authController.changePassword);
userRoutes.put('/uploadAvatar', authMiddleware, userController.uploadAvatar);
userRoutes.get('/line', authController.redirectToLine);
userRoutes.get('/line/callback', authController.handleLineCallback);

export default userRoutes;
