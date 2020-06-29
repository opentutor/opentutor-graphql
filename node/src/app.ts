import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction, Express } from 'express';
import expressValidator from 'express-validator';
import graphqlHTTP from 'express-graphql';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';

import { logger } from './utils/logging';
import schema from './graphql/schema';

export default async function createApp(): Promise<Express> {
  if (process.env.NODE_ENV !== 'production') {
    require('longjohn'); // full stack traces when testing
  }
  const configureEnv = (await import('./utils/configure-env')).default;
  configureEnv();
  if (process.env['APP_DISABLE_AUTO_START'] !== 'true') {
    await appStart();
  }
  const app = express();
  if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan('dev'));
  }
  app.use(cors());
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    expressValidator({
      customValidators: {
        isArray: function(value: any) {
          return Array.isArray(value);
        },
        gte: function(param: any, num: any) {
          return param >= num;
        },
      },
    })
  );
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(require('./middlewares/send-404')());
  app.use(require('./middlewares/send-object')()); // special handling for mongoose objects (like convert to string array if array of objects with only id)
  app.use(require('./middlewares/fields-parser')()); // special handling for mongoose objects (like convert to string array if array of objects with only id)
  app.use(function(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore-next-line
    res.send404(); // replace this with an imported function that takes a Response as param
  });
  app.use(function(
    err: any,
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
        (!isNaN(err.status) && Number(err.status) > 0) ||
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

export async function appStart() {
  const mongooseConnect = (await import('./utils/mongoose-connect')).default;
  await mongooseConnect(process.env.MONGO_URI);
}

export async function appStop() {
  try {
    mongoose.connection.removeAllListeners();
    await mongoose.disconnect();
  } catch (err) {
    logger.error('error on mongoose disconnect: ' + err);
  }
}
