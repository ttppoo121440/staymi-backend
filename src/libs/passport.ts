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
          return done(null, false, {
            message: error.message,
            statusCode: error.statusCode,
          });
        }

        return done(null, false, {
          message: 'Google 登入失敗',
          statusCode: 500,
        });
      }
    },
  ),
);

export default passport;
