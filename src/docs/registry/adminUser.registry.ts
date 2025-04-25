import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { user_profileSchema } from '@/features/user/user.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerAdminUserRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['adminUser'],
    method: 'get',
    path: '/api/v1/admin/users',
    summary: '獲取所有會員資料',
    ...bearerSecurity,
    request: {
      query: z.object({
        email: z.string().optional().openapi({
          description: '依照 email 模糊查詢',
          example: 'test@gmail.com',
        }),
        is_blacklisted: z.enum(['true', 'false']).optional().openapi({
          description: '是否為黑名單（true/false）',
          example: 'false',
        }),
      }),
    },
    responses: {
      200: {
        description: '獲取所有會員資料成功',
        content: {
          'application/json': {
            schema: user_profileSchema,
            examples: {
              'application/json': {
                summary: '獲取所有會員資料成功範例',
                value: {
                  success: true,
                  message: '獲取所有會員資料成功',
                  data: {
                    users: [
                      {
                        id: 'b38ba5df-3cc5-43d9-bcad-87a57954d7fc',
                        name: '路邊攤',
                        email: 'test@gmail.com',
                        phone: '0422525759',
                        birthday: '2015-04-12',
                        gender: 'm',
                        avatar: '',
                        role: 'consumer',
                        is_blacklisted: false,
                        createdAt: '2025-04-12',
                        updatedAt: '2025-04-12',
                      },
                      {
                        id: '98ec281e-09c1-4caa-b6e0-39ce15d098b4',
                        name: '路邊攤',
                        email: 'example@gmail.com',
                        phone: '0422525759',
                        birthday: '2015-04-12',
                        gender: 'f',
                        avatar: '',
                        role: 'consumer',
                        is_blacklisted: true,
                        createdAt: '2025-04-12',
                        updatedAt: '2025-04-12',
                      },
                      {
                        id: 'a362a6e8-e248-41f7-b75e-98ff6282e16f',
                        name: '管理者',
                        email: 'admin@gmail.com',
                        phone: '00000000',
                        birthday: '2025-04-18',
                        gender: 'm',
                        avatar: '',
                        role: 'admin',
                        is_blacklisted: false,
                        createdAt: '2025-04-18',
                        updatedAt: '2025-04-18',
                      },
                      {
                        id: 'c59d92fb-9d5f-46d3-b551-8192be6d0748',
                        name: '路邊攤測試人',
                        email: 'test1@gmail.com',
                        phone: '0422525759',
                        birthday: '2015-04-12',
                        gender: 'f',
                        avatar: '',
                        role: 'consumer',
                        is_blacklisted: false,
                        createdAt: '2025-04-12',
                        updatedAt: '2025-04-12',
                      },
                    ],
                    pagination: {
                      currentPage: 1,
                      perPage: 10,
                      totalPages: 1,
                      totalItems: 4,
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
    tags: ['adminUser'],
    method: 'get',
    path: '/api/v1/admin/users/{id}',
    summary: '獲取單一會員資料',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: 'a362a6e8-e248-41f7-b75e-98ff6282e16f',
          description: '使用者的 UUID',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得使用者資料成功',
        content: {
          'application/json': {
            schema: user_profileSchema,
            examples: {
              'application/json': {
                summary: '取得使用者資料成功範例',
                value: {
                  message: '取得使用者資料成功',
                  status: true,
                  data: {
                    user: {
                      name: '路邊攤',
                      phone: '0422282252',
                      email: 'example@gmail.com',
                      avatar: 'https://example.com/avatar.jpg',
                      birthday: '2025-04-10',
                      gender: 'M',
                      provider: '',
                      role: 'consumer',
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
        description: '查無此使用者',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '查無此使用者範例',
                value: {
                  message: '查無此使用者',
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
    tags: ['adminUser'],
    method: 'put',
    path: '/api/v1/admin/users/{id}/role',
    summary: '修改會員角色',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: 'b38ba5df-3cc5-43d9-bcad-87a57954d7fc',
          description: '使用者的 UUID',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: user_profileSchema,
            examples: {
              'application/json': {
                summary: '修改會員角色範例',
                value: {
                  role: 'store',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '修改成功',
        content: {
          'application/json': {
            schema: user_profileSchema,
            examples: {
              'application/json': {
                summary: '修改成功範例',
                value: {
                  message: '修改成功',
                  status: true,
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
                  message: '未登入或 token 失效',
                  status: false,
                },
              },
            },
          },
        },
      },
      404: {
        description: '查無此使用者',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '查無此使用者範例',
                value: {
                  message: '查無此使用者',
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
