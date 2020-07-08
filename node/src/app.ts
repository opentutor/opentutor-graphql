import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction, Express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';

import { logger } from 'utils/logging';
import schema from 'gql/schema';

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
    '/grading-api',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
    })
  );
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function (
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
