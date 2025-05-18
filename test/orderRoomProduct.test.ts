import { randomUUID } from 'crypto';

import { describe, beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
import { eq, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { brand } from '@/database/schemas/brand.schema';
import { hotel_rooms } from '@/database/schemas/hotel_rooms.schema';
import { hotels } from '@/database/schemas/hotels.schema';
import { order_room_product } from '@/database/schemas/order_room_product.schema';
import { order_room_product_item } from '@/database/schemas/order_room_product_item.schema';
import { product_plans } from '@/database/schemas/product_plans.schema';
import { products } from '@/database/schemas/products.schema';
import { room_plans } from '@/database/schemas/room_plans.schema';
import { room_types } from '@/database/schemas/room_types.schema';
import { subscriptions } from '@/database/schemas/subscriptions.schema';
import { user } from '@/database/schemas/user.schema';
import { user_brand } from '@/database/schemas/user_brand.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { OrderRoomProductType } from '@/features/orderRoomProduct/orderRoomProduct.schema';
import { server } from '@/server';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';

dotenv.config({ path: '.env.test' });
jest.setTimeout(30000);

const testUser = {
  email: `testUser+${Date.now()}@example.com`,
  password: 'Password123!',
  name: '測試使用者',
  phone: '0912345678',
  birthday: '2000-01-01',
  gender: 'm',
};

const testStore = {
  email: `store+${Date.now()}@example.com`,
  password: 'password123',
  title: 'My Store',
  description: 'A test store',
  name: '測試使用者',
  phone: '0912345678',
  birthday: '2000-01-01',
  gender: 'm',
};

let token: string;
let userId: string;
let hotelId: string;
let storeToken: string;
let brandId: string;
let roomPlanId: string;

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const closeDb = async (): Promise<void> => {
  const existingUsersStore = await db.select().from(user).where(eq(user.email, testStore.email));
  const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));

  // 刪除一般 user 的資料
  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    await db
      .delete(order_room_product_item)
      .where(
        inArray(
          order_room_product_item.order_id,
          db
            .select({ id: order_room_product.id })
            .from(order_room_product)
            .where(eq(order_room_product.user_id, existingUser.id)),
        ),
      )
      .execute();

    await db.delete(order_room_product).where(eq(order_room_product.user_id, existingUser.id)).execute();
    await db.delete(subscriptions).where(eq(subscriptions.user_id, existingUser.id)).execute();
    await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
    await db.delete(user).where(eq(user.id, existingUser.id)).execute();
  }

  // 刪除商家 user 的資料
  if (existingUsersStore.length > 0) {
    const existingUser = existingUsersStore[0];

    const brandRecord = await db.select().from(brand).where(eq(brand.user_id, existingUser.id));
    const brandId = brandRecord[0]?.id;

    const hotelRecord = await db.select().from(hotels).where(eq(hotels.brand_id, brandId));
    const hotelId = hotelRecord[0]?.id;

    await db.delete(product_plans).where(eq(product_plans.hotel_id, hotelId)).execute();
    await db.delete(products).where(eq(products.hotel_id, hotelId)).execute();
    await db.delete(room_plans).where(eq(room_plans.hotel_id, hotelId)).execute();
    await db.delete(hotel_rooms).where(eq(hotel_rooms.hotel_id, hotelId)).execute();

    await db.delete(room_types).where(eq(room_types.brand_id, brandId)).execute();
    await db.delete(hotels).where(eq(hotels.brand_id, brandId)).execute();

    await db.delete(user_brand).where(eq(user_brand.brand_id, brandId)).execute();
    await db.delete(brand).where(eq(brand.id, brandId)).execute();

    await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
    await db.delete(user).where(eq(user.id, existingUser.id)).execute();
  }
};

