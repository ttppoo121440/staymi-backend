import { randomUUID } from 'crypto';

import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { brand } from '../src/database/schemas/brand.schema';
import { hotels } from '../src/database/schemas/hotels.schema';
import { user } from '../src/database/schemas/user.schema';
import { user_brand } from '../src/database/schemas/user_brand.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { hotelGetAllType } from '../src/features/storeHotel/storeHotel.schema';
import { server } from '../src/server';

process.env.NODE_ENV = 'test';

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

let token: string;
let brand_id: string;

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

const mockHotelData1 = {
  region: '台中',
  name: '測試商家飯店一號',
  address: '台中市中區自由路一段 123 號',
  phone: '0912123123',
  transportation: '近台中火車站',
  hotel_policies: '禁止吸菸',
  latitude: '24.147736',
  longitude: '120.673648',
  hotel_facilities: ['WiFi', '電視'],
  is_active: true,
};

const mockHotelData2 = {
  region: '台北',
  name: '測試商家飯店二號',
  address: '台北市信義區市府路 45 號',
  phone: '0987654321',
  transportation: '近捷運市政府站',
  hotel_policies: '寵物友善',
  latitude: '25.033964',
  longitude: '121.562321',
  hotel_facilities: ['游泳池', '健身房'],
  is_active: true,
};

afterAll(async () => {
  // 全部測試跑完再清資料
  // 清除測試帳號（如果存在）
  await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
  const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
  const existingUser = existingUsers[0];

  if (existingUsers.length > 0) {
    await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
    await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
    await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
    await db.delete(user).where(eq(user.id, existingUser.id)).execute();

    console.log(`beforeAll 清理測試用戶 ${existingUser.id}`);
  }

  await closeDatabase();
  if (server) server.close();
});

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('測試必須在測試環境中運行');
  }
  // 清除測試帳號（如果存在）
  await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
  const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
  const existingUser = existingUsers[0];

  if (existingUsers.length > 0) {
    await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
    await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
    await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
    await db.delete(user).where(eq(user.id, existingUser.id)).execute();

    console.log(`beforeAll 清理測試用戶 ${existingUser.id}`);
  }
});

