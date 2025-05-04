import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import {
  productsCreateSchema,
  productsDto,
  productsListDto,
  productsUpdateSchema,
} from '@/features/product/products.schema';
import { swaggerResponseSchema } from '@/types/swaggerSchema';

import { bearerSecurity } from '../swagger';

export const registerProductRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['Products'],
    method: 'get',
    path: '/api/v1/store/hotel/{hotel_id}/products',
    summary: '取得伴手禮列表',
    ...bearerSecurity,
    request: {
      params: z.object({
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
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
        description: '取得伴手禮列表成功',
        content: {
          'application/json': {
            schema: productsListDto,
            examples: {
              'application/json': {
                summary: '取得伴手禮列表成功範例',
                value: {
                  success: true,
                  message: '取得伴手禮列表成功',
                  data: {
                    products: [
                      {
                        id: 'c5003cd4-f981-4382-97e3-adf4b3348e41',
                        hotel_id: 'd76c7933-9c27-4720-aea8-7b410c9160bb',
                        name: '測試產品',
                        features: '測試特色',
                        description: '這是一個測試產品',
                        imageUrl: 'https://example.com/image.jpg',
                        created_at: '2025-05-03 21:13:38',
                        updated_at: '2025-05-03 21:13:38',
                      },
                      {
                        id: 'dae7ea18-6db8-464e-9dcd-637f272e513c',
                        hotel_id: 'd76c7933-9c27-4720-aea8-7b410c9160bb',
                        name: '測試產品1',
                        features: '測試特色1',
                        description: '這是一個測試產品1',
                        imageUrl: 'https://example.com/image1.jpg',
                        created_at: '2025-05-03 21:13:38',
                        updated_at: '2025-05-03 21:13:38',
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
    tags: ['Products'],
    method: 'get',
    path: '/api/v1/store/hotel/{hotel_id}/products/{id}',
    summary: '取得伴手禮',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '伴手禮的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
    },
    responses: {
      200: {
        description: '取得伴手禮成功',
        content: {
          'application/json': {
            schema: productsDto,
            examples: {
              'application/json': {
                summary: '取得伴手禮成功範例',
                value: {
                  success: true,
                  message: '取得伴手禮成功 ',
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
              查無此伴手禮: {
                summary: '查無此伴手禮範例',
                value: {
                  message: '查無此伴手禮',
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
    tags: ['Products'],
    method: 'post',
    path: '/api/v1/store/hotel/{hotel_id}/products',
    summary: '新增伴手禮',
    ...bearerSecurity,
    request: {
      params: z.object({
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: productsCreateSchema,
            examples: {
              'application/json': {
                summary: '新增伴手禮範例',
                value: {
                  name: '新增測試產品',
                  description: '這是一個新增測試產品',
                  features: '測試新增特色',
                  imageUrl: 'https://example.com/test-product.jpg',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: '新增伴手禮成功',
        content: {
          'application/json': {
            schema: productsDto,
            examples: {
              'application/json': {
                summary: '新增伴手禮成功範例',
                value: {
                  success: true,
                  message: '新增伴手禮成功',
                  data: {
                    product: {
                      id: '35793f76-f58a-46fa-b128-2c419f243e61',
                      hotel_id: 'a7a4779c-69a2-45c6-b802-1fe1746c6a05',
                      name: '新增測試產品',
                      features: '測試新增特色',
                      description: '這是一個新增測試產品',
                      imageUrl: 'https://example.com/test-product.jpg',
                      created_at: '2025-05-03 21:08:54',
                      updated_at: '2025-05-03 21:08:54',
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
                  message: '請輸入正確格式',
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
    tags: ['Products'],
    method: 'put',
    path: '/api/v1/store/hotel/{hotel_id}/products/{id}',
    summary: '更新伴手禮',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '伴手禮的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
      body: {
        content: {
          'application/json': {
            schema: productsUpdateSchema,
            examples: {
              'application/json': {
                summary: '更新伴手禮範例',
                value: {
                  name: '招牌鳳梨酥禮盒',
                  feature: '在地食材製作，低糖健康',
                  description: '來高雄一定要帶走的伴手禮！嚴選台灣土鳳梨製成。',
                  imageUrl: 'https://example.com/images/pineapple-cake.jpg',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '更新伴手禮成功',
        content: {
          'application/json': {
            schema: productsDto,
            examples: {
              'application/json': {
                summary: '更新伴手禮成功範例',
                value: {
                  success: true,
                  message: '更新伴手禮成功',
                  data: {
                    product: {
                      id: 'a640b5d6-2018-4c47-a66c-e2a78f00af27',
                      hotel_id: '3bf764c4-b0e9-427d-bccc-e70390a62317',
                      name: '更新後產品',
                      features: '更新後特色',
                      description: '這是更新後的描述',
                      imageUrl: 'https://example.com/after.jpg',
                      created_at: '2025-05-03 21:39:49',
                      updated_at: '2025-05-03 21:39:52',
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
              查無此伴手禮: {
                summary: '查無此伴手禮範例',
                value: {
                  message: '查無此伴手禮',
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
    tags: ['Products'],
    method: 'patch',
    path: '/api/v1/store/hotel/{hotel_id}/products/{id}',
    summary: '刪除伴手禮',
    ...bearerSecurity,
    request: {
      params: z.object({
        id: z.string().uuid().openapi({
          description: '伴手禮的唯一識別碼',
          example: '1007a1a8-fd54-4b69-857b-cf9fedee1ae1',
        }),
        hotel_id: z.string().uuid().openapi({
          description: '飯店的唯一識別碼',
          example: '2d4e0239-766a-4b7b-a38a-2077be3f60ce',
        }),
      }),
    },
    responses: {
      200: {
        description: '刪除伴手禮成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '刪除伴手禮成功範例',
                value: {
                  success: true,
                  message: '刪除伴手禮成功',
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
              查無此伴手禮: {
                summary: '查無此伴手禮範例',
                value: {
                  message: '查無此伴手禮',
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
