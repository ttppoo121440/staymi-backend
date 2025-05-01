import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  hotelCreateSchema,
  hotelToDto,
  hotelListToDto,
  hotelUpdateSchema,
} from '@/features/storeHotel/storeHotel.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerRoomTypeRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['RoomType'],
    method: 'get',
    path: '/api/v1/store/hotel/room-type',
    summary: '取得飯店房型列表',
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
        description: '取得飯店房型列表成功',
        content: {
          'application/json': {
            schema: hotelListToDto,
            examples: {
              'application/json': {
                summary: '取得飯店房型列表成功範例',
                value: {
                  success: true,
                  message: '取得飯店房型列表成功',
                  data: {
                    roomTypes: [
                      {
                        id: '28691c26-2639-4f3a-9d39-2c76a67ae1b7',
                        brand_id: 'd61b8cf3-4ee7-42c6-951a-76f094474080',
                        name: '測試房間1',
                        description: '測試房間描述1',
                        room_service: ['Wi-Fi', '早餐'],
                        created_at: '2025-04-28 19:11:34',
                        updated_at: '2025-04-28 19:11:34',
                      },
                      {
                        id: '4a870d1c-a724-416c-a004-14f2f3cb9fc1',
                        brand_id: 'd61b8cf3-4ee7-42c6-951a-76f094474080',
                        name: '測試房間2',
                        description: '測試房間描述2',
                        room_service: ['Wi-Fi', '健身房'],
                        created_at: '2025-04-28 19:11:34',
                        updated_at: '2025-04-28 19:11:34',
                      },
                    ],
                    pagination: {
                      currentPage: 1,
                      perPage: 10,
                      totalPages: 1,
                      totalItems: 2,
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
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              '沒有 brand_id 範例': {
                summary: '沒有 brand_id 範例',
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
    tags: ['RoomType'],
    method: 'get',
    path: '/api/v1/store/hotel/room-type/{id}',
    summary: '取得某一個飯店房型',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得某一個飯店房型成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '取得某一個飯店房型成功範例',
                value: {
                  success: true,
                  message: '取得飯店房型成功',
                  data: {
                    roomType: {
                      id: 'ccfd02d9-55d8-4b04-a4a7-8b0b7b03cb5e',
                      brand_id: '522c4a14-7439-4c9c-8393-01194e969fe3',
                      name: '測試房間',
                      description: '測試房間描述',
                      room_service: ['Wi-Fi', '早餐'],
                      created_at: '1970-01-01 08:00:00',
                      updated_at: '1970-01-01 08:00:00',
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
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              '沒有 brand_id 範例': {
                summary: '沒有 brand_id 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
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
        description: '飯店不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '飯店不存在範例',
                value: {
                  message: '飯店不存在',
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
    tags: ['RoomType'],
    method: 'post',
    path: '/api/v1/store/hotel/room-type',
    summary: '新增飯店房型',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: hotelCreateSchema,
            examples: {
              'application/json': {
                summary: '新增飯店房型範例',
                value: {
                  name: '單人房',
                  description: '這是一個單人房的範例',
                  room_service: ['房間清潔', '床單更換', '洗衣服務', '早餐服務'],
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '新增飯店房型成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '新增飯店房型成功範例',
                value: {
                  success: true,
                  message: '創建飯店房型成功',
                  data: {
                    roomType: {
                      id: '575e0f5e-bace-44df-8c82-e51444301b23',
                      brand_id: '60bf0b7b-bf9a-49a1-aed1-1a6ed7ae8338',
                      name: '測試房間',
                      description: '測試房間描述',
                      room_service: ['Wi-Fi', '早餐'],
                      created_at: '1970-01-01 08:00:00',
                      updated_at: '1970-01-01 08:00:00',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              缺少必要欄位應回傳範例: {
                summary: '缺少必要欄位應回傳範例',
                value: {
                  message: '請輸入飯店房型描述',
                  status: false,
                },
              },
              資料格式不正確範例: {
                summary: '資料格式不正確範例',
                value: {
                  message: '請選擇飯店房型服務',
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
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              '沒有 brand_id 範例': {
                summary: '沒有 brand_id 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
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
    tags: ['RoomType'],
    method: 'put',
    path: '/api/v1/store/hotel/room-type/{id}',
    summary: '修改飯店房型',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: hotelUpdateSchema,
            examples: {
              'application/json': {
                summary: '修改飯店房型範例',
                value: {
                  name: '單人房',
                  description: '這是一個單人房的範例',
                  room_service: ['房間清潔', '床單更換', '洗衣服務', '早餐服務'],
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新飯店房型成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '更新飯店房型成功範例',
                value: {
                  success: true,
                  message: '更新飯店房型成功',
                  data: {
                    roomType: {
                      id: '25b5b4e9-3716-4a23-b1fd-c03a8f0d0d7d',
                      brand_id: 'b5d96efe-599c-45bc-aff9-f03346b1a77a',
                      name: '更新後的房型名稱',
                      description: '更新後的房型描述',
                      room_service: ['Wi-Fi', '健身房'],
                      created_at: '1970-01-01 08:00:00',
                      updated_at: '1970-01-01 08:00:00',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '請求錯誤範例',
                value: {
                  message: '請求錯誤，可能是缺少必要欄位或資料格式不正確',
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
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              '沒有 brand_id 範例': {
                summary: '沒有 brand_id 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
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
        description: '房型不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '房型不存在範例',
                value: {
                  message: '房型不存在',
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
    tags: ['RoomType'],
    method: 'delete',
    path: '/api/v1/store/hotel/room-type/{id}',
    summary: '刪除飯店房型',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
    },
    responses: {
      200: {
        description: '刪除成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '刪除成功範例',
                value: {
                  success: true,
                  message: '刪除成功',
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
              '不是 store 身份 範例': {
                summary: '不是 store 身份 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              '沒有 brand_id 範例': {
                summary: '沒有 brand_id 範例',
                value: {
                  message: '無權限訪問此資源',
                  status: false,
                },
              },
              非本人品牌操作範例: {
                summary: '非本人品牌操作範例',
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
        description: '房型不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '房型不存在範例',
                value: {
                  message: '房型不存在',
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
