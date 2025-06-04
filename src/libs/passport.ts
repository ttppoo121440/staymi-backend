import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { env, serverUrl } from '@/config/env';
import { AuthService } from '@/features/auth/auth.service';
import { RepoError } from '@/utils/appError';

const authService = new AuthService();

passport.use(
  new GoogleStrategy(
    {
      clientID: env.clientID,
      clientSecret: env.clientSecret,
      callbackURL: `${serverUrl}/api/v1/users/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        console.log('處理 Google 登入，profile:', JSON.stringify(profile, null, 2));
        const user = await authService.handleGoogleLogin(profile);
        console.log('登入成功，user:', user);
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth 錯誤:', error);

        if (error instanceof RepoError) {
          // 重要：第二個參數傳入 false，第三個參數傳入錯誤資訊
          return done(null, false, {
            message: error.message,
            statusCode: error.statusCode,
          });
        }

        // 處理其他錯誤
        return done(null, false, {
          message: 'Google 登入失敗',
          statusCode: 500,
        });
      }
    },
  ),
);

export default passport;
