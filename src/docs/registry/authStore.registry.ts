import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { authStoreSignupSchema, authStoreUpdateSchema } from '@/features/authStore/authStore.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerAuthStoreRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['AuthStore'],
    method: 'post',
    path: '/api/v1/store/signup',
    summary: '商家註冊',
    request: {
      body: {
        content: {
          'application/json': {
            schema: authStoreSignupSchema,
            examples: {
              'application/json': {
                summary: '商家註冊範例',
                value: {
                  email: 'example@gmail.com',
                  password: 'AAbbcc12345678',
                  title: '雅TWO大飯店',
                  description: '雅TWO大飯店 提供高品質的住宿服務，讓每位旅客享受舒適與便利。',
                  name: '雅TWO大飯店大老闆',
                  phone: '0422525759',
                  birthday: '2015-04-12',
                  gender: 'f',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '註冊成功',
        content: {
          'application/json': {
            schema: authStoreSignupSchema,
            examples: {
              'application/json': {
                summary: '註冊成功範例',
                value: {
                  success: true,
                  message: '註冊成功',
                  data: {
                    id: '4e61d2c7-1cdf-4301-bbc8-0201a5c383a1',
                    email: 'admin+1745117256037@example.com',
                    password: 'password123',
                    title: 'My Store',
                    description: 'A test store',
                    name: '測試使用者',
                    phone: '0912345678',
                    birthday: '1999-12-31T13:00:00.000Z',
                    gender: 'm',
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '格式錯誤或驗證錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '格式錯誤或驗證錯誤範例',
                value: {
                  message: '格式錯誤或驗證錯誤',
                  status: false,
                },
              },
            },
          },
        },
      },
      409: {
        description: '此信箱已被註冊',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '此信箱已被註冊範例',
                value: {
                  message: '此信箱已被註冊',
                  status: false,
                },
              },
            },
          },
        },
      },
      500: {
        description: '伺服器錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '伺服器錯誤範例',
                value: {
                  message: '伺服器發生錯誤，請稍後再試',
                  status: false,
                },
              },
            },
          },
        },
      },
    },
  });

  registry.registerPath({
    tags: ['AuthStore'],
    method: 'put',
    path: '/api/v1/store',
    summary: '商家更新',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: authStoreUpdateSchema,
            examples: {
              'application/json': {
                summary: '商家更新範例',
                value: {
                  title: 'update雅TWO大飯店',
                  description: 'update雅TWO大飯店 提供高品質的住宿服務，讓每位旅客享受舒適與便利。',
                  name: 'update雅TWO大飯店大老闆',
                  phone: '0422525759',
                  birthday: '2015-04-12',
                  gender: 'f',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新成功',
        content: {
          'application/json': {
            schema: authStoreSignupSchema,
            examples: {
              'application/json': {
                summary: '更新成功範例',
                value: {
                  success: true,
                  message: '更新成功',
                  data: {
                    title: 'update雅TWO大飯店',
                    description: 'update雅TWO大飯店 提供高品質的住宿服務，讓每位旅客享受舒適與便利。',
                    name: 'update雅TWO大飯店大老闆',
                    phone: '0422525759',
                    birthday: '2015-04-12',
                    gender: 'f',
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '格式錯誤或驗證錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '格式錯誤或驗證錯誤範例',
                value: {
                  message: '格式錯誤或驗證錯誤',
                  status: false,
                },
              },
            },
          },
        },
      },
      401: {
        description: '未登入或 token 失效',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '未登入或 token 失效範例',
                value: {
                  message: '未登入或 token 失效',
                  status: false,
                },
              },
            },
          },
        },
      },
      403: {
        description: '無權限訪問此資源',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '無權限訪問此資源範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '找不到該商家',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '找不到該商家範例',
                value: {
                  message: '找不到該商家',
                  status: false,
                },
              },
            },
          },
        },
      },
      500: {
        description: '伺服器錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '伺服器錯誤範例',
                value: {
                  message: '伺服器發生錯誤，請稍後再試',
                  status: false,
                },
              },
            },
          },
        },
      },
    },
  });
};
