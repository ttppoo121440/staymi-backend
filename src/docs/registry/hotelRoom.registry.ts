import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  hotelRoomCreateSchema,
  hotelRoomDto,
  hotelRoomListDto,
  hotelRoomUpdateSchema,
} from '@/features/hotelRoom/hotelRoom.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerHotelRoomRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['HotelRoom'],
    method: 'get',
    path: '/api/v1/store/hotel/hotel-room',
    summary: '取得飯店房間列表',
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
        description: '取得飯店房間列表成功',
        content: {
          'application/json': {
            schema: hotelRoomListDto,
            examples: {
              'application/json': {
                summary: '取得飯店房間列表成功範例',
                value: {
                  success: true,
                  message: '取得飯店房間列表成功',
                  data: {
                    hotelRooms: [
                      {
                        id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                        room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                        basePrice: 2999,
                        description: '明亮舒適的雙人房，配有現代化設施與大面窗景。',
                        imageUrl: 'https://example.com/image.jpg',
                        is_active: true,
                        created_at: '2025-05-03 12:49:35',
                        updated_at: '2025-05-04 12:02:13',
                      },
                      {
                        id: 'a2702717-8145-4e6e-9d34-cb76458839b8',
                        hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                        room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                        basePrice: 4999,
                        description: '包含陽台的海景雙人房。',
                        imageUrl: 'https://example.com/image.jpg',
                        is_active: true,
                        created_at: '2025-05-04 12:17:36',
                        updated_at: '2025-05-04 12:17:36',
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
    tags: ['HotelRoom'],
    method: 'get',
    path: '/api/v1/store/hotel/hotel-room/{id}',
    summary: '取得某一個飯店房間',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店房間的唯一識別碼',
          example: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得某一個飯店房間成功',
        content: {
          'application/json': {
            schema: hotelRoomDto,
            examples: {
              'application/json': {
                summary: '取得某一個飯店房間成功範例',
                value: {
                  success: true,
                  message: '取得飯店房間資料成功',
                  data: {
                    hotelRoom: {
                      id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                      basePrice: 2999,
                      description: '明亮舒適的雙人房，配有現代化設施與大面窗景。',
                      imageUrl: 'https://example.com/image.jpg',
                      is_active: true,
                      created_at: '2025-05-03 12:49:35',
                      updated_at: '2025-05-04 12:02:13',
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
        description: '飯店房間不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '飯店房間不存在範例',
                value: {
                  message: '飯店房間不存在',
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
    tags: ['HotelRoom'],
    method: 'post',
    path: '/api/v1/store/hotel/hotel-room',
    summary: '新增飯店房間',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: hotelRoomCreateSchema,
            examples: {
              'application/json': {
                summary: '新增飯店房間範例',
                value: {
                  hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                  room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                  basePrice: 4999,
                  description: '包含陽台的海景雙人房。',
                  imageUrl: 'https://example.com/image.jpg',
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
        description: '新增飯店房間成功',
        content: {
          'application/json': {
            schema: hotelRoomDto,
            examples: {
              'application/json': {
                summary: '新增飯店房間成功範例',
                value: {
                  success: true,
                  message: '創建飯店房間成功',
                  data: {
                    hotelRoom: {
                      id: 'a2702717-8145-4e6e-9d34-cb76458839b8',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                      basePrice: 4999,
                      description: '包含陽台的海景雙人房。',
                      imageUrl: 'https://example.com/image.jpg',
                      is_active: true,
                      created_at: '2025-05-04 12:17:36',
                      updated_at: '2025-05-04 12:17:36',
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
                  success: false,
                  message: '請填寫原始金額',
                  data: null,
                },
              },
              資料格式不正確範例: {
                summary: '資料格式不正確範例',
                value: {
                  success: false,
                  message: '金額不得小於 1',
                  data: null,
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
    tags: ['HotelRoom'],
    method: 'put',
    path: '/api/v1/store/hotel/hotel-room/{id}',
    summary: '修改飯店房間',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店房間的唯一識別碼',
          example: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: hotelRoomUpdateSchema,
            examples: {
              'application/json': {
                summary: '修改飯店房間範例',
                value: {
                  basePrice: 2999,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新飯店房間成功',
        content: {
          'application/json': {
            schema: hotelRoomDto,
            examples: {
              'application/json': {
                summary: '更新飯店房間成功範例',
                value: {
                  success: true,
                  message: '更新飯店房間成功',
                  data: {
                    hotelRoom: {
                      id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                      basePrice: 2999,
                      description: '明亮舒適的雙人房，配有現代化設施與大面窗景。',
                      imageUrl: 'https://example.com/image.jpg',
                      is_active: true,
                      created_at: '2025-05-03 12:49:35',
                      updated_at: '2025-05-04 12:46:31',
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
        description: '房間不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '房間不存在範例',
                value: {
                  message: '房間不存在',
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
    tags: ['HotelRoom'],
    method: 'patch',
    path: '/api/v1/store/hotel/hotel-room/{id}/active',
    summary: '切換飯店房間狀態',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店房間的唯一識別碼',
          example: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
        }),
      }),
    },
    responses: {
      200: {
        description: '飯店房間狀態切換成功',
        content: {
          'application/json': {
            schema: hotelRoomDto,
            examples: {
              'application/json': {
                summary: '狀態切換成功範例',
                value: {
                  success: true,
                  message: '飯店房間狀態切換成功',
                  data: {
                    hotelRoom: {
                      id: 'd38fb3a9-5901-4311-9af1-4cf01fa066e4',
                      hotel_id: '17c1be02-9e39-4628-b47e-7598eab4963a',
                      room_type_id: 'd59c40d8-cc4a-45b0-929f-4282091b6302',
                      basePrice: 2999,
                      description: '明亮舒適的雙人房，配有現代化設施與大面窗景。',
                      imageUrl: 'https://example.com/image.jpg',
                      is_active: false,
                      created_at: '2025-05-03 12:49:35',
                      updated_at: '2025-05-04 12:55:58',
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
        description: '房間不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '房間不存在範例',
                value: {
                  message: '房間不存在',
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
    tags: ['HotelRoom'],
    method: 'delete',
    path: '/api/v1/store/hotel/hotel-room/{id}',
    summary: '刪除飯店房間',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店房間的唯一識別碼',
          example: 'a2702717-8145-4e6e-9d34-cb76458839b8',
        }),
      }),
    },
    responses: {
      200: {
        description: '飯店房間刪除成功',
        content: {
          'application/json': {
            schema: hotelRoomDto,
            examples: {
              'application/json': {
                summary: '刪除成功範例',
                value: {
                  success: true,
                  message: '刪除成功',
                  data: null,
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
        description: '房間不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '房間不存在範例',
                value: {
                  message: '房間不存在',
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
