import { randomUUID } from 'crypto';

import { describe, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { order_room_product } from '@/database/schemas/order_room_product.schema';
import { subscriptions } from '@/database/schemas/subscriptions.schema';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { OrderRoomProductType } from '@/features/orderRoomProduct/orderRoomProduct.schema';
import { server } from '@/server';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';

process.env.NODE_ENV = 'test';
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
      await db.delete(subscriptions).where(eq(subscriptions.user_id, existingUser.id)).execute();
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
      await db.delete(subscriptions).where(eq(subscriptions.user_id, existingUser.id)).execute();
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
          payment_email: `payment_email${Date.now()}@example.com`,
          contact_name: '測試聯絡人',
          contact_phone: '0912345678',
          contact_email: `contact_email${Date.now()}@example.com`,
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

    it('應該成功取得 status 為 pending 的訂單 200', async () => {
      const res = await request(app)
        .get('/api/v1/users/order')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${token}`);

      console.log('應該成功取得 status 為 pending 的訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.every((order: OrderRoomProductType) => order.status === 'pending')).toBe(true);
    });

    it('應該能以 perPage 分頁取得結果 200', async () => {
      const res = await request(app)
        .get('/api/v1/users/order')
        .query({ currentPage: 1, perPage: 1 })
        .set('Authorization', `Bearer ${token}`);

      console.log('分頁取得訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.perPage).toBe(1);
      expect(res.body.data.orders.length).toBeLessThanOrEqual(1);
    });

    it('應該回傳 400 - 傳入無效的 status', async () => {
      const res = await request(app)
        .get('/api/v1/users/order?status=invalid_status')
        .set('Authorization', `Bearer ${token}`);
      console.log('應該回傳 400 - 傳入無效的 status', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('狀態只能是 pending、confirmed、cancelled');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/users/order`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });
  });

  describe('GET /api/v1/users/order/:id', () => {
    let orderId: string;

    beforeAll(async () => {
      const result = await db
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
          payment_email: `payment_email${Date.now()}@example.com`,
          contact_name: '測試聯絡人',
          contact_phone: '0912345678',
          contact_email: `contact_email${Date.now()}@example.com`,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning({ id: order_room_product.id });

      orderId = result[0].id;
    });

    it('應該成功取得單筆訂單 200', async () => {
      const res = await request(app)
        .get(`/api/v1/users/order/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
        });

      console.log('取得單筆訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();
      expect(res.body.data.order.id).toBe(orderId);
    });

    it('傳入錯誤格式 id 應回傳 400', async () => {
      const res = await request(app)
        .get(`/api/v1/users/order/not-a-uuid`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
        });

      console.log('傳入錯誤格式 id 應回傳 400', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請填正確 id 格式');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/users/order/${orderId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('找不到訂單應回傳 404', async () => {
      const fakeId = randomUUID();

      const res = await request(app).get(`/api/v1/users/order/${fakeId}`).set('Authorization', `Bearer ${token}`).send({
        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
        room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
      });

      console.log('找不到訂單應回傳 404', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到對應的訂房訂單');
    });
  });

  describe('POST /api/v1/users/order', () => {
    it('建立訂單成功 - pro 訂閱 (使用 subscription_price) 201', async () => {
      await db
        .insert(subscriptions)
        .values({
          user_id: userId,
          plan: 'pro',
          status: 'active',
          started_at: new Date(),
          end_at: new Date(new Date().setDate(new Date().getDate() + 30)),
        })
        .execute();
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

    it('建立訂單成功 - plus 訂閱 (使用 subscription_price) 201', async () => {
      await db
        .insert(subscriptions)
        .values({
          user_id: userId,
          plan: 'plus',
          status: 'active',
          started_at: new Date(),
          end_at: new Date(new Date().setDate(new Date().getDate() + 30)),
        })
        .execute();

      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 2)),
          payment_name: '付款人',
          payment_phone: '0900111222',
          payment_email: 'plus@example.com',
          contact_name: '聯絡人',
          contact_phone: '0900111222',
          contact_email: 'plus@example.com',
          status: 'pending',
        });
      console.log('建立訂單成功 - plus 訂閱 (使用 subscription_price)', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('建立訂單成功 - 訂閱過期 (使用 price) 201', async () => {
      await db
        .insert(subscriptions)
        .values({
          user_id: userId,
          plan: 'plus',
          status: 'active',
          started_at: new Date(new Date().setDate(new Date().getDate() - 60)),
          end_at: new Date(new Date().setDate(new Date().getDate() - 30)),
        })
        .execute();

      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0900111222',
          payment_email: 'expired@example.com',
          contact_name: '聯絡人',
          contact_phone: '0900111222',
          contact_email: 'expired@example.com',
          status: 'pending',
        });
      console.log('建立訂單成功 - 訂閱過期 (使用 price)', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('建立訂單成功 - 無訂閱 (使用 price) 200', async () => {
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0900111222',
          payment_email: 'no-sub@example.com',
          contact_name: '聯絡人',
          contact_phone: '0900111222',
          contact_email: 'no-sub@example.com',
          status: 'pending',
        });
      console.log('建立訂單成功 - 無訂閱 (使用 price)', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
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

    it('建立訂單失敗 - room_plans_id 不存在 404', async () => {
      const uuid = randomUUID();
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: userId,
          hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
          room_plans_id: uuid,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0900111222',
          payment_email: 'invalid@example.com',
          contact_name: '聯絡人',
          contact_phone: '0900111222',
          contact_email: 'invalid@example.com',
          status: 'pending',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到對應的住宿計畫');
    });

    it('建立訂單失敗 - hotel_id 不存在 404', async () => {
      const uuid = randomUUID();
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: userId,
          hotel_id: uuid,
          room_plans_id: 'bdebc5a5-bfd8-4cb7-a85f-13490f34cd33',
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0900111222',
          payment_email: 'invalid@example.com',
          contact_name: '聯絡人',
          contact_phone: '0900111222',
          contact_email: 'invalid@example.com',
          status: 'pending',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });
  });

  describe('PUT /api/v1/users/order/:id', () => {
    let orderId: string;

    beforeAll(async () => {
      const result = await db
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
          payment_email: `payment_email${Date.now()}@example.com`,
          contact_name: '測試聯絡人',
          contact_phone: '0912345678',
          contact_email: `contact_email${Date.now()}@example.com`,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning({ id: order_room_product.id });

      orderId = result[0].id;
    });

    it('應該成功更新訂單狀態 200', async () => {
      const res = await request(app)
        .put(`/api/v1/users/order/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'confirmed',
        });
      console.log('應該成功更新訂單狀態 200', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.data.order.status).toBe('confirmed');
    });

    it('應該回傳 400 - 缺少 status 欄位 400', async () => {
      const res = await request(app)
        .put(`/api/v1/users/order/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: 'some-hotel-id',
          room_plans_id: 'some-room-plan-id',
          check_in_date: '2025-06-01',
          check_out_date: '2025-06-03',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('狀態只能是 pending、confirmed、cancelled');
    });

    it('應該回傳 400 - 傳入錯誤 status 400', async () => {
      const res = await request(app)
        .put(`/api/v1/users/order/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'invalid_status',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('狀態只能是');
    });

    it('應該回傳 401 - 未登入', async () => {
      const res = await request(app).put(`/api/v1/users/order/${orderId}`).send({
        status: 'cancelled',
      });

      expect(res.status).toBe(401);
    });

    it('建立訂單失敗 - room_plans_id 不存在 404', async () => {
      const uuid = randomUUID();
      const res = await request(app).put(`/api/v1/users/order/${uuid}`).set('Authorization', `Bearer ${token}`).send({
        status: 'cancelled',
      });
      console.log('建立訂單失敗 - room_plans_id 不存在 404', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到對應的訂房訂單');
    });

    it('建立訂單失敗 - hotel_id 不存在 404', async () => {
      const uuid = randomUUID();
      const res = await request(app).put(`/api/v1/users/order/${uuid}`).set('Authorization', `Bearer ${token}`).send({
        status: 'cancelled',
      });
      console.log('建立訂單失敗 - hotel_id 不存在 404', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到對應的訂房訂單');
    });

    it('應該回傳 404 - 找不到訂單', async () => {
      const res = await request(app)
        .put(`/api/v1/users/order/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'pending',
        });

      expect(res.status).toBe(404);
    });
  });
});
