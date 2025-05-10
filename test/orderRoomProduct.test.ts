import { describe, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { order_room_product } from '@/database/schemas/order_room_product.schema';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { server } from '@/server';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';

jest.setTimeout(30000);
const testUser = {
  email: `testUser+${Date.now()}@example.com`,
  password: 'Password123!',
  name: '測試使用者',
  phone: '0912345678',
  birthday: '2000-01-01',
  gender: 'm',
};

let token: string;
let userId: string;
describe('訂單 API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 清除測試帳號資料（避免重複）
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(order_room_product).where(eq(order_room_product.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    // 註冊與登入
    await request(app).post('/api/v1/users/signup').send(testUser);

    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    token = loginRes.body.data.token;
    const decoded = jwt.decode(token) as { id: string };
    userId = decoded.id;
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      await db.delete(order_room_product).where(eq(order_room_product.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }
    await closeDatabase();
    if (server) {
      server.close();
    }
  });

  describe('GET /api/v1/users/order', () => {
    beforeAll(async () => {
      await db
        .insert(order_room_product)
        .values({
          user_id: userId,
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(),
          total_price: 1000,
          status: 'pending',
          payment_name: '測試付款人',
          payment_phone: '0912345678',
          payment_email: 'testUser@gmail.com',
          contact_name: '測試聯絡人',
          contact_phone: '0912345678',
          contact_email: 'testUser@gmail.com',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();
    });

    it('應該成功取得指定飯店的產品列表 200', async () => {
      const res = await request(app).get(`/api/v1/users/order`).set('Authorization', `Bearer ${token}`);
      console.log('應該成功取得指定飯店的產品列表', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/users/order`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });
  });

  describe.only('POST /api/v1/users/order', () => {
    it('應該成功建立訂單 201', async () => {
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: userId,
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 2)),
          total_price: 1500,
          status: 'pending',
          payment_name: '付款人B',
          payment_phone: '0922333444',
          payment_email: 'payer@example.com',
          contact_name: '聯絡人B',
          contact_phone: '0922333444',
          contact_email: 'contact@example.com',
        });
      console.log('應該成功建立訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('id');
    });

    it('建立訂單失敗 - 缺少必要欄位 400', async () => {
      const res = await request(app).post('/api/v1/users/order').set('Authorization', `Bearer ${token}`).send({
        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
        room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
        total_price: 999,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it('建立訂單失敗 - 未登入 401', async () => {
      const res = await request(app).post('/api/v1/users/order').send({
        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
        room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
        total_price: 1000,
        payment_name: '測試',
        payment_phone: '0911222333',
        payment_email: 'test@example.com',
        contact_name: '測試',
        contact_phone: '0911222333',
        contact_email: 'test@example.com',
        status: 'pending',
        check_in_date: new Date(),
        check_out_date: new Date(),
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
