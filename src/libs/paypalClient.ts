import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

export const createPayPalAccessToken = async (): Promise<string> => {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

  const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return res.data.access_token;
};

export const paypalApi = axios.create({
  baseURL: PAYPAL_API,
});
