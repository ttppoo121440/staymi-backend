import axios from 'axios';
import qs from 'qs';

import { env, serverUrl } from '@/config/env';

import { LineProfile, LineTokens } from './auth.types';

export class AuthService {
  async getLineToken(code: string): Promise<LineTokens> {
    const tokenRes = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${serverUrl}/api/v1/users/line/callback`,
        client_id: env.LINE_CHANNEL_ID,
        client_secret: env.LINE_CHANNEL_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, id_token } = tokenRes.data;

    if (!access_token || !id_token) {
      throw new Error('LINE 回傳資料異常');
    }

    return { access_token, id_token };
  }
  async getLineUserId(access_token: string): Promise<string> {
    const profileRes = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile: LineProfile = profileRes.data;
    if (!profile.userId) {
      throw new Error('取得 user_id 失敗');
    }

    return profile.userId;
  }
}
