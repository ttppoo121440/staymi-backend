import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import request from 'supertest';

import { closeDatabase, db } from '@/config/database';
import { user } from '@/database/schemas/user.schema';
import { user_profile } from '@/database/schemas/user_profile.schema';
import { server } from '@/server';

import app from '../src/app';
import { cloudinary } from '../src/libs/cloudinary';

dotenv.config({ path: '.env.test' });

jest.mock('@/libs/cloudinary'); // Mock Cloudinary

const mockedUpload = cloudinary.uploader.upload as jest.Mock;

describe('📤 Upload API 測試', () => {
  const testUser = {
    email: `testUser+${Date.now()}@example.com`,
    password: 'Password123!',
    name: '測試使用者',
    phone: '0912345678',
    birthday: '2000-01-01',
    gender: 'm',
  };

  let token: string;

  beforeAll(async () => {
    // 清除資料
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    // 註冊帳號
    await request(app).post('/api/v1/users/signup').send(testUser);

    // 登入取得 token
    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.data.token;

    mockedUpload.mockReset();
  });

  afterAll(async () => {
    const existingUsers = await db.select().from(user).where(eq(user.email, testUser.email));
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      await db.delete(user_profile).where(eq(user_profile.user_id, existingUser.id)).execute();
      await db.delete(user).where(eq(user.id, existingUser.id)).execute();
    }

    await closeDatabase();
    if (server) server.close();
  });

  it('成功上傳圖片 200', async () => {
    mockedUpload.mockResolvedValueOnce({ secure_url: 'https://fake.cloudinary.com/fake-image.jpg' });
    const ImageBuffer = Buffer.alloc(1 * 1024 * 1024 - 500);
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', ImageBuffer, {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg',
      }); // 模擬上傳圖片

    expect(res.status).toBe(200);
    expect(res.body.data.image.url).toBe('https://fake.cloudinary.com/fake-image.jpg');
  });

  it('沒有權限 401', async () => {
    const res = await request(app).post('/api/v1/upload');
    console.log('沒有權限 401 res.body:', res.body);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('未登入或 token 失效');
  });

  it('沒有帶檔案 400', async () => {
    const res = await request(app).post('/api/v1/upload').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/請上傳圖片/);
  });

  it('檔案太大 400', async () => {
    const bigImageBuffer = Buffer.alloc(2 * 1024 * 1024 + 1); // 2MB + 1 byte
    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', bigImageBuffer, {
        filename: 'big-image.jpg',
        contentType: 'image/jpeg',
      }); // 模擬大圖
    console.log('檔案太大 400 res.body.message:', res.body.message);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/圖片大小不能超過/);
  });

  it('檔案格式錯誤 400', async () => {
    const wrongTypeBuffer = Buffer.from('not-a-valid-image');
    console.log('wrongTypeBuffer:', wrongTypeBuffer);

    const res = await request(app)
      .post('/api/v1/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', wrongTypeBuffer, {
        filename: 'bad-file.txt',
        contentType: 'text/plain',
      });

    console.log('檔案格式錯誤 400 res.body:', res.body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/只接受/);
  });
});
