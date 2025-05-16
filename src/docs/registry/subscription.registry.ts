import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  subscriptionToDTO,
  subscriptionIsRecurringBodySchema,
  subscriptionHistoryToDTO,
  subscriptionPlanBodySchema,
} from '@/features/subscription/subscription.schema';
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
                  status: true,
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
                  status: false,
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
                  status: false,
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
                  status: false,
                  message: '伺服器發生錯誤，請稍後再試。',
                },
              },
            },
          },
        },
      },
    },
  });

  registry.registerPath({
    tags: ['Subscription'],
    method: 'put',
    path: '/api/v1/users/subscriptions/is-recurring',
    summary: '變更自動訂閱',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: subscriptionIsRecurringBodySchema,
            examples: {
              'application/json': {
                summary: '自動訂閱狀態',
                value: {
                  is_recurring: false,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '取消自動訂閱成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              取消訂閱: {
                summary: '取消自動訂閱成功範例',
                value: {
                  status: true,
                  message: '取消自動訂閱成功',
                },
              },
              自動訂閱: {
                summary: '設定自動訂閱成功範例',
                value: {
                  status: true,
                  message: '設定自動訂閱成功',
                },
              },
            },
          },
        },
      },

      400: {
        description: '參數錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '參數錯誤範例',
                value: {
                  status: false,
                  message: '參數錯誤，請確認 is_recurring 為布林值',
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
                  status: false,
                  message: '未登入或 token 失效',
                },
              },
            },
          },
        },
      },

      404: {
        description: '無訂閱資料',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '無訂閱資料範例',
                value: {
                  status: false,
                  message: '找不到無訂閱資料, 請先訂閱',
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
                  status: false,
                  message: '伺服器發生錯誤，請稍後再試。',
                },
              },
            },
          },
        },
      },
    },
  });

  registry.registerPath({
    tags: ['Subscription'],
    method: 'get',
    path: '/api/v1/users/subscriptions/history',
    summary: '訂閱歷史紀錄查詢',
    ...bearerSecurity,
    request: {
      query: z.object({
        currentPage: z.number().optional().openapi({
          description: '目前頁數',
          example: 1,
        }),
        perPage: z.number().optional().openapi({
          description: '每頁顯示的資料數量',
          example: 10,
        }),
      }),
    },
    responses: {
      200: {
        description: '訂閱紀錄取得成功',
        content: {
          'application/json': {
            schema: subscriptionHistoryToDTO,
            examples: {
              'application/json': {
                summary: '訂閱紀錄取得成功範例',
                value: {
                  status: true,
                  message: '訂閱紀錄取得成功',
                  data: {
                    history: [
                      {
                        id: 'fa56a7c7-5589-4197-8265-9626431b4d2f',
                        plan: 'free',
                        status: '',
                        started_at: '2025-02-28 08:00:00',
                        end_at: '2025-03-31 08:00:00',
                        is_recurring: false,
                        cancelled_at: null,
                        paytime: null,
                      },
                    ],
                    pagination: {
                      currentPage: 1,
                      perPage: 10,
                      totalPages: 1,
                      totalItems: 1,
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
                summary: '未登入或 token 失效',
                value: {
                  status: false,
                  message: '未登入或 token 失效',
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
                  status: false,
                  message: '伺服器發生錯誤，請稍後再試',
                },
              },
            },
          },
        },
      },
    },
  });

  registry.registerPath({
    tags: ['Subscription'],
    method: 'put',
    path: '/api/v1/users/subscriptions/plan',
    summary: '變更訂閱方案',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: subscriptionPlanBodySchema,
            examples: {
              'application/json': {
                summary: '變更方案範例',
                value: {
                  plan: 'pro',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '訂閱方案變更成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              變更成功: {
                summary: '方案變更成功範例',
                value: {
                  status: true,
                  message: '訂閱方案變更成功',
                },
              },
              方案重複: {
                summary: '方案重複範例',
                value: {
                  status: true,
                  message: '已是此訂閱方案pro',
                },
              },
            },
          },
        },
      },

      400: {
        description: '參數錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '參數錯誤範例',
                value: {
                  status: false,
                  message: '請提供有效的方案',
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
                  status: false,
                  message: '未登入或 token 失效',
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
                  status: false,
                  message: '伺服器發生錯誤，請稍後再試',
                },
              },
            },
          },
        },
      },
    },
  });
};
