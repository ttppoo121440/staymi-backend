import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { db, closeDatabase } from '../src/config/database';
import { user } from '../src/database/schemas/user.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { server } from '../src/server';

process.env.NODE_ENV = 'test';
jest.setTimeout(30000);

const uniqueEmail = `testuser+${Date.now()}@example.com`;

describe('使用者資料 API', () => {
  const testUser = {
    email: uniqueEmail,
    password: 'Password123!',
    name: '測試使用者',
    phone: '0912345678',
    birthday: '2000-01-01',
    gender: 'm',
  };

  let token: string;

  beforeAll(async () => {
    // 清除資料
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    // 註冊帳號
    await request(app).post('/api/v1/users/signup').send(testUser);

    // 登入取得 token
    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    await closeDatabase();
    if (server) server.close();
  });

  describe('GET /api/v1/users/user-profile', () => {
    it('成功取得使用者個人資料', async () => {
      const res = await request(app).get('/api/v1/users/user-profile').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
      expect(res.body.data.user).toHaveProperty('name', testUser.name);
    });

    it('未提供 token 應該回傳 401', async () => {
      const res = await request(app).get('/api/v1/users/user-profile');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/user-profile', () => {
    it('成功更新使用者個人資料', async () => {
      const updateData = {
        name: '新的名字',
        phone: '0987654321',
        birthday: '1995-05-05',
        avatar: 'https://example.com/avatar.jpg',
        gender: 'f',
      };

      const res = await request(app)
        .put('/api/v1/users/user-profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe(updateData.name);
      expect(res.body.data.user.phone).toBe(updateData.phone);
    });

    it('未提供 token 更新應該失敗', async () => {
      const res = await request(app).put('/api/v1/users/user-profile').send({
        name: '誰都不是',
        phone: '0000000000',
        birthday: '1990-01-01',
        avatar: '',
        gender: 'm',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('送出不合法的資料應該失敗 (Zod 驗證)', async () => {
      const res = await request(app).put('/api/v1/users/user-profile').set('Authorization', `Bearer ${token}`).send({
        name: '', // 不可為空
        phone: 'abc', // 不合法電話
        birthday: 'invalid-date',
        gender: 'x', // gender 應該是 'm' 或 'f'
      });
      console.log('送出不合法的資料應該失敗 (Zod 驗證) res.body.message:', res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
      const errorMessage = res.body.message;
      expect(errorMessage).toContain('名字至少2個字');
    });

    it('送出空物件應該失敗', async () => {
      const res = await request(app).put('/api/v1/users/user-profile').set('Authorization', `Bearer ${token}`).send({});
      console.log('送出空物件應該失敗 res.body.message:', res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
      const errorMessage = res.body.message;
      expect(errorMessage).toContain('請輸入名字');
    });
  });
});
