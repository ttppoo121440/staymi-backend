import axios from 'axios';
import qs from 'qs';

import { env, serverUrl } from '@/config/env';
import { generateToken } from '@/utils/jwt';

import { AuthRepo } from './auth.repo';
import { LineProfile, LineTokens, ProfileType, UserInfoType } from './auth.types';

export class AuthService {
  constructor(private authRepo = new AuthRepo()) {}
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

  async handleGoogleLogin(profile: ProfileType): Promise<UserInfoType & { token: string }> {
    try {
      const user = await this.findOrCreateGoogleUser(profile);
      const token = generateToken({ id: user.id, role: user.role });
      return { ...user, token };
    } catch (error) {
      throw new Error('Google 登入處理失敗');
    }
  }

  async findOrCreateGoogleUser(profile: ProfileType): Promise<UserInfoType> {
    const providerId = profile.id;
    const email = profile.emails?.[0].value;
    const name = profile.displayName;
    const avatar = profile.photos?.[0]?.value;

    const existingUser = await this.authRepo.findUserByProviderId(providerId);

    if (existingUser) return existingUser;

    return await this.authRepo.createByProvider({
      email,
      name,
      avatar,
      provider: 'google',
      providerId,
    });
  }
}
