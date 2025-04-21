import { randomUUID } from 'crypto';

import { eq } from 'drizzle-orm';
import request from 'supertest';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { brand } from '../src/database/schemas/brand.schema';
import { user } from '../src/database/schemas/user.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { server } from '../src/server';
import { formatDisplayDate } from '../src/utils/formatDate';
import { generateToken } from '../src/utils/jwt';

process.env.NODE_ENV = 'test';
jest.setTimeout(30000);

describe('測試 AuthStore API', () => {
  const signupData = {
    email: `store+${Date.now()}@example.com`,
    password: 'password123',
    title: 'My Store',
    description: 'A test store',
    name: '測試使用者',
    phone: '0912345678',
    birthday: '2000-01-01',
    gender: 'm',
  };

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }
    // 清除測試帳號（如果存在）
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    const existingUser = existingUsers[0];

    if (existingUsers.length > 0) {
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();

      console.log(`beforeAll 清理測試用戶 ${existingUser.id}`);
    }
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      console.log(`afterAll 清理測試用戶 ${existingUser.id}`);
    }

    await closeDatabase();
    if (server) {
      server.close();
    }
  });
  afterEach(async () => {
    // 每個測試後清理資料
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
      console.log(`afterEach 清理測試用戶 ${existingUser.id}`);
    }
  });

  // 測試註冊功能
  describe('POST /api/v1/store/signup', () => {
    it('應該成功註冊商家 201', async () => {
      const res = await request(app).post('/api/v1/store/signup').send(signupData);
      console.log('應該成功註冊商家', res.body);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('註冊成功');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.name).toBe(signupData.name);

      // 驗證 user 是否存在
      const users = await db.select().from(user).where(eq(user.email, signupData.email));
      expect(users.length).toBe(1);

      // 驗證 brand 是否存在
      const brands = await db.select().from(brand).where(eq(brand.user_id, users[0].id));
      expect(brands.length).toBe(1);
      expect(brands[0].title).toBe(signupData.title);

      // ✅ 驗證 user_profile 是否存在
      const profiles = await db.select().from(user_profile).where(eq(user_profile.user_id, users[0].id));
      expect(profiles.length).toBe(1);
      expect(profiles[0].name).toBe(signupData.name);
      expect(profiles[0].phone).toBe(signupData.phone);
      expect(formatDisplayDate(profiles[0]?.birthday)).toBe(formatDisplayDate(signupData.birthday));

      expect(profiles[0].gender).toBe(signupData.gender);

      // 註冊成功後使用註冊的資訊自動登入
      const loginRes = await request(app)
        .post('/api/v1/users/login')
        .send({ email: signupData.email, password: signupData.password });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined(); // 應該返回 token
      expect(loginRes.body.data.user.name).toBe(signupData.name); // 檢查登入回傳的使用者資料
    });

    it('應該回傳信箱重複錯誤 409', async () => {
      // 先註冊一次
      await request(app).post('/api/v1/store/signup').send(signupData);

      // 嘗試再次註冊相同 email
      const res = await request(app).post('/api/v1/store/signup').send(signupData);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('信箱已被註冊');
    });

    it('信箱格式錯誤應回傳 400', async () => {
      const res = await request(app)
        .post('/api/v1/store/signup')
        .send({
          ...signupData,
          email: 'invalid-email',
        });
      console.log('信箱格式錯誤的回傳:', res.body);
      expect(res.statusCode).toBe(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('信箱格式錯誤');
    });

    it('缺少必填欄位應回傳 400', async () => {
      const res = await request(app).post('/api/v1/store/signup').send({
        email: 'example@gmail.com',
        password: '12345678',
        // 少了 name、birthday、phone...等
      });
      console.log('缺少必填欄位的回傳-------------------------:', res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請輸入商店名稱');
    });
  });

  // 測試更新功能
  describe('PUT /api/v1/store', () => {
    let token: string;

    beforeAll(async () => {
      // 註冊帳號
      await request(app).post('/api/v1/store/signup').send(signupData);
      // 登入帳號
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: signupData.email,
        password: signupData.password,
      });

      expect(loginRes.status).toBe(200);
      token = loginRes.body.data.token;
    });

    it('應該成功更新商店資訊 200', async () => {
      const updatedData = {
        title: 'Updated Store Title',
        description: 'Updated description',
        logo_url: 'https://example.com/logo.png',
        name: '測試使用者',
        phone: '0912345678',
        birthday: '2000-01-01',
        gender: 'm',
      };

      const res = await request(app).put(`/api/v1/store`).set('Authorization', `Bearer ${token}`).send(updatedData);
      console.log('應該成功更新商店資訊', res.body);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('更新成功');
      expect(res.body.data.title).toBe(updatedData.title);
      expect(res.body.data.description).toBe(updatedData.description);
      expect(res.body.data.logo_url).toBe(updatedData.logo_url);
    });

    it('應該回傳未授權錯誤 401', async () => {
      const updatedData = {
        title: 'Unauthorized Update',
        description: 'Should fail',
        logo_url: 'https://example.com/logo.png',
        name: '測試使用者',
        phone: '0912345678',
        birthday: '2000-01-01',
        gender: 'm',
      };

      const res = await request(app).put(`/api/v1/store`).send(updatedData);
      console.log('未授權錯誤回傳:', res.body);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('應該回傳權限不足錯誤 403', async () => {
      const updatedData = {
        title: 'Forbidden Update',
        description: 'Should fail',
        logo_url: 'https://example.com/logo.png',
        name: '測試使用者',
        phone: '0912345678',
        birthday: '2000-01-01',
        gender: 'm',
      };

      // 使用非 store 角色的 token
      const fakeToken = generateToken({ id: randomUUID(), email: signupData.email, role: 'consumer' });
      const res = await request(app).put(`/api/v1/store`).set('Authorization', `Bearer ${fakeToken}`).send(updatedData);
      console.log('權限不足錯誤回傳:', res.body);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('應該回傳找不到對應的商店資訊 404', async () => {
      const fakeStoreId = randomUUID();
      const token = generateToken({ id: fakeStoreId, email: signupData.email, role: 'store' });
      const res = await request(app)
        .put('/api/v1/store')
        .send({
          title: 'Title',
          description: 'Desc',
          logo_url: '',
          name: '測試使用者',
          phone: '0912345678',
          birthday: '2000-01-01',
          gender: 'm',
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('找不到對應的商店資訊');
    });
  });
});
