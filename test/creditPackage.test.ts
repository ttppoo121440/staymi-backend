import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { eq } from 'drizzle-orm';
import type { Application } from 'express';
import express from 'express';
import request from 'supertest';

import { closeDatabase, db } from '../src/config/database';
import { credit_package } from '../src/database/schemas/creditPackage.schema';
import credit_packageRoutes from '../src/modules/credit_package/credit_package.routes';
import type { CreditPackageResponse } from '../src/modules/credit_package/credit_package.schema';
import { server } from '../src/server';

process.env.NODE_ENV = 'test';

const app: Application = express();
app.use(express.json());
app.use('/api/credit_package', credit_packageRoutes);

describe('測試 Credit Package API', () => {
  const testPackages = [
    { name: 'TEST_7堂組合包方案', credit_amount: 7, price: 1400 },
    { name: 'TEST_10堂組合包方案', credit_amount: 10, price: 1900 },
  ];

  let createdPackages: CreditPackageResponse[] = [];

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('測試必須在測試環境中運行');
    }

    // 清理舊的測試資料
    await db.delete(credit_package).where(eq(credit_package.name, testPackages[0].name)).execute();
    await db.delete(credit_package).where(eq(credit_package.name, testPackages[1].name)).execute();
  });

  // 將 afterEach 全部移至測試結束後執行，避免在測試之間刪除了創建的數據
  afterAll(async () => {
    // 清理所有測試創建的數據
    for (const pkg of createdPackages) {
      await db.delete(credit_package).where(eq(credit_package.id, pkg.id)).execute();
    }

    // 先關閉數據庫連接再關閉服務器
    await closeDatabase();

    // 將 console.log 移除，避免 Jest 錯誤
    server.close();
  });

  describe('POST /api/credit_package', () => {
    it('應該可以新增一筆 credit package 資料', async () => {
      const res = await request(app).post('/api/credit_package').send(testPackages[0]);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(testPackages[0].name);

      createdPackages.push(res.body.data);
    });

    it('重複名稱應返回錯誤', async () => {
      // 首先確保已經存在一個相同名稱的包
      const existingPackage = await db
        .select()
        .from(credit_package)
        .where(eq(credit_package.name, testPackages[0].name))
        .execute();

      // 如果不存在，先創建一個
      if (existingPackage.length === 0) {
        const createRes = await request(app).post('/api/credit_package').send(testPackages[0]);
        createdPackages.push(createRes.body.data);
      }

      // 然後測試重複創建
      const res = await request(app).post('/api/credit_package').send(testPackages[0]);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('缺少必要欄位應返回錯誤', async () => {
      const res = await request(app).post('/api/credit_package').send({ name: 'incomplete_package' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/credit_package', () => {
    it('應該可以獲取所有套餐列表', async () => {
      // 確保至少有一個套餐存在
      if (createdPackages.length === 0) {
        const createRes = await request(app).post('/api/credit_package').send(testPackages[1]);
        createdPackages.push(createRes.body.data);
      }

      const res = await request(app).get('/api/credit_package');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/credit_package/:id', () => {
    it('應該可以刪除套餐資料', async () => {
      // 確保至少有一個套餐存在
      if (createdPackages.length === 0) {
        const createRes = await request(app).post('/api/credit_package').send(testPackages[1]);
        createdPackages.push(createRes.body.data);
      }

      const packageId = createdPackages[0].id;
      const res = await request(app).delete(`/api/credit_package/${packageId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // 確認已刪除
      const checkRes = await request(app).get(`/api/credit_package/${packageId}`);
      expect(checkRes.statusCode).toBe(404);

      // 從追蹤列表移除已刪除的套餐
      createdPackages = createdPackages.filter((p) => p.id !== packageId);
    });
  });
});
