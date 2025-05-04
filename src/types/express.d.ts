/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { JwtUserPayload } from './JwtUserPayload';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends SerializedUser {} // 擴展 User 類型
    interface Request {
      user: JwtUserPayload;
      brand_id: string;
    }
  }
}
