import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { swaggerResponseSchema } from '@/types/swaggerSchema';

export const registerImageUploadRoutes = (registry: OpenAPIRegistry): void => {
  registry.registerPath({
    tags: ['ImageUpload'],
    method: 'post',
    path: '/api/v1/upload',
    summary: '上傳圖片',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.string().openapi({ format: 'binary' }),
            }),
            examples: {
              'multipart/form-data': {
                summary: '上傳圖片範例',
                value: {
                  file: 'image.jpg',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: '圖片上傳成功',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              'application/json': {
                summary: '圖片上傳成功範例',
                value: {
                  success: true,
                  message: '上傳成功',
                  data: {
                    image: {
                      url: 'https://res.cloudinary.com/dwq2ehew4/image/upload/v1745209931/stay-mi/image/b38ba5df-3cc5-43d9-bcad-87a57954d7fc/pexels-photo-13180141.jpg',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: '請求錯誤，可能是缺少檔案、檔案過大或格式錯誤',
        content: {
          'application/json': {
            schema: swaggerResponseSchema,
            examples: {
              missingFile: {
                summary: '缺少檔案',
                value: {
                  success: false,
                  message: '請上傳圖片',
                },
              },
              fileTooLarge: {
                summary: '檔案過大',
                value: {
                  success: false,
                  message: '圖片大小不能超過 1MB',
                },
              },
              invalidFileType: {
                summary: '檔案格式錯誤',
                value: {
                  success: false,
                  message: '只接受 PNG、JPEG、JPG 圖片格式',
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
