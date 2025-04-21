import jwt from 'jsonwebtoken';

import { Role } from '@/features/auth/auth.schema';

type Payload = {
  id: string;
  email: string;
  brand_id?: string;
  role: Role;
};

export const generateToken = (payload: Payload): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
