import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { env, serverUrl } from '@/config/env';
import { AuthService } from '@/features/auth/auth.service';
import { RepoError } from '@/utils/appError';

const authService = new AuthService();

//註冊 Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: env.clientID,
      clientSecret: env.clientSecret,
      callbackURL: `${serverUrl}/api/v1/users/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await authService.handleGoogleLogin(profile);
        done(null, user);
      } catch (error) {
        console.error('Google OAuth 錯誤:', error); // 添加日誌

        if (error instanceof RepoError) {
          // 使用 Passport 標準的錯誤處理方式
          return done(null, false, { message: error.message });
        }

        return done(null, false, { message: 'Google 登入失敗' });
      }
    },
  ),
);

export default passport;
