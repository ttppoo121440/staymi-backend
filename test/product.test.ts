import { randomUUID } from 'crypto';

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { brand } from '@/database/schemas/brand.schema';
import { products } from '@/database/schemas/products.schema';
import { user } from '@/database/schemas/user.schema';
import { user_brand } from '@/database/schemas/user_brand.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { server } from '@/server';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { hotels } from '../src/database/schemas/hotels.schema';

const mockHotelData = {
  region: '台中',
  name: '測試測試飯店',
  address: '台中市中區自由路一段 123 號',
  phone: '0912123123',
  transportation: '近台中火車站',
  hotel_policies: '禁止吸菸',
  latitude: '24.147736',
  longitude: '120.673648',
  hotel_facilities: ['WiFi', '電視'],
  is_active: true,
};

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

let token: string;
let brand_id: string;
let hotelId: string;
let productId: string;
describe('飯店圖片 API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 清除測試帳號資料（避免重複）
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(products).where(eq(products.hotel_id, hotelId)).execute();
      await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
      await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    // 註冊與登入
    await request(app).post('/api/v1/store/signup').send(signupData);

    const loginRes = await request(app).post('/api/v1/store/login').send({
      email: signupData.email,
      password: signupData.password,
    });

    token = loginRes.body.data.token;
    const decoded = jwt.decode(token) as { brand_id: string };
    brand_id = decoded.brand_id;

    // 建立飯店
    const hotelRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send(mockHotelData);

    expect(hotelRes.status).toBe(201);

    hotelId = hotelRes.body.data.hotel.id;
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      await db.delete(products).where(eq(products.hotel_id, hotelId)).execute();
      await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
      await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }
    await closeDatabase();
    if (server) {
      server.close();
    }
  });

  describe('GET /api/v1/store/hotels/:hotelId/products', () => {
    beforeAll(async () => {
      await db
        .insert(products)
        .values({
          hotel_id: hotelId,
          name: '測試產品',
          description: '這是一個測試產品',
          features: '測試特色',
          imageUrl: 'https://example.com/image.jpg',
        })
        .execute();

      await db
        .insert(products)
        .values({
          hotel_id: hotelId,
          name: '測試產品1',
          description: '這是一個測試產品1',
          features: '測試特色1',
          imageUrl: 'https://example.com/image1.jpg',
        })
        .execute();
    });

    it('應該成功取得指定飯店的產品列表 200', async () => {
      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${token}`);
      console.log('應該成功取得指定飯店的產品列表', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/store/hotel/${hotelId}/products`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('沒有 brand_id 應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('不是 store 身份應回傳 403', async () => {
      const consumerToken = jwt.sign(
        {
          id: 'fake-user-id',
          email: 'fake@example.com',
          role: 'consumer',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('飯店不存在應回傳 404', async () => {
      const fakeHotelId = randomUUID();
      const res = await request(app)
        .get(`/api/v1/store/hotel/${fakeHotelId}/products`)
        .set('Authorization', `Bearer ${token}`);

      console.log('查詢不存在飯店', res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });
  });

  describe('GET /api/v1/store/hotel/:hotelId/products/:id', () => {
    beforeAll(async () => {
      const insertResult = await db
        .insert(products)
        .values({
          hotel_id: hotelId,
          name: '單筆查詢產品',
          description: '這是一個單筆查詢產品',
          features: '單筆查詢特色',
          imageUrl: 'https://example.com/product.jpg',
        })
        .returning();

      productId = insertResult[0].id;
    });

    it('應該成功取得指定產品 200', async () => {
      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);
      console.log('應該成功取得指定產品 200', JSON.stringify(res.body, null, 2));
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.id).toBe(productId);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/store/hotel/${hotelId}/products/${productId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('沒有 brand_id 應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('不是 store 身份應回傳 403', async () => {
      const consumerToken = jwt.sign(
        {
          id: 'fake-user-id',
          email: 'fake@example.com',
          role: 'consumer',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('無品牌身份應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('飯店不存在應回傳 404', async () => {
      const fakeHotelId = randomUUID();
      const res = await request(app)
        .get(`/api/v1/store/hotel/${fakeHotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });

    it('產品不存在應回傳 404', async () => {
      const fakeProductId = randomUUID();
      const res = await request(app)
        .get(`/api/v1/store/hotel/${hotelId}/products/${fakeProductId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('查無此伴手禮');
    });
  });

  describe('POST /api/v1/store/hotel/:hotelId/products', () => {
    const newProductData = {
      name: '新增測試產品',
      description: '這是一個新增測試產品',
      features: '測試新增特色',
      imageUrl: 'https://example.com/test-product.jpg',
    };

    it('應該成功新增產品 201', async () => {
      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send(newProductData);
      console.log('應該成功新增產品 201', JSON.stringify(res.body, null, 2));
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name).toBe(newProductData.name);
    });

    it('欄位格式錯誤應回傳 400', async () => {
      const invalidProductData = {
        name: '測試產品',
        description: '這是一個測試產品',
        features: '測試特色',
        imageUrl: true,
      };
      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidProductData);
      console.log('欄位格式錯誤應回傳 400', JSON.stringify(res.body, null, 2));

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請選擇伴手禮圖片');
    });

    it('欄位未填寫應回傳 400', async () => {
      const invalidProductData = {
        name: '測試產品',
        features: '測試特色',
        imageUrl: 'https://example.com/test-product.jpg',
      };
      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidProductData);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請輸入伴手禮描述');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).post(`/api/v1/store/hotel/${hotelId}/products`).send(newProductData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('不是 store 身份應回傳 403', async () => {
      const consumerToken = jwt.sign(
        {
          id: 'fake-user-id',
          email: 'fake@example.com',
          role: 'consumer',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send(newProductData);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('無品牌身份應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('沒有 brand_id 應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('飯店不存在應回傳 404', async () => {
      const fakeHotelId = randomUUID();
      const res = await request(app)
        .post(`/api/v1/store/hotel/${fakeHotelId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send(newProductData);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });
  });

  describe('PUT /api/v1/store/hotel/:hotelId/products/:id', () => {
    let productId: string;

    const originalProduct = {
      name: '更新前產品',
      description: '更新前描述',
      features: '更新前特色',
      imageUrl: 'https://example.com/before.jpg',
    };

    const updatedProduct = {
      name: '更新後產品',
      description: '這是更新後的描述',
      features: '更新後特色',
      imageUrl: 'https://example.com/after.jpg',
    };

    beforeAll(async () => {
      const insertRes = await db
        .insert(products)
        .values({ ...originalProduct, hotel_id: hotelId })
        .returning();
      productId = insertRes[0].id;
    });

    it('應該成功更新產品 200', async () => {
      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedProduct);
      console.log('應該成功更新產品 200', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.name).toBe(updatedProduct.name);
    });

    it('Zod 驗證錯誤應回傳 400', async () => {
      const invalidPayload = {
        ...updatedProduct,
        name: '',
      };

      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請輸入伴手禮名稱');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).put(`/api/v1/store/hotel/${hotelId}/products/${productId}`).send(updatedProduct);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('不是 store 身份應回傳 403', async () => {
      const consumerToken = jwt.sign(
        { id: 'fake-id', role: 'consumer', email: 'fake@example.com' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send(updatedProduct);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('無品牌身份應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('沒有 brand_id 應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('伴手禮不存在應回傳 404', async () => {
      const fakeProductId = randomUUID();
      const res = await request(app)
        .put(`/api/v1/store/hotel/${hotelId}/products/${fakeProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedProduct);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('查無此伴手禮');
    });

    it('飯店不存在應回傳 404', async () => {
      const fakeHotelId = randomUUID();

      const res = await request(app)
        .put(`/api/v1/store/hotel/${fakeHotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedProduct);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });
  });

  describe('PATCH /api/v1/store/hotel/:hotelId/products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const createRes = await request(app)
        .post(`/api/v1/store/hotel/${hotelId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '軟刪除測試產品',
          description: '用於測試刪除功能',
          features: '可還原',
          imageUrl: 'https://example.com/delete.jpg',
        });

      productId = createRes.body.data.product.id;
    });

    it('應該成功執行軟刪除，並將 is_active 變更為 true 200', async () => {
      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('刪除伴手禮成功');

      const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      expect(product[0].is_active).toBe(true);
    });

    it('應該成功執行還原，並將 is_active 變更回 false 200', async () => {
      await db.update(products).set({ is_active: true }).where(eq(products.id, productId));

      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('還原伴手禮成功');

      const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      expect(product[0].is_active).toBe(false);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`).send({
        is_active: false,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('未登入或 token 失效');
    });

    it('不是 store 身份應回傳 403', async () => {
      const consumerToken = jwt.sign(
        { id: 'fake-id', role: 'consumer', email: 'fake@example.com' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send();

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('無品牌身份應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('沒有 brand_id 應回傳 403', async () => {
      const fakeConsumerToken = jwt.sign(
        { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('伴手禮不存在應回傳 404', async () => {
      const fakeProductId = randomUUID();
      const res = await request(app)
        .patch(`/api/v1/store/hotel/${hotelId}/products/${fakeProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('查無此伴手禮');
    });

    it('飯店不存在應回傳 404', async () => {
      const fakeHotelId = randomUUID();

      const res = await request(app)
        .patch(`/api/v1/store/hotel/${fakeHotelId}/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店不存在');
    });
  });
});
