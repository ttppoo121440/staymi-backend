export type JwtUserPayload =
  | { id: string; email: string; role: 'consumer' }
  | { id: string; email: string; role: 'store'; brand_id: string }
  | { id: string; email: string; role: 'admin' };
