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
        if (error instanceof RepoError) {
          // 傳業務邏輯錯誤（如：黑名單）到 req.authInfo
          return done(null, false, { message: error.message, statusCode: error.statusCode });
        }
        // 一般系統錯誤
        return done(error as Error, false);
      }
    },
  ),
);

export default passport;
