/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { JwtUserPayload } from './JwtUserPayload';

declare global {
  namespace Express {
    interface Request {
      user: JwtUserPayload;
      brand_id: string;
    }
  }
}
