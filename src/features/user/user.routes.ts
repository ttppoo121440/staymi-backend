import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { AuthController } from '../auth/auth.controller';

import { UserController } from './user.controller';

const userRoutes = express.Router();
const authController = new AuthController();
const userController = new UserController();

userRoutes.get('/user-profile', authMiddleware, userController.getUserProfile.bind(userController));
userRoutes.put('/user-profile', authMiddleware, userController.update.bind(userController));
userRoutes.post('/signup', authController.signup.bind(authController));
userRoutes.post('/login', authController.login.bind(authController));
userRoutes.put('/change-password', authMiddleware, authController.changePassword.bind(authController));
userRoutes.get('/line', authController.redirectToLine.bind(authController));
userRoutes.get('/line/callback', authController.handleLineCallback.bind(authController));

export default userRoutes;
