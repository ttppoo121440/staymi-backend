import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  hotelImageCreateSchema,
  hotelImageDto,
  hotelImageListDto,
  hotelImageUpdateSchema,
} from '@/features/hotelImage/hotelImage.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerHotelImageRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['HotelImages'],
    method: 'get',
    path: '/api/v1/store/hotel/images',
    summary: '取得飯店分館圖片列表',
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
        description: '取得飯店分館圖片成功',
        content: {
          'application/json': {
            schema: hotelImageListDto,
            examples: {
              'application/json': {
                summary: '取得飯店分館圖片成功範例',
                value: {
                  success: true,
                  message: '取得飯店分館圖片成功',
                  data: {
                    images: [
                      {
                        id: 'a6e6a4ad-8d23-4f78-933f-056a8e83736c',
                        hotel_id: '8c761985-c03d-4b2a-a500-fbe3378a8e52',
                        image_url: 'https://example.com/test-image.jpg',
                        is_cover: true,
                        position: 1,
                        created_at: '2025-05-02T09:30:44.057Z',
                        updated_at: '2025-05-02T09:30:44.057Z',
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
    tags: ['HotelImages'],
    method: 'get',
    path: '/api/v1/store/hotel/images/{id}',
    summary: '取得某一個飯店圖片',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店分館圖片的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得飯店分館圖片成功成功',
        content: {
          'application/json': {
            schema: hotelImageDto,
            examples: {
              'application/json': {
                summary: '取得飯店分館圖片成功範例',
                value: {
                  success: true,
                  message: '取得飯店分館圖片成功',
                  data: {
                    image: {
                      id: '242b2fdf-de54-48f3-8c66-6f59ac3e7c60',
                      hotel_id: 'f6e46aad-6177-4b8b-8d19-207f3d55ee44',
                      image_url: 'https://example.com/test-image.jpg',
                      is_cover: true,
                      position: 1,
                      created_at: '2025-05-03 10:07:43',
                      updated_at: '2025-05-03 10:07:43',
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
              飯店不存在: {
                summary: '飯店不存在範例',
                value: {
                  message: '飯店不存在',
                  status: false,
                },
              },
              圖片不存在: {
                summary: '圖片不存在範例',
                value: {
                  message: '圖片不存在',
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
    tags: ['HotelImages'],
    method: 'post',
    path: '/api/v1/store/hotel/images',
    summary: '新增飯店分館圖片',
    ...bearerSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: hotelImageCreateSchema,
            examples: {
              'application/json': {
                summary: '新增飯店分館圖片成功範例',
                value: {
                  image_url: 'https://example.com/uploads/hotel/room1.jpg',
                  is_cover: false,
                  position: 1,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '新增飯店分館圖片成功',
        content: {
          'application/json': {
            schema: hotelImageDto,
            examples: {
              'application/json': {
                summary: '新增飯店分館圖片成功範例',
                value: {
                  success: true,
                  message: '新增飯店分館圖片成功',
                  data: {
                    image: {
                      id: '14be0851-4cf8-4076-b074-eaff644103ae',
                      hotel_id: 'aaea1218-8db9-4832-bc9f-386d361fa3f9',
                      image_url: 'https://example.com/added.jpg',
                      is_cover: false,
                      position: 2,
                      created_at: '2025-05-03 10:05:31',
                      updated_at: '2025-05-03 10:05:31',
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
                  message: '請上傳圖片',
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
    tags: ['HotelImages'],
    method: 'put',
    path: '/api/v1/store/hotel/images/{id}',
    summary: '更新飯店分館圖片',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店分館圖片的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: hotelImageUpdateSchema,
            examples: {
              'application/json': {
                summary: '更新飯店分館圖片範例',
                value: {
                  mage_url: 'https://example.com/uploads/hotel/room1.jpg',
                  is_cover: false,
                  position: 1,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新飯店分館圖片成功',
        content: {
          'application/json': {
            schema: hotelImageDto,
            examples: {
              'application/json': {
                summary: '更新飯店分館圖片成功範例',
                value: {
                  success: true,
                  message: '更新飯店分館圖片成功',
                  data: {
                    image: {
                      id: '95420998-d96a-4f60-b535-2613a02fa79a',
                      hotel_id: '909e63b4-91c7-48ed-a05a-cfd8f190e5a0',
                      image_url: 'https://example.com/updated-image.jpg',
                      is_cover: false,
                      position: 2,
                      created_at: '2025-05-03 10:06:28',
                      updated_at: '2025-05-03 10:06:30',
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
        description: '飯店不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              飯店不存在: {
                summary: '飯店不存在範例',
                value: {
                  message: '飯店不存在',
                  status: false,
                },
              },
              圖片不存在: {
                summary: '圖片不存在範例',
                value: {
                  message: '圖片不存在',
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
    tags: ['HotelImages'],
    method: 'delete',
    path: '/api/v1/store/hotel/images/{id}',
    summary: '刪除圖片',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '飯店分館圖片的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
      }),
    },
    responses: {
      200: {
        description: '刪除成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
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
        description: '飯店不存在',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              飯店不存在: {
                summary: '飯店不存在範例',
                value: {
                  message: '飯店不存在',
                  status: false,
                },
              },
              圖片不存在: {
                summary: '圖片不存在範例',
                value: {
                  message: '圖片不存在',
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