describe('訂單 API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }
    await closeDb();
    // 註冊與登入
    await request(app).post('/api/v1/users/signup').send(testUser);

    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    token = loginRes.body.data.token;
    const decoded = jwt.decode(token) as { id: string };
    userId = decoded.id;

    // 註冊並登入
    await request(app).post('/api/v1/store/signup').send(testStore);

    const storeLoginRes = await request(app).post('/api/v1/store/login').send({
      email: testStore.email,
      password: testStore.password,
    });

    expect(storeLoginRes.status).toBe(200);
    storeToken = storeLoginRes.body.data.token;

    const storeDecoded = jwt.decode(storeToken) as { brand_id: string };
    brandId = storeDecoded.brand_id;

    const hotelRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${storeToken}`)
      .send({
        region: '台中',
        name: '訂單測試商家飯店一號',
        address: '台中市中區自由路一段 123 號',
        phone: '0912123123',
        transportation: '近台中火車站',
        hotel_policies: '禁止吸菸',
        latitude: '24.147736',
        longitude: '120.673648',
        hotel_facilities: ['WiFi', '電視'],
        is_active: true,
      });

    hotelId = hotelRes.body.data.hotel.id;

    const roomTypeId = await db
      .insert(room_types)
      .values({
        name: 'Standard Room',
        description: 'A standard room with basic amenities',
        room_service: ['WiFi', 'TV'],
        brand_id: brandId,
      })
      .returning({ id: room_types.id });

    const hotelRoomId = await db
      .insert(hotel_rooms)
      .values({
        hotel_id: hotelId,
        room_type_id: roomTypeId[0]?.id,
        basePrice: 1000,
        is_active: true,
        description: 'A standard room with basic amenities',
        images: ['https://example.com/image1.jpg'],
      })
      .returning({ id: hotel_rooms.id });

    const roomPlanRes = await request(app)
      .post('/api/v1/store/hotel/room-plan')
      .set('Authorization', `Bearer ${storeToken}`)
      .send({
        hotel_id: hotelId,
        hotel_room_id: hotelRoomId[0]?.id,
        price: 1500,
        subscription_price: 1000,
        images: ['https://example.com/image1.jpg'],
        start_date: formatDate(new Date()),
        end_date: formatDate(new Date(Date.now() + 30 * 86400000)),
        is_active: true,
      });
    roomPlanId = roomPlanRes.body.data.roomPlan.id;
  });

  afterAll(async () => {
    await closeDb();
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(),
          total_price: 1000,
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

    it('應該成功取得指定飯店的訂單列表 200', async () => {
      const res = await request(app).get(`/api/v1/users/order`).set('Authorization', `Bearer ${token}`);
      console.log('應該成功取得指定飯店的訂單列表', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
    });

    it('有伴手禮的訂單列表 200', async () => {
      // 建立一個新的伴手禮計畫
      const newProductData = {
        name: '高級伴手禮',
        description: '這是一個高級伴手禮',
        features: '測試新增特色',
        price: 1000,
        imageUrl: 'https://example.com/test-product.jpg',
      };

      const newProductDataRes = await request(app)
        .post(`/api/v1/store/hotel/products`)
        .set('Authorization', `Bearer ${storeToken}`)
        .send(newProductData);

      const productPlanRes = await request(app)
        .post('/api/v1/store/hotel/product-plan')
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          hotel_id: hotelId,
          product_id: newProductDataRes.body.data.product.id,
          price: 1000,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date(Date.now() + 30 * 86400000)),
          is_active: true,
        });

      await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'gift@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'gift@example.com',
          product_plans_id: productPlanRes.body.data.productPlan.id,
          quantity: 7,
        });

      const res = await request(app).get(`/api/v1/users/order`).set('Authorization', `Bearer ${token}`);

      console.log('有伴手禮的訂單列表', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
        });

      console.log('取得單筆訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toBeDefined();
      expect(res.body.data.order.id).toBe(orderId);
    });

    it('有伴手禮的訂單 200', async () => {
      // 建立一個新的伴手禮計畫
      const newProductData = {
        name: '高級伴手禮',
        description: '這是一個高級伴手禮',
        features: '測試新增特色',
        price: 1000,
        imageUrl: 'https://example.com/test-product.jpg',
      };

      const newProductDataRes = await request(app)
        .post(`/api/v1/store/hotel/products`)
        .set('Authorization', `Bearer ${storeToken}`)
        .send(newProductData);

      const productPlanRes = await request(app)
        .post('/api/v1/store/hotel/product-plan')
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          hotel_id: hotelId,
          product_id: newProductDataRes.body.data.product.id,
          price: 1000,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date(Date.now() + 30 * 86400000)),
          is_active: true,
        });

      const orderIdResult = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'gift@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'gift@example.com',
          product_plans_id: productPlanRes.body.data.productPlan.id,
          quantity: 7,
        });

      const res = await request(app)
        .get(`/api/v1/users/order/${orderIdResult.body.data.order.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
        });

      console.log('有伴手禮的訂單', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('傳入錯誤格式 id 應回傳 400', async () => {
      const res = await request(app)
        .get(`/api/v1/users/order/not-a-uuid`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
        });

      console.log('傳入錯誤格式 id 應回傳 400', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('id 格式錯誤');
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
        hotel_id: hotelId,
        room_plans_id: roomPlanId,
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 2)),
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
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

    it('建立訂單成功 - 無訂閱 (使用 price) 201', async () => {
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
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

    it('建立訂單成功 - 有伴手禮 201', async () => {
      // 建立一個新的伴手禮計畫
      const newProductData = {
        name: '高級伴手禮',
        description: '這是一個高級伴手禮',
        features: '測試新增特色',
        price: 1000,
        imageUrl: 'https://example.com/test-product.jpg',
      };

      const newProductDataRes = await request(app)
        .post(`/api/v1/store/hotel/products`)
        .set('Authorization', `Bearer ${storeToken}`)
        .send(newProductData);

      const productPlanRes = await request(app)
        .post('/api/v1/store/hotel/product-plan')
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          hotel_id: hotelId,
          product_id: newProductDataRes.body.data.product.id,
          price: 1000,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date(Date.now() + 30 * 86400000)),
          is_active: true,
        });

      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'gift@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'gift@example.com',
          product_plans_id: productPlanRes.body.data.productPlan.id,
          quantity: 5,
        });

      console.log('有伴手禮的訂單', {
        hotel_id: hotelId,
        room_plans_id: roomPlanId,
        check_in_date: new Date(),
        check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
        payment_name: '付款人',
        payment_phone: '0911222333',
        payment_email: 'gift@example.com',
        contact_name: '聯絡人',
        contact_phone: '0911222333',
        contact_email: 'gift@example.com',
        product_plans_id: productPlanRes.body.data.productPlan.id,
        quantity: 5,
      });

      console.log('建立訂單成功 - 有伴手禮', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('id');
    });

    it('建立訂單失敗 - 缺少必要欄位 400', async () => {
      const res = await request(app).post('/api/v1/users/order').set('Authorization', `Bearer ${token}`).send({
        hotel_id: hotelId,
        room_plans_id: roomPlanId,
        total_price: 999,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBeDefined();
    });

    it('建立訂單失敗 - 有伴手禮但缺少必要欄位（quantity）400', async () => {
      const newProductRes = await request(app)
        .post(`/api/v1/store/hotel/products`)
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          name: '錯誤測試伴手禮',
          description: '不完整資料',
          features: '錯誤測試',
          price: 1000,
          imageUrl: 'https://example.com/fail-product.jpg',
        });

      const productPlanRes = await request(app)
        .post('/api/v1/store/hotel/product-plan')
        .set('Authorization', `Bearer ${storeToken}`)
        .send({
          hotel_id: hotelId,
          product_id: newProductRes.body.data.product.id,
          price: 1000,
          start_date: formatDate(new Date()),
          end_date: formatDate(new Date(Date.now() + 30 * 86400000)),
          is_active: true,
        });

      // 少了 quantity，應觸發 schema 錯誤
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'gift@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'gift@example.com',
          product_plans_id: productPlanRes.body.data.productPlan.id,
        });
      console.log('建立訂單失敗 - 有伴手禮但缺少必要欄位（quantity）400', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請填寫數量');
    });

    it('建立訂單失敗 - check_in_date 大於 check_out_date 400', async () => {
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date('2025-05-20'),
          check_out_date: new Date('2025-05-19'), // 退房日早於入住日
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'test@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('退房日期必須晚於入住日期');
    });

    it('建立訂單失敗 - check_in_date 是過去日期 400', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app).post('/api/v1/users/order').set('Authorization', `Bearer ${token}`).send({
        hotel_id: hotelId,
        room_plans_id: roomPlanId,
        check_in_date: yesterday, // 過去日期
        check_out_date: tomorrow,
        payment_name: '付款人',
        payment_phone: '0911222333',
        payment_email: 'test@example.com',
        contact_name: '聯絡人',
        contact_phone: '0911222333',
        contact_email: 'test@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('check_in_date 不可為過去日期');
    });

    it('建立訂單失敗 - 未登入 401', async () => {
      const res = await request(app).post('/api/v1/users/order').send({
        hotel_id: hotelId,
        room_plans_id: roomPlanId,
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

    it('建立訂單失敗 - 伴手禮建立失敗導致交易回滾 404', async () => {
      // 刻意送不存在的 product_plans_id，觸發錯誤
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
          check_in_date: new Date(),
          check_out_date: new Date(new Date().setDate(new Date().getDate() + 1)),
          payment_name: '付款人',
          payment_phone: '0911222333',
          payment_email: 'gift@example.com',
          contact_name: '聯絡人',
          contact_phone: '0911222333',
          contact_email: 'gift@example.com',
          product_plans_id: '00000000-0000-0000-0000-000000000000',
          quantity: 5,
        });
      console.log('建立訂單失敗 - 伴手禮建立失敗導致交易回滾', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(404); // 伴手禮不存在
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('找不到對應的產品計畫');
    });

    it('建立訂單失敗 - room_plans_id 不存在 404', async () => {
      const uuid = randomUUID();
      const res = await request(app)
        .post('/api/v1/users/order')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user_id: userId,
          hotel_id: hotelId,
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
          room_plans_id: roomPlanId,
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
          hotel_id: hotelId,
          room_plans_id: roomPlanId,
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

    it('應該回傳 404 - 找不到訂單', async () => {
      const res = await request(app)
        .put(`/api/v1/users/order/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'pending',
        });
      console.log('應該回傳 404 - 找不到訂單', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到對應的訂房訂單');
    });
  });
});
