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

export const registerHotelRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['Hotel'],
    method: 'get',
    path: '/api/v1/store/hotel',
    summary: '取得飯店列表',
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
        description: '取得飯店列表成功',
        content: {
          'application/json': {
            schema: hotelListToDto,
            examples: {
              'application/json': {
                summary: '取得飯店列表成功範例',
                value: {
                  success: true,
                  message: '取得飯店列表成功',
                  data: {
                    hotels: [
                      {
                        id: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
                        brand_id: '0c02fdb9-b693-456e-b2bf-a959d71a8dcc',
                        region: '台中',
                        name: '測試商家飯店一號',
                        address: '台中市中區自由路一段 123 號',
                        phone: '0912123123',
                        transportation: '近台中火車站',
                        hotel_policies: '禁止吸菸',
                        latitude: '24.147736',
                        longitude: '120.673648',
                        hotel_facilities: ['WiFi', '電視'],
                        is_active: true,
                        created_at: '2025-04-27 18:00:42',
                        updated_at: '2025-04-27 18:00:42',
                      },
                      {
                        id: '7dc1537e-af08-4377-8fb6-f28ed75233e4',
                        brand_id: '0c02fdb9-b693-456e-b2bf-a959d71a8dcc',
                        region: '台北',
                        name: '測試商家飯店二號',
                        address: '台北市信義區市府路 45 號',
                        phone: '0987654321',
                        transportation: '近捷運市政府站',
                        hotel_policies: '寵物友善',
                        latitude: '25.033964',
                        longitude: '121.562321',
                        hotel_facilities: ['游泳池', '健身房'],
                        is_active: true,
                        created_at: '2025-04-27 18:00:42',
                        updated_at: '2025-04-27 18:00:42',
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
    tags: ['Hotel'],
    method: 'get',
    path: '/api/v1/store/hotel/{id}',
    summary: '取得某一個飯店',
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
        description: '取得某一個飯店成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '取得某一個飯店成功範例',
                value: {
                  success: true,
                  message: '取得飯店資料成功',
                  data: {
                    hotel: {
                      id: 'c9ac6316-d727-464a-a8ad-4392e110dcfb',
                      brand_id: '30b7c83c-7a10-436b-ae9b-db41d5b349b1',
                      region: '台中',
                      name: '測試測試飯店',
                      address: '台中市中區自由路一段 123 號',
                      phone: '0912123123',
                      transportation: '近台中火車站',
                      hotel_policies: '禁止吸菸',
                      latitude: '24.147736',
                      longitude: '120.673648',
                      hotel_facilities: ['WiFi', '電視'],
                      is_active: true,
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
    tags: ['Hotel'],
    method: 'post',
    path: '/api/v1/store/hotel',
    summary: '新增飯店',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: hotelCreateSchema,
            examples: {
              'application/json': {
                summary: '新增飯店範例',
                value: {
                  region: '台中',
                  name: '測試測試飯店',
                  address: '台中市中區自由路一段 123 號',
                  phone: '0912123123',
                  transportation: '近台中火車站',
                  hotel_policies: '禁止吸菸',
                  latitude: '24.147736',
                  longitude: '120.673648',
                  hotel_facilities: ['WiFi', '電視'],
                  is_active: true,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '新增飯店成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '新增飯店成功範例',
                value: {
                  success: true,
                  message: '新增飯店成功',
                  data: {
                    id: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
                    brand_id: '0c02fdb9-b693-456e-b2bf-a959d71a8dcc',
                    region: '台中',
                    name: '測試商家飯店一號',
                    address: '台中市中區自由路一段 123 號',
                    phone: '0912123123',
                    transportation: '近台中火車站',
                    hotel_policies: '禁止吸菸',
                    latitude: '24.147736',
                    longitude: '120.673648',
                    hotel_facilities: ['WiFi', '電視'],
                    is_active: true,
                    created_at: '2025-04-27 18:00:42',
                    updated_at: '2025-04-27 18:00:42',
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
      409: {
        description: '飯店名稱已存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '飯店名稱已存在範例',
                value: {
                  message: '飯店名稱已存在',
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
    tags: ['Hotel'],
    method: 'put',
    path: '/api/v1/store/hotel/{id}',
    summary: '修改飯店',
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
                summary: '修改飯店範例',
                value: {
                  region: '台中',
                  name: '測試測試飯店',
                  address: '台中市中區自由路一段 123 號',
                  phone: '0912123123',
                  transportation: '近台中火車站',
                  hotel_policies: '禁止吸菸',
                  latitude: '24.147736',
                  longitude: '120.673648',
                  hotel_facilities: ['WiFi', '電視'],
                  is_active: true,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '修改飯店成功',
        content: {
          'application/json': {
            schema: hotelToDto,
            examples: {
              'application/json': {
                summary: '修改飯店成功範例',
                value: {
                  success: true,
                  message: '修改飯店成功',
                  data: {
                    id: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
                    brand_id: '0c02fdb9-b693-456e-b2bf-a959d71a8dcc',
                    region: '台中',
                    name: '測試商家飯店一號',
                    address: '台中市中區自由路一段 123 號',
                    phone: '0912123123',
                    transportation: '近台中火車站',
                    hotel_policies: '禁止吸菸',
                    latitude: '24.147736',
                    longitude: '120.673648',
                    hotel_facilities: ['WiFi', '電視'],
                    is_active: true,
                    created_at: '2025-04-27 18:00:42',
                    updated_at: '2025-04-27 18:00:42',
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
      409: {
        description: '飯店名稱已存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '飯店名稱已存在範例',
                value: {
                  message: '飯店名稱已存在',
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
