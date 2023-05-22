/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import cors from 'cors';
import express, { Request, Response, NextFunction, Express } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import { logger } from 'utils/logging';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { User as UserModel } from 'models';
import { UserRole } from 'models/User';
import requireEnv from 'utils/require-env';

const API_USER = 'api_user';

export async function createApp(): Promise<Express> {
  const gqlMiddleware = (await import('gql/middleware')).default;
  if (process.env.NODE_ENV !== 'production') {
    require('longjohn'); // full stack traces when testing
  }
  const configureEnv = (await import('utils/configure-env')).default;
  configureEnv();
  if (process.env['APP_DISABLE_AUTO_START'] !== 'true') {
    await appStart();
  }
  const API_SECRET = requireEnv('API_SECRET');
  passport.use(
    new BearerStrategy(function (token, done) {
      if (token !== API_SECRET) {
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
  const JWT_SECRET = requireEnv('JWT_SECRET');
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        try {
          if (token.expirationDate < new Date()) {
            return done('token expired', null);
          } else {
            const user = await UserModel.findOne({ _id: token.id });
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
  const app = express();
  if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use('/graphql', gqlMiddleware);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function (
    err: { message?: string; status?: string | number },
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    let errorStatus = 500;
    let errorMessage = '';
    if (!isNaN(Number(err))) {
      errorStatus = err as number;
    }
    if (err instanceof Object) {
      errorStatus =
        (!isNaN(Number(err.status)) && Number(err.status) > 0) ||
        Number(err.status) < 600
          ? Number(err.status)
          : 500;
      errorMessage = err.message || '';
    }
    if (err instanceof Error && errorStatus >= 500) {
      logger.error(err.stack);
    }
    res.status(errorStatus);
    res.send({
      message: errorMessage,
      status: errorStatus,
    });
  });
  return app;
}

export async function appStart(): Promise<void> {
  const mongooseConnect = (await import('utils/mongoose-connect')).default;
  await mongooseConnect(process.env.MONGO_URI);
}

export async function appStop(): Promise<void> {
  try {
    mongoose.connection.removeAllListeners();
    await mongoose.disconnect();
  } catch (err) {
    logger.error('error on mongoose disconnect: ' + err);
  }
}

export default createApp;
