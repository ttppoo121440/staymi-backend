import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { user } from '../src/database/schemas/user.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { server } from '../src/server';

jest.setTimeout(30000);
describe('測試 Auth API', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'Password123!',
    name: '測試使用者',
    phone: '0912345678',
    birthday: '2000-01-01',
    gender: 'm',
  };

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 先查出使用者（如果存在的話）
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    const existingUser = existingUsers[0];

    if (existingUsers.length > 0) {
      // 先刪除 user_profile（有外鍵關聯）
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      console.log(`Deleted user_profile for user ${existingUser.id}`);
      // 再刪除 user
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      console.log(`Deleted user ${existingUser.id}`);
    }
  });

  afterAll(async () => {
    // 無論 createdUser 是否存在，都嘗試清理可能的測試用戶
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      console.log(`在 afterAll 中清理了用戶 ${existingUser.id}`);
    }

    await closeDatabase();
    if (server) {
      server.close();
    }
  });

  describe('POST /api/v1/users/signup', () => {
    it('測試註冊使用者 201', async () => {
      const res = await request(app).post('/api/v1/users/signup').send(testUser);
      console.log('註冊 API 回傳:', res.body);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.name).toBe(testUser.name);

      // 註冊成功後使用註冊的資訊自動登入
      const loginRes = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined(); // 應該返回 token
      expect(loginRes.body.data.user.name).toBe(testUser.name); // 檢查登入回傳的使用者資料
    });

    it('重複註冊應該回傳錯誤 409', async () => {
      const res = await request(app).post('/api/v1/users/signup').send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('信箱格式錯誤應回傳 400', async () => {
      const res = await request(app)
        .post('/api/v1/users/signup')
        .send({
          ...testUser,
          email: 'invalid-email',
        });
      console.log('信箱格式錯誤的回傳:', res.body);
      expect(res.statusCode).toBe(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('信箱格式錯誤');
    });

    it('缺少必填欄位應回傳 400', async () => {
      const res = await request(app).post('/api/v1/users/signup').send({
        email: 'example@gmail.com',
        password: '12345678',
        // 少了 name、birthday、phone...等
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請輸入名字');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('成功登入 200', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      console.log('登入 API 回傳:', res.body);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe(testUser.name);
    });

    it('密碼錯誤應該登入失敗 401', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('密碼錯誤');
    });

    it('帳號不存在應該登入失敗 404', async () => {
      const res = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'nonexistent@example.com', password: 'any11111' });
      console.log('帳號不存在的回傳:', res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('用戶不存在');
    });
  });

  describe('PUT /api/v1/users/change-password', () => {
    let token: string;
    beforeAll(async () => {
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      token = loginRes.body.data.token;
      console.log('登入後獲取的 token:', token);
    });

    it('成功更改密碼 200', async () => {
      const res = await request(app).put('/api/v1/users/change-password').set('Authorization', `Bearer ${token}`).send({
        oldPassword: testUser.password,
        newPassword: 'NewPassword123!',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('密碼已更新');

      const loginWithNewPassword = await request(app).post('/api/v1/users/login').send({
        email: testUser.email,
        password: 'NewPassword123!',
      });

      expect(loginWithNewPassword.statusCode).toBe(200);
      expect(loginWithNewPassword.body.success).toBe(true);
      expect(loginWithNewPassword.body.data.token).toBeDefined();
      testUser.password = 'NewPassword123!';
    });

    it('新密碼和舊密碼相同應該回傳錯誤 400', async () => {
      const res = await request(app).put('/api/v1/users/change-password').set('Authorization', `Bearer ${token}`).send({
        oldPassword: testUser.password,
        newPassword: testUser.password,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('新密碼不能與舊密碼相同');
    });

    it('未提供 token 應該回傳錯誤 401', async () => {
      const res = await request(app).put('/api/v1/users/change-password').send({
        oldPassword: testUser.password,
        newPassword: 'AnotherNewPassword123!',
      });
      console.log('未提供 token 的回傳:', res.body);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });
  });
});
