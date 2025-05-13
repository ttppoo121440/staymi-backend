import { randomUUID } from 'crypto';

import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../src/app';
import { closeDatabase, db } from '../src/config/database';
import { brand } from '../src/database/schemas/brand.schema';
import { room_types } from '../src/database/schemas/room_types.schema';
import { user } from '../src/database/schemas/user.schema';
import { user_brand } from '../src/database/schemas/user_brand.schema';
import { user_profile } from '../src/database/schemas/user_profile.schema';
import { server } from '../src/server';

jest.setTimeout(30000);

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

const mockHotelData = {
  name: '測試房間',
  description: '測試房間描述',
  room_service: ['Wi-Fi', '早餐'],
};
const mockHotelData1 = {
  name: '測試房間1',
  description: '測試房間描述1',
  room_service: ['Wi-Fi', '早餐'],
};

const mockHotelData2 = {
  name: '測試房間2',
  description: '測試房間描述2',
  room_service: ['Wi-Fi', '健身房'],
};

let token: string;
let brand_id: string;

afterAll(async () => {
  console.log(brand_id);
  // 清除房型資料
  await db.delete(room_types).where(eq(room_types.brand_id, brand_id)).execute();

  // 清除測試帳號（如果存在）
  const existingUsers = await db.select().from(user).where(eq(user.email, signupData.email));
  const existingUser = existingUsers[0];

  if (existingUsers.length > 0) {
    await db.delete(user_brand).where(eq(user_brand.user_id, existingUser.id)).execute();
    await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
    await db.delete(brand).where(eq(brand.user_id, existingUser.id)).execute();
    await db.delete(user).where(eq(user.id, existingUser.id)).execute();

    console.log(`afterAll 清理測試用戶 ${existingUser.id}`);
  }

  await closeDatabase();
  if (server) server.close();
});

beforeAll(async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('測試必須在測試環境中運行');
  }
  // 清除測試帳號（如果存在）
  await db.delete(room_types).where(eq(room_types.brand_id, brand_id)).execute();
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

describe('GET /api/v1/store/hotel/room-type', () => {
  const endpoint = '/api/v1/store/hotel/room-type';
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
    await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData1);
    await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData2);
  });

  it('授權成功，應回傳 200 並取得房型列表 200', async () => {
    const res = await request(app)
      .get(endpoint)
      .query({ currentPage: 1, perPage: 10 })
      .set('Authorization', `Bearer ${token}`);

    console.log('授權成功，應回傳 200 並取得房型列表 200', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data.roomTypes).toBeInstanceOf(Array);
    expect(res.body.message).toBe('取得飯店房型列表成功');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).get(endpoint);
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
      .get(endpoint)
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

    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });
});

describe('GET /api/v1/store/hotel/room-type/:id', () => {
  const endpoint = '/api/v1/store/hotel/room-type';
  let roomTypeId: string;

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

    // 插入一筆房型資料
    const createRes = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData);

    expect(createRes.status).toBe(201);
    roomTypeId = createRes.body.data.roomType.id;
  });

  it('授權成功，應回傳 200 並取得單一房型', async () => {
    const res = await request(app).get(`${endpoint}/${roomTypeId}`).set('Authorization', `Bearer ${token}`);

    console.log('授權成功，應回傳 200 並取得單一房型', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data.roomType).toHaveProperty('id', roomTypeId);
    expect(res.body.data.roomType.name).toBe(mockHotelData.name);
    expect(res.body.message).toBe('取得飯店房型成功');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).get(`${endpoint}/${roomTypeId}`);
    console.log('未登入取得單一房型應回傳 401', res.body);

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
      .get(endpoint)
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

    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });

  it('非本人品牌操作應回傳 403', async () => {
    const fakeToken = jwt.sign(
      {
        id: 'some-fake-user-id',
        email: 'fake@example.com',
        role: 'store',
        brand_id: '11111111-1111-1111-1111-111111111111', // 假的 brand_id
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app).get(`${endpoint}/${roomTypeId}`).set('Authorization', `Bearer ${fakeToken}`);

    console.log('非本人品牌操作應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限操作此資料');
  });

  it('房型不存在應回傳 404', async () => {
    const fakeRoomTypeId = '11111111-1111-1111-1111-111111111111'; // 假的房型 ID

    const res = await request(app).get(`${endpoint}/${fakeRoomTypeId}`).set('Authorization', `Bearer ${token}`);

    console.log('房型不存在應回傳 404', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('房型不存在');
  });
});

