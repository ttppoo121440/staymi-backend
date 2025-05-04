import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { env, serverUrl } from '@/config/env';
import { AuthService } from '@/features/auth/auth.service';

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
        done(error as Error, false);
      }
    },
  ),
);

export default passport;
