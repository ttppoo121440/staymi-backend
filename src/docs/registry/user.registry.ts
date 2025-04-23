import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { user_profileSchema, user_profileUpdateSchema } from '@/features/user/user.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerUserRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['User'],
    method: 'get',
    path: '/api/v1/users/user-profile',
    summary: '檢視個人資料',
    ...bearerSecurity,
    responses: {
      200: {
        description: '獲取個人資料成功',
        content: {
          'application/json': {
            schema: user_profileSchema,
            examples: {
              'application/json': {
                summary: '獲取個人資料範例',
                value: {
                  success: true,
                  message: '獲取個人資料成功',
                  data: {
                    user: {
                      id: 'c59d92fb-9d5f-46d3-b551-8192be6d0748',
                      user_id: 'c59d92fb-9d5f-46d3-b551-8192be6d0748',
                      name: '路邊攤測試人',
                      phone: '0422525759',
                      email: 'test1@gmail.com',
                      avatar: '',
                    },
                  },
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
                summary: '未授權範例',
                value: {
                  message: '請先登入',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '用戶不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '用戶不存在範例',
                value: {
                  message: '用戶不存在',
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
    tags: ['User'],
    method: 'put',
    path: '/api/v1/users/user-profile',
    summary: '更新個人資料',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: user_profileUpdateSchema,
            examples: {
              'application/json': {
                summary: '用戶註冊範例',
                value: {
                  name: '更新路邊攤',
                  phone: '0422282252',
                  birthday: '2025-04-10',
                  gender: 'M',
                  avatar: '',
                  role: 'consumer',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新個人資料成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '更新個人資料範例',
                value: {
                  success: true,
                  message: '更新個人資料成功',
                  data: {
                    user: {
                      name: '新的名字',
                      phone: '0987654321',
                      birthday: '1995-05-05',
                      gender: 'f',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求參數錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '請求參數錯誤範例',
                value: {
                  message: '請求參數錯誤',
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
                summary: '未授權範例',
                value: {
                  message: '請先登入',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '用戶不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '用戶不存在範例',
                value: {
                  message: '用戶不存在',
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
