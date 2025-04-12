import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { AuthController } from '../auth/auth.controller';

const userRoutes = express.Router();
const auth = new AuthController();

userRoutes.post('/signup', auth.signup.bind(auth));
userRoutes.post('/login', auth.login.bind(auth));
userRoutes.put('/change-password', authMiddleware, auth.changePassword.bind(auth));

export default userRoutes;
