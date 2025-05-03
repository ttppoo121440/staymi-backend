import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { serverUrl } from '@/config/env';

import { registerAdminUserRoutes } from './registry/adminUser.registry';
import { registerAuthRoutes } from './registry/auth.registry';
import { registerAuthStoreRoutes } from './registry/authStore.registry';
import { registerHotelRoutes } from './registry/hotel.registry';
import { registerHotelImageRoutes } from './registry/hotelImage.registry';
import { registerImageUploadRoutes } from './registry/imageUpload.registry';
import { registerRoomTypeRoutes } from './registry/roomType.registry';
import { registerUserRoutes } from './registry/user.registry';

// 定義一個共用的 Bearer Token 安全設定常數
export const bearerSecurity = { security: [{ bearerAuth: [] }] };

// 擴展 Zod 以支持 OpenAPI
extendZodWithOpenApi(z);

// 創建 OpenAPI 註冊表
const registry = new OpenAPIRegistry();

// 註冊安全方案
registerSecuritySchemes(registry);

// 註冊每個模組的路由
registerAuthRoutes(registry);
registerUserRoutes(registry);
registerAdminUserRoutes(registry);
registerAuthStoreRoutes(registry);
registerImageUploadRoutes(registry);
registerHotelRoutes(registry);
registerRoomTypeRoutes(registry);
registerHotelImageRoutes(registry);

// 註冊安全方案
export function registerSecuritySchemes(registry: OpenAPIRegistry): void {
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: '請在 Authorization 標頭中提供 JWT Token',
  });
}

if (!serverUrl) {
  throw new Error('❌ Missing serverUrl in environment variables');
}

// 生成 OpenAPI 文檔
const generator = new OpenApiGeneratorV3(registry.definitions);
export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'staymi API',
    version: '1.0.0',
    description: '使用 zod-openapi 生成的 API 文檔',
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [{ url: serverUrl }],
});
