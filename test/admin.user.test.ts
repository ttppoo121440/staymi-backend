import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import '../src/libs/day';
import app from '../src/app';
import { db, closeDatabase } from '../src/config/database';
import { user } from '../src/database/schemas/user.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { Role } from '../src/features/auth/auth.schema';
import { server } from '../src/server';

process.env.NODE_ENV = 'test';
jest.setTimeout(30000);

const uniqueEmail = `admin+${Date.now()}@example.com`;

describe('後台 - 使用者查詢 API', () => {
  const adminUser = {
    email: uniqueEmail,
    password: 'Admin123!',
    name: '後台管理員',
    phone: '0988888888',
    birthday: '1990-12-31',
    gender: 'f',
  };

  let token: string;

  beforeAll(async () => {
    // 先刪除舊資料（若存在）
    const existingUsers = await db.select().from(user).where(eq(user.email, adminUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    // 將所有使用者的 is_blacklisted 欄位設為 false
    await db.update(user).set({ is_blacklisted: false }).where(eq(user.is_blacklisted, true)).execute();

    // 註冊並強制更新為 admin 權限
    await request(app).post('/api/v1/users/signup').send(adminUser);
    const newUser = await db.select().from(user).where(eq(user.email, adminUser.email));
    if (newUser.length > 0) {
      await db.update(user).set({ role: 'admin' }).where(eq(user.email, adminUser.email)).execute();
    }

    // 確保 user_profile 存在
    if (newUser.length > 0) {
      const userId = newUser[0].id;
      await db
        .insert(user_profile)
        .values({
          user_id: userId,
          name: adminUser.name,
          phone: adminUser.phone,
          birthday: new Date(adminUser.birthday),
          gender: adminUser.gender as 'f' | 'm',
        })
        .execute();
    }

    // 登入
    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, adminUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    await closeDatabase();
    if (server) server.close();
  });

  describe('GET /api/v1/admin/users', () => {
    it('成功取得所有使用者列表 200', async () => {
      const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('使用 email 篩選查詢 200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .query({ email: adminUser.email })
        .set('Authorization', `Bearer ${token}`);

      console.log('查詢結果:', res.body);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const users = res.body.data.users;
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users[0].email).toBe(adminUser.email);
    });

    it('查詢黑名單用戶（應該為空）200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?is_blacklisted=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBe(0);
    });

    it('未提供 Token 應回傳 401', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('非 admin 權限應被拒絕（模擬 consumer 登入）403', async () => {
      const consumerEmail = `consumer+${Date.now()}@example.com`;
      const consumerUser = {
        email: consumerEmail,
        password: 'Consumer123!',
        name: '普通用戶',
        phone: '0911111111',
        birthday: '2000-10-10',
        gender: 'm',
      };

      // 註冊 consumer 用戶
      await request(app).post('/api/v1/users/signup').send(consumerUser);
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: consumerUser.email,
        password: consumerUser.password,
      });
      const consumerToken = loginRes.body.data.token;

      const res = await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${consumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');

      // 清除用戶資料
      const existing = await db.select().from(user).where(eq(user.email, consumerUser.email));
      if (existing.length > 0) {
        const existingUser = existing[0];
        await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
        await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      }
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('成功取得單一使用者資料 200', async () => {
      // 先從資料庫取得該使用者 id
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;

      const res = await request(app).get(`/api/v1/admin/users/${userId}`).set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id', userId);
      expect(res.body.data.user.email).toBe(adminUser.email);
    });

    it('查無此使用者時應回傳 404', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'; // 假的 UUID

      const res = await request(app).get(`/api/v1/admin/users/${fakeId}`).set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('查無此使用者');
    });

    it('未提供 Token 應回傳 401', async () => {
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;

      const res = await request(app).get(`/api/v1/admin/users/${userId}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('非 admin 權限應回傳 403', async () => {
      const consumerEmail = `consumer+${Date.now()}@example.com`;
      const consumerUser = {
        email: consumerEmail,
        password: 'Consumer123!',
        name: '普通用戶',
        phone: '0911111111',
        birthday: '2000-10-10',
        gender: 'm',
      };

      await request(app).post('/api/v1/users/signup').send(consumerUser);
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: consumerUser.email,
        password: consumerUser.password,
      });
      const consumerToken = loginRes.body.data.token;

      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;

      const res = await request(app)
        .get(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');

      // 清除
      const existing = await db.select().from(user).where(eq(user.email, consumerUser.email));
      if (existing.length > 0) {
        const existingUser = existing[0];
        await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
        await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      }
    });
  });

  describe('PUT /api/v1/admin/users/:id/role', () => {
    it('成功修改使用者腳色為 consumer 200', async () => {
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));

      const userId = existingUser[0].id;

      // 取得修改前的 updatedAt
      const beforeUpdate = existingUser[0].updated_at;

      // 等待 1 秒以確保 updatedAt 有變化
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await request(app)
        .put(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'consumer' as Role,
        });
      console.log('PUT /api/v1/admin/users/:id/role', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('consumer');

      // 驗證 updatedAt 是否已更新
      const updatedUser = await db.select().from(user).where(eq(user.id, userId));
      const afterUpdate = updatedUser[0].updated_at;

      expect(afterUpdate && beforeUpdate && new Date(afterUpdate).getTime()).toBeGreaterThan(
        new Date(beforeUpdate ?? 0).getTime(),
      );

      await db
        .update(user)
        .set({ role: 'admin' }) // 恢復為 admin
        .where(eq(user.id, userId))
        .execute();
    });
    it('提供錯誤角色值應回傳 400', async () => {
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;

      const res = await request(app)
        .put(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'invalid_role' as Role,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('無效的角色值');
    });

    it('未提供 token 應回傳 401', async () => {
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;

      const res = await request(app)
        .put(`/api/v1/admin/users/${userId}/role`)
        .send({
          role: 'consumer' as Role,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('找不到該使用者應回傳 404', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'; // 假的 UUID
      const res = await request(app)
        .put(`/api/v1/admin/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          role: 'consumer' as Role,
        });
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('查無此使用者');
    });

    it('非 admin 權限應回傳 403', async () => {
      const consumerEmail = `consumer+${Date.now()}@example.com`;
      const consumerUser = {
        email: consumerEmail,
        password: 'Consumer123!',
        name: '普通用戶',
        phone: '0911111111',
        birthday: '2000-10-10',
        gender: 'm',
      };
      await request(app).post('/api/v1/users/signup').send(consumerUser);
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: consumerUser.email,
        password: consumerUser.password,
      });
      const consumerToken = loginRes.body.data.token;
      const existingUser = await db.select().from(user).where(eq(user.email, adminUser.email));
      const userId = existingUser[0].id;
      const res = await request(app)
        .put(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          role: 'consumer' as Role,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');

      // 清除
      const existing = await db.select().from(user).where(eq(user.email, consumerUser.email));
      if (existing.length > 0) {
        const existingUser = existing[0];
        await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
        await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      }
    });
  });
});
