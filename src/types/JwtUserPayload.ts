export type JwtUserPayload =
  | { id: string; role: 'consumer' }
  | { id: string; role: 'store'; brand_id: string }
  | { id: string; role: 'admin' };
