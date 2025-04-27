import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import '../src/libs/day';
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
    it('成功取得使用者個人資料 200', async () => {
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
    it('成功更新使用者個人資料 200', async () => {
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
      console.log('成功更新使用者個人資料 res.body:', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe(updateData.name);
      expect(res.body.data.user.phone).toBe(updateData.phone);
    });

    it('未提供 token 更新應該失敗 401', async () => {
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

    it('送出不合法的資料應該失敗 (Zod 驗證) 400', async () => {
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

    it('送出空物件應該失敗 400', async () => {
      const res = await request(app).put('/api/v1/users/user-profile').set('Authorization', `Bearer ${token}`).send({});
      console.log('送出空物件應該失敗 res.body.message:', res.body.message);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
      const errorMessage = res.body.message;
      expect(errorMessage).toContain('請輸入名字');
    });
  });

  describe('PUT /api/v1/users/uploadAvatar', () => {
    let token: string;

    beforeAll(async () => {
      // 註冊帳號
      await request(app).post('/api/v1/users/signup').send(testUser);

      // 登入取得 token
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      token = loginRes.body.data.token;
    });

    it('應該成功上傳 LOGO 200', async () => {
      const avatar_url =
        'https://res.cloudinary.com/dwq2ehew4/image/upload/v1745209931/stay-mi/image/b38ba5df-3cc5-43d9-bcad-87a57954d7fc/pexels-photo-13180141.jpg';
      const res = await request(app)
        .put('/api/v1/users/uploadAvatar')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatar: avatar_url });

      console.log('應該成功上傳 avatar:', res.body);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('更新成功');
      expect(res.body.data.user.avatar).toBe(avatar_url);
    });

    it('缺少 avatar URL 應回傳 400', async () => {
      const res = await request(app).put('/api/v1/users/uploadAvatar').set('Authorization', `Bearer ${token}`).send({});

      console.log('缺少 avatar URL 的回傳:', res.body);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('請上傳圖片');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app)
        .put('/api/v1/users/uploadAvatar')
        .send({ logo_url: 'https://example.com/logo.png' });

      console.log('未登入的回傳:', res.body);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('未登入或 token 失效');
    });
  });
});
