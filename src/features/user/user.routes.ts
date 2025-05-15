import express from 'express';
import passport from 'passport';

import { authMiddleware } from '@/middleware/auth.middleware';
import { zodMiddleware } from '@/middleware/zodMiddleware';

import { AuthController } from '../auth/auth.controller';
import { AuthCreateSchema, AuthLoginSchema, AuthUpdatePasswordSchema } from '../auth/auth.schema';

import { UserController } from './user.controller';

const userRoutes = express.Router();
const authController = new AuthController();
const userController = new UserController();

userRoutes.get('/user-profile', authMiddleware, userController.getUserProfile);
userRoutes.put('/user-profile', authMiddleware, userController.update);
userRoutes.post('/signup', zodMiddleware({ body: AuthCreateSchema }), authController.signup);
userRoutes.post('/login', zodMiddleware({ body: AuthLoginSchema }), authController.login);
userRoutes.put(
  '/change-password',
  authMiddleware,
  zodMiddleware({ body: AuthUpdatePasswordSchema }),
  authController.changePassword,
);
userRoutes.put('/uploadAvatar', authMiddleware, userController.uploadAvatar);
userRoutes.get('/line', authController.redirectToLine);
userRoutes.get('/line/callback', authController.handleLineCallback);
userRoutes.get('/facebook', authController.redirectToFacebook);
userRoutes.get('/facebook/callback', authController.handleFacebookCallback);
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
//僅供期中考核使用
userRoutes.get('/isAuth', authMiddleware, (_, res) => {
  return res.json({
    success: true,
    message: '驗證成功!',
  });
});

export default userRoutes;
