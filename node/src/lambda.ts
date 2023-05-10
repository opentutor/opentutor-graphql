/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import * as Sentry from '@sentry/serverless';
import { createApp } from './app';
import process from 'process';
import logger from './utils/logging';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverless = require('serverless-http');

logger.info('starting server');
logger.info(`node env: '${process.env.NODE_ENV}'`);
logger.debug('node version ' + process.version);

if (process.env.IS_SENTRY_ENABLED === 'true') {
  logger.info(`sentry enabled, calling init on ${process.env.NODE_ENV}`);
  Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN_MENTOR_GRAPHQL,
    environment: process.env.NODE_ENV,
    // configure sample of errors to send for performance monitoring (1.0 for 100%)
    // @see https://docs.sentry.io/platforms/javascript/configuration/sampling/
    ...(process.env.STAGE == 'prod' && { tracesSampleRate: 0.25 }),
    ...(process.env.SENTRY_DEBUG && { debug: true }),
    sendClientReports: false,
  });
}

/**
 * We want to call init only once during cold start.
 * The init may not finish when handler starts executing.
 * If the init fails it should be retried on next handler invocation.
 * The Lambda runtime manages this case. If any errors occur
 * in the initialisation code outside the handler,
 * the function container is terminated and a new one is
 * started up in a fresh state.
 *
 * @returns
 */
const init = async () => {
  // Perform all async calls here.
  const app = await createApp();
  // not sure this is correct with serverless-http:
  // see https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception!');
    logger.error(err);
    if (process.env.IS_SENTRY_ENABLED === 'true') {
      Sentry.captureException(err);
      Sentry.flush(2000).then((done) => {
        if (done) {
          logger.info('sentry flush successful');
        } else {
          logger.error('sentry flush timed out!');
        }
      });
    }
  });

  process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env.IS_SENTRY_ENABLED === 'true') {
      Sentry.captureException(reason);
    }
  });

  return app;
};

const initPromise = init();

const handler = async (event: any, context: any) => {
  // Ensure init has completed before proceeding
  const app = await initPromise;
  const slsHandler = serverless(app);
  const result = await slsHandler(event, context);
  return result;
};

module.exports.handler =
  process.env.IS_SENTRY_ENABLED === 'true'
    ? Sentry.AWSLambda.wrapHandler(handler, {
        captureTimeoutWarning: true,
      })
    : handler;
