import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { subscriptionToDTO } from '@/features/subscription/subscription.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerSubscriptionRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['Subscription'],
    method: 'get',
    path: '/api/v1/users/subscriptions',
    summary: '查詢個人訂閱狀態',
    ...bearerSecurity,
    responses: {
      200: {
        description: '查詢個人訂閱狀態成功',
        content: {
          'application/json': {
            schema: subscriptionToDTO,
            examples: {
              'application/json': {
                summary: '查詢個人訂閱狀態成功範例',
                value: {
                  success: true,
                  message: '查詢個人訂閱狀態成功',
                  data: {
                    subscriptions: {
                      plan: 'free',
                      end_at: '2025-04-28',
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
                summary: '未登入或 token 失效範例',
                value: {
                  success: false,
                  message: '未登入或 token 失效',
                },
              },
            },
          },
        },
      },
      404: {
        description: '查無訂閱資料',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '查無訂閱資料範例',
                value: {
                  success: false,
                  message: '找不到訂閱資料',
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
                  success: false,
                  message: '伺服器發生錯誤，請稍後再試。',
                },
              },
            },
          },
        },
      },
    },
  });
};
