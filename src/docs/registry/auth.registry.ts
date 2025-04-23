import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
  AuthArrayResponseSchema,
  AuthCreateSchema,
  AuthLoginSchema,
  AuthResponseSchema,
  AuthUpdatePasswordSchema,
} from '@/features/auth/auth.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

export const registerAuthRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['Auth'],
    method: 'post',
    path: '/api/v1/users/signup',
    summary: '註冊',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AuthCreateSchema,
            examples: {
              'application/json': {
                summary: '用戶註冊範例',
                value: {
                  name: '路邊攤',
                  email: 'example@gmail.com',
                  password: 'AAbbcc12345678',
                  provider: '',
                  provider_id: '',
                  phone: '0422525759',
                  birthday: '2015-04-12',
                  gender: 'f',
                  avatar: '',
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
            schema: AuthArrayResponseSchema,
            examples: {
              'application/json': {
                summary: '註冊成功範例',
                value: {
                  success: true,
                  message: '登入成功',
                  data: {
                    token:
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4ZWMyODFlLTA5YzEtNGNhYS1iNmUwLTM5Y2UxNWQwOThiNCIsImVtYWlsIjoiZXhhbXBsZUBnbWFpbC5jb20iLCJpYXQiOjE3NDQ0MzQzMjcsImV4cCI6MTc0NDQ3NzUyN30.Q2NXxBXhGjAAC0RRqJGOeuYkRbWoQ3VOI6ENZzFgCgI',
                    user: {
                      name: '路邊攤',
                      avatar: '',
                    },
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
        description: '資料衝突',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '資料衝突範例',
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
    tags: ['Auth'],
    method: 'post',
    path: '/api/v1/users/login',
    summary: '登入',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AuthLoginSchema,
            examples: {
              'application/json': {
                summary: '用戶登入範例',
                value: {
                  email: 'admin@gmail.com',
                  password: '11111111',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '用戶登入成功',
        content: {
          'application/json': {
            schema: AuthResponseSchema,
            examples: {
              'application/json': {
                summary: '用戶登入範例',
                value: {
                  success: true,
                  message: '登入成功',
                  data: {
                    token:
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk4ZWMyODFlLTA5YzEtNGNhYS1iNmUwLTM5Y2UxNWQwOThiNCIsImVtYWlsIjoiZXhhbXBsZUBnbWFpbC5jb20iLCJpYXQiOjE3NDQ0MzQzMjcsImV4cCI6MTc0NDQ3NzUyN30.Q2NXxBXhGjAAC0RRqJGOeuYkRbWoQ3VOI6ENZzFgCgI',
                    user: {
                      name: '路邊攤',
                      avatar: '',
                    },
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
        description: '信箱或密碼錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '信箱或密碼錯誤範例',
                value: {
                  message: '信箱或密碼錯誤',
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
    tags: ['Auth'],
    method: 'put',
    path: '/api/v1/users/change-password',
    summary: '修改密碼',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AuthUpdatePasswordSchema,
            examples: {
              'application/json': {
                summary: '修改密碼範例',
                value: {
                  oldPassword: 'password123',
                  newPassword: 'new_password456',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '密碼修改成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '密碼修改成功範例',
                value: {
                  message: '密碼修改成功',
                  status: true,
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
                  message: '新密碼長度至少 8 碼',
                  status: false,
                },
              },
              'application/json (新密碼不能與舊密碼相同)': {
                summary: '新密碼不能與舊密碼相同範例',
                value: {
                  message: '新密碼不能與舊密碼相同',
                  status: false,
                },
              },
            },
          },
        },
      },
      401: {
        description: '舊密碼錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '舊密碼錯誤範例',
                value: {
                  message: '舊密碼錯誤',
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
