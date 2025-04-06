import express from 'express';

import { authMiddleware } from '@/middleware/auth.middleware';

import { UserController } from './user.controller';

const userRoutes = express.Router();
const userController = new UserController();

userRoutes.get('/', userController.getAll.bind(userController));
userRoutes.post('/signup', (req, res) => userController.create(req, res));
userRoutes.post('/login', (req, res) => userController.login(req, res));
userRoutes.get('/profile', authMiddleware, (req, res) => userController.getById(req, res));

export default userRoutes;