describe('取得自己的所有飯店列表 API', () => {
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 註冊並登入
    await request(app).post('/api/v1/store/signup').send(signupData);

    const loginRes = await request(app).post('/api/v1/store/login').send({
      email: signupData.email,
      password: signupData.password,
    });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.token;

    const decoded = jwt.decode(token) as { brand_id: string };
    brand_id = decoded.brand_id;

    // 插入兩筆飯店資料
    await request(app).post('/api/v1/store/hotel').set('Authorization', `Bearer ${token}`).send(mockHotelData1);

    await request(app).post('/api/v1/store/hotel').set('Authorization', `Bearer ${token}`).send(mockHotelData2);
  });
  it('成功取得，應回傳 200 與飯店列表', async () => {
    const res = await request(app)
      .get('/api/v1/store/hotel') // 根據你的 route 設定
      .set('Authorization', `Bearer ${token}`);

    console.log('取得自己的所有飯店列表 API', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('取得飯店列表成功');
    expect(Array.isArray(res.body.data.hotels)).toBe(true);
    expect(res.body.data.hotels.length).toBeGreaterThanOrEqual(2); // 至少兩間
    const hotelNames = res.body.data.hotels.map((hotel: hotelGetAllType) => hotel.name);
    expect(hotelNames).toContain('測試商家飯店一號');
    expect(hotelNames).toContain('測試商家飯店二號');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).get('/api/v1/store/hotel');
    console.log('未登入取得飯店列表應回傳 401', res.body);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('沒有 brand_id 應回傳 403', async () => {
    // 假裝成 consumer 身份，沒有 brand_id
    const fakeConsumerToken = jwt.sign(
      { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .get('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${fakeConsumerToken}`)
      .send(mockHotelData);

    console.log('沒有 brand_id 應回傳 401', res.body);

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

    const res = await request(app).get('/api/v1/store/hotel').set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });
});

describe('取得單一飯店 API', () => {
  let hotelId: string;

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    await request(app).post('/api/v1/store/signup').send(signupData);
    const loginRes = await request(app).post('/api/v1/store/login').send({
      email: signupData.email,
      password: signupData.password,
    });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.token;

    const decoded = jwt.decode(token) as { brand_id: string };
    brand_id = decoded.brand_id;

    const createHotelRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send(mockHotelData);

    hotelId = createHotelRes.body.data.hotel.id;
  });

  it('成功取得，應回傳 200 與飯店資料', async () => {
    const res = await request(app).get(`/api/v1/store/hotel/${hotelId}`).set('Authorization', `Bearer ${token}`);

    console.log('成功取得單一飯店', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('取得飯店資料成功');
    expect(res.body.data.hotel.name).toBe('測試測試飯店');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).get(`/api/v1/store/hotel/${hotelId}`);

    console.log('未登入查單一飯店', res.body);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('非 store 身份應回傳 403', async () => {
    const consumerToken = jwt.sign(
      {
        id: 'consumer-id',
        email: 'consumer@example.com',
        role: 'consumer', // consumer 沒有 brand_id
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .get(`/api/v1/store/hotel/${hotelId}`)
      .set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份查單一飯店', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });

  it('飯店不存在應回傳 404', async () => {
    const fakeUserId = randomUUID();
    const res = await request(app).get(`/api/v1/store/hotel/${fakeUserId}`).set('Authorization', `Bearer ${token}`);

    console.log('查詢不存在飯店', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('飯店不存在');
  });
});

describe('飯店創建 API', () => {
  beforeAll(async () => {
    await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
    // 註冊帳號
    await request(app).post('/api/v1/store/signup').send(signupData);
    // 登入帳號
    const loginRes = await request(app).post('/api/v1/store/login').send({
      email: signupData.email,
      password: signupData.password,
    });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.token;

    // 解析 token，提取 brand_id
    const decoded = jwt.decode(token) as { brand_id: string };
    brand_id = decoded.brand_id;
  });

  afterAll(async () => {
    await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    const existingUser = existingUsers[0];

    if (existingUsers.length > 0) {
      await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }
  });

  it('成功建立飯店，應回傳 201', async () => {
    const res = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send(mockHotelData);

    console.log('成功建立飯店，應回傳 201', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('建立飯店成功');
    expect(res.body.data.hotel).toMatchObject({
      ...mockHotelData,
    });
  });

  it('缺少必要欄位應回傳 400', async () => {
    const { name, ...incompleteData } = mockHotelData;
    console.log('被移除的欄位:', name);
    const res = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send(incompleteData);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('請輸入店名');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).post('/api/v1/store/hotel').send(mockHotelData);
    console.log('未登入應回傳 401', res.body);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('沒有 brand_id 應回傳 403', async () => {
    // 假裝成 consumer 身份，沒有 brand_id
    const fakeConsumerToken = jwt.sign(
      { id: 'fake-user-id', email: 'fake@example.com', role: 'consumer' },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${fakeConsumerToken}`)
      .send(mockHotelData);

    console.log('沒有 brand_id 應回傳 401', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).post('/api/v1/store/hotel').send(mockHotelData);
    console.log('未登入應回傳 401', res.body);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('非 store 角色應回傳 403', async () => {
    const fakeEmail = `fake+${Date.now()}@store.com`; // 使用時間戳來確保唯一性
    const fakeUserId = randomUUID();

    // 插入一個 consumer 角色的假用戶
    const fakeToken = jwt.sign(
      {
        id: fakeUserId,
        email: fakeEmail,
        role: 'consumer', // 設定角色為 consumer
        brand_id: brand_id, // 這裡 brand_id 是合法的
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    // 發送請求
    const res = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ ...mockHotelData, name: '假品牌飯店名稱' });

    // 驗證返回結果
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
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ ...mockHotelData, name: '假品牌飯店名稱' });

    // 驗證返回結果
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限操作此資料');

    // 測試結束後刪除假資料
    await db.delete(brand).where(eq(brand.id, fakeBrandId)).execute();
    await db.delete(user).where(eq(user.id, fakeUserId)).execute();
  });

  it('飯店名稱重複應回傳 409', async () => {
    const duplicateRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send(mockHotelData); // 已經是第二次送了

    console.log('飯店名稱重複應回傳 409', duplicateRes.body);

    expect(duplicateRes.statusCode).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toBe('飯店名稱已存在');
  });
});

describe('飯店更新 API', () => {
  let createdHotelId: string;

  beforeAll(async () => {
    await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
    // 註冊帳號
    await request(app).post('/api/v1/store/signup').send(signupData);
    // 登入帳號
    const loginRes = await request(app).post('/api/v1/store/login').send({
      email: signupData.email,
      password: signupData.password,
    });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.token;

    // 解析 token，提取 brand_id
    const decoded = jwt.decode(token) as { brand_id: string };
    brand_id = decoded.brand_id;

    // 先新增一個飯店，拿到 id
    const createRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...mockHotelData,
        name: '更新測試用飯店',
      });

    expect(createRes.statusCode).toBe(201);
    createdHotelId = createRes.body.data?.hotel?.id;
  });

  afterAll(async () => {
    await db.delete(hotels).where(eq(hotels.brand_id, brand_id)).execute();
    const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
    const existingUser = existingUsers[0];

    if (existingUsers.length > 0) {
      await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }
  });

  it('成功更新飯店，應回傳 200', async () => {
    const updateData = {
      name: '更新後的飯店名稱',
      region: '高雄',
      address: '高雄市苓雅區成功一路 456 號',
      phone: '0987654321',
      transportation: '近捷運三多商圈站',
      hotel_policies: '禁止寵物',
      latitude: '22.627278',
      longitude: '120.301435',
      hotel_facilities: ['游泳池', '健身房'],
      is_active: false,
    };

    const res = await request(app)
      .put(`/api/v1/store/hotel/${createdHotelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    console.log('成功更新飯店，應回傳 200', JSON.stringify(res.body, null, 2));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('更新飯店成功');
    expect(res.body.data.hotel).toMatchObject(updateData);
  });

  it('缺少必要欄位應回傳 400', async () => {
    const res = await request(app)
      .put(`/api/v1/store/hotel/${createdHotelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        // 故意只送部分資料，例如缺少 name
        region: '高雄',
      });

    console.log('缺少必要欄位應回傳 400', res.body);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('請輸入店名');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).put(`/api/v1/store/hotel/${createdHotelId}`).send({
      name: '未登入更新',
      region: '高雄',
      address: '高雄市新興區',
    });

    console.log('未登入應回傳 401', res.body);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('非 store 角色應回傳 403', async () => {
    const fakeToken = jwt.sign(
      {
        id: randomUUID(),
        email: `consumer+${Date.now()}@example.com`,
        role: 'consumer',
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .put(`/api/v1/store/hotel/${createdHotelId}`)
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({
        name: '消費者更新飯店',
        region: '高雄',
        address: '高雄市新興區',
      });

    console.log('非 store 角色應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });

  it('非本人品牌操作應回傳 403', async () => {
    const fakeToken = jwt.sign(
      {
        id: randomUUID(),
        email: `store+${Date.now()}@example.com`,
        role: 'store',
        brand_id: randomUUID(), // 不是自己的 brand_id
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app)
      .put(`/api/v1/store/hotel/${createdHotelId}`)
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({
        name: '他人更新飯店',
        region: '高雄',
        address: '高雄市新興區',
      });

    console.log('非本人品牌操作應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限操作此資料');
  });

  it('更新不存在的飯店應回傳 404', async () => {
    const fakeHotelId = randomUUID();

    const res = await request(app)
      .put(`/api/v1/store/hotel/${fakeHotelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...mockHotelData,
        name: '不存在的飯店',
      });

    console.log('更新不存在的飯店應回傳 404', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('飯店不存在');
  });

  it('飯店名稱重複應回傳 409', async () => {
    // 先創另一間飯店
    const anotherHotelRes = await request(app)
      .post('/api/v1/store/hotel')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...mockHotelData,
        name: '另一間飯店',
      });

    expect(anotherHotelRes.statusCode).toBe(201);
    const anotherHotelId = anotherHotelRes.body.data.hotel.id;

    const res = await request(app)
      .put(`/api/v1/store/hotel/${createdHotelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...mockHotelData,
        name: '另一間飯店', // 重複名稱
      });

    console.log('更新名稱重複應回傳 409', res.body);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('飯店名稱已存在');

    // 刪除另一間飯店
    await db.delete(hotels).where(eq(hotels.id, anotherHotelId)).execute();
  });
});
