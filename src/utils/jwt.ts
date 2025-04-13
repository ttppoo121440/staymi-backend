import jwt from 'jsonwebtoken';

type Payload = {
  id: string;
  email: string;
  brand_id?: string;
  role?: 'admin' | 'store' | 'user';
};

export const generateToken = (payload: Payload): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
