import { randomUUID } from 'crypto';

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { brand } from '@/database/schemas/brand.schema';
import { user } from '@/database/schemas/user.schema';
import { user_brand } from '@/database/schemas/user_brand.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { server } from '@/server';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { hotel_images } from '../src/database/schemas/hotel_images.schema';
import { hotels } from '../src/database/schemas/hotels.schema';

jest.setTimeout(30000);

const mockHotelData = {
  region: '台中',
  name: '測試圖片飯店',
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
let hotelImageId: string;
describe('飯店圖片 API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 清除測試帳號資料（避免重複）
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(hotel_images).execute();
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
      await db.delete(hotel_images).where(eq(hotel_images.hotel_id, hotelId)).execute();
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

  describe('GET /api/v1/store/hotel/images', () => {
    beforeAll(async () => {
      await db
        .insert(hotel_images)
        .values({
          hotel_id: hotelId,
          image_url: 'https://example.com/test-image.jpg',
          is_cover: true,
          position: 1,
        })
        .execute();
    });

    it('應該成功取得圖片資料 200', async () => {
      const res = await request(app).get(`/api/v1/store/hotel/images`).set('Authorization', `Bearer ${token}`);
      console.log('應該成功取得圖片資料', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.images)).toBe(true);
      expect(res.body.data.images.length).toBeGreaterThanOrEqual(1);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/store/hotel/images`);

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
        .get(`/api/v1/store/hotel/images`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

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

      const res = await request(app).get(`/api/v1/store/hotel/images`).set('Authorization', `Bearer ${consumerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });
  });

  describe('GET /api/v1/store/hotel/images/:id', () => {
    beforeAll(async () => {
      const result = await db
        .insert(hotel_images)
        .values({
          hotel_id: hotelId,
          image_url: 'https://example.com/test-image.jpg',
          is_cover: true,
          position: 1,
        })
        .returning({ id: hotel_images.id })
        .execute();

      hotelImageId = result[0].id;
    });
    it('應該成功取得飯店資料 200', async () => {
      const res = await request(app)
        .get(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${token}`);

      console.log('應該成功取得飯店資料', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.image).toHaveProperty('hotel_id', hotelId);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).get(`/api/v1/store/hotel/images/${hotelImageId}`);

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
        .get(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${consumerToken}`);

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
        .get(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('非本人品牌操作應回傳 403', async () => {
      const fakeBrandId = randomUUID();
      const fakeUserId = randomUUID();
      const fakeEmail = `fake+${Date.now()}@store.com`; // 使用時間戳來確保唯一性

      // 檢查是否已經存在該 email
      const existingUser = await db.select().from(user).where(eq(user.email, fakeEmail));
      if (existingUser.length > 0) {
        // 如果已經存在，則刪除資料
        await db.delete(user).where(eq(user.email, fakeEmail)).execute();
      }

      // 插入假 user
      await db.insert(user).values({
        id: fakeUserId,
        email: fakeEmail,
        password: 'hashed-password',
        role: 'store',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 插入假品牌
      await db.insert(brand).values({
        id: fakeBrandId,
        user_id: fakeUserId,
        title: '假品牌',
        description: '這不是你的品牌',
      });

      // 建立假的 token
      const fakeToken = jwt.sign(
        {
          id: 'some-fake-user-id',
          email: fakeEmail,
          role: 'store',
          brand_id: '11111111-1111-1111-1111-111111111111',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      // 發送請求
      const res = await request(app)
        .get(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeToken}`);

      // 驗證返回結果
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限操作此資料');

      // 測試結束後刪除假資料
      await db.delete(brand).where(eq(brand.id, fakeBrandId)).execute();
      await db.delete(user).where(eq(user.id, fakeUserId)).execute();
    });
  });

  describe('POST /api/v1/store/hotel/images', () => {
    it('應該成功新增圖片資料 200', async () => {
      const res = await request(app).post(`/api/v1/store/hotel/images`).set('Authorization', `Bearer ${token}`).send({
        image_url: 'https://example.com/added.jpg',
        is_cover: false,
        position: 2,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.image).toHaveProperty('hotel_id', hotelId);
    });

    it('欄位驗證失敗應該回傳 400', async () => {
      const res = await request(app).post(`/api/v1/store/hotel/images`).set('Authorization', `Bearer ${token}`).send({
        is_cover: true,
        position: 1,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請上傳圖片');
    });

    it('資料格式不正確應該回傳 400', async () => {
      const res = await request(app).post(`/api/v1/store/hotel/images`).set('Authorization', `Bearer ${token}`).send({
        image_url: 'https://example.com/added.jpg',
        is_cover: true,
        position: 'invalid-position', // 錯誤的資料類型
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請輸入整數');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).post(`/api/v1/store/hotel/images`);

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
        .post(`/api/v1/store/hotel/images`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });
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
        .post(`/api/v1/store/hotel/images`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('非本人品牌操作應回傳 403', async () => {
      const fakeBrandId = randomUUID();
      const fakeUserId = randomUUID();
      const fakeEmail = `fake+${Date.now()}@store.com`; // 使用時間戳來確保唯一性

      // 檢查是否已經存在該 email
      const existingUser = await db.select().from(user).where(eq(user.email, fakeEmail));
      if (existingUser.length > 0) {
        // 如果已經存在，則刪除資料
        await db.delete(user).where(eq(user.email, fakeEmail)).execute();
      }

      // 插入假 user
      await db.insert(user).values({
        id: fakeUserId,
        email: fakeEmail,
        password: 'hashed-password',
        role: 'store',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 插入假品牌
      await db.insert(brand).values({
        id: fakeBrandId,
        user_id: fakeUserId,
        title: '假品牌',
        description: '這不是你的品牌',
      });

      // 建立假的 token
      const fakeToken = jwt.sign(
        {
          id: 'some-fake-user-id',
          email: fakeEmail,
          role: 'store',
          brand_id: '11111111-1111-1111-1111-111111111111',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );

      // 發送請求
      const res = await request(app)
        .post(`/api/v1/store/hotel/images`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

      console.log('非本人品牌操作應回傳 403', JSON.stringify(res.body, null, 2));

      // 驗證返回結果
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限操作此資料');
    });
  });

  describe('PUT /api/v1/store/hotel/images/:id', () => {
    beforeAll(async () => {
      // 插入測試圖片資料
      const result = await db
        .insert(hotel_images)
        .values({
          hotel_id: hotelId,
          image_url: 'https://example.com/test-image.jpg',
          is_cover: true,
          position: 1,
        })
        .returning({ id: hotel_images.id })
        .execute();

      hotelImageId = result[0].id;
    });

    it('應該成功更新圖片資料 200', async () => {
      const updatedData = {
        image_url: 'https://example.com/updated-image.jpg',
        is_cover: false,
        position: 2,
      };

      const res = await request(app)
        .put(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      console.log('應該成功更新圖片資料', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.image).toHaveProperty('id', hotelImageId);
      expect(res.body.data.image).toHaveProperty('image_url', updatedData.image_url);
      expect(res.body.data.image).toHaveProperty('is_cover', updatedData.is_cover);
      expect(res.body.data.image).toHaveProperty('position', updatedData.position);
    });

    it('欄位驗證失敗應該回傳 400', async () => {
      const invalidData = {
        is_cover: true,
        position: 'invalid-position', // 錯誤的資料類型
      };

      const res = await request(app)
        .put(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('請上傳圖片');
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).put(`/api/v1/store/hotel/images/${hotelImageId}`).send({
        image_url: 'https://example.com/updated-image.jpg',
        is_cover: false,
        position: 2,
      });

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
        .put(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          image_url: 'https://example.com/updated-image.jpg',
          is_cover: false,
          position: 2,
        });

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
        .put(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('非本人品牌操作應回傳 403', async () => {
      const fakeBrandId = randomUUID();
      const fakeUserId = randomUUID();
      const fakeEmail = `fake+${Date.now()}@store.com`; // 使用時間戳來確保唯一性

      // 檢查是否已經存在該 email
      const existingUser = await db.select().from(user).where(eq(user.email, fakeEmail));
      if (existingUser.length > 0) {
        // 如果已經存在，則刪除資料
        await db.delete(user).where(eq(user.email, fakeEmail)).execute();
      }

      // 插入假 user
      await db.insert(user).values({
        id: fakeUserId,
        email: fakeEmail,
        password: 'hashed-password',
        role: 'store',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 插入假品牌
      await db.insert(brand).values({
        id: fakeBrandId,
        user_id: fakeUserId,
        title: '假品牌',
        description: '這不是你的品牌',
      });

      // 建立假的 token
      const fakeToken = jwt.sign(
        {
          id: 'some-fake-user-id',
          email: fakeEmail,
          role: 'store',
          brand_id: '11111111-1111-1111-1111-111111111111',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );
      const updatedData = {
        image_url: 'https://example.com/updated-image.jpg',
        is_cover: false,
        position: 2,
      };
      // 發送請求
      const res = await request(app)
        .put(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .send(updatedData);

      // 驗證返回結果
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限操作此資料');

      // 測試結束後刪除假資料
      await db.delete(brand).where(eq(brand.id, fakeBrandId)).execute();
      await db.delete(user).where(eq(user.id, fakeUserId)).execute();
    });

    it('圖片不存在應回傳 404', async () => {
      const fakeImageId = randomUUID();
      const res = await request(app)
        .put(`/api/v1/store/hotel/images/${fakeImageId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          image_url: 'https://example.com/updated-image.jpg',
          is_cover: false,
          position: 2,
        });

      console.log('查詢不存在圖片', res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店分館圖片不存在');
    });
  });

  describe('DELETE /api/v1/store/hotel/images/:id', () => {
    beforeAll(async () => {
      // 插入測試圖片資料
      const result = await db
        .insert(hotel_images)
        .values({
          hotel_id: hotelId,
          image_url: 'https://example.com/test-image.jpg',
          is_cover: true,
          position: 1,
        })
        .returning({ id: hotel_images.id })
        .execute();

      hotelImageId = result[0].id;
    });

    it('應該成功刪除圖片資料 200', async () => {
      const res = await request(app)
        .delete(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${token}`);

      console.log('應該成功刪除圖片資料', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('刪除成功');

      // 確認資料已刪除
      const deletedImage = await db.select().from(hotel_images).where(eq(hotel_images.id, hotelImageId));
      expect(deletedImage.length).toBe(0);
    });

    it('未登入應回傳 401', async () => {
      const res = await request(app).delete(`/api/v1/store/hotel/images/${hotelImageId}`);

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
        .delete(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${consumerToken}`);

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
        .delete(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeConsumerToken}`)
        .send({
          image_url: 'https://example.com/added.jpg',
          is_cover: false,
          position: 2,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限訪問此資源');
    });

    it('非本人品牌操作應回傳 403', async () => {
      const fakeBrandId = randomUUID();
      const fakeUserId = randomUUID();
      const fakeEmail = `fake+${Date.now()}@store.com`; // 使用時間戳來確保唯一性

      // 檢查是否已經存在該 email
      const existingUser = await db.select().from(user).where(eq(user.email, fakeEmail));
      if (existingUser.length > 0) {
        // 如果已經存在，則刪除資料
        await db.delete(user).where(eq(user.email, fakeEmail)).execute();
      }

      // 插入假 user
      await db.insert(user).values({
        id: fakeUserId,
        email: fakeEmail,
        password: 'hashed-password',
        role: 'store',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // 插入假品牌
      await db.insert(brand).values({
        id: fakeBrandId,
        user_id: fakeUserId,
        title: '假品牌',
        description: '這不是你的品牌',
      });

      // 建立假的 token
      const fakeToken = jwt.sign(
        {
          id: 'some-fake-user-id',
          email: fakeEmail,
          role: 'store',
          brand_id: '11111111-1111-1111-1111-111111111111',
        },
        process.env.JWT_SECRET ?? 'test',
        { expiresIn: '1h' },
      );
      // 發送請求
      const res = await request(app)
        .delete(`/api/v1/store/hotel/images/${hotelImageId}`)
        .set('Authorization', `Bearer ${fakeToken}`);

      // 驗證返回結果
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('無權限操作此資料');

      // 測試結束後刪除假資料
      await db.delete(brand).where(eq(brand.id, fakeBrandId)).execute();
      await db.delete(user).where(eq(user.id, fakeUserId)).execute();
    });

    it('圖片不存在應回傳 404', async () => {
      const fakeImageId = randomUUID();
      const res = await request(app)
        .delete(`/api/v1/store/hotel/images/${fakeImageId}`)
        .set('Authorization', `Bearer ${token}`);

      console.log('查詢不存在圖片', res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('飯店分館圖片不存在');
    });
  });
});
