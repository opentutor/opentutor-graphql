/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { User as UserSchema } from 'models';
import { UserRole } from 'models/User';
import requireEnv from 'utils/require-env';

export const API_USER = 'api_user';

passport.use(
  new BearerStrategy(function (token, done) {
    if (token !== requireEnv('API_SECRET')) {
      return done('invalid api key');
    } else {
      const api_user = {
        _id: API_USER,
        name: API_USER,
        email: API_USER,
        userRole: UserRole.ADMIN,
      };
      return done(null, api_user);
    }
  })
);

passport.use(
  new JwtStrategy(
    {
      secretOrKey: requireEnv('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        if (token.expirationDate < new Date()) {
          return done('token expired', null);
        } else {
          const user = await UserSchema.findOne({ _id: token.id });
          if (user) {
            return done(null, user);
          } else {
            return done('token invalid', null);
          }
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);