describe('POST /api/v1/store/hotel/room-type', () => {
  const endpoint = '/api/v1/store/hotel/room-type';

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
  });

  it('授權成功，應回傳 201 並創建房型', async () => {
    const res = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData);

    console.log('授權成功，應回傳 201 並創建房型', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.data.roomType).toHaveProperty('id');
    expect(res.body.data.roomType.name).toBe(mockHotelData.name);
    expect(res.body.message).toBe('創建飯店房型成功');
  });

  it('缺少必要欄位應回傳 400', async () => {
    const res = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({ name: '測試房間' }); // 只提供 name 欄位
    console.log('缺少必要欄位應回傳 400', res.body);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('請輸入飯店房型描述');
  });

  it('room_service 格式錯誤應回傳 400', async () => {
    const res = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send({
      brand_id: '11111111-1111-1111-1111-111111111111',
      name: '測試房型',
      description: '測試描述',
      room_service: 'WiFi', // 應該是陣列，但傳入了字串
    });

    console.log('room_service 格式錯誤應回傳 400', res.body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('請選擇飯店房型服務'); // 驗證 Zod 的錯誤訊息
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).post(endpoint).send(mockHotelData);
    console.log('未登入創建飯店房型應回傳 401', res.body);

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
      .post(endpoint)
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

    const res = await request(app).post(endpoint).set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

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
      .post(endpoint)
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
});

describe('PUT /api/v1/store/hotel/room-type/:id', () => {
  const endpoint = '/api/v1/store/hotel/room-type';
  let roomTypeId: string;

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

    // 插入一筆房型資料
    const createRes = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData);

    expect(createRes.status).toBe(201);
    roomTypeId = createRes.body.data.roomType.id;
  });

  it('授權成功，應回傳 200 並更新房型', async () => {
    const updatedData = {
      name: '更新後的房型名稱',
      description: '更新後的房型描述',
      room_service: ['Wi-Fi', '健身房'],
    };

    const res = await request(app)
      .put(`${endpoint}/${roomTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    console.log('授權成功，應回傳 200 並更新房型', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data.roomType).toHaveProperty('id', roomTypeId);
    expect(res.body.data.roomType.name).toBe(updatedData.name);
    expect(res.body.data.roomType.description).toBe(updatedData.description);
    expect(res.body.message).toBe('更新飯店房型成功');
  });

  it('缺少必要欄位應回傳 400', async () => {
    const res = await request(app)
      .put(`${endpoint}/${roomTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '更新後的房型名稱' });
    console.log('缺少必要欄位應回傳 400', res.body);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('請輸入飯店房型描述');
  });

  it('未登入應回傳 401', async () => {
    const updatedData = {
      name: '更新後的房型名稱',
      description: '更新後的房型描述',
      room_service: ['Wi-Fi', '健身房'],
    };

    const res = await request(app).put(`${endpoint}/${roomTypeId}`).send(updatedData);

    console.log('未登入更新房型應回傳 401', res.body);

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
      .put(endpoint)
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

    const res = await request(app).put(endpoint).set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

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
      .post(endpoint)
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

  it('房型不存在應回傳 404', async () => {
    const fakeRoomTypeId = '11111111-1111-1111-1111-111111111111'; // 假的房型 ID

    const updatedData = {
      name: '更新後的房型名稱',
      description: '更新後的房型描述',
      room_service: ['Wi-Fi', '健身房'],
    };

    const res = await request(app)
      .put(`${endpoint}/${fakeRoomTypeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    console.log('房型不存在應回傳 404', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('房型不存在');
  });
});

describe('DELETE /api/v1/store/hotel/room-type/:id', () => {
  const endpoint = '/api/v1/store/hotel/room-type';
  let roomTypeId: string;

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

    // 插入一筆房型資料
    const createRes = await request(app).post(endpoint).set('Authorization', `Bearer ${token}`).send(mockHotelData);

    expect(createRes.status).toBe(201);
    roomTypeId = createRes.body.data.roomType.id;
  });

  it('授權成功，應回傳 200 並刪除房型', async () => {
    const res = await request(app).delete(`${endpoint}/${roomTypeId}`).set('Authorization', `Bearer ${token}`);

    console.log('授權成功，應回傳 200 並刪除房型', JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('刪除成功');
  });

  it('未登入應回傳 401', async () => {
    const res = await request(app).delete(`${endpoint}/${roomTypeId}`);

    console.log('未登入刪除房型應回傳 401', res.body);

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
      .delete(`${endpoint}/${roomTypeId}`)
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

    const res = await request(app).delete(`${endpoint}/${roomTypeId}`).set('Authorization', `Bearer ${consumerToken}`);

    console.log('非 store 身份取得飯店列表應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限訪問此資源');
  });

  it('非本人品牌操作應回傳 403', async () => {
    const fakeToken = jwt.sign(
      {
        id: 'some-fake-user-id',
        email: 'fake@example.com',
        role: 'store',
        brand_id: '11111111-1111-1111-1111-111111111111', // 假的 brand_id
      },
      process.env.JWT_SECRET ?? 'test',
      { expiresIn: '1h' },
    );

    const res = await request(app).delete(`${endpoint}/${roomTypeId}`).set('Authorization', `Bearer ${fakeToken}`);

    console.log('非本人品牌操作應回傳 403', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('無權限操作此資料');
  });

  it('房型不存在應回傳 404', async () => {
    const fakeRoomTypeId = '11111111-1111-1111-1111-111111111111'; // 假的房型 ID

    const res = await request(app).delete(`${endpoint}/${fakeRoomTypeId}`).set('Authorization', `Bearer ${token}`);

    console.log('房型不存在應回傳 404', res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('查無此資料，刪除失敗');
  });
});
