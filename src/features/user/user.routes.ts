import express from 'express';
import passport from 'passport';

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
userRoutes.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);
userRoutes.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false, // 不使用 session
  }),
  authController.googleCallback,
);

export default userRoutes;
